(function (global) {
  "use strict";

  const TABLE = "cost_settings";
  const LOGO_BUCKET = "business-logos";
  const STORAGE_KEY = "biya_cost_management_settings";
  const SETTINGS_EVENT = "biya:cost-settings-applied";
  const DEFAULTS = Object.freeze({
    business_name: "BIYA Cost Management", business_type: "F&B", owner_name: "", phone: "", email: "", address: "", logo_url: "",
    food_cost_target: 35, profit_target: 50, default_waste: 5, default_overhead: 0, service_charge: 0, tax_rate: 0,
    currency: "IDR", number_format: "id-ID", date_format: "dd/mm/yyyy", auto_capitalize: "on", default_status: "ACTIVE"
  });
  let activeSettings = null;

  function logError(context, error, extra) { console.error("[Cost Settings] " + context, { error, message:error&&error.message, details:error&&error.details, hint:error&&error.hint, code:error&&error.code, ...(extra||{}) }); }
  function asPercent(value, fallback, allowZero) { const number=Number(value); return Number.isFinite(number) && number >= (allowZero?0:0.01) && number <= 100 ? number : fallback; }
  function normalize(row) { const source=row||{}; return { ...DEFAULTS, ...source,
    food_cost_target:asPercent(source.food_cost_target,DEFAULTS.food_cost_target,false), profit_target:asPercent(source.profit_target,DEFAULTS.profit_target,false),
    default_waste:asPercent(source.default_waste,DEFAULTS.default_waste,true), default_overhead:asPercent(source.default_overhead,DEFAULTS.default_overhead,true),
    service_charge:asPercent(source.service_charge,DEFAULTS.service_charge,true), tax_rate:asPercent(source.tax_rate,DEFAULTS.tax_rate,true)
  }; }
  function readLocal() { try { return normalize(JSON.parse(global.localStorage.getItem(STORAGE_KEY)||"null")); } catch(error) { logError("Data localStorage tidak valid",error); return normalize(); } }
  function writeLocal(settings) { const normalized=normalize(settings); global.localStorage.setItem(STORAGE_KEY,JSON.stringify(normalized)); activeSettings=normalized; return normalized; }
  function clearLocal() { global.localStorage.removeItem(STORAGE_KEY); }
  async function resolveScope(client) { if(client && global.BiyaData){ const user=await global.BiyaData.getCurrentUser(client); return {user,userId:user.id,businessId:user.id,storageKey:user.id}; } return {user:null,userId:null,businessId:null,storageKey:"local"}; }
  async function load(client) {
    const local=readLocal(); let scope=await resolveScope(client).catch(()=>({user:null,userId:null,businessId:null,storageKey:"local"}));
    if(!client || !scope.userId){ applyCostSettings(local); return {scope,settings:local,exists:Boolean(global.localStorage.getItem(STORAGE_KEY)),source:"local"}; }
    try { const {data,error}=await client.from(TABLE).select("*").eq("user_id",scope.userId).maybeSingle(); if(error) throw error;
      const hasLocal=Boolean(global.localStorage.getItem(STORAGE_KEY));
      const settings=data ? writeLocal(hasLocal ? {...data,...local} : data) : local; applyCostSettings(settings); return {scope,settings,exists:Boolean(data)||hasLocal,source:hasLocal?"local":data?"supabase":"default"};
    } catch(error) { logError("Supabase tidak tersedia; memakai localStorage",error,{businessId:scope.businessId}); applyCostSettings(local); return {scope,settings:local,exists:Boolean(global.localStorage.getItem(STORAGE_KEY)),source:"local",syncError:error}; }
  }
  async function save(client, scope, settings) {
    const normalized=writeLocal(settings); applyCostSettings(normalized);
    if(!client || !scope || !scope.userId) return {...normalized,_source:"local"};
    const payload={...normalized,user_id:scope.userId,business_id:scope.businessId,updated_at:new Date().toISOString()};
    try { const {data,error}=await client.from(TABLE).upsert(payload,{onConflict:"user_id"}).select("*").single(); if(error) throw error; return writeLocal({...normalized,...data}); }
    catch(error){ logError("Sinkronisasi Supabase gagal; settings tetap tersimpan lokal",error,{businessId:scope.businessId}); return {...normalized,_source:"local",_syncError:error}; }
  }
  function formatCurrency(value, settings) { const config=normalize(settings||activeSettings||readLocal()); const currency=config.currency||"IDR"; const locale=config.number_format||({IDR:"id-ID",USD:"en-US",MYR:"ms-MY"}[currency]||"id-ID"); return new Intl.NumberFormat(locale,{style:"currency",currency,maximumFractionDigits:currency==="IDR"?0:2}).format(Number(value)||0); }
  function applyCostSettings(settings) {
    const config=normalize(settings||readLocal()); activeSettings=config;
    if(global.document){ global.document.documentElement.dataset.costCurrency=config.currency; global.document.querySelectorAll("[data-cost-business-name]").forEach(el=>{el.textContent=config.business_name;});
      global.document.querySelectorAll("[data-cost-logo]").forEach(img=>{ if(config.logo_url){img.src=config.logo_url;img.hidden=false;}else{img.removeAttribute("src");img.hidden=true;} });
      const waste=global.document.getElementById("wasteInput")||global.document.getElementById("waste"); if(waste && !waste.dataset.userEdited) waste.value=config.default_waste;
      const status=global.document.getElementById("statusInput")||global.document.getElementById("prepStatus")||global.document.getElementById("menuStatus"); if(status && !status.dataset.userEdited) status.value=config.default_status;
    }
    global.dispatchEvent(new CustomEvent(SETTINGS_EVENT,{detail:config})); return config;
  }
  async function uploadLogo(client, scope, file) { if(!file||!file.type.startsWith("image/")) throw new Error("File logo harus berupa gambar.");
    if(client&&scope&&scope.userId){ try { const path=global.BiyaData.storagePath(scope.userId,"logos","business-logo"); const {error}=await client.storage.from(LOGO_BUCKET).upload(path,file,{contentType:file.type,upsert:true}); if(error) throw error; const {data}=client.storage.from(LOGO_BUCKET).getPublicUrl(path); if(data&&data.publicUrl) return data.publicUrl+"?v="+Date.now(); } catch(error){ logError("Upload Storage gagal; logo disimpan sebagai base64",error); } }
    return new Promise((resolve,reject)=>{ const reader=new FileReader(); reader.onload=()=>resolve(String(reader.result)); reader.onerror=()=>reject(new Error("Logo gagal dibaca dari device.")); reader.readAsDataURL(file); });
  }
  async function removeLogo(client,scope){ if(client&&scope&&scope.userId){ try{ const path=global.BiyaData.storagePath(scope.userId,"logos","business-logo"); await client.storage.from(LOGO_BUCKET).remove([path]); }catch(error){logError("Hapus logo Storage gagal",error);} } }
  async function reset(client,scope){ clearLocal(); return save(client,scope,normalize()); }
  function healthyFoodCostLimit(target){return asPercent(target,DEFAULTS.food_cost_target,false)*.85;}
  const api={DEFAULTS,LOGO_BUCKET,STORAGE_KEY,SETTINGS_EVENT,applyCostSettings,clearLocal,formatCurrency,getActive:()=>normalize(activeSettings||readLocal()),healthyFoodCostLimit,load,loadCostSettings:load,logError,normalize,removeLogo,reset,resetCostSettings:reset,resolveScope,save,saveCostSettings:save,uploadLogo};
  global.BiyaCostSettings=Object.freeze(api); global.loadCostSettings=(client)=>api.load(client); global.saveCostSettings=(client,scope,settings)=>api.save(client,scope,settings); global.applyCostSettings=applyCostSettings; global.resetCostSettings=(client,scope)=>api.reset(client,scope);
  if(global.document){ if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>applyCostSettings(readLocal()),{once:true}); else applyCostSettings(readLocal()); global.addEventListener("storage",event=>{if(event.key===STORAGE_KEY) applyCostSettings(readLocal());}); }
})(window);

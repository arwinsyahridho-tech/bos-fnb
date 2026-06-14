const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");

const read = path => fs.readFileSync(path, "utf8");
const service = read("modules/cost-management/cost-settings-service.js");
const settings = read("modules/cost-management/settings.html");
const modulePages = ["costdashboard.html", "rawmaterial.html", "preparation.html", "menu.html", "producthpp.html", "exportcenter.html"];

test("Cost Settings menyediakan localStorage fallback dan API load/save/apply/reset", () => {
  assert.match(service, /biya_cost_management_settings/);
  assert.match(service, /function applyCostSettings\(/);
  assert.match(service, /loadCostSettings:load/);
  assert.match(service, /saveCostSettings:save/);
  assert.match(service, /resetCostSettings:reset/);
  assert.match(service, /Supabase tidak tersedia; memakai localStorage/);
});

test("halaman Settings menghubungkan seluruh input, logo, save, dan reset", () => {
  for (const id of ["businessName", "logoFile", "logoPreview", "foodCostTarget", "profitTarget", "defaultWaste", "defaultOverhead", "serviceCharge", "taxRate", "currency", "numberFormat", "dateFormat", "autoCapitalize", "defaultStatus", "saveBtn", "resetBtn"]) {
    assert.match(settings, new RegExp(`id="${id}"`));
  }
  assert.match(settings, /async function loadCostSettings\(/);
  assert.match(settings, /async function saveCostSettings\(/);
  assert.match(settings, /async function resetCostSettings\(/);
  assert.match(settings, /settingsService\.uploadLogo/);
  assert.match(settings, /document\.addEventListener\("DOMContentLoaded",loadCostSettings\)/);
});

test("seluruh halaman Cost Management memuat service settings", () => {
  for (const page of modulePages) {
    assert.match(read(`modules/cost-management/${page}`), /cost-settings-service\.js/, page);
  }
});

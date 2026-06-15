(() => {
  "use strict";
  const rawColumns = "id,raw_id,nama,category,qty_beli,satuan_beli,harga_beli,convertion_qty,unit_dasar,harga_unit,supplier,waste_percent,status,created_at";
  const rawCode = () => `RAW-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, "0")}`;
  const numeric = (value) => Number(value) || 0;
  function rawToItem(raw) {
    const conversionQty = numeric(raw.convertion_qty);
    const purchasePrice = numeric(raw.harga_beli);
    const unitPrice = numeric(raw.harga_unit) || (conversionQty ? purchasePrice / conversionQty : 0);
    return {
      name: raw.nama,
      category: raw.category || "Bahan Baku",
      supplier: raw.supplier || "",
      purchase_qty: numeric(raw.qty_beli),
      purchase_unit: raw.satuan_beli || "Kg",
      purchase_price: purchasePrice,
      conversion_qty: conversionQty,
      waste: numeric(raw.waste_percent),
      unit: raw.unit_dasar || "unit",
      unit_price: unitPrice,
      raw_material_id: raw.id,
      raw_material_code: raw.raw_id,
      source: "raw_material",
    };
  }
  async function syncFromRawMaterials(client, userId) {
    if (!client) throw new Error("Koneksi Supabase belum tersedia.");
    const { data, error } = await client.from("raw_material").select(rawColumns).eq("user_id", userId);
    if (error) throw error;
    const inventory = window.BIYAInventoryService.getData();
    for (const raw of data || []) {
      const existing = inventory.items.find((entry) => String(entry.raw_material_id) === String(raw.id) || entry.raw_material_code === raw.raw_id || entry.code === raw.raw_id);
      const legacyCode = existing?.code === raw.raw_id ? undefined : existing?.code;
      window.BIYAInventoryService.upsertItem({ ...existing, ...rawToItem(raw), id: existing?.id, code: legacyCode, current_stock: existing?.current_stock || 0, minimum_stock: existing?.minimum_stock });
    }
    return (data || []).length;
  }
  async function pushItemToRawMaterial(client, userId, item) {
    if (!client) return null;
    const conversionQty = numeric(item.conversion_qty);
    const purchasePrice = numeric(item.purchase_price);
    const unitPrice = numeric(item.unit_price) || (conversionQty ? purchasePrice / conversionQty : 0);
    const payload = {
      raw_id: item.raw_material_code || rawCode(),
      nama: item.name,
      category: item.category,
      qty_beli: numeric(item.purchase_qty),
      satuan_beli: item.purchase_unit || "Kg",
      harga_beli: purchasePrice,
      convertion_qty: conversionQty,
      unit_dasar: item.unit,
      waste_percent: numeric(item.waste),
      harga_unit: unitPrice,
      supplier: item.supplier || "",
      user_id: userId,
      status: "ACTIVE",
    };
    let query = item.raw_material_id ? client.from("raw_material").update(payload).eq("id", item.raw_material_id).eq("user_id", userId) : client.from("raw_material").insert(payload);
    const { data, error } = await query.select(rawColumns).single();
    if (error) throw error;
    window.BIYAInventoryService.upsertItem({ ...item, ...rawToItem(data), raw_material_id: data.id, raw_material_code: data.raw_id, source: "raw_material" });
    return data;
  }
  window.BIYAInventorySyncService = { syncFromRawMaterials, pushItemToRawMaterial };
})();
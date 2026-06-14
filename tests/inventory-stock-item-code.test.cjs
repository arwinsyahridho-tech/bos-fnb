const assert = require("node:assert/strict");
const test = require("node:test");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");

function loadService() {
  const storage = new Map();
  const context = {
    structuredClone,
    Date,
    Math,
    CustomEvent: class {},
    localStorage: {
      getItem: (key) => storage.get(key) || null,
      setItem: (key, value) => storage.set(key, value),
    },
    window: { dispatchEvent() {} },
  };
  vm.runInNewContext(
    fs.readFileSync(path.join(__dirname, "../modules/inventory/inventory-service.js"), "utf8"),
    context,
  );
  return context.window.BIYAInventoryService;
}

test("Stock Item membuat kode STK otomatis dan mempertahankannya saat edit", () => {
  const service = loadService();
  service.load("user-1");

  const created = service.upsertItem({
    name: "Tepung",
    category: "Bahan Baku",
    unit: "kg",
    unit_price: 12000,
    minimum_stock: 5,
  });

  assert.match(created.code, /^STK-\d{13}-[A-Z0-9]{6}$/);

  const edited = service.upsertItem({
    ...created,
    code: "STK-DIUBAH-MANUAL",
    name: "Tepung Protein Tinggi",
  });

  assert.equal(edited.code, created.code);
  assert.equal(edited.name, "Tepung Protein Tinggi");
});

test("Stock Item hasil sinkron menyimpan kode RAW sebagai referensi terpisah", () => {
  const service = loadService();
  service.load("user-2");

  const item = service.upsertItem({
    name: "Gula",
    raw_material_id: "raw-1",
    raw_material_code: "RAW-1781370118044-CKTSHG",
    source: "raw_material",
  });

  assert.match(item.code, /^STK-\d{13}-[A-Z0-9]{6}$/);
  assert.equal(item.raw_material_code, "RAW-1781370118044-CKTSHG");
  assert.equal(item.raw_material_id, "raw-1");
});

const assert = require("node:assert/strict");
const test = require("node:test");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createTableClient(tables, tableName) {
  const state = { filters: [], payload: null, columns: "*", mode: null };
  const api = {
    select(columns = "*") {
      state.columns = columns;
      if (state.mode === "insert" || state.mode === "update") return api;
      state.mode = "select";
      return api;
    },
    eq(column, value) {
      state.filters.push([column, value]);
      return api;
    },
    insert(payload) {
      state.mode = "insert";
      state.payload = payload;
      return api;
    },
    update(payload) {
      state.mode = "update";
      state.payload = payload;
      return api;
    },
    delete() {
      state.mode = "delete";
      return api;
    },
    async single() {
      const result = await api;
      return { data: Array.isArray(result.data) ? result.data[0] : result.data, error: result.error };
    },
    then(resolve) {
      const rows = tables[tableName] || (tables[tableName] = []);
      const matches = (row) => state.filters.every(([column, value]) => String(row[column]) === String(value));
      let data = [];
      if (state.mode === "select") data = rows.filter(matches).map(clone);
      if (state.mode === "insert") {
        const row = clone(state.payload);
        rows.push(row);
        data = [clone(row)];
      }
      if (state.mode === "update") {
        data = rows.filter(matches).map((row) => Object.assign(row, clone(state.payload))).map(clone);
      }
      if (state.mode === "delete") {
        for (let index = rows.length - 1; index >= 0; index -= 1) if (matches(rows[index])) rows.splice(index, 1);
        data = [];
      }
      return resolve({ data, error: null });
    },
  };
  return api;
}

function loadService(tables = { inventory_stock_items: [], inventory_stock_movements: [] }) {
  const context = {
    structuredClone,
    Date,
    Math,
    Number,
    String,
    CustomEvent: class {},
    window: {
      dispatchEvent() {},
      BiyaAuth: { client: { from: (table) => createTableClient(tables, table) } },
    },
  };
  vm.runInNewContext(
    fs.readFileSync(path.join(__dirname, "../modules/inventory/inventory-service.js"), "utf8"),
    context,
  );
  return { service: context.window.BIYAInventoryService, tables };
}

test("Stock Item membuat kode STK otomatis dan mempertahankannya saat edit di Supabase", async () => {
  const { service, tables } = loadService();
  await service.load("user-1");

  const created = await service.upsertItem({
    name: "Tepung",
    category: "Bahan Baku",
    unit: "kg",
    unit_price: 12000,
    minimum_stock: 5,
  });

  assert.match(created.code, /^STK-\d{13}-[A-Z0-9]{6}$/);
  assert.equal(tables.inventory_stock_items.length, 1);
  assert.equal(tables.inventory_stock_items[0].user_id, "user-1");

  const edited = await service.upsertItem({
    ...created,
    code: "STK-DIUBAH-MANUAL",
    name: "Tepung Protein Tinggi",
  });

  assert.equal(edited.code, created.code);
  assert.equal(edited.name, "Tepung Protein Tinggi");
  assert.equal(tables.inventory_stock_items[0].name, "Tepung Protein Tinggi");
});

test("Stock Item hasil sinkron menyimpan kode RAW sebagai referensi terpisah di Supabase", async () => {
  const { service, tables } = loadService();
  await service.load("user-2");

  const item = await service.upsertItem({
    name: "Gula",
    raw_material_id: "raw-1",
    raw_material_code: "RAW-1781370118044-CKTSHG",
    source: "raw_material",
  });

  assert.match(item.code, /^STK-\d{13}-[A-Z0-9]{6}$/);
  assert.equal(item.raw_material_code, "RAW-1781370118044-CKTSHG");
  assert.equal(item.raw_material_id, "raw-1");
  assert.equal(tables.inventory_stock_items[0].code, item.code);
});

test("Inventory service wajib memakai Supabase dan tidak memakai localStorage sebagai database utama", async () => {
  const source = fs.readFileSync(path.join(__dirname, "../modules/inventory/inventory-service.js"), "utf8");
  assert.doesNotMatch(source, /localStorage/);

  const context = { structuredClone, Date, Math, Number, String, CustomEvent: class {}, window: { dispatchEvent() {} } };
  vm.runInNewContext(source, context);
  await assert.rejects(() => context.window.BIYAInventoryService.load("user-3"), /Koneksi Supabase belum tersedia/);
});

const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

const helperSource = fs.readFileSync("assets/js/inventory-access.js", "utf8");
const inventoryPage = fs.readFileSync("modules/inventory/dashboard.html", "utf8");
const inventoryEntry = fs.readFileSync("modules/inventory/index.html", "utf8");
const inventoryScript = fs.readFileSync("modules/inventory/inventory-page.js", "utf8");
const migration = fs.readFileSync("supabase/migrations/20260614020000_restrict_inventory_access.sql", "utf8");

function loadHelper(user) {
  const redirects = [];
  const context = {
    URLSearchParams,
    window: {
      BIYA_AUTH_GUARD_READY: Promise.resolve(user ? { user } : null),
      BiyaAuth: {
        client: { auth: { getUser: async () => ({ data: { user }, error: null }) } },
        getSession: async () => user ? { user } : null
      },
      location: {
        hash: "", pathname: "/modules/inventory/dashboard.html", search: "",
        replace(url) { redirects.push(url); }
      },
      sessionStorage: { setItem() {} }
    }
  };
  vm.runInNewContext(helperSource, context);
  return { access: context.window.BIYAInventoryAccess, redirects };
}

test("Inventory helper hanya mengizinkan email developer tanpa mempedulikan kapitalisasi", async () => {
  const allowed = loadHelper({ id: "owner", email: "ArwinSyahridho@GMAIL.com" });
  assert.equal(allowed.access.isInventoryAllowed({ email: "arwinsyahridho@gmail.com" }), true);
  assert.equal(await allowed.access.requireInventoryAccess(), allowed.access ? await allowed.access.getCurrentUser() : null);
  assert.deepEqual(allowed.redirects, []);

  const denied = loadHelper({ id: "demo", email: "demo@biya.id" });
  let deniedUser = null;
  assert.equal(denied.access.isInventoryAllowed({ email: "demo@biya.id" }), false);
  assert.equal(await denied.access.requireInventoryAccess({ onDenied: (user) => { deniedUser = user; } }), null);
  assert.equal(deniedUser.email, "demo@biya.id");
  assert.deepEqual(denied.redirects, []);
});

test("Inventory page menjalankan auth guard dan access guard sebelum fitur modul", () => {
  assert.match(inventoryEntry, /dashboard\.html/);
  assert.ok(inventoryPage.indexOf("/assets/js/biya-deletion-guard.js") < inventoryPage.indexOf("/assets/js/auth-guard.js"));
  assert.ok(inventoryPage.indexOf("/assets/js/auth-guard.js") < inventoryPage.indexOf("<body"));
  assert.match(inventoryPage, /inventory-page\.js/);
  assert.match(inventoryScript, /BIYAInventoryAccess\.requireInventoryAccess/);
  assert.match(inventoryScript, /onDenied:/);
  assert.match(inventoryScript, /Inventory belum dapat dibuka/);
  assert.match(inventoryPage, /Kembali ke Module Center/);
  assert.match(inventoryPage, /dashboard\.html/);
  assert.match(inventoryPage, /Inventory Dashboard/);
  assert.match(inventoryPage, /Stock Card/);
  assert.match(inventoryPage, /Inventory Dashboard/);
  assert.doesNotThrow(() => new Function(helperSource));
  assert.doesNotThrow(() => new Function(inventoryScript));
});

test("Migration membatasi seluruh tabel inventory berdasarkan email JWT", () => {
  assert.match(migration, /lower\(auth\.jwt\(\) ->> 'email'\) = 'arwinsyahridho@gmail\.com'/);
  assert.match(migration, /table_name = 'inventory' OR table_name LIKE 'inventory\\_%'/);
  assert.match(migration, /ENABLE ROW LEVEL SECURITY/);
  assert.match(migration, /FORCE ROW LEVEL SECURITY/);
  assert.match(migration, /FOR ALL TO authenticated/);
  assert.match(migration, /REVOKE ALL ON public\.%I FROM anon/);
});

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const inventoryDir = path.join(__dirname, "..", "modules", "inventory");
const pageScript = fs.readFileSync(path.join(inventoryDir, "inventory-page.js"), "utf8");
const styles = fs.readFileSync(path.join(inventoryDir, "inventory.css"), "utf8");

test("card Stock Item memakai ringkasan dua kolom tanpa box detail besar", () => {
  const mobileCard = pageScript.match(/<article class="stock-mobile-card">.*?<\/article>/s)?.[0] || "";

  assert.match(mobileCard, /stock-mobile-title.*?stock-mobile-summary.*?Stock:.*?Min:.*?stockStatus\(i\).*?stock-mobile-actions/s);
  assert.doesNotMatch(mobileCard, /detail-box|stock-mobile-detail|stock-mobile-price/);
  assert.match(mobileCard, /\$\{money\(i\.unit_price\)\}\/\$\{esc\(i\.unit\)\}/);
  assert.match(mobileCard, /Supplier:.*?Waste:/s);
});

test("layout Stock Item mobile aman dari overflow dan tetap compact", () => {
  assert.match(styles, /\.stock-mobile-list\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(styles, /@media\(max-width:700px\)\{[\s\S]*?\.stock-mobile-list\{grid-template-columns:1fr/);
  assert.match(styles, /\.stock-mobile-actions\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.stock-category-filters\{[^}]*flex-wrap:nowrap[^}]*overflow-x:auto/);
});

test("status stok card menggunakan label ACTIVE, HABIS, dan LOW STOCK", () => {
  assert.match(pageScript, /value === "Aman" \? "ACTIVE" : value\.toUpperCase\(\)/);
  assert.match(pageScript, /Number\(item\.current_stock\) <= 0 \? "Habis"/);
  assert.match(pageScript, /Number\(item\.current_stock\) <= Number\(item\.minimum_stock\) \? "Low stock"/);
});

test("card meringkas kode Raw Material dan tidak menampilkan Stock ID", () => {
  const mobileCard = pageScript.match(/<article class="stock-mobile-card">.*?<\/article>/s)?.[0] || "";

  assert.match(pageScript, /function shortRawMaterialCode\(code\).*?value\.slice\(-6\).*?`RAW-\$\{suffix\}`/s);
  assert.match(mobileCard, /\$\{itemCode\(i\)\}/);
  assert.doesNotMatch(mobileCard, /Stock: \$\{esc\(i\.code\)\}|itemCodes\(i\)/);
  assert.match(styles, /\.stock-mobile-code\{[^}]*overflow:hidden[^}]*text-overflow:ellipsis[^}]*white-space:nowrap/);
});

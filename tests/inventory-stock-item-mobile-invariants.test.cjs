const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const inventoryDir = path.join(__dirname, "..", "modules", "inventory");
const pageScript = fs.readFileSync(path.join(inventoryDir, "inventory-page.js"), "utf8");
const styles = fs.readFileSync(path.join(inventoryDir, "inventory.css"), "utf8");

test("card Stock Item mobile memisahkan empat detail utama dan harga", () => {
  const mobileCard = pageScript.match(/<article class="stock-mobile-card">.*?<\/article>/s)?.[0] || "";

  assert.match(
    mobileCard,
    /stock-mobile-detail.*?Unit.*?Stok.*?Min.*?Status.*?stock-mobile-price.*?Harga.*?stock-mobile-actions/s,
  );
  assert.equal((mobileCard.match(/class="detail-box/g) || []).length, 4);
  assert.doesNotMatch(mobileCard, /Minimum stock/);
  assert.match(mobileCard, /stock-mobile-price[\s\S]*?\$\{money\(i\.unit_price\)\}/);
});

test("layout Stock Item mobile aman dari overflow dan tetap compact", () => {
  assert.match(styles, /\.stock-mobile-detail\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(styles, /\.stock-mobile-detail \.detail-box\{[^}]*min-width:0[^}]*overflow:hidden/);
  assert.match(styles, /\.stock-mobile-price\{[^}]*width:100%[^}]*max-width:100%/);
  assert.match(styles, /\.stock-mobile-actions\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(styles, /@media\(max-width:360px\)\{[^}]*\.stock-mobile-detail\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const inventoryDir = path.join(__dirname, "..", "modules", "inventory");
const pages = [
  ["dashboard.html", "dashboard.html"],
  ["stockitem.html", "stockitem.html"],
  ["stockcard.html", "stockcard.html"],
  ["stockin.html", "stockin.html"],
  ["opname.html", "opname.html"],
  ["waste.html", "waste.html"],
  ["report.html", "report.html"],
  ["settings.html", "settings.html"],
];
const menuLabels = [
  "Dashboard",
  "Stock Item",
  "Stock Card",
  "Stock In",
  "Stock Opname",
  "Waste",
  "Report",
  "Settings",
];

test("semua halaman Inventory memakai sidebar BIYA yang konsisten", () => {
  for (const [file, activeHref] of pages) {
    const html = fs.readFileSync(path.join(inventoryDir, file), "utf8");

    assert.match(html, /class="wrapper"/, `${file}: wrapper tidak ditemukan`);
    assert.match(html, /id="biyaSidebar"/, `${file}: biyaSidebar tidak ditemukan`);
    assert.match(html, /class="logo"/, `${file}: logo tidak ditemukan`);
    assert.match(html, /class="mobile-header"/, `${file}: mobile-header tidak ditemukan`);
    assert.match(html, /class="mobile-logo"/, `${file}: mobile-logo tidak ditemukan`);
    assert.match(html, /id="menuToggle"/, `${file}: menuToggle tidak ditemukan`);
    assert.match(html, /id="mobileOverlay"/, `${file}: mobileOverlay tidak ditemukan`);
    assert.match(html, /class="btn" href="\/menu-modules\/dashboard\.html"/, `${file}: tombol Kembali tidak ditemukan`);
    assert.doesNotMatch(html, /class="(?:app|brand|nav-link|back)"|id="overlay"/, `${file}: markup sidebar lama masih digunakan`);

    for (const label of menuLabels) {
      assert.match(html, new RegExp(`<span>${label}</span>`), `${file}: menu ${label} tidak ditemukan`);
    }

    const activeItems = html.match(/class="item active"/g) || [];
    assert.equal(activeItems.length, 1, `${file}: harus memiliki tepat satu menu aktif`);
    assert.match(
      html,
      new RegExp(`class="item active" href="${activeHref.replace(".", "\\.")}" aria-current="page"`),
      `${file}: menu aktif tidak sesuai halaman`,
    );
    assert.equal((html.match(/<svg class="biya-icon"/g) || []).length, 9, `${file}: setiap menu dan tombol Kembali harus memiliki ikon`);
  }
});


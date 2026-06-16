const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const auditedFiles = [
  'assets/css/theme-toggle.css',
  'assets/js/theme-toggle.js',
  'menu-modules/dashboard.html',
  'modules/cost-management/costdashboard.html',
  'modules/cost-management/rawmaterial.html',
  'modules/cost-management/preparation.html',
  'modules/cost-management/menu.html',
  'modules/cost-management/producthpp.html',
  'modules/cost-management/exportcenter.html',
  'modules/cost-management/settings.html',
  'modules/inventory/inventory.css',
  'modules/inventory/dashboard.html',
  'modules/inventory/stockitem.html',
  'modules/inventory/stockin.html',
  'modules/inventory/stockcard.html',
  'modules/inventory/opname.html',
  'modules/inventory/waste.html',
  'modules/inventory/report.html',
  'modules/inventory/settings.html',
  'modules/inventory/inventory.html',
  'modules/inventory/index.html',
];

const layoutProperties = [
  'font-size',
  'padding',
  'margin',
  'gap',
  'border-radius',
  'width',
  'height',
  'grid',
  'grid-template',
  'flex',
  'flex-direction',
  'line-height',
];

function lightThemeBlocks(source) {
  const blocks = [];
  const pattern = /([^{}]*html\[data-theme=["']light["'][^{]*)\{([^{}]*)\}/g;
  let match;
  while ((match = pattern.exec(source)) !== null) {
    blocks.push({ selector: match[1], body: match[2] });
  }
  return blocks;
}

test('light mode hanya mengganti warna/surface, bukan struktur layout', () => {
  const violations = [];

  auditedFiles.forEach((file) => {
    const source = fs.readFileSync(file, 'utf8');
    lightThemeBlocks(source).forEach(({ selector, body }) => {
      layoutProperties.forEach((property) => {
        const propertyPattern = new RegExp(`(^|[;\\s])${property}\\s*:`, 'm');
        if (propertyPattern.test(body)) {
          violations.push(`${file}: ${selector.trim()} mengubah ${property}`);
        }
      });
    });
  });

  assert.deepEqual(violations, []);
});

test('token light mode mengikuti palet BIYA tanpa shape dekoratif khusus light mode', () => {
  const css = fs.readFileSync('assets/css/theme-toggle.css', 'utf8');
  assert.match(css, /--bg:\s*#f8faf6;/);
  assert.match(css, /--surface:\s*#ffffff;/);
  assert.match(css, /--surface-soft:\s*#edf8ee;/);
  assert.match(css, /--text:\s*#10243f;/);
  assert.match(css, /--muted:\s*#526760;/);
  assert.match(css, /--border:\s*rgba\(22, 160, 100, 0\.18\);/);
  assert.match(css, /--border-active:\s*rgba\(22, 160, 100, 0\.36\);/);
  assert.match(css, /--primary:\s*#16a064;/);
  assert.match(css, /--primary-dark:\s*#0b6945;/);
  assert.match(css, /--accent:\s*#c8ef55;/);
  assert.match(css, /html\[data-theme="light"\] body \{\n\s*background: var\(--bg\) !important;/);
});

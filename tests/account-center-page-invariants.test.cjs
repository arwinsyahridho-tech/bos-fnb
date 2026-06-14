const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const html = fs.readFileSync('account-center/index.html', 'utf8');
const script = fs.readFileSync('assets/js/account.js', 'utf8');
const css = fs.readFileSync('assets/css/account.css', 'utf8');

test('Account Center memakai helper auth utama dan tidak membuat Supabase client sendiri', () => {
  for (const asset of ['biya-config.js', 'biya-auth.js', 'biya-deletion-guard.js', 'biya-profile-bridge.js']) {
    assert.match(html, new RegExp(`/assets/js/${asset.replace('.', '\\.')}`));
  }
  assert.match(script, /auth\.getSession\(\)/);
  assert.doesNotMatch(script, /createClient\(/);
  assert.doesNotMatch(html, /biya-account-center\.vercel\.app/);
});

test('Status akun, demo, dan belum login memiliki aksi yang berbeda', () => {
  for (const label of [
    'BELUM LOGIN', 'Login di Account Center', 'Kembali ke Halaman Awal BIYA',
    'MODE DEMO', 'Keluar Demo &amp; Login Akun', 'Kembali ke Module Center',
    'Ganti Akun', 'Keluar Akun'
  ]) assert.match(html, new RegExp(label));
  assert.match(html, /href="\/index\.html\?redirect=%2Faccount-center%2F"/);
  assert.match(html, /href="\/menu-modules\/dashboard\.html"/);
  assert.equal((script.match(/signOutToLogin\(event\.currentTarget, "\/index\.html\?reason=logout"\)/g) || []).length, 2);
  assert.match(script, /await auth\.signOut\(\{ redirectTo \}\)/);
  assert.match(script, /auth\.signOut\(\{ redirectTo: "\/index\.html" \}\)/);
});

test('Account Center mendeteksi demo dan memuat profil bisnis', () => {
  assert.match(script, /auth\.config\.demoEmail/);
  assert.match(script, /profileBridge\.getAccountProfile/);
  assert.match(script, /profileBridge\.getBusinessProfile/);
  assert.match(script, /deletionGuard\.blockAndSignOutIfNeeded/);
  assert.match(script, /window\.addEventListener\("pageshow"/);
});

test('Asset Account Center valid dan mobile-first', () => {
  assert.doesNotThrow(() => new Function(script));
  assert.match(css, /\.detail-grid \{ display: grid; grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(css, /@media \(min-width: 620px\)/);
  assert.match(css, /\.action-stack \{ display: grid;/);
});

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
  assert.match(script, /signOutToLogin\(button, "\/index\.html\?reason=logout"\)/);
  assert.match(script, /await auth\.signOut\(\{ redirectTo \}\)/);
  assert.match(script, /auth\.signOut\(\{ redirectTo: "\/index\.html" \}\)/);
  assert.match(html, /id="confirmModal"/);
});

test('Account Center mendeteksi demo dan memuat profil bisnis', () => {
  assert.match(script, /auth\.config\.demoEmail/);
  assert.match(script, /profileBridge\.getAccountProfile/);
  assert.match(script, /profileBridge\.getBusinessProfile/);
  assert.match(script, /deletionGuard\.blockAndSignOutIfNeeded/);
  assert.match(script, /window\.addEventListener\("pageshow"/);
});

test('dashboard menyediakan seluruh tab, form, modul, billing, security, dan danger zone', () => {
  for (const label of [
    'Account Overview', 'Profile', 'Business', 'Subscription', 'Billing',
    'Module Access', 'Security', 'Pembayaran &amp; Invoice', 'Belum ada invoice.',
    'Cost Management', 'Inventory', 'Finance', 'POS', 'Reservation',
    'Open Cost Management', 'Danger Zone', 'Hapus Akun'
  ]) assert.match(html, new RegExp(label, 'i'));
  assert.match(html, /href="\/modules\/cost-management\/costdashboard\.html"/);
  assert.match(script, /\.upsert\(payload, \{ onConflict: "user_id" \}\)/);
  assert.match(script, /\.select\(\)\s*\.single\(\)/);
  assert.match(script, /metadataFallback/);
});

test('Account Center menampilkan diagnosis penyimpanan Business yang jelas', () => {
  for (const message of [
    'Tabel ${table} belum tersedia di Supabase.',
    'Akses RLS ditolak. Periksa policy user_id = auth.uid().',
    'Struktur kolom ${table} belum sesuai.',
    'Data bisnis berhasil disimpan.'
  ]) assert.match(script, new RegExp(message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('Asset Account Center valid dan mobile-first', () => {
  assert.doesNotThrow(() => new Function(script));
  assert.match(css, /\.detail-grid\{display:grid;grid-template-columns:minmax\(0,1fr\)/);
  assert.match(css, /@media\(min-width:620px\)/);
  assert.match(css, /\.action-stack\{display:grid;/);
  assert.match(css, /\.tab-nav\{display:flex;[^}]*overflow-x:auto/);
});

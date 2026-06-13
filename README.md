# smart-food-costing
## BIYA authentication

Halaman `/index.html` menggunakan Supabase Auth untuk login, pendaftaran, dan demo login. Semua halaman internal memuat guard bersama dari `assets/js/auth-guard.js`; pengguna tanpa sesi aktif akan dikembalikan ke login dengan target URL yang aman.

### Menyiapkan akun demo

Demo Login **tetap menggunakan Supabase Auth** melalui `signInWithPassword`; aplikasi tidak membuat sesi demo palsu dan tidak melewati auth guard. Karena aplikasi frontend tidak boleh memakai Supabase service-role key, user demo harus dibuat manual oleh admin pada project Supabase yang dikonfigurasi di `assets/js/biya-config.js`.

1. Masuk ke [Supabase Dashboard](https://supabase.com/dashboard), lalu buka project BIYA.
2. Pilih **Authentication → Users → Add user → Create new user**.
3. Isi credential berikut dan tandai email sebagai terverifikasi (**Auto Confirm User**):
   - Email: `demo@biya.id`
   - Password: `BIYA-Demo-2026!`
4. Klik **Create user**, lalu pastikan user `demo@biya.id` muncul di daftar Users.
5. Uji tombol **Demo Login** dari `/index.html`. Jika muncul pesan bahwa akun demo belum dibuat atau password tidak sesuai, periksa kembali email, password, status konfirmasi email, dan project Supabase yang digunakan.
6. Pastikan data contoh milik user demo tersebut (gunakan UUID user demo sebagai `user_id`/owner terkait).
7. Pastikan kebijakan RLS setiap tabel hanya memberi akses ke row milik `auth.uid()`. Karena kredensial demo dapat dilihat oleh pengunjung web, akun demo tidak boleh memiliki data sensitif atau hak administratif.

Nilai default dapat diganti sebelum `biya-config.js` dimuat:

```html
<script>
  window.BIYA_DEMO_EMAIL = "demo@example.com";
  window.BIYA_DEMO_PASSWORD = "password-demo-anda";
</script>
```

Untuk deployment statis, nilai demo memang tersedia di browser. Perlakukan akun ini sebagai akun publik terbatas dan isolasikan datanya menggunakan RLS.

### Data pendaftaran

Sign-up menyimpan nama ke Supabase Auth `user_metadata` sebagai `name`, `full_name`, dan `business_name`. Implementasi ini tidak menulis langsung ke tabel `profiles`, sehingga tidak membutuhkan migration SQL dan tidak mengasumsikan bentuk tabel yang belum terdokumentasi. Jika project memakai trigger Supabase untuk membuat profile dari `raw_user_meta_data`, metadata tersebut siap digunakan oleh trigger itu.

### Checklist keamanan database

Tidak ada SQL baru yang wajib dijalankan untuk flow autentikasi. Namun, autentikasi di browser bukan pengganti otorisasi database: verifikasi bahwa tabel operasional (`raw_material`, `preparations`, `menus`, item resep, settings, dan tabel export terkait) telah mengaktifkan RLS dan policy ownership berbasis `auth.uid()` atau business membership yang valid sebelum aplikasi dipakai multi-user.

# Financial App

Aplikasi pencatatan keuangan berbasis web untuk mencatat:
- Income
- Expense
- Aset
- Liabilitas

Aplikasi menampilkan dashboard ringkas berisi total masing-masing tipe data, **Net Worth**, dan **Cashflow**.

## Fitur
- Form input untuk menambah data keuangan.
- Edit data yang sudah ada.
- Hapus per item dan hapus semua data.
- Dashboard statistik otomatis.
- Ringkasan kategori terbesar (income/expense).
- Filter data berdasarkan tipe, bulan, dan kata kunci.
- Import/Export data JSON untuk backup manual.
- Tombol isi data contoh agar pengguna baru langsung paham penggunaan.
- Penyimpanan data menggunakan `localStorage` browser.

## Jalankan Secara Lokal
Aplikasi ini statis (HTML/CSS/JS), jadi bisa langsung buka `index.html` di browser.

Atau jalankan server lokal:

```bash
python3 -m http.server 8000
```

Lalu buka:

`http://localhost:8000`

## Deploy ke GitHub Pages (Gratis)
Repository ini sudah disiapkan workflow deploy otomatis di:

- `.github/workflows/deploy-gh-pages.yml`

### Langkah deploy
1. Pastikan branch default repository Anda adalah `main` atau `master`.
2. Buka **Settings → Pages** lalu pilih source **GitHub Actions**.
3. Commit/push file workflow ke branch default.
4. Buka tab **Actions** lalu jalankan workflow (Run workflow) atau push commit baru.

### Jika muncul error `Get Pages site failed` / `HttpError: Not Found`
- Biasanya karena Pages belum diaktifkan pada repository.
- Solusi:
  1. Buka **Settings → Pages**
  2. Pilih source **GitHub Actions**
  3. Simpan, lalu jalankan workflow lagi.
- Workflow ini sudah menyertakan `enablement: true` pada `actions/configure-pages`, tapi pengaturan repo tetap harus dapat diakses oleh token workflow.

### Jika muncul warning Node.js 20 deprecated
- Workflow ini sudah mengaktifkan `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` agar action JavaScript berjalan di Node.js 24.

## Menarik Kode ke Repository `Financial-App`
Jika remote belum diset:

```bash
git remote add origin https://github.com/<username>/Financial-App.git
```

Push branch kerja:

```bash
git push -u origin work
```

Lalu merge PR ke `main`.

## Tentang Biaya Hosting
- Untuk versi aplikasi statis seperti ini, Anda bisa **gratis** di GitHub Pages.
- Biaya umumnya muncul jika nanti menambah backend/database berbayar, domain premium, atau traffic besar.

## Struktur File
- `index.html` - struktur halaman aplikasi
- `styles.css` - tampilan dan layout dashboard
- `app.js` - logika aplikasi, filter, dan penyimpanan data
- `.github/workflows/deploy-gh-pages.yml` - deploy otomatis ke GitHub Pages

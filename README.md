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
1. Buat repository GitHub bernama `Financial-App` (atau gunakan yang sudah ada).
2. Tambahkan remote dari project ini:

```bash
git remote add origin https://github.com/<username>/Financial-App.git
```

3. Push branch ke GitHub:

```bash
git push -u origin work
```

4. Di GitHub, buat Pull Request dari `work` ke `main`, lalu merge.
5. Buka **Settings → Pages** dan pastikan source menggunakan **GitHub Actions**.
6. Tunggu workflow selesai, lalu aplikasi aktif di URL GitHub Pages repository Anda.

## Menarik Kode ke Repository `Financial-App`
Jika remote sudah tersambung, jalankan:

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

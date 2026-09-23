# 💰 Money Tracker Web App (Rupiah IDR)

Aplikasi pencatatan keuangan pribadi modern, ringan, dan mudah dikembangkan yang dibangun dengan **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, dan **Turso DB (LibSQL Edge Database)**.

---

## ✨ Fitur Utama

1. **Pencatatan Transaksi (Transaction Record)**
   - Pilihan tipe: **Pemasukan (Income)** atau **Pengeluaran (Expense)**.
   - Input nominal dalam **Rupiah (Rp)** dengan format otomatis & tombol *quick-add* (+Rp 10.000, +Rp 50.000, +Rp 100.000, +Rp 500.000).
   - Pemilihan tanggal (default hari ini).
   - Kategori & catatan opsional.
   - Daftar riwayat transaksi dengan filter (Semua / Pemasukan / Pengeluaran), pencarian, dan hapus transaksi.

2. **Pelacakan Anggaran & Notifikasi (Budget Tracking & Push Alerts)**
   - Target batas anggaran pengeluaran bulanan (dapat diedit sewaktu-waktu).
   - Progress bar visual dengan 3 indikator status:
     - 🟢 **Aman** (< 80% dari batas anggaran)
     - 🟡 **Mendekati Batas** (80% - 99% dari batas anggaran)
     - 🔴 **Melebihi Batas** (≥ 100% dari batas anggaran)
   - **Push Notification Browser** (menggunakan Web Notification API) saat mencapai 80% dan 100%.
   - In-app toast notification sebagai fallback jika browser menolak notifikasi.
   - Tombol **"Tes Push Notif"** untuk memverifikasi izin notifikasi di perangkat Anda.

3. **Dasbor Analisis Sederhana (Barebone Analytics Dashboard)**
   - Total Pemasukan bulan ini / semua waktu.
   - Total Pengeluaran bulan ini / semua waktu.
   - Saldo Bersih (*Net Balance* = Pemasukan - Pengeluaran).
   - Sisa Anggaran belanja.
   - Filter transaksi berdasarkan bulan.

4. **Arsitektur Database Ramah Developer (Turso DB + Local Storage Fallback)**
   - Siap dipakai langsung (*out-of-the-box*) dengan **Local Storage** tanpa perlu setup akun database terlebih dahulu!
   - Saat siap, hubungkan ke **Turso DB** kapan saja melalui tombol **Settings (⚙️)** di pojok kanan atas atau via file `.env`.

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Install Dependencies
Pastikan Node.js (v18+) sudah terpasang, lalu jalankan:
```bash
npm install
```

### 2. Jalankan Server Development
```bash
npm run dev
```
Buka browser di `http://localhost:5173`.

### 3. Build untuk Produksi
```bash
npm run build
npm run preview
```

---

## 🗄️ Menghubungkan Turso DB (Opsional)

Aplikasi ini menggunakan SQLite di edge via `@libsql/client/web`.

### Langkah Cepat Setup Turso:
1. Pasang CLI Turso jika belum ada:
   ```bash
   # Di Windows (PowerShell):
   irm https://get.tur.so/install.ps1 | iex
   ```
2. Login ke akun Turso Anda:
   ```bash
   turso auth login
   ```
3. Buat database baru:
   ```bash
   turso db create money-db
   ```
4. Dapatkan URL database:
   ```bash
   turso db show money-db --url
   ```
5. Buat token autentikasi:
   ```bash
   turso db tokens create money-db
   ```
6. Masukkan URL dan Token ke dalam aplikasi:
   - **Cara 1 (UI)**: Klik ikon **Settings (⚙️)** di navbar aplikasi, tempel URL dan Token, lalu klik **"Simpan & Hubungkan Turso"**.
   - **Cara 2 (.env)**: Buat file `.env` di root project:
     ```env
     VITE_TURSO_DATABASE_URL=libsql://money-db-yourusername.turso.io
     VITE_TURSO_AUTH_TOKEN=ey...
     ```

Tabel `transactions` dan `budgets` akan dibuat secara otomatis saat pertama kali terhubung!

---

## 📂 Struktur Folder Proyek

Struktur dibuat sangat modular dan bersih agar mudah dipelajari serta dikembangkan:

```
money-tracker/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx           # Navigasi atas, status DB & tombol notifikasi
│   │   ├── Dashboard.tsx        # Kartu ringkasan finansial & saldo
│   │   ├── BudgetTracker.tsx    # Progress bar visual & alert anggaran
│   │   ├── TransactionForm.tsx  # Form input transaksi & quick chips Rp
│   │   ├── TransactionList.tsx  # Riwayat transaksi, filter & pencarian
│   │   ├── SettingsModal.tsx    # Modal konfigurasi Turso DB
│   │   └── Toast.tsx            # Sistem notifikasi popup in-app
│   ├── lib/
│   │   ├── db.ts                # Handler koneksi Turso & LocalStorage fallback
│   │   ├── formatters.ts        # Helper format Rupiah (IDR) & tanggal Indonesia
│   │   └── notifications.ts     # Logika Web Notification API & threshold alerts
│   ├── types/
│   │   └── index.ts             # Definisi TypeScript interface
│   ├── App.tsx                  # Komponen utama yang merangkai state
│   ├── index.css                # Konfigurasi Tailwind CSS v4
│   └── main.tsx                 # Entry point React
├── .env.example                 # Contoh template environment variable
├── package.json
└── vite.config.ts
```

---

## 💡 Ide Pengembangan Selanjutnya

Kode ini dirancang agar mudah ditambah fitur baru:
- Ekspor laporan ke format CSV / PDF.
- Grafik visual pengeluaran per kategori (Pie Chart / Bar Chart).
- Kustomisasi kategori belanja baru langsung dari UI.

## 🚀 Cara Menjalankan Aplikasi (Menggunakan Bun)

### 1. Install Dependencies
```bash
bun install
```

### 2. Jalankan Server Development
```bash
bun dev
```
Buka peramban di `http://localhost:5173`.

### 3. Build & Linting
```bash
# Cek linting
bun run lint

# Build untuk produksi
bun run build

# Pratinjau hasil build
bun run preview
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

```
money-tracker/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx           # Navigasi atas, status DB & tombol settings
│   │   ├── Dashboard.tsx        # Kartu ringkasan finansial & saldo
│   │   ├── BudgetTracker.tsx    # Progress bar visual & status anggaran
│   │   ├── TransactionForm.tsx  # Form input transaksi & quick chips Rp
│   │   ├── TransactionList.tsx  # Riwayat transaksi, filter & pencarian
│   │   ├── SettingsModal.tsx    # Modal konfigurasi Turso DB
│   │   └── Toast.tsx            # Sistem notifikasi popup in-app untuk aksi
│   ├── lib/
│   │   ├── db.ts                # Handler koneksi Turso & LocalStorage fallback
│   │   ├── formatters.ts        # Helper format Rupiah (IDR) & tanggal Indonesia
│   │   └── budget.ts            # Logika kalkulasi progress & status anggaran
│   ├── types/
│   │   └── index.ts             # Definisi TypeScript interface
│   ├── App.tsx                  # Komponen utama yang merangkai state
│   ├── index.css                # Konfigurasi Tailwind CSS v4
│   └── main.tsx                 # Entry point React
├── .env.example                 # Template environment variables
├── bun.lock                     # Bun lockfile
├── package.json
└── vite.config.ts
```

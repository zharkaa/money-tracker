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

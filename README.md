# 🏡 Cipta Group Batam - Property Catalog & Auto-Sync Linktree

Portal Web interaktif untuk katalog properti, daftar harga resmi, booking fee, dan simulasi cicilan **Cash Bertahap 60x - 72x (DP 0%)** serta skema **KPR Bank** dari 15 proyek resmi **Cipta Group Batam**.

Dilengkapi dengan mesin **Auto-Sync Linktree** bertenaga **Node.js** yang secara otomatis menyinkronkan data langsung dari [https://linktr.ee/ciptagroupofficial](https://linktr.ee/ciptagroupofficial).

---

## ✨ Fitur Utama

- **Katalog 15 Proyek Resmi**:
  - Rumah Tinggal, Ruko Komersial, dan Villa Mewah di Batam (Batam Kota, Marina, Tembesi, dll).
  - Thumbnail & Logo resmi dari CDN Linktree.
- **Transparansi Harga & Skema Pembayaran**:
  - Harga Jual & Booking Fee / UTJ (Rp 2 Juta - Rp 10 Juta).
  - Skema **Cash Bertahap Tanpa Bunga (DP 0%)** hingga 60x - 72x.
  - Skema **Cash Bertahap dengan DP** dan **KPR Bank** yang sinkron 100% secara matematis.
- **Kalkulator & Simulasi Cicilan Sinkron**:
  - Hitung cicilan bulanan, sisa pokok, dan tanggal jatuh tempo angsuran ke-1 (H+14 setelah UTJ).
  - Tombol konsultasi langsung ke WhatsApp Marketing dengan pesan otomatis.
- **Auto-Sync Linktree (Node.js)**:
  - Scraper otomatis mengambil data dari `linktr.ee/ciptagroupofficial`.
  - Background daemon berjalan setiap 6 jam sekali.
  - Tombol **Sinkronkan Sekarang** di tampilan web untuk update instan tanpa refresh halaman.
- **Ekspor Data Lengkap**:
  - Download spreadsheet Excel (`.xlsx`) dan CSV dengan seluruh rincian 68 unit properti.

---

## 🚀 Cara Menjalankan

### 1. Menjalankan Server Web & Auto-Sync (Node.js)
```bash
npm start
# atau
node server.js
```
Buka browser Anda di: **http://localhost:8000**

### 2. Menjalankan Sinkronisasi Manual
```bash
npm run sync
# atau
node sync.js
```

### 3. Shortcut Windows (Klik 2x)
- `start_node.bat` : Menyalakan server web & auto-sync daemon.
- `run_sync_node.bat` : Menjalankan proses sinkronisasi Linktree.
- `install_task_node.bat` : Mendaftarkan sinkronisasi otomatis setiap 6 jam ke Windows Task Scheduler.

---

## 📁 Struktur Direktori
```
scarpharga/
├── index.html                 # Antarmuka web portal responsif
├── app.js                     # Logika UI, kalkulator, filter & API auto-sync
├── data.js / data.json        # Basis data 15 proyek & 68 unit
├── server.js                  # Server HTTP Node.js & scheduler
├── sync.js                    # Mesin auto-sync Linktree Node.js
├── sync_status.json           # Status & riwayat waktu sinkronisasi
├── assets/thumbnails/         # Logo & gambar banner tiap proyek
├── pricelists/                # 15 berkas PDF pricelist resmi
├── data_harga_booking_cicilan_lengkap.xlsx # File Excel master
└── package.json
```

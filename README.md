
Link Repo Git: https://github.com/satrianugrahasaputra/sistem_peminjaman_ruangan_universitas.git 
Credential (Bila Perlu): 
- Admin (Sarpras) : admin@kampus.ac.id / Admin123!
- Admin (Fasilitas): admin.sarpras@kampus.ac.id / Admin123!
- Dosen 1         : budi.santoso@kampus.ac.id / Dosen123!
- Dosen 2         : siti.aminah@kampus.ac.id / Dosen123!
- Dosen 3         : eko.prasetyo@kampus.ac.id / Dosen123!
- Dosen 4         : dewi.lestari@kampus.ac.id / Dosen123!
- Dosen 5         : ahmad.dahlan@kampus.ac.id / Dosen123!

---

# 🏛️ Sistem Peminjaman Ruang Universitas

Aplikasi web full-stack terpadu untuk manajemen dan reservasi ruangan perkuliahan, laboratorium, dan aula di lingkungan perguruan tinggi. Dirancang dari awal hingga siap produksi (*production-ready*) dengan arsitektur modern, proteksi role berbasis middleware, validasi bentrok jadwal otomatis, sinkronisasi WebService eksternal, dan automated testing komprehensif.

---

## 🛠️ 1. Tech Stack yang Digunakan

- **Framework Utama**: Next.js 14+ (App Router) dengan TypeScript
- **Styling**: Tailwind CSS & Lucide React (UI responsif, modern, intuitif, clean)
- **Database & ORM**: SQLite via Prisma ORM (*zero-config*, portabel, langsung siap pakai)
- **Autentikasi & Otorisasi**: Custom JWT Session Cookies (HttpOnly) & Middleware Next.js
- **Testing Engine**: Vitest (Unit & Integration Automated Testing)
- **External WebService**: Integrasi sinkronisasi data ruangan dari `https://api-ruangan.vercel.app/rooms`

---

## ⚙️ 2. Fitur-Fitur Wajib & Implementasi

| Fitur | Status | Deskripsi Implementasi |
|---|:---:|---|
| **Authentication & Authorization** | ✅ Selesai | Login terpisah antara role Admin dan Dosen diproteksi melalui Next.js `middleware.ts`. Route `/admin/*` hanya untuk Admin, route `/dosen/*` hanya untuk Dosen. Dilengkapi tombol *Quick-Fill* kredensial untuk demo pengujian. |
| **Database Migration & Seeder** | ✅ Selesai | Seeder (`prisma/seed.ts`) memuat **10 akun pengguna** (2 Admin, 8 Dosen) dan **10 data ruangan** dengan spesifikasi fasilitas lengkap, serta data awal peminjaman. |
| **Manajemen Data Ruang (CRUD)** | ✅ Selesai | CRUD lengkap pada panel Admin (`/admin/ruangan`). Admin dapat menambah ruangan baru, mengedit kapasitas/fasilitas, serta menonaktifkan/menghapus ruangan. |
| **Sinkronisasi API Eksternal** | ✅ Selesai | Tombol khusus **"🔄 Sinkronisasi WebService"** pada panel Admin dan Dashboard yang menarik data dari `https://api-ruangan.vercel.app/rooms`. Dilengkapi penanganan *fault-tolerant fallback* bila endpoint publik Vercel mengalami 404/downtime. |
| **Manajemen Peminjaman** | ✅ Selesai | Dosen dapat memilih ruangan, menentukan tanggal & jam, serta mencantumkan keperluan kegiatan melalui formulir pengajuan (`/dosen/ajukan`). |
| **Approval System** | ✅ Selesai | Admin memiliki antarmuka khusus (`/admin/peminjaman`) untuk menyetujui (**Approve**), menolak (**Reject** dengan catatan alasan), atau menandai peminjaman selesai (**Finish**). |
| **Pencegahan Bentrok Jadwal** | ✅ Selesai | Sistem memvalidasi formula bentrok $(\text{Start}_A < \text{End}_B \land \text{End}_A > \text{Start}_B)$ secara **real-time** pada form Dosen dan saat proses *approval* oleh Admin. Ruangan yang sudah disetujui tidak dapat dipinjam kembali pada jam beririsan. |
| **Dashboard Statistik** | ✅ Selesai | Ringkasan metrik statistik real-time: Total Ruangan, Pengajuan Menunggu Review, Disetujui, Ditolak, dan Selesai, serta tabel pantauan aktivitas terbaru. |
| **Pencarian & Filter** | ✅ Selesai | Fitur filter status tab, filter lokasi gedung, filter kapasitas, dan pencarian instan (kode ruangan, nama dosen, peruntukan). |
| **Automated Testing** | ✅ Selesai | Terdapat **8 Automated Test (Unit & Integration)** menggunakan Vitest yang mencakup seluruh aturan bisnis, validasi bentrok, role access, status cycle, dan soft-delete. |

---

## 📋 3. Aturan Bisnis (Core Logic Rules)

1. **Aturan Role Pengajuan**: Hanya user dengan role **DOSEN** yang diizinkan mengajukan peminjaman ruangan.
2. **Aturan Role Approval**: Hanya user dengan role **ADMIN** yang memiliki otoritas untuk menyetujui (*Approve*) atau menolak (*Reject*) permohonan peminjaman.
3. **Pencegahan Ruangan Bentrok**: Ruangan dengan status `DISETUJUI` tidak dapat dipinjam oleh siapa pun pada rentang waktu yang sama atau beririsan.
4. **Siklus 4 Tahap Status**:
   $$\text{MENUNGGU} \longrightarrow \begin{cases} \text{DISETUJUI} \longrightarrow \text{SELESAI} \\ \text{DITOLAK} \end{cases}$$
5. **Retensi Riwayat Permanen**: Data riwayat peminjaman tidak pernah dihapus permanen (*soft-delete* dengan `isDeleted = true` dan `deletedAt`), sehingga seluruh jejak audit dan laporan historis tetap tersimpan utuh.

---

## 🧪 4. Hasil Pengujian Otomatis (Automated Testing)

Automated tests dijalankan menggunakan **Vitest** pada file `src/__tests__/booking-system.test.ts`.

### Ringkasan Test Cases:
- **Test 1**: Pencegahan Bentrok - deteksi tumpang tindih waktu dengan presisi (*pure logic overlap*).
- **Test 2**: Pencegahan Bentrok - tolak peminjaman jika ruangan dan waktu bentrok dengan jadwal `DISETUJUI` di database.
- **Test 3**: Izinkan peminjaman jika waktu tidak beririsan atau ruangan berbeda.
- **Test 4**: Aturan Role - hanya role `DOSEN` yang diizinkan mengajukan peminjaman.
- **Test 5**: Aturan Role - hanya role `ADMIN` yang diizinkan approve atau reject pengajuan.
- **Test 6**: Siklus Status Pengajuan - 4 Tahap (`MENUNGGU`, `DISETUJUI`, `DITOLAK`, `SELESAI`).
- **Test 7**: Retensi Riwayat - peminjaman tidak boleh terhapus permanen dari database (*soft-delete*).
- **Test 8**: Sinkronisasi Ruangan - berhasil melakukan upsert data ruangan dari WebService / Fallback.

**Hasil Eksekusi:**
```bash
 ✓ src/__tests__/booking-system.test.ts (8 tests)
 Test Files  1 passed (1)
      Tests  8 passed (8) - 100% PASS
```

---

## 🚀 5. Cara Menjalankan Proyek

### Prasyarat
- Node.js versi 18+ (direkomendasikan Node 20 / 22)
- npm versi 9+

### Langkah-Langkah:

1. **Clone / Buka Direktori Proyek**:
   ```bash
   cd "Sistem Peminjaman Ruang Universitas"
   ```

2. **Instal Dependensi**:
   ```bash
   npm install
   ```

3. **Inisialisasi Database & Seeder**:
   ```bash
   # Push skema Prisma ke database SQLite (dev.db)
   npx prisma db push

   # Eksekusi seeder (10 user, 10 ruangan, dan sampel peminjaman)
   npm run db:seed
   ```

4. **Menjalankan Automated Tests**:
   ```bash
   npm run test
   ```

5. **Menjalankan Server Aplikasi**:
   - **Mode Produksi (Optimized)**:
     ```bash
     npm run build
     npm run start
     ```
   - **Mode Development**:
     ```bash
     npm run dev
     ```

6. **Akses Aplikasi Melalui Browser**:
   Buka alamat: [http://localhost:3000](http://localhost:3000)

---

## 🔑 6. Kredensial Akun Pengujian (Seeder)

### Akun Administrator (Sarpras):
- **Email**: `admin@kampus.ac.id`
- **Password**: `Admin123!`
- **Role**: `ADMIN`
- **Hak Akses**: Dashboard Admin, Manajemen Ruang (CRUD & Sinkronisasi API), Persetujuan Pengajuan (Approve/Reject), Riwayat Lengkap & Ekspor CSV.

### Akun Dosen Pengajar:
- **Email**: `budi.santoso@kampus.ac.id` (Dr. Budi Santoso, M.Kom.)
- **Password**: `Dosen123!`
- **Role**: `DOSEN`
- **Hak Akses**: Dashboard Dosen, Katalog Ruangan, Pengajuan Peminjaman (dengan deteksi bentrok real-time), Riwayat Pengajuan Pribadi.

*(Tersedia tombol pintas **"Quick Fill"** pada halaman Login untuk kemudahan demo tanpa perlu mengetik manual).*

---

## 📡 7. Dokumentasi API Endpoints

- `POST /api/auth/login` : Autentikasi kredensial dan penerbitan session cookie
- `POST /api/auth/logout` : Menghapus session cookie
- `GET /api/auth/me` : Membaca profil user yang sedang aktif
- `GET /api/dashboard/stats` : Mengambil data ringkasan statistik (role-aware)
- `GET /api/rooms` : Daftar ruangan dengan filter pencarian dan kapasitas
- `POST /api/rooms` : Menambah data ruangan baru (*Admin only*)
- `PUT /api/rooms/[id]` : Memperbarui data ruangan (*Admin only*)
- `DELETE /api/rooms/[id]` : Menghapus/menonaktifkan ruangan (*Admin only*)
- `POST /api/rooms/sync` : Menjalankan sinkronisasi ruangan dari WebService eksternal (*Admin only*)
- `POST /api/bookings/check-conflict` : Memeriksa bentrok jadwal ruangan secara real-time
- `GET /api/bookings` : Daftar peminjaman dengan filter status dan pencarian
- `POST /api/bookings` : Mengajukan peminjaman ruangan baru (*Dosen only*)
- `PATCH /api/bookings/[id]` : Menyetujui, menolak, atau menyelesaikan peminjaman (*Admin only*)
- `DELETE /api/bookings/[id]` : Membatalkan peminjaman (*Soft-delete*)

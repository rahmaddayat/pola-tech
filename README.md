# 📰 Pola-Tech: Platform Interaktif Desain Pola Busana (Fashion CAD)

**Pola-Tech** adalah sebuah platform pembuat pola busana interaktif berbasis CAD (Computer-Aided Design) digital. Platform ini dirancang khusus untuk membantu penjahit, pelajar fesyen, butik pakaian, desainer indie, dan UMKM konveksi dalam mentransformasi sketsa manual menjadi cetakan pola busana digital berformat vektor (SVG/PDF) secara instan, cepat, dan presisi.

---

## 🛠️ Analisis Kebutuhan Sistem (User Requirements)

### 1. Kebutuhan Fungsional (Functional Requirements)
- **F-01: Manajemen Akun & Autentikasi**
  Sistem harus dapat mendaftarkan akun baru (Register) dan memvalidasi kredensial pengguna (Login) secara aman dengan password terenkripsi.
- **F-02: Manajemen Workspace**
  Pengguna dapat membuat, melihat daftar, dan menghapus workspace untuk mengorganisir koleksi proyek busana yang sedang dikerjakan.
- **F-03: Editor CAD Canvas Interaktif (SVG Visualizer)**
  Pengguna dapat memanipulasi pola pakaian secara visual langsung di kanvas:
  - Menambah, menggeser, dan menghapus titik koordinat (Vertex/Node).
  - Membengkokkan garis lurus menjadi kurva lengkung menggunakan kontrol bezier kuadratik (`Q`).
  - Menambahkan bentuk geometri dasar (Garis, Persegi, Segitiga, Pentagon, Hexagon, Dekagon, Lingkaran) sebagai template layer baru.
  - Melakukan duplikasi layer, rotasi 90 derajat, pencerminan horizontal (Mirror), dan mengubah urutan z-index layer.
- **F-04: Pengaturan Properti Pola (Styling)**
  Pengguna dapat mengatur nama layer, warna isi (Fill Color), warna garis tepi (Stroke Color), ketebalan garis (Stroke Width), tingkat transparansi (Opacity), dan radius lingkaran.
- **F-05: AI Pattern Copilot (Gemini Integration)**
  Pengguna dapat menulis instruksi dalam bahasa alami (misal: *"Saku berbentuk kotak di dada kiri"*) untuk dihitung koordinatnya secara otomatis oleh AI Copilot dan digambar instan pada canvas CAD.
- **F-06: Ekspor & Cetak Pola**
  Pengguna dapat mengunduh hasil akhir pola digital dalam format grafik vektor SVG skala presisi tinggi untuk dicetak.
- **F-07: Manajemen Paket Langganan**
  Pengguna dapat memilih dan meningkatkan status lisensi paket (LITE, PRO, atau BUSINESS) secara langsung pada platform.

### 2. Kebutuhan Non-Fungsional (Non-Functional Requirements)
- **NF-01: Performa Rendering Kanvas**
  Kanvas CAD harus merespons manipulasi titik (drag-and-drop) secara real-time dengan latency di bawah 16ms menggunakan manipulasi DOM SVG.
- **NF-02: Keamanan Data**
  Password pengguna harus disimpan dengan enkripsi satu arah yang aman (`bcrypt`), dan transaksi request API dilindungi oleh otorisasi token JWT (JSON Web Token).
- **NF-03: Portabilitas & Responsivitas**
  Platform harus dapat diakses secara lancar melalui browser modern (Chrome, Edge, Firefox, Safari) dengan tata letak grid dan flexbox yang responsif.
- **NF-04: Integritas Database**
  Sistem database harus menjamin relasi data yang konsisten (Cascading Delete) antara User, Workspace, Design, dan detail komponen pola.

---

## 📊 Data Flow Diagram (DFD)

### DFD Level 0 (Context Diagram)
Diagram ini menjelaskan aliran data global antara entitas luar (Pengguna & Gemini AI API) dengan Sistem Utama Pola-Tech.

```mermaid
graph TD
    Pengguna[Pengguna / Desainer]
    System(Sistem Pola-Tech)
    GeminiAI[Gemini AI Copilot API]
    
    %% Aliran Data Pengguna ke Sistem
    Pengguna -- "1. Data Akun (Register/Login)" --> System
    Pengguna -- "2. Input CAD (Koordinat Node, Styling, Layer)" --> System
    Pengguna -- "3. Prompt Desain AI" --> System
    Pengguna -- "4. Request Paket Langganan" --> System
    
    %% Aliran Data Sistem ke Pengguna
    System -- "5. Konfirmasi Auth & Token JWT" --> Pengguna
    System -- "6. Render Kanvas SVG Ter-update" --> Pengguna
    System -- "7. Unduhan Berkas Vektor SVG" --> Pengguna
    System -- "8. Status Transaksi Paket" --> Pengguna
    
    %% Aliran Data Sistem ke AI
    System -- "9. Prompt Instruksi Bahasa Alami" --> GeminiAI
    GeminiAI -- "10. Respons JSON Koordinat Pola & Nama Komponen" --> System
```

### DFD Level 1
Diagram ini mendeskripsikan dekomposisi proses internal dari Sistem Pola-Tech menjadi 5 proses utama.

```mermaid
graph TD
    Pengguna[Pengguna]
    DB[(Database SQLite / Postgres)]
    GeminiAI[Gemini AI Copilot API]

    subgraph "Proses Sistem Pola-Tech"
        P1(1.0 Manajemen Akun & Autentikasi)
        P2(2.0 Manajemen Workspace Koleksi)
        P3(3.0 Editor CAD SVG Canvas)
        P4(4.0 AI Pattern Generator)
        P5(5.0 Manajemen Paket & Langganan)
    end

    %% Aliran 1.0 Autentikasi
    Pengguna -- Data Register/Login --> P1
    P1 -- Read/Write User Data --> DB
    P1 -- Token JWT & Profil User --> Pengguna

    %% Aliran 2.0 Workspace
    Pengguna -- Kelola Workspace (Create/Delete) --> P2
    P2 -- Read/Write Workspace & Design Info --> DB
    P2 -- Daftar Workspace & Detail Desain --> Pengguna

    %% Aliran 3.0 CAD Canvas Editor
    Pengguna -- Aksi Edit (Node, Bezier, Layer) --> P3
    P3 -- Simpan Koordinat & Config Pola --> DB
    P3 -- Render SVG & Download Pola Vektor --> Pengguna

    %% Aliran 4.0 AI Pattern Generator
    Pengguna -- Prompt Desain Teks --> P4
    P4 -- API Request Prompt --> GeminiAI
    GeminiAI -- Hasil Kalkulasi Koordinat JSON --> P4
    P4 -- Tambahkan Layer Komponen Baru --> P3
    P4 -- Log Riwayat AI --> DB

    %% Aliran 5.0 Langganan
    Pengguna -- Upgrade Plan (Lite/Pro/Business) --> P5
    P5 -- Update Kolom Plan User --> DB
    P5 -- Status Upgrade & Fitur Aktif --> Pengguna
```

---

## 🗄️ Entity Relationship Diagram (ERD)

Database Pola-Tech dirancang menggunakan Prisma ORM dengan relasi tabel sebagai berikut:

```mermaid
erDiagram
    USER {
        Int id_user PK "Auto-Increment"
        String nama "Nama Pengguna"
        String email UK "Unique Email"
        String password "Hashed Password (bcrypt)"
        String role "Role: admin / user"
        String plan "Plan: lite / pro / business"
        String watermark_url "Opsional Watermark URL"
        DateTime created_at "Waktu Registrasi"
    }
    WORKSPACE {
        Int id_workspace PK "Auto-Increment"
        Int id_user FK "Relasi ke USER"
        String nama_workspace "Nama Koleksi Workspace"
        DateTime created_at "Waktu Pembuatan"
    }
    DESIGN {
        Int id_design PK "Auto-Increment"
        Int id_workspace FK "Relasi ke WORKSPACE"
        String nama_design "Nama Desain Pola"
        String deskripsi "Keterangan Desain"
        Json config "Koordinat & Styling Layer Utama"
        Json canvas_data "Data Canvas CAD Tambahan"
        DateTime created_at "Waktu Dibuat"
        DateTime updated_at "Waktu Terakhir Diedit"
    }
    COMPONENT {
        Int id_component PK "Auto-Increment"
        String nama_component "Nama Komponen (e.g. Sleeves)"
        String tipe "Tipe Geometri (e.g. Bezier)"
    }
    DESIGN_DETAIL {
        Int id_detail PK "Auto-Increment"
        Int id_design FK "Relasi ke DESIGN"
        Int id_component FK "Relasi ke COMPONENT"
        String value "Nilai Atribut / Koordinat Spesifik"
    }

    USER ||--o{ WORKSPACE : "memiliki"
    WORKSPACE ||--o{ DESIGN : "menyimpan"
    DESIGN ||--o{ DESIGN_DETAIL : "terdiri dari"
    COMPONENT ||--o{ DESIGN_DETAIL : "didetailkan dalam"
```

---

## 🧪 Laporan Hasil Pengujian (Testing Report)

Pengujian sistem dilakukan menggunakan metode **Blackbox Testing** untuk memvalidasi seluruh fungsionalitas antarmuka dan respon API:

| ID Test | Modul / Fitur | Skenario Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| **TS-01** | Autentikasi | Mendaftar akun baru dengan email unik dan password minimal 6 karakter. | Akun berhasil disimpan di DB dengan password terenkripsi, status sukses dikembalikan. | **PASS** |
| **TS-02** | Autentikasi | Login menggunakan email dan password yang terdaftar. | Sistem mengembalikan token JWT dan profil pengguna, lalu mengarahkan ke dashboard. | **PASS** |
| **TS-03** | Workspace | Membuat workspace baru bernama *"Koleksi Kebaya Modern"*. | Workspace baru berhasil dibuat dan langsung tampil di sidebar daftar workspace. | **PASS** |
| **TS-04** | Canvas CAD | Menambahkan bentuk dasar lingkaran (Circle) dan persegi (Rect). | Geometri dirender di dalam kanvas SVG dengan warna default. | **PASS** |
| **TS-05** | Canvas CAD | Men-drag titik vertex biru pada pola baju untuk memanipulasi bentuk. | Titik koordinat bergeser dan visualisasi pola SVG ter-render secara real-time. | **PASS** |
| **TS-06** | Canvas CAD | Menggeser titik control point bezier (titik abu-abu) pada garis pola. | Garis lurus bertransformasi secara mulus menjadi kurva lengkung bezier (`Q`). | **PASS** |
| **TS-07** | Canvas CAD | Melakukan *Double-Click* pada titik kontrol bezier kuning. | Garis kurva reset kembali menjadi garis lurus (`L`). | **PASS** |
| **TS-08** | AI Copilot | Memasukkan prompt *"saku di dada kiri"* ke form AI Pattern Copilot. | API backend memproses prompt melalui Gemini AI, menghitung koordinat, dan menggambar saku di koordinat x=30, y=40 secara otomatis. | **PASS** |
| **TS-09** | Ekspor Pola | Mengklik tombol *"Cetak Pola (SVG)"*. | File SVG dengan format skala 1:1 langsung terunduh secara lokal ke komputer pengguna. | **PASS** |
| **TS-10** | Langganan | Mengubah langganan pengguna menjadi paket *"PRO"* pada halaman landing page. | Kolom `plan` pada tabel `User` di database SQLite ter-update menjadi `"pro"`. | **PASS** |

---

## ⚙️ Panduan Instalasi & Cara Running Aplikasi (Lokal)

Proyek ini terbagi menjadi dua bagian: **Frontend (Next.js)** dan **Backend (Express.js + Prisma DB)**.

### 1. Prasyarat Sistem
Pastikan komputer Anda sudah terinstal:
- **Node.js** (Versi 18 ke atas)
- **npm** atau **yarn**

---

### 2. Jalankan Backend (Express.js)

1. Buka terminal baru dan masuk ke direktori backend:
   ```bash
   cd backend
   ```
2. Salin file konfigurasi env:
   ```bash
   cp .env.example .env
   ```
   *Secara default database telah terkonfigurasi menggunakan SQLite lokal (`DATABASE_URL="file:./dev.db"`).*
3. Instal semua dependencies backend:
   ```bash
   npm install
   ```
4. Setup skema database & seed data menggunakan Prisma:
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```
   *Proses seeding akan menyisipkan akun demo: **`admin@polatech.id`** / password: **`password123`**.*
5. Jalankan server backend dalam mode development:
   ```bash
   npm run dev
   ```
   Backend akan berjalan di **`http://localhost:5000`**.

---

### 3. Jalankan Frontend (Next.js)

1. Buka terminal baru dan masuk ke direktori root proyek:
   ```bash
   cd /home/zeyn/Documents/PPl/pola-tech
   ```
2. Instal dependencies frontend:
   ```bash
   npm install
   ```
3. Jalankan server Next.js:
   ```bash
   npm run dev
   ```
4. Buka browser dan buka tautan berikut:
   **`http://localhost:3000`**

Aplikasi Pola-Tech siap Anda gunakan untuk mendesain pola busana digital!

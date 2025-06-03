# Authentication & User Management Service

## Overview

Layanan ini menyediakan fungsionalitas autentikasi dan manajemen pengguna yang dibangun menggunakan Node.js, Express, dan MongoDB. Layanan ini mencakup registrasi pengguna, login, autentikasi berbasis token (JWT), mekanisme refresh token, pembatasan akses (rate-limiting), serta operasi CRUD untuk manajemen pengguna oleh admin.

## Features

- Registrasi Pengguna Publik
- Login Pengguna dengan Autentikasi JWT
- Mekanisme Refresh Token
- Verifikasi Token
- Manajemen Pengguna (CRUD) oleh Admin
- Peran Pengguna (User & Admin) dengan Kontrol Akses Berbasis Peran
- Rate Limiting untuk Mencegah Penyalahgunaan
- Middleware untuk Verifikasi Token dan Otorisasi Admin
- Hashing Password yang Aman

## Technologies Used

- Node.js
- Express.js
- MongoDB (dengan Mongoose ODM)
- `bcryptjs` (untuk hashing password)
- `jsonwebtoken` (JWT untuk autentikasi)
- `express-validator` (untuk validasi input)
- `express-rate-limit` (untuk membatasi request per IP)
- `dotenv` (untuk mengelola variabel lingkungan)
- `@faker-js/faker` (untuk data dummy pada seeder, opsional untuk development)

## Prerequisites

- Node.js (direkomendasikan versi LTS terbaru, misal >=18.x)
- MongoDB (Instansi Lokal atau Cloud seperti MongoDB Atlas)
- Manajer paket `npm` atau `yarn`

## Installation

1.  **Clone repository:**

    ```sh
    git clone [https://github.com/PAE-2025/jisebi-checker-auth-service](https://github.com/PAE-2025/jisebi-checker-auth-service)
    cd jisebi-checker-auth-service
    ```

2.  **Install dependencies:**

    ```sh
    npm install
    ```

3.  **Buat file `.env`** di direktori root dan atur variabel lingkungan berikut. Anda bisa menyalin dari `.env.example` jika ada.

    ```env
    # Server Configuration
    PORT=5000
    NODE_ENV=development

    # MongoDB Configuration
    MONGODB_URI=mongodb://localhost:27017/nama_database_anda

    # JWT Configuration
    JWT_SECRET=your_very_strong_and_secret_jwt_key
    JWT_ACCESS_TOKEN_EXPIRES_IN=1h
    JWT_REFRESH_TOKEN_EXPIRES_IN=7d
    ```

    - Ganti `nama_database_anda` dengan nama database yang Anda inginkan.
    - Ganti `your_very_strong_and_secret_jwt_key` dengan kunci rahasia yang kuat.

4.  **(Opsional) Jalankan Seeder untuk Data Dummy (Development):**
    Untuk mengisi database dengan data pengguna awal untuk keperluan development:

    ```sh
    npm run db:seed:users
    ```

    Untuk membuat sejumlah pengguna tertentu (misalnya 5):

    ```sh
    npm run db:seed:users -- 5
    ```

5.  **Start the server:**
    ```sh
    npm run dev
    ```
    Atau jika Anda menggunakan skrip start untuk produksi:
    ```sh
    npm start
    ```
    Server akan berjalan pada port yang ditentukan di file `.env` (default 5000).

## API Endpoints

Semua endpoint API menggunakan prefix `/api`.

### Modul Autentikasi (`/api/auth`)

#### 1. Registrasi Pengguna Baru

- **Endpoint:** `POST /api/auth/register`
- **Deskripsi:** Mendaftarkan pengguna baru.
- **Request Body:**
  ```json
  {
    "username": "newUserExample",
    "password": "password123"
  }
  ```
- **Validasi:**
  - `username`: wajib, 4-20 karakter, alfanumerik.
  - `password`: wajib, minimal 6 karakter, mengandung angka.
- **Response Sukses (201 Created):**
  ```json
  {
    "status": "success",
    "message": "Pengguna berhasil diregistrasi",
    "data": {
      "user": {
        "id": "userIdGeneratedByMongo",
        "username": "newUserExample",
        "isAdmin": false
      }
    }
  }
  ```
- **Kemungkinan Error:**
  - `400 Bad Request`: Validasi gagal atau username sudah terdaftar.
  - `500 Internal Server Error`: Kesalahan server.

#### 2. Login Pengguna

- **Endpoint:** `POST /api/auth/login`
- **Deskripsi:** Melakukan login pengguna dan mendapatkan token.
- **Request Body:**
  ```json
  {
    "username": "existingUser",
    "password": "userPassword"
  }
  ```
- **Validasi:**
  - `username`: wajib.
  - `password`: wajib.
- **Response Sukses (200 OK):**
  ```json
  {
    "status": "success",
    "message": "Login berhasil",
    "data": {
      "userId": "userIdFromDatabase",
      "username": "existingUser",
      "accessToken": "jwt_access_token_string",
      "refreshToken": "jwt_refresh_token_string",
      "expireAt": 1691234567 // Timestamp kedaluwarsa accessToken
    }
  }
  ```
- **Kemungkinan Error:**
  - `400 Bad Request`: Validasi gagal.
  - `401 Unauthorized`: Username atau password salah.
  - `500 Internal Server Error`.

#### 3. Refresh Access Token

- **Endpoint:** `POST /api/auth/refresh`
- **Deskripsi:** Mendapatkan `accessToken` baru menggunakan `refreshToken`.
- **Request Body:**
  ```json
  {
    "refreshToken": "your_valid_refresh_token"
  }
  ```
- **Response Sukses (200 OK):**
  ```json
  {
    "status": "success",
    "message": "Access token baru berhasil dibuat",
    "data": {
      "accessToken": "new_jwt_access_token_string",
      "expireAt": 1691237890 // Timestamp kedaluwarsa accessToken baru
    }
  }
  ```
- **Kemungkinan Error:**
  - `400 Bad Request`: Refresh token tidak ada.
  - `401 Unauthorized`: Refresh token tidak valid atau kedaluwarsa.
  - `500 Internal Server Error`.

#### 4. Verifikasi Token

- **Endpoint:** `POST /api/auth/verify-token`
- **Deskripsi:** Memverifikasi validitas `accessToken` saat ini.
- **Headers:**
  - `Authorization: Bearer <accessToken>`
- **Response Sukses (200 OK):**
  ```json
  {
    "status": "success",
    "message": "Token valid",
    "data": {
      "user": {
        "id": "userIdFromToken",
        "username": "usernameFromToken",
        "isAdmin": true // atau false
      }
    }
  }
  ```
- **Kemungkinan Error:**
  - `401 Unauthorized`: Token tidak ada, tidak valid, atau kedaluwarsa.

---

### Modul Manajemen Pengguna (`/api/users`)

**Catatan:** Semua endpoint di bawah ini memerlukan autentikasi (`accessToken`) dan otorisasi sebagai admin.

#### 1. Mendapatkan Semua Pengguna (Admin)

- **Endpoint:** `GET /api/users`
- **Deskripsi:** Mengambil daftar semua pengguna dengan opsi pagination dan filter.
- **Headers:**
  - `Authorization: Bearer <adminAccessToken>`
- **Query Parameters (Opsional):**
  - `page` (Angka, default: 1): Nomor halaman.
  - `limit` (Angka, default: 10): Jumlah item per halaman.
  - `username` (String): Filter berdasarkan username (case-insensitive, partial match).
- **Response Sukses (200 OK):**
  ```json
  {
    "status": "success",
    "message": "Daftar pengguna berhasil diambil",
    "data": {
      "users": [
        {
          "_id": "userId1",
          "username": "userOne",
          "isAdmin": false,
          "createdAt": "2025-06-03T..."
        },
        {
          "_id": "userId2",
          "username": "adminUser",
          "isAdmin": true,
          "createdAt": "2025-06-03T..."
        }
      ],
      "pagination": {
        "total": 20,
        "page": 1,
        "limit": 10,
        "pages": 2
      }
    }
  }
  ```
- **Kemungkinan Error:** `401 Unauthorized`, `403 Forbidden`, `500 Internal Server Error`.

#### 2. Membuat Pengguna Baru (Admin)

- **Endpoint:** `POST /api/users`
- **Deskripsi:** Membuat pengguna baru oleh admin.
- **Headers:**
  - `Authorization: Bearer <adminAccessToken>`
- **Request Body:**
  ```json
  {
    "username": "adminCreatedUser",
    "password": "strongPassword123",
    "isAdmin": false // Opsional, default false
  }
  ```
- **Validasi:** Sama seperti registrasi.
- **Response Sukses (201 Created):**
  ```json
  {
    "status": "success",
    "message": "Pengguna berhasil dibuat",
    "data": {
      "user": {
        "id": "newUserId",
        "username": "adminCreatedUser",
        "isAdmin": false,
        "createdAt": "2025-06-03T..."
      }
    }
  }
  ```
- **Kemungkinan Error:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `500 Internal Server Error`.

#### 3. Mendapatkan Detail Pengguna (Admin)

- **Endpoint:** `GET /api/users/:id`
- **Deskripsi:** Mengambil detail satu pengguna berdasarkan ID.
- **Headers:**
  - `Authorization: Bearer <adminAccessToken>`
- **Path Parameter:**
  - `id`: ID pengguna yang ingin diambil.
- **Response Sukses (200 OK):**
  ```json
  {
    "status": "success",
    "message": "Data pengguna berhasil diambil",
    "data": {
      "user": {
        "_id": "targetUserId",
        "username": "targetUser",
        "isAdmin": false,
        "createdAt": "2025-06-03T..."
      }
    }
  }
  ```
- **Kemungkinan Error:** `400 Bad Request (ID tidak valid)`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`.

#### 4. Memperbarui Pengguna (Admin)

- **Endpoint:** `PUT /api/users/:id`
- **Deskripsi:** Memperbarui data pengguna berdasarkan ID.
- **Headers:**
  - `Authorization: Bearer <adminAccessToken>`
- **Path Parameter:**
  - `id`: ID pengguna yang ingin diperbarui.
- **Request Body (semua field opsional):**
  ```json
  {
    "username": "updatedUsername",
    "password": "newStrongPassword456", // Jika ingin mengubah password
    "isAdmin": true
  }
  ```
- **Response Sukses (200 OK):**
  ```json
  {
    "status": "success",
    "message": "Pengguna berhasil diperbarui",
    "data": {
      "user": {
        "_id": "targetUserId",
        "username": "updatedUsername",
        "isAdmin": true,
        "createdAt": "2025-06-03T..."
        // Password tidak dikembalikan
      }
    }
  }
  ```
- **Kemungkinan Error:** `400 Bad Request (ID tidak valid, validasi gagal, username sudah ada)`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`.

#### 5. Menghapus Pengguna (Admin)

- **Endpoint:** `DELETE /api/users/:id`
- **Deskripsi:** Menghapus pengguna berdasarkan ID. Admin tidak bisa menghapus akunnya sendiri melalui endpoint ini.
- **Headers:**
  - `Authorization: Bearer <adminAccessToken>`
- **Path Parameter:**
  - `id`: ID pengguna yang ingin dihapus.
- **Response Sukses (200 OK):**
  ```json
  {
    "status": "success",
    "message": "Pengguna berhasil dihapus",
    "data": null
  }
  ```
- **Kemungkinan Error:** `400 Bad Request (ID tidak valid)`, `401 Unauthorized`, `403 Forbidden (misal, mencoba menghapus diri sendiri)`, `404 Not Found`, `500 Internal Server Error`.

## Security Measures

- **Rate Limiting**: Mencegah percobaan login berlebihan dan potensi abuse lainnya pada endpoint tertentu.
- **Password Hashing**: Menggunakan `bcryptjs` untuk menyimpan password secara aman.
- **JWT Authentication**: Mengamankan akses ke rute yang dilindungi.
- **Kontrol Akses Berbasis Peran (RBAC)**: Memastikan hanya admin yang dapat mengakses fungsionalitas manajemen pengguna.
- **Validasi Input**: Menggunakan `express-validator` untuk memvalidasi semua input dari klien.
- **Penggunaan Variabel Lingkungan**: Menyimpan konfigurasi sensitif (kunci rahasia, URI database) di luar kode sumber.

## Repository

- GitHub: [jisebi-checker-auth-service](https://github.com/PAE-2025/jisebi-checker-auth-service)

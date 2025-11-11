console.log("===== TES RELOAD VERSI 2 =====");
const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path'); 

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- ⬇ PASTIKAN BAGIAN INI BENAR ⬇ ---
const pool = mysql.createPool({
    host: 'localhost',      // Server MySQL Anda (biasanya localhost)
    user: 'root',           // User MySQL Anda
    password: 'haris0912',            // Password MySQL Anda
    database: 'tugas_api',
    port: 3306   // Database yang BARU SAJA Anda buat
});

// Tes koneksi
pool.getConnection()
    .then(connection => {
        console.log('✅ Terhubung ke database MySQL!');
        connection.release();
    })
   .catch(err => {
    console.error('❌ ERROR KONEKSI DATABASE:', err.message); // Tampilkan hanya pesan error
    // Pastikan database 'tugas_api' ada, user 'root' dan password 'haris0912' benar.
});
// --- ⬆ BAGIAN KONEKSI SELESAI ⬆ ---


// Rute POST untuk Generate Key
app.post('/generate-key', async (req, res) => {
    try {
        const { keyName, keyPermissions } = req.body; 
        
        // Cek input dasar
        if (!keyName || !keyPermissions) {
             return res.status(400).json({ message: 'Nama Key dan Izin harus diisi.' });
        }
        
        // 1. Generate Key (64 karakter hex)
        const finalApiKey = crypto.randomBytes(32).toString('hex');

        // 2. Simpan ke Database (Pakai backticks keys)
        const sql = "INSERT INTO `keys` (name_key, api_key, izin) VALUES (?, ?, ?)";
        
        // Catatan: Gunakan backticks (`) untuk nama tabel 'keys' jika itu adalah kata kunci MySQL!
        const [result] = await pool.execute(sql, [keyName, finalApiKey, keyPermissions]);

        // PERBAIKAN SINTAKS 1: Menggunakan backticks
        console.log(`Key baru berhasil disimpan. ID: ${result.insertId}`);
            
        // 3. Kirim key kembali ke front-end
        res.status(200).json({ 
            apiKey: finalApiKey,
            message: 'Key berhasil dibuat dan disimpan di MySQL'
        });

    } catch (error) {
        console.error('Error saat generate key:', error);
        res.status(500).json({ message: 'Gagal membuat API key', error: error.message });
    }
});

// Jalankan server
app.listen(port, () => {
    // PERBAIKAN SINTAKS 2: Menggunakan backticks
    console.log(`Server API Key berjalan di http://localhost:${port}`);
});
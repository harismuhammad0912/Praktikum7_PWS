console.log("===== SERVER API KEY GENERATOR DIMULAI =====");
const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path'); 

const app = express();
const port = 3000;

// Middleware
app.use(cors()); // Mengizinkan akses dari frontend (penting!)
app.use(express.json()); // Penting untuk membaca data JSON dari Postman/Frontend
app.use(express.static(path.join(__dirname, 'public'))); // Menyajikan file statis (jika ada)

// --- ⬇ KONFIGURASI KONEKSI DATABASE ⬇ ---
const pool = mysql.createPool({
    host: 'localhost',      
    user: 'root',           
    password: 'haris0912',            
    database: 'tugas_api',
    port: 3306   
});

// Tes koneksi
pool.getConnection()
    .then(connection => {
        console.log('✅ Terhubung ke database MySQL!');
        connection.release();
    })
   .catch(err => {
    // Jika ada error, ini akan menampilkan pesan yang jelas
    console.error('❌ ERROR KONEKSI DATABASE:', err.message); 
    console.error('Pastikan MySQL server berjalan dan kredensial (user/pass) sudah benar.');
    // Berhenti jika koneksi gagal (opsional)
    // process.exit(1); 
});
// --- ⬆ KONFIGURASI KONEKSI SELESAI ⬆ ---


// Rute POST untuk Generate Key
app.post('/generate-key', async (req, res) => {
    try {
        // Ambil data yang dikirim dari Postman/Frontend
        const { keyName, keyPermissions } = req.body; 
        
        // Cek input dasar
        if (!keyName || !keyPermissions) {
             return res.status(400).json({ message: 'Nama Key (keyName) dan Izin (keyPermissions) wajib diisi.' });
        }
        
        // 1. Generate Key yang aman (32 byte -> 64 karakter heksadesimal)
        const finalApiKey = crypto.randomBytes(32).toString('hex');

        // 2. Simpan ke Database
        // PENTING: Gunakan backticks (`) untuk nama tabel dan nama kolom
        // `name_key` dicocokkan dengan error Postman Anda
        const sql = "INSERT INTO `keys` (`name_key`, `api_key`, `izin`) VALUES (?, ?, ?)";
        
        // Urutan variabel harus sesuai dengan urutan kolom di SQL: name_key, api_key, izin
        const [result] = await pool.execute(sql, [keyName, finalApiKey, keyPermissions]);

        // Log yang benar
        console.log(`Key baru berhasil disimpan. ID: ${result.insertId} | Key: ${finalApiKey}`);
            
        // 3. Kirim key kembali ke front-end
        res.status(201).json({ // Menggunakan 201 Created untuk operasi INSERT
            success: true,
            apiKey: finalApiKey,
            message: 'Key berhasil dibuat dan disimpan di MySQL'
        });

    } catch (error) {
        // Log error untuk debugging di sisi server
        console.error('Error saat generate key:', error);
        
        // Kirim error detail ke Postman/Frontend
        res.status(500).json({ 
            success: false,
            message: 'Gagal membuat API key', 
            error: error.message 
        });
    }
});

// Jalankan server
app.listen(port, () => {
    console.log(`Server API Key berjalan di http://localhost:${port}`);
    console.log(`Endpoint POST: http://localhost:${port}/generate-key`);
});
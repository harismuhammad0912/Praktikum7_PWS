const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const app = express();
const port = 3000;

// Konfigurasi Body-Parser untuk mengambil data dari form
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// **CATATAN PENTING KEAMANAN:**
// Di lingkungan produksi, Anda harus mengkonfigurasi CORS (Cross-Origin Resource Sharing)
// untuk hanya mengizinkan domain frontend Anda mengakses API ini.
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Ubah * ke domain frontend Anda
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Database Palsu (Simulasi penyimpanan di server)
const apiKeysDatabase = [];

/**
 * Fungsi untuk menghasilkan API Key yang aman menggunakan modul crypto.
 * Menggunakan buffer acak 32-byte (256 bit) dan mengkonversinya ke heksadesimal.
 * @returns {string} API Key yang dihasilkan.
 */
function generateSecureApiKey() {
    // Menghasilkan 32 byte (256 bit) data acak
    const randomBytes = crypto.randomBytes(32); 
    // Mengkonversi ke string heksadesimal
    const key = randomBytes.toString('hex');
    return `pk_key_${key}`; // Prefix opsional untuk identifikasi
}

// 🌐 POST Endpoint untuk Generate API Key
app.post('/generate-apikey', (req, res) => {
    // 1. Ambil data dari request body (dari form HTML)
    const { appName, environment, rateLimit, contactEmail } = req.body;

    // 2. Validasi Input Dasar
    if (!appName || !environment || !contactEmail) {
        return res.status(400).json({ success: false, message: 'Nama Aplikasi, Lingkungan, dan Email wajib diisi.' });
    }

    // 3. Generate Kunci API
    const newApiKey = generateSecureApiKey();

    // 4. Simpan ke "Database" (dalam kasus ini, array)
    const newKeyRecord = {
        key: newApiKey,
        appName: appName,
        environment: environment,
        rateLimit: rateLimit || 'N/A',
        contactEmail: contactEmail,
        createdAt: new Date().toISOString()
    };
    apiKeysDatabase.push(newKeyRecord);

    console.log(`[SERVER LOG] Key baru dibuat untuk: ${appName} (${environment})`);
    // console.log("Database saat ini:", apiKeysDatabase); // Debugging

    // 5. Kirim respon sukses ke frontend, termasuk API Key
    res.status(201).json({
        success: true,
        message: 'API Key berhasil dibuat dan disimpan.',
        apiKey: newApiKey,
        details: { appName, environment }
    });
});

// 🚀 Jalankan Server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
    console.log(`POST endpoint siap di http://localhost:${port}/generate-apikey`);
});
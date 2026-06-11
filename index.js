require('dotenv').config();
const express = require('express');
const db = require('./config/mysql');
const connectMongo = require('./config/mongo');

const app = express();

// Jalankan koneksi
connectMongo();

// Tes MySQL
db.query('SELECT 1').then(() => {
    console.log("MySQL Terhubung");
}).catch(err => {
    console.error("MySQL Gagal:", err.message);
});

app.listen(4000, () => console.log("Server berjalan di port 4000"));
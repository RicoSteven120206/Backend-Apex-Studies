require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const sequelize = require('./config/mysql');
const connectMongo = require('./config/mongo');

const userRoutes = require('./routes/userRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

const app = express();

app.use(cors({
    origin: [
        'http://localhost:3000',
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

["public/uploads/contents", "public/uploads/thumbnails"].forEach((dir) => {
  fs.mkdirSync(path.join(process.cwd(), dir), { recursive: true });
});

app.use(express.static(path.join(process.cwd(), "public")));

app.use('/api', require('./routes'));

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} tidak ditemukan` });
});

app.use((err, req, res, next) => {
  console.error("[UNHANDLED ERROR]", err.message);
  res.status(500).json({ success: false, message: "Internal server error" });
});

const startServer = async () => {
    try {
        await connectMongo();
        console.log('Database MongoDB berhasil dijalankan!');
        await sequelize.authenticate();
        console.log('Semua tabel MYSQL berhasil disinkronisasi!');
    } catch(error) {
        console.error('Gagal menjalankan server:', error.message);
    }
}

startServer();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const PORT = 4000 || env.process.PORT;
app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
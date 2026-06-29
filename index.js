require('dotenv').config();
const express = require('express');
const cors = require('cors');

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

app.use('/api', require('./routes'));

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
const mongoose = require('mongoose');
require('dotenv').config();

const connectMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Terhubung");
    } catch (err) {
        console.error("Gagal koneksi Mongo:", err);
    }
};

module.exports = connectMongo;
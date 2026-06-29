const mongoose = require('mongoose');
require('dotenv').config();

const connectMongo = async () => {
    try {
        const connMongo = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27050/apex_studies_mongo', {
            serverSelectionTimeoutMS: 5000
        });
        console.log(`MongoDB Connected: ${connMongo.connection.host}`);
    } catch (err) {
        console.error("Gagal koneksi Mongo:", err);
    }
};

module.exports = connectMongo;
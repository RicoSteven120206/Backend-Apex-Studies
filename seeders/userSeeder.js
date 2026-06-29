const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/userModel');

dotenv.config({ path: '../.env' });

const seedUsers = async => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        await User.deleteMany();
        await User.create([
            { name: 'Admin', email: 'admin@course.com', password: 'password123', role: 'admin' }
        ]);

        console.log('Data seeder user berhasil dimasukkan!');
        process.exit();
    } catch (error) {
        console.error(`Gagal memasukkan data seeder: ${error.message}`);
        process.exit(1);
    }
}

seedUser();
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
// const { User } = require('../models/mysqlModel/index');
// const QuizResult = require('../models/mongoModel/quizResult');
// const Recommendation = require('../models/mongoModel/recommendation');

// const generateToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
// };

// const registerUser = async (req, res) => {
//     const { nama, email, password, role } = req.body;
//     try {
//         const userExists = await User.findOne({ email });
//         if (userExists) {
//             return res.status(400).json({ message: 'Email sudah terdaftar.' });
//         }

//         const user = await User.create({ name, email, password, role });
//         return res.status(201).json({
//             success: true,
//             token: generateToken(user._id),
//             user: { id: user._id, name: user.name, email: user.email, role: user.role }
//         });
//     } catch (error) {
//         return res.status(401).json({ error: error.message });
//     }
// };

// const loginUser = async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const user = await User.findOne({ email });
//         if (user && (await user.matchPassword(password))) {
//             return res.json({
//                 success: true,
//                 token: generateToken(user._id),
//                 user: { id: user._id, name: user.name, email: user.email, role: user.role }
//             });
//         }
//         return res.status(401).json({ message: 'Email atau Password salah.'});
//     } catch (error) {
//         return res.status(500).json({ error: error.message});
//     }
// }

// exports.getAllUsers = async (req, res) => {
//     try {
//         const users = await User.findAll({
//             attributes: { exclude: ['password'] } 
//         });

//         res.status(200).json({
//             success: true,
//             message: 'Berhasil mengambil daftar pengguna',
//             data: users
//         });
//     } catch (error) {
//         console.error('Error getAllUsers:', error);
//         res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
//     }
// }

// exports.createUser = async (req, res) => {
//     try {
//         const { name, email, password, education_level, grade } = req.body;

//         const saltRounds = 10;
//         const hashedPassword = await bcrypt.hash(password, saltRounds);

//         const newUser = await User.create({
//             name,
//             email,
//             password: hashedPassword,
//             education_level,
//             grade
//         });

//         const userResponse = newUser.toJSON();
//         delete userResponse.password;

//         res.status(201).json({
//             success: true,
//             message: 'Pengguna berhasil didaftarkan',
//             data: userResponse
//         });
//     } catch (error) {
//         console.error('Error createUser:', error);
//         res.status(500).json({ success: false, message: 'Gagal mendaftarkan pengguna (email mungkin sudah terpakai)' });
//     }
// };

// exports.updateUser = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { name, email, education_level, grade } = req.body; // Password biasanya diedit via endpoint khusus reset-password

//         const user = await User.findByPk(id);
//         if (!user) {
//             return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
//         }

//         await user.update({ name, email, education_level, grade });

//         const userResponse = user.toJSON();
//         delete userResponse.password;

//         res.status(200).json({
//             success: true,
//             message: 'Data pengguna berhasil diperbarui',
//             data: userResponse
//         });
//     } catch (error) {
//         console.error('Error updateUser:', error);
//         res.status(500).json({ success: false, message: 'Gagal memperbarui pengguna' });
//     }
// };

// exports.deleteUser = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const user = await User.findByPk(id);
        
//         if (!user) {
//             return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
//         }

//         await user.destroy();

//         await QuizResult.deleteOne({ userId: id });

//         await Recommendation.deleteOne({ userId: id });

//         res.status(200).json({
//             success: true,
//             message: 'Pengguna dan seluruh data jejak rekamnya (MySQL & MongoDB) berhasil dihapus'
//         });
//     } catch (error) {
//         console.error('Error deleteUser:', error);
//         res.status(500).json({ success: false, message: 'Gagal menghapus pengguna' });
//     }
// }

// module.exports = { registerUser, loginUser };

"use strict";
const jwt = require("jsonwebtoken");
const { User } = require("../models/mysqlModel");
const QuizResult = require("../models/mongoModel/quizResult");
const Recommendation = require("../models/mongoModel/recommendation");

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });

const registerUser = async (req, res) => {
  try {
    const { name, email, password, education_level, grade } = req.body;

    if (!name || !email || !password || !education_level || grade == null) {
      return res.status(400).json({
        success: false,
        message: "name, email, password, education_level, grade wajib diisi",
      });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ success: false, message: "Email sudah terdaftar." });
    }

    const user = await User.create({
      name,
      email,
      password, 
      education_level,
      grade,
      role: "user",
      is_active: true,
    });

    return res.status(201).json({
      success: true,
      token: generateToken(user.id, user.role),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        education_level: user.education_level,
        grade: user.grade,
      },
    });
  } catch (error) {
    console.error("registerUser:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.scope("withPassword").findOne({ where: { email } });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Email atau Password salah." });
    }

    if (user.is_active === false || user.is_active === 0) {
      return res.status(403).json({ success: false, message: "Akun tidak aktif." });
    }

    return res.json({
      success: true,
      token: generateToken(user.id, user.role),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        education_level: user.education_level,
        grade: user.grade,
      },
    });
  } catch (error) {
    console.error("loginUser:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getMe = async (req, res) => {
  return res.json({ success: true, data: req.user });
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ order: [["id", "DESC"]] });
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("getAllUsers:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, education_level, grade, role } = req.body;

    const user = await User.create({
      name,
      email,
      password, 
      education_level,
      grade,
      role: role === "admin" ? "admin" : "user",
      is_active: true,
      created_by: req.user?.email || "admin",
    });

    return res.status(201).json({ success: true, message: "Pengguna dibuat", data: user });
  } catch (error) {
    console.error("createUser:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mendaftarkan pengguna (email mungkin sudah terpakai)",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, education_level, grade, role, is_active } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan" });

    await user.update({
      name, email, education_level, grade,
      ...(role !== undefined && { role }),
      ...(is_active !== undefined && { is_active }),
      updated_by: req.user?.email || "admin",
    });

    return res.status(200).json({ success: true, message: "Data diperbarui", data: user });
  } catch (error) {
    console.error("updateUser:", error);
    return res.status(500).json({ success: false, message: "Gagal memperbarui pengguna" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan" });

    await user.destroy(); // user_interactions ikut CASCADE
    await QuizResult.deleteOne({ userId: Number(id) });
    await Recommendation.deleteOne({ userId: Number(id) });

    return res.status(200).json({
      success: true,
      message: "Pengguna & jejak rekamnya (MySQL + MongoDB) berhasil dihapus",
    });
  } catch (error) {
    console.error("deleteUser:", error);
    return res.status(500).json({ success: false, message: "Gagal menghapus pengguna" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};
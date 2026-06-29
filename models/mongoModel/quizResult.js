const mongoose = require('mongoose');
const { ENUM } = require('sequelize');

const quizResultSchema = new mongoose.Schema({
    userId: {
        type: Number,
        required: true,
        unique: true
    },
    favoriteSubject: {
        type: String,
        required: true
    },
    favoriteContent: {
        type: String,
        required: true,
        enum: ['video', 'text', 'image', 'article', 'pdf']
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    }
}, {
    collection: 'quiz_results'
});

module.exports = mongoose.model('QuizResult', quizResultSchema);
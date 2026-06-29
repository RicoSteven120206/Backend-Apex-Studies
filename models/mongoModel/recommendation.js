const mongoose = require('mongoose');

const recommendationItemSchema = new mongoose.Schema({
    contentId: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
}, { _id: false });

const recommendationSchema = new mongoose.Schema({
    userId: {
        type: Number,
        required: true,
        unique: true
    },
    generatedAt: {
        type: Date,
        default: Date.now
    },
    items: [recommendationItemSchema]
}, {
    collection: 'recommendations'
});

module.exports = mongoose.model('Recommendation', recommendationSchema);
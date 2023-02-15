// Imports
const mongoose = require('mongoose');

// Create an user data schema for the MongoDB database
const sauceSchema = mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    description: { type: String, required: true },
    mainPepper: { type: String, required: true },
    imageUrl: { type: String, required: true },
    heat: { type: Number, required: true },
    likes: { type: Number, default: 0},
    dislikes: { type: Number, default: 0},
    usersLiked: { type: [String] },
    usersDisliked: { type: [String] },
});

// Export Sauce data schema
module.exports = mongoose.model('Sauce', sauceSchema);
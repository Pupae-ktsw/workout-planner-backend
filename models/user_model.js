const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please add your email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please enter a password']
    },
    name: {
        type: String,
        required: [true, 'Please enter your name']
    }
});

module.exports = mongoose.model('User', userSchema);
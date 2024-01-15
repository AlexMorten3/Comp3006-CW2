const mongoose = require('mongoose');

const userData = new mongoose.Schema({
    username: {type: String, unique: true},
    password: String,
    isAdmin: Boolean
});

const User = mongoose.model('User', userData);

module.exports = User;
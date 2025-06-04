const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  // add other fields if needed
});

// Pass 'user' as third param to use this exact collection name instead of pluralized 'users'
const User = mongoose.model('User', userSchema, 'user');

module.exports = User;

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, maxlength: 10 }, // Limit username to 10 chars
  workouts: [
    {
      reps: Number,
      workout_name: String,
      time_taken: Number,
      date: Date
    }
  ]
});

const User = mongoose.model('User', userSchema, 'users');
module.exports = User;
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
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
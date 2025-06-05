const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./user');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://exercia:Fpd20jbSjavHHM5H@cluster0.qpv0m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
 .then(() => console.log('Connected to MongoDB Atlas'))
 .catch(err => console.error('MongoDB connection error:', err));

app.post('/signup', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (username.length > 10) {
      return res.status(400).json({ message: 'Username must be at most 10 characters' });
    }
    console.log('Trying to sign up with:', username);
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });
    const user = new User({ email, password, username });
    await user.save();
    console.log('User created:', user);
    res.json({ message: 'User created' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ message: 'Login successful', username: user.username }); // return username
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/workouts', async (req, res) => {
  try {
    const { email, date } = req.query;

    if (!email || !date) {
      return res.status(400).json({ message: 'Email and date are required' });
    }

    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const workouts = user.workouts || [];

    const filtered = workouts.filter(w => {
      const workoutDate = new Date(w.date).toISOString().split('T')[0];
      return workoutDate === date;
    });

    if (filtered.length === 0) {
      return res.json({ email, date, summary: [], message: 'No workouts on this date' });
    }

    const summaryMap = {};
    filtered.forEach(w => {
      if (!summaryMap[w.workout_name]) summaryMap[w.workout_name] = 0;
      summaryMap[w.workout_name] += w.reps || 0;
    });

    const summary = Object.entries(summaryMap).map(([workout_name, total_reps]) => ({
      workout_name,
      total_reps
    }));

    res.json({ email, date, summary });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/api/workout-summary', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email }).lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const workouts = user.workouts || [];

    const total_sessions = workouts.length;

    const uniqueDates = new Set(
      workouts.map(w => new Date(w.date).toISOString().split('T')[0])
    );

    const active_days = uniqueDates.size;

    res.json({
      email,
      total_sessions,
      active_days
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add this endpoint to your existing server code

app.get('/api/workout-totals', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const workouts = user.workouts || [];

    if (workouts.length === 0) {
      return res.json({ 
        email, 
        totals: {},
        message: 'No workouts found' 
      });
    }

    // Calculate total reps for each workout type
    const totals = {};
    workouts.forEach(workout => {
      const workoutName = workout.workout_name;
      const reps = workout.reps || 0;
      
      if (!totals[workoutName]) {
        totals[workoutName] = 0;
      }
      totals[workoutName] += reps;
    });

    res.json({
      email,
      totals
    });

  } catch (err) {
    console.error('Workout totals error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('- POST /signup');
  console.log('- POST /login'); 
  console.log('- GET /test');
  console.log('- GET /api/workouts/:email');
  console.log('- GET /api/workouts/:email/history');
});
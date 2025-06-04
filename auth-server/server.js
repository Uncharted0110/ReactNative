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
    const { email, password } = req.body;
    console.log('Trying to sign up with:', email);

    const existing = await User.findOne({ email });
    console.log('Existing user:', existing);

    if (existing) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ email, password });
    await user.save();
    console.log('User created:', user);

    res.json({ message: 'User created' });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({ message: 'Login successful' });
});

app.listen(3000, () => console.log('Server running on port 3000'));

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
require('dotenv').config();

const mongoose = require('mongoose');

mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to database');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });

        if (!user) {
            console.log('User not found, creating a new user...');

            const hashedPassword = await bcrypt.hash(password, 10);


            user = await User.create({
                username,
                password: hashedPassword,
                role: 'admin',
            });

            console.log('New user created:', user);
        } else {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: 'Invalid username or password' });
            }
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (err) {
        console.error('Error during login:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { login };

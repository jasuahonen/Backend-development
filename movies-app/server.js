const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const movieRoutes = require('./routes/movieRoutes');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();

const app = express();
const PORT = 3010;

// Middleware
app.use(express.json());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Connect to MongoDB using Mongoose
(async () => {
    try {
        console.log('Connecting to MongoDB...');
        const connection = await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB!');

        // Use the MongoDB native client for moviesCollection
        const db = mongoose.connection.db;
        const moviesCollection = db.collection('movies');
        app.locals.moviesCollection = moviesCollection;

        // Attach routes
        app.use('/auth', authRoutes);
        app.use('/', movieRoutes);

        // Start the server
        app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
    }
})();

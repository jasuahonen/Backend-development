const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/userModel'); // Adjust path as needed

(async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect('mongodb+srv://jasuahonen:JasunMongoDatabase@cluster0.483oq.mongodb.net/moviesDB?retryWrites=true&w=majority', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB.');

        // Hash the password
        const hashedPassword = await bcrypt.hash('admin1234', 10);

        // Update the admin user
        const result = await User.updateOne(
            { username: 'admin' },
            { $set: { password: hashedPassword } }
        );

        if (result.modifiedCount > 0) {
            console.log('Admin password updated successfully.');
        } else {
            console.log('Admin user not found or password already hashed.');
        }
    } catch (err) {
        console.error('Error updating password:', err);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed.');
    }
})();

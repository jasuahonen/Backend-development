const express = require('express');
const morgan = require('morgan');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');

const app = express();
const PORT = 3010;

// Use morgan for logging HTTP requests in development mode
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json());

// MongoDB Connection
const uri = "mongodb+srv://jasuahonen:JasunMongoDatabase@cluster0.483oq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let moviesCollection;

async function connectToDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB!");

        const db = client.db('moviesDB'); // Replace 'movieDatabase' with your database name
        moviesCollection = db.collection('movies'); // Replace 'movies' with your collection name
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}

connectToDB();

// Default route: return all movies as HTML list
app.get('/', async (req, res) => {
    try {
        const movies = await moviesCollection.find().toArray();
        const movieList = movies.map(movie => `<li>${movie.title} (${movie.year}) - Directed by ${movie.director}</li>`).join('');
        res.send(`<h1>Movie Collection</h1><ul>${movieList}</ul>`);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// GET /movies - Return all movies with optional filtering
app.get('/movies', async (req, res) => {
    const { title, year, director } = req.query;
    let query = {};

    if (title) query.title = new RegExp(title, 'i'); // Case-insensitive search
    if (year) query.year = parseInt(year, 10);
    if (director) query.director = new RegExp(director, 'i'); // Case-insensitive search

    try {
        const movies = await moviesCollection.find(query).toArray();
        res.json(movies);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// GET /movies/:id - Return a specific movie by its ID
app.get('/movies/:id', async (req, res) => {
    try {
        const movie = await moviesCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (movie) {
            res.json(movie);
        } else {
            res.status(404).send('Movie not found');
        }
    } catch (err) {
        res.status(400).send('Invalid ID');
    }
});

// POST /movies - Create a new movie
app.post('/movies', async (req, res) => {
    const { title, director, year } = req.body;

    if (!title || !director || !year || typeof year !== 'number') {
        console.error('Validation failed:', req.body);
        return res.status(400).json({ error: 'Invalid movie data' });
    }

    try {
        const newMovie = { title, director, year };
        const result = await moviesCollection.insertOne(newMovie);

        // Use insertedId instead of ops[0]
        res.status(201).json({ ...newMovie, _id: result.insertedId });
    } catch (err) {
        console.error('Error inserting movie:', err);
        res.status(500).json({ error: 'Failed to insert movie', details: err.message });
    }
});


// PUT /movies/:id - Update an existing movie
app.put('/movies/:id', async (req, res) => {
    try {
        const result = await moviesCollection.findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body },
            { returnDocument: 'after', upsert: false } // Return updated document
        );
        if (result.value) {
            res.json(result.value);
        } else {
            res.status(404).send('Movie not found');
        }
    } catch (err) {
        res.status(400).send('Invalid ID');
    }
});

// DELETE /movies/:id - Delete a movie by its ID
app.delete('/movies/:id', async (req, res) => {
    try {
        const result = await moviesCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 1) {
            res.sendStatus(204); // No Content
        } else {
            res.status(404).send('Movie not found');
        }
    } catch (err) {
        res.status(400).send('Invalid ID');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

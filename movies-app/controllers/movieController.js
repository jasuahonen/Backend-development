const { ObjectId } = require('mongodb');
const movieSchema = require('../models/movieModel');

async function getAllMovies(req, res, moviesCollection) {
    const { title, year, director } = req.query;
    let query = {};

    if (title) {
        query.title = new RegExp(title, 'i')}; // Case-insensitive search
    if (year) {
        query.year = parseInt(year, 10)};
    if (director) {
        query.director = new RegExp(director, 'i')};

    try {
        const movies = await moviesCollection.find(query).toArray();
        res.json(movies);
    } catch (err) {
        res.status(500).send('Server Error');
    }
}

async function getMovieById(req, res, moviesCollection) {
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
}

async function createMovie(req, res, moviesCollection) {
    const { error } = movieSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message })};

    try {
        const newMovie = req.body;
        const result = await moviesCollection.insertOne(newMovie);
        res.status(201).json({ ...newMovie, _id: result.insertedId });
    } catch (err) {
        res.status(500).json({ error: 'Failed to insert movie', details: err.message });
    }
}

async function updateMovie(req, res, moviesCollection) {
    try {
        const result = await moviesCollection.findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body },
            { returnDocument: 'after', upsert: false }
        );
        if (result.value) {
            res.json(result.value);
        } else {
            res.status(404).send('Movie not found');
        }
    } catch (err) {
        res.status(400).send('Invalid ID');
    }
}

async function deleteMovie(req, res, moviesCollection) {
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
}

async function getMoviesAsHTML(req, res, moviesCollection) {
    try {
        const movies = await moviesCollection.find().toArray();
        const movieList = movies
            .map(movie => `<li>${movie.title} (${movie.year}) - Directed by ${movie.director}</li>`)
            .join('');
        res.send(`<h1>Movie Collection</h1><ul>${movieList}</ul>`);
    } catch (err) {
        res.status(500).send('Server Error');
    }
}

module.exports = {
    getAllMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
    getMoviesAsHTML,
};

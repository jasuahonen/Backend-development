const express = require('express');
const morgan = require('morgan');

const app = express();
const PORT = 3010;

// Use morgan for logging HTTP requests in development mode
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json());

const movies = [
    { id: 1, title: "Inception", director: "Christopher Nolan", year: 2010 },
    { id: 2, title: "The Matrix", director: "The Wachowskis", year: 1999 },
    { id: 3, title: "Parasite", director: "Bong Joon-ho", year: 2019 }
];

// Helper function to validate movie data
const validateMovie = (movie) => {
    if (!movie.title || typeof movie.title !== 'string') {
        return 'Invalid or missing title';
    }
    if (!movie.director || typeof movie.director !== 'string') {
        return 'Invalid or missing director';
    }
    if (!movie.year || typeof movie.year !== 'number' || movie.year < 1888 || movie.year > new Date().getFullYear()) {
        return 'Invalid or missing year (movies should be from 1888 onwards)';
    }
    return null;
};

// Default route: return all movies as HTML list
app.get('/', (req, res) => {
    let movieList = movies.map(movie => `<li>${movie.title} (${movie.year}) - Directed by ${movie.director}</li>`).join('');
    res.send(`<h1>Movie Collection</h1><ul>${movieList}</ul>`);
});

// GET /movies - Return all movies with optional filtering
app.get('/movies', (req, res) => {
    const { title, year, director } = req.query;

    let filteredMovies = movies;

    // Filter by title if provided
    if (title) {
        filteredMovies = filteredMovies.filter(movie =>
            movie.title.toLowerCase().includes(title.toLowerCase())
        );
    }

    // Filter by year if provided and is a valid number
    if (year) {
        const yearNum = parseInt(year, 10);
        if (!isNaN(yearNum)) {
            filteredMovies = filteredMovies.filter(movie => movie.year === yearNum);
        } else {
            return res.status(400).json({ error: 'Year must be a valid number' });
        }
    }

    // Filter by director if provided
    if (director) {
        filteredMovies = filteredMovies.filter(movie =>
            movie.director.toLowerCase().includes(director.toLowerCase())
        );
    }

    res.json(filteredMovies);
});


// GET /movies/:id - Return a specific movie by its ID
app.get('/movies/:id', (req, res) => {
    const movieId = parseInt(req.params.id, 10);
    const movie = movies.find(m => m.id === movieId);
    if (movie) {
        res.json(movie);
    } else {
        res.status(404).send('Movie not found');
    }
});

// POST /movies - Create a new movie
app.post('/movies', (req, res) => {
    const error = validateMovie(req.body);
    if (error) {
        return res.status(400).json({ error }); // 400 Bad Request if data is invalid
    }

    const newMovie = { id: movies.length + 1, ...req.body };
    movies.push(newMovie);
    res.status(201).json(newMovie); // 201 Created for successful creation
});

// PUT /movies/:id - Update an existing movie
app.put('/movies/:id', (req, res) => {
    const movieId = parseInt(req.params.id, 10);
    const movieIndex = movies.findIndex(m => m.id === movieId);

    if (movieIndex === -1) {
        return res.status(404).send('Movie not found');
    }

    const error = validateMovie(req.body);
    if (error) {
        return res.status(400).json({ error }); // 400 Bad Request if data is invalid
    }

    const updatedMovie = { id: movieId, ...req.body };
    movies[movieIndex] = updatedMovie;
    res.json(updatedMovie); // Return the updated movie
});

// DELETE /movies/:id - Delete a movie by its ID
app.delete('/movies/:id', (req, res) => {
    const movieId = parseInt(req.params.id, 10);
    const movieIndex = movies.findIndex(m => m.id === movieId);

    if (movieIndex === -1) {
        return res.status(404).send('Movie not found');
    }

    movies.splice(movieIndex, 1);
    res.sendStatus(204); // 204 No Content for successful deletion
});

// Catch-all route for undefined endpoints
app.use((req, res) => {
    res.status(404).send('Route not found');
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

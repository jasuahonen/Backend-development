const express = require('express');
const {
    getAllMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
    getMoviesAsHTML,
} = require('../controllers/movieController');
const authenticate = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', (req, res) => getMoviesAsHTML(req, res, req.app.locals.moviesCollection));
router.get('/movies', (req, res) => getAllMovies(req, res, req.app.locals.moviesCollection));
router.get('/movies/:id', (req, res) => getMovieById(req, res, req.app.locals.moviesCollection));
router.post('/movies', authenticate, (req, res) => createMovie(req, res, req.app.locals.moviesCollection));
router.put('/movies/:id', authenticate, (req, res) => updateMovie(req, res, req.app.locals.moviesCollection));
router.delete('/movies/:id', authenticate, (req, res) => deleteMovie(req, res, req.app.locals.moviesCollection));

module.exports = router;

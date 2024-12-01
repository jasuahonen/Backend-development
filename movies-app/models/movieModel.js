// validation logic

const Joi = require('joi');

const movieSchema = Joi.object({
    title: Joi.string().required(),
    director: Joi.string().required(),
    year: Joi.number().integer().min(1888).max(new Date().getFullYear()).required(),
});

module.exports = movieSchema;

const mongoose = require('mongoose');

const movieData = new mongoose.Schema({
    movieName: String,
    directorName: String,
    movieLengthMinutes: Number
});

const Movie = mongoose.model('Movie', movieData);

module.exports = Movie;
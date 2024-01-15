const mongoose = require('mongoose');

const ticketData = new mongoose.Schema({
    movieName: String,
    userName: String,
    ticketDate: Date
});

const Ticket = mongoose.model('Ticket', ticketData);

module.exports = Ticket;
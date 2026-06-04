const mongoose = require('mongoose');
require('../models/travlr');

const Trip = mongoose.model('trips');

const tripsList = async (req, res) => {
    try {
        const trips = await Trip.find({});
        res.status(200).json(trips);
    } catch (err) {
        res.status(404).json(err);
    }
};

const tripsFindCode = async (req, res) => {
    try {
        const trip = await Trip.findOne({ code: req.params.tripCode });
        res.status(200).json(trip);
    } catch (err) {
        res.status(404).json(err);
    }
};

module.exports = {
    tripsList,
    tripsFindCode
};
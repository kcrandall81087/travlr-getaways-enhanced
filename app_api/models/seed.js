const fs = require('fs');
const mongoose = require('mongoose');
const Trip = require('./travlr');

const dbURI = 'mongodb://127.0.0.1:27017/travlr';

const trips = JSON.parse(fs.readFileSync('./data/trips.json', 'utf8'));

mongoose.connect(dbURI);

mongoose.connection.on('connected', async () => {
    console.log(`Mongoose connected to ${dbURI}`);

    await Trip.deleteMany({});
    console.log('Existing trips removed');

    await Trip.insertMany(trips);
    console.log('Trips inserted');

    mongoose.connection.close();
});

mongoose.connection.on('error', err => {
    console.log(`Mongoose connection error: ${err}`);
});
const mongoose = require('mongoose');

const dbURI = process.env.MONGODB_URI;

mongoose
  .connect(dbURI)
  .catch((err) => {
    console.error(`Initial MongoDB connection failed: ${err.message}`);
    process.exit(1);
  });

mongoose.connection.on('connected', () => {
  console.log(
    `Mongoose connected to database: ${mongoose.connection.name}`
  );
});

mongoose.connection.on('error', (err) => {
  console.error(`Mongoose connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

require('./travlr');
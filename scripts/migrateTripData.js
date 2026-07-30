require('dotenv').config();

const mongoose = require('mongoose');

const parseDurationNights = (length) => {
  if (typeof length !== 'string') {
    return null;
  }

  const match = length.trim().match(/^(\d+)/);

  if (!match) {
    return null;
  }

  const duration = Number(match[1]);

  return Number.isInteger(duration) && duration > 0
    ? duration
    : null;
};

const migrateTripData = async () => {
  const dbURI = process.env.MONGODB_URI;

  if (!dbURI) {
    throw new Error('MONGODB_URI is not configured.');
  }

  await mongoose.connect(dbURI);

  console.log(
    `Connected to MongoDB database: ${mongoose.connection.name}`
  );

  const tripsCollection =
    mongoose.connection.collection('trips');

  const trips = await tripsCollection.find({}).toArray();

  if (trips.length === 0) {
    console.log('No trip documents were found.');
    return;
  }

  const operations = [];
  const invalidTrips = [];

  trips.forEach((trip) => {
    const numericPrice = Number(trip.perPerson);
    const durationNights =
      parseDurationNights(trip.length);

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0 ||
      durationNights === null
    ) {
      invalidTrips.push({
        id: trip._id,
        code: trip.code,
        perPerson: trip.perPerson,
        length: trip.length
      });

      return;
    }

    operations.push({
      updateOne: {
        filter: {
          _id: trip._id
        },
        update: {
          $set: {
            perPerson: numericPrice,
            durationNights
          }
        }
      }
    });
  });

  if (invalidTrips.length > 0) {
    console.error(
      'Migration stopped because some records could not be converted:'
    );

    console.table(invalidTrips);

    throw new Error(
      'Correct the invalid records before running the migration.'
    );
  }

  console.log(
    `Prepared ${operations.length} trip documents for migration.`
  );

  const shouldApply = process.argv.includes('--apply');

  if (!shouldApply) {
    console.log(
      'Preview complete. No records were changed.'
    );

    console.log(
      'Run "node scripts/migrateTripData.js --apply" to apply the migration.'
    );

    return;
  }

  const result =
    await tripsCollection.bulkWrite(operations);

  console.log('Migration completed successfully.');
  console.log(`Matched documents: ${result.matchedCount}`);
  console.log(`Modified documents: ${result.modifiedCount}`);
};

migrateTripData()
  .catch((error) => {
    console.error(`Migration failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
require('dotenv').config();

const mongoose = require('mongoose');

const CATEGORY_DEFINITIONS = [
  {
    name: 'Reef & Diving',
    description:
      'Travel packages centered on reef exploration, diving, and marine destinations.'
  },
  {
    name: 'Beach Getaway',
    description:
      'Relaxing beach-oriented travel packages and coastal destinations.'
  },
  {
    name: 'Luxury Resort',
    description:
      'Premium resort experiences and upscale accommodations.'
  },
  {
    name: 'Adventure',
    description:
      'Travel packages focused on active and adventure-based experiences.'
  },
  {
    name: 'Other',
    description:
      'Travel packages that do not fit another defined category.'
  }
];

const determineCategoryName = (trip) => {
  const searchableText = [
    trip.name,
    trip.resort,
    trip.description
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (
    searchableText.includes('reef') ||
    searchableText.includes('dive') ||
    searchableText.includes('diving')
  ) {
    return 'Reef & Diving';
  }

  if (
    searchableText.includes('beach') ||
    searchableText.includes('ocean') ||
    searchableText.includes('lagoon')
  ) {
    return 'Beach Getaway';
  }

  if (
    searchableText.includes('luxury') ||
    searchableText.includes('5 stars') ||
    searchableText.includes('suite')
  ) {
    return 'Luxury Resort';
  }

  if (
    searchableText.includes('adventure') ||
    searchableText.includes('hiking') ||
    searchableText.includes('expedition')
  ) {
    return 'Adventure';
  }

  return 'Other';
};

const addTripCategories = async () => {
  const dbURI = process.env.MONGODB_URI;

  if (!dbURI) {
    throw new Error('MONGODB_URI is not configured.');
  }

  await mongoose.connect(dbURI);

  console.log(
    `Connected to MongoDB database: ${mongoose.connection.name}`
  );

  const categoriesCollection =
    mongoose.connection.collection('categories');

  const tripsCollection =
    mongoose.connection.collection('trips');

  for (const category of CATEGORY_DEFINITIONS) {
    await categoriesCollection.updateOne(
      {
        name: category.name
      },
      {
        $setOnInsert: category
      },
      {
        upsert: true
      }
    );
  }

  const categories = await categoriesCollection
    .find({})
    .toArray();

  const categoryMap = new Map(
    categories.map((category) => [
      category.name,
      category._id
    ])
  );

  const trips = await tripsCollection
    .find({})
    .toArray();

  const operations = trips.map((trip) => {
    const categoryName =
      determineCategoryName(trip);

    return {
      updateOne: {
        filter: {
          _id: trip._id
        },
        update: {
          $set: {
            category: categoryMap.get(categoryName)
          }
        }
      }
    };
  });

  const shouldApply =
    process.argv.includes('--apply');

  console.log(
    `Prepared ${operations.length} trip category assignments.`
  );

  if (!shouldApply) {
    console.log(
      'Preview complete. No trip records were changed.'
    );

    console.log(
      'Run "node scripts/addTripCategories.js --apply" to apply the changes.'
    );

    return;
  }

  if (operations.length > 0) {
    const result =
      await tripsCollection.bulkWrite(operations);

    console.log(
      `Matched documents: ${result.matchedCount}`
    );

    console.log(
      `Modified documents: ${result.modifiedCount}`
    );
  }

  console.log(
    'Category migration completed successfully.'
  );
};

addTripCategories()
  .catch((error) => {
    console.error(
      `Category migration failed: ${error.message}`
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
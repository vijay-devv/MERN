const axios = require('axios');
const Transaction = require('./models/Transaction');

const seedDatabase = async () => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const transactions = response.data;

    await Transaction.insertMany(transactions, { maxTimeMS: 30000 });
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

module.exports = seedDatabase;

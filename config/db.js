const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI;

// Function to connect to MongoDB
const connectToDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully!');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

module.exports = connectToDB;
const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    
    const mongoURI = 'mongodb://localhost:27017/project';
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      socketTimeoutMS: 30000, 
      connectTimeoutMS: 30000, 
      
    };

    await mongoose.connect(mongoURI, options);

    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); 
  }
};

module.exports = connectDB;

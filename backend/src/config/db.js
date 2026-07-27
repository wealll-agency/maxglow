import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  const options = {
    maxPoolSize: 50,
    minPoolSize: 10,
    serverSelectionTimeoutMS: 15000, 
    socketTimeoutMS: 45000,
    connectTimeoutMS: 15000,
  };

  mongoose.connection.on('disconnected', () => {
    console.error('MongoDB disconnected! PM2/Docker will handle restart if the process crashes, but mongoose will attempt to reconnect.');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected successfully!');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`MongoDB pool connection error: ${err.message}`);
  });

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/maxglow', options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error during startup: ${error.message}`);
    // Delay exit slightly to ensure logs flush
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }
};

export default connectDB;

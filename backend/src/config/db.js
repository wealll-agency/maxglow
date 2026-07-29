import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('[FATAL ERROR] MONGODB_URI is missing from environment variables. Server cannot start.');
  }

  const options = {
    maxPoolSize: 50,
    minPoolSize: 10,
    serverSelectionTimeoutMS: 15000, 
    socketTimeoutMS: 65000, // Increased to prevent silent drops by load balancers
    connectTimeoutMS: 15000,
    keepAlive: true, // Crucial for preventing disconnects in deployed environments
    keepAliveInitialDelay: 300000,
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
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error during startup: ${error.message}`);
    throw error; // Rethrow to be caught by server.js
  }
};

export default connectDB;

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
    socketTimeoutMS: 65000, 
    connectTimeoutMS: 15000,
    keepAlive: true, 
    keepAliveInitialDelay: 10000, // Reduced to 10 seconds to aggressively beat load balancer idle timeouts (Render/AWS drop at 60-100s)
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

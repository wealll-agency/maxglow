import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Ensure Node.js uses reliable DNS resolution for MongoDB Atlas SRV records
try {
  dns.setDefaultResultOrder?.('ipv4first');
} catch (e) {}

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
    if (error.message.includes('querySrv') || error.message.includes('ECONNREFUSED')) {
      console.warn('Local DNS SRV resolution failed. Applying Google/Cloudflare public DNS fallback (8.8.8.8)...');
      try {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
        const conn = await mongoose.connect(process.env.MONGODB_URI, options);
        console.log(`MongoDB Connected (via DNS fallback): ${conn.connection.host}`);
        return conn;
      } catch (fallbackError) {
        console.error(`MongoDB fallback connection error: ${fallbackError.message}`);
        throw fallbackError;
      }
    }
    console.error(`MongoDB connection error during startup: ${error.message}`);
    throw error; // Rethrow to be caught by server.js
  }
};

export default connectDB;

import express from 'express'; // Trigger restart
import 'express-async-errors'; // Catch async route errors
import dotenv from 'dotenv';
import dns from 'dns';

try {
  dns.setDefaultResultOrder?.('ipv4first');
} catch (e) {}
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import https from 'https';
import mongoose from 'mongoose';

// Config imports
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import mongoSanitize from 'express-mongo-sanitize';

// Route imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import refundRoutes from './routes/refundRoutes.js';
import enquiryRoutes from './routes/enquiryRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import delhiveryRoutes from './routes/delhivery.routes.js';
import warehouseRoutes from './routes/warehouse.routes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import userRoutes from './routes/userRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();

// Validate critical environment variables
const requiredGlobalKeys = ['MONGODB_URI', 'JWT_SECRET'];
const missingGlobalKeys = requiredGlobalKeys.filter(key => !process.env[key]);
if (missingGlobalKeys.length > 0) {
  console.error(`\n[FATAL ERROR] Missing required environment variables: ${missingGlobalKeys.join(', ')}`);
  console.error('Shutting down server to prevent unpredictable behavior. Please provide these in your environment variables.\n');
  process.exit(1);
}

// Validate critical payment environment variables
if (process.env.NODE_ENV === 'production') {
  const requiredKeys = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'CLIENT_URL'];
  const missingKeys = requiredKeys.filter(key => !process.env[key]);
  if (missingKeys.length > 0) {
    console.error(`\n[FATAL ERROR] Missing Production Environment Variables: ${missingKeys.join(', ')}`);
    console.error('Shutting down server to prevent silent checkout failures. Please provide these in your environment variables.\n');
    process.exit(1);
  }
}

// Connect to MongoDB
try {
  console.log('Attempting to connect to MongoDB...');
  await connectDB();
} catch (error) {
  console.error('\n[FATAL ERROR] Server startup aborted because MongoDB connection failed.');
  console.error('Please verify your MONGODB_URI and database availability.\n');
  process.exit(1);
}

// Initialize Cron Jobs
import { initCronJobs } from './utils/cronJobs.js';
initCronJobs();

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading local static upload files in local frontend/admin images
}));
app.use(compression());
const allowedOrigins = [
  'http://localhost:3000', 
  'http://localhost:3001', 
  'http://localhost:7053',
  'http://127.0.0.1:3000', 
  'http://127.0.0.1:3001', 
  'http://127.0.0.1:7053',
  'https://maxglow.in',
  'https://www.maxglow.in',
  'https://maxglowon.com',
  'https://www.maxglowon.com'
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(...process.env.FRONTEND_URL.split(',').map(url => url.trim()));
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Folder for Local Uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Prevent caching for API routes (fixes live server stale data issues)
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// Apply global rate limiting to all API routes
app.use('/api', apiLimiter);

// Sanitize NoSQL injections
app.use(mongoSanitize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/delhivery', delhiveryRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/user', userRoutes);
// Health check route
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy';
  const statusCode = dbStatus === 'healthy' ? 200 : 503;
  res.status(statusCode).json({
    success: dbStatus === 'healthy',
    status: dbStatus === 'healthy' ? 'UP' : 'DOWN',
    timestamp: new Date(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    database: dbStatus,
    env: process.env.NODE_ENV || 'development'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'MaxGlow Enterprise E-commerce API Active' });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
let server;

if (process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH) {
  try {
    const options = {
      key: fs.readFileSync(process.env.SSL_KEY_PATH),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH)
    };
    server = https.createServer(options, app).listen(PORT, () => {
      console.log(`HTTPS Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start HTTPS server: ${error.message}`);
    console.log("Falling back to HTTP server...");
    server = app.listen(PORT, () => {
      console.log(`HTTP Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  }
} else {
  server = app.listen(PORT, () => {
    console.log(`HTTP Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}


// Graceful Shutdown Handler
const gracefulShutdown = () => {
  console.log('Initiating graceful shutdown...');
  server.close(async () => {
    console.log('HTTP/HTTPS server closed.');
    try {
      await mongoose.connection.close(false);
      console.log('MongoDB connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error closing MongoDB connection:', err);
      process.exit(1);
    }
  });
  
  // Force shutdown if it takes too long (10s)
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals (e.g., from Docker, PM2, or Ctrl+C)
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

process.on('unhandledRejection', (err) => {
  console.error(`[CRITICAL] Unhandled Rejection: ${err.message}`, err);
  // In production, unhandled rejections should trigger a clean restart via PM2
  // to avoid zombie memory states causing 502 Bad Gateway errors.
  gracefulShutdown();
});

process.on('uncaughtException', (err) => {
  console.error(`[CRITICAL] Uncaught Exception: ${err.message}`, err);
  // Immediately shut down on synchronous fatal errors so PM2 can revive
  process.exit(1);
});

// Trigger reload for nodemon configuration updates.

// Reload trigger 2

// Reload trigger 3

// Reload trigger 4

// Reload trigger 5

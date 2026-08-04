import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { createProduct } from './src/controllers/ProductController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const req = {
  body: {
    name: 'test-backend-fix',
    category: 'Dry Fruits',
    price: 99,
    description: 'test',
    unit: 'gm',
    unitValue: '250',
    stock: 10,
    batchNumber: 'BATCH-001'
  },
  user: { _id: new mongoose.Types.ObjectId() }
};

const res = {
  status: function(s) { this.statusCode = s; return this; },
  json: function(data) { console.log('API Response:', JSON.stringify(data, null, 2)); }
};

const next = (err) => { console.error('API Error:', err); };

async function runTest() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Testing createProduct with unitValue: 250');
  await createProduct(req, res, next);
  process.exit();
}
runTest();

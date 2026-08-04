import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const products = await Product.find().sort({_id: -1}).limit(5);
  console.log('Recent products:', products.map(p => ({
    name: p.name,
    unit: p.unit,
    unitValue: p.unitValue,
    createdAt: p.createdAt
  })));
  process.exit(0);
}
run();

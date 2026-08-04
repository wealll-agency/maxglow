import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const productSchema = new mongoose.Schema({
  name: { type: String },
  unit: { type: String },
  unitValue: { type: Number },
}, { strict: false });

const Product = mongoose.model('Product', productSchema);

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const p = await Product.findOne({ name: 'kautab' });
  console.log('Product in DB:', p ? { name: p.name, unit: p.unit, unitValue: p.unitValue } : 'Not found');
  process.exit(0);
}
check();

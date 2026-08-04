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
  await Product.updateOne({ name: 'kautab' }, { $set: { unitValue: 500, unit: 'gm' } });
  console.log('Updated kautab product to 500 gm');
  process.exit(0);
}
run();

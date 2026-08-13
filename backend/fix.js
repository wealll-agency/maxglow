import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import Product from './src/models/Product.js';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const p = await Product.findById('6a75b6e7e515ce24b94f6944');
  if(p) {
    p.images = [p.images[0]];
    await p.save();
    console.log('Fixed images for ' + p.name);
  }
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import Product from './src/models/Product.js';

const generateSlug = async (name, baseSlug = '', excludeId = null) => {
  let slug = baseSlug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  let isUnique = false;
  let counter = 1;
  let currentSlug = slug;
  
  while (!isUnique) {
    const existing = await Product.findOne(excludeId ? { slug: currentSlug, _id: { $ne: excludeId } } : { slug: currentSlug });
    if (!existing) {
      isUnique = true;
    } else {
      currentSlug = `${slug}-${counter}`;
      counter++;
    }
  }
  return currentSlug;
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const products = await Product.find({});
    console.log(`Found ${products.length} products total.`);
    
    let updated = 0;
    for (const p of products) {
      if (!p.slug) {
        p.slug = await generateSlug(p.name);
        await p.save();
        console.log(`Updated product ${p.name} with slug: ${p.slug}`);
        updated++;
      }
    }
    
    console.log(`Done! Updated ${updated} products.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();

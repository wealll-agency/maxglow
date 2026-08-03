import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const dbUri = process.env.MONGODB_URI;

if (!dbUri) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

const Product = mongoose.model('Product', new mongoose.Schema({
  images: [{ type: String }]
}, { strict: false }));

const SystemSetting = mongoose.model('SystemSetting', new mongoose.Schema({
  key: { type: String },
  value: { type: mongoose.Schema.Types.Mixed }
}, { strict: false }));

async function run() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(dbUri);
    console.log('Connected. Fetching all products...');

    const products = await Product.find({});
    console.log(`Found ${products.length} products. Scanning for absolute local/legacy image URLs...`);

    let updatedCount = 0;

    for (const product of products) {
      let updated = false;
      const originalImages = product.images || [];
      const cleanedImages = originalImages.map(img => {
        if (!img) return img;
        
        // Convert any absolute URL containing /uploads/ (localhost or old domains) to a relative path /uploads/...
        let cleaned = img;
        if (cleaned.includes('/uploads/')) {
          const idx = cleaned.indexOf('/uploads/');
          cleaned = cleaned.substring(idx);
          if (cleaned !== img) {
            updated = true;
          }
        }
        return cleaned;
      });

      if (updated) {
        await Product.updateOne({ _id: product._id }, { $set: { images: cleanedImages } });
        console.log(`Updated images for product: ${product.name}`);
        updatedCount++;
      }
    }

    console.log(`Successfully migrated ${updatedCount} products to relative image paths.`);

    const settings = await SystemSetting.find({});
    console.log(`Found ${settings.length} system settings. Scanning for absolute localhost/legacy URLs...`);
    let settingsUpdatedCount = 0;

    for (const setting of settings) {
      let val = setting.value;
      let updated = false;

      const cleanString = (str) => {
        if (typeof str === 'string' && str.includes('/uploads/')) {
          const idx = str.indexOf('/uploads/');
          const cleaned = str.substring(idx);
          if (cleaned !== str) {
            updated = true;
            return cleaned;
          }
        }
        return str;
      };

      if (Array.isArray(val)) {
        val = val.map(item => cleanString(item));
      } else if (typeof val === 'string') {
        val = cleanString(val);
      }

      if (updated) {
        await SystemSetting.updateOne({ _id: setting._id }, { $set: { value: val } });
        console.log(`Updated system setting: ${setting.key}`);
        settingsUpdatedCount++;
      }
    }
    console.log(`Successfully migrated ${settingsUpdatedCount} system settings to relative paths.`);

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

run();

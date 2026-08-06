import mongoose from 'mongoose';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import Product from '../src/models/Product.js';
import Category from '../src/models/Category.js';
import SystemSetting from '../src/models/SystemSetting.js';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const UPLOADS_DIR = path.join(__dirname, '../public/uploads');
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

async function uploadToS3(filename) {
  const filePath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(filePath)) return null;

  const ext = path.extname(filename).toLowerCase();
  let contentType = 'application/octet-stream';
  if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  else if (ext === '.png') contentType = 'image/png';
  else if (ext === '.webp') contentType = 'image/webp';
  else if (ext === '.mp4') contentType = 'video/mp4';

  const fileBuffer = fs.readFileSync(filePath);
  
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: fileBuffer,
      ContentType: contentType
    });
    await s3Client.send(command);
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${filename}`;
  } catch (error) {
    console.error(`Failed to upload ${filename}:`, error.message);
    return null;
  }
}

function getFilenameFromUrl(url) {
  if (!url) return null;
  if (url.includes('/uploads/')) {
    return url.split('/uploads/')[1];
  }
  return null;
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Migrate Products
    const products = await Product.find({});
    for (const product of products) {
      let changed = false;
      
      // Migrate main image
      const mainImgName = getFilenameFromUrl(product.image);
      if (mainImgName) {
        const s3Url = await uploadToS3(mainImgName);
        if (s3Url) {
          product.image = s3Url;
          changed = true;
        }
      }

      // Migrate images array
      if (product.images && product.images.length > 0) {
        for (let i = 0; i < product.images.length; i++) {
          const imgName = getFilenameFromUrl(product.images[i]);
          if (imgName) {
            const s3Url = await uploadToS3(imgName);
            if (s3Url) {
              product.images[i] = s3Url;
              changed = true;
            }
          }
        }
      }
      if (changed) {
        await product.save();
        console.log(`Updated Product: ${product.name}`);
      }
    }

    // Migrate Categories
    const categories = await Category.find({});
    for (const category of categories) {
      const imgName = getFilenameFromUrl(category.image);
      if (imgName) {
        const s3Url = await uploadToS3(imgName);
        if (s3Url) {
          category.image = s3Url;
          await category.save();
          console.log(`Updated Category: ${category.name}`);
        }
      }
    }

    // Migrate System Settings (Banners)
    const settings = await SystemSetting.find({});
    for (const setting of settings) {
      let changed = false;
      if (typeof setting.value === 'string') {
        const imgName = getFilenameFromUrl(setting.value);
        if (imgName) {
          const s3Url = await uploadToS3(imgName);
          if (s3Url) {
            setting.value = s3Url;
            changed = true;
          }
        }
      } else if (Array.isArray(setting.value)) {
        for (let i = 0; i < setting.value.length; i++) {
          if (typeof setting.value[i] === 'string') {
            const imgName = getFilenameFromUrl(setting.value[i]);
            if (imgName) {
              const s3Url = await uploadToS3(imgName);
              if (s3Url) {
                setting.value[i] = s3Url;
                changed = true;
              }
            }
          }
        }
      }
      
      if (changed) {
        setting.markModified('value');
        await setting.save();
        console.log(`Updated SystemSetting: ${setting.key}`);
      }
    }

    console.log('Migration Completed.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

run();

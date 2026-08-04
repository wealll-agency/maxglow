import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/maxglow';

mongoose.connect(dbUri).then(async () => {
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  
  const products = await Product.find({ discount: { $gt: 0 }, purchasePrice: { $gt: 0 } });
  let count = 0;
  
  for (const p of products) {
    if (p.get('purchasePrice') > p.get('price')) {
      await Product.updateOne({ _id: p._id }, { $set: { price: p.get('purchasePrice') } });
      count++;
    }
  }
  
  console.log('Fixed ' + count + ' products');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});

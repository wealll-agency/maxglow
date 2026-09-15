import mongoose from 'mongoose';
import Product from './src/models/Product.js';

mongoose.connect('mongodb://localhost:27017/maxglow', { useNewUrlParser: true, useUnifiedTopology: true })
.then(async () => {
  const query = { stock: { $lte: 0 } };
  const count = await Product.countDocuments(query);
  console.log('Out of stock count:', count);
  
  const allCount = await Product.countDocuments({});
  console.log('Total count:', allCount);
  
  process.exit(0);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});

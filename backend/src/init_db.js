import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/maxglow')
  .then(() => {
    console.log("Connected to MongoDB!");
    const initSchema = new mongoose.Schema({ msg: String });
    const InitModel = mongoose.model('Init', initSchema);
    return InitModel.create({ msg: 'Database created' });
  })
  .then(() => {
    console.log("maxGlow database created successfully!");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

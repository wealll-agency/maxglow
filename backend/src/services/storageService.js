import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize S3 Client if credentials exist
const isS3Configured = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_BUCKET_NAME;

let s3Client;
if (isS3Configured) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
}

// Multer Storage Configuration
// Using memory storage for ease of handling buffer uploads to S3 or disk
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit (for videos)
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|mp4|mov|avi/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (jpg, png, webp) and videos (mp4, mov, avi) are allowed'));
    }
  }
});

/**
 * Uploads a file buffer to S3 or saves locally
 * @param {Express.Multer.File} file 
 * @returns {Promise<string>} URL of the uploaded resource
 */
export const uploadFile = async (file) => {
  const fileName = `${Date.now()}_${path.basename(file.originalname).replace(/\s+/g, '_')}`;

  if (isS3Configured) {
    try {
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        // Remove ACL as some buckets block ACL controls
      });

      await s3Client.send(command);
      return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileName}`;
    } catch (error) {
      console.error(`S3 upload error, falling back to local storage: ${error.message}`);
    }
  }

  // Local storage fallback
  const uploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const localPath = path.join(uploadsDir, fileName);
  fs.writeFileSync(localPath, file.buffer);

  // Return relative path (client side will prepend host URL or route via proxy)
  return `/uploads/${fileName}`;
};

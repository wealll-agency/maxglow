import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serviceAccount;
try {
  const serviceAccountPath = path.join(__dirname, 'firebaseServiceAccount.json');
  const fileData = readFileSync(serviceAccountPath, 'utf8');
  serviceAccount = JSON.parse(fileData);
} catch (error) {
  console.error("Failed to load Firebase service account key.", error.message);
}

if (serviceAccount && getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount)
  });
  console.log('Firebase Admin initialized successfully');
}

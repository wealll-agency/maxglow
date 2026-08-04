import { S3Client, PutBucketPolicyCommand, PutPublicAccessBlockCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const bucketName = process.env.AWS_BUCKET_NAME;

async function makePublic() {
  try {
    // 1. Disable Block Public Access
    const pbaCommand = new PutPublicAccessBlockCommand({
      Bucket: bucketName,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: false,
        IgnorePublicAcls: false,
        BlockPublicPolicy: false,
        RestrictPublicBuckets: false
      }
    });
    console.log("Disabling Block Public Access...");
    await s3Client.send(pbaCommand);
    console.log("Block Public Access disabled.");

    // 2. Set Bucket Policy for public read
    const bucketPolicy = {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "PublicReadGetObject",
          Effect: "Allow",
          Principal: "*",
          Action: "s3:GetObject",
          Resource: `arn:aws:s3:::${bucketName}/*`
        }
      ]
    };
    const policyCommand = new PutBucketPolicyCommand({
      Bucket: bucketName,
      Policy: JSON.stringify(bucketPolicy)
    });
    console.log("Setting Bucket Policy...");
    await s3Client.send(policyCommand);
    console.log("Bucket Policy applied successfully. Images will be publicly accessible.");
  } catch (err) {
    console.error("Error making bucket public:", err);
  }
}

makePublic();

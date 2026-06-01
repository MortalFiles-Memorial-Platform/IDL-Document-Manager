import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const region = process.env.AWS_REGION;
const bucketName = process.env.AWS_S3_BUCKET;

const client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

export async function uploadBufferToS3(buffer: Buffer, key: string, contentType: string) {
  if (!bucketName) {
    throw new Error('AWS_S3_BUCKET is not configured');
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'private'
  });

  await client.send(command);
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}

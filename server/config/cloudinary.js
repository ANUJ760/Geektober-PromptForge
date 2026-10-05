import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

const cloud_name = process.env.CLOUDINARY_CLOUD_NAME || '';
const api_key = process.env.CLOUDINARY_API_KEY || '';
const api_secret = process.env.CLOUDINARY_API_SECRET || '';

const isConfigured = Boolean(
  cloud_name &&
  api_key &&
  api_secret &&
  !cloud_name.includes('your_cloud_name') &&
  !api_key.includes('your_api_key')
);

if (isConfigured) {
  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
    secure: true,
  });
  console.log('Cloudinary SDK configured successfully with live API keys.');
} else {
  console.log('Cloudinary credentials not set; running in local mock simulation mode.');
}

export function isCloudinaryConfigured() {
  return isConfigured;
}

export default cloudinary;

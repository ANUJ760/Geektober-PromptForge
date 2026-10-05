import { Readable } from 'stream';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';

/**
 * Uploads a Multer file buffer to Cloudinary using direct stream piping,
 * applying auto-format and quality optimization transformations.
 * Falls back to simulation URL if Cloudinary credentials are not configured.
 *
 * @param {Object} file - Multer file object containing buffer and mimetype
 * @returns {Promise<string>} - Resolves with secure CDN image URL
 */
export default async function getImageUrl(file) {
  if (!file || !file.buffer) {
    throw new Error('Image file buffer is required for upload');
  }

  // Fallback simulator for local testing or environments without Cloudinary keys
  if (!isCloudinaryConfigured()) {
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80';
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'promptforge/prompts',
        resource_type: 'image',
        transformation: [
          { width: 1600, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary stream upload error:', error);
          return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        }
        resolve(result.secure_url);
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
}
import { describe, it, expect } from 'vitest';
import getImageUrl from '../utils/getImageUrl.js';

describe('Cloudinary Media Upload Pipeline Suite', () => {
  it('should throw an error if no file or buffer is provided', async () => {
    await expect(getImageUrl(null)).rejects.toThrow('buffer is required');
    await expect(getImageUrl({})).rejects.toThrow('buffer is required');
  });

  it('should return a valid image URL when a file buffer is supplied', async () => {
    const mockFile = {
      buffer: Buffer.from('fake_image_bytes_content_for_test'),
      mimetype: 'image/jpeg',
      originalname: 'cyber_samurai.jpg',
    };

    const url = await getImageUrl(mockFile);

    expect(url).toBeDefined();
    expect(typeof url).toBe('string');
    expect(url).toMatch(/^https?:\/\//);
  });
});

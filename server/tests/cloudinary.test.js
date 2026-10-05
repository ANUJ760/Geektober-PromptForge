import { describe, it, expect } from 'vitest';
import getImageUrl from '../utils/getImageUrl.js';

describe('Cloudinary Media Upload Pipeline Suite', () => {
  it('should throw an error if no file or buffer is provided', async () => {
    await expect(getImageUrl(null)).rejects.toThrow('buffer is required');
    await expect(getImageUrl({})).rejects.toThrow('buffer is required');
  });

  it('should return a valid image URL when a file buffer is supplied', async () => {
    // Valid 1x1 transparent GIF buffer so both live Cloudinary validation and mock modes succeed
    const valid1x1GifBase64 = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    const mockFile = {
      buffer: Buffer.from(valid1x1GifBase64, 'base64'),
      mimetype: 'image/gif',
      originalname: 'cyber_samurai.gif',
    };

    const url = await getImageUrl(mockFile);

    expect(url).toBeDefined();
    expect(typeof url).toBe('string');
    expect(url).toMatch(/^https?:\/\//);
  });
});

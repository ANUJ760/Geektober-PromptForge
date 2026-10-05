import { describe, it, expect } from 'vitest';
import Prompt from '../models/prompt.js';

describe('Prompt Model & Content Masking Suite', () => {
  it('should generate masked previewPromptText automatically for paid prompts', async () => {
    const rawPromptText =
      'A breathtaking ultra-detailed cinematic portrait of a neon cyber samurai standing in rain, octane render 8k';

    const prompt = new Prompt({
      title: 'Cyber Samurai',
      description: 'Futuristic character',
      category: 'Concept Art',
      aiModel: 'Midjourney v6',
      imageUrl: 'https://example.com/sample.jpg',
      fullPromptText: rawPromptText,
      pricePaise: 49900, // ₹499
    });

    await prompt.validate();

    expect(prompt.previewPromptText).toBeDefined();
    expect(prompt.previewPromptText).toContain('[LOCKED');
    expect(prompt.previewPromptText.length).toBeLessThan(rawPromptText.length + 80);
    expect(prompt.fullPromptText).toBe(rawPromptText);
  });

  it('should keep previewPromptText identical to fullPromptText for free prompts', async () => {
    const freePromptText = 'A cute fluffy orange kitten sleeping on clouds';

    const prompt = new Prompt({
      title: 'Fluffy Kitten',
      description: 'Cute animal prompt',
      category: 'Illustration',
      aiModel: 'DALL-E 3',
      imageUrl: 'https://example.com/kitten.jpg',
      fullPromptText: freePromptText,
      pricePaise: 0, // Free
    });

    await prompt.validate();

    expect(prompt.previewPromptText).toBe(freePromptText);
    expect(prompt.pricePaise).toBe(0);
  });
});

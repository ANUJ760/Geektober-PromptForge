import Prompt from '../models/prompt.js';
import Users from '../models/user.js';
import Entitlement from '../models/entitlement.js';
import getImageUrl from '../utils/getImageUrl.js';
import { invalidateCache } from '../utils/redis.js';

export async function getTrendingPrompts(req, res) {
  try {
    const trendingPrompts = await Prompt.find({ isPublished: true })
      .select('-fullPromptText -negativePrompt -seed')
      .sort({ likes: -1 })
      .limit(9)
      .lean();

    // Map promptText to previewPromptText for unentitled display
    const sanitized = trendingPrompts.map((p) => ({
      ...p,
      promptText: p.previewPromptText || p.promptText,
    }));

    return res.status(200).json(sanitized);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch trending prompts', error: err.message });
  }
}

export async function getPromptById(req, res) {
  try {
    const { id } = req.params;
    const prompt = await Prompt.findById(id).lean();

    if (!prompt) {
      return res.status(404).json({ success: false, message: 'Prompt not found' });
    }

    const userId = req.user?.id;
    let isUnlocked = false;

    // Check unlocking conditions:
    // 1. Free prompt (pricePaise === 0)
    // 2. Requester is the original creator
    // 3. Requester holds a verified Entitlement
    if (prompt.pricePaise === 0) {
      isUnlocked = true;
    } else if (userId) {
      const isCreator = prompt.authorId && prompt.authorId.toString() === userId;
      if (isCreator) {
        isUnlocked = true;
      } else {
        const entitlement = await Entitlement.findOne({ userId, promptId: prompt._id });
        if (entitlement) {
          isUnlocked = true;
        }
      }
    }

    if (isUnlocked) {
      return res.status(200).json({
        ...prompt,
        promptText: prompt.fullPromptText || prompt.promptText,
        isUnlocked: true,
      });
    }

    // Masked response for locked prompts
    return res.status(200).json({
      ...prompt,
      fullPromptText: undefined,
      negativePrompt: undefined,
      seed: undefined,
      promptText: prompt.previewPromptText || `${prompt.title} - [LOCKED: Purchase to unlock complete prompt parameters]`,
      isUnlocked: false,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving prompt', error: err.message });
  }
}

export async function getAllPrompts(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit) || 9));
    const skip = (page - 1) * limit;

    const { q, category, aiModel, pricing, sort } = req.query;

    const queryFilter = { isPublished: true };

    if (category && category !== 'All') {
      queryFilter.category = category;
    }

    if (aiModel && aiModel !== 'All') {
      queryFilter.aiModel = aiModel;
    }

    if (pricing === 'free') {
      queryFilter.pricePaise = 0;
    } else if (pricing === 'paid') {
      queryFilter.pricePaise = { $gt: 0 };
    }

    if (q && q.trim()) {
      queryFilter.$or = [
        { title: { $regex: q.trim(), $options: 'i' } },
        { description: { $regex: q.trim(), $options: 'i' } },
        { previewPromptText: { $regex: q.trim(), $options: 'i' } },
      ];
    }

    let sortCriteria = { likes: -1, createdAt: -1 };
    if (sort === 'popular') {
      sortCriteria = { salesCount: -1, likes: -1 };
    } else if (sort === 'newest') {
      sortCriteria = { createdAt: -1 };
    } else if (sort === 'price_asc') {
      sortCriteria = { pricePaise: 1 };
    } else if (sort === 'price_desc') {
      sortCriteria = { pricePaise: -1 };
    }

    const [totalCount, prompts] = await Promise.all([
      Prompt.countDocuments(queryFilter),
      Prompt.find(queryFilter)
        .select('-fullPromptText -negativePrompt -seed')
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const sanitized = prompts.map((p) => ({
      ...p,
      promptText: p.previewPromptText || p.promptText,
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      success: true,
      data: sanitized,
      prompts: sanitized, // Legacy client support
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to query catalog', error: err.message });
  }
}

export async function getProfilePrompts(req, res) {
  try {
    const { id } = req.user;
    const user = await Users.findById(id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const profilePrompts = await Prompt.find({
      $or: [{ authorId: id }, { author: user.username }],
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(profilePrompts);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch profile prompts', error: err.message });
  }
}

export async function createPrompt(req, res) {
  const file = req.file;
  const { title, category, description, prompt, price, aiModel, negativePrompt, seed } = req.body;

  if (!file) {
    return res.status(400).json({ success: false, message: 'Preview image is required' });
  }

  if (!title || !category || !description || !prompt) {
    return res.status(400).json({ success: false, message: 'Title, category, description, and prompt are required' });
  }

  try {
    const userId = req.user.id;
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Authenticated user not found' });
    }

    const imageUrl = await getImageUrl(req.file);

    // Convert price to paise (e.g. ₹299 -> 29900 paise)
    const rawPrice = parseFloat(price) || 0;
    const pricePaise = Math.max(0, Math.round(rawPrice * 100));

    const sliceLength = Math.min(50, Math.floor(prompt.length * 0.35));
    const previewPromptText =
      pricePaise === 0
        ? prompt
        : `${prompt.slice(0, sliceLength)}... [LOCKED - Purchase to unlock complete prompt, model parameters, and seed]`;

    const newPrompt = new Prompt({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      aiModel: aiModel || 'Midjourney v6',
      promptText: prompt.trim(),
      fullPromptText: prompt.trim(),
      previewPromptText,
      negativePrompt: negativePrompt?.trim() || '',
      seed: seed?.trim() || '',
      pricePaise,
      author: user.username,
      authorId: user._id,
      imageUrl,
    });

    await newPrompt.save();

    // Invalidate cached catalog and trending queries
    invalidateCache('trending').catch(() => {});
    invalidateCache('catalog').catch(() => {});

    // Promote user role to creator if currently buyer
    if (user.role === 'buyer') {
      user.role = 'creator';
      await user.save();
    }

    return res.status(201).json({
      success: true,
      status: 200,
      promptId: newPrompt._id.toString(),
      prompt: newPrompt,
    });
  } catch (error) {
    console.error('Error saving prompt:', error);
    return res.status(500).json({ success: false, message: 'Error saving prompt', error: error.message });
  }
}

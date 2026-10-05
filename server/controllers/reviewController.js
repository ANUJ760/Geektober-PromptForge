import Review from '../models/review.js';
import Prompt from '../models/prompt.js';
import Entitlement from '../models/entitlement.js';

export async function createReview(req, res) {
  try {
    const userId = req.user.id;
    const { promptId, rating, comment } = req.body;

    if (!promptId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Prompt ID, rating (1-5), and review text are required' });
    }

    const numericRating = Number(rating);
    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5 stars' });
    }

    const prompt = await Prompt.findById(promptId);
    if (!prompt) {
      return res.status(404).json({ success: false, message: 'Prompt not found' });
    }

    // Verify buyer entitlement or creator ownership
    const isCreator = prompt.authorId && prompt.authorId.toString() === userId;
    const isFree = prompt.pricePaise === 0;
    const entitlement = await Entitlement.findOne({ userId, promptId });

    if (!isCreator && !isFree && !entitlement) {
      return res.status(403).json({
        success: false,
        message: 'Only verified purchasers can submit a review for this prompt',
      });
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({ userId, promptId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this prompt',
      });
    }

    const review = await Review.create({
      userId,
      promptId,
      rating: numericRating,
      comment: comment.trim(),
      orderId: entitlement?.orderId,
    });

    // Recalculate prompt average rating
    const allReviews = await Review.find({ promptId });
    const reviewsCount = allReviews.length;
    const sumRatings = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = Number((sumRatings / reviewsCount).toFixed(1));

    await Prompt.findByIdAndUpdate(promptId, {
      averageRating,
      reviewsCount,
    });

    await review.populate('userId', 'username avatarUrl');

    return res.status(201).json({
      success: true,
      message: 'Verified review submitted successfully',
      review,
      averageRating,
      reviewsCount,
    });
  } catch (err) {
    console.error('Review creation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create review', error: err.message });
  }
}

export async function getPromptReviews(req, res) {
  try {
    const { promptId } = req.params;
    const reviews = await Review.find({ promptId })
      .populate('userId', 'username avatarUrl')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      reviews,
      count: reviews.length,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch reviews', error: err.message });
  }
}

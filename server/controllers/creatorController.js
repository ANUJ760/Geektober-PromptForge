import Prompt from '../models/prompt.js';
import Order from '../models/order.js';
import Users from '../models/user.js';

export async function getCreatorAnalytics(req, res) {
  try {
    const creatorId = req.user.id;
    const user = await Users.findById(creatorId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Creator not found' });
    }

    // Find all prompts by this creator
    const prompts = await Prompt.find({
      $or: [{ authorId: creatorId }, { author: user.username }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const promptIds = prompts.map((p) => p._id);

    // Find all successful orders for this creator
    const orders = await Order.find({
      $or: [{ sellerId: creatorId }, { promptId: { $in: promptIds } }],
      status: 'PAID',
    })
      .populate('buyerId', 'username email avatarUrl')
      .populate('promptId', 'title category aiModel imageUrl')
      .sort({ paidAt: -1 })
      .lean();

    // Calculate aggregated metrics
    const totalPrompts = prompts.length;
    const totalSalesUnits = orders.length;

    const grossRevenuePaise = orders.reduce((sum, o) => sum + (o.amountPaise || 0), 0);
    const platformFeePaise = Math.round(grossRevenuePaise * 0.1); // 10% fee
    const netEarningsPaise = user.creatorBalancePaise || Math.round(grossRevenuePaise * 0.9);

    const totalLikes = prompts.reduce((sum, p) => sum + (p.likes || 0), 0);

    const ratedPrompts = prompts.filter((p) => p.reviewsCount > 0);
    const overallAverageRating =
      ratedPrompts.length > 0
        ? Number(
            (
              ratedPrompts.reduce((sum, p) => sum + p.averageRating, 0) / ratedPrompts.length
            ).toFixed(1)
          )
        : 0;

    // Breakdown per prompt
    const promptBreakdown = prompts.map((p) => {
      const promptOrders = orders.filter(
        (o) => o.promptId?._id?.toString() === p._id.toString() || o.promptId?.toString() === p._id.toString()
      );
      const promptRevenuePaise = promptOrders.reduce((sum, o) => sum + (o.amountPaise || 0), 0);

      return {
        id: p._id.toString(),
        title: p.title,
        category: p.category,
        aiModel: p.aiModel,
        imageUrl: p.imageUrl,
        pricePaise: p.pricePaise,
        salesCount: p.salesCount || promptOrders.length,
        likes: p.likes,
        averageRating: p.averageRating,
        reviewsCount: p.reviewsCount,
        revenuePaise: promptRevenuePaise,
        createdAt: p.createdAt,
      };
    });

    // Recent 10 sales
    const recentSales = orders.slice(0, 10).map((o) => ({
      orderId: o._id.toString(),
      amountPaise: o.amountPaise,
      buyerUsername: o.buyerId?.username || 'Verified Buyer',
      promptTitle: o.promptId?.title || 'Generative Prompt',
      paidAt: o.paidAt || o.createdAt,
    }));

    return res.status(200).json({
      success: true,
      analytics: {
        totalPrompts,
        totalSalesUnits,
        grossRevenuePaise,
        platformFeePaise,
        netEarningsPaise,
        totalLikes,
        overallAverageRating,
        balanceInr: (netEarningsPaise / 100).toFixed(2),
        grossRevenueInr: (grossRevenuePaise / 100).toFixed(2),
      },
      prompts: promptBreakdown,
      recentSales,
    });
  } catch (err) {
    console.error('Creator analytics error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate creator analytics', error: err.message });
  }
}

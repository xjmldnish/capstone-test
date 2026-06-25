const CartItemHistory = require('../models/CartItemHistory');
const Voucher = require('../models/Voucher');
const User = require('../models/User');

async function summary(req, res, next) {
  try {
    const redemptionStats = await CartItemHistory.aggregate([
      { $group: { _id: '$voucher', redemptions: { $sum: '$quantity' } } },
      { $sort: { redemptions: -1 } }
    ]);

    const vouchers = await Voucher.find().populate('category_id');
    const byId = new Map(redemptionStats.map(row => [String(row._id), row.redemptions]));
    const enriched = vouchers.map(voucher => ({
      id: voucher._id,
      title: voucher.title,
      category: voucher.category_id?.name,
      limit: voucher.limit,
      redeemedCount: byId.get(String(voucher._id)) || voucher.redeemedCount || 0,
      remaining: Math.max(voucher.limit - (byId.get(String(voucher._id)) || voucher.redeemedCount || 0), 0)
    }));

    const top = [...enriched].sort((a, b) => b.redeemedCount - a.redeemedCount).slice(0, 5);
    const low = [...enriched].sort((a, b) => a.redeemedCount - b.redeemedCount).slice(0, 5);

    const trends = await CartItemHistory.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          redemptions: { $sum: '$quantity' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // User stats
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalRedemptions = await CartItemHistory.aggregate([
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);

    // Top users by redemption count
    const topUsers = await CartItemHistory.aggregate([
      { $group: { _id: '$user', totalRedemptions: { $sum: '$quantity' } } },
      { $sort: { totalRedemptions: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userInfo' } },
      { $unwind: '$userInfo' },
      { $project: { username: '$userInfo.username', email: '$userInfo.email', totalRedemptions: 1 } }
    ]);

    res.json({
      top,
      low,
      trends,
      stats: {
        totalUsers,
        totalRedemptions: totalRedemptions[0]?.total || 0,
        topUsers
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { summary };

const Voucher = require('../models/Voucher');

function publicVoucherFilter() {
  return {
    isActive: true,
    expiryDate: { $gte: new Date() },
    $expr: { $lt: ['$redeemedCount', '$limit'] }
  };
}

async function listVouchers(req, res, next) {
  try {
    const showPublicOnly = req.query.publicOnly === 'true' || req.user?.role !== 'admin';
    const filter = showPublicOnly ? publicVoucherFilter() : {};
    if (req.query.category) filter.category_id = req.query.category;
    if (req.query.search) filter.title = { $regex: req.query.search, $options: 'i' };

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const [vouchers, total] = await Promise.all([
      Voucher.find(filter).populate('category_id').sort('-createdAt').skip(skip).limit(limit),
      Voucher.countDocuments(filter)
    ]);

    res.json({
      vouchers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getVoucher(req, res, next) {
  try {
    const voucher = await Voucher.findById(req.params.id).populate('category_id');
    if (!voucher) return res.status(404).json({ message: 'Voucher not found.' });
    res.json(voucher);
  } catch (err) {
    next(err);
  }
}

async function createVoucher(req, res, next) {
  try {
    const voucher = await Voucher.create(req.body);
    await voucher.populate('category_id');
    res.status(201).json(voucher);
  } catch (err) {
    next(err);
  }
}

async function updateVoucher(req, res, next) {
  try {
    const voucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('category_id');
    if (!voucher) return res.status(404).json({ message: 'Voucher not found.' });
    res.json(voucher);
  } catch (err) {
    next(err);
  }
}

async function deleteVoucher(req, res, next) {
  try {
    const voucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!voucher) return res.status(404).json({ message: 'Voucher not found.' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { listVouchers, getVoucher, createVoucher, updateVoucher, deleteVoucher };

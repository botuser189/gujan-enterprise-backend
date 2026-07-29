const express = require('express');
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const Quote = require('../models/Quote');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalBrands = await Brand.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalQuotes = await Quote.countDocuments();
    const newQuotes = await Quote.countDocuments({ status: 'New' });
    const featuredProducts = await Product.countDocuments({ featured: true });
    const pageSize = Number(req.query.pageSize) || 5;
    const page = Number(req.query.page) || 1;
    const productCount = await Product.countDocuments();

    const recentProducts = await Product.find({})
      .populate('brandId', 'name')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));
      

    const recentQuotes = await Quote.find({}).sort({ createdAt: -1 }).limit(5);

    res.json({
      totalProducts,
      totalBrands,
      totalCategories,
      totalQuotes,
      newQuotes,
      featuredProducts,
      recentProducts,
      recentQuotes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

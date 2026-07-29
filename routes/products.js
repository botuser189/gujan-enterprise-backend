const express = require('express');
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 12;
    const page = Number(req.query.page) || 1;
    const { search, category, brand, featured, sort } = req.query;

    const filter = { status: 'published' };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { name: searchRegex },
        { sku: searchRegex },
        { shortDescription: searchRegex }
      ];
    }
    if (category) filter.categoryId = category;
    if (brand) filter.brandId = brand;
    if (featured === 'true') filter.featured = true;

    let sortOption = { createdAt: -1 };
    if (sort === 'name-asc') sortOption = { name: 1 };
    else if (sort === 'name-desc') sortOption = { name: -1 };
    else if (sort === 'brand') sortOption = { brandId: 1 };
    else if (sort === 'category') sortOption = { categoryId: 1 };

    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('brandId', 'name logo')
      .populate('categoryId', 'name slug')
      .sort(sortOption)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all products (admin)
// @route   GET /api/products/admin
// @access  Private
router.get('/admin/all', protect, async (req, res) => {
    try {
      const pageSize = Number(req.query.pageSize) || 10;
      const page = Number(req.query.page) || 1;
      const count = await Product.countDocuments({});
      const products = await Product.find({})
      .populate('brandId', 'name')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));
      res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      count
    });
     } catch (error) {

    res.status(500).json({
      message: error.message
    });
      }
});

// @desc    Get single product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
router.get('/slug/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, status: 'published' })
      .populate('brandId', 'name logo website description')
      .populate('categoryId', 'name slug');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
router.get('/:id/related', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let related = await Product.find({
      _id: { $ne: product._id },
      categoryId: product.categoryId,
      brandId: product.brandId,
      status: 'published'
    }).limit(4).populate('brandId', 'name').populate('categoryId', 'name');

    if (related.length < 4) {
      const more = await Product.find({
        _id: { $ne: product._id },
        categoryId: product.categoryId,
        status: 'published'
      }).limit(4 - related.length).populate('brandId', 'name').populate('categoryId', 'name');
      related = [...related, ...more];
    }

    if (related.length < 4) {
      const featured = await Product.find({
        _id: { $ne: product._id },
        featured: true,
        status: 'published'
      }).limit(4 - related.length).populate('brandId', 'name').populate('categoryId', 'name');
      related = [...related, ...featured];
    }

    res.json(related.slice(0, 4));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('brandId', 'name logo website description')
      .populate('categoryId', 'name slug');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create product
// @route   POST /api/products
// @access  Private
router.post('/', protect, upload.array('images', 8), async (req, res) => {
  try {
    const {
      name, brandId, categoryId, sku, description, shortDescription,
      brochure, availability, status, featured, specifications
    } = req.body;

    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    let specs = [];
    if (specifications) {
      try { specs = JSON.parse(specifications); } catch (e) { specs = []; }
    }

    const product = await Product.create({
      name,
      brandId,
      categoryId,
      sku,
      description: description || '',
      shortDescription: shortDescription || '',
      specifications: specs,
      brochure: brochure || '',
      availability: availability || 'On Request',
      status: status || 'published',
      featured: featured === 'true' || featured === true,
      images
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
router.put('/:id', protect, upload.array('images', 8), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const {
      name, brandId, categoryId, sku, description, shortDescription,
      brochure, availability, status, featured, specifications, existingImages
    } = req.body;

    if (name) product.name = name;
    if (brandId) product.brandId = brandId;
    if (categoryId) product.categoryId = categoryId;
    if (sku) product.sku = sku;
    if (description !== undefined) product.description = description;
    if (shortDescription !== undefined) product.shortDescription = shortDescription;
    if (brochure !== undefined) product.brochure = brochure;
    if (availability) product.availability = availability;
    if (status) product.status = status;
    if (featured !== undefined) product.featured = featured === 'true' || featured === true;
    if (specifications) {
      try { product.specifications = JSON.parse(specifications); } catch (e) { /* keep */ }
    }

    let keptImages = [];
    if (existingImages) {
      try { keptImages = JSON.parse(existingImages); } catch (e) { keptImages = []; }
    }
    const newImages = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    product.images = [...keptImages, ...newImages];

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

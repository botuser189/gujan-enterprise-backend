const express = require('express');
const Brand = require('../models/Brand');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, featured } = req.query;
    const filter = {};
    if (status) filter.status = status;
    else filter.status = 'active';
    if (featured === 'true') filter.featured = true;
    const brands = await Brand.find(filter).sort({ name: 1 });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single brand
// @route   GET /api/brands/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create brand
// @route   POST /api/brands
// @access  Private
router.post('/', protect, upload.single('logo'), async (req, res) => {
  try {
    const { name, description, website, featured, status } = req.body;
    const logo = req.file ? `/uploads/${req.file.filename}` : '';
    const brand = await Brand.create({
      name,
      description,
      website,
      featured: featured === 'true' || featured === true,
      status: status || 'active',
      logo
    });
    res.status(201).json(brand);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update brand
// @route   PUT /api/brands/:id
// @access  Private
router.put('/:id', protect, upload.single('logo'), async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    const { name, description, website, featured, status } = req.body;
    if (name) brand.name = name;
    if (description !== undefined) brand.description = description;
    if (website !== undefined) brand.website = website;
    if (featured !== undefined) brand.featured = featured === 'true' || featured === true;
    if (status) brand.status = status;
    if (req.file) brand.logo = `/uploads/${req.file.filename}`;
    const updated = await brand.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete brand
// @route   DELETE /api/brands/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    await brand.deleteOne();
    res.json({ message: 'Brand removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

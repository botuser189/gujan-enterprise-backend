const express = require('express');
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, featured } = req.query;
    const filter = {};
    if (status) filter.status = status;
    else filter.status = 'active';
    if (featured === 'true') filter.featured = true;
    const categories = await Category.find(filter).sort({ sortOrder: 1, name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { name, description, icon, featured, status, sortOrder, parent } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';
    const category = await Category.create({
      name,
      description,
      icon,
      featured: featured === 'true' || featured === true,
      status: status || 'active',
      sortOrder: sortOrder ? Number(sortOrder) : 0,
      parent: parent || null,
      image
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    const { name, description, icon, featured, status, sortOrder, parent } = req.body;
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (featured !== undefined) category.featured = featured === 'true' || featured === true;
    if (status) category.status = status;
    if (sortOrder !== undefined) category.sortOrder = Number(sortOrder);
    if (parent !== undefined) category.parent = parent || null;
    if (req.file) category.image = `/uploads/${req.file.filename}`;
    const updated = await category.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    await category.deleteOne();
    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

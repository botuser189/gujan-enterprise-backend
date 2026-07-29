const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  sku: { type: String, required: true, unique: true, trim: true },
  images: { type: [String], default: [] },
  description: { type: String, default: '' },
  shortDescription: { type: String, default: '' },
  specifications: [{
    key: { type: String, required: true },
    value: { type: String, required: true }
  }],
  brochure: { type: String, default: '' },
  availability: { type: String, enum: ['In Stock', 'Out of Stock', 'On Request'], default: 'On Request' },
  status: { type: String, enum: ['published', 'hidden'], default: 'published' },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ProductSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  this.updatedAt = Date.now();
  next();
});

ProductSchema.index({ name: 'text', sku: 'text', shortDescription: 'text' });

module.exports = mongoose.model('Product', ProductSchema);

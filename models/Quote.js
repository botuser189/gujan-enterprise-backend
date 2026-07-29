const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
  customerName: { type: String, required: true, trim: true },
  companyName: { type: String, default: '', trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  location: { type: String, default: '', trim: true },
  selectedProducts: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    brand: String,
    sku: String,
    quantity: { type: Number, default: 1 }
  }],
  message: { type: String, default: '' },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Quoted', 'Completed', 'Cancelled'],
    default: 'New'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quote', QuoteSchema);

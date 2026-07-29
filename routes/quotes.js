const express = require('express');
const axios = require("axios");
const Quote = require('../models/Quote');
const { protect } = require('../middleware/auth');
const sendQuoteMail = require("../config/mailer");

const router = express.Router();

// @desc    Submit a quote request
// @route   POST /api/quotes
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      companyName,
      phone,
      email,
      location,
      selectedProducts,
      message,
      turnstileToken 
    } = req.body;

    if (!customerName || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, and email are required'
      });
    }

    // Save quote to MongoDB
    const verify = await axios.post(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: turnstileToken
      }),
      {
        headers: {
          "Content-Type":
          "application/x-www-form-urlencoded"
        }
      }
    );
    if (!verify.data.success) {
      return res.status(400).json({
        success: false,
        message: "Robot verification failed."
      });
    }
    const quote = await Quote.create({
      customerName,
      companyName,
      phone,
      email,
      location,
      selectedProducts: selectedProducts || [],
      message: message || ''
    });

    // Try sending email (don't fail the request if email has an issue)
    try {
      await sendQuoteMail(quote);
      console.log(`Quote email sent successfully for ${quote.email}`);
    } catch (mailError) {
      console.error('Email sending failed:', mailError);
    }

    res.status(201).json({
      success: true,
      message: 'Quote submitted successfully.',
      quote
    });

  } catch (error) {
    console.error('Quote submission error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong.'
    });
  }
});

// @desc    Get all quotes (admin)
// @route   GET /api/quotes
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.page) || 1;
    const { status } = req.query;
    const filter = {};
    if (status) {
      filter.status = status;
    }
    const count = await Quote.countDocuments(filter);
    const quotes = await Quote.find(filter)
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      quotes,
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

// @desc    Get single quote
// @route   GET /api/quotes/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ message: 'Quote not found' });
    res.json(quote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update quote status
// @route   PUT /api/quotes/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ message: 'Quote not found' });
    const { status, customerName, companyName, phone, email, location, message } = req.body;
    if (status) quote.status = status;
    if (customerName) quote.customerName = customerName;
    if (companyName !== undefined) quote.companyName = companyName;
    if (phone) quote.phone = phone;
    if (email) quote.email = email;
    if (location !== undefined) quote.location = location;
    if (message !== undefined) quote.message = message;
    const updated = await quote.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete quote
// @route   DELETE /api/quotes/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ message: 'Quote not found' });
    await quote.deleteOne();
    res.json({ message: 'Quote removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

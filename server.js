const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const brandRoutes = require('./routes/brands');
const categoryRoutes = require('./routes/categories');
const quoteRoutes = require('./routes/quotes');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
// CORS — allow your frontend domain(s) when deploying separately
// Set FRONTEND_URL in .env to restrict origins in production
const corsOrigin = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(s => s.trim())
  : true;
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize());
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000
});
app.use('/api/', limiter);

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Gujan Enterprises API is running' });
});

// Serve frontend static files in production
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// SEO files
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nSitemap: ${req.protocol}://${req.get('host')}/sitemap.xml`);
});

app.get('/sitemap.xml', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const products = await Product.find({ status: 'published' }).select('slug updatedAt');
    const base = `${req.protocol}://${req.get('host')}`;
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    const pages = ['', 'products', 'brands', 'categories', 'about', 'services', 'contact', 'request-quote'];
    pages.forEach(p => {
      xml += `  <url><loc>${base}/${p}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
    });
    products.forEach(p => {
      xml += `  <url><loc>${base}/product/${p.slug}</loc><lastmod>${p.updatedAt.toISOString()}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>\n`;
    });
    xml += '</urlset>';
    res.type('application/xml');
    res.send(xml);
  } catch (error) {
    res.status(500).send('Error generating sitemap');
  }
});

// SPA fallback - serve index.html for all non-API, non-file routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
    return next();
  }
  const filePath = path.join(frontendPath, req.path);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

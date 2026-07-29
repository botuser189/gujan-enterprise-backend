require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Admin = require('../models/Admin');

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await Product.deleteMany();
    await Brand.deleteMany();
    await Category.deleteMany();
    await Admin.deleteMany();

    // Clear old/stale collection indexes to prevent duplicate key constraint conflicts
    try {
      await Brand.collection.dropIndexes();
      await Category.collection.dropIndexes();
      await Product.collection.dropIndexes();
    } catch (e) {
      // Safe to ignore if collections/indexes didn't exist
    }

    // Create Admin
    const admin = await Admin.create({
      name: 'Gujan Admin',
      email: process.env.ADMIN_EMAIL || 'admin@gujanenterprises.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@2024',
      role: 'superadmin'
    });
    console.log('Admin created:', admin.email);

    // FIX: Use Brand.create() instead of Brand.insertMany() so pre('save') hooks generate slugs
    const brands = await Brand.create([
      { name: 'HP', description: 'Hewlett-Packard - Computers, printers, and IT solutions', website: 'https://www.hp.com', featured: true, status: 'active' },
      { name: 'Dell', description: 'Dell Technologies - Laptops, desktops, and enterprise solutions', website: 'https://www.dell.com', featured: true, status: 'active' },
      { name: 'Lenovo', description: 'Lenovo - PCs, laptops, and data center solutions', website: 'https://www.lenovo.com', featured: true, status: 'active' },
      { name: 'Canon', description: 'Canon - Printers, cameras, and imaging solutions', website: 'https://www.canon.com', featured: true, status: 'active' },
      { name: 'Epson', description: 'Epson - Printers, projectors, and visual communications', website: 'https://www.epson.com', featured: true, status: 'active' },
      { name: 'Brother', description: 'Brother - Printers, labelers, and sewing machines', website: 'https://www.brother.com', featured: false, status: 'active' },
      { name: 'Logitech', description: 'Logitech - Peripherals and audio devices', website: 'https://www.logitech.com', featured: true, status: 'active' },
      { name: 'JBL', description: 'JBL - Audio systems and speakers', website: 'https://www.jbl.com', featured: false, status: 'active' },
      { name: 'D-Link', description: 'D-Link - Networking and communication solutions', website: 'https://www.dlink.com', featured: false, status: 'active' },
      { name: 'Hikvision', description: 'Hikvision - Surveillance and security solutions', website: 'https://www.hikvision.com', featured: false, status: 'active' },
      { name: 'APC', description: 'APC by Schneider Electric - Power and UPS solutions', website: 'https://www.apc.com', featured: false, status: 'active' },
      { name: 'Polycom', description: 'Polycom - Conference and communication solutions', website: 'https://www.poly.com', featured: false, status: 'active' }
    ]);
    console.log(`${brands.length} brands created`);

    // FIX: Use Category.create() instead of Category.insertMany() so pre('save') hooks generate slugs
    const categories = await Category.create([
      { name: 'Computer & Laptop', description: 'Business laptops, desktop computers, workstations, and accessories', icon: 'laptop', featured: true, sortOrder: 1, status: 'active' },
      { name: 'Sound Systems', description: 'Speakers, amplifiers, PA systems, and conference audio', icon: 'speaker', featured: true, sortOrder: 2, status: 'active' },
      { name: 'Communication', description: 'IP phones, intercoms, and video conferencing solutions', icon: 'phone', featured: true, sortOrder: 3, status: 'active' },
      { name: 'Printing', description: 'Printers, ink cartridges, toners, and printer accessories', icon: 'printer', featured: true, sortOrder: 4, status: 'active' },
      { name: 'Audio Visual', description: 'Projectors, interactive displays, and LED screens', icon: 'monitor', featured: true, sortOrder: 5, status: 'active' },
      { name: '3D Printing', description: 'Industrial and desktop 3D printers, filaments, and materials', icon: 'cube', featured: true, sortOrder: 6, status: 'active' },
      { name: 'Spare Parts', description: 'Computer parts, printer parts, and electronic components', icon: 'wrench', featured: false, sortOrder: 7, status: 'active' }
    ]);
    console.log(`${categories.length} categories created`);

    const hp = brands.find(b => b.name === 'HP');
    const dell = brands.find(b => b.name === 'Dell');
    const lenovo = brands.find(b => b.name === 'Lenovo');
    const canon = brands.find(b => b.name === 'Canon');
    const epson = brands.find(b => b.name === 'Epson');
    const brother = brands.find(b => b.name === 'Brother');
    const logitech = brands.find(b => b.name === 'Logitech');
    const jbl = brands.find(b => b.name === 'JBL');
    const dlink = brands.find(b => b.name === 'D-Link');
    const hikvision = brands.find(b => b.name === 'Hikvision');
    const apc = brands.find(b => b.name === 'APC');
    const polycom = brands.find(b => b.name === 'Polycom');

    const computerCat = categories.find(c => c.name === 'Computer & Laptop');
    const soundCat = categories.find(c => c.name === 'Sound Systems');
    const commCat = categories.find(c => c.name === 'Communication');
    const printingCat = categories.find(c => c.name === 'Printing');
    const avCat = categories.find(c => c.name === 'Audio Visual');
    const print3dCat = categories.find(c => c.name === '3D Printing');
    const spareCat = categories.find(c => c.name === 'Spare Parts');

    // Create Products
    const products = await Product.create([
      {
        name: 'HP ProBook 440 G11',
        brandId: hp._id,
        categoryId: computerCat._id,
        sku: 'HP-PB440G11',
        shortDescription: '14-inch business laptop with Intel Core i7, 16GB RAM, and 512GB SSD',
        description: 'The HP ProBook 440 G11 is a powerful business laptop designed for productivity. Featuring the latest Intel Core i7 processor, 16GB of RAM, and a fast 512GB SSD, it handles demanding workloads with ease. The 14-inch display offers crisp visuals, while the durable build ensures reliability on the go.',
        specifications: [
          { key: 'Processor', value: 'Intel Core i7-1355U' },
          { key: 'RAM', value: '16GB DDR4' },
          { key: 'Storage', value: '512GB NVMe SSD' },
          { key: 'Display', value: '14" FHD IPS' },
          { key: 'Graphics', value: 'Intel Iris Xe' },
          { key: 'OS', value: 'Windows 11 Pro' },
          { key: 'Weight', value: '1.38 kg' }
        ],
        availability: 'In Stock',
        featured: true,
        status: 'published'
      },
      {
        name: 'Dell Latitude 5450',
        brandId: dell._id,
        categoryId: computerCat._id,
        sku: 'DL-LAT5450',
        shortDescription: '14-inch business laptop with Intel Core i5, 8GB RAM, and 256GB SSD',
        description: 'The Dell Latitude 5450 combines performance and portability for business professionals. With Intel Core i5 processing, 8GB RAM, and a 256GB SSD, it delivers reliable performance for everyday business tasks.',
        specifications: [
          { key: 'Processor', value: 'Intel Core i5-1335U' },
          { key: 'RAM', value: '8GB DDR4' },
          { key: 'Storage', value: '256GB NVMe SSD' },
          { key: 'Display', value: '14" FHD' },
          { key: 'OS', value: 'Windows 11 Pro' }
        ],
        availability: 'In Stock',
        featured: true,
        status: 'published'
      },
      {
        name: 'Lenovo ThinkPad E14 Gen 5',
        brandId: lenovo._id,
        categoryId: computerCat._id,
        sku: 'LN-TP14G5',
        shortDescription: '14-inch business laptop with AMD Ryzen 7, 16GB RAM, and 512GB SSD',
        description: 'The Lenovo ThinkPad E14 Gen 5 offers exceptional performance with AMD Ryzen 7 processing, legendary ThinkPad durability, and a premium typing experience.',
        specifications: [
          { key: 'Processor', value: 'AMD Ryzen 7 7730U' },
          { key: 'RAM', value: '16GB DDR4' },
          { key: 'Storage', value: '512GB NVMe SSD' },
          { key: 'Display', value: '14" FHD IPS' },
          { key: 'OS', value: 'Windows 11 Pro' }
        ],
        availability: 'In Stock',
        featured: true,
        status: 'published'
      },
      {
        name: 'HP EliteDesk 800 G9',
        brandId: hp._id,
        categoryId: computerCat._id,
        sku: 'HP-ED800G9',
        shortDescription: 'Compact desktop PC with Intel Core i7, 16GB RAM, and 512GB SSD',
        description: 'The HP EliteDesk 800 G9 is a powerful desktop computer designed for business environments, offering high performance in a compact form factor.',
        specifications: [
          { key: 'Processor', value: 'Intel Core i7-13700' },
          { key: 'RAM', value: '16GB DDR5' },
          { key: 'Storage', value: '512GB NVMe SSD' },
          { key: 'Form Factor', value: 'Small Form Factor' },
          { key: 'OS', value: 'Windows 11 Pro' }
        ],
        availability: 'On Request',
        featured: false,
        status: 'published'
      },
      {
        name: 'HP Z2 Mini G9 Workstation',
        brandId: hp._id,
        categoryId: computerCat._id,
        sku: 'HP-Z2MINIG9',
        shortDescription: 'Mini workstation with Intel Xeon, 32GB RAM, and 1TB SSD',
        description: 'The HP Z2 Mini G9 delivers workstation-class performance in an ultra-compact design, perfect for CAD, 3D rendering, and content creation.',
        specifications: [
          { key: 'Processor', value: 'Intel Xeon W-1370' },
          { key: 'RAM', value: '32GB DDR5' },
          { key: 'Storage', value: '1TB NVMe SSD' },
          { key: 'Graphics', value: 'NVIDIA T1000' },
          { key: 'Form Factor', value: 'Mini' }
        ],
        availability: 'On Request',
        featured: true,
        status: 'published'
      },
      {
        name: 'Canon imageCLASS LBP226dw',
        brandId: canon._id,
        categoryId: printingCat._id,
        sku: 'CN-LBP226DW',
        shortDescription: 'Monochrome laser printer with wireless connectivity and fast printing',
        description: 'The Canon imageCLASS LBP226dw is a high-speed monochrome laser printer ideal for business environments, offering wireless connectivity and professional-quality output.',
        specifications: [
          { key: 'Type', value: 'Monochrome Laser' },
          { key: 'Print Speed', value: '38 ppm' },
          { key: 'Resolution', value: '600 x 600 dpi' },
          { key: 'Connectivity', value: 'Wi-Fi, USB, Ethernet' },
          { key: 'Duplex', value: 'Automatic' }
        ],
        availability: 'In Stock',
        featured: true,
        status: 'published'
      },
      {
        name: 'Epson EcoTank L3250',
        brandId: epson._id,
        categoryId: printingCat._id,
        sku: 'EP-L3250',
        shortDescription: 'Ink tank printer with Wi-Fi, low-cost printing, and high page yield',
        description: 'The Epson EcoTank L3250 offers ultra-low-cost printing with its high-capacity ink tank system. Perfect for home and small office use.',
        specifications: [
          { key: 'Type', value: 'Ink Tank' },
          { key: 'Function', value: 'Print, Scan, Copy' },
          { key: 'Print Speed', value: '10 ppm (B/W), 5 ppm (Color)' },
          { key: 'Connectivity', value: 'Wi-Fi, USB' },
          { key: 'Resolution', value: '5760 x 1440 dpi' }
        ],
        availability: 'In Stock',
        featured: true,
        status: 'published'
      },
      {
        name: 'Brother HL-L2351DW',
        brandId: brother._id,
        categoryId: printingCat._id,
        sku: 'BR-HLL2351DW',
        shortDescription: 'Compact monochrome laser printer with wireless and duplex printing',
        description: 'The Brother HL-L2351DW is a compact and affordable monochrome laser printer with wireless connectivity and automatic duplex printing.',
        specifications: [
          { key: 'Type', value: 'Monochrome Laser' },
          { key: 'Print Speed', value: '30 ppm' },
          { key: 'Connectivity', value: 'Wi-Fi, USB' },
          { key: 'Duplex', value: 'Automatic' }
        ],
        availability: 'In Stock',
        featured: false,
        status: 'published'
      },
      {
        name: 'Logitech Rally Bar',
        brandId: logitech._id,
        categoryId: commCat._id,
        sku: 'LG-RALLYBAR',
        shortDescription: 'All-in-one video conferencing system with AI-powered camera and audio',
        description: 'The Logitech Rally Bar is an all-in-one video conferencing solution with AI-powered camera, premium audio, and easy deployment for medium to large rooms.',
        specifications: [
          { key: 'Camera', value: '4K with AI Framing' },
          { key: 'Audio', value: 'Integrated Speakers and Mics' },
          { key: 'Connectivity', value: 'USB, Bluetooth' },
          { key: 'Room Size', value: 'Medium to Large' }
        ],
        availability: 'On Request',
        featured: true,
        status: 'published'
      },
      {
        name: 'Polycom Studio X50',
        brandId: polycom._id,
        categoryId: commCat._id,
        sku: 'PL-STUDIOX50',
        shortDescription: 'All-in-one video bar with 4K camera and noise-blocking technology',
        description: 'The Polycom Studio X50 is a compact all-in-one video bar that brings premium video conferencing to huddle and small rooms.',
        specifications: [
          { key: 'Camera', value: '4K UHD' },
          { key: 'Audio', value: 'Stereo speakers with noise blocking' },
          { key: 'Connectivity', value: 'USB, HDMI, Ethernet' },
          { key: 'Room Size', value: 'Small to Medium' }
        ],
        availability: 'On Request',
        featured: false,
        status: 'published'
      },
      {
        name: 'JBL PartyBox 310',
        brandId: jbl._id,
        categoryId: soundCat._id,
        sku: 'JBL-PB310',
        shortDescription: 'Portable party speaker with powerful sound, dynamic lighting, and Bluetooth',
        description: 'The JBL PartyBox 310 delivers powerful, immersive sound with dynamic lighting effects. Perfect for events and parties with its portable design.',
        specifications: [
          { key: 'Power Output', value: '240W' },
          { key: 'Connectivity', value: 'Bluetooth, USB, AUX' },
          { key: 'Battery Life', value: 'Up to 18 hours' },
          { key: 'Water Resistance', value: 'IPX4' }
        ],
        availability: 'In Stock',
        featured: true,
        status: 'published'
      },
      {
        name: 'Logitech Z906 Speaker System',
        brandId: logitech._id,
        categoryId: soundCat._id,
        sku: 'LG-Z906',
        shortDescription: '5.1 surround sound speaker system with 500W peak power',
        description: 'The Logitech Z906 delivers theater-quality 5.1 surround sound with 500 watts of peak power. THX certified for premium audio performance.',
        specifications: [
          { key: 'Configuration', value: '5.1 Channel' },
          { key: 'Power', value: '500W Peak' },
          { key: 'Connectivity', value: 'Optical, Coaxial, RCA, 3.5mm' },
          { key: 'Certification', value: 'THX Certified' }
        ],
        availability: 'In Stock',
        featured: false,
        status: 'published'
      },
      {
        name: 'Epson EB-L635U Projector',
        brandId: epson._id,
        categoryId: avCat._id,
        sku: 'EP-EBL635U',
        shortDescription: 'Laser projector with 4K enhancement, 6,000 lumens brightness',
        description: 'The Epson EB-L635U is a powerful laser projector with 4K enhancement technology and 6,000 lumens of brightness, ideal for large venues and presentations.',
        specifications: [
          { key: 'Resolution', value: 'WUXGA with 4K Enhancement' },
          { key: 'Brightness', value: '6,000 Lumens' },
          { key: 'Light Source', value: 'Laser' },
          { key: 'Lamp Life', value: '20,000 hours' },
          { key: 'Connectivity', value: 'HDMI, HDBaseT, USB' }
        ],
        availability: 'On Request',
        featured: true,
        status: 'published'
      },
      {
        name: 'HP Z2 G9 Interactive Display',
        brandId: hp._id,
        categoryId: avCat._id,
        sku: 'HP-Z2ID75',
        shortDescription: '75-inch 4K interactive flat panel display with touch capability',
        description: 'The HP Interactive Display is a 75-inch 4K touch-enabled flat panel designed for collaborative meetings and presentations.',
        specifications: [
          { key: 'Display Size', value: '75 inches' },
          { key: 'Resolution', value: '4K UHD' },
          { key: 'Touch Points', value: '20-point multi-touch' },
          { key: 'Connectivity', value: 'HDMI, USB-C, OPS' }
        ],
        availability: 'On Request',
        featured: false,
        status: 'published'
      },
      {
        name: 'D-Link DPH-400SE IP Phone',
        brandId: dlink._id,
        categoryId: commCat._id,
        sku: 'DL-DPH400SE',
        shortDescription: 'SIP-based IP phone with HD voice and PoE support',
        description: 'The D-Link DPH-400SE is a feature-rich SIP IP phone with HD voice quality, PoE support, and multiple line capabilities for business communication.',
        specifications: [
          { key: 'Protocol', value: 'SIP' },
          { key: 'Lines', value: '4 SIP Accounts' },
          { key: 'Display', value: '2.7" LCD' },
          { key: 'Power', value: 'PoE' },
          { key: 'Connectivity', value: 'Ethernet, USB' }
        ],
        availability: 'In Stock',
        featured: false,
        status: 'published'
      },
      {
        name: 'Hikvision DS-2CD2143G2-I Camera',
        brandId: hikvision._id,
        categoryId: commCat._id,
        sku: 'HK-DS2CD2143',
        shortDescription: '4MP dome network camera with AcuSense technology and night vision',
        description: 'The Hikvision DS-2CD2143G2-I is a 4MP dome network camera with AcuSense technology for accurate human and vehicle detection, plus night vision capabilities.',
        specifications: [
          { key: 'Resolution', value: '4MP' },
          { key: 'Technology', value: 'AcuSense' },
          { key: 'Night Vision', value: 'Up to 30m' },
          { key: 'Storage', value: 'MicroSD up to 256GB' },
          { key: 'Connectivity', value: 'Ethernet' }
        ],
        availability: 'In Stock',
        featured: false,
        status: 'published'
      },
      {
        name: 'APC Smart-UPS 1500VA',
        brandId: apc._id,
        categoryId: spareCat._id,
        sku: 'AP-SMT1500',
        shortDescription: 'Line-interactive UPS with 1500VA capacity and LCD display',
        description: 'The APC Smart-UPS 1500VA provides reliable power protection for servers, networking equipment, and business critical systems with pure sine wave output.',
        specifications: [
          { key: 'Capacity', value: '1500VA / 1000W' },
          { key: 'Topology', value: 'Line-Interactive' },
          { key: 'Outlets', value: '8 x IEC C13' },
          { key: 'Display', value: 'LCD' },
          { key: 'Connectivity', value: 'USB, Serial, SmartConnect' }
        ],
        availability: 'In Stock',
        featured: true,
        status: 'published'
      },
      {
        name: 'FlashForge Creator Pro 2 3D Printer',
        brandId: logitech._id,
        categoryId: print3dCat._id,
        sku: 'FF-CREATORPRO2',
        shortDescription: 'Dual-extruder FDM 3D printer with enclosed build chamber',
        description: 'The FlashForge Creator Pro 2 is a dual-extruder 3D printer with an enclosed build chamber, ideal for printing with ABS, PLA, PETG, and specialty materials.',
        specifications: [
          { key: 'Technology', value: 'FDM (Fused Deposition Modeling)' },
          { key: 'Build Volume', value: '200 x 148 x 150 mm' },
          { key: 'Extruders', value: 'Dual' },
          { key: 'Layer Resolution', value: '0.05 - 0.4 mm' },
          { key: 'Connectivity', value: 'USB, Wi-Fi, Ethernet' }
        ],
        availability: 'On Request',
        featured: true,
        status: 'published'
      },
      {
        name: 'PLA Filament 1.75mm - White 1kg',
        brandId: logitech._id,
        categoryId: print3dCat._id,
        sku: 'FF-PLA-WH-1KG',
        shortDescription: 'Premium PLA filament, 1.75mm diameter, 1kg spool, white color',
        description: 'High-quality PLA filament for 3D printing. Easy to print, eco-friendly, and produces smooth, detailed prints. Compatible with most FDM 3D printers.',
        specifications: [
          { key: 'Material', value: 'PLA (Polylactic Acid)' },
          { key: 'Diameter', value: '1.75mm' },
          { key: 'Weight', value: '1kg' },
          { key: 'Print Temperature', value: '190-220°C' },
          { key: 'Color', value: 'White' }
        ],
        availability: 'In Stock',
        featured: false,
        status: 'published'
      },
      {
        name: 'ABS Filament 1.75mm - Black 1kg',
        brandId: logitech._id,
        categoryId: print3dCat._id,
        sku: 'FF-ABS-BK-1KG',
        shortDescription: 'Durable ABS filament, 1.75mm diameter, 1kg spool, black color',
        description: 'ABS filament for strong, durable 3D prints. Ideal for functional parts, prototypes, and applications requiring heat resistance.',
        specifications: [
          { key: 'Material', value: 'ABS (Acrylonitrile Butadiene Styrene)' },
          { key: 'Diameter', value: '1.75mm' },
          { key: 'Weight', value: '1kg' },
          { key: 'Print Temperature', value: '230-260°C' },
          { key: 'Color', value: 'Black' }
        ],
        availability: 'In Stock',
        featured: false,
        status: 'published'
      },
      {
        name: 'Logitech MX Master 3S Mouse',
        brandId: logitech._id,
        categoryId: computerCat._id,
        sku: 'LG-MX3S',
        shortDescription: 'Premium wireless mouse with ergonomic design and silent clicks',
        description: 'The Logitech MX Master 3S is a premium wireless mouse designed for productivity, featuring an ergonomic design, silent clicks, and customizable buttons.',
        specifications: [
          { key: 'Connectivity', value: 'Bluetooth, USB Receiver' },
          { key: 'Sensor', value: '8000 DPI Darkfield' },
          { key: 'Battery Life', value: 'Up to 70 days' },
          { key: 'Scroll', value: 'MagSpeed Electromagnetic' }
        ],
        availability: 'In Stock',
        featured: false,
        status: 'published'
      }
    ]);
    console.log(`${products.length} products created`);

    console.log('\n=== Seed Complete ===');
    console.log(`Admin Login: ${admin.email}`);
    console.log(`Admin Password: ${process.env.ADMIN_PASSWORD || 'Admin@2024'}`);
    console.log('\nYou can now start the server with: npm start');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
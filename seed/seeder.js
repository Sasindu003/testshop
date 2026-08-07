const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');

dotenv.config();

const categoriesData = [
  { name: 'Streetwear & Hoodies', slug: 'streetwear-hoodies', description: 'Modern Urban Fashion & Oversized Hoodies' },
  { name: 'Formal & Suits', slug: 'formal-suits', description: 'Tailored Suits, Blazers & Silk Shirts' },
  { name: 'Casual Apparel & Tees', slug: 'casual-tees', description: 'Organic Cotton Tees & Casual Shirts' },
  { name: 'Selvedge Denim & Jeans', slug: 'selvedge-denim', description: 'Shuttle-Loomed Japanese Selvedge Denim' },
  { name: 'Luxury Footwear & Sneakers', slug: 'footwear-sneakers', description: 'Italian Leather Shoes & Streetwear Kicks' },
  { name: 'Outerwear & Trench Coats', slug: 'outerwear-coats', description: 'Double-Breasted Trench Coats & Winter Jackets' },
  { name: 'Luxury Accessories & Caps', slug: 'accessories', description: 'Nappa Leather Belts, Accessories & Caps' },
  { name: 'Activewear & Sportswear', slug: 'activewear', description: 'Breathable Performance Activewear' },
  { name: 'Leather Goods', slug: 'leather-goods', description: 'Designer Leather Wallets, Bags & Straps' },
  { name: 'Summer Collection', slug: 'summer-collection', description: 'Lightweight Linen Shirts & Resort Shorts' }
];

const productsData = [
  {
    title: 'Urban Cyberpunk Oversized Hoodie',
    description: 'High-density heavy cotton streetwear hoodie featuring a dropped shoulder cut, deep hood, and rib-knit cuffs.',
    price: 850.00,
    originalPrice: 110.00,
    category: 'Streetwear & Hoodies',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Charcoal'],
    stockCount: 14,
    images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600'],
    rating: 4.9,
    isFeatured: true
  },
  {
    title: 'Tailored Italian Wool Suit Blazer',
    description: 'Bespoke single-breasted blazer constructed with 100% fine Italian virgin wool and hand-finished lapels.',
    price: 240.00,
    originalPrice: 290.00,
    category: 'Formal & Suits',
    sizes: ['M', 'L', 'XL'],
    colors: ['Navy Blue', 'Midnight Black'],
    stockCount: 6,
    images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600'],
    rating: 5.0,
    isFeatured: true
  },
  {
    title: 'Vintage Japanese Selvedge Denim Jacket',
    description: 'Handcrafted 14oz shuttle-loomed Japanese denim jacket featuring contrast stitching and custom brass hardware.',
    price: 135.00,
    originalPrice: 160.00,
    category: 'Selvedge Denim & Jeans',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Indigo Blue'],
    stockCount: 3,
    images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600'],
    rating: 4.8,
    isFeatured: true
  },
  {
    title: 'Minimalist Matte Leather Crossbody Cap',
    description: 'Full-grain Nappa leather cap with adjustable brass buckle strap and breathable interior headband.',
    price: 45.00,
    originalPrice: 60.00,
    category: 'Luxury Accessories & Caps',
    sizes: ['S', 'M', 'L'],
    colors: ['Black', 'Tan'],
    stockCount: 22,
    images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600'],
    rating: 4.7,
    isFeatured: true
  },
  {
    title: 'StyleHub Silk Evening Trench Coat',
    description: 'Water-resistant double-breasted evening trench coat with removable silk waist belt and horn buttons.',
    price: 195.00,
    originalPrice: 240.00,
    category: 'Outerwear & Trench Coats',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Cream', 'Navy'],
    stockCount: 8,
    images: ['https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600'],
    rating: 4.9,
    isFeatured: true
  },
  {
    title: 'Street Culture Graphic Heavyweight Tee',
    description: '240 GSM organic cotton t-shirt with high-density screenprinted chest logo and reinforced neckline.',
    price: 38.00,
    originalPrice: 50.00,
    category: 'Casual Apparel & Tees',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Black'],
    stockCount: 30,
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600'],
    rating: 4.6,
    isFeatured: false
  }
];

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/stylehub_db';
    console.log('[Seeder] Connecting to MongoDB Atlas cluster...');
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });

    console.log('[Seeder] Connection Successful! Populating MongoDB Atlas database: stylehub_db...');

    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    await Category.insertMany(categoriesData);
    await Product.insertMany(productsData);

    const adminUser = await User.create({
      name: 'Demo Admin',
      email: 'admin@stylehub.com',
      password: 'adminpassword123',
      role: 'admin',
      phone: '+94 77 123 4567'
    });

    const staffUser = await User.create({
      name: 'Staff Member',
      email: 'staff@stylehub.com',
      password: 'staffpassword123',
      role: 'staff',
      phone: '+94 71 987 6543'
    });

    const customerUser = await User.create({
      name: 'Sarah Connor',
      email: 'sarah@example.com',
      password: 'userpassword123',
      role: 'customer',
      phone: '+94 70 555 1212',
      addresses: [
        {
          street: '45 Galle Road',
          city: 'Colombo 03',
          state: 'Western Province',
          zipCode: '00300',
          country: 'Sri Lanka',
          isDefault: true
        }
      ]
    });

    console.log('[Seeder SUCCESS] MongoDB Atlas populated with Categories, Products, and Users!');
    console.log(`[Seeder Database URI] ${mongoUri}`);
    console.log(`[Seeder Accounts] Admin: admin@stylehub.com | Customer: sarah@example.com`);
  } catch (error) {
    console.error('[Seeder Error]', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
};

seedData();

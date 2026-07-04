import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Product from './models/Product.js';
import Category from './models/Category.js';

const categories = ['Rings', 'Earrings', 'Necklaces', 'Bracelets'];

const sample = [
  {
    name: 'Rose Gold Diamond Ring',
    description: 'Elegant 18k rose gold ring with a solitaire diamond.',
    price: 24999,
    stock: 10,
    category: 'Rings',
  },
  {
    name: 'Pearl Drop Earrings',
    description: 'Classic freshwater pearl drop earrings in sterling silver.',
    price: 5999,
    stock: 25,
    category: 'Earrings',
  },
  {
    name: 'Gold Chain Necklace',
    description: '22k gold-plated chain necklace, 18 inches.',
    price: 15999,
    stock: 8,
    category: 'Necklaces',
  },
  {
    name: 'Silver Charm Bracelet',
    description: 'Adjustable sterling silver bracelet with heart charm.',
    price: 3499,
    stock: 30,
    category: 'Bracelets',
  },
];

async function run() {
  await connectDB(process.env.MONGODB_URI);
  await Category.deleteMany({});
  await Category.insertMany(categories.map((name) => ({ name })));
  await Product.deleteMany({});
  await Product.insertMany(sample);
  console.log(`✔ Seeded ${categories.length} categories and ${sample.length} products.`);
  await mongoose.disconnect();
  process.exit(0);
}

run();

import { Router } from 'express';
import Product from '../models/Product.js';
import { requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// GET /api/products  — public, list all products
router.get('/', async (req, res) => {
  const { search, category } = req.query;
  const filter = {};
  if (search) filter.name = { $regex: search, $options: 'i' };
  if (category) filter.category = category;
  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json(products);
});

// GET /api/products/:id — public, single product
router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  res.json(product);
});

// POST /api/products — admin, create (with optional image upload)
router.post('/', requireAdmin, upload.single('image'), async (req, res) => {
  const { name, description, price, stock, category } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ message: 'Name and price are required.' });
  }
  const product = await Product.create({
    name,
    description,
    price: Number(price),
    stock: Number(stock) || 0,
    category,
    image: req.file ? `/uploads/${req.file.filename}` : '',
  });
  res.status(201).json(product);
});

// PUT /api/products/:id — admin, update (image optional)
router.put('/:id', requireAdmin, upload.single('image'), async (req, res) => {
  const { name, description, price, stock, category } = req.body;
  const update = {};
  if (name !== undefined) update.name = name;
  if (description !== undefined) update.description = description;
  if (price !== undefined) update.price = Number(price);
  if (stock !== undefined) update.stock = Number(stock);
  if (category !== undefined) update.category = category;
  if (req.file) update.image = `/uploads/${req.file.filename}`;

  const product = await Product.findByIdAndUpdate(req.params.id, update, {
    new: true,
  });
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  res.json(product);
});

// DELETE /api/products/:id — admin
router.delete('/:id', requireAdmin, async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  res.json({ message: 'Product deleted.' });
});

export default router;

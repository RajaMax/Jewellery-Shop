import { Router } from 'express';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/categories — public, list all categories (with product counts)
router.get('/', async (req, res) => {
  const categories = await Category.find().sort({ name: 1 }).lean();
  // attach how many products use each category
  const counts = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]));
  const withCounts = categories.map((c) => ({
    ...c,
    productCount: countMap[c.name] || 0,
  }));
  res.json(withCounts);
});

// POST /api/categories — admin, create
router.post('/', requireAdmin, async (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ message: 'Category name is required.' });

  const exists = await Category.findOne({
    name: { $regex: `^${name}$`, $options: 'i' },
  });
  if (exists) {
    return res.status(409).json({ message: 'That category already exists.' });
  }
  const category = await Category.create({ name });
  res.status(201).json(category);
});

// PUT /api/categories/:id — admin, rename (also relabels affected products)
router.put('/:id', requireAdmin, async (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ message: 'Category name is required.' });

  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ message: 'Category not found.' });

  const clash = await Category.findOne({
    _id: { $ne: category._id },
    name: { $regex: `^${name}$`, $options: 'i' },
  });
  if (clash) {
    return res.status(409).json({ message: 'Another category already has that name.' });
  }

  const oldName = category.name;
  category.name = name;
  await category.save();

  // Keep products in sync with the new name
  if (oldName !== name) {
    await Product.updateMany({ category: oldName }, { category: name });
  }
  res.json(category);
});

// DELETE /api/categories/:id — admin
// Blocked while products still use it, to avoid orphaned labels.
router.delete('/:id', requireAdmin, async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ message: 'Category not found.' });

  const inUse = await Product.countDocuments({ category: category.name });
  if (inUse > 0) {
    return res.status(409).json({
      message: `Cannot delete "${category.name}" — ${inUse} product(s) still use it. Reassign or remove them first.`,
    });
  }
  await category.deleteOne();
  res.json({ message: 'Category deleted.' });
});

export default router;

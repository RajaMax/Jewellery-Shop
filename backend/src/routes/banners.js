import { Router } from 'express';
import Banner from '../models/Banner.js';
import { requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// GET /api/banners — public, list banners (newest first).
// The storefront shows only the active ones; the admin panel shows all.
router.get('/', async (req, res) => {
  const banners = await Banner.find().sort({ createdAt: -1 });
  res.json(banners);
});

// POST /api/banners — admin, upload a new banner image
router.post('/', requireAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please choose a banner image.' });
  }
  const banner = await Banner.create({
    image: `/uploads/${req.file.filename}`,
    title: req.body.title || '',
  });
  res.status(201).json(banner);
});

// PATCH /api/banners/:id — admin, toggle active (show/hide)
router.patch('/:id', requireAdmin, async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(
    req.params.id,
    { active: !!req.body.active },
    { new: true }
  );
  if (!banner) return res.status(404).json({ message: 'Banner not found.' });
  res.json(banner);
});

// DELETE /api/banners/:id — admin
router.delete('/:id', requireAdmin, async (req, res) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);
  if (!banner) return res.status(404).json({ message: 'Banner not found.' });
  res.json({ message: 'Banner deleted.' });
});

export default router;

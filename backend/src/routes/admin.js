import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

// POST /api/admin/login  { password }
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ message: 'Password is required.' });
  }
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Incorrect master password.' });
  }
  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: '12h',
  });
  res.json({ token });
});

export default router;

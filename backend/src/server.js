import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { uploadsDir } from './middleware/upload.js';
import adminRoutes from './routes/admin.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import categoryRoutes from './routes/categories.js';
import bannerRoutes from './routes/banners.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  })
);
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/banners', bannerRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Multer / generic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error.' });
});

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGODB_URI).then(() => {
  const server = app.listen(PORT, () =>
    console.log(`✔ API running on http://localhost:${PORT}`)
  );

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`✖ Port ${PORT} is already in use — another server is still running.`);
      console.error(`  Stop it (close the other terminal) or change PORT in backend/.env, then retry.`);
    } else {
      console.error('✖ Server error:', err.message);
    }
    process.exit(1);
  });
});

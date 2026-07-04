import { Router } from 'express';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { requireAdmin } from '../middleware/auth.js';
import { generateTrackId, normalizeTrackId } from '../utils/trackId.js';

const router = Router();

// POST /api/orders — public, place an order (mock payment)
// body: { items: [{ productId, quantity }], customer: {...} }
router.post('/', async (req, res) => {
  const { items, customer } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Your cart is empty.' });
  }
  if (!customer?.name || !customer?.email || !customer?.address) {
    return res
      .status(400)
      .json({ message: 'Name, email and address are required.' });
  }

  // Load products and validate stock
  const orderItems = [];
  let totalAmount = 0;

  for (const line of items) {
    const product = await Product.findById(line.productId);
    if (!product) {
      return res
        .status(400)
        .json({ message: `A product in your cart no longer exists.` });
    }
    const quantity = Number(line.quantity) || 0;
    if (quantity < 1) {
      return res.status(400).json({ message: `Invalid quantity for ${product.name}.` });
    }
    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Only ${product.stock} of "${product.name}" left in stock.`,
      });
    }
    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image,
    });
    totalAmount += product.price * quantity;
  }

  // Decrement stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  // Mock payment always succeeds
  const order = await Order.create({
    trackId: await generateTrackId(),
    items: orderItems,
    totalAmount,
    customer,
    paymentStatus: 'paid',
    paymentMethod: 'mock',
    status: 'placed',
  });

  res.status(201).json({ message: 'Order placed successfully!', order });
});

// GET /api/orders/track/:code — public, limited info for customer order tracking.
// Looks up by the friendly trackId (e.g. AURA-7K2M9QXP); the Mongo _id is never exposed.
router.get('/track/:code', async (req, res) => {
  const trackId = normalizeTrackId(req.params.code);
  if (!trackId) {
    return res.status(400).json({ message: 'Please enter a tracking ID.' });
  }
  const order = await Order.findOne({ trackId });
  if (!order) {
    return res.status(404).json({ message: 'No order found with that tracking ID.' });
  }
  res.json({
    trackId: order.trackId,
    status: order.status,
    paymentStatus: order.paymentStatus,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
    customerName: order.customer.name,
    items: order.items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      price: i.price,
      image: i.image,
    })),
  });
});

// GET /api/orders — admin, list all orders
router.get('/', requireAdmin, async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

// PATCH /api/orders/:id/status — admin, update fulfilment status
router.patch('/:id/status', requireAdmin, async (req, res) => {
  const { status } = req.body;
  const allowed = ['placed', 'shipped', 'delivered', 'cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  res.json(order);
});

export default router;

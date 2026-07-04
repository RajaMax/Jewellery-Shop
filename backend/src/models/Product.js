import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    image: { type: String, default: '' }, // relative path, e.g. /uploads/123.jpg
    category: { type: String, default: 'General', trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);

import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    image: { type: String, required: true }, // /uploads/xxx.jpg
    title: { type: String, default: '' }, // optional caption shown over the image
    active: { type: Boolean, default: true }, // hidden banners stay saved but aren't shown
  },
  { timestamps: true }
);

export default mongoose.model('Banner', bannerSchema);

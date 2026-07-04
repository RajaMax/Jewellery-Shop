export const formatPrice = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n || 0);

// A lightweight inline SVG shown when a product has no image.
const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="#efe9e0"/><text x="50%" y="50%" font-family="Georgia" font-size="22" fill="#a99" text-anchor="middle" dominant-baseline="middle">No Image</text></svg>`
  );

// Images are served by the backend at /uploads/... and proxied by Vite.
export const imageUrl = (path) => (path ? path : PLACEHOLDER);

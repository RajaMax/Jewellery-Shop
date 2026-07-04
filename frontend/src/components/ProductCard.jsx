import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice, imageUrl } from '../utils.js';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const outOfStock = product.stock < 1;

  return (
    <div className="card">
      <Link to={`/product/${product._id}`} className="card-image">
        <img src={imageUrl(product.image)} alt={product.name} />
      </Link>
      <div className="card-body">
        <span className="card-category">{product.category}</span>
        <Link to={`/product/${product._id}`} className="card-title">
          {product.name}
        </Link>
        <div className="card-price">{formatPrice(product.price)}</div>
        <button
          className="btn"
          disabled={outOfStock}
          onClick={() => addToCart(product)}
        >
          {outOfStock ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </div>
  );
}

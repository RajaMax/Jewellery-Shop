import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice, imageUrl } from '../utils.js';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => setError('Product not found.'));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!product) return <p>Loading…</p>;

  const outOfStock = product.stock < 1;

  return (
    <div className="detail">
      <div className="detail-image">
        <img src={imageUrl(product.image)} alt={product.name} />
      </div>
      <div className="detail-info">
        <span className="card-category">{product.category}</span>
        <h1>{product.name}</h1>
        <div className="detail-price">{formatPrice(product.price)}</div>
        <p className="detail-desc">{product.description || 'No description.'}</p>
        <p className={outOfStock ? 'stock out' : 'stock'}>
          {outOfStock ? 'Out of stock' : `${product.stock} in stock`}
        </p>
        <div className="detail-actions">
          <button
            className="btn"
            disabled={outOfStock}
            onClick={() => addToCart(product)}
          >
            Add to cart
          </button>
          <button
            className="btn btn-primary"
            disabled={outOfStock}
            onClick={() => {
              addToCart(product);
              navigate('/cart');
            }}
          >
            Buy now
          </button>
        </div>
      </div>
    </div>
  );
}

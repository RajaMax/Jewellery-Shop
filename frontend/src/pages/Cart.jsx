import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice, imageUrl } from '../utils.js';

export default function Cart() {
  const { items, setQuantity, removeFromCart, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="empty">
        <h2>Your cart is empty</h2>
        <Link to="/" className="btn btn-primary">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart">
      <h1>Your Cart</h1>
      <div className="cart-items">
        {items.map((item) => (
          <div className="cart-row" key={item._id}>
            <img src={imageUrl(item.image)} alt={item.name} />
            <div className="cart-row-info">
              <Link to={`/product/${item._id}`}>{item.name}</Link>
              <span>{formatPrice(item.price)}</span>
            </div>
            <input
              type="number"
              min="1"
              max={item.stock}
              value={item.quantity}
              onChange={(e) => setQuantity(item._id, Number(e.target.value))}
            />
            <div className="cart-row-total">
              {formatPrice(item.price * item.quantity)}
            </div>
            <button className="link-danger" onClick={() => removeFromCart(item._id)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-total">
          <span>Total</span>
          <strong>{formatPrice(total)}</strong>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/checkout')}>
          Proceed to checkout
        </button>
      </div>
    </div>
  );
}

import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { getLastOrderId } from '../orders.js';
import logo from '../assets/logo.png';

export default function Navbar() {
  const { count } = useCart();
  useLocation(); // re-render on navigation so the link appears right after checkout
  const lastOrderId = getLastOrderId();
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <img src={logo} alt="Aura" className="brand-logo" />
          <span className="brand-tag">Jewellery &amp; Hair Accessories</span>
        </Link>
        <nav className="nav-links">
          <Link to="/">Shop</Link>
          {lastOrderId && <Link to={`/track/${lastOrderId}`}>Track Order</Link>}
          <Link to="/cart" className="cart-link">
            Cart
            {count > 0 && <span className="badge">{count}</span>}
          </Link>
        </nav>
      </div>
    </header>
  );
}

import { Link, useLocation } from 'react-router-dom';
import { formatPrice } from '../utils.js';

export default function OrderSuccess() {
  const { state } = useLocation();
  const order = state?.order;

  return (
    <div className="success">
      <div className="success-check">✓</div>
      <h1>Thank you for your order!</h1>
      <p>Your payment was successful and your order has been placed.</p>
      {order && (
        <div className="success-card">
          <div>
            <span>Tracking ID</span>
            <strong>{order.trackId}</strong>
          </div>
          <div>
            <span>Amount paid</span>
            <strong>{formatPrice(order.totalAmount)}</strong>
          </div>
        </div>
      )}
      {order && (
        <p className="muted">Save your Tracking ID to check your order status anytime.</p>
      )}
      <div className="success-actions">
        {order && (
          <Link to={`/track/${order.trackId}`} className="btn">
            Track this order
          </Link>
        )}
        <Link to="/" className="btn btn-primary">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

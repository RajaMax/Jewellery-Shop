import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { saveOrderId } from '../orders.js';
import { formatPrice } from '../utils.js';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="empty">
        <h2>Your cart is empty</h2>
      </div>
    );
  }

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        items: items.map((i) => ({ productId: i._id, quantity: i.quantity })),
        customer: form,
      };
      const res = await api.post('/orders', payload);
      saveOrderId(res.data.order.trackId); // remember it so Track Order appears
      clearCart();
      navigate('/order-success', { state: { order: res.data.order } });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout">
      <form className="checkout-form" onSubmit={handleSubmit}>
        <h1>Shipping details</h1>
        {error && <p className="error">{error}</p>}
        <label>
          Full name *
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Email *
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Phone
          <input name="phone" value={form.phone} onChange={handleChange} />
        </label>
        <label>
          Shipping address *
          <textarea
            name="address"
            rows="3"
            value={form.address}
            onChange={handleChange}
            required
          />
        </label>

        <div className="pay-note">
          💳 This is a demo store — payment is simulated and always succeeds.
        </div>

        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Placing order…' : `Pay ${formatPrice(total)}`}
        </button>
      </form>

      <aside className="order-summary">
        <h2>Order summary</h2>
        {items.map((i) => (
          <div className="summary-line" key={i._id}>
            <span>
              {i.name} × {i.quantity}
            </span>
            <span>{formatPrice(i.price * i.quantity)}</span>
          </div>
        ))}
        <div className="summary-total">
          <span>Total</span>
          <strong>{formatPrice(total)}</strong>
        </div>
      </aside>
    </div>
  );
}

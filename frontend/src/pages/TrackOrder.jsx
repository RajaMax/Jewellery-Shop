import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api.js';
import { formatPrice, imageUrl } from '../utils.js';

const STEPS = ['placed', 'shipped', 'delivered'];
const LABELS = { placed: 'Placed', shipped: 'Shipped', delivered: 'Delivered' };

export default function TrackOrder() {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState(paramId || '');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // `silent` refreshes in the background without clearing the current view
  const track = async (id, { silent } = {}) => {
    const value = (id ?? orderId).trim();
    if (!value) return;
    if (!silent) {
      setLoading(true);
      setError('');
      setOrder(null);
    }
    try {
      const res = await api.get(`/orders/track/${value}`);
      setOrder(res.data);
    } catch (err) {
      if (!silent) setError(err.response?.data?.message || 'Could not find that order.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // If we arrived at /track/:id, look it up automatically
  useEffect(() => {
    if (paramId) track(paramId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramId]);

  // Auto-refresh: while an order is shown, re-check its status every 12s so
  // updates the admin makes appear without the customer refreshing.
  useEffect(() => {
    if (!order?.trackId) return;
    const timer = setInterval(() => track(order.trackId, { silent: true }), 12000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.trackId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/track/${orderId.trim()}`);
    track();
  };

  const currentStep = order ? STEPS.indexOf(order.status) : -1;

  return (
    <div className="track">
      <h1>Track your order</h1>
      <p className="muted">
        Enter the order ID from your confirmation page or email.
      </p>

      <form className="inline-form track-form" onSubmit={handleSubmit}>
        <input
          placeholder="e.g. AURA-7K2M9QXP"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          required
        />
        <button className="btn btn-primary" disabled={loading}>
          {loading ? 'Searching…' : 'Track'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {order && (
        <div className="track-result">
          <div className="track-head">
            <div>
              <span className="muted">Order</span>
              <strong>{order.trackId}</strong>
            </div>
            <div>
              <span className="muted">Placed on</span>
              <strong>{new Date(order.createdAt).toLocaleDateString()}</strong>
            </div>
            <div>
              <span className="muted">Total</span>
              <strong>{formatPrice(order.totalAmount)}</strong>
            </div>
          </div>

          {order.status === 'cancelled' ? (
            <div className="track-cancelled">This order was cancelled.</div>
          ) : (
            <div className="timeline">
              {STEPS.map((step, i) => (
                <div
                  key={step}
                  className={
                    'timeline-step' +
                    (i <= currentStep ? ' done' : '') +
                    (i === currentStep ? ' current' : '')
                  }
                >
                  <div className="dot">{i <= currentStep ? '✓' : i + 1}</div>
                  <span>{LABELS[step]}</span>
                </div>
              ))}
            </div>
          )}

          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <p className="track-live">🔄 This page updates automatically.</p>
          )}

          <div className="track-items">
            {order.items.map((it, idx) => (
              <div className="track-item" key={idx}>
                <img src={imageUrl(it.image)} alt={it.name} />
                <span>
                  {it.name} × {it.quantity}
                </span>
                <span>{formatPrice(it.price * it.quantity)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

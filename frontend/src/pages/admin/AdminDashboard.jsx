import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api.js';
import { formatPrice, imageUrl } from '../../utils.js';
import ProductForm from './ProductForm.jsx';
import CategoriesPanel from './CategoriesPanel.jsx';
import BannersPanel from './BannersPanel.jsx';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('products');

  const logout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="admin">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button className="btn" onClick={logout}>
          Log out
        </button>
      </div>

      <div className="tabs">
        <button
          className={tab === 'products' ? 'tab active' : 'tab'}
          onClick={() => setTab('products')}
        >
          Products
        </button>
        <button
          className={tab === 'categories' ? 'tab active' : 'tab'}
          onClick={() => setTab('categories')}
        >
          Categories
        </button>
        <button
          className={tab === 'banners' ? 'tab active' : 'tab'}
          onClick={() => setTab('banners')}
        >
          Banners
        </button>
        <button
          className={tab === 'orders' ? 'tab active' : 'tab'}
          onClick={() => setTab('orders')}
        >
          Orders
        </button>
      </div>

      {tab === 'products' && <ProductsPanel />}
      {tab === 'categories' && <CategoriesPanel />}
      {tab === 'banners' && <BannersPanel />}
      {tab === 'orders' && <OrdersPanel />}
    </div>
  );
}

function ProductsPanel() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    api
      .get('/products')
      .then((res) => setProducts(res.data))
      .catch(() => setError('Could not load products.'));
  };

  useEffect(load, []);

  const handleSaved = () => {
    setShowForm(false);
    setEditing(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    load();
  };

  return (
    <div className="panel">
      {error && <p className="error">{error}</p>}

      {showForm || editing ? (
        <ProductForm
          editing={editing}
          onSaved={handleSaved}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      ) : (
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Add new product
        </button>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>
                <img className="thumb" src={imageUrl(p.image)} alt={p.name} />
              </td>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>{formatPrice(p.price)}</td>
              <td className={p.stock < 1 ? 'out' : ''}>{p.stock}</td>
              <td className="row-actions">
                <button
                  className="link"
                  onClick={() => {
                    setEditing(p);
                    setShowForm(false);
                  }}
                >
                  Edit
                </button>
                <button className="link-danger" onClick={() => handleDelete(p._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan="6" className="muted">
                No products yet. Add your first one above.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  const load = () => {
    api
      .get('/orders')
      .then((res) => setOrders(res.data))
      .catch(() => setError('Could not load orders.'));
  };

  useEffect(load, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/orders/${id}/status`, { status });
    load();
  };

  return (
    <div className="panel">
      {error && <p className="error">{error}</p>}
      {orders.length === 0 ? (
        <p className="muted">No orders yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>
                  <code>{o.trackId}</code>
                  <br />
                  <span className="muted">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </span>
                </td>
                <td>
                  {o.customer.name}
                  <br />
                  <span className="muted">{o.customer.email}</span>
                  <br />
                  <span className="muted">{o.customer.address}</span>
                </td>
                <td>
                  {o.items.map((i, idx) => (
                    <div key={idx}>
                      {i.name} × {i.quantity}
                    </div>
                  ))}
                </td>
                <td>{formatPrice(o.totalAmount)}</td>
                <td>
                  <span className={`pill ${o.paymentStatus}`}>
                    {o.paymentStatus}
                  </span>
                </td>
                <td>
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o._id, e.target.value)}
                  >
                    <option value="placed">Placed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

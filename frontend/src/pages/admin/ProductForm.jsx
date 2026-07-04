import { useEffect, useState } from 'react';
import api from '../../api.js';

const EMPTY = { name: '', description: '', price: '', stock: '', category: '' };

export default function ProductForm({ editing, onSaved, onCancel }) {
  const [categories, setCategories] = useState([]);

  // Load the managed categories to populate the dropdown
  useEffect(() => {
    api
      .get('/categories')
      .then((res) => setCategories(res.data.map((c) => c.name)))
      .catch(() => {});
  }, []);

  const [form, setForm] = useState(
    editing
      ? {
          name: editing.name,
          description: editing.description,
          price: editing.price,
          stock: editing.stock,
          category: editing.category,
        }
      : EMPTY
  );
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    // FormData so we can send the image file alongside text fields
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (imageFile) data.append('image', imageFile);

    try {
      if (editing) {
        await api.put(`/products/${editing._id}`, data);
      } else {
        await api.post('/products', data);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save product.');
      setSaving(false);
    }
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <h2>{editing ? 'Edit product' : 'Add new product'}</h2>
      {error && <p className="error">{error}</p>}

      <label>
        Product name *
        <input name="name" value={form.name} onChange={handleChange} required />
      </label>

      <label>
        Description
        <textarea
          name="description"
          rows="3"
          value={form.description}
          onChange={handleChange}
        />
      </label>

      <div className="form-row">
        <label>
          Price (₹) *
          <input
            type="number"
            name="price"
            min="0"
            value={form.price}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Stock *
          <input
            type="number"
            name="stock"
            min="0"
            value={form.stock}
            onChange={handleChange}
            required
          />
        </label>
      </div>

      <label>
        Category
        <select name="category" value={form.category} onChange={handleChange}>
          <option value="">— Select a category —</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {categories.length === 0 && (
          <span className="muted">
            No categories yet — add one in the Categories tab first.
          </span>
        )}
      </label>

      <label>
        Product image
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0] || null)}
        />
      </label>
      {editing?.image && !imageFile && (
        <p className="muted">Leave empty to keep the current image.</p>
      )}

      <div className="form-actions">
        <button className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : editing ? 'Update product' : 'Create product'}
        </button>
        {editing && (
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

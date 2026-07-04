import { useEffect, useState } from 'react';
import api from '../../api.js';

export default function CategoriesPanel() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    api
      .get('/categories')
      .then((res) => setCategories(res.data))
      .catch(() => setError('Could not load categories.'));
  };

  useEffect(load, []);

  const add = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/categories', { name: newName });
      setNewName('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add category.');
    }
  };

  const saveEdit = async (id) => {
    setError('');
    try {
      await api.put(`/categories/${id}`, { name: editName });
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not rename category.');
    }
  };

  const remove = async (cat) => {
    setError('');
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await api.delete(`/categories/${cat._id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete category.');
    }
  };

  return (
    <div className="panel">
      {error && <p className="error">{error}</p>}

      <form className="inline-form" onSubmit={add}>
        <input
          placeholder="New category name (e.g. Pendants)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        <button className="btn btn-primary">+ Add category</button>
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Products</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c._id}>
              <td>
                {editingId === c._id ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                  />
                ) : (
                  c.name
                )}
              </td>
              <td>{c.productCount}</td>
              <td className="row-actions">
                {editingId === c._id ? (
                  <>
                    <button className="link" onClick={() => saveEdit(c._id)}>
                      Save
                    </button>
                    <button className="link" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="link"
                      onClick={() => {
                        setEditingId(c._id);
                        setEditName(c.name);
                      }}
                    >
                      Rename
                    </button>
                    <button className="link-danger" onClick={() => remove(c)}>
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {categories.length === 0 && (
            <tr>
              <td colSpan="3" className="muted">
                No categories yet. Add your first one above.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

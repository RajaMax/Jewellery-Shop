import { useEffect, useState } from 'react';
import api from '../../api.js';
import { imageUrl } from '../../utils.js';

export default function BannersPanel() {
  const [banners, setBanners] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    api
      .get('/banners')
      .then((res) => setBanners(res.data))
      .catch(() => setError('Could not load banners.'));
  };

  useEffect(load, []);

  const add = async (e) => {
    e.preventDefault();
    setError('');
    if (!file) {
      setError('Please choose a banner image.');
      return;
    }
    const data = new FormData();
    data.append('image', file);
    data.append('title', title);
    setSaving(true);
    try {
      await api.post('/banners', data);
      setFile(null);
      setTitle('');
      e.target.reset();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not upload banner.');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (b) => {
    await api.patch(`/banners/${b._id}`, { active: !b.active });
    load();
  };

  const remove = async (b) => {
    if (!window.confirm('Delete this banner?')) return;
    await api.delete(`/banners/${b._id}`);
    load();
  };

  return (
    <div className="panel">
      {error && <p className="error">{error}</p>}

      <form className="product-form" onSubmit={add}>
        <h2>Add banner</h2>
        <label>
          Caption (optional)
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Festive Collection — up to 20% off"
          />
        </label>
        <label>
          Banner image *
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0] || null)}
          />
        </label>
        <span className="muted">
          Wide images work best (e.g. 1200×400). Shown in the shop page slider.
        </span>
        <div className="form-actions">
          <button className="btn btn-primary" disabled={saving}>
            {saving ? 'Uploading…' : 'Upload banner'}
          </button>
        </div>
      </form>

      <div className="banner-admin-grid">
        {banners.map((b) => (
          <div className="banner-admin-card" key={b._id}>
            <img src={imageUrl(b.image)} alt={b.title || 'banner'} />
            <div className="banner-admin-info">
              <span>{b.title || '(no caption)'}</span>
              <span className={b.active ? 'pill paid' : 'pill pending'}>
                {b.active ? 'Active' : 'Hidden'}
              </span>
            </div>
            <div className="row-actions banner-admin-actions">
              <button className="link" onClick={() => toggle(b)}>
                {b.active ? 'Hide' : 'Show'}
              </button>
              <button className="link-danger" onClick={() => remove(b)}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <p className="muted">No banners yet. Upload one above.</p>
        )}
      </div>
    </div>
  );
}

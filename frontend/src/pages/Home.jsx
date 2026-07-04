import { useEffect, useState } from 'react';
import api from '../api.js';
import ProductCard from '../components/ProductCard.jsx';
import BannerCarousel from '../components/BannerCarousel.jsx';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(''); // '' means "All"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load the managed categories once (only those that have products)
  useEffect(() => {
    api
      .get('/categories')
      .then((res) =>
        setCategories(
          res.data.filter((c) => c.productCount > 0).map((c) => c.name)
        )
      )
      .catch(() => {});
  }, []);

  // Load products whenever the search text or selected category changes
  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    api
      .get('/products', { params })
      .then((res) => setProducts(res.data))
      .catch(() => setError('Could not load products. Is the backend running?'))
      .finally(() => setLoading(false));
  }, [search, category]);

  return (
    <>
      <section className="hero">
        <h1>Timeless Jewellery, Crafted for You</h1>
        <p>Discover handpicked rings, necklaces, earrings and more.</p>
      </section>

      <BannerCarousel />

      <div className="toolbar">
        <input
          className="search"
          placeholder="Search jewellery…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {categories.length > 0 && (
        <div className="filters">
          <button
            className={category === '' ? 'chip active' : 'chip'}
            onClick={() => setCategory('')}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              className={category === c ? 'chip active' : 'chip'}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </>
  );
}

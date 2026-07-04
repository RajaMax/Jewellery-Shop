import { useEffect, useState } from 'react';
import api from '../api.js';
import { imageUrl } from '../utils.js';

export default function BannerCarousel() {
  const [banners, setBanners] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    api
      .get('/banners')
      .then((res) => setBanners(res.data.filter((b) => b.active)))
      .catch(() => {});
  }, []);

  // Auto-scroll every 4s when there's more than one banner
  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % banners.length),
      4000
    );
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="banner">
      <div
        className="banner-track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {banners.map((b) => (
          <div className="banner-slide" key={b._id}>
            <img src={imageUrl(b.image)} alt={b.title || 'Promotional banner'} />
            {b.title && <div className="banner-caption">{b.title}</div>}
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <div className="banner-dots">
          {banners.map((_, i) => (
            <button
              key={i}
              className={i === index ? 'dot active' : 'dot'}
              onClick={() => setIndex(i)}
              aria-label={`Go to banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

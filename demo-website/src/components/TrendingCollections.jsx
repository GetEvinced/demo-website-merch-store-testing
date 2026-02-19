import React from 'react';
import './TrendingCollections.css';

const collections = [
  {
    id: 1,
    title: 'Hello Android',
    subtitle: 'An truly a-MAZE-ing collectible',
    shopLabel: 'Shop Android',
    shopHref: '#android',
    image: 'https://ik.imagekit.io/RM/store/20160512512/assets/images/Home%20Page/AmazeingAndroid.png?tr=w-750',
    imageAlt: 'Android Googler',
    bg: '#f0f8f0',
  },
  {
    id: 2,
    title: 'YouTube Kids',
    subtitle: 'Color, Create, Play',
    shopLabel: 'Shop YouTube',
    shopHref: '#youtube',
    image: 'https://ik.imagekit.io/RM/store/20160512512/assets/images/Home%20Page/YouTubeKids.png?tr=w-750',
    imageAlt: 'YouTube Kids',
    bg: '#fff5f5',
  },
  {
    id: 3,
    title: 'Calling Stylish Pups',
    subtitle: 'Make your furry friend happy',
    shopLabel: 'Shop Doogler/Mewgler',
    shopHref: '#doogler',
    image: 'https://ik.imagekit.io/RM/store/20160512512/assets/images/Home%20Page/Bandana.png?tr=w-750',
    imageAlt: 'Doogler',
    bg: '#fdf5f5',
  },
];

export default function TrendingCollections() {
  return (
    <section className="trending-section" aria-labelledby="trending-heading">
      <h2 id="trending-heading">Shop Trending Collections</h2>
      <div className="trending-grid">
        {collections.map((col) => (
          <div key={col.id} className="trending-card" style={{ background: col.bg }}>
            <div className="trending-card-info">
              <h3>{col.title}</h3>
              <p>{col.subtitle}</p>
              <a href={col.shopHref} className="shop-link-sm">{col.shopLabel}</a>
            </div>
            <div className="trending-card-image">
              <img src={col.image} alt={col.imageAlt} loading="lazy" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

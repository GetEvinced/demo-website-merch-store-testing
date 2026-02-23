import React from 'react';
import { Link } from 'react-router-dom';
import './TrendingCollections.css';

const collections = [
  {
    id: 1,
    title: 'Hello Android',
    subtitle: 'An truly a-MAZE-ing collectible',
    shopLabel: 'Shop Android',
    shopHref: '/shop/new',
    image: '/images/home/AmazeingAndroid.png',
    imageAlt: 'Android Googler',
    bg: '#f0f8f0',
  },
  {
    id: 2,
    title: 'YouTube Kids',
    subtitle: 'Color, Create, Play',
    shopLabel: 'Shop YouTube',
    shopHref: '/shop/new',
    image: '/images/home/YouTubeKids.png',
    imageAlt: 'YouTube Kids',
    bg: '#fff5f5',
  },
  {
    id: 3,
    title: 'Calling Stylish Pups',
    subtitle: 'Make your furry friend happy',
    shopLabel: 'Shop Doogler/Mewgler',
    shopHref: '/shop/new',
    image: '/images/home/Bandana.png',
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
              <Link to={col.shopHref} className="shop-link-sm">{col.shopLabel}</Link>
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

import React from 'react';
import { Link } from 'react-router-dom';
import './PopularSection.css';

const products = [
  {
    id: 1,
    title: 'True Blue',
    subtitle: 'Hydration to-go',
    shopLabel: 'Shop Drinkware',
    shopHref: '/shop/new',
    image: '/images/home/inkwell_tumbler.png',
    imageAlt: 'Drinkware',
    bg: '#e8f0fe',
  },
  {
    id: 2,
    title: 'Piece by Piece',
    subtitle: 'Brainpower unleashed',
    shopLabel: 'Shop Fun and Games',
    shopHref: '/shop/new',
    image: '/images/home/CDBricks.png',
    imageAlt: 'Google Logo Brick Puzzle Set',
    bg: '#f0f4f0',
  },
  {
    id: 3,
    title: 'Blank Pages, Bold Ideas',
    subtitle: 'Notebooks that inspire',
    shopLabel: 'Shop Stationery',
    shopHref: '/shop/new',
    image: '/images/home/notebooks_082522b.png',
    imageAlt: 'Google Notebook',
    bg: '#fef9e7',
  },
];

export default function PopularSection() {
  return (
    <section className="popular-section" aria-labelledby="popular-heading">
      <h2 id="popular-heading">Popular on the Merch Shop</h2>
      <div className="popular-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card" style={{ background: product.bg }}>
            <div className="product-card-info">
              <h3>{product.title}</h3>
              <p>{product.subtitle}</p>
              <Link to={product.shopHref} className="shop-link">{product.shopLabel}</Link>
            </div>
            <div className="product-card-image">
              <img src={product.image} alt={product.imageAlt} loading="lazy" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

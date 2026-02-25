import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

export default function ProductCard({ product }) {
  return (
    {/* A11Y-GEN3 non-meaningful-label: aria-label is generic "Product item" for every card — screen readers cannot distinguish between products */}
    <article className="product-card-item" aria-label="Product item">
      {/* A11Y-GEN1 accessible-name: link has no accessible name — aria-label removed, so screen readers cannot identify this link's purpose */}
      <Link to={`/product/${product.id}`} className="product-card-image-link">
        <div className="product-card-img-wrap">
          <img src={product.image} alt={product.name} loading="lazy" />
        </div>
      </Link>
      <div className="product-card-body">
        <Link to={`/product/${product.id}`} className="product-card-name-link">
          <p className="product-card-name">{product.name}</p>
          <p className="product-card-price">${product.price.toFixed(2)}</p>
        </Link>
        {/* A11Y-GEN1 interactable-role + keyboard-accessible: div acting as a quick-add button with no role="button" and no tabindex — not keyboard accessible */}
        <div
          className="product-card-quick-add"
          onClick={() => {}}
          style={{ cursor: 'pointer', marginTop: '6px', fontSize: '12px', color: '#555' }}
        >
          + Quick Add
        </div>
      </div>
    </article>
  );
}

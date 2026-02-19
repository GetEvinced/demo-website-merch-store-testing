import React from 'react';
import './ProductCard.css';

export default function ProductCard({ product }) {
  return (
    <article className="product-card-item" aria-label={product.name}>
      <a href={`#product-${product.id}`} className="product-card-image-link" aria-label={`View ${product.name}`}>
        <div className="product-card-img-wrap">
          <img src={product.image} alt={product.name} loading="lazy" />
        </div>
      </a>
      <div className="product-card-body">
        <a href={`#product-${product.id}`} className="product-card-name-link">
          <p className="product-card-name">{product.name}</p>
          <p className="product-card-price">${product.price.toFixed(2)}</p>
        </a>
      </div>
    </article>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

export default function ProductCard({ product }) {
  return (
    <article className="product-card-item" aria-label={product.name}>
      <Link to={`/product/${product.id}`} className="product-card-image-link" aria-label={`View ${product.name}`}>
        <div className="product-card-img-wrap">
          <img src={product.image} alt={product.name} loading="lazy" />
        </div>
      </Link>
      <div className="product-card-body">
        <Link to={`/product/${product.id}`} className="product-card-name-link">
          <p className="product-card-name">{product.name}</p>
          <p className="product-card-price">${product.price.toFixed(2)}</p>
        </Link>
      </div>
    </article>
  );
}

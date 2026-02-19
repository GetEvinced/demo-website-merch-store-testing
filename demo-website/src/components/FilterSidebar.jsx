import React, { useState } from 'react';
import './FilterSidebar.css';

const PRICE_RANGES = [
  { label: '1.00 - 19.99', min: 1, max: 19.99 },
  { label: '20.00 - 39.99', min: 20, max: 39.99 },
  { label: '40.00 - 89.99', min: 40, max: 89.99 },
  { label: '100.00 - 149.99', min: 100, max: 149.99 },
];

const SIZES = ['XS', 'SM', 'MD', 'LG', 'XL'];

export default function FilterSidebar({ products, selectedPrices, selectedSizes, onPriceChange, onSizeChange }) {
  const [priceOpen, setPriceOpen] = useState(true);
  const [sizeOpen, setSizeOpen] = useState(true);

  // Count products per price range
  const priceCount = (range) =>
    products.filter((p) => p.price >= range.min && p.price <= range.max).length;

  // Count products per size
  const sizeCount = (size) =>
    products.filter((p) => p.sizes.includes(size)).length;

  return (
    <aside className="filter-sidebar" aria-label="Product filters">
      <div className="filter-sidebar-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
        <span>Filters</span>
      </div>

      {/* Price Filter */}
      <div className="filter-group">
        <button
          className="filter-group-header"
          onClick={() => setPriceOpen((o) => !o)}
          aria-expanded={priceOpen}
          aria-controls="filter-price"
        >
          <span>Price</span>
          <svg
            className={`filter-chevron ${priceOpen ? 'open' : ''}`}
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        {priceOpen && (
          <ul id="filter-price" className="filter-options" role="group" aria-label="Filter by price">
            {PRICE_RANGES.map((range) => {
              const count = priceCount(range);
              const checked = selectedPrices.some((r) => r.label === range.label);
              return (
                <li key={range.label}>
                  <label className="filter-option">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onPriceChange(range)}
                      aria-label={`Price ${range.label} (${count} products)`}
                    />
                    <span className="filter-option-label">
                      {range.label}
                      <span className="filter-count">({count})</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Size Filter */}
      <div className="filter-group">
        <button
          className="filter-group-header"
          onClick={() => setSizeOpen((o) => !o)}
          aria-expanded={sizeOpen}
          aria-controls="filter-size"
        >
          <span>Size</span>
          <svg
            className={`filter-chevron ${sizeOpen ? 'open' : ''}`}
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        {sizeOpen && (
          <ul id="filter-size" className="filter-options" role="group" aria-label="Filter by size">
            {SIZES.map((size) => {
              const count = sizeCount(size);
              const checked = selectedSizes.includes(size);
              return (
                <li key={size}>
                  <label className="filter-option">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onSizeChange(size)}
                      aria-label={`Size ${size} (${count} products)`}
                    />
                    <span className="filter-option-label">
                      {size}
                      <span className="filter-count">({count})</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}

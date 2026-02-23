import React, { useState } from 'react';
import './FilterSidebar.css';

const PRICE_RANGES = [
  { label: '1.00 - 19.99', min: 1, max: 19.99 },
  { label: '20.00 - 39.99', min: 20, max: 39.99 },
  { label: '40.00 - 89.99', min: 40, max: 89.99 },
  { label: '100.00 - 149.99', min: 100, max: 149.99 },
];

const SIZES = ['XS', 'SM', 'MD', 'LG', 'XL'];

export default function FilterSidebar({ products, selectedPrices, selectedSizes, selectedBrands, onPriceChange, onSizeChange, onBrandChange }) {
  const [priceOpen, setPriceOpen] = useState(true);
  const [sizeOpen, setSizeOpen] = useState(true);
  const [brandOpen, setBrandOpen] = useState(true);

  // Derive sorted unique brands from the products data
  const allBrands = [...new Set(products.map((p) => p.brand))].sort();

  // Count products per price range
  const priceCount = (range) =>
    products.filter((p) => p.price >= range.min && p.price <= range.max).length;

  // Count products per size
  const sizeCount = (size) =>
    products.filter((p) => p.sizes.includes(size)).length;

  // Count products per brand
  const brandCount = (brand) =>
    products.filter((p) => p.brand === brand).length;

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
      {/* A11Y-GEN2 no-esc-close: no Escape key handler — keyboard users cannot collapse the Price disclosure with Escape */}
      <div className="filter-group">
        {/* A11Y-GEN2 no-aria-expanded: aria-expanded removed — screen readers cannot tell whether the Price section is open or closed */}
        {/* A11Y-GEN2 no-aria-controls: aria-controls removed — no programmatic link from the Price toggle button to its controlled panel */}
        <button
          className="filter-group-header"
          onClick={() => setPriceOpen((o) => !o)}
          aria-describedby="filter-section-title"
        >
          {/* A11Y-AXE duplicate-id-aria: id="filter-section-title" is repeated on the Size filter span below */}
          <span id="filter-section-title">Price</span>
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
          <ul className="filter-options" role="list" aria-label="Filter by price">
            {/* A11Y-GEN2 no-aria-owns: id removed from Price panel — the toggle button has no aria-controls/aria-owns association to this panel */}
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
      {/* A11Y-GEN2 no-esc-close: no Escape key handler — keyboard users cannot collapse the Size disclosure with Escape */}
      <div className="filter-group">
        {/* A11Y-GEN2 no-aria-expanded: aria-expanded removed — screen readers cannot tell whether the Size section is open or closed */}
        {/* A11Y-GEN2 no-aria-controls: aria-controls removed — no programmatic link from the Size toggle button to its controlled panel */}
        <button
          className="filter-group-header"
          onClick={() => setSizeOpen((o) => !o)}
          aria-describedby="filter-section-title"
        >
          {/* A11Y-AXE duplicate-id-aria: id="filter-section-title" duplicates the same ID used on the Price filter span above */}
          <span id="filter-section-title">Size</span>
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
          <ul className="filter-options" role="list" aria-label="Filter by size">
            {/* A11Y-GEN2 no-aria-owns: id removed from Size panel — the toggle button has no aria-controls/aria-owns association to this panel */}
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

      {/* Brand Filter */}
      {/* A11Y-GEN2 no-esc-close: no Escape key handler — keyboard users cannot collapse the Brand disclosure with Escape */}
      <div className="filter-group">
        {/* A11Y-GEN2 no-aria-expanded: aria-expanded removed — screen readers cannot tell whether the Brand section is open or closed */}
        {/* A11Y-GEN2 no-aria-controls: aria-controls removed — no programmatic link from the Brand toggle button to its controlled panel */}
        <button
          className="filter-group-header"
          onClick={() => setBrandOpen((o) => !o)}
        >
          <span>Brand</span>
          <svg
            className={`filter-chevron ${brandOpen ? 'open' : ''}`}
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        {brandOpen && (
          <ul className="filter-options" role="list" aria-label="Filter by brand">
            {/* A11Y-GEN2 no-aria-owns: id removed from Brand panel — the toggle button has no aria-controls/aria-owns association to this panel */}
            {allBrands.map((brand) => {
              const count = brandCount(brand);
              const checked = selectedBrands.includes(brand);
              return (
                <li key={brand}>
                  <label className="filter-option">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onBrandChange(brand)}
                      aria-label={`Brand ${brand} (${count} products)`}
                    />
                    <span className="filter-option-label">
                      {brand}
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

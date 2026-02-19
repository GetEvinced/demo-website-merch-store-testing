import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import FilterSidebar from '../components/FilterSidebar';
import ProductCard from '../components/ProductCard';
import products from '../data/products.json';
import './NewPage.css';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance (Default)' },
  { value: 'a-z', label: 'A to Z' },
  { value: 'price-asc', label: 'Price Low to High' },
  { value: 'price-desc', label: 'Price High to Low' },
  { value: 'new', label: 'New' },
];

export default function NewPage() {
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sort, setSort] = useState('relevance');
  const [sortOpen, setSortOpen] = useState(false);

  const handlePriceChange = (range) => {
    setSelectedPrices((prev) =>
      prev.some((r) => r.label === range.label)
        ? prev.filter((r) => r.label !== range.label)
        : [...prev, range]
    );
  };

  const handleSizeChange = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleBrandChange = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Price filter
    if (selectedPrices.length > 0) {
      result = result.filter((p) =>
        selectedPrices.some((r) => p.price >= r.min && p.price <= r.max)
      );
    }

    // Size filter
    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        selectedSizes.some((size) => p.sizes.includes(size))
      );
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand));
    }

    // Sort
    switch (sort) {
      case 'a-z':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    return result;
  }, [selectedPrices, selectedSizes, selectedBrands, sort]);

  const activeFiltersCount = selectedPrices.length + selectedSizes.length + selectedBrands.length;

  const clearAllFilters = () => {
    setSelectedPrices([]);
    setSelectedSizes([]);
    setSelectedBrands([]);
  };

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label || 'Relevance';

  return (
    <div className="new-page">
      <div className="new-page-inner">
        {/* Page heading + breadcrumb */}
        <div className="new-page-heading">
          <h1>New</h1>
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true"> | </span>
            <span aria-current="page">New</span>
          </nav>
        </div>

        <div className="new-page-body">
          {/* Filter sidebar */}
          <FilterSidebar
            products={products}
            selectedPrices={selectedPrices}
            selectedSizes={selectedSizes}
            selectedBrands={selectedBrands}
            onPriceChange={handlePriceChange}
            onSizeChange={handleSizeChange}
            onBrandChange={handleBrandChange}
          />

          {/* Products area */}
          <div className="new-page-products">
            {/* Toolbar */}
            <div className="products-toolbar">
              <div className="products-toolbar-left">
                <p className="products-found" aria-live="polite" aria-atomic="true">
                  <strong>{filteredProducts.length}</strong> Products Found
                </p>
                {activeFiltersCount > 0 && (
                  <button className="clear-filters-btn" onClick={clearAllFilters}>
                    Clear all filters ({activeFiltersCount})
                  </button>
                )}
              </div>
              <div className="sort-dropdown" role="group" aria-label="Sort products">
                <button
                  className="sort-btn"
                  onClick={() => setSortOpen((o) => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={sortOpen}
                >
                  Sort by {currentSortLabel}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                {sortOpen && (
                  <ul className="sort-options" role="listbox" aria-label="Sort options">
                    {SORT_OPTIONS.map((opt) => (
                      <li
                        key={opt.value}
                        role="option"
                        aria-selected={sort === opt.value}
                        className={`sort-option ${sort === opt.value ? 'active' : ''}`}
                        onClick={() => { setSort(opt.value); setSortOpen(false); }}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setSort(opt.value); setSortOpen(false); } }}
                        tabIndex={0}
                      >
                        {opt.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Active filter chips */}
            {(selectedPrices.length > 0 || selectedSizes.length > 0 || selectedBrands.length > 0) && (
              <div className="active-filters" aria-label="Active filters">
                {selectedPrices.map((r) => (
                  <button
                    key={r.label}
                    className="filter-chip"
                    onClick={() => handlePriceChange(r)}
                    aria-label={`Remove price filter ${r.label}`}
                  >
                    ${r.label}
                    <span aria-hidden="true">×</span>
                  </button>
                ))}
                {selectedSizes.map((s) => (
                  <button
                    key={s}
                    className="filter-chip"
                    onClick={() => handleSizeChange(s)}
                    aria-label={`Remove size filter ${s}`}
                  >
                    Size: {s}
                    <span aria-hidden="true">×</span>
                  </button>
                ))}
                {selectedBrands.map((b) => (
                  <button
                    key={b}
                    className="filter-chip"
                    onClick={() => handleBrandChange(b)}
                    aria-label={`Remove brand filter ${b}`}
                  >
                    Brand: {b}
                    <span aria-hidden="true">×</span>
                  </button>
                ))}
              </div>
            )}

            {/* Product grid */}
            {filteredProducts.length === 0 ? (
              <div className="no-products" role="status">
                <p>No products match your selected filters.</p>
                <button className="clear-filters-btn" onClick={clearAllFilters}>Clear filters</button>
              </div>
            ) : (
              <div className="products-grid" role="list" aria-label="Products">
                {filteredProducts.map((product) => (
                  <div key={product.id} role="listitem">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

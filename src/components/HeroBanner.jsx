import React from 'react';
import { Link } from 'react-router-dom';
import './HeroBanner.css';

const HERO_IMAGE = '/images/home/New_Tees.png';

export default function HeroBanner() {
  return (
    <section className="hero-banner" aria-label="Featured promotion">
      <div className="hero-content">
        {/* A11Y-GEN3 heading-order: h3 used as page-level heading (should be h1) — skips heading levels, breaking document outline */}
        <h3>Winter Basics</h3>
        <p>Warm hues for cooler days</p>
        <Link to="/shop/new" className="hero-btn">Shop New</Link>
      </div>
      <div className="hero-image">
        {/* A11Y-AXE image-alt: <img> is missing an alt attribute — screen readers will read the filename instead */}
        <img src={HERO_IMAGE} />
      </div>
    </section>
  );
}

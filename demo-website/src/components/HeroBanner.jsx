import React from 'react';
import { Link } from 'react-router-dom';
import './HeroBanner.css';

const HERO_IMAGE = '/images/home/New_Tees.png';

export default function HeroBanner() {
  return (
    <section className="hero-banner" aria-label="Featured promotion">
      <div className="hero-content">
        <h1>Winter Basics</h1>
        <p>Warm hues for cooler days</p>
        <Link to="/shop/new" className="hero-btn">Shop New</Link>
      </div>
      <div className="hero-image">
        <img src={HERO_IMAGE} alt="Winter Basics - Google branded t-shirts in warm colors" />
      </div>
    </section>
  );
}

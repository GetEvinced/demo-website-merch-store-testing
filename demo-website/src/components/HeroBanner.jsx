import React from 'react';
import './HeroBanner.css';

const HERO_IMAGE = 'https://ik.imagekit.io/RM/store/20160512512/assets/images/Home%20Page/New_Tees.png?tr=w-1000';

export default function HeroBanner() {
  return (
    <section className="hero-banner" aria-label="Featured promotion">
      <div className="hero-content">
        <h1>Winter Basics</h1>
        <p>Warm hues for cooler days</p>
        <a href="#" className="hero-btn">Shop New</a>
      </div>
      <div className="hero-image">
        <img src={HERO_IMAGE} alt="Winter Basics - Google branded t-shirts in warm colors" />
      </div>
    </section>
  );
}

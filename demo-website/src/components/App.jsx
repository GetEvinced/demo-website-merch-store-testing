import React from 'react';
import './App.css';
import Header from './Header';
import HeroBanner from './HeroBanner';
import PopularSection from './PopularSection';
import FeaturedPair from './FeaturedPair';
import TrendingCollections from './TrendingCollections';
import TheDrop from './TheDrop';
import Footer from './Footer';

export default function App() {
  return (
    <div className="app">
      <a href="#main-content" className="skip-link">Skip Navigation Links</a>
      <Header />
      <main id="main-content">
        <HeroBanner />
        <PopularSection />
        <FeaturedPair />
        <TrendingCollections />
        <TheDrop />
      </main>
      <Footer />
    </div>
  );
}

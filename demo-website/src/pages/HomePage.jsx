import React from 'react';
import HeroBanner from '../components/HeroBanner';
import PopularSection from '../components/PopularSection';
import FeaturedPair from '../components/FeaturedPair';
import TrendingCollections from '../components/TrendingCollections';
import TheDrop from '../components/TheDrop';

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <PopularSection />
      <FeaturedPair />
      <TrendingCollections />
      <TheDrop />
    </>
  );
}

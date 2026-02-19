import React from 'react';
import './FeaturedPair.css';

const items = [
  {
    id: 1,
    eyebrow: "Hat Hair, Don't Care",
    title: 'Keep on Truckin\'',
    shopLabel: 'Shop Headgear',
    shopHref: '#headgear',
    image: 'https://ik.imagekit.io/RM/store/20160512512/assets/images/Home%20Page/SuperGTrucker-2.png?tr=w-750',
    imageAlt: 'Headgear - Google Super G Trucker Hat',
    bg: '#f5f5f5',
  },
  {
    id: 2,
    eyebrow: 'New Year, New Adventure',
    title: 'Limited edition and traveling fast',
    shopLabel: 'Shop Chrome Dino Collection',
    shopHref: '#chrome-dino',
    image: 'https://ik.imagekit.io/RM/store/20160512512/assets/images/Home%20Page/Maps_Dino.png?tr=w-750',
    imageAlt: 'Google Dino Figurine',
    bg: '#eef4fb',
  },
];

export default function FeaturedPair() {
  return (
    <section className="featured-pair" aria-label="Featured categories">
      {items.map((item) => (
        <div key={item.id} className="featured-card" style={{ background: item.bg }}>
          <div className="featured-card-info">
            <p className="featured-eyebrow">{item.eyebrow}</p>
            <h3>{item.title}</h3>
            <a href={item.shopHref} className="shop-link-outline">{item.shopLabel}</a>
          </div>
          <div className="featured-card-image">
            <img src={item.image} alt={item.imageAlt} loading="lazy" />
          </div>
        </div>
      ))}
    </section>
  );
}

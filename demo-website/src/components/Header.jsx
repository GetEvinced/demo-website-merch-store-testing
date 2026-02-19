import React, { useState } from 'react';
import './Header.css';

const GOOGLE_LOGO = 'https://shop.merch.google/_next/image?url=https%3A%2F%2Fik.imagekit.io%2FRM%2Ficons%2FlogoHead.jpg%3FupdatedAt%3D1691159007487%26tr%3Dw-250&w=256&q=75';

const navItems = [
  { label: 'New', href: '#' },
  { label: 'Apparel', href: '#' },
  { label: 'Lifestyle', href: '#' },
  { label: 'Stationery', href: '#' },
  { label: 'Collections', href: '#' },
  { label: 'Shop by Brand', href: '#' },
  { label: 'Sale', href: '#', className: 'sale' },
];

export default function Header() {
  const [cartCount] = useState(0);

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-top">
          <div className="header-logo">
            <img src={GOOGLE_LOGO} alt="Google Merch Shop logo" />
          </div>
          <div className="header-icons">
            <button className="icon-btn" aria-label="Wishlist">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              <span>Wishlist</span>
            </button>
            <button className="icon-btn" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <span>Search</span>
            </button>
            <button className="icon-btn cart-btn" aria-label="Shopping cart">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              <span>Basket</span>
              <span className="cart-count">{cartCount}</span>
            </button>
            <button className="icon-btn" aria-label="Login">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span>Login</span>
            </button>
            <div className="flag-group">
              <img src="https://ik.imagekit.io/RM/icons/united-states-of-america.png?updatedAt=1688736331973" alt="United States Flag" width="24" height="24" />
              <img src="https://ik.imagekit.io/RM/icons/canada.png?updatedAt=1691195998100" alt="Canada Flag" width="24" height="24" />
            </div>
          </div>
        </div>
        <nav className="header-nav" aria-label="Main navigation">
          <ul>
            {navItems.map((item) => (
              <li key={item.label}>
                <a href={item.href} className={item.className || ''}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

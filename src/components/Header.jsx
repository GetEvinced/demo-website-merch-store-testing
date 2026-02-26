import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './Header.css';

const EvincedLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="139.374" height="25" viewBox="0 0 139.374 25" aria-label="Evinced logo" role="img">
    <defs>
      <clipPath id="clip-path">
        <rect id="Rectangle_1184" data-name="Rectangle 1184" width="139.374" height="25" fill="none" />
      </clipPath>
    </defs>
    <g id="Group_1612" data-name="Group 1612" transform="translate(0 0.001)">
      <g id="Group_1612-2" data-name="Group 1612" transform="translate(0 -0.001)" clipPath="url(#clip-path)">
        <path d="M194.771,22.908a2.713,2.713,0,1,0,2.713-2.713,2.713,2.713,0,0,0-2.713,2.713" transform="translate(-73.346 -7.605)" fill="#966dc0" />
        <path d="M194.771,12.854a2.713,2.713,0,1,0,2.713-2.713,2.713,2.713,0,0,0-2.713,2.713" transform="translate(-73.346 -3.819)" fill="#f20587" />
        <path d="M194.771,2.8A2.713,2.713,0,1,0,197.484.088,2.713,2.713,0,0,0,194.771,2.8" transform="translate(-73.346 -0.033)" fill="#f20587" />
        <path d="M204.814,12.854a2.713,2.713,0,1,0,2.713-2.713,2.713,2.713,0,0,0-2.713,2.713" transform="translate(-77.128 -3.819)" fill="#966dc0" />
        <path d="M204.814,2.8A2.713,2.713,0,1,0,207.527.088,2.713,2.713,0,0,0,204.814,2.8" transform="translate(-77.128 -0.033)" fill="#f20587" />
        <path d="M214.859,22.908a2.713,2.713,0,1,0,2.713-2.713,2.713,2.713,0,0,0-2.713,2.713" transform="translate(-80.91 -7.605)" fill="#2578e0" />
        <path d="M214.859,2.8A2.713,2.713,0,1,0,217.572.088,2.713,2.713,0,0,0,214.859,2.8" transform="translate(-80.91 -0.033)" fill="#966dc0" />
        <rect width="3.107" height="16.401" transform="translate(36.706 8.252)" fill="#1b3050" />
        <path d="M82.845,13.613a5.911,5.911,0,0,0-3.3-.931,6.644,6.644,0,0,0-3.349.846,6.076,6.076,0,0,0-1.863,1.617V13.028H71.229v16.4h3.108v-9.59a4.377,4.377,0,0,1,.551-2.184,4.013,4.013,0,0,1,1.519-1.519,4.376,4.376,0,0,1,2.21-.552,4.048,4.048,0,0,1,3.039,1.209,4.231,4.231,0,0,1,1.175,3.072v9.564l3.1,0V19.238a6.516,6.516,0,0,0-.829-3.194,6.754,6.754,0,0,0-2.262-2.431" transform="translate(-26.823 -4.775)" fill="#1b3050" />
        <path d="M35.97,24.8,30.926,13.237H27.472L35,29.638H36.83l7.527-16.4H41.043Z" transform="translate(-10.345 -4.985)" fill="#1b3050" />
        <path d="M12.486,13.72a7.725,7.725,0,0,0-4.022-1.036,8.312,8.312,0,0,0-7.34,4.177A8.512,8.512,0,0,0,0,21.212,8.477,8.477,0,0,0,1.141,25.6a8.331,8.331,0,0,0,3.108,3.055,8.765,8.765,0,0,0,4.419,1.122,9.222,9.222,0,0,0,3.644-.724A7.637,7.637,0,0,0,15.2,26.944l-2-2.037a5.255,5.255,0,0,1-1.986,1.446,6.522,6.522,0,0,1-2.538.483,5.954,5.954,0,0,1-2.935-.708,4.853,4.853,0,0,1-1.968-2,6.32,6.32,0,0,1-.577-1.737H16.025a8.4,8.4,0,0,0,.138-.915q.035-.4.034-.743a8.609,8.609,0,0,0-.984-4.143,7.266,7.266,0,0,0-2.727-2.868M5.6,16.237a5.535,5.535,0,0,1,2.8-.691,4.965,4.965,0,0,1,2.588.645,4.313,4.313,0,0,1,1.658,1.8,6.162,6.162,0,0,1,.526,1.813H3.191a6.176,6.176,0,0,1,.541-1.63A4.722,4.722,0,0,1,5.6,16.237" transform="translate(0 -4.776)" fill="#1b3050" />
        <path d="M113.6,40.1Z" transform="translate(-42.778 -15.1)" fill="#1b3050" />
        <path d="M169.213,0V10.533a6.421,6.421,0,0,0-2.176-1.848,7.042,7.042,0,0,0-3.315-.777,7.44,7.44,0,0,0-4.075,1.14A8.225,8.225,0,0,0,156.8,12.12a8.953,8.953,0,0,0-1.053,4.351,8.953,8.953,0,0,0,1.053,4.351,8.1,8.1,0,0,0,2.848,3.055A7.524,7.524,0,0,0,163.722,25a7.116,7.116,0,0,0,3.349-.776,6.229,6.229,0,0,0,2.141-1.834v2.265h3.142V0Zm-2.262,21.339a5,5,0,0,1-2.711.725h0a5.176,5.176,0,0,1-2.744-.725,5.082,5.082,0,0,1-1.865-1.986,6.106,6.106,0,0,1-.673-2.918,6.03,6.03,0,0,1,.673-2.883,4.992,4.992,0,0,1,4.575-2.711,5,5,0,0,1,2.711.725,5.2,5.2,0,0,1,1.83,1.968,6.077,6.077,0,0,1,.673,2.935,6.16,6.16,0,0,1-.656,2.883,5.038,5.038,0,0,1-1.813,1.986" transform="translate(-58.65 0)" fill="#1b3050" />
        <path d="M138.489,13.721a7.726,7.726,0,0,0-4.022-1.036,8.312,8.312,0,0,0-7.34,4.177A8.512,8.512,0,0,0,126,21.213a8.479,8.479,0,0,0,1.14,4.385,8.331,8.331,0,0,0,3.108,3.055,8.762,8.762,0,0,0,4.419,1.122,9.228,9.228,0,0,0,3.643-.728A7.637,7.637,0,0,0,141.2,26.94l-2-2.037a5.246,5.246,0,0,1-1.986,1.45,6.522,6.522,0,0,1-2.538.483,5.954,5.954,0,0,1-2.935-.708,4.853,4.853,0,0,1-1.968-2,6.316,6.316,0,0,1-.577-1.736h12.838a8.4,8.4,0,0,0,.138-.915q.035-.4.034-.743a8.6,8.6,0,0,0-.984-4.143,7.261,7.261,0,0,0-2.728-2.868M131.6,16.237a5.535,5.535,0,0,1,2.8-.691,4.968,4.968,0,0,1,2.592.645,4.313,4.313,0,0,1,1.658,1.8,6.162,6.162,0,0,1,.526,1.813h-9.978a6.211,6.211,0,0,1,.541-1.63,4.722,4.722,0,0,1,1.865-1.933" transform="translate(-47.45 -4.776)" fill="#1b3050" />
        <path d="M110.825,26.315a6.036,6.036,0,0,1-2.4.466,5.263,5.263,0,0,1-2.762-.725,5.2,5.2,0,0,1-1.9-1.968,5.806,5.806,0,0,1-.691-2.868,5.806,5.806,0,0,1,.691-2.868,5.07,5.07,0,0,1,1.9-1.951,5.361,5.361,0,0,1,2.762-.708,6.025,6.025,0,0,1,2.4.466,4.935,4.935,0,0,1,1.847,1.364l2.072-2.072a7.812,7.812,0,0,0-2.8-2.057,8.712,8.712,0,0,0-3.522-.708,8.6,8.6,0,0,0-4.368,1.122,8.243,8.243,0,0,0-3.073,3.055,8.506,8.506,0,0,0-1.122,4.351,8.534,8.534,0,0,0,1.122,4.333,8.333,8.333,0,0,0,3.073,3.09,8.5,8.5,0,0,0,4.368,1.137,8.657,8.657,0,0,0,3.539-.716,7.815,7.815,0,0,0,2.78-2.037l-2.037-2.072a5.244,5.244,0,0,1-1.882,1.364" transform="translate(-37.605 -4.778)" fill="#1b3050" />
        <path d="M139.907,40.1h0Z" transform="translate(-52.685 -15.1)" fill="#1b3050" />
      </g>
    </g>
  </svg>
);

const navItems = [
  { label: 'New', href: '/shop/new' },
  {
    label: 'Apparel',
    href: '/shop/new',
    submenu: [
      { label: "Men's / Unisex", href: '/shop/new' },
      { label: "Women's", href: '/shop/new' },
      { label: 'Kids', href: '/shop/new' },
      { label: 'Hats', href: '/shop/new' },
      { label: 'Accessories', href: '/shop/new' },
      { label: 'Socks', href: '/shop/new' },
    ],
  },
  {
    label: 'Lifestyle',
    href: '/shop/new',
    submenu: [
      { label: 'Bags', href: '/shop/new' },
      { label: 'Drinkware', href: '/shop/new' },
      { label: 'Eco-Friendly', href: '/shop/new' },
      { label: 'Fun and Games', href: '/shop/new' },
      { label: 'Everything Else', href: '/shop/new' },
    ],
  },
  {
    label: 'Stationery',
    href: '/shop/new',
    submenu: [
      { label: 'Notebooks', href: '/shop/new' },
      { label: 'Stickers', href: '/shop/new' },
      { label: 'Writing', href: '/shop/new' },
      { label: 'Greeting Cards', href: '/shop/new' },
    ],
  },
  {
    label: 'Collections',
    href: '/shop/new',
    submenu: [
      { label: 'Super G', href: '/shop/new' },
      { label: 'Google Bike', href: '/shop/new' },
      { label: 'Chrome Dino', href: '/shop/new' },
      { label: 'For Everyone', href: '/shop/new' },
      { label: 'Emoji', href: '/shop/new' },
      { label: 'Kid Approved', href: '/shop/new' },
      { label: 'Doogler/Mewgler', href: '/shop/new' },
      { label: 'Pride', href: '/shop/new' },
      { label: 'Campus Collection', href: '/shop/new' },
    ],
  },
  {
    label: 'Shop by Brand',
    href: '/shop/new',
    submenu: [
      { label: 'Android', href: '/shop/new' },
      { label: 'Gemini', href: '/shop/new' },
      { label: 'Google', href: '/shop/new' },
      { label: 'Google Cloud', href: '/shop/new' },
      { label: 'Google Maps', href: '/shop/new' },
      { label: 'YouTube', href: '/shop/new' },
    ],
  },
  { label: 'Sale', href: '/shop/new', className: 'sale' },
];

export default function Header() {
  const { totalCount, openCart } = useCart();
  const { totalCount: wishlistCount, openWishlist } = useWishlist();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);
  const navRef = useRef(null);

  // Close menu when clicking outside the nav
  useEffect(() => {
    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-top">
          <div className="header-logo">
            <Link to="/" aria-label="Evinced home">
              <EvincedLogo />
            </Link>
          </div>
          <div className="header-icons">
            {/* A11Y-GEN1 interactable-role + keyboard-accessible: div used as a button without role="button" or tabindex, not keyboard accessible */}
            <div className="icon-btn wishlist-btn" onClick={openWishlist} style={{cursor:'pointer'}}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="wishlist-count" aria-hidden="true">{wishlistCount}</span>
              )}
            </div>
            {/* A11Y-GEN1 accessible-name: icon-only button with no aria-label — screen readers have no name to announce */}
            {/* A11Y-GEN1 interactable-role + keyboard-accessible: div used as a button without role="button" or tabindex */}
            <div className="icon-btn" style={{cursor:'pointer'}}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <span aria-hidden="true">Search</span>
            </div>
            {/* A11Y-GEN2 no-accessible-name: aria-label removed from cart launcher button — screen readers have no accessible name for this control */}
            <button className="icon-btn cart-btn" onClick={openCart}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              <span>Basket</span>
              {/* A11Y-UNDETECTABLE live-region: cart count badge has aria-hidden="true" and there is no
                  aria-live region anywhere to announce count changes — when an item is added to the cart
                  the badge updates visually but screen reader users receive no feedback that the cart
                  has changed */}
              <span className="cart-count" aria-hidden="true">{totalCount}</span>
            </button>
            {/* A11Y-GEN1 accessible-name: icon button with no accessible name — aria-label removed */}
            {/* A11Y-GEN1 interactable-role + keyboard-accessible: div used as a button without role="button" or tabindex */}
            <div className="icon-btn" style={{cursor:'pointer'}}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span aria-hidden="true">Login</span>
            </div>
            {/* A11Y-GEN1 interactable-role + keyboard-accessible: div acting as a region selector toggle without role="button" or tabindex — not keyboard accessible */}
            <div className="flag-group" onClick={() => {}} style={{ cursor: 'pointer' }}>
              <img src="/images/icons/united-states-of-america.png" alt="United States Flag" width="24" height="24" />
              <img src="/images/icons/canada.png" alt="Canada Flag" width="24" height="24" />
            </div>
          </div>
        </div>
        <nav className="header-nav" aria-label="Main navigation" ref={navRef}>
          <ul>
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.href && !item.submenu && !item.className;
              const isOpen = openMenu === item.label;
              // A11Y-GEN3 keyboard-order: tabIndex set in reverse visual order so keyboard tab
              // sequence is the opposite of the visual left-to-right order — violates WCAG 2.4.3
              // Focus Order. Visual order: New → … → Sale. Tab order: Sale → … → New.
              const reverseTabIndex = navItems.length - index;
              return (
                <li
                  key={item.label}
                  className={[item.submenu ? 'has-submenu' : '', isOpen ? 'submenu-open' : ''].join(' ').trim()}
                  onMouseEnter={() => item.submenu && setOpenMenu(item.label)}
                  onMouseLeave={() => item.submenu && setOpenMenu(null)}
                >
                  <Link
                    to={item.href}
                    state={{ pageTitle: item.label }}
                    className={[item.className || '', isActive ? 'active' : ''].join(' ').trim()}
                    aria-current={isActive ? 'page' : undefined}
                    aria-haspopup={item.submenu ? 'true' : undefined}
                    aria-expanded={item.submenu ? isOpen : undefined}
                    onClick={() => setOpenMenu(null)}
                    tabIndex={reverseTabIndex}
                  >
                    {item.label}
                  </Link>
                  {item.submenu && (
                    <ul className="submenu" role="menu">
                      {item.submenu.map((sub) => (
                        <li key={sub.label} role="none">
                          <Link
                            to={sub.href}
                            state={{ pageTitle: sub.label }}
                            role="menuitem"
                            onClick={() => setOpenMenu(null)}
                          >
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}

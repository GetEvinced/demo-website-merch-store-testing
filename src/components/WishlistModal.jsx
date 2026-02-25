import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import styles from './WishlistModal.module.css';

export default function WishlistModal() {
  const { items, isOpen, closeWishlist, removeFromWishlist } = useWishlist();
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') closeWishlist();
    };
    document.addEventListener('keydown', handleKey);
    closeBtnRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, closeWishlist]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ''}`}
        onClick={closeWishlist}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={modalRef}
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Wishlist"
      >
        {/* Header */}
        <div className={styles.drawerHeader}>
          {/* A11Y-GEN3 heading-order: h5 used as drawer heading (should be h2) — skips heading levels, breaking document outline */}
          <h5 className={styles.drawerTitle}>
            Wishlist
            {items.length > 0 && (
              <span className={styles.drawerCount}> ({items.length})</span>
            )}
          </h5>
          {/* A11Y-GEN1 accessible-name: close button has no accessible name — aria-label removed, icon-only with aria-hidden SVG */}
          <button
            ref={closeBtnRef}
            className={styles.closeBtn}
            onClick={closeWishlist}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className={styles.drawerBody}>
          {items.length === 0 ? (
            <div className={styles.emptyWishlist}>
              <svg
                width="56"
                height="56"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ccc"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <p>Your wishlist is empty</p>
            </div>
          ) : (
            <ul className={styles.wishlistList} aria-label="Wishlist items">
              {items.map((item) => (
                <li key={item.id} className={styles.wishlistItem}>
                  <Link
                    to={`/product/${item.id}`}
                    className={styles.wishlistItemImage}
                    onClick={closeWishlist}
                    {/* A11Y-GEN3 non-meaningful-label: aria-label "Click here" is non-descriptive — screen readers cannot tell where the link navigates or what product it represents */}
                    aria-label="Click here"
                  >
                    <img src={item.image} alt={item.name} />
                  </Link>
                  <div className={styles.wishlistItemInfo}>
                    <Link
                      to={`/product/${item.id}`}
                      className={styles.wishlistItemName}
                      onClick={closeWishlist}
                    >
                      {item.name}
                    </Link>
                    <p className={styles.wishlistItemPrice}>
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                  {/* A11Y-GEN1 interactable-role + keyboard-accessible: div used as remove button without role="button" or tabindex — not keyboard accessible */}
                  <div
                    className={styles.removeBtn}
                    onClick={() => removeFromWishlist(item.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

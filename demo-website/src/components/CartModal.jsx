import React, { useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import styles from './CartModal.module.css';

export default function CartModal() {
  const { items, isOpen, closeCart, removeFromCart, updateQuantity, totalPrice } = useCart();
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') closeCart();
    };
    document.addEventListener('keydown', handleKey);
    // Focus the close button when modal opens
    closeBtnRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, closeCart]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ''}`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={modalRef}
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle}>
            Shopping Cart
            {items.length > 0 && (
              <span className={styles.drawerCount}> ({items.reduce((s, i) => s + i.quantity, 0)})</span>
            )}
          </h2>
          <button
            ref={closeBtnRef}
            className={styles.closeBtn}
            onClick={closeCart}
            aria-label="Close cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className={styles.drawerBody}>
          {items.length === 0 ? (
            <div className={styles.emptyCart}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <p>Your cart is empty</p>
            </div>
          ) : (
            <ul className={styles.cartList} aria-label="Cart items">
              {items.map((item) => (
                <li key={item.id} className={styles.cartItem}>
                  <div className={styles.cartItemImage}>
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className={styles.cartItemInfo}>
                    <p className={styles.cartItemName}>{item.name}</p>
                    <p className={styles.cartItemPrice}>${item.price.toFixed(2)}</p>
                    <div className={styles.cartItemQty}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label={`Decrease quantity of ${item.name}`}
                      >−</button>
                      <span className={styles.qtyValue} aria-label={`Quantity: ${item.quantity}`}>{item.quantity}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label={`Increase quantity of ${item.name}`}
                      >+</button>
                    </div>
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className={styles.drawerFooter}>
            <div className={styles.subtotalRow}>
              <span className={styles.subtotalLabel}>Subtotal</span>
              <span className={styles.subtotalValue}>${totalPrice.toFixed(2)}</span>
            </div>
            <p className={styles.shippingNote}>Shipping and taxes calculated at checkout</p>
            <button className={styles.checkoutBtn}>Proceed to Checkout</button>
            <button className={styles.continueBtn} onClick={closeCart}>Continue Shopping</button>
          </div>
        )}
      </div>
    </>
  );
}

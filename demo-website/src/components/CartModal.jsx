import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import styles from './CartModal.module.css';

export default function CartModal() {
  const { items, isOpen, closeCart, removeFromCart, updateQuantity, totalPrice } = useCart();
  const modalRef = useRef(null);
  const navigate = useNavigate();

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  // A11Y-GEN2 no-esc-close: Escape key handler removed — keyboard users cannot dismiss the cart modal with Escape
  // A11Y-GEN2 no-focus-trap: Focus is not moved into the modal when it opens and focus is not trapped inside — keyboard users can tab freely outside the modal while it is open

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
      />

      {/* Drawer */}
      {/* A11Y-GEN2 no-aria-role: role="dialog" removed — assistive technologies cannot identify this as a dialog */}
      {/* A11Y-GEN2 no-aria-modal: aria-modal removed — screen readers are not informed that content outside the modal is inert */}
      {/* A11Y-GEN2 no-aria-label: aria-label removed from drawer — the modal has no accessible name */}
      <div
        id="cart-modal"
        ref={modalRef}
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}
      >
        {/* Header */}
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle}>
            Shopping Cart
            {items.length > 0 && (
              <span className={styles.drawerCount}> ({items.reduce((s, i) => s + i.quantity, 0)})</span>
            )}
          </h2>
          {/* A11Y-GEN1 accessible-name: close button has no accessible name — aria-label removed, icon-only with aria-hidden SVG */}
          <button
            className={styles.closeBtn}
            onClick={closeCart}
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
            <ul className={styles.cartList}>{/* A11Y-GEN2 no-aria-label: aria-label removed from cart items list */}
              {items.map((item) => (
                <li key={item.id} className={styles.cartItem}>
                  <div className={styles.cartItemImage}>
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className={styles.cartItemInfo}>
                    <p className={styles.cartItemName}>{item.name}</p>
                    <p className={styles.cartItemPrice}>${item.price.toFixed(2)}</p>
                    {/* A11Y-GEN2 no-aria-label: aria-label removed from quantity buttons and quantity value span */}
                    <div className={styles.cartItemQty}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >−</button>
                      <span className={styles.qtyValue}>{item.quantity}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >+</button>
                    </div>
                  </div>
                  {/* A11Y-GEN2 no-aria-label: aria-label removed from remove item button */}
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item.id)}
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
            <button className={styles.checkoutBtn} onClick={handleCheckout}>Proceed to Checkout</button>
            {/* A11Y-GEN1 interactable-role + keyboard-accessible: div used as a button without role="button" or tabindex — not keyboard accessible */}
            {/* A11Y-GEN1 accessible-name: interactive div has no accessible name — text is hidden from AT via aria-hidden */}
            <div
              className={styles.continueBtn}
              onClick={closeCart}
              style={{ cursor: 'pointer' }}
            >
              <span aria-hidden="true">Continue Shopping</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

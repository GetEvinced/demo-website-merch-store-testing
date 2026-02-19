import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './CheckoutPage.css';

const STEPS = ['basket', 'shipping'];

export default function CheckoutPage() {
  const { items, totalPrice, updateQuantity, removeFromCart } = useCart();
  const [step, setStep] = useState('basket');
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    address: '',
    cardNumber: '',
    expirationDate: '',
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const totalCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="checkout-page">
      {/* Step indicator */}
      <div className="checkout-steps" aria-label="Checkout steps">
        <div className={`checkout-step ${step === 'basket' ? 'active' : 'done'}`}>
          <span className="step-num" aria-hidden="true">1</span>
          <span className="step-label">Shopping Cart</span>
        </div>
        <div className="step-divider" aria-hidden="true" />
        <div className={`checkout-step ${step === 'shipping' ? 'active' : ''}`}>
          <span className="step-num" aria-hidden="true">2</span>
          <span className="step-label">Shipping & Payment</span>
        </div>
      </div>

      {step === 'basket' && (
        <div className="checkout-basket">
          <h1 className="checkout-title">Shopping Cart</h1>

          {items.length === 0 ? (
            <div className="checkout-empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <p>There are no items in your shopping cart.</p>
              <Link to="/" className="checkout-back-link">Continue Shopping</Link>
            </div>
          ) : (
            <div className="checkout-layout">
              {/* Cart items */}
              <div className="checkout-items-col">
                <ul className="checkout-item-list" aria-label="Cart items">
                  {items.map((item) => (
                    <li key={item.id} className="checkout-item">
                      <div className="checkout-item-img">
                        <img src={item.image} alt={item.name} />
                      </div>
                      <div className="checkout-item-info">
                        <p className="checkout-item-name">{item.name}</p>
                        <p className="checkout-item-price">${item.price.toFixed(2)}</p>
                        <div className="checkout-item-qty">
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                          >−</button>
                          <span className="qty-val" aria-label={`Quantity: ${item.quantity}`}>{item.quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                          >+</button>
                        </div>
                      </div>
                      <div className="checkout-item-subtotal">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                      <button
                        className="checkout-item-remove"
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
                <div className="checkout-back-row">
                  <Link to="/" className="checkout-back-link">← Continue Shopping</Link>
                </div>
              </div>

              {/* Order summary */}
              <aside className="checkout-summary" aria-label="Order summary">
                <h2 className="summary-title">Order Summary</h2>
                <div className="summary-row">
                  <span>Items ({totalCount})</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span className="summary-free">FREE</span>
                </div>
                <div className="summary-row summary-row--total">
                  <span>Estimated Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <p className="summary-tax-note">Taxes calculated at next step</p>
                <button
                  className="checkout-continue-btn"
                  onClick={() => setStep('shipping')}
                >
                  Continue
                </button>
              </aside>
            </div>
          )}
        </div>
      )}

      {step === 'shipping' && (
        <div className="checkout-shipping">
          <h1 className="checkout-title">Shipping &amp; Payment</h1>
          <div className="checkout-layout">
            {/* Form */}
            <form
              className="shipping-form"
              onSubmit={(e) => e.preventDefault()}
              aria-label="Shipping and payment form"
              noValidate
            >
              <fieldset className="form-section">
                <legend className="form-section-legend">Contact &amp; Shipping</legend>

                <div className="form-row form-row--2col">
                  <div className="form-group">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      className="form-input"
                      value={form.firstName}
                      onChange={handleFormChange}
                      autoComplete="given-name"
                      placeholder="Jane"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      className="form-input"
                      value={form.lastName}
                      onChange={handleFormChange}
                      autoComplete="family-name"
                      placeholder="Smith"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="address" className="form-label">Address</label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    className="form-input"
                    value={form.address}
                    onChange={handleFormChange}
                    autoComplete="street-address"
                    placeholder="1600 Amphitheatre Pkwy, Mountain View, CA 94043"
                  />
                </div>
              </fieldset>

              <fieldset className="form-section">
                <legend className="form-section-legend">Payment</legend>

                <div className="form-group">
                  <label htmlFor="cardNumber" className="form-label">Credit Card Number</label>
                  <input
                    id="cardNumber"
                    name="cardNumber"
                    type="text"
                    className="form-input"
                    value={form.cardNumber}
                    onChange={handleFormChange}
                    autoComplete="cc-number"
                    placeholder="1234 5678 9012 3456"
                    inputMode="numeric"
                    maxLength={19}
                  />
                </div>

                <div className="form-row form-row--2col">
                  <div className="form-group">
                    <label htmlFor="expirationDate" className="form-label">Expiration Date</label>
                    <input
                      id="expirationDate"
                      name="expirationDate"
                      type="text"
                      className="form-input"
                      value={form.expirationDate}
                      onChange={handleFormChange}
                      autoComplete="cc-exp"
                      placeholder="MM / YY"
                      maxLength={7}
                    />
                  </div>
                </div>
              </fieldset>

              <div className="shipping-form-actions">
                <button
                  type="button"
                  className="checkout-back-btn"
                  onClick={() => setStep('basket')}
                >
                  ← Back to Cart
                </button>
                <button
                  type="submit"
                  className="ship-it-btn"
                >
                  Ship It!
                </button>
              </div>
            </form>

            {/* Mini order summary */}
            <aside className="checkout-summary" aria-label="Order summary">
              <h2 className="summary-title">Order Summary</h2>
              {items.map((item) => (
                <div key={item.id} className="summary-mini-item">
                  <div className="summary-mini-img">
                    <img src={item.image} alt={item.name} />
                    <span className="summary-mini-qty" aria-label={`Quantity ${item.quantity}`}>{item.quantity}</span>
                  </div>
                  <span className="summary-mini-name">{item.name}</span>
                  <span className="summary-mini-price">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="summary-divider" />
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className="summary-free">FREE</span>
              </div>
              <div className="summary-row summary-row--total">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}

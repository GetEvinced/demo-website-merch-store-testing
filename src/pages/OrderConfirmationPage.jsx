import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import './OrderConfirmationPage.css';

export default function OrderConfirmationPage() {
  const { state } = useLocation();

  // If someone navigates here directly without an order, redirect home
  if (!state?.orderId) {
    return <Navigate to="/" replace />;
  }

  const { orderId, firstName } = state;

  return (
    <div className="confirm-page">
      <div className="confirm-card">
        {/* Checkmark icon */}
        <div className="confirm-icon" aria-hidden="true">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="28" cy="28" r="28" fill="#e6f4ea" />
            <path d="M16 28.5L24 36.5L40 20" stroke="#188038" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="confirm-heading">Thank you{firstName ? `, ${firstName}` : ''}!</h1>
        <p className="confirm-subheading">Your order has been placed successfully.</p>

        <div className="confirm-order-id-box">
          <span className="confirm-order-id-label">Order ID</span>
          <span className="confirm-order-id-value">{orderId}</span>
        </div>

        <p className="confirm-note">
          We'll send a confirmation to your email shortly. Your items will be on their way soon!
        </p>

        {/* A11Y-GEN1 interactable-role + keyboard-accessible: div used as a navigation action without role="link" or tabindex — not keyboard accessible */}
        <div className="confirm-home-link" onClick={() => {}} style={{ cursor: 'pointer' }}>
          ← Back to Shop
        </div>
      </div>
    </div>
  );
}

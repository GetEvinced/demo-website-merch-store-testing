import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-links">
          <ul className="footer-list">
            <li><a href="#returns">Returns and Exchanges</a></li>
            <li><a href="#shipping">Shipping</a></li>
            {/* A11Y-GEN1 interactable-role + keyboard-accessible: div used as a link/button without role or tabindex — not keyboard accessible and semantics not conveyed */}
            <li><div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}>Sustainability</div></li>
          </ul>
          <ul className="footer-list">
            {/* A11Y-GEN1 accessible-name: anchor element with no text content and no aria-label — screen readers have nothing to announce */}
            {/* A11Y-GEN1 interactable-role + keyboard-accessible: div used as a link without role="link" or tabindex */}
            <li><div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}><span aria-hidden="true">FAQs</span></div></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

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
            <li><a href="#sustainability">Sustainability</a></li>
          </ul>
          <ul className="footer-list">
            <li><a href="mailto:googlesupport@robertsonmarketing.com">Email Us</a></li>
            <li><a href="#faqs">FAQs</a></li>
          </ul>
        </div>
        <div className="footer-bottom">
          <p>
            Operated by: <a href="https://robertsonmarketing.com/" target="_blank" rel="noopener noreferrer">Robertson Marketing</a>. All Rights Reserved. © 2026
          </p>
          <div className="footer-legal">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

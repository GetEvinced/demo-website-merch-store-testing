import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import { CartProvider } from '../context/CartContext';
import Header from './Header';
import Footer from './Footer';
import CartModal from './CartModal';
import HomePage from '../pages/HomePage';
import NewPage from '../pages/NewPage';
import ProductPage from '../pages/ProductPage';
import CheckoutPage from '../pages/CheckoutPage';

function AppInner() {
  const location = useLocation();
  const isCheckout = location.pathname === '/checkout';

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">Skip Navigation Links</a>
      <Header />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop/new" element={<NewPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
      </main>
      <Footer />
      {!isCheckout && <CartModal />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppInner />
      </CartProvider>
    </BrowserRouter>
  );
}

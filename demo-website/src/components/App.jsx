import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import Header from './Header';
import Footer from './Footer';
import CartModal from './CartModal';
import WishlistModal from './WishlistModal';
import HomePage from '../pages/HomePage';
import NewPage from '../pages/NewPage';
import ProductPage from '../pages/ProductPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrderConfirmationPage from '../pages/OrderConfirmationPage';

function AppInner() {
  const location = useLocation();
  const hideCart = ['/checkout', '/order-confirmation'].includes(location.pathname);

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
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
        </Routes>
      </main>
      <Footer />
      {!hideCart && <CartModal />}
      <WishlistModal />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <WishlistProvider>
          <AppInner />
        </WishlistProvider>
      </CartProvider>
    </BrowserRouter>
  );
}

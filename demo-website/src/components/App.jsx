import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './Header';
import Footer from './Footer';
import HomePage from '../pages/HomePage';
import NewPage from '../pages/NewPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <a href="#main-content" className="skip-link">Skip Navigation Links</a>
        <Header />
        <main id="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop/new" element={<NewPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

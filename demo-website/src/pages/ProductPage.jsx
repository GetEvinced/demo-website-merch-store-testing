import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import products from '../data/products.json';
import styles from './ProductPage.module.css';

export default function ProductPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const product = products.find((p) => p.id === parseInt(id, 10));

  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className={styles.notFound}>
        <h1>Product not found</h1>
        <Link to="/shop/new">← Back to New</Link>
      </div>
    );
  }

  const handleDecrement = () => setQuantity((q) => Math.max(1, q - 1));
  const handleIncrement = () => setQuantity((q) => Math.min(product.available, q + 1));
  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1 && val <= product.available) {
      setQuantity(val);
    }
  };

  return (
    <div className={styles.productPage}>
      <div className={styles.productPageInner}>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <Link to="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSep} aria-hidden="true"> | </span>
          <span aria-current="page">{product.name}</span>
        </nav>

        {/* Main content */}
        <div className={styles.productLayout}>
          {/* Left: Product image */}
          <div className={styles.productImageSection}>
            <div className={styles.productImageWrapper}>
              <img
                src={product.image}
                alt={product.name}
                className={styles.productImage}
              />
            </div>
          </div>

          {/* Right: Product details */}
          <div className={styles.productInfo}>
            {/* Name & Price */}
            <div className={styles.productHeader}>
              <h1 className={styles.productName}>{product.name}</h1>
              <p className={styles.productPrice}>${product.price.toFixed(2)}</p>
              <p className={styles.productSku}>
                <span className={styles.skuLabel}>SKU : </span>
                <span className={styles.skuValue}>{product.sku}</span>
              </p>
              <p className={styles.productDescription}>{product.description}</p>
            </div>

            {/* Quantity + Add to Cart */}
            <div className={styles.purchaseSection}>
              <div className={styles.quantityRow}>
                <div className={styles.quantityControl}>
                  <p className={styles.quantityLabel}>Quantity</p>
                  <div className={styles.quantityInputGroup}>
                    <button
                      className={styles.quantityBtn}
                      onClick={handleDecrement}
                      aria-label="Decrease quantity"
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      className={styles.quantityInput}
                      value={quantity}
                      min={1}
                      max={product.available}
                      onChange={handleQuantityChange}
                      aria-label="Change quantity"
                    />
                    <button
                      className={styles.quantityBtn}
                      onClick={handleIncrement}
                      aria-label="Increase quantity"
                      disabled={quantity >= product.available}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className={styles.availableCount}>
                  <span className={styles.availableLabel}>Available: </span>
                  <span className={styles.availableValue}>{product.available}</span>
                </div>
              </div>

              <button
                className={styles.addToCartBtn}
                aria-label={`Add ${product.name} to cart`}
                onClick={() => addToCart(product, quantity)}
              >
                ADD TO CART
              </button>

              <button
                className={`${styles.wishlistBtn} ${isInWishlist(product.id) ? styles.wishlistBtnActive : ''}`}
                aria-label={isInWishlist(product.id) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                aria-pressed={isInWishlist(product.id)}
                onClick={() => {
                  if (isInWishlist(product.id)) {
                    removeFromWishlist(product.id);
                  } else {
                    addToWishlist(product);
                  }
                }}
              >
                {isInWishlist(product.id) ? '♥ Added to Wishlist' : '♡ Add to Wishlist'}
              </button>
            </div>

            {/* Details */}
            {product.details && product.details.length > 0 && (
              <div className={styles.detailsSection}>
                <p className={styles.detailsHeading}>
                  <strong>Details:</strong>
                </p>
                <ul className={styles.detailsList}>
                  {product.details.map((detail, i) => (
                    <li key={i} className={styles.detailsItem}>{detail}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

# Demo E-Commerce Website

A React-based e-commerce demo website simulating a Google merchandise store. It features a homepage, a product listing page with filtering/sorting, product detail pages, a wishlist, a cart, and a multi-step checkout flow.

## Tech Stack

- **React 18** with functional components and hooks
- **React Router v7** for client-side routing
- **Webpack 5** as the bundler
- **CSS Modules** (for scoped component styles) alongside plain CSS files
- **Context API** for global cart and wishlist state
- No backend — all product data is static (`src/data/products.json`)

---

## URLs / Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Home | Landing page with hero banner, popular items, featured collections, and trending drops |
| `/shop/new` | Products (New) | Full product listing with filter sidebar and sort controls |
| `/product/:id` | Product Detail | Individual product page — quantity selector, add to cart, add/remove wishlist |
| `/checkout` | Checkout | Two-step flow: basket review → shipping & payment form |
| `/order-confirmation` | Order Confirmation | Success screen shown after a completed order |

---

## Project Structure

```
demo-website/
├── public/
│   ├── index.html              # HTML entry point
│   └── images/                 # Static assets (product photos, home banners, icons)
│       ├── home/
│       ├── icons/
│       └── products/
├── src/
│   ├── index.js                # React DOM render entry
│   ├── data/
│   │   └── products.json       # Static product catalogue (id, name, price, brand, sizes, image, …)
│   ├── context/
│   │   ├── CartContext.jsx     # Cart state & actions (add, remove, update qty, clear, total)
│   │   └── WishlistContext.jsx # Wishlist state & actions (add, remove, toggle)
│   ├── hooks/
│   │   └── useLocalStorage.js  # Generic hook to persist state in localStorage
│   ├── components/
│   │   ├── App.jsx             # Root component — router, providers, layout shell
│   │   ├── Header.jsx          # Top navigation bar with cart & wishlist icon buttons
│   │   ├── Footer.jsx          # Site footer
│   │   ├── CartModal.jsx       # Slide-in cart drawer (item list, quantities, totals)
│   │   ├── WishlistModal.jsx   # Slide-in wishlist drawer
│   │   ├── ProductCard.jsx     # Reusable card used in the product grid
│   │   ├── FilterSidebar.jsx   # Left-hand filter panel (price, size, brand checkboxes)
│   │   ├── HeroBanner.jsx      # Full-width hero on the homepage
│   │   ├── PopularSection.jsx  # "Popular" product highlights on homepage
│   │   ├── FeaturedPair.jsx    # Two-up featured product block on homepage
│   │   ├── TrendingCollections.jsx # Trending collections grid on homepage
│   │   └── TheDrop.jsx         # "The Drop" new-arrivals section on homepage
│   └── pages/
│       ├── HomePage.jsx            # Assembles homepage sections
│       ├── NewPage.jsx             # Product listing — filtering, sorting, product grid
│       ├── ProductPage.jsx         # Product detail — image, info, qty, add-to-cart/wishlist
│       ├── CheckoutPage.jsx        # Two-step checkout (basket → shipping/payment)
│       └── OrderConfirmationPage.jsx # Post-order success screen
├── package.json
└── webpack.config.js
```

---

## Key Features

### Homepage (`/`)
Composed of several marketing sections: `HeroBanner`, `PopularSection`, `FeaturedPair`, `TrendingCollections`, and `TheDrop`. Clicking products navigates to their detail page.

### Products Page (`/shop/new`)
- **Filter sidebar** (`FilterSidebar`) — filter by price range, size, and brand using checkboxes. Active filters are shown as dismissible chips.
- **Sort dropdown** — sort by relevance, A–Z, price low-to-high, price high-to-low, or newest.
- **Product grid** — responsive grid of `ProductCard` components, each linking to the product detail page.

### Product Detail Page (`/product/:id`)
- Displays product image, name, price, brand, description, and available sizes.
- Quantity stepper (bounded by available stock).
- **Add to Cart** button — adds the selected quantity to the global cart.
- **Wishlist toggle** — heart button to add/remove the product from the wishlist.

### Cart (`CartModal`)
- Accessible from the cart icon in the `Header` at all times (hidden on `/checkout` and `/order-confirmation`).
- Supports updating item quantities and removing items.
- Displays a running total and a "Checkout" button that navigates to `/checkout`.

### Wishlist (`WishlistModal`)
- Accessible from the wishlist icon in the `Header`.
- Lists wishlisted products with a link to each product detail page and a remove button.

### Checkout (`/checkout`)
Two steps managed by local state:
1. **Basket** — review cart items, adjust quantities, see total.
2. **Shipping & Payment** — form with first name, last name, address, card number, and expiration date. All fields are required; inline validation is shown on submit.

On success, the cart is cleared and the user is redirected to `/order-confirmation` with a generated order ID.

### Order Confirmation (`/order-confirmation`)
Displays a success message, the generated order ID, and the customer's first name.

---

## Running Locally

```bash
npm install
npm start   # starts webpack-dev-server, opens http://localhost:8080
```

To create a production build:

```bash
npm run build   # outputs to dist/
```

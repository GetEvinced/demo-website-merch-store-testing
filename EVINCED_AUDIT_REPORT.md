# Accessibility Audit Report — Demo Website

**Tool:** Evinced JS Playwright SDK v2.17.0  
**Date:** 2026-03-22  
**Auditor:** Automated Cloud Agent (Cursor)  
**Scope:** All five application routes of the React SPA at `http://localhost:3000`

---

## 1. Repository & Pages Overview

The application is a React 18 single-page application (Webpack 5, React Router v7) serving five distinct routes. Each route was scanned individually with `evAnalyze()` on a fully rendered page state.

| # | Page | Route | Entry Point |
|---|------|--------|-------------|
| 1 | Homepage | `/` | `src/pages/HomePage.jsx` |
| 2 | Products (New) | `/shop/new` | `src/pages/NewPage.jsx` |
| 3 | Product Detail | `/product/:id` | `src/pages/ProductPage.jsx` |
| 4 | Checkout | `/checkout` | `src/pages/CheckoutPage.jsx` (basket step) |
| 5 | Order Confirmation | `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` |

Shared components present on every page: `src/components/Header.jsx`, `src/components/Footer.jsx`, `src/components/CartModal.jsx`, `src/components/WishlistModal.jsx`.

---

## 2. Audit Summary

| Severity | Issue Count (Raw) | Unique Issue Groups |
|----------|-------------------|---------------------|
| **Critical** | **127** | **18** |
| Serious | 24 | 6 |
| **Total** | **151** | **24** |

**Per-page raw issue counts:**

| Page | Critical | Serious | Total |
|------|----------|---------|-------|
| Homepage | 32 | 3 | 35 |
| Products | 41 | 14 | 55 |
| Product Detail | 18 | 2 | 20 |
| Checkout | 18 | 3 | 21 |
| Order Confirmation | 18 | 2 | 20 |

**Critical issue types:**

| Evinced Type | Count | Description |
|---|---|---|
| `NOT_FOCUSABLE` | 48 | Interactive element unreachable by keyboard |
| `WRONG_SEMANTIC_ROLE` | 47 | Interactive element lacks correct ARIA role |
| `NO_DESCRIPTIVE_TEXT` | 18 | Interactive element has no accessible name |
| `AXE-BUTTON-NAME` | 8 | `<button>` with no discernible text |
| `AXE-COLOR-CONTRAST` | — | (Serious only; see §5) |
| `AXE-ARIA-VALID-ATTR-VALUE` | 3 | ARIA attribute with invalid value |
| `AXE-IMAGE-ALT` | 2 | `<img>` missing `alt` attribute |
| `AXE-ARIA-REQUIRED-ATTR` | 1 | ARIA role missing required attributes |

---

## 3. Critical Issues — Detailed Findings & Recommended Fixes

Each issue group lists: affected elements & pages, raw issue count, WCAG criteria violated, recommended fix, and rationale.

---

### CI-01 — Header: Wishlist button rendered as `<div>`

**Affected element:** `.wishlist-btn` — `src/components/Header.jsx`  
**Affected pages:** All 5 (Homepage, Products, Product Detail, Checkout, Order Confirmation)  
**Raw issue count:** 10 (WRONG_SEMANTIC_ROLE × 5 + NOT_FOCUSABLE × 5)  
**Evinced types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**WCAG:** 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A)  

**Current code (`src/components/Header.jsx`):**
```jsx
<div className="icon-btn wishlist-btn" onClick={openWishlist} style={{cursor:'pointer'}}>
  <svg ... aria-hidden="true">...</svg>
  <span>Wishlist</span>
  {wishlistCount > 0 && <span className="wishlist-count" aria-hidden="true">{wishlistCount}</span>}
</div>
```

**Recommended fix:**
```jsx
<button className="icon-btn wishlist-btn" onClick={openWishlist}>
  <svg ... aria-hidden="true">...</svg>
  <span>Wishlist</span>
  {wishlistCount > 0 && <span className="wishlist-count" aria-hidden="true">{wishlistCount}</span>}
</button>
```

**Rationale:** A `<div>` with an `onClick` handler is not reachable via keyboard Tab and is not announced as a button by screen readers. Replacing it with a native `<button>` element gives it the correct implicit ARIA role (`button`), makes it natively focusable, and activatable via Space/Enter — without any additional ARIA or `tabindex` attributes. The visible text "Wishlist" inside the button already serves as the accessible name.

---

### CI-02 — Header: Search icon button rendered as `<div>` with hidden label

**Affected element:** `.icon-btn:nth-child(2)` (search icon) — `src/components/Header.jsx`  
**Affected pages:** All 5  
**Raw issue count:** 15 (WRONG_SEMANTIC_ROLE × 5 + NOT_FOCUSABLE × 5 + NO_DESCRIPTIVE_TEXT × 5)  
**Evinced types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**WCAG:** 4.1.2 (A); 2.1.1 (A); 2.4.6 Headings and Labels (AA)  

**Current code:**
```jsx
<div className="icon-btn" style={{cursor:'pointer'}}>
  <svg ... aria-hidden="true">...</svg>
  <span aria-hidden="true">Search</span>
</div>
```

**Recommended fix:**
```jsx
<button className="icon-btn" aria-label="Search">
  <svg ... aria-hidden="true">...</svg>
  <span aria-hidden="true">Search</span>
</button>
```

**Rationale:** Same semantic role and focusability problems as CI-01. The additional issue here is that the visible "Search" label text has `aria-hidden="true"`, making the element have no accessible name at all. Replacing with `<button>` and adding `aria-label="Search"` resolves all three violation types simultaneously. The `aria-hidden` on the visual label can remain since `aria-label` provides the programmatic name independently.

---

### CI-03 — Header: Login icon button rendered as `<div>` with hidden label

**Affected element:** `.icon-btn:nth-child(4)` (login icon) — `src/components/Header.jsx`  
**Affected pages:** All 5  
**Raw issue count:** 15 (WRONG_SEMANTIC_ROLE × 5 + NOT_FOCUSABLE × 5 + NO_DESCRIPTIVE_TEXT × 5)  
**Evinced types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**WCAG:** 4.1.2 (A); 2.1.1 (A); 2.4.6 (AA)  

**Current code:**
```jsx
<div className="icon-btn" style={{cursor:'pointer'}}>
  <svg ... aria-hidden="true">...</svg>
  <span aria-hidden="true">Login</span>
</div>
```

**Recommended fix:**
```jsx
<button className="icon-btn" aria-label="Login">
  <svg ... aria-hidden="true">...</svg>
  <span aria-hidden="true">Login</span>
</button>
```

**Rationale:** Identical pattern to CI-02. The "Login" text is aria-hidden so the `<div>` has no accessible name. A native `<button>` with `aria-label="Login"` corrects the role, focusability, and naming in one change.

---

### CI-04 — Header: Region selector (flag group) rendered as `<div>`

**Affected element:** `.flag-group` — `src/components/Header.jsx`  
**Affected pages:** All 5  
**Raw issue count:** 10 (WRONG_SEMANTIC_ROLE × 5 + NOT_FOCUSABLE × 5)  
**Evinced types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**WCAG:** 4.1.2 (A); 2.1.1 (A)  

**Current code:**
```jsx
<div className="flag-group" onClick={() => {}} style={{ cursor: 'pointer' }}>
  <img src="...united-states-of-america.png" alt="United States Flag" width="24" height="24" />
  <img src="...canada.png" alt="Canada Flag" width="24" height="24" />
</div>
```

**Recommended fix:**
```jsx
<button className="flag-group" aria-label="Select region">
  <img src="...united-states-of-america.png" alt="" width="24" height="24" />
  <img src="...canada.png" alt="" width="24" height="24" />
</button>
```

**Rationale:** The flag images are decorative in the context of a button that already has a clear `aria-label` describing its purpose. Converting to `<button>` with `aria-label="Select region"` makes it keyboard-accessible and correctly announced. The individual flag image `alt` values become redundant noise (the button label already explains the purpose), so they are set to `""` to suppress duplicate announcements.

---

### CI-05 — PopularSection: "Shop \*" links rendered as `<div>` with hidden text

**Affected elements:** `.product-card:nth-child(1|2|3) > .product-card-info > .shop-link`  
**Source file:** `src/components/PopularSection.jsx`  
**Affected pages:** Homepage only  
**Raw issue count:** 9 (WRONG_SEMANTIC_ROLE × 3 + NOT_FOCUSABLE × 3 + NO_DESCRIPTIVE_TEXT × 3)  
**Evinced types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**WCAG:** 4.1.2 (A); 2.1.1 (A); 2.4.4 Link Purpose (A)  

**Current code (per card):**
```jsx
<div
  className="shop-link"
  onClick={() => navigate(product.shopHref)}
  style={{ cursor: 'pointer' }}
>
  <span aria-hidden="true">{product.shopLabel}</span>
</div>
```

**Recommended fix:**
```jsx
<Link to={product.shopHref} className="shop-link">
  {product.shopLabel}
</Link>
```

**Rationale:** Navigation to a URL is the semantic job of an `<a>` element (React Router `<Link>`). Using `<div onClick>` with `navigate()` loses keyboard accessibility, the correct link role, and the accessible name (the label text is hidden from AT with `aria-hidden`). A `<Link>` element is natively focusable, carries the `link` role, and its visible text content becomes the accessible name automatically — removing the need for `aria-hidden`. This also benefits SEO through proper anchor semantics.

---

### CI-06 — Footer: "Sustainability" navigation item rendered as `<div>`

**Affected element:** `li:nth-child(3) > .footer-nav-item`  
**Source file:** `src/components/Footer.jsx`  
**Affected pages:** All 5  
**Raw issue count:** 10 (WRONG_SEMANTIC_ROLE × 5 + NOT_FOCUSABLE × 5)  
**Evinced types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**WCAG:** 4.1.2 (A); 2.1.1 (A)  

**Current code:**
```jsx
<li>
  <div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}>
    Sustainability
  </div>
</li>
```

**Recommended fix:**
```jsx
<li>
  <a href="#sustainability" className="footer-nav-item">Sustainability</a>
</li>
```

**Rationale:** Footer navigation items that navigate or trigger actions must use `<a>` or `<button>` elements. Since the current `onClick` is a no-op (empty arrow function) this appears to be a placeholder link; using `<a href="#sustainability">` gives it proper link semantics, native focusability, and keyboard activation. When a real target URL is defined it should replace `#sustainability`. The sibling list items already use `<a>` tags correctly — this brings the element in line with that pattern.

---

### CI-07 — Footer: "FAQs" navigation item rendered as `<div>` with hidden text

**Affected element:** `.footer-list:nth-child(2) > li > .footer-nav-item`  
**Source file:** `src/components/Footer.jsx`  
**Affected pages:** All 5  
**Raw issue count:** 15 (WRONG_SEMANTIC_ROLE × 5 + NOT_FOCUSABLE × 5 + NO_DESCRIPTIVE_TEXT × 5)  
**Evinced types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**WCAG:** 4.1.2 (A); 2.1.1 (A); 2.4.4 (A)  

**Current code:**
```jsx
<li>
  <div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}>
    <span aria-hidden="true">FAQs</span>
  </div>
</li>
```

**Recommended fix:**
```jsx
<li>
  <a href="#faqs" className="footer-nav-item">FAQs</a>
</li>
```

**Rationale:** Same pattern as CI-06 with the additional problem that the visible "FAQs" text is wrapped in `aria-hidden="true"`, making the element have no accessible name at all. Using a plain `<a>` element whose text content is "FAQs" resolves all three violation types: correct role, keyboard focusability, and accessible name from visible text.

---

### CI-08 — TheDrop: `role="slider"` missing required ARIA attributes

**Affected element:** `.drop-popularity-bar`  
**Source file:** `src/components/TheDrop.jsx`  
**Affected pages:** Homepage  
**Raw issue count:** 2 (NOT_FOCUSABLE × 1 + AXE-ARIA-REQUIRED-ATTR × 1)  
**Evinced types:** `NOT_FOCUSABLE`, `AXE-ARIA-REQUIRED-ATTR`  
**WCAG:** 4.1.2 (A); 2.1.1 (A)  

**Current code:**
```jsx
<div role="slider" aria-label="Popularity indicator" className="drop-popularity-bar"></div>
```

**Recommended fix (option A — if the bar is truly non-interactive):**
```jsx
<div role="meter" aria-label="Popularity indicator" aria-valuenow={75} aria-valuemin={0} aria-valuemax={100} className="drop-popularity-bar"></div>
```

**Recommended fix (option B — remove interactive role entirely):**
```jsx
<div aria-label="Popularity indicator" className="drop-popularity-bar"></div>
```

**Rationale:** The `slider` role requires `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`; omitting them is an outright ARIA spec violation. The element also lacks `tabindex="0"` which means keyboard users cannot reach it even if it were interactive. If the bar only displays a read-only value, `role="meter"` with the three required value attributes is the semantically correct choice (option A). If the bar conveys no meaningful numerical value to AT, removing the role entirely (option B) is the safest approach.

---

### CI-09 — FeaturedPair: `<h1>` elements carry invalid `aria-expanded="yes"`

**Affected elements:** `.featured-card:nth-child(1) > .featured-card-info > h1`, `.featured-card:nth-child(2) > .featured-card-info > h1`  
**Source file:** `src/components/FeaturedPair.jsx`  
**Affected pages:** Homepage  
**Raw issue count:** 2 (AXE-ARIA-VALID-ATTR-VALUE × 2)  
**Evinced types:** `AXE-ARIA-VALID-ATTR-VALUE`  
**WCAG:** 4.1.2 (A)  

**Current code:**
```jsx
<h1 aria-expanded="yes">{item.title}</h1>
```

**Recommended fix:**
```jsx
<h1>{item.title}</h1>
```

**Rationale:** `aria-expanded` is not a valid attribute for heading elements; even when misapplied, its value must be `"true"` or `"false"` — not `"yes"`. Screen readers may announce "expanded" unpredictably, confusing users who expect heading text. Removing the attribute entirely is correct: headings do not control disclosure widgets and should not carry `aria-expanded`.

---

### CI-10 — HeroBanner: Hero image missing `alt` attribute

**Affected element:** `img[src$="New_Tees.png"]`  
**Source file:** `src/components/HeroBanner.jsx`  
**Affected pages:** Homepage  
**Raw issue count:** 1 (AXE-IMAGE-ALT × 1)  
**Evinced types:** `AXE-IMAGE-ALT`  
**WCAG:** 1.1.1 Non-text Content (Level A)  

**Current code:**
```jsx
<img src={HERO_IMAGE} />
```

**Recommended fix:**
```jsx
<img src={HERO_IMAGE} alt="Winter Basics — new tee shirts collection" />
```

**Rationale:** Images without `alt` attributes cause screen readers to fall back to reading the filename (`New_Tees.png`), which is meaningless to users. The hero image is content-bearing (it illustrates the "Winter Basics" promotion displayed in the adjacent heading), so it requires descriptive alternative text. If the image were purely decorative, `alt=""` would be correct; however, since there is meaningful context in this promotional banner, a short descriptive text is appropriate.

---

### CI-11 — TheDrop: Product image missing `alt` attribute

**Affected element:** `img[src$="2bags_charms1.png"]`  
**Source file:** `src/components/TheDrop.jsx`  
**Affected pages:** Homepage  
**Raw issue count:** 1 (AXE-IMAGE-ALT × 1)  
**Evinced types:** `AXE-IMAGE-ALT`  
**WCAG:** 1.1.1 (A)  

**Current code:**
```jsx
<img src={DROP_IMAGE} loading="lazy" />
```

**Recommended fix:**
```jsx
<img src={DROP_IMAGE} loading="lazy" alt="Limited-edition plushie bag charms: Android, YouTube, and Super G" />
```

**Rationale:** Same reasoning as CI-10. This image is the primary visual for the "The Drop" section promoting limited-edition bag charms. Screen readers reading the raw filename is a degraded experience. The alt text should convey what items are depicted so screen-reader users get equivalent information to sighted users.

---

### CI-12 — CartModal: Close button has no accessible name

**Affected element:** `#cart-modal > div:nth-child(1) > button`  
**Source file:** `src/components/CartModal.jsx`  
**Affected pages:** Homepage, Products, Product Detail (3 pages where the cart modal is rendered)  
**Raw issue count:** 3 (AXE-BUTTON-NAME × 3)  
**Evinced types:** `AXE-BUTTON-NAME`  
**WCAG:** 4.1.2 (A)  

**Current code:**
```jsx
<button
  className={styles.closeBtn}
  onClick={closeCart}
>
  <svg width="20" height="20" ... aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
</button>
```

**Recommended fix:**
```jsx
<button
  className={styles.closeBtn}
  onClick={closeCart}
  aria-label="Close shopping cart"
>
  <svg width="20" height="20" ... aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
</button>
```

**Rationale:** The button contains only a decorative SVG (correctly marked `aria-hidden="true"`) with no visible text, giving it no accessible name. Screen readers announce it as just "button" with no context. `aria-label="Close shopping cart"` provides a meaningful, unique name that clearly communicates the button's purpose within the cart drawer.

---

### CI-13 — WishlistModal: Close button has no accessible name

**Affected element:** `div[role="dialog"] > div:nth-child(1) > button`  
**Source file:** `src/components/WishlistModal.jsx`  
**Affected pages:** All 5  
**Raw issue count:** 5 (AXE-BUTTON-NAME × 5)  
**Evinced types:** `AXE-BUTTON-NAME`  
**WCAG:** 4.1.2 (A)  

**Current code:**
```jsx
<button
  ref={closeBtnRef}
  className={styles.closeBtn}
  onClick={closeWishlist}
>
  <svg width="20" height="20" ... aria-hidden="true">...</svg>
</button>
```

**Recommended fix:**
```jsx
<button
  ref={closeBtnRef}
  className={styles.closeBtn}
  onClick={closeWishlist}
  aria-label="Close wishlist"
>
  <svg width="20" height="20" ... aria-hidden="true">...</svg>
</button>
```

**Rationale:** Identical pattern to CI-12. The wishlist modal already has correct `role="dialog"` and `aria-modal="true"` and even auto-focuses the close button on open — making this a particularly impactful fix, since the close button is the first element screen-reader users encounter. Adding `aria-label="Close wishlist"` completes the accessible naming chain.

---

### CI-14 — FilterSidebar: Filter options rendered as `<div>` (not keyboard-accessible checkboxes)

**Affected elements:** All `.filter-option` divs (Price: 4 × 2, Size: 5 × 2, Brand: 3 × 2 = 24 raw issues)  
**Source file:** `src/components/FilterSidebar.jsx`  
**Affected pages:** Products (`/shop/new`)  
**Raw issue count:** 24 (WRONG_SEMANTIC_ROLE × 12 + NOT_FOCUSABLE × 12)  
**Evinced types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**WCAG:** 4.1.2 (A); 2.1.1 (A); 1.3.1 Info and Relationships (A)  

**Current code (pattern, all three filter groups):**
```jsx
<div key={range.label} className="filter-option" onClick={() => onPriceChange(range)}>
  <div className={`custom-checkbox${checked ? ' custom-checkbox--checked' : ''}`}>
    {checked && <div className="custom-checkbox-checkmark" />}
  </div>
  <span className="filter-option-label">
    {range.label}
    <span className="filter-count">({count})</span>
  </span>
</div>
```

**Recommended fix:**
```jsx
<label key={range.label} className="filter-option">
  <input
    type="checkbox"
    checked={checked}
    onChange={() => onPriceChange(range)}
    className="filter-option-input"
  />
  <span className="filter-option-label">
    {range.label}
    <span className="filter-count">({count})</span>
  </span>
</label>
```

**Rationale:** The custom `<div>` rows visually mimic checkboxes but convey no semantic role, checked state, or label association to assistive technology. Native `<input type="checkbox">` wrapped in a `<label>` element is the most robust solution: it is natively keyboard-accessible (Space to toggle), announces the correct role (`checkbox`), communicates checked state, and associates the visible label text programmatically. The custom checkbox visual (`custom-checkbox` div) can be replaced by CSS-styled native input (using `appearance: none` and `::before`/`::after`) so visual design is preserved. The same pattern applies to all three filter groups (Price, Size, Brand).

---

### CI-15 — ProductPage: `<ul>` carries invalid `aria-relevant="changes"`

**Affected element:** `ul[aria-relevant="changes"]`  
**Source file:** `src/pages/ProductPage.jsx`  
**Affected pages:** Product Detail  
**Raw issue count:** 1 (AXE-ARIA-VALID-ATTR-VALUE × 1)  
**Evinced types:** `AXE-ARIA-VALID-ATTR-VALUE`  
**WCAG:** 4.1.2 (A)  

**Current code:**
```jsx
<ul
  className={styles.detailsList}
  aria-relevant="changes"
  aria-live="polite"
>
```

**Recommended fix:**
```jsx
<ul
  className={styles.detailsList}
  aria-relevant="additions text"
  aria-live="polite"
>
```

**Rationale:** The `aria-relevant` attribute accepts a space-separated list of tokens from the set `{ additions, removals, text, all }`. The value `"changes"` is not a valid token and is silently ignored by browsers, meaning the live region announces nothing. The most appropriate value for a list that displays updated product detail text is `"additions text"` — which tells AT to announce new items added to the list and text content changes, matching the intent of the `aria-live="polite"` declaration already present.

---

### CI-16 — CheckoutPage: "Continue" button rendered as `<div>`

**Affected element:** `.checkout-continue-btn`  
**Source file:** `src/pages/CheckoutPage.jsx` (line 157)  
**Affected pages:** Checkout (`/checkout`, basket step)  
**Raw issue count:** 2 (WRONG_SEMANTIC_ROLE × 1 + NOT_FOCUSABLE × 1)  
**Evinced types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**WCAG:** 4.1.2 (A); 2.1.1 (A)  

**Current code:**
```jsx
<div
  className="checkout-continue-btn"
  onClick={() => setStep('shipping')}
  style={{ cursor: 'pointer' }}
>
  Continue
</div>
```

**Recommended fix:**
```jsx
<button
  className="checkout-continue-btn"
  onClick={() => setStep('shipping')}
>
  Continue
</button>
```

**Rationale:** This is the primary call-to-action on the basket step of checkout. Keyboard users who cannot click would be completely blocked from proceeding through the checkout flow. Converting to a `<button>` immediately restores keyboard access (Tab to focus, Enter/Space to activate) and correct button role announcement — a critical path fix for any e-commerce accessibility.

---

### CI-17 — CheckoutPage: "← Back to Cart" button rendered as `<div>` *(shipping step — not detected by automated scan)*

**Affected element:** `.checkout-back-btn`  
**Source file:** `src/pages/CheckoutPage.jsx` (line 298)  
**Affected pages:** Checkout (shipping step — not reached during the automated scan)  
**Raw issue count:** 0 detected (step not scanned); pattern confirmed by source code review  
**Evinced types:** Would be `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE` if scanned  
**WCAG:** 4.1.2 (A); 2.1.1 (A)  

**Current code:**
```jsx
<div
  className="checkout-back-btn"
  onClick={() => setStep('basket')}
  style={{ cursor: 'pointer' }}
>
  ← Back to Cart
</div>
```

**Recommended fix:**
```jsx
<button
  className="checkout-back-btn"
  onClick={() => setStep('basket')}
>
  ← Back to Cart
</button>
```

**Rationale:** The automated scan captured the basket step only. Source-code inspection reveals an identical `<div onClick>` pattern at the shipping step. The same reasoning as CI-16 applies: keyboard users who reached the shipping form by other means could not navigate back. This issue is included as a confirmed finding from code review even though the scanner did not reach that step.

---

### CI-18 — OrderConfirmationPage: "← Back to Shop" link rendered as `<div>`

**Affected element:** `.confirm-home-link`  
**Source file:** `src/pages/OrderConfirmationPage.jsx`  
**Affected pages:** Order Confirmation  
**Raw issue count:** 2 (WRONG_SEMANTIC_ROLE × 1 + NOT_FOCUSABLE × 1)  
**Evinced types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**WCAG:** 4.1.2 (A); 2.1.1 (A)  

**Current code:**
```jsx
<div className="confirm-home-link" onClick={() => {}} style={{ cursor: 'pointer' }}>
  ← Back to Shop
</div>
```

**Recommended fix:**
```jsx
<Link to="/" className="confirm-home-link">← Back to Shop</Link>
```

**Rationale:** This is the sole navigational call-to-action on the order confirmation page. The current `onClick` is a no-op (empty function), so the button does nothing even for mouse users. Replacing it with a React Router `<Link to="/">` correctly renders as an `<a href="/">`, gives it the link role, makes it keyboard-navigable, and actually navigates to the home page. This addresses both the accessibility violation and the functional bug simultaneously.

---

## 4. Critical Issue Summary Table

| ID | Component / Source File | Selector | Pages Affected | Raw Count | Evinced Types | WCAG |
|----|------------------------|----------|----------------|-----------|---------------|------|
| CI-01 | `Header.jsx` — Wishlist btn | `.wishlist-btn` | All 5 | 10 | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE | 4.1.2, 2.1.1 |
| CI-02 | `Header.jsx` — Search btn | `.icon-btn:nth-child(2)` | All 5 | 15 | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE, NO_DESCRIPTIVE_TEXT | 4.1.2, 2.1.1, 2.4.6 |
| CI-03 | `Header.jsx` — Login btn | `.icon-btn:nth-child(4)` | All 5 | 15 | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE, NO_DESCRIPTIVE_TEXT | 4.1.2, 2.1.1, 2.4.6 |
| CI-04 | `Header.jsx` — Flag group | `.flag-group` | All 5 | 10 | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE | 4.1.2, 2.1.1 |
| CI-05 | `PopularSection.jsx` — Shop links | `.shop-link` | Homepage | 9 | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE, NO_DESCRIPTIVE_TEXT | 4.1.2, 2.1.1, 2.4.4 |
| CI-06 | `Footer.jsx` — Sustainability | `li:nth-child(3) > .footer-nav-item` | All 5 | 10 | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE | 4.1.2, 2.1.1 |
| CI-07 | `Footer.jsx` — FAQs | `.footer-list:nth-child(2) > li > .footer-nav-item` | All 5 | 15 | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE, NO_DESCRIPTIVE_TEXT | 4.1.2, 2.1.1, 2.4.4 |
| CI-08 | `TheDrop.jsx` — Slider missing attrs | `.drop-popularity-bar` | Homepage | 2 | NOT_FOCUSABLE, AXE-ARIA-REQUIRED-ATTR | 4.1.2, 2.1.1 |
| CI-09 | `FeaturedPair.jsx` — h1 aria-expanded | `.featured-card h1` | Homepage | 2 | AXE-ARIA-VALID-ATTR-VALUE | 4.1.2 |
| CI-10 | `HeroBanner.jsx` — img no alt | `img[src$="New_Tees.png"]` | Homepage | 1 | AXE-IMAGE-ALT | 1.1.1 |
| CI-11 | `TheDrop.jsx` — img no alt | `img[src$="2bags_charms1.png"]` | Homepage | 1 | AXE-IMAGE-ALT | 1.1.1 |
| CI-12 | `CartModal.jsx` — close btn no name | `#cart-modal > div:nth-child(1) > button` | HP, Products, PD | 3 | AXE-BUTTON-NAME | 4.1.2 |
| CI-13 | `WishlistModal.jsx` — close btn no name | `div[role="dialog"] > div:nth-child(1) > button` | All 5 | 5 | AXE-BUTTON-NAME | 4.1.2 |
| CI-14 | `FilterSidebar.jsx` — filter option divs | `.filter-option` (12 items) | Products | 24 | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE | 4.1.2, 2.1.1, 1.3.1 |
| CI-15 | `ProductPage.jsx` — invalid aria-relevant | `ul[aria-relevant="changes"]` | Product Detail | 1 | AXE-ARIA-VALID-ATTR-VALUE | 4.1.2 |
| CI-16 | `CheckoutPage.jsx` — Continue div | `.checkout-continue-btn` | Checkout | 2 | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE | 4.1.2, 2.1.1 |
| CI-17 | `CheckoutPage.jsx` — Back div (shipping step) | `.checkout-back-btn` | Checkout | 0 (code review) | — | 4.1.2, 2.1.1 |
| CI-18 | `OrderConfirmationPage.jsx` — Back to Shop div | `.confirm-home-link` | Order Confirm | 2 | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE | 4.1.2, 2.1.1 |
| | **TOTAL** | | | **127** | | |

---

## 5. Non-Critical (Serious) Issues — Full List

These 24 issues were classified **Serious** by the Evinced scanner. They were not remediated per the audit scope. They should be addressed in a follow-up sprint.

### NC-01 — `<html>` element missing `lang` attribute

**Type:** `AXE-HTML-HAS-LANG`  
**Selector:** `html`  
**Affected pages:** All 5 (Homepage, Products, Product Detail, Checkout, Order Confirmation)  
**Raw count:** 5  
**WCAG:** 3.1.1 Language of Page (Level A)  
**Description:** The root `<html>` element has no `lang` attribute. Screen readers rely on this attribute to apply the correct pronunciation rules and language engine. Without it, text may be read with the wrong accent or entirely in the wrong language voice.  
**Recommended fix:** Add `lang="en"` (or the appropriate BCP 47 tag) to the `<html>` element in `public/index.html`:
```html
<html lang="en">
```

---

### NC-02 — `<p lang="zz">` uses invalid BCP 47 language tag

**Type:** `AXE-VALID-LANG`  
**Selector:** `p[lang="zz"]`  
**Affected pages:** Homepage  
**Raw count:** 1  
**WCAG:** 3.1.2 Language of Parts (Level AA)  
**Description:** The paragraph describing the bag charm drop in `src/components/TheDrop.jsx` has `lang="zz"`, which is not a valid BCP 47 language tag. Screen readers cannot apply correct language processing rules.  
**Recommended fix:** Remove the invalid `lang` attribute from the `<p>` element (the text is in English, so it inherits `lang="en"` from `<html>` once NC-01 is fixed), or set `lang="en"` explicitly:
```jsx
<p>Our brand-new, limited-edition plushie bag charms...</p>
```

---

### NC-03 — Color contrast failures (18 instances)

**Type:** `AXE-COLOR-CONTRAST`  
**WCAG:** 1.4.3 Contrast (Minimum) (Level AA)  
**Description:** Eighteen text elements across all pages fail the WCAG 2 AA minimum contrast ratio of 4.5:1 for normal text. The following table lists all instances:

| # | Selector | Page | Text Content / Context |
|---|----------|------|------------------------|
| 1 | `.hero-content > p` | Homepage | "Warm hues for cooler days" hero subtitle |
| 2 | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(1) > .filter-option-label > .filter-count` | Products | "(8)" price-range count |
| 3 | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(2) > .filter-option-label > .filter-count` | Products | "(4)" price-range count |
| 4 | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(3) > .filter-option-label > .filter-count` | Products | "(4)" price-range count |
| 5 | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(4) > .filter-option-label > .filter-count` | Products | "(0)" price-range count |
| 6 | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(1) > .filter-option-label > .filter-count` | Products | "(14)" size count |
| 7 | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(2) > .filter-option-label > .filter-count` | Products | "(15)" size count |
| 8 | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(3) > .filter-option-label > .filter-count` | Products | "(14)" size count |
| 9 | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(4) > .filter-option-label > .filter-count` | Products | "(12)" size count |
| 10 | `.filter-option:nth-child(5) > .filter-option-label > .filter-count` | Products | "(11)" size count |
| 11 | `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(1) > .filter-option-label > .filter-count` | Products | "(2)" brand count |
| 12 | `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(2) > .filter-option-label > .filter-count` | Products | "(13)" brand count |
| 13 | `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(3) > .filter-option-label > .filter-count` | Products | "(1)" brand count |
| 14 | `.products-found` | Products | "16 Products Found" count indicator |
| 15 | `p:nth-child(4)` | Product Detail | Product description paragraph text |
| 16 | `.checkout-step:nth-child(3) > .step-label` | Checkout | "Shipping & Payment" step label |
| 17 | `.summary-tax-note` | Checkout | "Taxes calculated at next step" note |
| 18 | `.confirm-order-id-label` | Order Confirmation | "Order ID" label text |

**Recommended fix:** Audit the CSS files for `FilterSidebar.css`, `NewPage.css`, `CheckoutPage.css`, `OrderConfirmationPage.css`, `HeroBanner.css`, and `ProductPage.module.css` and increase the foreground color or darken the background for each failing element until the contrast ratio reaches at least 4.5:1. Tools such as the WebAIM Contrast Checker can be used to find compliant hex values.

---

*End of report.*

# Accessibility Audit Report — Demo Website

**Tool:** Evinced JS Playwright SDK (`@evinced/js-playwright-sdk`)  
**Date:** 2026-03-22  
**Engine:** Chromium (Playwright)  
**Branch:** `cursor/accessibility-audit-report-f131`

---

## 1. Repository Overview

### Application Architecture

- **Framework:** React 18 SPA, bundled with Webpack 5
- **Router:** React Router v7
- **Entry point:** `src/components/App.jsx`
- **HTML shell:** `public/index.html`

### Pages and Entry Points

| Page | Route | Entry File |
|------|-------|-----------|
| Homepage | `/` | `src/pages/HomePage.jsx` |
| Products / Shop New | `/shop/new` | `src/pages/NewPage.jsx` |
| Product Detail | `/product/:id` | `src/pages/ProductPage.jsx` |
| Checkout | `/checkout` | `src/pages/CheckoutPage.jsx` |
| Order Confirmation | `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` |

### Shared Layout Components

| Component | File | Present on |
|-----------|------|-----------|
| Header (nav, icons, wishlist) | `src/components/Header.jsx` | All pages |
| Footer (nav links) | `src/components/Footer.jsx` | All pages |
| Cart Modal (drawer) | `src/components/CartModal.jsx` | All pages except Checkout, Order Confirmation |
| Wishlist Modal (drawer) | `src/components/WishlistModal.jsx` | All pages |
| Hero Banner | `src/components/HeroBanner.jsx` | Homepage |
| Popular Section | `src/components/PopularSection.jsx` | Homepage |
| The Drop | `src/components/TheDrop.jsx` | Homepage |
| Featured Pair | `src/components/FeaturedPair.jsx` | Homepage |
| Filter Sidebar | `src/components/FilterSidebar.jsx` | Products |

> **Note on Order Confirmation:** `OrderConfirmationPage` contains a `<Navigate to="/" replace />` guard that redirects to Homepage when accessed without valid order state. The Playwright scan of `/order-confirmation` without order state therefore captured the Homepage DOM. Issues listed for "Order Confirmation" in this report are the Homepage issues rendered by that redirect.

---

## 2. Audit Methodology

Each page was scanned using `EvincedSDK.evAnalyze()` — a static, one-shot accessibility analysis of the rendered DOM at page-load. The Playwright browser navigated to each route, waited for network idle, then ran the Evinced engine.

**Test spec:** `tests/e2e/specs/comprehensive-a11y-audit.spec.ts`  
**Result files:** `tests/e2e/test-results/page-*.json`

---

## 3. Executive Summary

| Severity | Count |
|----------|------:|
| **Critical** | **139** |
| **Serious** | **25** |
| **Total** | **164** |

### Issues by Page

| Page | Total | Critical | Serious |
|------|------:|--------:|--------:|
| Homepage (`/`) | 35 | 32 | 3 |
| Products (`/shop/new`) | 55 | 41 | 14 |
| Product Detail (`/product/:id`) | 20 | 18 | 2 |
| Checkout (`/checkout`) | 19 | 16 | 3 |
| Order Confirmation (`/order-confirmation`) | 35 | 32 | 3 |
| **Total** | **164** | **139** | **25** |

### Critical Issue Type Distribution

| Evinced Issue Type | Count | Description |
|--------------------|------:|-------------|
| `NOT_FOCUSABLE` | 50 | Interactive element not reachable by keyboard |
| `WRONG_SEMANTIC_ROLE` | 48 | Element does not convey its interactive role to AT |
| `NO_DESCRIPTIVE_TEXT` | 21 | Interactive element has no accessible name |
| `AXE-BUTTON-NAME` | 9 | `<button>` with no accessible name |
| `AXE-ARIA-VALID-ATTR-VALUE` | 5 | Invalid ARIA attribute value |
| `AXE-IMAGE-ALT` | 4 | `<img>` missing `alt` attribute |
| `AXE-ARIA-REQUIRED-ATTR` | 2 | ARIA role missing required attributes |

---

## 4. Critical Issues — Detailed Analysis

The 139 raw critical findings consolidate into **15 distinct issue groups** based on the component, element, and root cause. Each group is described below with the affected element, pages, proposed fix, and rationale.

---

### CI-01 — Header: Wishlist Button Uses `<div>` Instead of `<button>`

**Evinced Types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**Selector:** `.wishlist-btn`  
**Pages:** All pages (Homepage, Products, Product Detail, Checkout, Order Confirmation)  
**Raw occurrences:** 10 (5 pages × 2 types)  
**Source file:** `src/components/Header.jsx`

**Affected code:**
```jsx
<div className="icon-btn wishlist-btn" onClick={openWishlist} style={{cursor:'pointer'}}>
  <svg ... aria-hidden="true">...</svg>
  <span>Wishlist</span>
  {wishlistCount > 0 && <span className="wishlist-count" aria-hidden="true">{wishlistCount}</span>}
</div>
```

**Proposed fix:**
```jsx
<button className="icon-btn wishlist-btn" onClick={openWishlist} type="button">
  <svg ... aria-hidden="true">...</svg>
  <span>Wishlist</span>
  {wishlistCount > 0 && <span className="wishlist-count" aria-hidden="true">{wishlistCount}</span>}
</button>
```

**Rationale:** A `<div>` with an `onClick` handler is not focusable by keyboard and is not announced as a button by screen readers. Replacing it with a native `<button>` element gives it the correct implicit ARIA role (`button`), keyboard focusability, and the `Enter`/`Space` activation contract for free — without adding any custom ARIA attributes or `tabIndex`. Native semantics are always preferred over ARIA role overrides because they require no additional JS to maintain.

---

### CI-02 — Header: Search Icon Button Uses `<div>` with Hidden Text and No Accessible Name

**Evinced Types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**Selector:** `.icon-btn:nth-child(2)`  
**Pages:** All pages  
**Raw occurrences:** 15 (5 pages × 3 types)  
**Source file:** `src/components/Header.jsx`

**Affected code:**
```jsx
<div className="icon-btn" style={{cursor:'pointer'}}>
  <svg ... aria-hidden="true">...</svg>
  <span aria-hidden="true">Search</span>
</div>
```

**Proposed fix:**
```jsx
<button className="icon-btn" type="button" aria-label="Search">
  <svg ... aria-hidden="true">...</svg>
  <span aria-hidden="true">Search</span>
</button>
```

**Rationale:** Three separate violations converge on this element. The `<div>` lacks button semantics (`WRONG_SEMANTIC_ROLE`), cannot be reached via Tab (`NOT_FOCUSABLE`), and has no accessible name because the only text content carries `aria-hidden="true"` (`NO_DESCRIPTIVE_TEXT`). Replacing with `<button>` resolves the first two. Adding an explicit `aria-label="Search"` resolves the third — it is the most robust pattern for icon-only buttons, overriding the visual span text which is intentionally hidden from AT.

---

### CI-03 — Header: Login Icon Button Uses `<div>` with Hidden Text and No Accessible Name

**Evinced Types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**Selector:** `.icon-btn:nth-child(4)`  
**Pages:** All pages  
**Raw occurrences:** 15 (5 pages × 3 types)  
**Source file:** `src/components/Header.jsx`

**Affected code:**
```jsx
<div className="icon-btn" style={{cursor:'pointer'}}>
  <svg ... aria-hidden="true">...</svg>
  <span aria-hidden="true">Login</span>
</div>
```

**Proposed fix:**
```jsx
<button className="icon-btn" type="button" aria-label="Login">
  <svg ... aria-hidden="true">...</svg>
  <span aria-hidden="true">Login</span>
</button>
```

**Rationale:** Identical pattern to CI-02. The same three violations apply for the same reasons. Using `aria-label` instead of removing `aria-hidden` from the span keeps the visual label visually suppressed for sighted users while providing a clear name to assistive technology.

---

### CI-04 — Header: Country/Region Flag Selector Uses `<div>` Instead of `<button>`

**Evinced Types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**Selector:** `.flag-group`  
**Pages:** All pages  
**Raw occurrences:** 10 (5 pages × 2 types)  
**Source file:** `src/components/Header.jsx`

**Affected code:**
```jsx
<div className="flag-group" onClick={() => {}} style={{ cursor: 'pointer' }}>
  <img src="/images/icons/united-states-of-america.png" alt="United States Flag" width="24" height="24" />
  <img src="/images/icons/canada.png" alt="Canada Flag" width="24" height="24" />
</div>
```

**Proposed fix:**
```jsx
<button className="flag-group" type="button" aria-label="Select country or region">
  <img src="/images/icons/united-states-of-america.png" alt="United States Flag" width="24" height="24" />
  <img src="/images/icons/canada.png" alt="Canada Flag" width="24" height="24" />
</button>
```

**Rationale:** The `<div>` is interactive (fires an `onClick`) but is invisible to keyboard and screen reader users. The flag images have individual `alt` texts, but those describe content, not the control's purpose. An explicit `aria-label` on the `<button>` wrapper provides a clear action description. Choosing `<button>` (rather than adding `role="button"` + `tabIndex`) keeps the implementation simple and leverages native activation behaviour.

---

### CI-05 — Footer: "Sustainability" Navigation Item Uses `<div>` Instead of `<a>`

**Evinced Types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**Selector:** `li:nth-child(3) > .footer-nav-item`  
**Pages:** All pages  
**Raw occurrences:** 10 (5 pages × 2 types)  
**Source file:** `src/components/Footer.jsx`

**Affected code:**
```jsx
<li>
  <div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}>Sustainability</div>
</li>
```

**Proposed fix:**
```jsx
<li>
  <a href="#sustainability" className="footer-nav-item">Sustainability</a>
</li>
```

**Rationale:** A `<div>` rendered inside a `<li>` with an `onClick` handler carries no link semantics. Screen readers announce it as plain text, and keyboard users cannot navigate to it with Tab or activate it. Replacing it with a native `<a>` element provides the `link` role, keyboard focusability, and `Enter` activation — all without ARIA. The `href` value should be updated to a real destination once the route is implemented; `#sustainability` is a placeholder consistent with the commented-out page structure.

---

### CI-06 — Footer: "FAQs" Navigation Item Uses `<div>` with `aria-hidden` Text

**Evinced Types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**Selector:** `.footer-list:nth-child(2) > li > .footer-nav-item`  
**Pages:** All pages  
**Raw occurrences:** 15 (5 pages × 3 types)  
**Source file:** `src/components/Footer.jsx`

**Affected code:**
```jsx
<li>
  <div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}>
    <span aria-hidden="true">FAQs</span>
  </div>
</li>
```

**Proposed fix:**
```jsx
<li>
  <a href="#faqs" className="footer-nav-item">FAQs</a>
</li>
```

**Rationale:** In addition to the wrong-role and focusability issues (same as CI-05), this element has no accessible name because `aria-hidden="true"` on the inner `<span>` hides the text "FAQs" from assistive technology, producing `NO_DESCRIPTIVE_TEXT`. Replacing the `<div>` with a native `<a>` and moving the label to direct text content simultaneously fixes all three violations: the link role, keyboard accessibility, and the accessible name.

---

### CI-07 — Popular Section: "Shop" Link Divs Not Keyboard-Accessible and Have No Accessible Name

**Evinced Types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**Selectors:**  
- `.product-card:nth-child(1) > .product-card-info > .shop-link`  
- `.product-card:nth-child(2) > .product-card-info > .shop-link`  
- `.product-card:nth-child(3) > .product-card-info > .shop-link`  
**Pages:** Homepage (and Order Confirmation, which renders Homepage via redirect)  
**Raw occurrences:** 18 (3 selectors × 2 pages × 3 types)  
**Source file:** `src/components/PopularSection.jsx`

**Affected code:**
```jsx
<div
  className="shop-link"
  onClick={() => navigate(product.shopHref)}
  style={{ cursor: 'pointer' }}
>
  <span aria-hidden="true">{product.shopLabel}</span>
</div>
```

**Proposed fix:**
```jsx
<Link to={product.shopHref} className="shop-link">
  {product.shopLabel}
</Link>
```

**Rationale:** This is a navigation action, so the correct element is `<Link>` (which renders as `<a>`), not a `<div>` with programmatic navigation. React Router's `<Link>` provides the `link` role, keyboard focus, `Enter` activation, right-click context menus, and proper URL representation in the browser status bar — none of which a `<div onClick={navigate(...)}>` can replicate. Removing `aria-hidden` from the label text ensures the link has a visible and accessible name without requiring any separate `aria-label`.

---

### CI-08 — The Drop: `role="slider"` Element Missing Required ARIA Attributes and Not Focusable

**Evinced Types:** `AXE-ARIA-REQUIRED-ATTR`, `NOT_FOCUSABLE`  
**Selector:** `.drop-popularity-bar`  
**Pages:** Homepage (and Order Confirmation via redirect)  
**Raw occurrences:** 4 (2 pages × 2 types)  
**Source file:** `src/components/TheDrop.jsx`

**Affected code:**
```jsx
<div role="slider" aria-label="Popularity indicator" className="drop-popularity-bar"></div>
```

**Proposed fix:**
```jsx
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  tabIndex={0}
  className="drop-popularity-bar"
></div>
```

**Rationale:** The WAI-ARIA 1.1 specification requires that any element with `role="slider"` exposes `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. Without these, assistive technologies cannot announce the current value or its range, making the widget meaningless to non-visual users. The element also needs `tabIndex={0}` so keyboard users can focus it (as required by the `slider` role). If the bar is purely decorative (no real slider interaction), `role="img"` or `role="presentation"` with a descriptive `aria-label` would be more appropriate.

---

### CI-09 — Featured Pair: `<h1>` Elements Carry Invalid `aria-expanded="yes"`

**Evinced Type:** `AXE-ARIA-VALID-ATTR-VALUE`  
**Selectors:**  
- `.featured-card:nth-child(1) > .featured-card-info > h1`  
- `.featured-card:nth-child(2) > .featured-card-info > h1`  
**Pages:** Homepage (and Order Confirmation via redirect)  
**Raw occurrences:** 4 (2 selectors × 2 pages)  
**Source file:** `src/components/FeaturedPair.jsx`

**Affected code:**
```jsx
<h1 aria-expanded="yes">{item.title}</h1>
```

**Proposed fix:**
```jsx
<h1>{item.title}</h1>
```

**Rationale:** `aria-expanded` is a state attribute that must be either `"true"` or `"false"` — the value `"yes"` is not a valid ARIA boolean and causes the attribute to be ignored or misinterpreted by some screen readers. More fundamentally, `aria-expanded` is not a meaningful attribute on a heading element; it belongs on disclosure controls such as `<button>` or `<summary>`. Removing the attribute entirely from `<h1>` is the correct fix: headings are not expandable widgets, so no expansion state needs to be communicated.

---

### CI-10 — Hero Banner: Product Image Missing `alt` Attribute

**Evinced Type:** `AXE-IMAGE-ALT`  
**Selector:** `img[src$="New_Tees.png"]`  
**Pages:** Homepage (and Order Confirmation via redirect)  
**Raw occurrences:** 2  
**Source file:** `src/components/HeroBanner.jsx`

**Affected code:**
```jsx
<img src={HERO_IMAGE} />
```

**Proposed fix:**
```jsx
<img src={HERO_IMAGE} alt="Winter Basics — collection of new tees in warm hues" />
```

**Rationale:** An `<img>` without an `alt` attribute causes most screen readers to announce the image filename (`New_Tees.png`) or the full URL path, which is meaningless to users. Because this is a content image inside the hero promotion (not decorative), it requires a descriptive `alt` text that conveys the same information a sighted user obtains from the image. The description should reflect the promotional context visible on the page: warm-coloured apparel from the "Winter Basics" campaign.

---

### CI-11 — The Drop Section: Product Image Missing `alt` Attribute

**Evinced Type:** `AXE-IMAGE-ALT`  
**Selector:** `img[src$="2bags_charms1.png"]`  
**Pages:** Homepage (and Order Confirmation via redirect)  
**Raw occurrences:** 2  
**Source file:** `src/components/TheDrop.jsx`

**Affected code:**
```jsx
<img src={DROP_IMAGE} loading="lazy" />
```

**Proposed fix:**
```jsx
<img src={DROP_IMAGE} loading="lazy" alt="The Drop — limited edition Android, YouTube, and Super G plushie bag charms" />
```

**Rationale:** Same root cause as CI-10. The accompanying paragraph text describes three plushie charms (Android bot, YouTube icon, Super G). The alt text should convey the visual content of the image — the charms themselves — so that screen reader users receive the same product introduction as sighted users without needing to rely entirely on the text body.

---

### CI-12 — Cart Modal: Close Button Missing Accessible Name

**Evinced Type:** `AXE-BUTTON-NAME`  
**Selectors:**  
- `#cart-modal > div:nth-child(1) > button`  
- `div[role="dialog"] > div:nth-child(1) > button`  
**Pages:** Homepage, Products, Product Detail, Order Confirmation  
**Raw occurrences:** 8 (2 selectors × 4 pages)  
**Source file:** `src/components/CartModal.jsx`

**Affected code:**
```jsx
<button className={styles.closeBtn} onClick={closeCart}>
  <svg width="20" height="20" ... aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
</button>
```

**Proposed fix:**
```jsx
<button className={styles.closeBtn} onClick={closeCart} aria-label="Close shopping cart">
  <svg width="20" height="20" ... aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
</button>
```

**Rationale:** The button contains only an SVG icon whose `aria-hidden="true"` removes it from the accessibility tree. The `<button>` therefore has no accessible name, so a screen reader user hears only "button" with no indication of what it does. Adding `aria-label="Close shopping cart"` gives the button a meaningful name. The label includes the target ("shopping cart") to disambiguate it from the similar wishlist close button on the same page.

---

### CI-13 — Wishlist Modal: Close Button Missing Accessible Name

**Evinced Type:** `AXE-BUTTON-NAME`  
**Selector:** `div:nth-child(1) > button`  
**Pages:** Checkout (where Cart Modal is suppressed, leaving Wishlist Modal as the only dialog)  
**Raw occurrences:** 1  
**Source file:** `src/components/WishlistModal.jsx`

**Affected code:**
```jsx
<button
  ref={closeBtnRef}
  className={styles.closeBtn}
  onClick={closeWishlist}
>
  <svg width="20" height="20" ... aria-hidden="true">
    ...
  </svg>
</button>
```

**Proposed fix:**
```jsx
<button
  ref={closeBtnRef}
  className={styles.closeBtn}
  onClick={closeWishlist}
  aria-label="Close wishlist"
>
  <svg width="20" height="20" ... aria-hidden="true">
    ...
  </svg>
</button>
```

**Rationale:** Identical root cause to CI-12. The Wishlist Modal close button is icon-only with the SVG hidden from the accessibility tree, resulting in a nameless button. `aria-label="Close wishlist"` provides a clear, specific action label. On pages where both modals are present, the two distinct labels ("Close shopping cart" vs "Close wishlist") also help users distinguish between them when navigating by button.

---

### CI-14 — Filter Sidebar: Filter Option Divs Have Wrong Semantic Role and Are Not Focusable

**Evinced Types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**Selectors:** 11 `.filter-option` divs across Price (4), Size (5), and Brand (2+ visible) filter groups  
**Pages:** Products (`/shop/new`)  
**Raw occurrences:** 22 (11 selectors × 2 types)  
**Source file:** `src/components/FilterSidebar.jsx`

**Affected code (example for one option):**
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

**Proposed fix (example for one option):**
```jsx
<label key={range.label} className="filter-option">
  <input
    type="checkbox"
    className="filter-option-input"
    checked={checked}
    onChange={() => onPriceChange(range)}
  />
  <span className="filter-option-label">
    {range.label}
    <span className="filter-count">({count})</span>
  </span>
</label>
```

**Rationale:** Each filter option visually looks and behaves like a checkbox, but is implemented as a `<div>` with a custom rendered checkbox UI. The `<div>` has no ARIA role, so screen readers announce it as static text, not a checkbox. It is also not in the tab order, so keyboard users cannot toggle filters. Replacing with a native `<input type="checkbox">` inside a `<label>` achieves: correct `checkbox` role with `aria-checked` state, keyboard focus and Space-bar toggle, proper label association, and full browser default behaviour — all without any additional ARIA. The custom visual checkbox rendered by the existing `.custom-checkbox` divs can be hidden with `position: absolute; opacity: 0` and the visual styling applied via the label and sibling CSS.

---

### CI-15 — Product Detail: `ul` Element Uses Invalid `aria-relevant` Value

**Evinced Type:** `AXE-ARIA-VALID-ATTR-VALUE`  
**Selector:** `ul[aria-relevant="changes"]`  
**Pages:** Product Detail  
**Raw occurrences:** 1  
**Source file:** `src/pages/ProductPage.jsx`

**Affected code:**
```jsx
<ul aria-relevant="changes" ...>
```

**Proposed fix:**
```jsx
<ul aria-relevant="additions text" aria-live="polite" ...>
```

**Rationale:** `aria-relevant` accepts only space-separated tokens from the set: `additions`, `removals`, `text`, and `all`. The value `"changes"` is not a valid token and is therefore ignored by all assistive technologies. The intended behaviour (announcing when list items are added or their text changes) is expressed by `"additions text"`, which is the closest valid equivalent. `aria-live="polite"` should also be added to the element because `aria-relevant` has no effect without an active live region; `aria-relevant` only filters which kinds of DOM mutations trigger announcements within an already-live region.

---

## 5. Summary of Proposed Fixes per Source File

| Source File | Critical Issues | Key Fix |
|-------------|---------------:|---------|
| `src/components/Header.jsx` | CI-01, CI-02, CI-03, CI-04 | Replace 4 `<div>` interactive elements with `<button>` + `aria-label` |
| `src/components/Footer.jsx` | CI-05, CI-06 | Replace 2 `<div>` nav items with `<a>` elements |
| `src/components/PopularSection.jsx` | CI-07 | Replace 3 `<div onClick={navigate}>` with React Router `<Link>` |
| `src/components/TheDrop.jsx` | CI-08, CI-11 | Add required slider ARIA attrs + `tabIndex={0}`; add `alt` to image |
| `src/components/FeaturedPair.jsx` | CI-09 | Remove `aria-expanded="yes"` from `<h1>` elements |
| `src/components/HeroBanner.jsx` | CI-10 | Add descriptive `alt` attribute to hero `<img>` |
| `src/components/CartModal.jsx` | CI-12 | Add `aria-label="Close shopping cart"` to close `<button>` |
| `src/components/WishlistModal.jsx` | CI-13 | Add `aria-label="Close wishlist"` to close `<button>` |
| `src/components/FilterSidebar.jsx` | CI-14 | Replace `<div>` filter options with native `<label><input type="checkbox">` |
| `src/pages/ProductPage.jsx` | CI-15 | Fix `aria-relevant="changes"` → `"additions text"`, add `aria-live` |

---

## 6. Remaining Non-Critical Issues (Serious Severity)

These 25 issues were detected but fall below the critical threshold. They are documented here for completeness and prioritisation in future sprints.

### NC-01 — Missing `lang` Attribute on `<html>` Element

**Evinced Type:** `AXE-HTML-HAS-LANG`  
**Selector:** `html`  
**Pages:** All 5 pages  
**Occurrences:** 5  
**Source file:** `public/index.html`

**Description:** The `<html>` element has no `lang` attribute. Screen readers use the language attribute to select the correct speech synthesis voice and pronunciation rules. Without it, screen readers may default to the user's operating system language, causing mispronounced content for multi-lingual users or when the page language differs from the system default.

**Suggested fix:**
```html
<html lang="en">
```

---

### NC-02 — Invalid `lang` Attribute Value (`lang="zz"`)

**Evinced Type:** `AXE-VALID-LANG`  
**Selector:** `p[lang="zz"]`  
**Pages:** Homepage, Order Confirmation  
**Occurrences:** 2  
**Source file:** `src/components/TheDrop.jsx`

**Description:** The `<p>` element in the TheDrop section uses `lang="zz"`, which is not a valid BCP 47 language tag. Screen readers rely on valid language subtags to switch pronunciation engines. The value `"zz"` is a placeholder/test code that no real language uses; it causes AT to behave unpredictably.

**Suggested fix:** Remove the `lang` attribute if the paragraph language matches the document language, or replace it with a real BCP 47 tag (e.g., `lang="en"`).

---

### NC-03 — Color Contrast: Hero Banner Paragraph Text

**Evinced Type:** `AXE-COLOR-CONTRAST`  
**Selectors:** `.hero-content > p`, `.hero-banner`  
**Pages:** Homepage, Order Confirmation  
**Occurrences:** 2  
**Source file:** `src/components/HeroBanner.jsx`, `src/components/HeroBanner.css`

**Description:** The paragraph text within the hero banner has insufficient contrast ratio against the background image/colour. WCAG 2.1 SC 1.4.3 requires a minimum contrast ratio of 4.5:1 for normal text.

**Suggested fix:** Increase the foreground text colour darkness or add a semi-transparent overlay behind the text to achieve at least a 4.5:1 contrast ratio.

---

### NC-04 — Color Contrast: Filter Sidebar Count Labels

**Evinced Type:** `AXE-COLOR-CONTRAST`  
**Selectors:** 11 instances of `.filter-option-label > .filter-count` within each filter group  
**Pages:** Products  
**Occurrences:** 11  
**Source file:** `src/components/FilterSidebar.css`

**Description:** The product count labels in parentheses (e.g., "(12)") shown next to each filter option appear in a light grey colour that does not meet the 4.5:1 minimum contrast ratio against the white background.

**Suggested fix:** Darken the `.filter-count` text colour in `FilterSidebar.css`. A value of `#767676` is the lightest grey that still passes 4.5:1 on white; the current colour appears to be lighter than this threshold.

---

### NC-05 — Color Contrast: Products Page "Results Found" Text

**Evinced Type:** `AXE-COLOR-CONTRAST`  
**Selectors:** `.products-found`, `.new-page`  
**Pages:** Products  
**Occurrences:** 1  
**Source file:** `src/pages/NewPage.jsx`, associated CSS

**Description:** The text showing the number of products found (e.g., "42 results") uses a colour that does not meet the 4.5:1 contrast minimum.

**Suggested fix:** Increase the contrast of the `.products-found` element's text colour against its background.

---

### NC-06 — Color Contrast: Product Detail Description Paragraph

**Evinced Type:** `AXE-COLOR-CONTRAST`  
**Selectors:** `p:nth-child(4)`, `#main-content > div`  
**Pages:** Product Detail  
**Occurrences:** 1  
**Source file:** `src/pages/ProductPage.module.css`

**Description:** A paragraph within the product detail layout has a text-to-background contrast ratio below the WCAG 2.1 SC 1.4.3 minimum of 4.5:1.

**Suggested fix:** Review the paragraph text colour and background colour in `ProductPage.module.css` and adjust the text colour to meet the 4.5:1 threshold.

---

### NC-07 — Color Contrast: Checkout Step Label

**Evinced Type:** `AXE-COLOR-CONTRAST`  
**Selectors:** `.checkout-step:nth-child(3) > .step-label`, `body`  
**Pages:** Checkout  
**Occurrences:** 1  
**Source file:** `src/pages/CheckoutPage.css`

**Description:** The "Shipping & Payment" step label (the inactive step in the checkout progress indicator) has a text colour that does not meet the minimum contrast ratio.

**Suggested fix:** Increase the foreground colour of `.step-label` in the inactive state. If the intent is to visually de-emphasise inactive steps, ensure the contrast still meets 4.5:1 (or 3:1 for large text/UI components per SC 1.4.11).

---

### NC-08 — Color Contrast: Checkout Empty Cart Paragraph

**Evinced Type:** `AXE-COLOR-CONTRAST`  
**Selectors:** `.checkout-empty > p`, `body`  
**Pages:** Checkout  
**Occurrences:** 1  
**Source file:** `src/pages/CheckoutPage.css`

**Description:** The empty cart message text ("There are no items in your shopping cart.") uses a colour with insufficient contrast against the page background.

**Suggested fix:** Darken the text colour of `.checkout-empty > p` to achieve at least 4.5:1 contrast.

---

### NC-09 — Color Contrast: Order Confirmation Hero Paragraph (Homepage Redirect)

**Evinced Type:** `AXE-COLOR-CONTRAST`  
**Selectors:** `.hero-content > p`, `.hero-banner`  
**Pages:** Order Confirmation (displays Homepage via redirect)  
**Occurrences:** 1  

**Description:** Same issue as NC-03; captured again because the Order Confirmation scan rendered the Homepage via the redirect guard. No additional source change is needed beyond the NC-03 fix.

---

## 7. Issues Not Remediable Through Source Code Alone

The following critical/serious patterns were observed in the audit data but require architectural or design decisions beyond a simple source code edit:

| Issue | Notes |
|-------|-------|
| **Cart count badge has no live region** | The cart count `<span aria-hidden="true">` badge updates silently. A proper fix requires an ARIA live region (e.g., `<div role="status" aria-live="polite">`) outside the button to announce count changes, which involves redesigning the cart update notification flow. |
| **Checkout form errors have no live region** | Validation error `<span>` elements appear in the DOM without `role="alert"`, so screen readers don't announce them on form submit. Requires adding `role="alert"` or a live region pattern to each error container. |
| **Reversed tab order in navigation** | `tabIndex` is set in descending order on nav links, reversing the visual tab sequence (Sale → … → New instead of New → … → Sale). Violates WCAG 2.4.3 Focus Order. The comment in `Header.jsx` documents this as intentional A11Y debt. Fix: remove the `reverseTabIndex` calculation entirely and rely on DOM order. |
| **Cart modal missing `role="dialog"`, `aria-modal`, `aria-label`** | Noted in `CartModal.jsx` source comments. The drawer has no dialog semantics, no focus trapping, and no Escape-key handler. These require a coordinated set of changes to the modal implementation pattern. |
| **Heading order violations across all pages** | Multiple components use `<h3>`, `<h4>`, `<h5>` as section headings in positions where `<h1>` or `<h2>` should appear, and `<h1>` as card headings where `<h3>` is appropriate. These are `WCAG 1.3.1` issues (info and relationships) documented throughout the source. They are widespread but classified as informational/moderate rather than critical in this scan. |

---

## 8. WCAG Conformance Summary

| WCAG Success Criterion | Level | Issues |
|------------------------|-------|--------|
| 1.1.1 Non-text Content | A | CI-10, CI-11 (missing alt) |
| 1.3.1 Info and Relationships | A | CI-14 (non-semantic filter controls); heading order violations (non-critical) |
| 1.4.3 Contrast (Minimum) | AA | NC-03 – NC-09 |
| 2.1.1 Keyboard | A | CI-01 – CI-08, CI-14 (not focusable) |
| 2.4.6 Headings and Labels | AA | Heading order violations throughout |
| 3.1.1 Language of Page | A | NC-01 (missing `lang` attribute) |
| 3.1.2 Language of Parts | AA | NC-02 (invalid `lang="zz"`) |
| 4.1.2 Name, Role, Value | A | CI-01 – CI-09, CI-12 – CI-15 |

---

*Report generated by Evinced JS Playwright SDK. Scan date: 2026-03-22. Total findings: 164 (Critical: 139, Serious: 25).*

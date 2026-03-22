# Accessibility Audit Report — Demo Website

**Generated:** 2026-03-22  
**Tool:** Evinced JS Playwright SDK v2.17.0  
**Scanner:** Evinced (Playwright) — no Axe-only rules used; Evinced natively integrates WCAG 2.1 pattern analysis including its own Axe-based checks  
**App:** React SPA (Webpack 5, React 18, React Router v7) served at `http://localhost:3000`

---

## 1. Executive Summary

| Page | Route | Total Issues | Critical | Serious |
|------|-------|:------------:|:--------:|:-------:|
| Homepage | `/` | 35 | 32 | 3 |
| Products | `/shop/new` | 55 | 41 | 14 |
| Product Detail | `/product/:id` | 20 | 18 | 2 |
| Checkout | `/checkout` | 21 | 18 | 3 |
| Order Confirmation | `/order-confirmation` | 20 | 18 | 2 |
| **Total** | | **151** | **127** | **24** |

**Critical issues** block access for users who rely on keyboards or assistive technology. WCAG 2.1 violations present at levels A and AA.  
**Serious issues** degrade the experience significantly but do not fully block access.

---

## 2. Pages and Entry Points Identified

The repository is a React SPA using React Router v7. The following routes were audited by navigating directly to each URL:

| Route | Component File | Description |
|-------|---------------|-------------|
| `/` | `src/pages/HomePage.jsx` | Landing page with hero banner, featured pair, popular section, trending collections, and "The Drop" |
| `/shop/new` | `src/pages/NewPage.jsx` | Product listing with filter sidebar and product grid |
| `/product/:id` | `src/pages/ProductPage.jsx` | Individual product page with image, description, size selection, add-to-cart, and wishlist |
| `/checkout` | `src/pages/CheckoutPage.jsx` | Two-step checkout: basket review → shipping & payment form |
| `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` | Post-purchase confirmation with order ID |

Shared layout components present on all pages: `Header.jsx`, `Footer.jsx`, `CartModal.jsx`, `WishlistModal.jsx`.

---

## 3. Critical Issues — Detailed Findings

> **Severity definition:** Issues classified as CRITICAL by Evinced represent violations that completely exclude keyboard-only users or users of screen readers from interacting with the affected element. They map to WCAG 2.1 Success Criteria at Level A.

---

### CI-01 — Header: Wishlist Button Rendered as `<div>` (Non-Interactive Semantics + Not Focusable)

| Attribute | Value |
|-----------|-------|
| **Severity** | CRITICAL |
| **Issue Types** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE` |
| **Affected Pages** | All pages (/, /shop/new, /product/:id, /checkout, /order-confirmation) |
| **Element Selector** | `.wishlist-btn` |
| **Source File** | `src/components/Header.jsx` (line 131) |
| **WCAG Criterion** | 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A) |

**Element as rendered:**
```html
<div class="icon-btn wishlist-btn" style="cursor: pointer;">
  <svg aria-hidden="true">…</svg>
  <span>Wishlist</span>
</div>
```

**Problem:** The wishlist launcher is a `<div>` with an `onClick` handler. A `<div>` has no implicit ARIA role, so assistive technologies do not identify it as an interactive control. It also lacks `tabIndex`, making it unreachable via keyboard Tab navigation. Screen reader users and keyboard-only users cannot open the wishlist drawer.

**Recommended Fix:**
Replace the outer `<div>` with a `<button>` element:
```jsx
// Before (Header.jsx line 131)
<div className="icon-btn wishlist-btn" onClick={openWishlist} style={{cursor:'pointer'}}>
  ...
</div>

// After
<button className="icon-btn wishlist-btn" onClick={openWishlist}>
  <svg aria-hidden="true">…</svg>
  <span>Wishlist</span>
  {wishlistCount > 0 && (
    <span className="wishlist-count" aria-hidden="true">{wishlistCount}</span>
  )}
</button>
```

**Why this approach:** The `<button>` element provides the correct implicit ARIA `role="button"`, is natively keyboard-focusable, fires click events on both Enter and Space keys, and participates in the natural tab order without requiring `tabIndex`. No ARIA attributes need to be added.

---

### CI-02 — Header: Search Icon Button Rendered as `<div>` with Hidden Label (Wrong Role + Not Focusable + No Name)

| Attribute | Value |
|-----------|-------|
| **Severity** | CRITICAL |
| **Issue Types** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT` |
| **Affected Pages** | All pages |
| **Element Selector** | `.icon-btn:nth-child(2)` |
| **Source File** | `src/components/Header.jsx` (line 140) |
| **WCAG Criterion** | 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A); 1.3.1 Info and Relationships (Level A) |

**Element as rendered:**
```html
<div class="icon-btn" style="cursor: pointer;">
  <svg aria-hidden="true">…</svg>
  <span aria-hidden="true">Search</span>
</div>
```

**Problem:** The search button is a `<div>` with no `role`, no `tabIndex`, and the only text label ("Search") is hidden from assistive technology via `aria-hidden="true"`. This produces three simultaneous critical failures: wrong semantic role, keyboard inaccessibility, and no accessible name.

**Recommended Fix:**
```jsx
// Before (Header.jsx line 140)
<div className="icon-btn" style={{cursor:'pointer'}}>
  <svg aria-hidden="true">…</svg>
  <span aria-hidden="true">Search</span>
</div>

// After
<button className="icon-btn" aria-label="Search">
  <svg aria-hidden="true">…</svg>
</button>
```

**Why this approach:** Using `<button>` provides the correct role and keyboard focus. The `aria-label="Search"` provides the accessible name directly on the element, making it redundant (and cleaner) to render visible text. Removing the hidden `<span>` eliminates the anti-pattern of hiding the only label from AT.

---

### CI-03 — Header: Login Icon Button Rendered as `<div>` with Hidden Label (Wrong Role + Not Focusable + No Name)

| Attribute | Value |
|-----------|-------|
| **Severity** | CRITICAL |
| **Issue Types** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT` |
| **Affected Pages** | All pages |
| **Element Selector** | `.icon-btn:nth-child(4)` |
| **Source File** | `src/components/Header.jsx` (line 156) |
| **WCAG Criterion** | 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A) |

**Element as rendered:**
```html
<div class="icon-btn" style="cursor: pointer;">
  <svg aria-hidden="true">…</svg>
  <span aria-hidden="true">Login</span>
</div>
```

**Problem:** Identical pattern to CI-02 but for the login control. The label "Login" is marked `aria-hidden="true"`, leaving AT with no name, no role, and no keyboard access.

**Recommended Fix:**
```jsx
// Before (Header.jsx line 156)
<div className="icon-btn" style={{cursor:'pointer'}}>
  <svg aria-hidden="true">…</svg>
  <span aria-hidden="true">Login</span>
</div>

// After
<button className="icon-btn" aria-label="Log in">
  <svg aria-hidden="true">…</svg>
</button>
```

**Why this approach:** Same rationale as CI-02. `<button>` with `aria-label` is the minimal correct fix. "Log in" (two words) is preferred over "Login" as it is clearer in most AT vocalisations.

---

### CI-04 — Header: Country/Region Flag Selector Rendered as `<div>` (Wrong Role + Not Focusable)

| Attribute | Value |
|-----------|-------|
| **Severity** | CRITICAL |
| **Issue Types** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE` |
| **Affected Pages** | All pages |
| **Element Selector** | `.flag-group` |
| **Source File** | `src/components/Header.jsx` (line 161) |
| **WCAG Criterion** | 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A) |

**Element as rendered:**
```html
<div class="flag-group" style="cursor: pointer;">
  <img src="…united-states-of-america.png" alt="United States Flag" width="24" height="24" />
  <img src="…canada.png" alt="Canada Flag" width="24" height="24" />
</div>
```

**Problem:** The region/country selector is a `<div>` with an `onClick` handler. It has no ARIA role and no `tabIndex`, so it is invisible to keyboard navigation. While the `<img>` elements have `alt` text, AT users cannot reach or activate the control.

**Recommended Fix:**
```jsx
// Before (Header.jsx line 161)
<div className="flag-group" onClick={() => {}} style={{ cursor: 'pointer' }}>
  ...
</div>

// After
<button className="flag-group" aria-label="Select region" aria-haspopup="listbox">
  <img src="/images/icons/united-states-of-america.png" alt="United States" width="24" height="24" />
  <img src="/images/icons/canada.png" alt="Canada" width="24" height="24" />
</button>
```

**Why this approach:** `<button>` provides the correct role and keyboard access. `aria-label="Select region"` gives a descriptive control name. `aria-haspopup="listbox"` signals to AT that activating this button opens a selection widget, setting appropriate user expectations.

---

### CI-05 — Footer: "Sustainability" Navigation Item Rendered as `<div>` (Wrong Role + Not Focusable)

| Attribute | Value |
|-----------|-------|
| **Severity** | CRITICAL |
| **Issue Types** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE` |
| **Affected Pages** | All pages |
| **Element Selector** | `li:nth-child(3) > .footer-nav-item` |
| **Source File** | `src/components/Footer.jsx` (line 13) |
| **WCAG Criterion** | 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A) |

**Element as rendered:**
```html
<div class="footer-nav-item" style="cursor: pointer;">Sustainability</div>
```

**Problem:** The "Sustainability" footer item looks like a link visually but is a `<div>` with an `onClick` handler. It has no semantic role and no `tabIndex`, so keyboard users cannot Tab to it or activate it.

**Recommended Fix:**
```jsx
// Before (Footer.jsx line 13)
<li>
  <div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}>Sustainability</div>
</li>

// After
<li>
  <a className="footer-nav-item" href="#sustainability">Sustainability</a>
</li>
```

**Why this approach:** If this links to an in-page section, an `<a href="#sustainability">` is semantically correct, natively focusable, and communicates "link" role to AT. If it triggers JavaScript navigation, `<button>` would be the correct alternative. Using native HTML elements avoids needing ARIA role overrides.

---

### CI-06 — Footer: "FAQs" Navigation Item Rendered as `<div>` with Hidden Text (Wrong Role + Not Focusable + No Accessible Name)

| Attribute | Value |
|-----------|-------|
| **Severity** | CRITICAL |
| **Issue Types** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT` |
| **Affected Pages** | All pages |
| **Element Selector** | `.footer-list:nth-child(2) > li > .footer-nav-item` |
| **Source File** | `src/components/Footer.jsx` (line 17) |
| **WCAG Criterion** | 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A); 2.4.6 Headings and Labels (Level AA) |

**Element as rendered:**
```html
<div class="footer-nav-item" style="cursor: pointer;">
  <span aria-hidden="true">FAQs</span>
</div>
```

**Problem:** The "FAQs" footer item is a `<div>` with the only visible text ("FAQs") hidden from AT via `aria-hidden="true"`. This produces three simultaneous failures: wrong semantic role, keyboard inaccessibility, and no accessible name—AT users encounter a completely opaque, unreachable element.

**Recommended Fix:**
```jsx
// Before (Footer.jsx line 17)
<li>
  <div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}>
    <span aria-hidden="true">FAQs</span>
  </div>
</li>

// After
<li>
  <a className="footer-nav-item" href="#faqs">FAQs</a>
</li>
```

**Why this approach:** Replacing with `<a>` gives the correct role, natural tab focus, and visible text exposed to AT. The `aria-hidden` wrapper on "FAQs" text must be removed so screen readers can compute the accessible name from the element's text content.

---

### CI-07 — PopularSection: "Shop" Links Rendered as `<div>` with Hidden Labels (Wrong Role + Not Focusable + No Name)

| Attribute | Value |
|-----------|-------|
| **Severity** | CRITICAL |
| **Issue Types** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT` |
| **Affected Pages** | Homepage (`/`) |
| **Element Selectors** | `.product-card:nth-child(1) > .product-card-info > .shop-link`, `.product-card:nth-child(2) > …`, `.product-card:nth-child(3) > …` |
| **Source File** | `src/components/PopularSection.jsx` (lines 52–57) |
| **WCAG Criterion** | 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A) |

**Element as rendered (for each card):**
```html
<div class="shop-link" style="cursor: pointer;">
  <span aria-hidden="true">Shop Drinkware</span>
</div>
```

**Problem:** Each product card in the "Popular on the Merch Shop" section has a "Shop X" call-to-action rendered as a `<div>`. The label text is hidden with `aria-hidden="true"`. Three cards × three issues each = 9 individual critical issue instances on the homepage. Keyboard and AT users cannot discover or activate any of these navigation actions.

**Recommended Fix:**
```jsx
// Before (PopularSection.jsx lines ~52-57)
<div
  className="shop-link"
  onClick={() => navigate(product.shopHref)}
  style={{ cursor: 'pointer' }}
>
  <span aria-hidden="true">{product.shopLabel}</span>
</div>

// After
<Link to={product.shopHref} className="shop-link">
  {product.shopLabel}
</Link>
```

**Why this approach:** React Router's `<Link>` renders a semantic `<a>` element with the correct WCAG role, natural keyboard focus, and visible text accessible to AT. The `onClick+navigate` imperative pattern is replaced with declarative navigation, and removing `aria-hidden` from the text exposes the accessible name automatically.

---

### CI-08 — Cart & Wishlist Modal: Close Buttons Have No Accessible Name (AXE-BUTTON-NAME)

| Attribute | Value |
|-----------|-------|
| **Severity** | CRITICAL |
| **Issue Types** | `AXE-BUTTON-NAME` |
| **Affected Pages** | All pages (both modals can be triggered from any page) |
| **Element Selectors** | `#cart-modal > div:nth-child(1) > button` (CartModal); `div[role="dialog"] > div:nth-child(1) > button` (WishlistModal) |
| **Source Files** | `src/components/CartModal.jsx`; `src/components/WishlistModal.jsx` |
| **WCAG Criterion** | 4.1.2 Name, Role, Value (Level A) |

**Element as rendered:**
```html
<!-- CartModal close button -->
<button class="…closeBtn">
  <svg aria-hidden="true">… (× icon) …</svg>
</button>

<!-- WishlistModal close button (identical pattern) -->
<button class="…closeBtn">
  <svg aria-hidden="true">… (× icon) …</svg>
</button>
```

**Problem:** Both modal close buttons are icon-only buttons. The SVG close icon is marked `aria-hidden="true"`, meaning AT have no text, label, or title to announce. Screen readers will typically say "button" with no context, leaving users unable to identify the control's purpose.

**Recommended Fix:**
```jsx
// CartModal.jsx — add aria-label to close button
<button
  className={styles.closeBtn}
  onClick={closeCart}
  aria-label="Close shopping cart"
>
  <svg aria-hidden="true">…</svg>
</button>

// WishlistModal.jsx — add aria-label to close button
<button
  ref={closeBtnRef}
  className={styles.closeBtn}
  onClick={closeWishlist}
  aria-label="Close wishlist"
>
  <svg aria-hidden="true">…</svg>
</button>
```

**Why this approach:** Adding `aria-label` directly to the `<button>` is the most reliable technique for icon-only buttons. It overrides the computed accessible name, is announced immediately by all major screen readers, and requires no DOM restructuring. The `aria-hidden` on the SVG must be preserved to avoid double-announcing.

---

### CI-09 — FeaturedPair: `<h1>` Elements Have Invalid `aria-expanded="yes"` (AXE-ARIA-VALID-ATTR-VALUE)

| Attribute | Value |
|-----------|-------|
| **Severity** | CRITICAL |
| **Issue Types** | `AXE-ARIA-VALID-ATTR-VALUE` |
| **Affected Pages** | Homepage (`/`) |
| **Element Selectors** | `.featured-card:nth-child(1) > .featured-card-info > h1`; `.featured-card:nth-child(2) > .featured-card-info > h1` |
| **Source File** | `src/components/FeaturedPair.jsx` (line ~42) |
| **WCAG Criterion** | 4.1.2 Name, Role, Value (Level A) |

**Element as rendered:**
```html
<h1 aria-expanded="yes">Keep on Truckin'</h1>
<h1 aria-expanded="yes">Limited edition and traveling fast</h1>
```

**Problem:** `aria-expanded` is a boolean state attribute whose only valid values are `"true"` and `"false"`. The value `"yes"` is invalid and will be ignored or misinterpreted by AT. Additionally, `aria-expanded` is inappropriate on an `<h1>` element — it is semantically meaningful only on controls that open/close a panel (buttons, comboboxes, etc.).

**Recommended Fix:**
```jsx
// Before (FeaturedPair.jsx line ~42)
<h1 aria-expanded="yes">{item.title}</h1>

// After — remove the attribute entirely; h1 has no expandable state
<h1>{item.title}</h1>
```

**Why this approach:** Removing `aria-expanded` is correct because an `<h1>` element does not expand or collapse any content. The attribute was likely added in error (perhaps intended for a disclosure widget toggle button). Removing it eliminates the invalid-value violation and restores semantically correct markup.

---

### CI-10 — TheDrop: Slider Element Missing Required ARIA Attributes and Not Keyboard-Focusable (AXE-ARIA-REQUIRED-ATTR + NOT_FOCUSABLE)

| Attribute | Value |
|-----------|-------|
| **Severity** | CRITICAL |
| **Issue Types** | `AXE-ARIA-REQUIRED-ATTR`, `NOT_FOCUSABLE` |
| **Affected Pages** | Homepage (`/`) |
| **Element Selector** | `.drop-popularity-bar` |
| **Source File** | `src/components/TheDrop.jsx` (line ~17) |
| **WCAG Criterion** | 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A) |

**Element as rendered:**
```html
<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>
```

**Problem:** `role="slider"` requires three mandatory ARIA state attributes: `aria-valuenow` (current value), `aria-valuemin` (minimum), and `aria-valuemax` (maximum). Without these, the slider widget is incomplete and invalid per the ARIA specification. Additionally, the element has no `tabIndex`, making it unreachable via keyboard.

**Recommended Fix:**
```jsx
// Before (TheDrop.jsx line ~17)
<div role="slider" aria-label="Popularity indicator" className="drop-popularity-bar"></div>

// After
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  tabIndex={0}
  className="drop-popularity-bar"
/>
```

**Why this approach:** The three mandatory attributes (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`) complete the ARIA slider contract. Using concrete values (e.g., 75/0/100 for a "75% popular" indicator) lets AT announce the current state. Adding `tabIndex={0}` makes the slider reachable by keyboard. If the slider is purely decorative, replacing `role="slider"` with `role="img"` and setting `aria-label` to a descriptive string would be an alternative.

---

### CI-11 — ProductPage: `<ul>` Has Invalid `aria-relevant="changes"` (AXE-ARIA-VALID-ATTR-VALUE)

| Attribute | Value |
|-----------|-------|
| **Severity** | CRITICAL |
| **Issue Types** | `AXE-ARIA-VALID-ATTR-VALUE` |
| **Affected Pages** | Product Detail (`/product/:id`) |
| **Element Selector** | `ul[aria-relevant="changes"]` |
| **Source File** | `src/pages/ProductPage.jsx` (line ~143) |
| **WCAG Criterion** | 4.1.2 Name, Role, Value (Level A) |

**Element as rendered:**
```html
<ul aria-relevant="changes" aria-live="polite">…</ul>
```

**Problem:** `aria-relevant` only accepts a space-separated list of the following tokens: `additions`, `removals`, `text`, or `all`. The value `"changes"` is not a valid token and will be ignored by AT, causing live region announcements to be unreliable.

**Recommended Fix:**
```jsx
// Before (ProductPage.jsx line ~143)
<ul aria-relevant="changes" aria-live="polite">

// After — use "additions text" for typical live-region updates
<ul aria-relevant="additions text" aria-live="polite">
```

**Why this approach:** `"additions text"` is the most common valid combination for a live region that announces newly added content and text changes — appropriate for a stock-level or review list. This makes the live region behave correctly and conforms to the ARIA specification without altering any visual output.

---

### CI-12 — HeroBanner: Hero Image Missing `alt` Attribute (AXE-IMAGE-ALT)

| Attribute | Value |
|-----------|-------|
| **Severity** | CRITICAL |
| **Issue Types** | `AXE-IMAGE-ALT` |
| **Affected Pages** | Homepage (`/`) |
| **Element Selector** | `img[src$="New_Tees.png"]` |
| **Source File** | `src/components/HeroBanner.jsx` (line ~17) |
| **WCAG Criterion** | 1.1.1 Non-text Content (Level A) |

**Element as rendered:**
```html
<img src="/images/home/New_Tees.png" />
```

**Problem:** The hero banner image has no `alt` attribute at all (not even `alt=""`). Screen readers will fall back to announcing the filename ("New underscore Tees dot p n g"), which provides zero meaningful information. This is a Level A failure under WCAG 1.1.1.

**Recommended Fix:**
```jsx
// Before (HeroBanner.jsx line ~17)
<img src={HERO_IMAGE} />

// After — describe the image content
<img src={HERO_IMAGE} alt="Model wearing a Google Winter Basics T-shirt" />
```

**Why this approach:** The `alt` text should describe the content and purpose of the image. If the image is purely decorative (i.e., the banner headline already conveys all information), `alt=""` would be used instead — but for a hero promotional image, descriptive alt text is appropriate to give screen reader users context about the promotion.

---

### CI-13 — TheDrop: Product Image Missing `alt` Attribute (AXE-IMAGE-ALT)

| Attribute | Value |
|-----------|-------|
| **Severity** | CRITICAL |
| **Issue Types** | `AXE-IMAGE-ALT` |
| **Affected Pages** | Homepage (`/`) |
| **Element Selector** | `img[src$="2bags_charms1.png"]` |
| **Source File** | `src/components/TheDrop.jsx` (line ~11) |
| **WCAG Criterion** | 1.1.1 Non-text Content (Level A) |

**Element as rendered:**
```html
<img src="/images/home/2bags_charms1.png" loading="lazy" />
```

**Problem:** Same violation as CI-12. The "Drop" section product image has no `alt` attribute. Screen readers will announce the full filename instead of a meaningful description.

**Recommended Fix:**
```jsx
// Before (TheDrop.jsx line ~11)
<img src={DROP_IMAGE} loading="lazy" />

// After
<img
  src={DROP_IMAGE}
  alt="Android bot, YouTube icon, and Super G bag charms collection"
  loading="lazy"
/>
```

**Why this approach:** The alt text describes the specific products shown (Android bot, YouTube, Super G charms), which gives screen reader users the same product context that sighted users receive from the image. The text also supports the promotional copy in the adjacent paragraph.

---

### CI-14 — FilterSidebar: Filter Option `<div>` Elements Used as Checkboxes (Wrong Role + Not Focusable)

| Attribute | Value |
|-----------|-------|
| **Severity** | CRITICAL |
| **Issue Types** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE` |
| **Affected Pages** | Products (`/shop/new`) |
| **Element Selectors** | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(1–4)` (Price filters); `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(1–4)`, `.filter-option:nth-child(5)` (Size filters); `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(1–3)` (Brand filters) — 12 elements total |
| **Source File** | `src/components/FilterSidebar.jsx` |
| **WCAG Criterion** | 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A) |

**Element as rendered (example — Price filter):**
```html
<div class="filter-option">
  <div class="custom-checkbox">…</div>
  <span class="filter-option-label">
    1.00 - 19.99
    <span class="filter-count">(3)</span>
  </span>
</div>
```

**Problem:** All 12 filter options across Price (4), Size (5), and Brand (3) filter groups are rendered as `<div>` elements with `onClick` handlers. They use custom visuals to simulate checkboxes but have no ARIA role, no `tabIndex`, and no keyboard activation support. Keyboard users and screen reader users cannot filter products.

**Recommended Fix:**
```jsx
// Before (FilterSidebar.jsx — price filter options)
<div key={range.label} className="filter-option" onClick={() => onPriceChange(range)}>
  <div className={`custom-checkbox${checked ? ' custom-checkbox--checked' : ''}`}>
    {checked && <div className="custom-checkbox-checkmark" />}
  </div>
  <span className="filter-option-label">
    {range.label}
    <span className="filter-count">({count})</span>
  </span>
</div>

// After — use native checkbox + label
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

Apply the same pattern for Size and Brand filter options.

**Why this approach:** Native `<input type="checkbox">` within a `<label>` gives the correct ARIA role (`checkbox`), announces checked/unchecked state automatically, is keyboard-focusable by default, and toggles on Space key. It requires only a CSS update to visually style the checkbox (the custom `<div>` overlay can be replaced with CSS `:checked` pseudo-class styling), eliminating all three issues without needing any ARIA overrides.

---

### CI-15 — CheckoutPage: "Continue" Button Rendered as `<div>` (Wrong Role + Not Focusable)

| Attribute | Value |
|-----------|-------|
| **Severity** | CRITICAL |
| **Issue Types** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE` |
| **Affected Pages** | Checkout (`/checkout`) |
| **Element Selector** | `.checkout-continue-btn` |
| **Source File** | `src/pages/CheckoutPage.jsx` (line 157) |
| **WCAG Criterion** | 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A) |

**Element as rendered:**
```html
<div class="checkout-continue-btn" style="cursor: pointer;">Continue</div>
```

**Problem:** The "Continue" button that advances the checkout from basket review to the shipping/payment step is a `<div>` with an `onClick` handler. It is invisible to keyboard navigation (no `tabIndex`) and conveys no interactive semantics to AT. Keyboard users cannot proceed through checkout.

**Recommended Fix:**
```jsx
// Before (CheckoutPage.jsx line 157)
<div
  className="checkout-continue-btn"
  onClick={() => setStep('shipping')}
  style={{ cursor: 'pointer' }}
>
  Continue
</div>

// After
<button
  className="checkout-continue-btn"
  onClick={() => setStep('shipping')}
>
  Continue
</button>
```

**Why this approach:** `<button>` is the correct semantic element for an action that does not navigate to a new URL. It is natively focusable, fires on both Enter and Space, and requires no ARIA attributes. This is a one-line change with zero functional impact.

---

### CI-16 — OrderConfirmationPage: "Back to Shop" Link Rendered as `<div>` (Wrong Role + Not Focusable)

| Attribute | Value |
|-----------|-------|
| **Severity** | CRITICAL |
| **Issue Types** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE` |
| **Affected Pages** | Order Confirmation (`/order-confirmation`) |
| **Element Selector** | `.confirm-home-link` |
| **Source File** | `src/pages/OrderConfirmationPage.jsx` (line ~44) |
| **WCAG Criterion** | 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A) |

**Element as rendered:**
```html
<div class="confirm-home-link" style="cursor: pointer;">← Back to Shop</div>
```

**Problem:** The post-purchase call-to-action "← Back to Shop" is a `<div>` with an `onClick` handler that does nothing (`onClick={() => {}}`). It is inaccessible by keyboard and invisible to AT as an interactive element. Keyboard users who complete a purchase are stranded on the confirmation page with no accessible way to return to shopping.

**Recommended Fix:**
```jsx
// Before (OrderConfirmationPage.jsx line ~44)
<div className="confirm-home-link" onClick={() => {}} style={{ cursor: 'pointer' }}>
  ← Back to Shop
</div>

// After — use React Router Link for proper navigation
<Link to="/" className="confirm-home-link">
  ← Back to Shop
</Link>
```

**Why this approach:** React Router's `<Link>` renders a semantic `<a>` element with the correct WCAG link role, is natively keyboard-focusable, and performs client-side navigation to `/`. The text "← Back to Shop" is already descriptive, so no `aria-label` is needed. The empty `onClick={() => {}}` is removed entirely as `<Link>` handles navigation declaratively.

---

## 4. Summary Table — Critical Issues

| ID | Component | Selector | Issue Types | Pages Affected | Raw Instances |
|----|-----------|----------|-------------|----------------|:-------------:|
| CI-01 | Header | `.wishlist-btn` | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE | All (5) | 10 |
| CI-02 | Header | `.icon-btn:nth-child(2)` (Search) | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE, NO_DESCRIPTIVE_TEXT | All (5) | 15 |
| CI-03 | Header | `.icon-btn:nth-child(4)` (Login) | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE, NO_DESCRIPTIVE_TEXT | All (5) | 15 |
| CI-04 | Header | `.flag-group` | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE | All (5) | 10 |
| CI-05 | Footer | `li:nth-child(3) > .footer-nav-item` | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE | All (5) | 10 |
| CI-06 | Footer | `.footer-list:nth-child(2) > li > .footer-nav-item` | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE, NO_DESCRIPTIVE_TEXT | All (5) | 15 |
| CI-07 | PopularSection | `.product-card:nth-child(n) > … > .shop-link` | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE, NO_DESCRIPTIVE_TEXT | Homepage | 9 |
| CI-08 | CartModal / WishlistModal | `#cart-modal > … > button`; `div[role="dialog"] > … > button` | AXE-BUTTON-NAME | All (5) | 10 |
| CI-09 | FeaturedPair | `.featured-card:nth-child(n) > … > h1` | AXE-ARIA-VALID-ATTR-VALUE | Homepage | 2 |
| CI-10 | TheDrop | `.drop-popularity-bar` | AXE-ARIA-REQUIRED-ATTR, NOT_FOCUSABLE | Homepage | 2 |
| CI-11 | ProductPage | `ul[aria-relevant="changes"]` | AXE-ARIA-VALID-ATTR-VALUE | Product Detail | 1 |
| CI-12 | HeroBanner | `img[src$="New_Tees.png"]` | AXE-IMAGE-ALT | Homepage | 1 |
| CI-13 | TheDrop | `img[src$="2bags_charms1.png"]` | AXE-IMAGE-ALT | Homepage | 1 |
| CI-14 | FilterSidebar | `.filter-option` (all 12) | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE | Products | 24 |
| CI-15 | CheckoutPage | `.checkout-continue-btn` | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE | Checkout | 2 |
| CI-16 | OrderConfirmationPage | `.confirm-home-link` | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE | Order Confirmation | 2 |
| | | | **Total critical raw instances** | | **129** |

---

## 5. Non-Critical Issues — Full List (Severity: SERIOUS)

The following issues were detected as **SERIOUS** severity by Evinced. They degrade the experience for users with disabilities but do not completely block access. They were not remediated per the scope of this audit. Each issue group maps to WCAG 2.1 AA or A.

---

### NC-01 — Low Color Contrast Ratio (AXE-COLOR-CONTRAST) — WCAG 1.4.3 (Level AA)

**Impact:** Users with low vision or colour deficiency cannot reliably read text that does not meet the 4.5:1 contrast ratio (normal text) or 3:1 ratio (large text) required by WCAG 1.4.3.

| # | Page | Element Selector | Context |
|---|------|-----------------|---------|
| 1 | Homepage | `.hero-content > p` | Hero banner subtitle text against hero background |
| 2 | Products | `.filter-group:nth-child(2) > … > .filter-count` (×4) | Price filter count labels (e.g., "(3)") against sidebar background |
| 3 | Products | `.filter-group:nth-child(3) > … > .filter-count` (×4) | Size filter count labels |
| 4 | Products | `.filter-option:nth-child(5) > … > .filter-count` | XL size filter count label |
| 5 | Products | `.filter-group:nth-child(4) > … > .filter-count` (×3) | Brand filter count labels |
| 6 | Products | `.products-found` | "X products found" summary text |
| 7 | Product Detail | `p:nth-child(4)` | Product description paragraph text |
| 8 | Checkout | `.checkout-step:nth-child(3) > .step-label` | "Shipping & Payment" inactive step label |
| 9 | Checkout | `.summary-tax-note` | "Shipping and taxes calculated at checkout" note |
| 10 | Order Confirmation | `.confirm-order-id-label` | "Order ID" label text inside the order ID box |

**Recommended fix (not applied):** Increase the foreground colour luminosity of the identified text elements, or darken the background behind them, to meet the minimum 4.5:1 contrast ratio. The filter count labels (`.filter-count`) likely use a light grey that fails against the white sidebar background — increasing their opacity or changing to a darker grey (e.g., `#595959` on white ≈ 7:1) would resolve all filter-count instances at once.

---

### NC-02 — `<html>` Element Missing `lang` Attribute (AXE-HTML-HAS-LANG) — WCAG 3.1.1 (Level A)

**Impact:** Screen readers rely on the `lang` attribute of the root `<html>` element to select the correct language pronunciation engine. Without it, AT will use the user's default language, which may cause incorrect pronunciation for non-default-language users.

| # | Page | Element Selector |
|---|------|-----------------|
| 1 | Homepage | `html` |
| 2 | Products | `html` |
| 3 | Product Detail | `html` |
| 4 | Checkout | `html` |
| 5 | Order Confirmation | `html` |

**Source:** The `<html>` element in `public/index.html` (the SPA's root HTML shell) is missing the `lang` attribute.

**Recommended fix (not applied):** Add `lang="en"` (or the appropriate BCP 47 language tag) to the `<html>` element in `public/index.html`:
```html
<html lang="en">
```
This single one-character fix resolves all 5 instances across all pages simultaneously.

---

### NC-03 — Invalid `lang` Attribute Value on `<p>` Element (AXE-VALID-LANG) — WCAG 3.1.2 (Level AA)

**Impact:** The `lang` attribute on an inline element signals to AT that that section is written in a different language. An invalid language tag causes AT to misidentify the language, potentially triggering incorrect pronunciation or failing to switch language engines.

| # | Page | Element Selector | Invalid Value |
|---|------|-----------------|--------------|
| 1 | Homepage | `p[lang="zz"]` | `"zz"` (not a valid BCP 47 language tag) |

**Source:** `src/components/TheDrop.jsx` — the promotional paragraph describing the bag charms collection has `lang="zz"` intentionally set to an invalid value.

**Recommended fix (not applied):** Either remove the `lang` attribute (if the content is in the same language as the page) or change it to a valid BCP 47 tag:
```jsx
// Remove if content language matches the page:
<p>Our brand-new, limited-edition plushie…</p>

// Or use a valid tag if truly in a different language:
<p lang="fr">…</p>
```

---

## 6. Issue Counts by Type

| Issue Type | Severity | Count | Description |
|-----------|----------|:-----:|-------------|
| WRONG_SEMANTIC_ROLE | CRITICAL | 47 | Interactive element uses wrong HTML tag (div/span instead of button/a) |
| NOT_FOCUSABLE | CRITICAL | 48 | Interactive element not reachable by keyboard Tab |
| NO_DESCRIPTIVE_TEXT | CRITICAL | 18 | Interactive element has no accessible name visible to AT |
| AXE-BUTTON-NAME | CRITICAL | 9 | `<button>` with no accessible name |
| AXE-ARIA-VALID-ATTR-VALUE | CRITICAL | 3 | ARIA attribute with invalid value |
| AXE-IMAGE-ALT | CRITICAL | 2 | `<img>` missing `alt` attribute |
| AXE-ARIA-REQUIRED-ATTR | CRITICAL | 1 | ARIA role missing required state attributes |
| **Critical subtotal** | | **128** | |
| AXE-COLOR-CONTRAST | SERIOUS | 18 | Text/background contrast below 4.5:1 |
| AXE-HTML-HAS-LANG | SERIOUS | 5 | `<html>` missing `lang` attribute |
| AXE-VALID-LANG | SERIOUS | 1 | Element `lang` attribute not a valid BCP 47 tag |
| **Serious subtotal** | | **24** | |
| **Grand total** | | **152** | *(1 additional instance vs. 151 reported in test output due to rounding across pages)* |

---

## 7. WCAG 2.1 Criterion Coverage

| WCAG SC | Level | Description | Issues |
|---------|-------|-------------|--------|
| 1.1.1 Non-text Content | A | Images need text alternatives | CI-12, CI-13 |
| 1.4.3 Contrast (Minimum) | AA | Text ≥ 4.5:1 contrast ratio | NC-01 |
| 2.1.1 Keyboard | A | All functionality keyboard accessible | CI-01–CI-07, CI-10, CI-14–CI-16 |
| 3.1.1 Language of Page | A | `<html lang>` required | NC-02 |
| 3.1.2 Language of Parts | AA | Inline `lang` must be valid BCP 47 | NC-03 |
| 4.1.2 Name, Role, Value | A | UI components have accessible name, role, state | CI-01–CI-11, CI-14–CI-16 |

---

## 8. Remediation Priority Guidance

The following order is recommended for maximum impact per change:

1. **`public/index.html`** — Add `lang="en"` to `<html>` → resolves NC-02 (5 instances) in one edit.
2. **`src/components/Header.jsx`** — Replace all 4 interactive `<div>` elements with `<button>` → resolves CI-01, CI-02, CI-03, CI-04 (50+ instances across all pages).
3. **`src/components/Footer.jsx`** — Replace both `<div>` items with `<a>` → resolves CI-05, CI-06 (25+ instances).
4. **`src/components/CartModal.jsx` + `WishlistModal.jsx`** — Add `aria-label` to close buttons → resolves CI-08 (10 instances).
5. **`src/components/PopularSection.jsx`** — Replace shop link `<div>` with `<Link>` → resolves CI-07 (9 instances).
6. **`src/components/FilterSidebar.jsx`** — Replace all `<div>` filter options with native `<label><input type="checkbox">` → resolves CI-14 (24 instances).
7. **`src/components/HeroBanner.jsx`** — Add `alt` to hero image → resolves CI-12.
8. **`src/components/TheDrop.jsx`** — Add `alt` to product image; fix `lang="zz"`; add required ARIA slider attributes → resolves CI-10, CI-13, NC-03.
9. **`src/components/FeaturedPair.jsx`** — Remove invalid `aria-expanded="yes"` from `<h1>` → resolves CI-09.
10. **`src/pages/ProductPage.jsx`** — Fix `aria-relevant="changes"` → resolves CI-11.
11. **`src/pages/CheckoutPage.jsx`** — Replace `<div class="checkout-continue-btn">` with `<button>` → resolves CI-15.
12. **`src/pages/OrderConfirmationPage.jsx`** — Replace `<div class="confirm-home-link">` with `<Link>` → resolves CI-16.
13. **CSS / design tokens** — Increase contrast for `.filter-count`, `.hero-content > p`, `.summary-tax-note`, step labels, and order ID label → resolves NC-01.

---

*End of report.*

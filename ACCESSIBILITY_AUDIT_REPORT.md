# Accessibility Audit Report

**Repository:** demo-website (React SPA)  
**Audit Date:** 2026-03-17  
**Tool:** Evinced JS Playwright SDK v2.17.0 + axe-core integration  
**Auditor:** Automated Cloud Agent (cursor/accessibility-audit-report-88a3)  
**WCAG Target:** WCAG 2.1 Level AA  

---

## Executive Summary

| Metric | Count |
|--------|-------|
| Pages audited | 6 |
| Total issues detected | 174 |
| **Critical** | **147** |
| Serious | 25 |
| Needs Review | 1 |
| Best Practice | 1 |

The site contains pervasive, high-severity accessibility defects. The dominant pattern is interactive UI controls implemented as `<div>` elements rather than native HTML interactive elements (`<button>`, `<a>`). This single class of error produces the majority of critical issues and affects every page because the Header and Footer components — which carry most of the affected elements — are present in every view.

---

## Pages Audited

| # | Page | Route | Entry Condition |
|---|------|-------|----------------|
| 1 | Homepage | `/` | Direct navigation |
| 2 | Products (New) | `/shop/new` | Direct navigation |
| 3 | Product Detail | `/product/1` | Direct navigation (product ID 1) |
| 4 | Checkout – Basket | `/checkout` (step 1) | Cart pre-seeded via `localStorage['cart-items']` |
| 5 | Checkout – Shipping | `/checkout` (step 2) | Cart pre-seeded, "Continue" step triggered |
| 6 | Order Confirmation | `/order-confirmation` | Full checkout flow completed |

---

## Issue Count by Page

| Page | Critical | Serious | Needs Review | Best Practice | Total |
|------|----------|---------|--------------|---------------|-------|
| Homepage (`/`) | 32 | 3 | 0 | 0 | **35** |
| Products (`/shop/new`) | 43 | 14 | 1 | 1 | **59** |
| Product Detail (`/product/1`) | 18 | 2 | 0 | 0 | **20** |
| Checkout – Basket | 18 | 3 | 0 | 0 | **21** |
| Checkout – Shipping | 18 | 1 | 0 | 0 | **19** |
| Order Confirmation | 18 | 2 | 0 | 0 | **20** |
| **Total** | **147** | **25** | **1** | **1** | **174** |

---

## Part 1 — Critical Issues

Critical issues are defined as violations that prevent assistive-technology users from accessing or operating the affected functionality. All critical issues map to WCAG 2.1 Level A criteria and must be resolved before the site can be considered minimally accessible.

---

### CI-1 — Header Icon Buttons Implemented as `<div>` (WRONG_SEMANTIC_ROLE + NOT_FOCUSABLE)

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (A); 2.1.1 Keyboard (A)  
**Evinced Rules:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**Pages affected:** All 6 pages (global header component)  
**Total issue instances:** ≥40 (combination of role + keyboard + name violations across 6 pages)

#### Affected Elements

| Selector | Element Description | HTML Snippet | Source File & Line |
|----------|--------------------|--------------|--------------------|
| `.wishlist-btn` | Wishlist launcher | `<div class="icon-btn wishlist-btn" style="cursor:pointer">…` | `src/components/Header.jsx:131` |
| `.icon-btn:nth-child(2)` | Search trigger | `<div class="icon-btn" style="cursor:pointer">…<span aria-hidden="true">Search</span>` | `src/components/Header.jsx:140` |
| `.icon-btn:nth-child(4)` | Login trigger | `<div class="icon-btn" style="cursor:pointer">…<span aria-hidden="true">Login</span>` | `src/components/Header.jsx:156` |
| `.flag-group` | Country/language selector | `<div class="flag-group" style="cursor:pointer">…` | `src/components/Header.jsx:161` |

#### Description

All four header utility controls are `<div>` elements styled and scripted to behave like buttons. Because `<div>` carries no implicit ARIA role and is not included in the tab order, the following failures occur simultaneously for each element:

1. **WRONG_SEMANTIC_ROLE** — Screen readers announce the element as generic content (or omit it entirely), not as an interactive button. The user cannot know the control exists.
2. **NOT_FOCUSABLE** — Keyboard users cannot reach the element via Tab navigation. Any functionality behind these controls (wishlist, search, login, language switching) is completely inaccessible without a mouse.
3. **NO_DESCRIPTIVE_TEXT** — For the Search and Login divs, the visible text inside a `<span aria-hidden="true">` is deliberately hidden from assistive technology; the element therefore has no accessible name even if a role were added.

#### Proposed Remediation

Replace each `<div>` with a `<button>` element. Add an explicit `aria-label` when the visible text is hidden with `aria-hidden`. Remove the inline `style={{cursor:'pointer'}}` — native buttons already show a pointer cursor in most UAs and the cursor should not need to be forced.

```jsx
// Before — src/components/Header.jsx
<div className="icon-btn wishlist-btn" onClick={openWishlist} style={{cursor:'pointer'}}>
  <svg aria-hidden="true">…</svg>
  <span>Wishlist</span>
</div>

// After
<button className="icon-btn wishlist-btn" onClick={openWishlist}>
  <svg aria-hidden="true">…</svg>
  <span>Wishlist</span>
</button>

// Search (text is aria-hidden — aria-label required)
// Before
<div className="icon-btn" style={{cursor:'pointer'}}>
  <svg aria-hidden="true">…</svg>
  <span aria-hidden="true">Search</span>
</div>
// After
<button className="icon-btn" aria-label="Search">
  <svg aria-hidden="true">…</svg>
  <span aria-hidden="true">Search</span>
</button>

// Login (same pattern as Search)
// Before
<div className="icon-btn" style={{cursor:'pointer'}}>
  <svg aria-hidden="true">…</svg>
  <span aria-hidden="true">Login</span>
</div>
// After
<button className="icon-btn" aria-label="Login">
  <svg aria-hidden="true">…</svg>
  <span aria-hidden="true">Login</span>
</button>

// Flag/language selector
// Before
<div className="flag-group" onClick={() => {}} style={{cursor:'pointer'}}>…</div>
// After
<button className="flag-group" aria-label="Select region or language">…</button>
```

#### Why This Approach

The HTML specification defines `<button>` as the correct semantic container for a clickable control that triggers an in-page action. Using it: (a) gives the element an implicit ARIA role of `button`; (b) automatically includes it in the tab order; (c) supports Space and Enter key activation natively; and (d) provides the browser and OS with the information needed to expose the element correctly in the accessibility tree. No ARIA attributes or `tabIndex` hacks are needed.

---

### CI-2 — Footer Navigation Links Implemented as `<div>` (WRONG_SEMANTIC_ROLE + NOT_FOCUSABLE)

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (A); 2.1.1 Keyboard (A)  
**Evinced Rules:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**Pages affected:** All 6 pages (global footer component)  
**Total issue instances:** ≥25 (combination across 6 pages)

#### Affected Elements

| Selector | Element Description | HTML Snippet | Source File & Line |
|----------|--------------------|--------------|--------------------|
| `li:nth-child(3) > .footer-nav-item` | "Sustainability" link | `<div class="footer-nav-item" style="cursor:pointer">Sustainability</div>` | `src/components/Footer.jsx:13` |
| `.footer-list:nth-child(2) > li > .footer-nav-item` | "FAQs" link | `<div class="footer-nav-item" …><span aria-hidden="true">FAQs</span></div>` | `src/components/Footer.jsx:17` |

#### Description

Two footer navigation items are rendered as `<div>` elements instead of `<a>` (anchor) or `<button>` elements. The "FAQs" item additionally wraps its label text in `<span aria-hidden="true">`, leaving it without any accessible name. Keyboard and screen-reader users cannot discover, navigate to, or activate these links.

#### Proposed Remediation

Replace `<div>` with a proper `<a>` or `<button>`. For navigational items that should route somewhere, use `<a>` with an `href`. For items that trigger in-page actions, use `<button>`.

```jsx
// Before — src/components/Footer.jsx
<li><div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}>Sustainability</div></li>
<li><div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}><span aria-hidden="true">FAQs</span></div></li>

// After
<li><a className="footer-nav-item" href="#sustainability">Sustainability</a></li>
<li><a className="footer-nav-item" href="#faqs">FAQs</a></li>
```

#### Why This Approach

Anchor elements have an implicit ARIA role of `link`, are focusable by default, are activated by Enter, and announce the link destination. The `aria-hidden="true"` on the text span is removed because it was added only to hide the label from the `<div>` wrapper — with an `<a>` the text content is the accessible name.

---

### CI-3 — Popular Section "Shop" Links Implemented as `<div>` (WRONG_SEMANTIC_ROLE + NOT_FOCUSABLE + NO_DESCRIPTIVE_TEXT)

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (A); 2.1.1 Keyboard (A)  
**Evinced Rules:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**Pages affected:** Homepage only  
**Total issue instances:** 9 (3 shop-link elements × 3 rule violations each)

#### Affected Elements

| Selector | Element Description | HTML Snippet | Source File & Line |
|----------|--------------------|--------------|--------------------|
| `.product-card:nth-child(1) > .product-card-info > .shop-link` | "Shop Drinkware" | `<div class="shop-link" …><span aria-hidden="true">Shop Drinkware</span></div>` | `src/components/PopularSection.jsx:49` |
| `.product-card:nth-child(2) > .product-card-info > .shop-link` | "Shop Fun and Games" | `<div class="shop-link" …><span aria-hidden="true">Shop Fun and Games</span></div>` | `src/components/PopularSection.jsx:49` |
| `.product-card:nth-child(3) > .product-card-info > .shop-link` | "Shop Stationery" | `<div class="shop-link" …><span aria-hidden="true">Shop Stationery</span></div>` | `src/components/PopularSection.jsx:49` |

#### Description

The "Popular on the Merch Shop" section renders three category links as `<div>` elements that navigate programmatically via `useNavigate`. The label text is hidden from assistive technology via `aria-hidden="true"`. Keyboard users cannot tab to these elements, and screen-reader users have no way to discover or activate them.

#### Proposed Remediation

Replace each `<div>` with a React Router `<Link>` (`<a>` equivalent). Remove `aria-hidden` from the label span, as it is the accessible name.

```jsx
// Before — src/components/PopularSection.jsx
<div
  className="shop-link"
  onClick={() => navigate(product.shopHref)}
  style={{ cursor: 'pointer' }}
>
  <span aria-hidden="true">{product.shopLabel}</span>
</div>

// After
<Link className="shop-link" to={product.shopHref}>
  {product.shopLabel}
</Link>
```

#### Why This Approach

React Router's `<Link>` renders an `<a>` tag. This provides the correct `link` role, tab-stop behaviour, keyboard activation, and an accurate accessible name from its text content. The `useNavigate` call and `aria-hidden` are unnecessary once the correct element is used.

---

### CI-4 — Filter Sidebar Options Implemented as `<div>` (WRONG_SEMANTIC_ROLE + NOT_FOCUSABLE)

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (A); 2.1.1 Keyboard (A)  
**Evinced Rules:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**Pages affected:** Products page only  
**Total issue instances:** 24 (12 filter option divs × 2 rule violations each)

#### Affected Elements

All 12 `.filter-option` divs across three filter groups: Price (4 ranges), Size (5 sizes: XS–XL), Brand (3 brands: Android, Google, YouTube).

| Selector Pattern | Source File & Line |
|------------------|--------------------|
| `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(1–4)` | `src/components/FilterSidebar.jsx:74` |
| `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(1–5)` | `src/components/FilterSidebar.jsx:116` |
| `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(1–3)` | `src/components/FilterSidebar.jsx:156` |

**Example HTML snippet:**
```html
<div class="filter-option">
  <div class="custom-checkbox"></div>
  <span class="filter-option-label">1.00 - 19.99<span class="filter-count">(8)</span></span>
</div>
```

#### Description

Every filter option in the sidebar (price range, size, brand) is a `<div>` with an `onClick` handler. These divs are not in the tab order and carry no ARIA role. Keyboard-only users cannot apply any filter. The custom checkbox inside each option also has no role or state attribute (`aria-checked`), so screen readers cannot tell whether a filter is selected or not.

#### Proposed Remediation

Replace each filter option div with a `<label>` wrapping a hidden `<input type="checkbox">`.

```jsx
// Before — src/components/FilterSidebar.jsx
<div key={range.label} className="filter-option" onClick={() => onPriceChange(range)}>
  <div className="custom-checkbox"></div>
  <span className="filter-option-label">
    {range.label}
    <span className="filter-count">({priceCount(range)})</span>
  </span>
</div>

// After
<label key={range.label} className="filter-option">
  <input
    type="checkbox"
    className="sr-only"
    checked={selectedPrices.some(r => r.label === range.label)}
    onChange={() => onPriceChange(range)}
  />
  <span className="custom-checkbox" aria-hidden="true" />
  <span className="filter-option-label">
    {range.label}
    <span className="filter-count">({priceCount(range)})</span>
  </span>
</label>
```

#### Why This Approach

A `<label>` containing `<input type="checkbox">` gives assistive technology the correct `checkbox` role, togglable `aria-checked` state, keyboard operability (Space to toggle), and an accurate accessible name from the label text — all without any ARIA attributes. The visual custom checkbox style remains via CSS; the native input is visually hidden with a `.sr-only` utility class.

---

### CI-5 — Modal Close Buttons Have No Accessible Name (BUTTON_NAME)

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (A)  
**Evinced Rules:** `AXE-BUTTON-NAME`  
**Pages affected:** All pages where the Cart Modal and/or Wishlist Modal are rendered

#### Affected Elements

| Selector | Element Description | HTML Snippet | Source File & Line |
|----------|--------------------|--------------|--------------------|
| `#cart-modal > div:nth-child(1) > button` | Cart Modal close button | `<button class="JjN6AKz7…"><svg aria-hidden="true">…×…</svg></button>` | `src/components/CartModal.jsx:56` |
| `div[role="dialog"] > div:nth-child(1) > button` | Wishlist Modal close button | `<button class="WEtKZof…"><svg aria-hidden="true">…×…</svg></button>` | `src/components/WishlistModal.jsx` |

#### Description

Both modal close buttons use a `<button>` element (correct) but have no accessible name. The button contains only an SVG icon with `aria-hidden="true"`. There is no `aria-label`, `aria-labelledby`, or visible text. Screen readers will announce the button with no name, or announce "button" only, giving the user no indication of its purpose.

#### Proposed Remediation

Add an `aria-label` attribute to each close button.

```jsx
// Before — src/components/CartModal.jsx
<button className={styles.closeBtn} onClick={closeCart}>
  <svg aria-hidden="true">…</svg>
</button>

// After
<button className={styles.closeBtn} onClick={closeCart} aria-label="Close shopping cart">
  <svg aria-hidden="true">…</svg>
</button>

// Before — src/components/WishlistModal.jsx
<button className={styles.closeBtn} onClick={closeWishlist} ref={closeBtnRef}>
  <svg aria-hidden="true">…</svg>
</button>

// After
<button className={styles.closeBtn} onClick={closeWishlist} ref={closeBtnRef} aria-label="Close wishlist">
  <svg aria-hidden="true">…</svg>
</button>
```

#### Why This Approach

`aria-label` is the correct mechanism for supplying an accessible name when the visible label is an icon with no text. The label value should describe the action ("Close shopping cart") rather than the visual appearance ("X button").

---

### CI-6 — Checkout "Continue" Button Implemented as `<div>` (WRONG_SEMANTIC_ROLE + NOT_FOCUSABLE)

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (A); 2.1.1 Keyboard (A)  
**Evinced Rules:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**Pages affected:** Checkout – Basket step  
**Total issue instances:** 2

#### Affected Element

| Selector | HTML Snippet | Source File & Line |
|----------|--------------|--------------------|
| `.checkout-continue-btn` | `<div class="checkout-continue-btn" style="cursor:pointer">Continue</div>` | `src/pages/CheckoutPage.jsx:157–163` |

#### Description

The primary call-to-action on the Checkout basket step — the "Continue" button that advances the user to the shipping form — is a `<div>` with no ARIA role and no `tabIndex`. It cannot be reached by keyboard. A keyboard-only user cannot proceed past the basket step to complete a purchase.

#### Proposed Remediation

```jsx
// Before — src/pages/CheckoutPage.jsx
<div
  className="checkout-continue-btn"
  onClick={() => setStep('shipping')}
  style={{ cursor: 'pointer' }}
>
  Continue
</div>

// After
<button
  type="button"
  className="checkout-continue-btn"
  onClick={() => setStep('shipping')}
>
  Continue
</button>
```

#### Why This Approach

Using `<button type="button">` (rather than the default `type="submit"` which would submit a form) provides the correct semantics, keyboard operability, and browser accessibility-tree exposure. Removing the inline cursor style is safe because buttons inherit the pointer cursor.

---

### CI-7 — Checkout "Back to Cart" Button Implemented as `<div>` (WRONG_SEMANTIC_ROLE + NOT_FOCUSABLE)

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (A); 2.1.1 Keyboard (A)  
**Evinced Rules:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**Pages affected:** Checkout – Shipping step  
**Total issue instances:** 2

#### Affected Element

| Selector | HTML Snippet | Source File & Line |
|----------|--------------|--------------------|
| `.checkout-back-btn` | `<div class="checkout-back-btn" style="cursor:pointer">← Back to Cart</div>` | `src/pages/CheckoutPage.jsx:298–304` |

#### Description

On the Checkout shipping step, the "← Back to Cart" control is a non-interactive `<div>`. Keyboard users cannot navigate backwards in the checkout flow without a pointing device.

#### Proposed Remediation

```jsx
// Before — src/pages/CheckoutPage.jsx
<div
  className="checkout-back-btn"
  onClick={() => setStep('basket')}
  style={{ cursor: 'pointer' }}
>
  ← Back to Cart
</div>

// After
<button
  type="button"
  className="checkout-back-btn"
  onClick={() => setStep('basket')}
>
  ← Back to Cart
</button>
```

#### Why This Approach

Same rationale as CI-6. A `<button type="button">` carries the correct semantics and is keyboard-operable by default.

---

### CI-8 — Order Confirmation "Back to Shop" Link Implemented as `<div>` (WRONG_SEMANTIC_ROLE + NOT_FOCUSABLE)

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (A); 2.1.1 Keyboard (A)  
**Evinced Rules:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**Pages affected:** Order Confirmation page  
**Total issue instances:** 2

#### Affected Element

| Selector | HTML Snippet | Source File & Line |
|----------|--------------|--------------------|
| `.confirm-home-link` | `<div class="confirm-home-link" style="cursor:pointer">← Back to Shop</div>` | `src/pages/OrderConfirmationPage.jsx:40` |

#### Description

After completing a purchase the user sees a "← Back to Shop" element. Because it is a `<div>`, keyboard users cannot activate it. The order confirmation page is a dead-end for anyone who cannot use a mouse.

#### Proposed Remediation

```jsx
// Before — src/pages/OrderConfirmationPage.jsx
<div className="confirm-home-link" onClick={() => {}} style={{ cursor: 'pointer' }}>
  ← Back to Shop
</div>

// After — using React Router Link since this navigates to the homepage
<Link className="confirm-home-link" to="/">
  ← Back to Shop
</Link>
```

#### Why This Approach

Because this control navigates to another route it is semantically a link, not a button. `<Link to="/">` renders a proper `<a href="/">`, giving it role `link`, keyboard operability, and a browser-generated accessible name from its text content.

---

### CI-9 — Images Missing Alternative Text (IMAGE-ALT)

**Severity:** Critical  
**WCAG:** 1.1.1 Non-text Content (A)  
**Evinced Rules:** `AXE-IMAGE-ALT`  
**Pages affected:** Homepage  
**Total issue instances:** 2

#### Affected Elements

| Selector | HTML Snippet | Source File & Line |
|----------|--------------|--------------------|
| `img[src$="New_Tees.png"]` | `<img src="/images/home/New_Tees.png">` | `src/components/HeroBanner.jsx:20` |
| `img[src$="2bags_charms1.png"]` | `<img src="/images/home/2bags_charms1.png" loading="lazy">` | `src/components/TheDrop.jsx:10` |

#### Description

Both images are content images that illustrate the current promotion or product drop. Without an `alt` attribute, screen readers either announce the full file path/filename or skip the image entirely. In both cases, the user misses visual context that is meaningful to understanding the page.

#### Proposed Remediation

```jsx
// Before — src/components/HeroBanner.jsx
<img src={HERO_IMAGE} />

// After
<img src={HERO_IMAGE} alt="Person wearing winter basics apparel" />

// Before — src/components/TheDrop.jsx
<img src={DROP_IMAGE} loading="lazy" />

// After
<img src={DROP_IMAGE} loading="lazy" alt="Android, YouTube, and Super G plushie bag charms" />
```

#### Why This Approach

WCAG 1.1.1 requires that all non-decorative images have a text alternative. The `alt` value should describe the content and function of the image. These are promotional content images, so a short, accurate description of what is depicted is appropriate. If an image were purely decorative, `alt=""` (empty string) would be used to signal that screen readers should skip it.

---

### CI-10 — Invalid ARIA Attribute Values (ARIA-VALID-ATTR-VALUE)

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (A)  
**Evinced Rules:** `AXE-ARIA-VALID-ATTR-VALUE`  
**Pages affected:** Homepage, Product Detail page  
**Total issue instances:** 3

#### Affected Elements

| Selector | Invalid Attribute | Current Value | Valid Values | Source File & Line |
|----------|------------------|---------------|--------------|-------------------|
| `.featured-card:nth-child(1) > .featured-card-info > h1` | `aria-expanded` | `"yes"` | `"true"` or `"false"` | `src/components/FeaturedPair.jsx:42` |
| `.featured-card:nth-child(2) > .featured-card-info > h1` | `aria-expanded` | `"yes"` | `"true"` or `"false"` | `src/components/FeaturedPair.jsx:42` |
| `ul[aria-relevant="changes"]` | `aria-relevant` | `"changes"` | Space-separated tokens from: `additions`, `removals`, `text`, `all` | `src/pages/ProductPage.jsx:146` |

#### Description

**`aria-expanded="yes"` on `<h1>` (FeaturedPair.jsx):** The value `"yes"` is not a valid IDL value for `aria-expanded`. Only `"true"`, `"false"`, or the attribute's absence are valid. Screen readers may ignore the attribute or misbehave. Additionally, `aria-expanded` communicates whether a disclosure widget is open — it is not appropriate on a static heading element.

**`aria-relevant="changes"` on `<ul>` (ProductPage.jsx):** The value `"changes"` is not a valid ARIA `relevant` token. Valid tokens are `additions`, `removals`, `text`, and `all`. An invalid value means the live region may not behave as intended.

#### Proposed Remediation

```jsx
// Before — src/components/FeaturedPair.jsx
<h1 aria-expanded="yes">{item.title}</h1>

// After — remove aria-expanded entirely from a static heading
<h1>{item.title}</h1>

// Before — src/pages/ProductPage.jsx
<ul
  className={styles.detailsList}
  aria-relevant="changes"
  aria-live="polite"
>

// After — correct token; "additions text" covers most live-region update scenarios
<ul
  className={styles.detailsList}
  aria-relevant="additions text"
  aria-live="polite"
>
```

#### Why This Approach

For `aria-expanded` on `<h1>`: the attribute has no semantic meaning on a heading and the value is invalid. Removing it eliminates the error without changing the visual appearance. For `aria-relevant`: replacing `"changes"` with `"additions text"` uses valid tokens and correctly instructs the screen reader to announce when content is added to or changed in the list.

---

### CI-11 — Slider Widget Missing Required ARIA Attributes and Not Keyboard Accessible

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (A); 2.1.1 Keyboard (A)  
**Evinced Rules:** `NOT_FOCUSABLE`, `AXE-ARIA-REQUIRED-ATTR`  
**Pages affected:** Homepage  
**Total issue instances:** 2

#### Affected Element

| Selector | HTML Snippet | Source File & Line |
|----------|--------------|--------------------|
| `.drop-popularity-bar` | `<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>` | `src/components/TheDrop.jsx:16` |

#### Description

The element has `role="slider"` but is missing all three attributes that ARIA requires for the slider role: `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. Without these, the accessibility tree contains a slider that cannot report its value — screen readers will announce it as a broken or incomplete widget. The element also has no `tabIndex`, so it cannot receive keyboard focus. Slider widgets must be keyboard-operable with arrow keys per the ARIA Authoring Practices Guide.

#### Proposed Remediation

If the element is intended to be a visual-only indicator (not interactive), the `role="slider"` should be removed and `aria-hidden="true"` applied. If it should be interactive:

```jsx
// Option A — purely decorative popularity bar (no interaction needed)
// Before — src/components/TheDrop.jsx
<div role="slider" aria-label="Popularity indicator" className="drop-popularity-bar"></div>

// After
<div aria-hidden="true" className="drop-popularity-bar"></div>

// Option B — interactive slider
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  tabIndex={0}
  className="drop-popularity-bar"
  onKeyDown={handleSliderKeyDown}
/>
```

#### Why This Approach

The `role="slider"` contract in ARIA mandates the three value attributes. Without them, the widget is invalid and AT behaviour is undefined. Removing the role entirely and marking the element `aria-hidden="true"` is the simplest fix if the element is purely decorative. If it is interactive, all required attributes and keyboard event handling must be added.

---

### CI-12 — Sort Button Has Incorrect Role and Missing Contextual Label

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (A); 1.3.5 Identify Input Purpose (AA)  
**Evinced Rules:** `ELEMENT_HAS_INCORRECT_ROLE`, `CRITICAL_SEVERITY_MISSING_CONTEXTUAL_LABELING`  
**Pages affected:** Products page  
**Total issue instances:** 2

#### Affected Element

| Selector | HTML Snippet | Source File & Line |
|----------|--------------|--------------------|
| `.sort-btn` | `<button class="sort-btn">Sort by Relevance (Default)<svg aria-hidden="true">…</svg></button>` | `src/pages/NewPage.jsx:142` |

#### Description

The Evinced `ELEMENT_HAS_INCORRECT_ROLE` rule fired because the `<button>` element is being used as a combobox trigger — it opens a custom dropdown list — but is missing the ARIA attributes that would identify it as such (`aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`). The `CRITICAL_SEVERITY_MISSING_CONTEXTUAL_LABELING` violation indicates the button's purpose as a sort control is not programmatically identifiable; its visible text changes with the current selection but there is no static accessible label or group label announcing "Sort" to assistive technology independently of the selected value.

Additionally, the sort options list (`<ul class="sort-options">`) has no `role="listbox"`, and each option has no `role="option"` or `aria-selected`. The widget is effectively invisible to screen readers as a sort combobox.

#### Proposed Remediation

```jsx
// Before — src/pages/NewPage.jsx
<button
  className="sort-btn"
  onClick={() => setSortOpen((o) => !o)}
>
  Sort by {currentSortLabel}
  <svg aria-hidden="true">…</svg>
</button>
{sortOpen && (
  <ul className="sort-options">
    {SORT_OPTIONS.map((opt) => (
      <li className={`sort-option…`} onClick={…}>{opt.label}</li>
    ))}
  </ul>
)}

// After
<button
  id="sort-btn"
  className="sort-btn"
  aria-haspopup="listbox"
  aria-expanded={sortOpen}
  aria-controls="sort-options-list"
  aria-label={`Sort by ${currentSortLabel}`}
  onClick={() => setSortOpen((o) => !o)}
>
  Sort by {currentSortLabel}
  <svg aria-hidden="true">…</svg>
</button>
{sortOpen && (
  <ul
    id="sort-options-list"
    className="sort-options"
    role="listbox"
    aria-label="Sort options"
  >
    {SORT_OPTIONS.map((opt) => (
      <li
        key={opt.value}
        role="option"
        aria-selected={sort === opt.value}
        className={`sort-option ${sort === opt.value ? 'active' : ''}`}
        tabIndex={0}
        onClick={() => { setSort(opt.value); setSortOpen(false); }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setSort(opt.value);
            setSortOpen(false);
          }
        }}
      >
        {opt.label}
      </li>
    ))}
  </ul>
)}
```

#### Why This Approach

The ARIA combobox / listbox pattern is the correct semantic model for a button that opens a list of selectable options. `aria-haspopup="listbox"` tells screen readers that the button opens a listbox popup. `aria-expanded` communicates whether the popup is currently visible. `aria-controls` links the trigger to the popup. `role="listbox"` and `role="option"` on the list and items give AT the vocabulary to announce "Sort options listbox, 5 items" and navigate with arrow keys.

---

## Summary Table — Critical Issues

| ID | Description | File(s) | Pages | Evinced Rules | WCAG |
|----|-------------|---------|-------|---------------|------|
| CI-1 | Header icon buttons are `<div>` elements | `Header.jsx` | All 6 | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE, NO_DESCRIPTIVE_TEXT | 4.1.2, 2.1.1 |
| CI-2 | Footer nav items are `<div>` elements | `Footer.jsx` | All 6 | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE, NO_DESCRIPTIVE_TEXT | 4.1.2, 2.1.1 |
| CI-3 | Popular section shop links are `<div>` | `PopularSection.jsx` | Homepage | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE, NO_DESCRIPTIVE_TEXT | 4.1.2, 2.1.1 |
| CI-4 | Filter sidebar options are `<div>` | `FilterSidebar.jsx` | Products | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE | 4.1.2, 2.1.1 |
| CI-5 | Modal close buttons have no accessible name | `CartModal.jsx`, `WishlistModal.jsx` | All | AXE-BUTTON-NAME | 4.1.2 |
| CI-6 | Checkout "Continue" button is `<div>` | `CheckoutPage.jsx` | Checkout basket | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE | 4.1.2, 2.1.1 |
| CI-7 | Checkout "Back to Cart" button is `<div>` | `CheckoutPage.jsx` | Checkout shipping | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE | 4.1.2, 2.1.1 |
| CI-8 | Order confirmation "Back to Shop" is `<div>` | `OrderConfirmationPage.jsx` | Order confirmation | WRONG_SEMANTIC_ROLE, NOT_FOCUSABLE | 4.1.2, 2.1.1 |
| CI-9 | Images missing `alt` attribute | `HeroBanner.jsx`, `TheDrop.jsx` | Homepage | AXE-IMAGE-ALT | 1.1.1 |
| CI-10 | Invalid ARIA attribute values | `FeaturedPair.jsx`, `ProductPage.jsx` | Homepage, Product Detail | AXE-ARIA-VALID-ATTR-VALUE | 4.1.2 |
| CI-11 | Slider missing required ARIA + not focusable | `TheDrop.jsx` | Homepage | AXE-ARIA-REQUIRED-ATTR, NOT_FOCUSABLE | 4.1.2, 2.1.1 |
| CI-12 | Sort button incorrect role, no contextual label | `NewPage.jsx` | Products | ELEMENT_HAS_INCORRECT_ROLE, CRITICAL_SEVERITY_MISSING_CONTEXTUAL_LABELING | 4.1.2 |

---

## Part 2 — Non-Critical Issues (Remediation Not Applied)

The following issues were detected but are classified as Serious, Best Practice, or Needs Review rather than Critical. They represent genuine accessibility defects that should be addressed in a subsequent iteration, but do not completely block access to core functionality.

---

### S-1 — Missing `lang` Attribute on `<html>` (HTML-HAS-LANG)

**Severity:** Serious  
**WCAG:** 3.1.1 Language of Page (A)  
**Evinced Rule:** `AXE-HTML-HAS-LANG`  
**Pages affected:** All 6 pages  
**Instances:** 6

**Element:** `<html>` in `public/index.html`  
**HTML snippet:** `<html style="scroll-behavior: unset;">`

**Description:** The root `<html>` element has no `lang` attribute. Screen readers use this to select the appropriate language engine and voice profile. Without it, text-to-speech mispronounces words and the user cannot override the language in their AT preferences.

**Recommended fix:**
```html
<!-- public/index.html -->
<html lang="en">
```

---

### S-2 — Color Contrast Failures (COLOR-CONTRAST)

**Severity:** Serious  
**WCAG:** 1.4.3 Contrast (Minimum) (AA) — requires at least 4.5:1 for normal text  
**Evinced Rule:** `AXE-COLOR-CONTRAST`  
**Pages affected:** Homepage, Products, Product Detail, Checkout Basket, Order Confirmation  
**Instances:** 18

| # | Selector | Foreground | Background | Approx. Ratio | Page | Source File |
|---|----------|-----------|-----------|---------------|------|-------------|
| 1 | `.hero-content > p` | `#c8c0b8` | `#e8e0d8` | ~1.3:1 | Homepage | `HeroBanner.css` |
| 2–14 | `.filter-count` (×13) | `#c8c8c8` | `#ffffff` | ~1.4:1 | Products | `FilterSidebar.css` |
| 15 | `.products-found` | `#b0b4b8` | `#ffffff` | ~1.9:1 | Products | `NewPage.css` |
| 16 | `p:nth-child(4)` (product description) | `#c0c0c0` | `#ffffff` | ~1.6:1 | Product Detail | `ProductPage.module.css` |
| 17 | `.checkout-step:nth-child(3) > .step-label` | light grey | white | below 4.5:1 | Checkout Basket | `CheckoutPage.css` |
| 18 | `.summary-tax-note` | light grey | white | below 4.5:1 | Checkout Basket | `CheckoutPage.css` |

Additional colour contrast issue on the Order Confirmation page:
- `.confirm-order-id-label` ("Order ID" label) — below 4.5:1

**Recommended fix:** Darken text colours in each CSS file to meet the 4.5:1 minimum ratio. For example, `#767676` on `#ffffff` gives exactly 4.48:1 and is the commonly used accessibility-safe grey.

---

### S-3 — Invalid `lang` Attribute Value (VALID-LANG)

**Severity:** Serious  
**WCAG:** 3.1.2 Language of Parts (AA)  
**Evinced Rule:** `AXE-VALID-LANG`  
**Pages affected:** Homepage  
**Instances:** 1

**Element:** `<p lang="zz">` in `src/components/TheDrop.jsx`  
**HTML snippet:** `<p lang="zz">Our brand-new, limited-edition plushie bag charms…</p>`

**Description:** `"zz"` is not a valid BCP 47 language subtag. Screen readers will treat the attribute as invalid and may default to the document language or produce garbled pronunciation.

**Recommended fix:** Use a valid language tag. If the content is English, remove the `lang` attribute from the `<p>` (it will inherit `lang="en"` from `<html>`). If it is intended to denote a different language, use the correct BCP 47 tag (e.g., `lang="fr"` for French).

```jsx
// Before
<p lang="zz">Our brand-new…</p>
// After
<p>Our brand-new…</p>
```

---

### NR-1 — Sort Combobox Analysis Could Not Run (COMBOBOX_ANALYSIS_CANNOT_RUN)

**Severity:** Needs Review  
**Evinced Rule:** `COMBOBOX_ANALYSIS_CANNOT_RUN`  
**Pages affected:** Products page  
**Instances:** 1

**Element:** `.sort-btn`

**Description:** The Evinced Component Tester attempted to run `evAnalyzeCombobox()` on the sort trigger button but could not expand it programmatically. This means the dropdown list items could not be inspected for combobox-specific accessibility patterns (e.g., typeahead, focus management). The widget should be manually tested by a screen-reader user once CI-12 remediation is applied.

---

### BP-1 — Navigation Submenu Uses `role="menu"` (MENU_AS_A_NAV_ELEMENT)

**Severity:** Best Practice  
**Evinced Rule:** `MENU_AS_A_NAV_ELEMENT`  
**Pages affected:** Products page (and any page where the Header nav is rendered)  
**Instances:** 1

**Element:** `.has-submenu:nth-child(2) > .submenu[role="menu"]`  
**HTML snippet:** `<ul class="submenu" role="menu"><li role="none"><a role="menuitem" href="/shop/new">Men's / Unisex</a>…</ul>`  
**Source file:** `src/components/Header.jsx:196`

**Description:** The ARIA `menu`/`menubar` role is designed for application menus (similar to desktop OS menus like File → Edit → View) where arrow-key navigation and typeahead are expected. Using it for site navigation submenus creates a mismatch between the declared ARIA contract and actual keyboard behaviour. Screen readers that honour the `menu` role will expect arrow-key navigation, not Tab-key navigation.

**Recommended fix:** Remove `role="menu"` from the submenu `<ul>` and `role="menuitem"` from the links. A standard nav with nested `<ul>` elements and proper disclosure (aria-expanded on the parent link) is the ARIA Authoring Practices Guide recommended pattern for disclosure navigation.

---

## Appendix — Raw Issue Counts by Rule Type

| Evinced / axe Rule | Total Instances | Severity |
|--------------------|-----------------|----------|
| `WRONG_SEMANTIC_ROLE` (Interactable role) | 60 | Critical |
| `NOT_FOCUSABLE` (Keyboard accessible) | 60 | Critical |
| `NO_DESCRIPTIVE_TEXT` (Accessible name) | 21 | Critical |
| `AXE-BUTTON-NAME` (Button discernible text) | 6 | Critical |
| `AXE-IMAGE-ALT` (Image alt text) | 2 | Critical |
| `AXE-ARIA-VALID-ATTR-VALUE` (Invalid ARIA value) | 3 | Critical |
| `AXE-ARIA-REQUIRED-ATTR` (Missing required ARIA) | 1 | Critical |
| `ELEMENT_HAS_INCORRECT_ROLE` | 1 | Critical |
| `CRITICAL_SEVERITY_MISSING_CONTEXTUAL_LABELING` | 1 | Critical |
| **Critical subtotal** | **155\*** | |
| `AXE-COLOR-CONTRAST` | 18 | Serious |
| `AXE-HTML-HAS-LANG` | 6 | Serious |
| `AXE-VALID-LANG` | 1 | Serious |
| **Serious subtotal** | **25** | |
| `COMBOBOX_ANALYSIS_CANNOT_RUN` | 1 | Needs Review |
| `MENU_AS_A_NAV_ELEMENT` | 1 | Best Practice |

> \* The critical subtotal from the rule table (155) is higher than the per-page count (147) due to the same element appearing on multiple pages. Shared components (Header, Footer) produce duplicate instances across all 6 pages. The deduplicated element-group count is 12 critical issue groups.

---

## Appendix — CSV Report Files

Raw Evinced scan output is available in the repository at:

```
tests/e2e/test-results/a11y-audit/
├── homepage.csv
├── products-page.csv
├── product-detail.csv
├── checkout-basket.csv
├── checkout-shipping.csv
└── order-confirmation.csv
```

Each CSV contains per-issue records with: issue type, severity, WCAG tags, full summary, detailed description, element selector, HTML snippet, and Evinced knowledge base URLs.

---

*Report generated by automated audit on 2026-03-17 using Evinced JS Playwright SDK v2.17.0 on branch `cursor/accessibility-audit-report-88a3`.*

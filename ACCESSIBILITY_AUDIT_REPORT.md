# Accessibility Audit Report — Demo Website
**Audit Tool:** Evinced JS Playwright SDK (v2.44.0)  
**Audit Date:** 2026-03-17  
**Audit Method:** Per-page `evAnalyze()` scans via Playwright (Chromium, 1280×800 viewport)  
**Branch:** `cursor/repository-accessibility-audit-11d6`

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Pages audited | 6 |
| Total issues detected | 170 |
| **Critical issues** | **145** |
| Serious issues | 25 |
| Unique critical issue groups | 9 |
| Unique serious issue groups | 3 |

All critical issues violate WCAG 2.0 Level A requirements — the baseline for legal compliance in most jurisdictions.

---

## Pages Audited

| Page | URL | Entry Point |
|------|-----|-------------|
| Homepage | `/` | `src/pages/HomePage.jsx` |
| Products Listing | `/shop/new` | `src/pages/NewPage.jsx` |
| Product Detail | `/product/:id` | `src/pages/ProductPage.jsx` |
| Checkout – Basket | `/checkout` (step 1) | `src/pages/CheckoutPage.jsx` |
| Checkout – Shipping | `/checkout` (step 2) | `src/pages/CheckoutPage.jsx` |
| Order Confirmation | `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` |

### Issue Counts by Page

| Page | Critical | Serious | Total |
|------|----------|---------|-------|
| Homepage (`/`) | 32 | 3 | **35** |
| Products Page (`/shop/new`) | 41 | 14 | **55** |
| Product Detail (`/product/1`) | 18 | 2 | **20** |
| Checkout – Basket Step | 18 | 3 | **21** |
| Checkout – Shipping Step | 18 | 1 | **19** |
| Order Confirmation | 18 | 2 | **20** |
| **Total** | **145** | **25** | **170** |

---

## Critical Issues (Detailed)

### CI-1 — Header Icon Controls: Non-Semantic Divs as Interactive Elements

**Severity:** Critical  
**WCAG:** 4.1.2 (Name, Role, Value) · 2.1.1 (Keyboard)  
**Evinced Rule Types:** `Interactable role`, `Keyboard accessible`, `Accessible name`  
**Affects:** All 6 pages (present in shared Header component)  
**Instance count:** 10 per page (shared across all pages)

**Affected Elements (Source: `src/components/Header.jsx`):**

| Element | Selector | HTML Snippet | Line | Issues |
|---------|----------|--------------|------|--------|
| Wishlist toggle | `.wishlist-btn` | `<div class="icon-btn wishlist-btn" style="cursor: pointer;">` | 131 | Interactable role, Keyboard accessible |
| Search icon | `.icon-btn:nth-child(2)` | `<div class="icon-btn" style="cursor: pointer;">` | 140 | Interactable role, Keyboard accessible, Accessible name |
| Login icon | `.icon-btn:nth-child(4)` | `<div class="icon-btn" style="cursor: pointer;">` | 156 | Interactable role, Keyboard accessible, Accessible name |
| Flag/region toggle | `.flag-group` | `<div class="flag-group" style="cursor: pointer;">` | 161 | Interactable role, Keyboard accessible |

**Root Cause:**  
All four header action controls are implemented as `<div>` elements with `onClick` handlers and `cursor: pointer` styling. `<div>` elements have no implicit ARIA role (`generic`), are not natively focusable, and do not appear in the browser's accessibility tree as interactive. The Search and Login divs also mark their visible text with `aria-hidden="true"`, leaving the control with no accessible name whatsoever.

**Impact on Users:**  
- **Screen reader users** cannot discover these controls during navigation — they are completely invisible to AT.  
- **Keyboard-only users** cannot reach or activate these controls (no `tabindex`, no native focus semantics).  
- The Search (`aria-hidden="true"` on the label span) and Login controls have **no accessible name** — even if a screen reader user found them, there would be nothing to announce.

**Recommended Fix (Not Applied):**  
Replace each `<div>` with a semantic `<button>` element, add `aria-label` for icon-only controls:
```jsx
// Before (Header.jsx line 131)
<div className="icon-btn wishlist-btn" onClick={openWishlist} style={{cursor:'pointer'}}>
  <svg aria-hidden="true">...</svg>
  <span>Wishlist</span>
</div>

// After
<button className="icon-btn wishlist-btn" onClick={openWishlist} aria-label="Wishlist">
  <svg aria-hidden="true">...</svg>
  <span aria-hidden="true">Wishlist</span>
</button>

// Before (Header.jsx line 140) — Search
<div className="icon-btn" style={{cursor:'pointer'}}>
  <svg aria-hidden="true">...</svg>
  <span aria-hidden="true">Search</span>
</div>

// After
<button className="icon-btn" aria-label="Search">
  <svg aria-hidden="true">...</svg>
</button>

// Before (Header.jsx line 161) — Flag/region selector
<div className="flag-group" onClick={() => {}} style={{ cursor: 'pointer' }}>
  <img src="...united-states-of-america.png" alt="United States Flag" />
  <img src="...canada.png" alt="Canada Flag" />
</div>

// After
<button className="flag-group" aria-label="Select region" onClick={() => {}}>
  <img src="...united-states-of-america.png" alt="" aria-hidden="true" />
  <img src="...canada.png" alt="" aria-hidden="true" />
</button>
```

**Why this approach:** Native `<button>` elements carry implicit `role="button"` semantics, are focusable by default (no `tabindex` needed), respond to `Enter` and `Space` natively, and are announced correctly by all screen readers. Adding `aria-label` to icon-only buttons provides a meaningful name without resorting to ARIA role overrides on divs.

---

### CI-2 — Footer Navigation Divs Without Semantic Role

**Severity:** Critical  
**WCAG:** 4.1.2 (Name, Role, Value) · 2.1.1 (Keyboard)  
**Evinced Rule Types:** `Interactable role`, `Keyboard accessible`, `Accessible name`  
**Affects:** All 6 pages (shared Footer component)  
**Instance count:** 3–6 per page (the 2 footer-nav-item divs generate 2–3 issues each)

**Affected Elements (Source: `src/components/Footer.jsx`):**

| Element | Selector | HTML Snippet | Line | Issues |
|---------|----------|--------------|------|--------|
| "Sustainability" link | `li:nth-child(3) > .footer-nav-item` | `<div class="footer-nav-item" style="cursor: pointer;">Sustainability</div>` | 13 | Interactable role, Keyboard accessible |
| "FAQs" link | `.footer-list:nth-child(2) > li > .footer-nav-item` | `<div class="footer-nav-item" ...><span aria-hidden="true">FAQs</span></div>` | 18 | Interactable role, Keyboard accessible, Accessible name |

**Root Cause:**  
Both footer navigation items use `<div>` elements with `onClick` handlers. The "FAQs" control hides its label with `aria-hidden="true"` on the `<span>`, making it completely invisible to assistive technology. Neither control is keyboard-reachable.

**Impact on Users:**  
- Both controls are unreachable by keyboard.  
- "FAQs" has no accessible name; screen reader users would encounter a completely unnamed interactive control.
- Users relying on AT cannot access these navigation options.

**Recommended Fix (Not Applied):**  
```jsx
// Before (Footer.jsx line 13)
<li><div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}>Sustainability</div></li>

// After
<li><a href="#sustainability" className="footer-nav-item">Sustainability</a></li>

// Before (Footer.jsx line 18)
<li><div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}><span aria-hidden="true">FAQs</span></div></li>

// After
<li><a href="#faqs" className="footer-nav-item">FAQs</a></li>
```

**Why this approach:** Semantic `<a>` elements are the correct element for navigation links — they carry `role="link"` implicitly, are keyboard-focusable, and convey destination context to screen reader users. Removing `aria-hidden` from the label text ensures the link has a meaningful accessible name.

---

### CI-3 — Popular Section "Shop" Links as Non-Semantic Divs

**Severity:** Critical  
**WCAG:** 4.1.2 (Name, Role, Value) · 2.1.1 (Keyboard)  
**Evinced Rule Types:** `Interactable role`, `Keyboard accessible`, `Accessible name`  
**Affects:** Homepage (`/`) only  
**Instance count:** 9 (3 elements × 3 issue types)

**Affected Elements (Source: `src/components/PopularSection.jsx`):**

| Element | Selector | HTML Snippet | Line |
|---------|----------|--------------|------|
| "Shop Drinkware" | `.product-card:nth-child(1) > ... > .shop-link` | `<div class="shop-link" ...><span aria-hidden="true">Shop Drinkware</span></div>` | 54–59 |
| "Shop Fun and Games" | `.product-card:nth-child(2) > ... > .shop-link` | `<div class="shop-link" ...><span aria-hidden="true">Shop Fun and Games</span></div>` | 54–59 |
| "Shop Stationery" | `.product-card:nth-child(3) > ... > .shop-link` | `<div class="shop-link" ...><span aria-hidden="true">Shop Stationery</span></div>` | 54–59 |

**Root Cause:**  
Each "Shop X" call-to-action is a `<div>` with `onClick={() => navigate(href)}` and `cursor: pointer`, with the visible label hidden from AT via `aria-hidden="true"` on the inner `<span>`. These elements are not focusable, not discoverable by keyboard, and have no accessible name.

**Impact on Users:**  
- Keyboard and screen reader users cannot discover or activate any of the three "Shop" category links.
- Combined with `aria-hidden` on the text content, these controls appear as empty, unnamed interactive regions to screen readers.

**Recommended Fix (Not Applied):**  
```jsx
// Before (PopularSection.jsx lines 54-59)
<div
  className="shop-link"
  onClick={() => navigate(product.shopHref)}
  style={{ cursor: 'pointer' }}
>
  <span aria-hidden="true">{product.shopLabel}</span>
</div>

// After
<Link
  to={product.shopHref}
  className="shop-link"
  aria-label={`${product.shopLabel} – ${product.title}`}
>
  {product.shopLabel}
</Link>
```

**Why this approach:** A React Router `<Link>` renders an `<a>` element, which carries native link semantics, is keyboard-accessible, and can be announced with a descriptive `aria-label` that provides context about both the shop category and the product card it belongs to (disambiguating multiple "Shop X" links on the same page). Removing `aria-hidden` from the text ensures the name is computed correctly even when no `aria-label` is provided.

---

### CI-4 — Filter Option Divs Without Interactive Role or Keyboard Support

**Severity:** Critical  
**WCAG:** 4.1.2 (Name, Role, Value) · 2.1.1 (Keyboard)  
**Evinced Rule Types:** `Interactable role`, `Keyboard accessible`  
**Affects:** Products Page (`/shop/new`) only  
**Instance count:** 22 (11 filter-option divs × 2 issue types)

**Affected Elements (Source: `src/components/FilterSidebar.jsx`):**

| Filter Group | HTML Snippet | Lines |
|-------------|--------------|-------|
| Price filters (4 options) | `<div class="filter-option"><div class="custom-checkbox">...` | 74 |
| Size filters (5 options: XS–XL) | `<div class="filter-option"><div class="custom-checkbox">...` | 116 |
| Brand filters (3+ options) | `<div class="filter-option"><div class="custom-checkbox">...` | 156 |

**Root Cause:**  
All filter options are `<div>` elements with `onClick` handlers. Though they contain a visual custom checkbox (`<div class="custom-checkbox">`), there is no semantic `role`, no `tabindex`, and no ARIA state (`aria-checked`). Assistive technologies cannot determine what these elements do, and keyboard users cannot interact with them.

**Impact on Users:**  
- Keyboard users cannot filter products — the entire filtering mechanism is inaccessible.
- Screen reader users cannot discover, identify, or operate any filter option.
- The current checked/unchecked state is conveyed only through CSS class changes (invisible to AT).

**Recommended Fix (Not Applied):**  
Replace each filter option with a real `<label>` + `<input type="checkbox">` pattern (or use `role="checkbox"` with `aria-checked`):
```jsx
// Before (FilterSidebar.jsx line 74)
<div key={range.label} className="filter-option" onClick={() => onPriceChange(range)}>
  <div className={`custom-checkbox${checked ? ' custom-checkbox--checked' : ''}`}>
    {checked && <div className="custom-checkbox-checkmark" />}
  </div>
  <span className="filter-option-label">
    {range.label}
    <span className="filter-count">({count})</span>
  </span>
</div>

// After
<label key={range.label} className="filter-option">
  <input
    type="checkbox"
    className="filter-checkbox-input"
    checked={checked}
    onChange={() => onPriceChange(range)}
  />
  <span className="filter-option-label">
    {range.label}
    <span className="filter-count">({count})</span>
  </span>
</label>
```

**Why this approach:** Native `<input type="checkbox">` elements have implicit ARIA `role="checkbox"`, toggle their `aria-checked` state automatically, respond to `Space` keypress natively, and are associated with their label text through the `<label>` wrapper — achieving all requirements without additional ARIA attributes.

---

### CI-5 — Modal Close Buttons: No Accessible Name (Button-Name)

**Severity:** Critical  
**WCAG:** 4.1.2 (Name, Role, Value)  
**Evinced Rule Type:** `Button-name`  
**Affects:** All 6 pages (CartModal present on every page; WishlistModal also present)  
**Instance count:** 2 per page (1 cart modal close + 1 wishlist modal close = 2 per page)

**Affected Elements:**

| Element | Selector | HTML Snippet | Source File | Line |
|---------|----------|--------------|-------------|------|
| Cart modal close | `#cart-modal > div:nth-child(1) > button` | `<button class="JjN6AKz7a2PRH2gFKW3v"><svg aria-hidden="true">...</svg></button>` | `src/components/CartModal.jsx` | 56 |
| Wishlist modal close | `div[role="dialog"] > div:nth-child(1) > button` | `<button class="WEtKZofboSdJ1n7KLpwd"><svg aria-hidden="true">...</svg></button>` | `src/components/WishlistModal.jsx` | 61 |

**Root Cause:**  
Both close buttons are `<button>` elements (correct element choice) that contain only an SVG icon with `aria-hidden="true"`. Since the icon is hidden from AT and there is no `aria-label`, `title`, or visible text content, the accessible name computation produces an empty string. WCAG requires all buttons to have a non-empty accessible name.

**Impact on Users:**  
- Screen reader users encounter an anonymous button — the button will be announced only as "button" with no indication of its purpose.
- Users cannot confidently identify or activate the close action.

**Recommended Fix (Not Applied):**  
```jsx
// Before (CartModal.jsx line 56)
<button
  className={styles.closeBtn}
  onClick={closeCart}
>
  <svg aria-hidden="true">...</svg>
</button>

// After
<button
  className={styles.closeBtn}
  onClick={closeCart}
  aria-label="Close shopping cart"
>
  <svg aria-hidden="true">...</svg>
</button>

// Before (WishlistModal.jsx line 61)
<button
  ref={closeBtnRef}
  className={styles.closeBtn}
  onClick={closeWishlist}
>
  <svg aria-hidden="true">...</svg>
</button>

// After
<button
  ref={closeBtnRef}
  className={styles.closeBtn}
  onClick={closeWishlist}
  aria-label="Close wishlist"
>
  <svg aria-hidden="true">...</svg>
</button>
```

**Why this approach:** `aria-label` is the correct mechanism for providing a text alternative to icon-only buttons when the SVG already carries `aria-hidden="true"`. The label text should describe the action and its context (which modal it closes) to disambiguate when multiple close buttons are present in the AT reading order.

---

### CI-6 — Invalid ARIA Attribute Values

**Severity:** Critical  
**WCAG:** 4.1.2 (Name, Role, Value)  
**Evinced Rule Type:** `Aria-valid-attr-value`  
**Affects:** Homepage (`/`) and Product Detail (`/product/1`)  
**Instance count:** 3 (2 on homepage, 1 on product detail)

**Affected Elements:**

| Element | Selector | HTML Snippet | Source File | Line | Invalid Attribute | Problem |
|---------|----------|--------------|-------------|------|-------------------|---------|
| FeaturedPair card 1 heading | `.featured-card:nth-child(1) > ... > h1` | `<h1 aria-expanded="yes">Keep on Truckin'</h1>` | `src/components/FeaturedPair.jsx` | 46 | `aria-expanded="yes"` | Must be `"true"` or `"false"` |
| FeaturedPair card 2 heading | `.featured-card:nth-child(2) > ... > h1` | `<h1 aria-expanded="yes">Limited edition...</h1>` | `src/components/FeaturedPair.jsx` | 46 | `aria-expanded="yes"` | Must be `"true"` or `"false"` |
| Product details list | `ul[aria-relevant="changes"]` | `<ul aria-relevant="changes" aria-live="polite">` | `src/pages/ProductPage.jsx` | 146 | `aria-relevant="changes"` | Must be space-separated tokens from: `additions`, `removals`, `text`, `all` |

**Root Cause:**  
- `FeaturedPair.jsx` line 46: `aria-expanded` on a heading element uses `"yes"` instead of the Boolean string `"true"` or `"false"`. Additionally, `aria-expanded` is not a valid attribute for headings — it is only valid on elements with roles that support it (buttons, comboboxes, etc.).
- `ProductPage.jsx` line 146: `aria-relevant` is an ARIA live region attribute that accepts only space-separated tokens from `additions`, `removals`, `text`, and `all`. The value `"changes"` is not a valid token and will be ignored by assistive technologies, making live-region change notifications unreliable.

**Impact on Users:**  
- Invalid ARIA values cause assistive technologies to ignore the attribute entirely, breaking the intended interaction model.
- Screen readers may misinterpret or fail to communicate state information, producing confusing or incorrect announcements.

**Recommended Fix (Not Applied):**  
```jsx
// Before (FeaturedPair.jsx line 46)
<h1 aria-expanded="yes">{item.title}</h1>

// After — remove aria-expanded from heading; it is semantically inappropriate here
<h2>{item.title}</h2>

// Before (ProductPage.jsx line 146)
<ul
  className={styles.detailsList}
  aria-relevant="changes"
  aria-live="polite"
>

// After — use a valid aria-relevant value; or remove if not needed
<ul
  className={styles.detailsList}
  aria-relevant="additions text"
  aria-live="polite"
>
```

**Why this approach:** For the heading, removing `aria-expanded` entirely is correct because headings do not have an expanded/collapsed state — the attribute belongs on the interactive control that toggles the collapsible region (i.e., a `<button>`). For `aria-relevant`, `"additions text"` is the most common correct value for live regions that announce newly inserted content, aligning with the intent of a product details list.

---

### CI-7 — Slider Role Missing Required ARIA Attributes

**Severity:** Critical  
**WCAG:** 4.1.2 (Name, Role, Value) · 2.1.1 (Keyboard)  
**Evinced Rule Types:** `Aria-required-attr`, `Keyboard accessible`  
**Affects:** Homepage (`/`) only  
**Instance count:** 2 (aria-required-attr + keyboard-accessible)

**Affected Element (Source: `src/components/TheDrop.jsx` line 19):**

| Selector | HTML Snippet |
|----------|--------------|
| `.drop-popularity-bar` | `<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>` |

**Root Cause:**  
The element has `role="slider"` but is missing all three ARIA attributes that are required for that role:
- `aria-valuenow` — the current value of the slider
- `aria-valuemin` — the minimum allowed value  
- `aria-valuemax` — the maximum allowed value

Without these, assistive technologies cannot convey the current or possible range of the control, making it entirely non-functional for AT users. The element also lacks `tabindex="0"`, making it unreachable by keyboard.

**Impact on Users:**  
- Screen reader users encounter a broken slider widget — no value information is announced.
- Keyboard users cannot navigate to or interact with the slider.

**Recommended Fix (Not Applied):**  
If the element is a decorative visual indicator (not truly interactive):
```jsx
// Before (TheDrop.jsx line 19)
<div role="slider" aria-label="Popularity indicator" className="drop-popularity-bar"></div>

// After — if purely decorative, remove the role entirely
<div className="drop-popularity-bar" aria-hidden="true"></div>

// After — if genuinely interactive, add required attributes
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

**Why this approach:** If the bar is decorative (a visual progress meter with no user interaction), `aria-hidden="true"` removes it from the accessibility tree entirely, which is the cleanest solution. If it is meant to be interactive, all required ARIA attributes plus keyboard focus support must be added to satisfy the slider widget pattern.

---

### CI-8 — Images Missing Alternative Text

**Severity:** Critical  
**WCAG:** 1.1.1 (Non-text Content)  
**Evinced Rule Type:** `Image-alt`  
**Affects:** Homepage (`/`) only  
**Instance count:** 2

**Affected Elements:**

| Selector | HTML Snippet | Source File | Line |
|----------|--------------|-------------|------|
| `img[src$="New_Tees.png"]` | `<img src="/images/home/New_Tees.png">` | `src/components/HeroBanner.jsx` | 18 |
| `img[src$="2bags_charms1.png"]` | `<img src="/images/home/2bags_charms1.png" loading="lazy">` | `src/components/TheDrop.jsx` | 13 |

**Root Cause:**  
Both `<img>` elements are missing the `alt` attribute entirely. Per the HTML specification, an `<img>` with no `alt` attribute causes screen readers to fall back to announcing the filename (e.g., "New_Tees.png"), which is meaningless to users.

**Impact on Users:**  
- Screen reader users hear the raw filename announced as image content, providing no meaningful information.
- For the HeroBanner hero image, users miss the context of the primary promotional visual.
- For TheDrop, users miss the context of the product imagery that accompanies the editorial copy.

**Recommended Fix (Not Applied):**  
```jsx
// Before (HeroBanner.jsx line 18)
<img src={HERO_IMAGE} />

// After — descriptive alt for informative image
<img src={HERO_IMAGE} alt="New tees collection – colorful winter basics" />

// Before (TheDrop.jsx line 13)
<img src={DROP_IMAGE} loading="lazy" />

// After — descriptive alt for informative image
<img src={DROP_IMAGE} alt="Android, YouTube, and Super G plushie bag charms" loading="lazy" />
```

**Why this approach:** Informative images used as primary promotional visuals require descriptive `alt` text that conveys the meaning or purpose of the image in context. If an image were purely decorative (e.g., a background texture), `alt=""` would be appropriate — but these images provide context for promotional copy, so a meaningful description is required.

---

### CI-9 — Page-Specific Interactive Divs Without Role or Keyboard Support

**Severity:** Critical  
**WCAG:** 4.1.2 (Name, Role, Value) · 2.1.1 (Keyboard)  
**Evinced Rule Types:** `Interactable role`, `Keyboard accessible`  
**Affects:** Checkout (basket step), Checkout (shipping step), Order Confirmation  
**Instance count:** 2 per affected page

**Affected Elements:**

| Element | Selector | HTML Snippet | Source File | Line | Pages |
|---------|----------|--------------|-------------|------|-------|
| "Continue" button | `.checkout-continue-btn` | `<div class="checkout-continue-btn" style="cursor: pointer;">Continue</div>` | `src/pages/CheckoutPage.jsx` | 157 | Checkout basket |
| "← Back to Cart" | `.checkout-back-btn` | `<div class="checkout-back-btn" style="cursor: pointer;">← Back to Cart</div>` | `src/pages/CheckoutPage.jsx` | 298 | Checkout shipping |
| "← Back to Shop" | `.confirm-home-link` | `<div class="confirm-home-link" style="cursor: pointer;">← Back to Shop</div>` | `src/pages/OrderConfirmationPage.jsx` | 40 | Order confirmation |

**Root Cause:**  
Critical navigation actions in the checkout flow are implemented as `<div>` elements with `onClick` handlers. "Continue" advances to the shipping step, "Back to Cart" returns to the basket, and "Back to Shop" navigates home — yet none of these can be reached or activated via keyboard.

**Impact on Users:**  
- Keyboard users **cannot complete a purchase** — the "Continue" button in the basket step is unreachable, blocking the entire checkout flow.
- Users cannot navigate back through the checkout using the keyboard.
- Post-purchase, keyboard users cannot return to the shop.

**Recommended Fix (Not Applied):**  
```jsx
// Before (CheckoutPage.jsx line 156)
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

// Before (CheckoutPage.jsx line 297)
<div
  className="checkout-back-btn"
  onClick={() => setStep('basket')}
  style={{ cursor: 'pointer' }}
>
  ← Back to Cart
</div>

// After
<button
  className="checkout-back-btn"
  type="button"
  onClick={() => setStep('basket')}
>
  ← Back to Cart
</button>

// Before (OrderConfirmationPage.jsx line 40)
<div className="confirm-home-link" onClick={() => {}} style={{ cursor: 'pointer' }}>
  ← Back to Shop
</div>

// After
<Link to="/" className="confirm-home-link">
  ← Back to Shop
</Link>
```

**Why this approach:** Action buttons within a form context use `<button type="button">` (to avoid accidental form submission). The "Back to Shop" action is a navigation link to the homepage and should use `<Link>` (rendering as `<a>`), which conveys link semantics and provides the destination context to screen readers.

---

## Critical Issue Summary Table

| ID | Issue Type | WCAG | Affected Pages | Source File(s) | Unique Selectors |
|----|------------|------|----------------|----------------|-----------------|
| CI-1 | Header icon divs as interactive elements | 4.1.2, 2.1.1 | All 6 | `Header.jsx` L131, L140, L156, L161 | 4 |
| CI-2 | Footer nav divs without role | 4.1.2, 2.1.1 | All 6 | `Footer.jsx` L13, L18 | 2 |
| CI-3 | Popular section shop-link divs | 4.1.2, 2.1.1 | Homepage | `PopularSection.jsx` L54–59 | 3 |
| CI-4 | Filter option divs without role/keyboard | 4.1.2, 2.1.1 | Products | `FilterSidebar.jsx` L74, L116, L156 | 11 |
| CI-5 | Modal close buttons: no accessible name | 4.1.2 | All 6 | `CartModal.jsx` L56, `WishlistModal.jsx` L61 | 2 |
| CI-6 | Invalid ARIA attribute values | 4.1.2 | Homepage, Product Detail | `FeaturedPair.jsx` L46, `ProductPage.jsx` L146 | 3 |
| CI-7 | Slider missing required ARIA attrs | 4.1.2, 2.1.1 | Homepage | `TheDrop.jsx` L19 | 1 |
| CI-8 | Images missing alt text | 1.1.1 | Homepage | `HeroBanner.jsx` L18, `TheDrop.jsx` L13 | 2 |
| CI-9 | Checkout/confirmation interactive divs | 4.1.2, 2.1.1 | Checkout, Order Conf. | `CheckoutPage.jsx` L157, L298; `OrderConfirmationPage.jsx` L40 | 3 |

---

## Remaining Non-Critical Issues (Serious — Not Remediated)

These issues violate WCAG 2.0 Level AA requirements. They are serious barriers but classified one level below critical in the Evinced severity model.

---

### SI-1 — Missing `lang` Attribute on `<html>` Element

**Severity:** Serious  
**WCAG:** 3.1.1 (Language of Page) — Level A  
**Evinced Rule Type:** `Html-has-lang`  
**Affects:** All 6 pages  
**Selector:** `html`  
**HTML Snippet:** `<html>` (no `lang` attribute present)  
**Source File:** `public/index.html`

**Description:**  
The root `<html>` element has no `lang` attribute. Screen readers use this attribute to determine the correct pronunciation engine for the page content. Without it, screen readers may apply the wrong language/dialect rules, making content difficult to understand for users whose screen reader is configured for a language other than English.

**Recommended Fix (Not Applied):**  
```html
<!-- public/index.html -->
<html lang="en">
```

**Note:** This is technically a Level A issue (WCAG 3.1.1) despite being classified as "Serious" by Evinced's scoring model, making it a high-priority fix alongside the Critical group.

---

### SI-2 — Insufficient Color Contrast

**Severity:** Serious  
**WCAG:** 1.4.3 (Contrast — Minimum) — Level AA  
**Evinced Rule Type:** `Color-contrast`  
**Total instances:** 21 across 5 pages

**Instance Detail:**

| # | Page | Selector | Element Description | Location |
|---|------|----------|---------------------|----------|
| 1 | Homepage | `.hero-content > p` | Hero subtitle ("Warm hues for cooler days") | `src/components/HeroBanner.css` — `.hero-content p` |
| 2–12 | Products Page | `.filter-group:nth-child(2–4) > .filter-options > .filter-option:nth-child(1–5) > .filter-option-label > .filter-count` | Filter option count badges (all 11+ instances) | `src/components/FilterSidebar.css` — `.filter-count` |
| 13 | Products Page | `.products-found` | "X Products Found" text | `src/pages/NewPage.css` — `.products-found` |
| 14 | Product Detail | `p:nth-child(4)` | Product description text | `src/pages/ProductPage.module.css` — `.productDescription` |
| 15–16 | Checkout Basket | `.checkout-step:nth-child(3) > .step-label` | "Shipping & Payment" step label (inactive state) | `src/pages/CheckoutPage.css` |
| 17 | Checkout Basket | `.summary-tax-note` | "Taxes calculated at next step" note | `src/pages/CheckoutPage.css` |
| 18 | Order Confirmation | `.confirm-order-id-label` | "Order ID" label text | `src/pages/OrderConfirmationPage.css` |

**Description:**  
Text elements across multiple pages use foreground/background color combinations that fall below the WCAG 1.4.3 minimum contrast ratio of 4.5:1 for normal-sized text. Affected users include those with low vision, color vision deficiencies, or those viewing screens in bright environments.

**Key Color Pairs (from source files):**
- `.hero-content p`: foreground `#c8c0b8` on background `#e8e0d8` — approximately 1.3:1
- `.filter-count`: foreground `#c8c8c8` on background `#ffffff` — approximately 1.4:1
- `.products-found`: foreground `#b0b4b8` on background `#ffffff` — approximately 1.9:1
- `.productDescription`: foreground `#c0c0c0` on background `#ffffff` — approximately 1.6:1

**Recommended Fix (Not Applied):**  
Darken the foreground color of each affected element to achieve at least 4.5:1 contrast against its background. Example:
- `.filter-count`: Change `color: #c8c8c8` to `color: #767676` (4.5:1 on white)
- `.products-found`: Change `color: #b0b4b8` to `color: #767676`
- `.hero-content p`: Change `color: #c8c0b8` to a color with sufficient contrast against `#e8e0d8`

---

### SI-3 — Invalid `lang` Attribute Value

**Severity:** Serious  
**WCAG:** 3.1.2 (Language of Parts) — Level AA  
**Evinced Rule Type:** `Valid-lang`  
**Affects:** Homepage (`/`) only  
**Selector:** `p[lang="zz"]`  
**HTML Snippet:** `<p lang="zz">Our brand-new, limited-edition...</p>`  
**Source File:** `src/components/TheDrop.jsx` line 21

**Description:**  
The `lang="zz"` attribute on the paragraph element uses a non-existent BCP 47 language tag. Screen readers rely on `lang` attributes to switch pronunciation engines when content is in a language other than the page default. The value `"zz"` is not a valid IANA language subtag, so screen readers cannot determine the intended language and may mispronounce or handle the content incorrectly.

**Recommended Fix (Not Applied):**  
```jsx
// Before (TheDrop.jsx line 21)
<p lang="zz">
  Our brand-new, limited-edition plushie bag charms...
</p>

// After — remove the attribute (content is English, matching the page language)
<p>
  Our brand-new, limited-edition plushie bag charms...
</p>
```

---

## Full Issue Index by Page

### Homepage (`/`) — 35 Issues

| # | Severity | Rule Type | Selector | WCAG |
|---|----------|-----------|----------|------|
| 1 | Critical | Interactable role | `.wishlist-btn` | 4.1.2 |
| 2 | Critical | Keyboard accessible | `.wishlist-btn` | 2.1.1 |
| 3 | Critical | Interactable role | `.icon-btn:nth-child(2)` | 4.1.2 |
| 4 | Critical | Accessible name | `.icon-btn:nth-child(2)` | 4.1.2 |
| 5 | Critical | Keyboard accessible | `.icon-btn:nth-child(2)` | 2.1.1 |
| 6 | Critical | Interactable role | `.icon-btn:nth-child(4)` | 4.1.2 |
| 7 | Critical | Accessible name | `.icon-btn:nth-child(4)` | 4.1.2 |
| 8 | Critical | Keyboard accessible | `.icon-btn:nth-child(4)` | 2.1.1 |
| 9 | Critical | Interactable role | `.flag-group` | 4.1.2 |
| 10 | Critical | Keyboard accessible | `.flag-group` | 2.1.1 |
| 11 | Critical | Interactable role | `.product-card:nth-child(1) > .product-card-info > .shop-link` | 4.1.2 |
| 12 | Critical | Accessible name | `.product-card:nth-child(1) > .product-card-info > .shop-link` | 4.1.2 |
| 13 | Critical | Keyboard accessible | `.product-card:nth-child(1) > .product-card-info > .shop-link` | 2.1.1 |
| 14 | Critical | Interactable role | `.product-card:nth-child(2) > .product-card-info > .shop-link` | 4.1.2 |
| 15 | Critical | Accessible name | `.product-card:nth-child(2) > .product-card-info > .shop-link` | 4.1.2 |
| 16 | Critical | Keyboard accessible | `.product-card:nth-child(2) > .product-card-info > .shop-link` | 2.1.1 |
| 17 | Critical | Interactable role | `.product-card:nth-child(3) > .product-card-info > .shop-link` | 4.1.2 |
| 18 | Critical | Accessible name | `.product-card:nth-child(3) > .product-card-info > .shop-link` | 4.1.2 |
| 19 | Critical | Keyboard accessible | `.product-card:nth-child(3) > .product-card-info > .shop-link` | 2.1.1 |
| 20 | Critical | Interactable role | `li:nth-child(3) > .footer-nav-item` | 4.1.2 |
| 21 | Critical | Keyboard accessible | `li:nth-child(3) > .footer-nav-item` | 2.1.1 |
| 22 | Critical | Interactable role | `.footer-list:nth-child(2) > li > .footer-nav-item` | 4.1.2 |
| 23 | Critical | Accessible name | `.footer-list:nth-child(2) > li > .footer-nav-item` | 4.1.2 |
| 24 | Critical | Keyboard accessible | `.footer-list:nth-child(2) > li > .footer-nav-item` | 2.1.1 |
| 25 | Critical | Keyboard accessible | `.drop-popularity-bar` | 2.1.1 |
| 26 | Critical | Aria-required-attr | `.drop-popularity-bar` | 4.1.2 |
| 27 | Critical | Aria-valid-attr-value | `.featured-card:nth-child(1) > .featured-card-info > h1` | 4.1.2 |
| 28 | Critical | Aria-valid-attr-value | `.featured-card:nth-child(2) > .featured-card-info > h1` | 4.1.2 |
| 29 | Critical | Button-name | `#cart-modal > div:nth-child(1) > button` | 4.1.2 |
| 30 | Critical | Button-name | `div[role="dialog"] > div:nth-child(1) > button` | 4.1.2 |
| 31 | Critical | Image-alt | `img[src$="New_Tees.png"]` | 1.1.1 |
| 32 | Critical | Image-alt | `img[src$="2bags_charms1.png"]` | 1.1.1 |
| 33 | Serious | Color-contrast | `.hero-content > p` | 1.4.3 |
| 34 | Serious | Html-has-lang | `html` | 3.1.1 |
| 35 | Serious | Valid-lang | `p[lang="zz"]` | 3.1.2 |

---

### Products Page (`/shop/new`) — 55 Issues

| # | Severity | Rule Type | Selector | WCAG |
|---|----------|-----------|----------|------|
| 1 | Critical | Interactable role | `.wishlist-btn` | 4.1.2 |
| 2 | Critical | Keyboard accessible | `.wishlist-btn` | 2.1.1 |
| 3 | Critical | Interactable role | `.icon-btn:nth-child(2)` | 4.1.2 |
| 4 | Critical | Accessible name | `.icon-btn:nth-child(2)` | 4.1.2 |
| 5 | Critical | Keyboard accessible | `.icon-btn:nth-child(2)` | 2.1.1 |
| 6 | Critical | Interactable role | `.icon-btn:nth-child(4)` | 4.1.2 |
| 7 | Critical | Accessible name | `.icon-btn:nth-child(4)` | 4.1.2 |
| 8 | Critical | Keyboard accessible | `.icon-btn:nth-child(4)` | 2.1.1 |
| 9 | Critical | Interactable role | `.flag-group` | 4.1.2 |
| 10 | Critical | Keyboard accessible | `.flag-group` | 2.1.1 |
| 11 | Critical | Interactable role | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(1)` | 4.1.2 |
| 12 | Critical | Keyboard accessible | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(1)` | 2.1.1 |
| 13 | Critical | Interactable role | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(2)` | 4.1.2 |
| 14 | Critical | Keyboard accessible | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(2)` | 2.1.1 |
| 15 | Critical | Interactable role | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(3)` | 4.1.2 |
| 16 | Critical | Keyboard accessible | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(3)` | 2.1.1 |
| 17 | Critical | Interactable role | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(4)` | 4.1.2 |
| 18 | Critical | Keyboard accessible | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(4)` | 2.1.1 |
| 19 | Critical | Interactable role | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(1)` | 4.1.2 |
| 20 | Critical | Keyboard accessible | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(1)` | 2.1.1 |
| 21 | Critical | Interactable role | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(2)` | 4.1.2 |
| 22 | Critical | Keyboard accessible | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(2)` | 2.1.1 |
| 23 | Critical | Interactable role | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(3)` | 4.1.2 |
| 24 | Critical | Keyboard accessible | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(3)` | 2.1.1 |
| 25 | Critical | Interactable role | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(4)` | 4.1.2 |
| 26 | Critical | Keyboard accessible | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(4)` | 2.1.1 |
| 27 | Critical | Interactable role | `.filter-option:nth-child(5)` | 4.1.2 |
| 28 | Critical | Keyboard accessible | `.filter-option:nth-child(5)` | 2.1.1 |
| 29 | Critical | Interactable role | `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(1)` | 4.1.2 |
| 30 | Critical | Keyboard accessible | `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(1)` | 2.1.1 |
| 31 | Critical | Interactable role | `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(2)` | 4.1.2 |
| 32 | Critical | Keyboard accessible | `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(2)` | 2.1.1 |
| 33 | Critical | Interactable role | `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(3)` | 4.1.2 |
| 34 | Critical | Keyboard accessible | `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(3)` | 2.1.1 |
| 35 | Critical | Interactable role | `li:nth-child(3) > .footer-nav-item` | 4.1.2 |
| 36 | Critical | Keyboard accessible | `li:nth-child(3) > .footer-nav-item` | 2.1.1 |
| 37 | Critical | Interactable role | `.footer-list:nth-child(2) > li > .footer-nav-item` | 4.1.2 |
| 38 | Critical | Accessible name | `.footer-list:nth-child(2) > li > .footer-nav-item` | 4.1.2 |
| 39 | Critical | Keyboard accessible | `.footer-list:nth-child(2) > li > .footer-nav-item` | 2.1.1 |
| 40 | Critical | Button-name | `#cart-modal > div:nth-child(1) > button` | 4.1.2 |
| 41 | Critical | Button-name | `div[role="dialog"] > div:nth-child(1) > button` | 4.1.2 |
| 42 | Serious | Color-contrast | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(1) > .filter-option-label > .filter-count` | 1.4.3 |
| 43 | Serious | Color-contrast | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(2) > .filter-option-label > .filter-count` | 1.4.3 |
| 44 | Serious | Color-contrast | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(3) > .filter-option-label > .filter-count` | 1.4.3 |
| 45 | Serious | Color-contrast | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(4) > .filter-option-label > .filter-count` | 1.4.3 |
| 46 | Serious | Color-contrast | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(1) > .filter-option-label > .filter-count` | 1.4.3 |
| 47 | Serious | Color-contrast | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(2) > .filter-option-label > .filter-count` | 1.4.3 |
| 48 | Serious | Color-contrast | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(3) > .filter-option-label > .filter-count` | 1.4.3 |
| 49 | Serious | Color-contrast | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(4) > .filter-option-label > .filter-count` | 1.4.3 |
| 50 | Serious | Color-contrast | `.filter-option:nth-child(5) > .filter-option-label > .filter-count` | 1.4.3 |
| 51 | Serious | Color-contrast | `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(1) > .filter-option-label > .filter-count` | 1.4.3 |
| 52 | Serious | Color-contrast | `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(2) > .filter-option-label > .filter-count` | 1.4.3 |
| 53 | Serious | Color-contrast | `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(3) > .filter-option-label > .filter-count` | 1.4.3 |
| 54 | Serious | Color-contrast | `.products-found` | 1.4.3 |
| 55 | Serious | Html-has-lang | `html` | 3.1.1 |

---

### Product Detail (`/product/1`) — 20 Issues

| # | Severity | Rule Type | Selector | WCAG |
|---|----------|-----------|----------|------|
| 1 | Critical | Interactable role | `.wishlist-btn` | 4.1.2 |
| 2 | Critical | Keyboard accessible | `.wishlist-btn` | 2.1.1 |
| 3 | Critical | Interactable role | `.icon-btn:nth-child(2)` | 4.1.2 |
| 4 | Critical | Accessible name | `.icon-btn:nth-child(2)` | 4.1.2 |
| 5 | Critical | Keyboard accessible | `.icon-btn:nth-child(2)` | 2.1.1 |
| 6 | Critical | Interactable role | `.icon-btn:nth-child(4)` | 4.1.2 |
| 7 | Critical | Accessible name | `.icon-btn:nth-child(4)` | 4.1.2 |
| 8 | Critical | Keyboard accessible | `.icon-btn:nth-child(4)` | 2.1.1 |
| 9 | Critical | Interactable role | `.flag-group` | 4.1.2 |
| 10 | Critical | Keyboard accessible | `.flag-group` | 2.1.1 |
| 11 | Critical | Interactable role | `li:nth-child(3) > .footer-nav-item` | 4.1.2 |
| 12 | Critical | Keyboard accessible | `li:nth-child(3) > .footer-nav-item` | 2.1.1 |
| 13 | Critical | Interactable role | `.footer-list:nth-child(2) > li > .footer-nav-item` | 4.1.2 |
| 14 | Critical | Accessible name | `.footer-list:nth-child(2) > li > .footer-nav-item` | 4.1.2 |
| 15 | Critical | Keyboard accessible | `.footer-list:nth-child(2) > li > .footer-nav-item` | 2.1.1 |
| 16 | Critical | Aria-valid-attr-value | `ul[aria-relevant="changes"]` | 4.1.2 |
| 17 | Critical | Button-name | `#cart-modal > div:nth-child(1) > button` | 4.1.2 |
| 18 | Critical | Button-name | `div[role="dialog"] > div:nth-child(1) > button` | 4.1.2 |
| 19 | Serious | Color-contrast | `p:nth-child(4)` | 1.4.3 |
| 20 | Serious | Html-has-lang | `html` | 3.1.1 |

---

### Checkout – Basket Step (`/checkout`) — 21 Issues

| # | Severity | Rule Type | Selector | WCAG |
|---|----------|-----------|----------|------|
| 1 | Critical | Interactable role | `.wishlist-btn` | 4.1.2 |
| 2 | Critical | Keyboard accessible | `.wishlist-btn` | 2.1.1 |
| 3 | Critical | Interactable role | `.icon-btn:nth-child(2)` | 4.1.2 |
| 4 | Critical | Accessible name | `.icon-btn:nth-child(2)` | 4.1.2 |
| 5 | Critical | Keyboard accessible | `.icon-btn:nth-child(2)` | 2.1.1 |
| 6 | Critical | Interactable role | `.icon-btn:nth-child(4)` | 4.1.2 |
| 7 | Critical | Accessible name | `.icon-btn:nth-child(4)` | 4.1.2 |
| 8 | Critical | Keyboard accessible | `.icon-btn:nth-child(4)` | 2.1.1 |
| 9 | Critical | Interactable role | `.flag-group` | 4.1.2 |
| 10 | Critical | Keyboard accessible | `.flag-group` | 2.1.1 |
| 11 | Critical | Interactable role | `.checkout-continue-btn` | 4.1.2 |
| 12 | Critical | Keyboard accessible | `.checkout-continue-btn` | 2.1.1 |
| 13 | Critical | Interactable role | `li:nth-child(3) > .footer-nav-item` | 4.1.2 |
| 14 | Critical | Keyboard accessible | `li:nth-child(3) > .footer-nav-item` | 2.1.1 |
| 15 | Critical | Interactable role | `.footer-list:nth-child(2) > li > .footer-nav-item` | 4.1.2 |
| 16 | Critical | Accessible name | `.footer-list:nth-child(2) > li > .footer-nav-item` | 4.1.2 |
| 17 | Critical | Keyboard accessible | `.footer-list:nth-child(2) > li > .footer-nav-item` | 2.1.1 |
| 18 | Critical | Button-name | `div:nth-child(1) > button` | 4.1.2 |
| 19 | Serious | Color-contrast | `.checkout-step:nth-child(3) > .step-label` | 1.4.3 |
| 20 | Serious | Color-contrast | `.summary-tax-note` | 1.4.3 |
| 21 | Serious | Html-has-lang | `html` | 3.1.1 |

---

### Checkout – Shipping Step (`/checkout`) — 19 Issues

| # | Severity | Rule Type | Selector | WCAG |
|---|----------|-----------|----------|------|
| 1 | Critical | Interactable role | `.wishlist-btn` | 4.1.2 |
| 2 | Critical | Keyboard accessible | `.wishlist-btn` | 2.1.1 |
| 3 | Critical | Interactable role | `.icon-btn:nth-child(2)` | 4.1.2 |
| 4 | Critical | Accessible name | `.icon-btn:nth-child(2)` | 4.1.2 |
| 5 | Critical | Keyboard accessible | `.icon-btn:nth-child(2)` | 2.1.1 |
| 6 | Critical | Interactable role | `.icon-btn:nth-child(4)` | 4.1.2 |
| 7 | Critical | Accessible name | `.icon-btn:nth-child(4)` | 4.1.2 |
| 8 | Critical | Keyboard accessible | `.icon-btn:nth-child(4)` | 2.1.1 |
| 9 | Critical | Interactable role | `.flag-group` | 4.1.2 |
| 10 | Critical | Keyboard accessible | `.flag-group` | 2.1.1 |
| 11 | Critical | Interactable role | `.checkout-back-btn` | 4.1.2 |
| 12 | Critical | Keyboard accessible | `.checkout-back-btn` | 2.1.1 |
| 13 | Critical | Interactable role | `li:nth-child(3) > .footer-nav-item` | 4.1.2 |
| 14 | Critical | Keyboard accessible | `li:nth-child(3) > .footer-nav-item` | 2.1.1 |
| 15 | Critical | Interactable role | `.footer-list:nth-child(2) > li > .footer-nav-item` | 4.1.2 |
| 16 | Critical | Accessible name | `.footer-list:nth-child(2) > li > .footer-nav-item` | 4.1.2 |
| 17 | Critical | Keyboard accessible | `.footer-list:nth-child(2) > li > .footer-nav-item` | 2.1.1 |
| 18 | Critical | Button-name | `div:nth-child(1) > button` | 4.1.2 |
| 19 | Serious | Html-has-lang | `html` | 3.1.1 |

---

### Order Confirmation (`/order-confirmation`) — 20 Issues

| # | Severity | Rule Type | Selector | WCAG |
|---|----------|-----------|----------|------|
| 1 | Critical | Interactable role | `.wishlist-btn` | 4.1.2 |
| 2 | Critical | Keyboard accessible | `.wishlist-btn` | 2.1.1 |
| 3 | Critical | Interactable role | `.icon-btn:nth-child(2)` | 4.1.2 |
| 4 | Critical | Accessible name | `.icon-btn:nth-child(2)` | 4.1.2 |
| 5 | Critical | Keyboard accessible | `.icon-btn:nth-child(2)` | 2.1.1 |
| 6 | Critical | Interactable role | `.icon-btn:nth-child(4)` | 4.1.2 |
| 7 | Critical | Accessible name | `.icon-btn:nth-child(4)` | 4.1.2 |
| 8 | Critical | Keyboard accessible | `.icon-btn:nth-child(4)` | 2.1.1 |
| 9 | Critical | Interactable role | `.flag-group` | 4.1.2 |
| 10 | Critical | Keyboard accessible | `.flag-group` | 2.1.1 |
| 11 | Critical | Interactable role | `.confirm-home-link` | 4.1.2 |
| 12 | Critical | Keyboard accessible | `.confirm-home-link` | 2.1.1 |
| 13 | Critical | Interactable role | `li:nth-child(3) > .footer-nav-item` | 4.1.2 |
| 14 | Critical | Keyboard accessible | `li:nth-child(3) > .footer-nav-item` | 2.1.1 |
| 15 | Critical | Interactable role | `.footer-list:nth-child(2) > li > .footer-nav-item` | 4.1.2 |
| 16 | Critical | Accessible name | `.footer-list:nth-child(2) > li > .footer-nav-item` | 4.1.2 |
| 17 | Critical | Keyboard accessible | `.footer-list:nth-child(2) > li > .footer-nav-item` | 2.1.1 |
| 18 | Critical | Button-name | `div:nth-child(1) > button` | 4.1.2 |
| 19 | Serious | Color-contrast | `.confirm-order-id-label` | 1.4.3 |
| 20 | Serious | Html-has-lang | `html` | 3.1.1 |

---

## Appendix: Raw Audit Data

CSV result files from the Evinced SDK are stored at:
- `tests/e2e/test-results/a11y-audit/homepage.csv`
- `tests/e2e/test-results/a11y-audit/products.csv`
- `tests/e2e/test-results/a11y-audit/product-detail.csv`
- `tests/e2e/test-results/a11y-audit/checkout-basket.csv`
- `tests/e2e/test-results/a11y-audit/checkout-shipping.csv`
- `tests/e2e/test-results/a11y-audit/order-confirmation.csv`

Test specification: `tests/e2e/specs/a11y-full-audit.spec.ts`  
Playwright configuration: `tests/e2e/playwright.config.ts`

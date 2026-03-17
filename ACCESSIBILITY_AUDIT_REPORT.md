# Accessibility Audit Report

**Repository:** demo-website  
**Audit Tool:** Evinced JS Playwright SDK v2.43.0  
**Audit Date:** 2026-03-17  
**Branch:** `cursor/repository-accessibility-audit-490f`  
**Audited By:** Automated Cloud Agent (Evinced MCP + Playwright)

---

## Executive Summary

A full-site accessibility audit was conducted on all six pages of the demo e-commerce website using the Evinced JS Playwright SDK. Each page was scanned independently with `evAnalyze()`. The Products Listing page additionally received targeted `evAnalyzeCombobox()` and `evAnalyzeSiteNavigation()` component scans, with all results merged and deduplicated.

| Page | Total Issues | Critical | Serious | Needs Review | Best Practice |
|------|-------------|---------|---------|-------------|--------------|
| Homepage (`/`) | 35 | 32 | 3 | 0 | 0 |
| Products Listing (`/shop/new`) | 59 | 43 | 14 | 1 | 1 |
| Product Detail (`/product/1`) | 20 | 18 | 2 | 0 | 0 |
| Checkout – Basket Step | 21 | 18 | 3 | 0 | 0 |
| Checkout – Shipping Step | 19 | 18 | 1 | 0 | 0 |
| Order Confirmation | 20 | 18 | 2 | 0 | 0 |
| **Total** | **174** | **147** | **25** | **1** | **1** |

**147 critical issues** were found and grouped into 12 distinct issue categories (CI-1 through CI-12). All critical issues are documented below with recommended remediations. **27 non-critical issues** were found and are listed separately at the end.

---

## Pages and Entry Points

| Page | Route | Entry Point File | Description |
|------|-------|-----------------|-------------|
| Homepage | `/` | `src/pages/HomePage.jsx` | Main landing page with hero banner, featured pairs, The Drop, and popular products |
| Products Listing | `/shop/new` | `src/pages/NewPage.jsx` | Product grid with filter sidebar and sort dropdown |
| Product Detail | `/product/:id` | `src/pages/ProductPage.jsx` | Single product view with details, size selector, and add-to-cart |
| Checkout – Basket | `/checkout` (step 1) | `src/pages/CheckoutPage.jsx` | Cart review and order summary |
| Checkout – Shipping | `/checkout` (step 2) | `src/pages/CheckoutPage.jsx` | Shipping address and payment form |
| Order Confirmation | `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` | Post-purchase confirmation with order ID |

Shared layout components appearing on all pages: `src/components/Header.jsx`, `src/components/Footer.jsx`, `src/components/CartModal.jsx`, `src/components/WishlistModal.jsx`.

---

## Critical Issues Found

### CI-1 — Header Icon Buttons Rendered as Non-Interactive `<div>` Elements

**Evinced Rule IDs:** `WRONG_SEMANTIC_ROLE` (Interactable role), `NOT_FOCUSABLE` (Keyboard accessible), `NO_DESCRIPTIVE_TEXT` (Accessible name)  
**WCAG Criteria:** 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A); 4.1.3 Status Messages (Level AA)  
**Affected Pages:** All 6 pages (appears in the shared `Header.jsx` component)  
**Issue Count:** 4 unique elements × 6 pages = 24 occurrences across `WRONG_SEMANTIC_ROLE` + `NOT_FOCUSABLE` + `NO_DESCRIPTIVE_TEXT`

**Affected Elements (`src/components/Header.jsx`):**

| Selector | Rendered HTML Snippet |
|----------|----------------------|
| `.wishlist-btn` | `<div class="icon-btn wishlist-btn" style="cursor: pointer;">…Wishlist…</div>` |
| `.icon-btn:nth-child(2)` | `<div class="icon-btn" style="cursor: pointer;"><svg aria-hidden="true">…</svg><span aria-hidden="true">Search</span></div>` |
| `.icon-btn:nth-child(4)` | `<div class="icon-btn" style="cursor: pointer;"><svg aria-hidden="true">…</svg><span aria-hidden="true">Login</span></div>` |
| `.flag-group` | `<div class="flag-group" style="cursor: pointer;"><img src="…united-states…"><img src="…canada…"></div>` |

**Root Cause:**  
The Wishlist, Search, Login, and country-selector controls are implemented as `<div>` elements with `onClick` handlers and `style="cursor: pointer;"`. `<div>` has no implicit ARIA role, so assistive technologies do not identify these as interactive controls. They are not reachable by keyboard Tab navigation (no `tabindex`). The Search and Login `<div>` elements also hide their visible label text with `aria-hidden="true"`, leaving them with no accessible name at all.

**Recommended Remediation:**  
Replace all four `<div>` icon-button wrappers in `Header.jsx` with `<button>` elements. This is the correct semantic element for controls that trigger an action within the current page. The `<button>` element is keyboard focusable by default, carries an implicit `role="button"`, and supports all standard keyboard events (`Enter`, `Space`). Add an explicit `aria-label` to each button since the visible text labels are either absent or wrapped in `aria-hidden`. Remove `style="cursor: pointer;"` (browsers apply the default pointer cursor to `<button>` automatically) and the `aria-hidden` from visible label text.

```jsx
// Wishlist
<button className="icon-btn wishlist-btn" onClick={openWishlist} aria-label="Wishlist">
  <svg aria-hidden="true">…</svg>
  {wishlistCount > 0 && <span className="wishlist-count" aria-hidden="true">{wishlistCount}</span>}
</button>

// Search
<button className="icon-btn" aria-label="Search">
  <svg aria-hidden="true">…</svg>
  <span aria-hidden="true">Search</span>
</button>

// Login
<button className="icon-btn" aria-label="Login">
  <svg aria-hidden="true">…</svg>
  <span aria-hidden="true">Login</span>
</button>

// Country / Region selector
<button className="flag-group" onClick={() => {}} aria-label="Select region">
  <img src="/images/icons/united-states-of-america.png" alt="United States Flag" width="24" height="24" />
  <img src="/images/icons/canada.png" alt="Canada Flag" width="24" height="24" />
</button>
```

**Why this approach:**  
`<button>` is the semantic native element for interactive controls. It requires zero additional ARIA — role, focus, keyboard interaction, and click-from-keyboard all come for free. Using `role="button"` + `tabindex="0"` on a `<div>` achieves the same basic result but still requires manual `onKeyDown` handlers for `Enter`/`Space`; `<button>` handles this natively and is more robust across all browsers and assistive technologies.

---

### CI-2 — Footer Navigation Links Rendered as Non-Interactive `<div>` Elements

**Evinced Rule IDs:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**WCAG Criteria:** 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A)  
**Affected Pages:** All 6 pages (shared `Footer.jsx` component)  
**Issue Count:** 2 unique elements × 6 pages = 12 occurrences

**Affected Elements (`src/components/Footer.jsx`):**

| Selector | Rendered HTML Snippet |
|----------|----------------------|
| `li:nth-child(3) > .footer-nav-item` | `<div class="footer-nav-item" style="cursor: pointer;">Sustainability</div>` |
| `.footer-list:nth-child(2) > li > .footer-nav-item` | `<div class="footer-nav-item" style="cursor: pointer;"><span aria-hidden="true">FAQs</span></div>` |

**Root Cause:**  
Both footer items are `<div>` elements with `onClick` handlers and no semantic role, tabindex, or accessible name. The "FAQs" item additionally hides its label text with `aria-hidden="true"`, making it completely anonymous to assistive technologies.

**Recommended Remediation:**  
Replace both `<div class="footer-nav-item">` elements with proper `<a>` elements (for navigation links) or `<button>` elements (if they trigger in-page actions). Remove `aria-hidden` from the visible text. If these navigate to other pages, use `<a href="…">`:

```jsx
<li><a href="#sustainability" className="footer-nav-item">Sustainability</a></li>
<li><a href="#faqs" className="footer-nav-item">FAQs</a></li>
```

**Why this approach:**  
In a navigation context (`<footer>` with a list of links), `<a>` is the correct element — it is inherently focusable, announces as "link" to screen readers, and supports right-click > "Open in new tab" and middle-click. If the items perform page-level actions rather than navigation, `<button>` should be used instead. Either way, the `aria-hidden` on visible text must be removed so the label is accessible.

---

### CI-3 — "Shop [Category]" Links in PopularSection Rendered as Non-Interactive `<div>` Elements

**Evinced Rule IDs:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**WCAG Criteria:** 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A)  
**Affected Pages:** Homepage (`/`) only  
**Issue Count:** 3 unique elements (3 product cards)

**Affected Elements (`src/components/PopularSection.jsx`):**

| Selector | Rendered HTML Snippet |
|----------|----------------------|
| `.product-card:nth-child(1) > .product-card-info > .shop-link` | `<div class="shop-link" style="cursor: pointer;"><span aria-hidden="true">Shop Drinkware</span></div>` |
| `.product-card:nth-child(2) > .product-card-info > .shop-link` | `<div class="shop-link" style="cursor: pointer;"><span aria-hidden="true">Shop Fun and Games</span></div>` |
| `.product-card:nth-child(3) > .product-card-info > .shop-link` | `<div class="shop-link" style="cursor: pointer;"><span aria-hidden="true">Shop Stationery</span></div>` |

**Root Cause:**  
Each product card's call-to-action is a `<div>` that calls `useNavigate()` on click. The label text (e.g. "Shop Drinkware") is entirely hidden from assistive technologies via `aria-hidden="true"`, leaving the element with no accessible name.

**Recommended Remediation:**  
Replace `<div>` + `useNavigate()` with a React Router `<Link>` element, which renders a proper `<a>` tag. Remove `aria-hidden` from the label span:

```jsx
import { Link } from 'react-router-dom';
// ...
<Link to={product.shopHref} className="shop-link">
  {product.shopLabel}
</Link>
```

**Why this approach:**  
Using `<Link>` (which renders as `<a>`) is semantically correct for cross-page navigation and provides keyboard access, correct ARIA role, and browser history support automatically. Removing `aria-hidden` from the text ensures screen readers can announce the label. No ARIA attributes are needed.

---

### CI-4 — Filter Option Checkboxes Rendered as Non-Interactive `<div>` Elements

**Evinced Rule IDs:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**WCAG Criteria:** 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A)  
**Affected Pages:** Products Listing (`/shop/new`) only  
**Issue Count:** 12 filter option `<div>` elements (4 price ranges + 5 sizes + 3 brands)

**Affected Elements (`src/components/FilterSidebar.jsx`):**

| Selector | Rendered HTML Snippet |
|----------|----------------------|
| `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(1)` | `<div class="filter-option"><div class="custom-checkbox"></div><span class="filter-option-label">1.00 - 19.99 <span class="filter-count">(8)</span></span></div>` |
| `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(1)` | `<div class="filter-option">…XS (14)…</div>` |
| *(and 10 more similarly structured filter options)* | |

**Root Cause:**  
Each filter option is a `<div>` with an `onClick` handler and a visually rendered custom checkbox. It has no `role`, no `tabindex`, and no `aria-checked` attribute. Keyboard and assistive-technology users cannot interact with filters at all.

**Recommended Remediation:**  
Replace each filter option `<div>` with a `<label>` wrapping a native `<input type="checkbox">`. Native checkboxes have correct semantics, keyboard accessibility, and `aria-checked` behavior built-in:

```jsx
<label className="filter-option">
  <input
    type="checkbox"
    className="filter-checkbox"
    checked={checked}
    onChange={() => onPriceChange(range)}
  />
  <span className="filter-option-label">
    {range.label}
    <span className="filter-count">({count})</span>
  </span>
</label>
```

The custom checkbox visual can be retained via CSS (`input[type=checkbox] { position: absolute; opacity: 0; }`) while the visible element mirrors the checked state.

**Why this approach:**  
Native `<input type="checkbox">` is the most robust solution — it provides keyboard interaction (`Space` to toggle), the correct `role="checkbox"`, automatic `aria-checked` state management, and label association when wrapped in `<label>`. Using `role="checkbox"` + `aria-checked` on a `<div>` is a valid alternative but requires manually managing `tabindex`, keyboard event handlers, and state updates, which increases complexity and the risk of bugs.

---

### CI-5 — Cart Modal Close Button Has No Accessible Name

**Evinced Rule ID:** `AXE-BUTTON-NAME` (Button-name — buttons must have discernible text)  
**WCAG Criteria:** 4.1.2 Name, Role, Value (Level A)  
**Affected Pages:** All 6 pages (the `CartModal.jsx` component is rendered on every page)  
**Issue Count:** Two button selectors per page (the modal renders two close button variants)

**Affected Elements (`src/components/CartModal.jsx`):**

| Selector | Rendered HTML Snippet |
|----------|----------------------|
| `#cart-modal > div:nth-child(1) > button` | `<button class="JjN6AKz7a2PRH2gFKW3v"><svg aria-hidden="true">✕ icon</svg></button>` |
| `div[role="dialog"] > div:nth-child(1) > button` | `<button class="WEtKZofboSdJ1n7KLpwd"><svg aria-hidden="true">✕ icon</svg></button>` |

**Root Cause:**  
The close button for the cart drawer contains only an SVG close icon with `aria-hidden="true"`. There is no `aria-label`, no `title`, and no visible text. Screen readers will announce it as "button" with no name, giving users no information about what it does.

**Recommended Remediation:**  
Add `aria-label="Close cart"` to the close `<button>`:

```jsx
<button
  className={styles.closeBtn}
  onClick={closeCart}
  aria-label="Close cart"
>
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" …>
    …
  </svg>
</button>
```

**Why this approach:**  
`aria-label` on the `<button>` element provides the accessible name directly to assistive technologies without altering the visual design. It is the simplest and most direct fix: one attribute, no structural change. The SVG correctly retains `aria-hidden="true"` since the button's label already describes its purpose.

---

### CI-6 — Checkout "Continue" Button Rendered as a Non-Interactive `<div>`

**Evinced Rule IDs:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**WCAG Criteria:** 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A)  
**Affected Pages:** Checkout – Basket Step (`/checkout`, step 1)  
**Issue Count:** 1 element

**Affected Element (`src/pages/CheckoutPage.jsx`):**

| Selector | Rendered HTML Snippet |
|----------|----------------------|
| `.checkout-continue-btn` | `<div class="checkout-continue-btn" style="cursor: pointer;">Continue</div>` |

**Root Cause:**  
The "Continue" action that advances the user from the basket review to the shipping form is a `<div>` with `onClick` only. Keyboard users pressing Tab cannot reach it, and screen readers do not announce it as an actionable control.

**Recommended Remediation:**  
Replace the `<div>` with a `<button>`:

```jsx
<button
  className="checkout-continue-btn"
  onClick={() => setStep('shipping')}
  type="button"
>
  Continue
</button>
```

**Why this approach:**  
`<button type="button">` is the semantically correct element for an action that does not submit a form. It receives keyboard focus by default and announces as "button" to screen readers. The existing `className` can remain unchanged, so no CSS modifications are needed.

---

### CI-7 — Checkout "Back to Cart" Button Rendered as a Non-Interactive `<div>`

**Evinced Rule IDs:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**WCAG Criteria:** 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A)  
**Affected Pages:** Checkout – Shipping Step (`/checkout`, step 2)  
**Issue Count:** 1 element

**Affected Element (`src/pages/CheckoutPage.jsx`):**

| Selector | Rendered HTML Snippet |
|----------|----------------------|
| `.checkout-back-btn` | `<div class="checkout-back-btn" style="cursor: pointer;">← Back to Cart</div>` |

**Root Cause:**  
The back navigation control on the shipping step is a `<div>` with `onClick`. Keyboard users cannot Tab to it, and its role is not communicated to assistive technologies.

**Recommended Remediation:**  
Replace with `<button>`:

```jsx
<button
  className="checkout-back-btn"
  onClick={() => setStep('basket')}
  type="button"
>
  ← Back to Cart
</button>
```

**Why this approach:**  
Same reasoning as CI-6. `<button type="button">` provides all necessary semantics and keyboard interaction natively.

---

### CI-8 — Order Confirmation "Back to Shop" Link Rendered as a Non-Interactive `<div>`

**Evinced Rule IDs:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**WCAG Criteria:** 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A)  
**Affected Pages:** Order Confirmation (`/order-confirmation`)  
**Issue Count:** 1 element

**Affected Element (`src/pages/OrderConfirmationPage.jsx`):**

| Selector | Rendered HTML Snippet |
|----------|----------------------|
| `.confirm-home-link` | `<div class="confirm-home-link" style="cursor: pointer;">← Back to Shop</div>` |

**Root Cause:**  
This `<div>` with `onClick={() => {}}` is intended to navigate back to the shop. It has no semantic role, no tabindex, and the `onClick` is currently a no-op (empty arrow function), so the control does not work at all for any user.

**Recommended Remediation:**  
Replace with a React Router `<Link>`:

```jsx
import { Link } from 'react-router-dom';
// ...
<Link to="/" className="confirm-home-link">
  ← Back to Shop
</Link>
```

**Why this approach:**  
Because this control navigates to a different route (`/`), the correct semantic element is `<a>` (via React Router's `<Link>`), not `<button>`. `<Link>` renders as `<a>`, which is natively focusable, announces as "link", participates in browser history, and supports right-click / middle-click. The empty `onClick` no-op is also eliminated.

---

### CI-9 — Content Images Missing `alt` Attribute

**Evinced Rule ID:** `AXE-IMAGE-ALT` (Images must have alternative text)  
**WCAG Criteria:** 1.1.1 Non-text Content (Level A)  
**Affected Pages:** Homepage (`/`) — both images are inside homepage-only components  
**Issue Count:** 2 images

**Affected Elements:**

| Selector | File | Rendered HTML Snippet |
|----------|------|-----------------------|
| `img[src$="New_Tees.png"]` | `src/components/HeroBanner.jsx` | `<img src="/images/home/New_Tees.png">` |
| `img[src$="2bags_charms1.png"]` | `src/components/TheDrop.jsx` | `<img src="/images/home/2bags_charms1.png" loading="lazy">` |

**Root Cause:**  
Both `<img>` elements are rendered without an `alt` attribute. When `alt` is absent, screen readers typically read out the image filename (e.g. "New underscore Tees dot P N G"), which is meaningless to users.

**Recommended Remediation:**  
Add descriptive `alt` text that conveys the content and context of each image:

```jsx
// HeroBanner.jsx
<img src={HERO_IMAGE} alt="New Tees collection – assorted winter apparel" />

// TheDrop.jsx
<img src={DROP_IMAGE} loading="lazy" alt="Limited edition Android, YouTube, and Super G plushie bag charms" />
```

**Why this approach:**  
The `alt` attribute is the primary mechanism for providing text alternatives for images under WCAG 1.1.1. Descriptive `alt` text should convey the same information and/or function as the image. These images are informational content images (not decorative), so an empty `alt=""` would be incorrect — they provide visual context that supports the adjacent marketing copy, and that context must be communicated to non-visual users.

---

### CI-10 — Invalid ARIA Attribute Values

**Evinced Rule ID:** `AXE-ARIA-VALID-ATTR-VALUE` (ARIA attributes must conform to valid values)  
**WCAG Criteria:** 4.1.2 Name, Role, Value (Level A)  
**Affected Pages:** Homepage (`/`) and Product Detail (`/product/1`)  
**Issue Count:** 3 invalid attribute values across 2 files

**Affected Elements:**

| Selector | File | Invalid Attribute | Invalid Value | Correct Value |
|----------|------|------------------|---------------|--------------|
| `.featured-card:nth-child(1) > .featured-card-info > h1` | `src/components/FeaturedPair.jsx` | `aria-expanded` | `"yes"` | `"true"` or `"false"` |
| `.featured-card:nth-child(2) > .featured-card-info > h1` | `src/components/FeaturedPair.jsx` | `aria-expanded` | `"yes"` | `"true"` or `"false"` |
| `ul[aria-relevant="changes"]` | `src/pages/ProductPage.jsx` | `aria-relevant` | `"changes"` | Space-separated tokens from: `additions`, `removals`, `text`, `all` |

**Root Cause (FeaturedPair.jsx):**  
`aria-expanded` is a state attribute that accepts only `"true"` or `"false"` as defined by the ARIA specification. The value `"yes"` is not a valid boolean string, so assistive technologies may ignore or misinterpret the attribute entirely. Additionally, `aria-expanded` is semantically inappropriate on a `<h1>` element (it belongs on elements that control collapsible regions, such as `<button>` or `<summary>`).

**Root Cause (ProductPage.jsx):**  
`aria-relevant` must be one or more space-separated tokens from: `additions`, `removals`, `text`, `all`. The value `"changes"` is not a valid token.

**Recommended Remediation:**

```jsx
// FeaturedPair.jsx — remove aria-expanded from the h1 (it is not semantically meaningful here)
<h1>{item.title}</h1>

// ProductPage.jsx — correct the aria-relevant value
// If the intent is to announce text changes in the live region:
<ul
  className={styles.detailsList}
  aria-relevant="text"
  aria-live="polite"
>
```

**Why this approach:**  
Removing `aria-expanded` from `<h1>` is the correct fix because `<h1>` is not a widget and does not control a disclosure. Adding the attribute with any value on a heading is an improper ARIA pattern. For `aria-relevant`, `"text"` is the appropriate value when the live region contains text content that changes; this is more precise than `"all"` (which also announces element additions/removals) and avoids announcing unnecessary DOM mutations.

---

### CI-11 — Popularity Indicator Slider Missing Required ARIA Attributes and Keyboard Access

**Evinced Rule IDs:** `AXE-ARIA-REQUIRED-ATTR` (Required ARIA attributes must be provided), `NOT_FOCUSABLE` (Keyboard accessible)  
**WCAG Criteria:** 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A)  
**Affected Pages:** Homepage (`/`)  
**Issue Count:** 1 element

**Affected Element (`src/components/TheDrop.jsx`):**

| Selector | Rendered HTML Snippet |
|----------|----------------------|
| `.drop-popularity-bar` | `<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>` |

**Root Cause:**  
The ARIA `role="slider"` requires three mandatory state attributes: `aria-valuenow` (current value), `aria-valuemin` (minimum value), and `aria-valuemax` (maximum value). Without these attributes, the slider is invalid and assistive technologies cannot convey its state to users. Additionally, a `role="slider"` element must be keyboard focusable (`tabindex="0"`) and support arrow-key navigation per the ARIA Authoring Practices Guide.

**Recommended Remediation:**  
If this element is a purely decorative visual indicator (a bar showing relative popularity), it should not use `role="slider"` at all. A decorative element should be hidden from the accessibility tree:

```jsx
// Option A (recommended): decorative bar — hide from assistive technologies
<div className="drop-popularity-bar" aria-hidden="true"></div>
```

If it must be interactive, add all required ARIA attributes and keyboard support:

```jsx
// Option B: functional slider
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  tabIndex={0}
  className="drop-popularity-bar"
  onKeyDown={handleSliderKeyDown}
></div>
```

**Why this approach:**  
Option A is recommended because the element appears to be a static visual display, not an interactive control. Applying `role="slider"` to a decorative element is a misuse of ARIA that creates false expectations for assistive technology users (the slider is announced but cannot be operated). Hiding it with `aria-hidden="true"` removes it from the accessibility tree without affecting its visual appearance. If the element is truly interactive, Option B provides the minimum required ARIA contract; the value state must also be managed dynamically to reflect actual slider position.

---

### CI-12 — Sort Button Has Incorrect Widget Role and Missing Contextual Labeling

**Evinced Rule IDs:** `ELEMENT_HAS_INCORRECT_ROLE` (Element has incorrect role), `CRITICAL_SEVERITY_MISSING_CONTEXTUAL_LABELING` (Missing contextual labeling)  
**WCAG Criteria:** 4.1.2 Name, Role, Value (Level A); 1.3.1 Info and Relationships (Level A)  
**Affected Pages:** Products Listing (`/shop/new`)  
**Issue Count:** 1 element (2 combined violations)

**Affected Element (`src/pages/NewPage.jsx`):**

| Selector | Rendered HTML Snippet |
|----------|----------------------|
| `.sort-btn` | `<button class="sort-btn">Sort by Relevance (Default)<svg aria-hidden="true">▼</svg></button>` |

**Root Cause:**  
The sort trigger `<button>` opens a dropdown list of sort options. Without `aria-haspopup`, `aria-expanded`, and `aria-controls`, assistive technologies do not know:  
1. That the button controls a popup list (`aria-haspopup`)  
2. Whether the list is currently open or closed (`aria-expanded`)  
3. Which element in the DOM is the controlled list (`aria-controls`)  

The Evinced `ELEMENT_HAS_INCORRECT_ROLE` violation indicates that the sort widget pattern (button + listbox) is incomplete in its ARIA contract. The `CRITICAL_SEVERITY_MISSING_CONTEXTUAL_LABELING` violation indicates the button provides no relationship context between itself and the options it controls.

**Recommended Remediation:**  
Add the missing ARIA attributes to the sort button and apply the matching role to the options list:

```jsx
// Sort trigger button
<button
  className="sort-btn"
  onClick={() => setSortOpen((o) => !o)}
  aria-haspopup="listbox"
  aria-expanded={sortOpen}
  aria-controls="sort-options-list"
  aria-label={`Sort by ${currentSortLabel}`}
>
  Sort by {currentSortLabel}
  <svg aria-hidden="true">…</svg>
</button>

// Options list
{sortOpen && (
  <ul className="sort-options" role="listbox" id="sort-options-list" aria-label="Sort options">
    {SORT_OPTIONS.map((opt) => (
      <li
        key={opt.value}
        role="option"
        aria-selected={sort === opt.value}
        className={`sort-option ${sort === opt.value ? 'active' : ''}`}
        onClick={() => { setSort(opt.value); setSortOpen(false); }}
        tabIndex={0}
        onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') { setSort(opt.value); setSortOpen(false); }}}
      >
        {opt.label}
      </li>
    ))}
  </ul>
)}
```

**Why this approach:**  
The ARIA listbox pattern is the standard accessibility model for a button that opens a list of selectable options (combobox without an input). `aria-haspopup="listbox"` informs the screen reader of the popup type; `aria-expanded` announces open/closed state; `aria-controls` associates the trigger with the controlled region; `role="listbox"` + `role="option"` + `aria-selected` give the options their correct semantics. Without these, screen readers have no structural understanding of the widget.

---

## Summary of Critical Issue Groups

| ID | Evinced Rule(s) | Affected File(s) | Pages | Element Count |
|----|----------------|-----------------|-------|--------------|
| CI-1 | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT` | `Header.jsx` | All 6 | 4 (×6 pages) |
| CI-2 | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT` | `Footer.jsx` | All 6 | 2 (×6 pages) |
| CI-3 | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT` | `PopularSection.jsx` | Homepage | 3 |
| CI-4 | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE` | `FilterSidebar.jsx` | Products | 12 |
| CI-5 | `AXE-BUTTON-NAME` | `CartModal.jsx` | All 6 | 1 (×6 pages) |
| CI-6 | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE` | `CheckoutPage.jsx` | Checkout Basket | 1 |
| CI-7 | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE` | `CheckoutPage.jsx` | Checkout Shipping | 1 |
| CI-8 | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE` | `OrderConfirmationPage.jsx` | Order Confirmation | 1 |
| CI-9 | `AXE-IMAGE-ALT` | `HeroBanner.jsx`, `TheDrop.jsx` | Homepage | 2 |
| CI-10 | `AXE-ARIA-VALID-ATTR-VALUE` | `FeaturedPair.jsx`, `ProductPage.jsx` | Homepage, Product Detail | 3 |
| CI-11 | `AXE-ARIA-REQUIRED-ATTR`, `NOT_FOCUSABLE` | `TheDrop.jsx` | Homepage | 1 |
| CI-12 | `ELEMENT_HAS_INCORRECT_ROLE`, `CRITICAL_SEVERITY_MISSING_CONTEXTUAL_LABELING` | `NewPage.jsx` | Products | 1 |

---

## Non-Critical Issues (Not Remediated)

### S-1 — `<html>` Element Missing `lang` Attribute

**Evinced Rule ID:** `AXE-HTML-HAS-LANG` (Html-has-lang)  
**Severity:** Serious  
**WCAG Criteria:** 3.1.1 Language of Page (Level A)  
**Affected Pages:** All 6 pages  
**Issue Count:** 6 (one per page)

**Element:** `<html style="scroll-behavior: unset;">` — rendered without a `lang` attribute on all pages.

**Description:** The `lang` attribute on the `<html>` element allows screen readers to use the correct pronunciation rules for the page's language. Without it, a user's screen reader may default to the user's configured language, which may not match the page content. This is a WCAG Level A requirement.

**Recommended Fix:** Add `lang="en"` to the root `<html>` element in `public/index.html`:
```html
<html lang="en">
```

---

### S-2 — Insufficient Color Contrast

**Evinced Rule ID:** `AXE-COLOR-CONTRAST` (Color-contrast)  
**Severity:** Serious  
**WCAG Criteria:** 1.4.3 Contrast (Minimum) (Level AA) — minimum 4.5:1 for normal text  
**Affected Pages:** Homepage, Products Listing, Product Detail, Checkout Basket, Order Confirmation  
**Issue Count:** 18 instances across multiple components

**Affected Elements:**

| Selector | Page | Description |
|----------|------|-------------|
| `.hero-content > p` | Homepage | Hero subtitle text (low contrast against hero background) |
| `.hero-banner` | Homepage | Hero banner section (contains contrast issue) |
| `.filter-count` (×9 instances) | Products Listing | Filter option count labels (e.g. "(8)") — light gray text on white background |
| `.products-found` | Products Listing | "X Products Found" text — light gray on white |
| `p:nth-child(4)` (product description) | Product Detail | Product description text — light gray on white |
| `.checkout-step:nth-child(3) > .step-label` | Checkout Basket | "Shipping & Payment" step label — low contrast |
| `.summary-tax-note` | Checkout Basket | "Taxes calculated at next step" note |
| `.confirm-order-id-label` | Order Confirmation | "Order ID" label text |
| `.confirm-order-id-box` | Order Confirmation | Order ID container |

**Description:** Multiple text elements have insufficient foreground-to-background color contrast ratios below the WCAG AA threshold of 4.5:1 for normal text. Affects low-vision users who rely on adequate contrast to read content.

**Recommended Fix:** Increase the foreground color of each failing element. For example:
- `.filter-count`: change from `#c8c8c8` to `#767676` or darker (minimum 4.5:1 on white)
- `.hero-content > p`: adjust subtitle color to have adequate contrast against the hero background
- Product description text: change from `#c0c0c0` to a darker shade

---

### S-3 — Invalid `lang` Attribute Value

**Evinced Rule ID:** `AXE-VALID-LANG` (Valid-lang)  
**Severity:** Serious  
**WCAG Criteria:** 3.1.2 Language of Parts (Level AA)  
**Affected Pages:** Homepage (`/`) only  
**Issue Count:** 1

**Affected Element (`src/components/TheDrop.jsx`):**

| Selector | Rendered HTML Snippet |
|----------|----------------------|
| `p[lang="zz"]` | `<p lang="zz">Our brand-new, limited-edition plushie bag charms…</p>` |

**Description:** `lang="zz"` is not a valid BCP 47 language tag. The `lang` attribute on individual elements must use a valid language code. Screen readers will attempt to use pronunciation rules for an unrecognized language, potentially producing garbled output for the content of this paragraph.

**Recommended Fix:** Either remove the `lang` attribute if the text is in English (inheriting the page language), or replace `"zz"` with a valid BCP 47 language tag (e.g. `lang="en"`):
```jsx
<p>Our brand-new, limited-edition plushie bag charms…</p>
```

---

### NR-1 — Sort Combobox Analysis Could Not Run (Skipped)

**Evinced Rule ID:** `COMBOBOX_ANALYSIS_CANNOT_RUN` (Skipped combobox analysis)  
**Severity:** Needs Review  
**Affected Pages:** Products Listing (`/shop/new`)  
**Issue Count:** 1

**Affected Element:** `.sort-btn` — `<button class="sort-btn">Sort by Relevance (Default)…</button>`

**Description:** The Evinced `evAnalyzeCombobox()` targeted scan could not expand the sort dropdown programmatically. The component tester was unable to trigger the button's dropdown because the sort widget does not conform to a recognized combobox pattern (missing `aria-haspopup`, `aria-expanded`, and `aria-controls`). As a result, the combobox-specific accessibility checks were skipped for this widget. This issue is related to CI-12 above — once the ARIA pattern is corrected per CI-12's remediation, the combobox analysis should be able to run successfully on re-audit.

---

### BP-1 — `role="menu"` Used Inside Site Navigation

**Evinced Rule ID:** `MENU_AS_A_NAV_ELEMENT` (Menu as a nav element)  
**Severity:** Best Practice  
**Affected Pages:** Products Listing (`/shop/new`) — surfaces on this page only because it is the only page where the navigation scan (`evAnalyzeSiteNavigation`) was run; the issue exists on all pages since it originates in `Header.jsx`  
**Issue Count:** 5 submenu elements

**Affected Elements (`src/components/Header.jsx`):**

| Selector | Rendered HTML Snippet |
|----------|----------------------|
| `.has-submenu:nth-child(2) > .submenu[role="menu"]` | `<ul class="submenu" role="menu"><li role="none"><a role="menuitem" href="/shop/new">Men's / Unisex</a></li>…</ul>` |
| `.has-submenu:nth-child(3) > .submenu[role="menu"]` | `<ul class="submenu" role="menu">…</ul>` |
| `.has-submenu:nth-child(4) > .submenu[role="menu"]` | `<ul class="submenu" role="menu">…</ul>` |
| `.has-submenu:nth-child(5) > .submenu[role="menu"]` | `<ul class="submenu" role="menu">…</ul>` |
| `.has-submenu:nth-child(6) > .submenu[role="menu"]` | `<ul class="submenu" role="menu">…</ul>` |

**Description:** The ARIA Authoring Practices Guide (APG) distinguishes between "navigation" patterns and "menu" patterns. `role="menu"` + `role="menuitem"` is intended for application menus (like desktop OS menus) where keyboard navigation uses arrow keys, not Tab. Using these roles inside a `<nav>` creates a mismatch: the outer `<nav>` announces as navigation, but the submenus announce as application menus with arrow-key keyboard expectations that are not implemented. Screen reader users familiar with this pattern may expect arrow-key navigation and find it does not work.

**Recommended Fix:** Remove `role="menu"` and `role="menuitem"` from the dropdown submenus. Keep the plain `<ul>` / `<li>` / `<a>` structure (which is appropriate for navigation). Add `aria-expanded` on the parent `<Link>` to communicate whether the submenu is open:

```jsx
// Parent nav item link
<Link
  to={item.href}
  aria-haspopup="true"
  aria-expanded={isOpen}
>
  {item.label}
</Link>

// Submenu — remove role="menu"
<ul className="submenu">
  {item.submenu.map((sub) => (
    <li key={sub.label}>
      <Link to={sub.href}>{sub.label}</Link>
    </li>
  ))}
</ul>
```

---

## Full Issue Count by Severity (Cross-Page Breakdown)

| Severity | Homepage | Products | Product Detail | Checkout Basket | Checkout Shipping | Order Confirmation | **Total** |
|----------|---------|---------|---------------|----------------|------------------|-------------------|-----------|
| Critical | 32 | 43 | 18 | 18 | 18 | 18 | **147** |
| Serious | 3 | 14 | 2 | 3 | 1 | 2 | **25** |
| Needs Review | 0 | 1 | 0 | 0 | 0 | 0 | **1** |
| Best Practice | 0 | 1 | 0 | 0 | 0 | 0 | **1** |
| **Total** | **35** | **59** | **20** | **21** | **19** | **20** | **174** |

---

## Audit Methodology

1. **App build:** `npm run build` → compiled React SPA to `dist/`
2. **Dev server:** `npx serve dist -p 3000 --single` (SPA routing support)
3. **Playwright + Evinced SDK:** Each page scanned individually with `evAnalyze()`. The Products Listing page additionally received `evAnalyzeCombobox({ selector: '.sort-btn' })` and `evAnalyzeSiteNavigation({ selector: 'nav[aria-label="Main navigation"]' })`, with results merged via `evMergeIssues()`.
4. **Authentication:** Offline mode via `setOfflineCredentials({ serviceId, token })` using the `EVINCED_SERVICE_ACCOUNT_ID` and `PLAYWRIGHT_SDK_OFFLINE_TOKEN` environment variables.
5. **Results format:** JSON — saved to `tests/e2e/test-results/a11y-*.json`
6. **Test spec:** `tests/e2e/specs/a11y-audit-all-pages.spec.ts`

All 6 tests passed. No false positives were manually excluded.

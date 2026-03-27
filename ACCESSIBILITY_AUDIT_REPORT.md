# Accessibility Audit Report

**Repository:** demo-website  
**Audit Tool:** Evinced Playwright SDK v2.43.0  
**Audit Date:** 2026-03-27  
**Auditor:** Automated CI run (Cursor Cloud Agent)

---

## Executive Summary

This report presents the results of a full accessibility audit of the demo e-commerce website. Six pages/states were scanned using the Evinced Playwright SDK running against a locally built and served production bundle.

| Page / State | URL | Total Issues | Critical | Serious |
|---|---|---|---|---|
| Homepage | `/` | 35 | 30 | 5 |
| Products Page | `/shop/new` | 55 | 41 | 14 |
| Product Detail | `/product/:id` | 20 | 17 | 3 |
| Cart Modal | product page + open cart | 24 | 22 | 2 |
| Checkout | `/checkout` | 21 | 17 | 4 |
| Order Confirmation | `/order-confirmation` | 20 | 17 | 3 |
| **Grand Total (raw)** | | **175** | **144** | **31** |

After deduplication across pages (many issues appear on every page because they are in shared components like the Header, Footer, and Cart Modal), the unique issue categories are:

- **Critical issues: 14 unique categories** (see Section 2)
- **Serious (non-critical) issues: 4 unique categories** (see Section 3)

---

## Repository Structure — Pages and Entry Points

The site is a React 18 SPA built with Webpack 5. Routes are defined in `src/components/App.jsx`:

| Route | Component File | Description |
|---|---|---|
| `/` | `src/pages/HomePage.jsx` | Landing page with hero banner, featured products, The Drop section |
| `/shop/new` | `src/pages/NewPage.jsx` | Product listing with filter sidebar and sort dropdown |
| `/product/:id` | `src/pages/ProductPage.jsx` | Single product detail, add-to-cart, wishlist |
| `/checkout` | `src/pages/CheckoutPage.jsx` | Two-step checkout: basket review → shipping & payment |
| `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` | Post-purchase confirmation page |

**Shared components present on every page:**
- `src/components/Header.jsx` — global navigation, wishlist/search/login/region icon buttons
- `src/components/Footer.jsx` — footer navigation links
- `src/components/CartModal.jsx` — slide-in cart drawer (rendered on all pages except `/checkout` and `/order-confirmation`)
- `src/components/WishlistModal.jsx` — slide-in wishlist drawer (rendered on all pages)

---

## Section 1 — Audit Methodology

1. The website was built (`npm run build`) and served locally with `npx serve dist -p 3000 --single`.
2. Six Playwright tests were executed, each navigating to a specific page/state and calling `evAnalyze()` to perform a full-page scan.
3. The Cart Modal test navigates to a product page, adds an item to the cart, waits for the drawer to open, then scans.
4. All raw issue objects were saved as JSON in `tests/e2e/test-results/`.
5. Issues were classified using the Evinced SDK's built-in severity field (`Critical` / `Serious`).
6. Source code for each affected component was reviewed to confirm the root cause and formulate a remediation recommendation.

**No Axe tools were used.** All findings are from the Evinced SDK exclusively.

---

## Section 2 — Critical Issues

The following 14 unique critical issue categories were identified. Issues that appear on multiple pages are grouped under a single entry with the list of affected pages noted.

---

### CRIT-01 — `div` Used as Button: Wishlist Icon Button (Header)

| Field | Value |
|---|---|
| **Severity** | Critical |
| **Evinced Rule IDs** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE` |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Affected Pages** | Homepage, Products Page, Product Detail, Cart Modal, Checkout, Order Confirmation (all pages) |
| **Affected Element** | `.wishlist-btn` |
| **Source File** | `src/components/Header.jsx` line 131 |

**DOM Snippet:**
```html
<div class="icon-btn wishlist-btn" style="cursor: pointer;">
  <svg aria-hidden="true">…</svg>
  <span>Wishlist</span>
</div>
```

**Description:**  
The wishlist opener in the header is a `<div>` with an `onClick` handler. It has no `role="button"`, no `tabindex`, and its inner SVG is `aria-hidden`. While it has a visible text child ("Wishlist"), the element itself is not in the tab order and will not be announced as an interactive control by screen readers. Keyboard-only users cannot reach or activate it.

**Recommended Fix:**
Replace the `<div>` with a `<button>` element (the standard HTML interactive element for a click action that does not navigate). No `tabindex` or `role` attribute is needed when using native `<button>`.

```jsx
// Before
<div className="icon-btn wishlist-btn" onClick={openWishlist} style={{cursor:'pointer'}}>
  <svg aria-hidden="true">…</svg>
  <span>Wishlist</span>
</div>

// After
<button className="icon-btn wishlist-btn" onClick={openWishlist} aria-label="Open Wishlist">
  <svg aria-hidden="true">…</svg>
  <span aria-hidden="true">Wishlist</span>
</button>
```

**Why this approach:** `<button>` is the correct semantic element for an action that triggers JavaScript without navigating. It is inherently focusable, activatable via keyboard (Enter/Space), and announces its role as "button" to assistive technology — no ARIA required.

---

### CRIT-02 — `div` Used as Button: Search Icon Button (Header)

| Field | Value |
|---|---|
| **Severity** | Critical |
| **Evinced Rule IDs** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT` |
| **WCAG** | 4.1.2 Name, Role, Value (Level A); 4.1.1 Parsing (Level A) |
| **Affected Pages** | All pages (global header) |
| **Affected Element** | `.icon-btn:nth-child(2)` (the search icon) |
| **Source File** | `src/components/Header.jsx` line 140 |

**DOM Snippet:**
```html
<div class="icon-btn" style="cursor: pointer;">
  <svg aria-hidden="true">…</svg>
  <span aria-hidden="true">Search</span>
</div>
```

**Description:**  
The search icon button is a `<div>` with no interactive semantics, no `tabindex`, and its visible text label ("Search") is hidden from assistive technology via `aria-hidden="true"`. It is therefore invisible to screen readers and inaccessible to keyboard navigation. Three separate Evinced rules fire: wrong semantic role, not keyboard focusable, and no accessible name.

**Recommended Fix:**
```jsx
// After
<button className="icon-btn" aria-label="Search" onClick={handleSearch}>
  <svg aria-hidden="true">…</svg>
</button>
```

**Why this approach:** Same rationale as CRIT-01. The `aria-label` is required here because the visible text was intentionally hidden via `aria-hidden`, so there is no other text node to serve as the accessible name.

---

### CRIT-03 — `div` Used as Button: Login Icon Button (Header)

| Field | Value |
|---|---|
| **Severity** | Critical |
| **Evinced Rule IDs** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT` |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Affected Pages** | All pages (global header) |
| **Affected Element** | `.icon-btn:nth-child(4)` (the login icon) |
| **Source File** | `src/components/Header.jsx` line 156 |

**DOM Snippet:**
```html
<div class="icon-btn" style="cursor: pointer;">
  <svg aria-hidden="true">…</svg>
  <span aria-hidden="true">Login</span>
</div>
```

**Description:**  
Identical issue to CRIT-02. The login icon is a non-semantic `<div>` whose text label is suppressed from AT via `aria-hidden`, making it unreachable and unlabelled for screen-reader and keyboard users.

**Recommended Fix:**
```jsx
<button className="icon-btn" aria-label="Login" onClick={handleLogin}>
  <svg aria-hidden="true">…</svg>
</button>
```

---

### CRIT-04 — `div` Used as Button: Region/Country Selector (Header)

| Field | Value |
|---|---|
| **Severity** | Critical |
| **Evinced Rule IDs** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE` |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Affected Pages** | All pages (global header) |
| **Affected Element** | `.flag-group` |
| **Source File** | `src/components/Header.jsx` line 161 |

**DOM Snippet:**
```html
<div class="flag-group" style="cursor: pointer;">
  <img src="/images/icons/united-states-of-america.png" alt="United States Flag" …>
  <img src="/images/icons/canada.png" alt="Canada Flag" …>
</div>
```

**Description:**  
The region/country selector is a `<div>` with a click handler but no `role`, no `tabindex`, and no accessible name describing what it does (opens a region picker). The flag images have `alt` text describing the flags but not the purpose of the control.

**Recommended Fix:**
```jsx
<button className="flag-group" onClick={handleRegionSelect} aria-label="Select region or country">
  <img src="/images/icons/united-states-of-america.png" alt="" aria-hidden="true" …>
  <img src="/images/icons/canada.png" alt="" aria-hidden="true" …>
</button>
```

**Why this approach:** The images are decorative in this context — the control's purpose is communicated by the `aria-label`. Setting `alt=""` on the flag images and `aria-hidden="true"` prevents redundant "United States Flag Canada Flag" announcement.

---

### CRIT-05 — Close Button Has No Accessible Name: Cart Modal

| Field | Value |
|---|---|
| **Severity** | Critical |
| **Evinced Rule IDs** | `AXE-BUTTON-NAME`, `NO_DESCRIPTIVE_TEXT` |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Affected Pages** | Homepage, Products Page, Product Detail, Cart Modal state |
| **Affected Element** | `#cart-modal > div:nth-child(1) > button` |
| **Source File** | `src/components/CartModal.jsx` lines 56–64 |

**DOM Snippet:**
```html
<button class="closeBtn">
  <svg width="20" height="20" aria-hidden="true">…</svg>
</button>
```

**Description:**  
The cart modal's close button renders an icon-only SVG with `aria-hidden="true"`. There is no `aria-label`, no `title`, and no visible text. Screen readers announce "button" with no name, making it impossible to understand the control's purpose.

**Recommended Fix:**
```jsx
<button
  className={styles.closeBtn}
  onClick={closeCart}
  aria-label="Close cart"
>
  <svg … aria-hidden="true">…</svg>
</button>
```

**Why this approach:** Adding `aria-label="Close cart"` directly on the `<button>` gives an unambiguous accessible name. The SVG remains `aria-hidden` to prevent the icon path descriptions from being read.

---

### CRIT-06 — Cart Continue-Shopping Button Has No Accessible Name or Role

| Field | Value |
|---|---|
| **Severity** | Critical |
| **Evinced Rule IDs** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT` |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Affected Pages** | Cart Modal state |
| **Affected Element** | `div:nth-child(3) > div:nth-child(4)` (the "Continue Shopping" div) |
| **Source File** | `src/components/CartModal.jsx` lines 128–134 |

**DOM Snippet:**
```html
<div class="continueBtn" style="cursor: pointer;">
  <span aria-hidden="true">Continue Shopping</span>
</div>
```

**Description:**  
The "Continue Shopping" button in the cart footer is a `<div>` whose only text child is wrapped in `aria-hidden="true"`, making it completely invisible to assistive technology — no role, no name, and not focusable.

**Recommended Fix:**
```jsx
<button
  className={styles.continueBtn}
  onClick={closeCart}
>
  Continue Shopping
</button>
```

**Why this approach:** Replacing the `<div>` with `<button>` provides correct semantics, keyboard accessibility, and a natural accessible name from the visible text. The `aria-hidden` on the inner `<span>` should be removed so the text is accessible.

---

### CRIT-07 — Cart Item Remove/Quantity Buttons Have No Accessible Name

| Field | Value |
|---|---|
| **Severity** | Critical |
| **Evinced Rule IDs** | `NO_DESCRIPTIVE_TEXT` |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Affected Pages** | Cart Modal state |
| **Affected Element** | `li > button` (quantity decrement/increment and remove buttons inside cart items) |
| **Source File** | `src/components/CartModal.jsx` lines 90–110 |

**DOM Snippet:**
```html
<button class="qtyBtn">−</button>
<span class="qtyValue">1</span>
<button class="qtyBtn">+</button>
<!-- and -->
<button class="removeBtn">
  <svg aria-hidden="true">…</svg>
</button>
```

**Description:**  
The quantity buttons render only the minus ("−") and plus ("+") characters with no `aria-label`. Screen readers announce "dash button" / "plus button" with no indication of which product is affected. The remove button renders only an icon-only SVG with `aria-hidden` and no label.

**Recommended Fix:**
```jsx
<button
  className={styles.qtyBtn}
  onClick={() => updateQuantity(item.id, item.quantity - 1)}
  aria-label={`Decrease quantity of ${item.name}`}
>−</button>
<span className={styles.qtyValue} aria-label={`${item.quantity} in cart`}>{item.quantity}</span>
<button
  className={styles.qtyBtn}
  onClick={() => updateQuantity(item.id, item.quantity + 1)}
  aria-label={`Increase quantity of ${item.name}`}
>+</button>
<!-- remove button -->
<button
  className={styles.removeBtn}
  onClick={() => removeFromCart(item.id)}
  aria-label={`Remove ${item.name} from cart`}
>
  <svg aria-hidden="true">…</svg>
</button>
```

**Why this approach:** Including the product name in the `aria-label` gives screen-reader users full context. Generic labels like "Minus" or "Plus" violate WCAG 2.4.6 and are confusing when multiple cart items are present.

---

### CRIT-08 — `div` Elements Used as Navigation Links: PopularSection "Shop" Links (Homepage)

| Field | Value |
|---|---|
| **Severity** | Critical |
| **Evinced Rule IDs** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT` |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Affected Pages** | Homepage |
| **Affected Elements** | `.product-card:nth-child(1) > .product-card-info > .shop-link`, `.product-card:nth-child(2) > …`, `.product-card:nth-child(3) > …` |
| **Source File** | `src/components/PopularSection.jsx` lines 53–60 |

**DOM Snippet:**
```html
<div class="shop-link" style="cursor: pointer;">
  <span aria-hidden="true">Shop Drinkware</span>
</div>
```

**Description:**  
Each "Popular on the Merch Shop" card has a shop link implemented as a `<div>`. The label text is suppressed from AT via `aria-hidden`, so the element has no role, no keyboard access, and no accessible name — three simultaneous critical failures.

**Recommended Fix:**
```jsx
// Replace the div+navigate pattern with a real link
import { Link } from 'react-router-dom';

<Link className="shop-link" to={product.shopHref}>
  {product.shopLabel}
</Link>
```

**Why this approach:** Since this control navigates to a URL, a `<Link>` (which renders as `<a href>`) is semantically correct. `<a>` elements are natively focusable, announced as "link" by screen readers, and the visible text provides the accessible name without any ARIA.

---

### CRIT-09 — `div` Elements Used as Navigation Items: Footer Links

| Field | Value |
|---|---|
| **Severity** | Critical |
| **Evinced Rule IDs** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE` |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Affected Pages** | All pages (global footer) |
| **Affected Elements** | `li:nth-child(3) > .footer-nav-item` ("Sustainability"), `.footer-list:nth-child(2) > li > .footer-nav-item` ("FAQs") |
| **Source File** | `src/components/Footer.jsx` lines 13, 18 |

**DOM Snippet:**
```html
<li><div class="footer-nav-item" style="cursor: pointer;">Sustainability</div></li>
<li><div class="footer-nav-item" style="cursor: pointer;"><span aria-hidden="true">FAQs</span></div></li>
```

**Description:**  
Two footer navigation items are implemented as `<div>` elements. The "Sustainability" `<div>` has visible text but no role or tabindex. The "FAQs" `<div>` additionally hides its text via `aria-hidden`, making it completely unnamed. Neither is keyboard-accessible.

**Recommended Fix:**
```jsx
// Sustainability — use <a> since it should navigate somewhere
<li><a href="/sustainability" className="footer-nav-item">Sustainability</a></li>

// FAQs — same approach, remove aria-hidden from inner span
<li><a href="/faqs" className="footer-nav-item">FAQs</a></li>
```

**Why this approach:** Footer links are navigational. `<a href>` is the correct element. If no destination URL exists yet, a `<button>` with an `onClick` is the next-best choice, but a `<div>` is never correct for an interactive control.

---

### CRIT-10 — Slider Missing Required ARIA Attributes

| Field | Value |
|---|---|
| **Severity** | Critical |
| **Evinced Rule IDs** | `AXE-ARIA-REQUIRED-ATTR` |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Affected Pages** | Homepage |
| **Affected Element** | `.drop-popularity-bar` |
| **Source File** | `src/components/TheDrop.jsx` line 19 |

**DOM Snippet:**
```html
<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>
```

**Description:**  
An element has `role="slider"` but is missing the three ARIA attributes that are required for this role: `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. Without these, assistive technology cannot communicate the current or range of values to the user. The element is also not keyboard-accessible (no `tabindex`).

**Recommended Fix:**
```jsx
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuetext="75% popularity"
  tabIndex={0}
  className="drop-popularity-bar"
/>
```

**Why this approach:** The WAI-ARIA specification mandates `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` for `role="slider"`. Adding concrete values satisfies the requirement. `aria-valuetext` is optional but recommended when the numeric value alone is not self-explanatory.

---

### CRIT-11 — Invalid `aria-expanded` Value on `<h1>` Elements

| Field | Value |
|---|---|
| **Severity** | Critical |
| **Evinced Rule IDs** | `AXE-ARIA-VALID-ATTR-VALUE` |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Affected Pages** | Homepage |
| **Affected Elements** | `.featured-card:nth-child(1) > .featured-card-info > h1`, `.featured-card:nth-child(2) > .featured-card-info > h1` |
| **Source File** | `src/components/FeaturedPair.jsx` line 46 |

**DOM Snippet:**
```html
<h1 aria-expanded="yes">Keep on Truckin'</h1>
<h1 aria-expanded="yes">Limited edition and traveling fast</h1>
```

**Description:**  
`aria-expanded` is applied to `<h1>` headings with the value `"yes"`. This has two problems: (1) `aria-expanded` is not a valid attribute on heading elements; (2) even if it were valid, the permitted values are `"true"` and `"false"` — `"yes"` is never valid. Assistive technologies ignore or misinterpret this attribute.

**Recommended Fix:**
```jsx
// Remove aria-expanded from <h1> entirely (headings do not expand/collapse)
<h1>{item.title}</h1>
```

**Why this approach:** `aria-expanded` is only meaningful on interactive disclosure widgets (buttons, summary elements, comboboxes). A heading has no expandable content, so the attribute should be removed. If a disclosure pattern is genuinely needed, it must be implemented on the triggering control, not the heading.

---

### CRIT-12 — Images Missing Alternative Text

| Field | Value |
|---|---|
| **Severity** | Critical |
| **Evinced Rule IDs** | `AXE-IMAGE-ALT` |
| **WCAG** | 1.1.1 Non-text Content (Level A) |
| **Affected Pages** | Homepage |
| **Affected Elements** | `img[src$="New_Tees.png"]`, `img[src$="2bags_charms1.png"]` |
| **Source Files** | `src/components/HeroBanner.jsx` line 18; `src/components/TheDrop.jsx` line 13 |

**DOM Snippets:**
```html
<!-- HeroBanner.jsx -->
<img src="/images/home/New_Tees.png" />

<!-- TheDrop.jsx -->
<img src="/images/home/2bags_charms1.png" loading="lazy" />
```

**Description:**  
Both images have no `alt` attribute at all. When `alt` is absent, screen readers typically fall back to reading the filename aloud ("New underscore Tees dot png"), which is uninformative and disorienting.

**Recommended Fix:**
```jsx
// HeroBanner.jsx
<img src={HERO_IMAGE} alt="Winter Basics collection – t-shirts and casual wear" />

// TheDrop.jsx
<img src={DROP_IMAGE} alt="Plushie bag charms: Android bot, YouTube icon, and Super G" loading="lazy" />
```

**Why this approach:** The `alt` attribute must describe the informational content of the image (WCAG 1.1.1). Images that are truly decorative should use `alt=""`, but these hero/feature images convey the subject matter of the section and therefore require descriptive alternative text.

---

### CRIT-13 — Invalid `aria-relevant` Value on Product Details List

| Field | Value |
|---|---|
| **Severity** | Critical |
| **Evinced Rule IDs** | `AXE-ARIA-VALID-ATTR-VALUE` |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Affected Pages** | Product Detail, Cart Modal |
| **Affected Element** | `ul[aria-relevant="changes"]` |
| **Source File** | `src/pages/ProductPage.jsx` line 146 |

**DOM Snippet:**
```html
<ul aria-relevant="changes" aria-live="polite">…</ul>
```

**Description:**  
`aria-relevant` accepts only space-separated tokens from the set `additions`, `removals`, `text`, and `all`. The value `"changes"` is not in this set and is therefore invalid. This causes assistive technologies to either ignore the live region or behave unpredictably.

**Recommended Fix:**
```jsx
// The closest valid equivalent to "changes" is "additions removals text" or simply "all"
<ul
  className={styles.detailsList}
  aria-relevant="additions text"
  aria-live="polite"
>
```

**Why this approach:** `aria-relevant="additions text"` tells AT to announce when new content is added and when text changes — the likely intent of the original `"changes"` value. This uses only valid tokens from the ARIA specification.

---

### CRIT-14 — Filter Options Are Non-Semantic `div` Elements (Products Page)

| Field | Value |
|---|---|
| **Severity** | Critical |
| **Evinced Rule IDs** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE` |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Affected Pages** | Products Page |
| **Affected Elements** | 11 `.filter-option` elements across Price, Size, and Brand filter groups |
| **Source File** | `src/components/FilterSidebar.jsx` lines 74, 116, 156 |

**DOM Snippet (representative):**
```html
<div class="filter-option">
  <div class="custom-checkbox">…</div>
  <span class="filter-option-label">1.00 - 19.99 <span class="filter-count">(3)</span></span>
</div>
```

**Description:**  
Each filter option is a `<div>` that acts as a checkbox. It has a visual custom checkbox, an `onClick` handler, but no `role="checkbox"`, no `aria-checked` state, and no `tabindex`. Keyboard users cannot navigate to or toggle filters. Screen readers have no indication that these are selectable options or what their current state is.

**Recommended Fix:**
```jsx
<div
  key={range.label}
  className="filter-option"
  role="checkbox"
  aria-checked={checked}
  tabIndex={0}
  onClick={() => onPriceChange(range)}
  onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') onPriceChange(range); }}
>
  <div className={`custom-checkbox${checked ? ' custom-checkbox--checked' : ''}`}>
    {checked && <div className="custom-checkbox-checkmark" />}
  </div>
  <span className="filter-option-label">
    {range.label}
    <span className="filter-count">({count})</span>
  </span>
</div>
```

**Why this approach:** `role="checkbox"` with `aria-checked` is the ARIA pattern for a custom checkbox. `tabIndex={0}` makes it keyboard-focusable. The `onKeyDown` handler enables Space/Enter activation, matching native `<input type="checkbox">` behaviour.

---

### CRIT-15 — Checkout "Continue" Button Uses Non-Semantic `div`

| Field | Value |
|---|---|
| **Severity** | Critical |
| **Evinced Rule IDs** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE` |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Affected Pages** | Checkout |
| **Affected Element** | `.checkout-continue-btn` |
| **Source File** | `src/pages/CheckoutPage.jsx` line 156 |

**DOM Snippet:**
```html
<div class="checkout-continue-btn" style="cursor: pointer;">Continue</div>
```

**Description:**  
The "Continue" action that advances the checkout from basket step to shipping step is a `<div>` with an `onClick` handler. It is not in the tab order and not announced as a button by assistive technology. Keyboard users cannot proceed through checkout.

**Recommended Fix:**
```jsx
<button
  className="checkout-continue-btn"
  onClick={() => setStep('shipping')}
>
  Continue
</button>
```

---

### CRIT-16 — Order Confirmation "Back to Shop" Uses Non-Semantic `div`

| Field | Value |
|---|---|
| **Severity** | Critical |
| **Evinced Rule IDs** | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE` |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Affected Pages** | Order Confirmation |
| **Affected Element** | `.confirm-home-link` |
| **Source File** | `src/pages/OrderConfirmationPage.jsx` line 40 |

**DOM Snippet:**
```html
<div class="confirm-home-link" style="cursor: pointer;">← Back to Shop</div>
```

**Description:**  
The post-purchase "Back to Shop" navigation link is a `<div>` with an empty `onClick`. It is not focusable, not announced as interactive, and its `onClick` handler does nothing (navigates to `""`). A keyboard user reaching the order confirmation page has no accessible way to return to the shop.

**Recommended Fix:**
```jsx
// Since this navigates back to the homepage, use a real link
import { Link } from 'react-router-dom';

<Link to="/" className="confirm-home-link">← Back to Shop</Link>
```

**Why this approach:** Navigation to a URL should use `<Link>` (renders as `<a>`), not a `<div>` with `onClick`. This also fixes the broken navigation bug (the current `onClick` has no body).

---

## Section 3 — Non-Critical (Serious) Issues Not Remediated

The following issues were classified as **Serious** by the Evinced SDK. They represent real accessibility barriers but are lower priority than the Critical issues above.

---

### NC-01 — `<html>` Element Missing `lang` Attribute

| Field | Value |
|---|---|
| **Severity** | Serious |
| **Evinced Rule ID** | `AXE-HTML-HAS-LANG` |
| **WCAG** | 3.1.1 Language of Page (Level A) |
| **Affected Pages** | All pages |
| **Affected Element** | `html` |
| **Source File** | `public/index.html` |

**Description:** The root `<html>` element has no `lang` attribute. Screen readers cannot determine the language of the page, which prevents correct pronunciation, voice switching, and braille translation.

**Recommended Fix:** Add `lang="en"` to the `<html>` tag in `public/index.html`:
```html
<html lang="en">
```

---

### NC-02 — Invalid `lang` Attribute Value

| Field | Value |
|---|---|
| **Severity** | Serious |
| **Evinced Rule ID** | `AXE-VALID-LANG` |
| **WCAG** | 3.1.2 Language of Parts (Level AA) |
| **Affected Pages** | Homepage |
| **Affected Element** | `p[lang="zz"]` |
| **Source File** | `src/components/TheDrop.jsx` line 21 |

**Description:** A paragraph uses `lang="zz"`, which is not a valid BCP 47 language tag. Screen readers may switch to an incorrect language engine for that paragraph.

**Recommended Fix:** Change `lang="zz"` to the correct language tag (e.g., `lang="en"` if the text is in English, or remove the attribute entirely).

---

### NC-03 — Insufficient Color Contrast (Multiple Elements)

| Field | Value |
|---|---|
| **Severity** | Serious |
| **Evinced Rule ID** | `AXE-COLOR-CONTRAST` |
| **WCAG** | 1.4.3 Contrast (Minimum) (Level AA) |
| **Affected Pages** | Homepage, Products Page, Product Detail, Checkout, Order Confirmation |
| **Affected Elements** | 18 elements across multiple files |

**Description:** The following elements have insufficient foreground-to-background color contrast ratios (minimum requirement: 4.5:1 for normal text, 3:1 for large text):

| Element | Selector | Location |
|---|---|---|
| Hero subtitle text | `.hero-content > p` | `src/components/HeroBanner.css` |
| Product description text | `p:nth-child(4)` | `src/pages/ProductPage.module.css` |
| Filter option counts (11 items) | `.filter-count` | `src/components/FilterSidebar.css` |
| Products found count | `.products-found` | `src/pages/NewPage.css` |
| Checkout step label | `.checkout-step:nth-child(3) > .step-label` | `src/pages/CheckoutPage.css` |
| Tax note text | `.summary-tax-note` | `src/pages/CheckoutPage.css` |
| Order ID label | `.confirm-order-id-label` | `src/pages/OrderConfirmationPage.css` |

**Recommended Fix:** Increase the lightness difference between text and background colors to meet the 4.5:1 ratio. Use a contrast checker (e.g., WebAIM Contrast Checker) to find compliant color values.

---

### NC-04 — Combobox-Like Sort Button Missing `aria-expanded` / `aria-haspopup`

| Field | Value |
|---|---|
| **Severity** | Serious (via missing ARIA state — detected by Evinced combobox analysis) |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Affected Pages** | Products Page |
| **Affected Element** | `.sort-btn` |
| **Source File** | `src/pages/NewPage.jsx` lines 141–149 |

**Description:** The sort dropdown trigger button does not communicate its expanded/collapsed state. `aria-expanded` and `aria-haspopup="listbox"` are absent from the button, and the dropdown list has no `role="listbox"` with `role="option"` children. Keyboard users cannot navigate the sort options via arrow keys.

**Recommended Fix:**
```jsx
<button
  className="sort-btn"
  onClick={() => setSortOpen((o) => !o)}
  aria-expanded={sortOpen}
  aria-haspopup="listbox"
  aria-controls="sort-options-list"
>
  Sort by {currentSortLabel}
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
        tabIndex={0}
        onClick={() => { setSort(opt.value); setSortOpen(false); }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setSort(opt.value); setSortOpen(false); }}}
      >
        {opt.label}
      </li>
    ))}
  </ul>
)}
```

---

## Section 4 — Issue Count Summary

### By Page

| Page | Critical | Serious | Total |
|---|---|---|---|
| Homepage `/` | 30 | 5 | 35 |
| Products Page `/shop/new` | 41 | 14 | 55 |
| Product Detail `/product/:id` | 17 | 3 | 20 |
| Cart Modal | 22 | 2 | 24 |
| Checkout `/checkout` | 17 | 4 | 21 |
| Order Confirmation `/order-confirmation` | 17 | 3 | 20 |

### By Evinced Rule Type (all pages combined)

| Evinced Rule ID | Rule Name | Total Occurrences |
|---|---|---|
| `WRONG_SEMANTIC_ROLE` | Interactable role | 60 |
| `NOT_FOCUSABLE` | Keyboard accessible | 55 |
| `NO_DESCRIPTIVE_TEXT` | Accessible name | 20 |
| `AXE-COLOR-CONTRAST` | Color contrast | 18 |
| `AXE-BUTTON-NAME` | Button name | 8 |
| `AXE-HTML-HAS-LANG` | Html has lang | 6 |
| `AXE-ARIA-VALID-ATTR-VALUE` | ARIA valid attr value | 4 |
| `AXE-IMAGE-ALT` | Image alt | 2 |
| `AXE-ARIA-REQUIRED-ATTR` | ARIA required attr | 2 |
| `AXE-VALID-LANG` | Valid lang | 1 |

### Unique Issue Categories

| ID | Category | Severity | Files Affected |
|---|---|---|---|
| CRIT-01 | Wishlist `div`-as-button | Critical | `Header.jsx` |
| CRIT-02 | Search `div`-as-button | Critical | `Header.jsx` |
| CRIT-03 | Login `div`-as-button | Critical | `Header.jsx` |
| CRIT-04 | Region selector `div`-as-button | Critical | `Header.jsx` |
| CRIT-05 | Cart close button no name | Critical | `CartModal.jsx` |
| CRIT-06 | Cart continue-shopping no role/name | Critical | `CartModal.jsx` |
| CRIT-07 | Cart item buttons no accessible name | Critical | `CartModal.jsx` |
| CRIT-08 | PopularSection shop-links `div`-as-link | Critical | `PopularSection.jsx` |
| CRIT-09 | Footer nav `div`-as-link | Critical | `Footer.jsx` |
| CRIT-10 | Slider missing required ARIA attrs | Critical | `TheDrop.jsx` |
| CRIT-11 | `aria-expanded="yes"` on `<h1>` | Critical | `FeaturedPair.jsx` |
| CRIT-12 | Images missing `alt` attribute | Critical | `HeroBanner.jsx`, `TheDrop.jsx` |
| CRIT-13 | `aria-relevant="changes"` invalid | Critical | `ProductPage.jsx` |
| CRIT-14 | Filter options `div`-as-checkbox | Critical | `FilterSidebar.jsx` |
| CRIT-15 | Checkout continue `div`-as-button | Critical | `CheckoutPage.jsx` |
| CRIT-16 | Order confirm back-link `div`-as-link | Critical | `OrderConfirmationPage.jsx` |
| NC-01 | `<html>` missing `lang` | Serious | `public/index.html` |
| NC-02 | Invalid `lang="zz"` | Serious | `TheDrop.jsx` |
| NC-03 | Color contrast (18 elements) | Serious | Multiple CSS files |
| NC-04 | Sort combobox missing ARIA state | Serious | `NewPage.jsx` |

---

## Section 5 — Raw Audit Data

Full JSON results for each page scan are stored in:

```
tests/e2e/test-results/
├── audit-homepage.json          (35 issues)
├── audit-shop-new.json          (55 issues)
├── audit-product-detail.json    (20 issues)
├── audit-cart-modal.json        (24 issues)
├── audit-checkout.json          (21 issues)
└── audit-order-confirmation.json (20 issues)
```

Each JSON file contains the full Evinced SDK issue object including: issue ID, type/rule ID, severity, WCAG levels, regulations (Section 508, EN 301 549), DOM selector, DOM snippet, and knowledge-base link.

---

## Section 6 — WCAG Coverage

All critical issues map to WCAG 2.1 Level A criteria:

| WCAG Criterion | Description | Issues |
|---|---|---|
| 1.1.1 Non-text Content (A) | Images must have text alternatives | CRIT-12 |
| 4.1.2 Name, Role, Value (A) | UI components must have accessible name/role/state | CRIT-01 through CRIT-16 |

Serious issues additionally cover:

| WCAG Criterion | Description | Issues |
|---|---|---|
| 1.4.3 Contrast Minimum (AA) | Text must meet 4.5:1 contrast ratio | NC-03 |
| 3.1.1 Language of Page (A) | `<html>` must have `lang` attribute | NC-01 |
| 3.1.2 Language of Parts (AA) | `lang` attribute must be a valid BCP 47 tag | NC-02 |

---

*This report was generated automatically. No source code changes were made as part of this audit.*

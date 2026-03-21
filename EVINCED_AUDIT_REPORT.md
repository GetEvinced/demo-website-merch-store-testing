# Accessibility Audit Report — Demo Website
**Tool:** Evinced SDK (`@evinced/js-playwright-sdk` v2.43.0) via Playwright  
**Date:** 2026-03-21  
**Auditor:** Automated CI run (cron trigger)  
**Branch:** `cursor/accessibility-audit-report-50d3`

---

## 1. Repository Overview

This is a React 18 single-page application built with Webpack 5 and React Router v7.

### Pages Scanned

| Route | Description | Entry Point |
|-------|-------------|-------------|
| `/` | Homepage | `src/pages/HomePage.jsx` |
| `/shop/new` | Products listing | `src/pages/NewPage.jsx` |
| `/product/:id` | Product detail (e.g. `/product/1`) | `src/pages/ProductPage.jsx` |
| `/checkout` | Checkout (basket + shipping steps) | `src/pages/CheckoutPage.jsx` |
| `/order-confirmation` | Order confirmation | `src/pages/OrderConfirmationPage.jsx` |

Components shared across all pages: `src/components/Header.jsx`, `src/components/Footer.jsx`, `src/components/CartModal.jsx`, `src/components/WishlistModal.jsx`

---

## 2. Audit Methodology

Each page was scanned using:
- **`evAnalyze()`** — full-page static accessibility scan
- **`components.analyzeCombobox()`** — targeted scan of the sort widget on the Products page
- **`components.analyzeCheckbox()`** — targeted scan of filter sidebar checkboxes on the Products page
- **`components.analyzeDisclosure()`** — targeted scan of filter disclosure buttons on the Products page
- **`components.analyzeSiteNavigation()`** — targeted scan of the main navigation header
- **`evMergeIssues()`** — deduplication across all scan results per page

Raw JSON results per page are stored in `tests/e2e/test-results/`.

---

## 3. Issue Summary

| Severity | Count |
|----------|-------|
| **Critical** | **131** |
| Serious | 24 |
| Needs Review | 1 |
| Best Practice | 1 |
| **Total** | **157** |

### Issues Per Page (Raw, Before Deduplication)

| Page | Issues Detected |
|------|----------------|
| Homepage (`/`) | 36 |
| Products (`/shop/new`) | 58 |
| Product Detail (`/product/1`) | 20 |
| Checkout (`/checkout`) | 23 |
| Order Confirmation (`/order-confirmation`) | 20 |

Many issues (especially header/footer elements) repeat across every page because the global layout components are re-scanned each time.

### Critical Issues by Violation Type

| Violation Type | Count | Description |
|---------------|-------|-------------|
| `NOT_FOCUSABLE` | 49 | Interactive elements not reachable by keyboard |
| `WRONG_SEMANTIC_ROLE` | 48 | Non-semantic elements (`<div>`, `<span>`) acting as interactive controls |
| `NO_DESCRIPTIVE_TEXT` | 18 | Interactive elements with no accessible name |
| `AXE-BUTTON-NAME` | 8 | `<button>` elements with no discernible text |
| `AXE-ARIA-VALID-ATTR-VALUE` | 3 | ARIA attributes with invalid values |
| `AXE-IMAGE-ALT` | 2 | `<img>` elements missing `alt` attribute |
| `AXE-ARIA-REQUIRED-ATTR` | 1 | ARIA role missing required attributes |
| `ELEMENT_HAS_INCORRECT_ROLE` | 1 | Element assigned the wrong ARIA role |
| `CRITICAL_SEVERITY_MISSING_CONTEXTUAL_LABELING` | 1 | Interactive element lacks contextual label |

---

## 4. Critical Issues — Detailed Findings

> **Note:** No remediations were applied. The findings below document each unique critical issue group, the affected elements, and recommended fixes with rationale.

---

### CI-01 — Header Wishlist Button: `<div>` Used as Interactive Button

**Pages Affected:** All 5 pages (present in `Header.jsx`, rendered globally)  
**File:** `src/components/Header.jsx`  
**Evinced Violation Types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**WCAG:** 4.1.2 (A) Name, Role, Value; 2.1.1 (A) Keyboard  
**Selector:** `.wishlist-btn`

**Affected Element:**
```html
<div class="icon-btn wishlist-btn" style="cursor: pointer;">
  <svg aria-hidden="true">…</svg>
  <span>Wishlist</span>
</div>
```

**Issue:**  
The wishlist toggle is implemented as a `<div>` with an `onClick` handler. Screen readers cannot identify it as a button, and keyboard users cannot focus or activate it because `<div>` has no implicit interactive role and no `tabindex`.

**Recommended Fix:**
Replace with a native `<button>` element. Native buttons are automatically keyboard-focusable and receive the correct implicit ARIA role of `button` without additional attributes.
```jsx
<button className="icon-btn wishlist-btn" onClick={openWishlist}>
  <svg aria-hidden="true">…</svg>
  <span>Wishlist</span>
</button>
```

**Why this approach:**  
Native HTML interactive elements (`<button>`) are always preferred over ARIA role overrides because they provide built-in keyboard support, focus management, and correct semantics across all assistive technologies without extra code.

---

### CI-02 — Header Search Button: `<div>` with Hidden Label, No Accessible Name

**Pages Affected:** All 5 pages  
**File:** `src/components/Header.jsx`  
**Evinced Violation Types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**WCAG:** 4.1.2 (A), 2.1.1 (A)  
**Selector:** `.icon-btn:nth-child(2)` (Search)

**Affected Element:**
```html
<div class="icon-btn" style="cursor: pointer;">
  <svg aria-hidden="true">…search icon…</svg>
  <span aria-hidden="true">Search</span>
</div>
```

**Issue:**  
Both the SVG and the visible label span are hidden from assistive technologies via `aria-hidden="true"`, leaving this interactive `<div>` with zero accessible name. Additionally, it is not a native interactive element and has no `tabindex`, making it completely invisible to keyboard and screen reader users.

**Recommended Fix:**
Replace with a `<button>` and provide an `aria-label`:
```jsx
<button className="icon-btn" aria-label="Search" onClick={openSearch}>
  <svg aria-hidden="true">…</svg>
</button>
```

**Why this approach:**  
Icon-only buttons require an explicit `aria-label` because the icon has no text equivalent. Removing `aria-hidden` from the visible label span is another option, but for icon-only controls an `aria-label` is cleaner and more concise for screen reader announcement.

---

### CI-03 — Header Login Button: `<div>` with Hidden Label, No Accessible Name

**Pages Affected:** All 5 pages  
**File:** `src/components/Header.jsx`  
**Evinced Violation Types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**WCAG:** 4.1.2 (A), 2.1.1 (A)  
**Selector:** `.icon-btn:nth-child(4)` (Login)

**Affected Element:**
```html
<div class="icon-btn" style="cursor: pointer;">
  <svg aria-hidden="true">…person icon…</svg>
  <span aria-hidden="true">Login</span>
</div>
```

**Issue:**  
Identical pattern to CI-02: a `<div>` acting as a button with all text content hidden from assistive technologies.

**Recommended Fix:**
```jsx
<button className="icon-btn" aria-label="Login" onClick={openLogin}>
  <svg aria-hidden="true">…</svg>
</button>
```

**Why this approach:**  
Same rationale as CI-02. The `aria-label` value should reflect the current state (e.g., "Login" when logged out, "My account" when logged in) to give context to screen reader users.

---

### CI-04 — Header Language/Region Selector: `<div>` with No Role

**Pages Affected:** All 5 pages  
**File:** `src/components/Header.jsx`  
**Evinced Violation Types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**WCAG:** 4.1.2 (A), 2.1.1 (A)  
**Selector:** `.flag-group`

**Affected Element:**
```html
<div class="flag-group" style="cursor: pointer;">
  <img src="/images/icons/united-states-of-america.png" alt="United States of America">
  …
</div>
```

**Issue:**  
The region/language selector is a `<div>` with a click handler. It has no semantic role and is not keyboard-focusable.

**Recommended Fix:**
```jsx
<button className="flag-group" aria-label="Select region or language" onClick={toggleRegionMenu}>
  <img src="…" alt="" aria-hidden="true" />
  <span className="sr-only">United States (English)</span>
</button>
```

**Why this approach:**  
Using `<button>` gives correct semantics. The flag image itself is decorative in this context (the accessible name comes from the `aria-label`), so it should be `aria-hidden="true"` or use `alt=""`. A visually hidden span can convey the current selection to screen reader users without cluttering the visual layout.

---

### CI-05 — PopularSection Shop Links: `<div>` with aria-hidden Label

**Pages Affected:** Homepage (`/`)  
**File:** `src/components/PopularSection.jsx`  
**Evinced Violation Types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**WCAG:** 4.1.2 (A), 2.1.1 (A), 2.4.4 (A) Link Purpose  
**Selectors:** `.product-card:nth-child(1) > .product-card-info > .shop-link` (Shop Drinkware), `:nth-child(2)` (Shop Fun and Games), `:nth-child(3)` (Shop Stationery)

**Affected Elements (3 instances):**
```html
<div class="shop-link" style="cursor: pointer;">
  <span aria-hidden="true">Shop Drinkware</span>
</div>
<!-- Same pattern for "Shop Fun and Games" and "Shop Stationery" -->
```

**Issue:**  
Each category navigation link is a `<div>` whose visible label is hidden from assistive technologies via `aria-hidden="true"`. The result is a completely inaccessible interactive element: wrong role, not focusable, and no accessible name.

**Recommended Fix:**
```jsx
<Link to="/shop/new?category=drinkware" className="shop-link">
  Shop Drinkware
</Link>
```
Remove `aria-hidden` from the label span, or use a plain `<a>` / React Router `<Link>` with visible text.

**Why this approach:**  
Navigation links should use the native `<a>` element (or its React Router equivalent). The `aria-hidden` on the label text is the root cause of the "no descriptive text" violation — removing it (rather than adding an `aria-label`) is preferable because it keeps the accessible name in sync with the visible label.

---

### CI-06 — Footer "Sustainability" Nav Item: `<div>` with No Keyboard Access

**Pages Affected:** All 5 pages (footer is global)  
**File:** `src/components/Footer.jsx`  
**Evinced Violation Types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**WCAG:** 4.1.2 (A), 2.1.1 (A)  
**Selector:** `li:nth-child(3) > .footer-nav-item`

**Affected Element:**
```html
<div class="footer-nav-item" style="cursor: pointer;">Sustainability</div>
```

**Issue:**  
A footer navigation item rendered as a `<div>`. It has no interactive semantics and is not reachable by keyboard.

**Recommended Fix:**
```jsx
<a href="/sustainability" className="footer-nav-item">Sustainability</a>
```

**Why this approach:**  
Footer navigation items that navigate to another page or route should be `<a>` elements. This provides the correct `link` role, native keyboard focus, and correct screen reader announcement.

---

### CI-07 — Footer "FAQs" Nav Item: `<div>` with aria-hidden Label

**Pages Affected:** All 5 pages  
**File:** `src/components/Footer.jsx`  
**Evinced Violation Types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**WCAG:** 4.1.2 (A), 2.1.1 (A)  
**Selector:** `.footer-list:nth-child(2) > li > .footer-nav-item`

**Affected Element:**
```html
<div class="footer-nav-item" style="cursor: pointer;">
  <span aria-hidden="true">FAQs</span>
</div>
```

**Issue:**  
Same pattern as CI-05 and CI-06 but compounded: the visible label is explicitly hidden from assistive technologies, making this element have no accessible name in addition to being non-semantic and non-focusable.

**Recommended Fix:**
```jsx
<a href="/faqs" className="footer-nav-item">FAQs</a>
```

**Why this approach:**  
Replacing with an `<a>` element resolves all three violations simultaneously. The visible text "FAQs" becomes the accessible name automatically without any ARIA attributes.

---

### CI-08 — TheDrop Slider: Missing Required ARIA Attributes

**Pages Affected:** Homepage (`/`)  
**File:** `src/components/TheDrop.jsx`  
**Evinced Violation Types:** `NOT_FOCUSABLE`, `AXE-ARIA-REQUIRED-ATTR`  
**WCAG:** 4.1.2 (A) Name, Role, Value; 2.1.1 (A) Keyboard  
**Selector:** `.drop-popularity-bar`

**Affected Element:**
```html
<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>
```

**Issue:**  
The ARIA `slider` role requires three attributes: `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. All three are missing. Additionally, the element has no `tabindex`, making it unreachable by keyboard even though `role="slider"` implies it should be focusable and keyboard-operable.

**Recommended Fix:**
```jsx
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={popularityValue}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuetext={`${popularityValue}% popularity`}
  tabIndex={0}
  className="drop-popularity-bar"
/>
```

**Why this approach:**  
The `slider` role has mandatory required properties per the WAI-ARIA specification. Without `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`, screen readers cannot convey the current state of the control. Adding `tabIndex={0}` places it in the natural tab order; additionally, `keydown` handlers for arrow keys should be added to allow value changes via keyboard.

---

### CI-09 — FeaturedPair Headings: Invalid `aria-expanded="yes"` Value

**Pages Affected:** Homepage (`/`)  
**File:** `src/components/FeaturedPair.jsx`  
**Evinced Violation Type:** `AXE-ARIA-VALID-ATTR-VALUE`  
**WCAG:** 4.1.2 (A) Name, Role, Value  
**Selectors:** `.featured-card:nth-child(1) > .featured-card-info > h1`, `.featured-card:nth-child(2) > .featured-card-info > h1`

**Affected Elements (2 instances):**
```html
<h1 aria-expanded="yes">Keep on Truckin'</h1>
<h1 aria-expanded="yes">Limited edition and traveling fast</h1>
```

**Issue:**  
`aria-expanded` only accepts `"true"` or `"false"` (boolean string values). The value `"yes"` is invalid and causes browsers/screen readers to ignore the attribute, resulting in unpredictable behaviour. Additionally, `aria-expanded` is typically used on disclosure triggers (buttons), not on heading elements.

**Recommended Fix:**  
Remove `aria-expanded` entirely from the `<h1>` elements since headings do not open/close content:
```jsx
<h1>{card.title}</h1>
```
If the card does toggle content visibility, move `aria-expanded` to the trigger button that controls it.

**Why this approach:**  
Invalid ARIA attribute values are treated as if the attribute is absent, creating inconsistent behaviour across screen readers. Headings are static landmark elements — they don't have an expanded/collapsed state. Removing the invalid attribute is the correct fix; if disclosure behaviour is needed, it belongs on the interactive control, not the heading.

---

### CI-10 — HeroBanner Image Missing `alt` Attribute

**Pages Affected:** Homepage (`/`)  
**File:** `src/components/HeroBanner.jsx`  
**Evinced Violation Type:** `AXE-IMAGE-ALT`  
**WCAG:** 1.1.1 (A) Non-text Content  
**Selector:** `img[src$="New_Tees.png"]`

**Affected Element:**
```html
<img src="/images/home/New_Tees.png">
```

**Issue:**  
The `alt` attribute is entirely absent. Screen readers will read the image filename (`New_Tees.png`) as the accessible name, which is meaningless to users.

**Recommended Fix:**
```jsx
<img src="/images/home/New_Tees.png" alt="New Tees collection — winter basics in warm hues" />
```
If the image is purely decorative (the adjacent text already conveys the information), use an empty alt: `alt=""`.

**Why this approach:**  
Every `<img>` must have an `alt` attribute. If the image conveys information, the alt text should describe the image's purpose in context. If purely decorative, `alt=""` tells screen readers to skip it entirely.

---

### CI-11 — TheDrop Image Missing `alt` Attribute

**Pages Affected:** Homepage (`/`)  
**File:** `src/components/TheDrop.jsx`  
**Evinced Violation Type:** `AXE-IMAGE-ALT`  
**WCAG:** 1.1.1 (A) Non-text Content  
**Selector:** `img[src$="2bags_charms1.png"]`

**Affected Element:**
```html
<img src="/images/home/2bags_charms1.png" loading="lazy">
```

**Issue:**  
No `alt` attribute. Screen readers read back the filename, which conveys no useful information.

**Recommended Fix:**
```jsx
<img src="/images/home/2bags_charms1.png" loading="lazy" alt="Limited-edition bag charms — The Drop collection" />
```

**Why this approach:**  
Same as CI-10. Descriptive alt text that reflects the image's marketing context and the surrounding section ("The Drop") helps screen reader users understand the purpose of the image within the page.

---

### CI-12 — Cart Modal Close Button: No Accessible Name

**Pages Affected:** Homepage, Products, Product Detail (all pages where cart drawer renders)  
**File:** `src/components/CartModal.jsx`  
**Evinced Violation Type:** `AXE-BUTTON-NAME`  
**WCAG:** 4.1.2 (A) Name, Role, Value  
**Selector:** `#cart-modal > div:nth-child(1) > button`

**Affected Element:**
```html
<button class="closeBtn">
  <svg aria-hidden="true">…X icon…</svg>
</button>
```

**Issue:**  
The close button for the shopping cart modal contains only an SVG icon with `aria-hidden="true"`. There is no visible text and no `aria-label`, so screen readers announce it as an unlabelled button with no indication of its purpose.

**Recommended Fix:**
```jsx
<button className={styles.closeBtn} aria-label="Close shopping cart" onClick={closeCart}>
  <svg aria-hidden="true">…</svg>
</button>
```

**Why this approach:**  
Icon-only buttons must always have an accessible name. An `aria-label` directly on the `<button>` is the most reliable approach — it overrides any child content and is consistently supported across all screen readers.

---

### CI-13 — Wishlist Modal Close Button: No Accessible Name

**Pages Affected:** All 5 pages (wishlist drawer renders globally)  
**File:** `src/components/WishlistModal.jsx`  
**Evinced Violation Type:** `AXE-BUTTON-NAME`  
**WCAG:** 4.1.2 (A) Name, Role, Value  
**Selector:** `div[role="dialog"] > div:nth-child(1) > button`

**Affected Element:**
```html
<button class="closeBtn">
  <svg aria-hidden="true">…X icon…</svg>
</button>
```

**Issue:**  
Identical to CI-12: icon-only close button with SVG hidden from assistive technologies and no `aria-label`.

**Recommended Fix:**
```jsx
<button className={styles.closeBtn} aria-label="Close wishlist" onClick={closeWishlist}>
  <svg aria-hidden="true">…</svg>
</button>
```

**Why this approach:**  
Same rationale as CI-12. Each modal's close button should have a specific `aria-label` that includes the dialog name (e.g., "Close shopping cart" vs. "Close wishlist") so users can differentiate between open drawers.

---

### CI-14 — Filter Sidebar Options: `<div>` Elements Acting as Checkboxes

**Pages Affected:** Products (`/shop/new`)  
**File:** `src/components/FilterSidebar.jsx`  
**Evinced Violation Types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**WCAG:** 4.1.2 (A), 2.1.1 (A)  
**Selectors:** `.filter-option` (13 instances across Price, Size, and Brand filter groups)

**Affected Elements (representative example):**
```html
<div class="filter-option">
  <div class="custom-checkbox"></div>
  <span class="filter-option-label">1.00 - 19.99 <span class="filter-count">(8)</span></span>
</div>
```
*(Same pattern for: $20–39.99, $40–89.99, $100–149.99, XS, SM, MD, LG, XL, Android, Google, YouTube)*

**Issue:**  
Each filter option is implemented as a pair of `<div>` elements. They lack `role="checkbox"` (so screen readers do not identify them as checkboxes), `aria-checked` (state cannot be conveyed), and `tabindex` (they are not keyboard-focusable). Users relying on keyboard or screen reader have no way to interact with the filters.

**Recommended Fix:**
Replace with native `<input type="checkbox">` + `<label>` pairs, which provide role, state, keyboard access, and accessible naming without any ARIA:
```jsx
<label className="filter-option">
  <input
    type="checkbox"
    checked={isSelected}
    onChange={() => toggleFilter(option.value)}
  />
  <span className="filter-option-label">
    {option.label} <span className="filter-count">({option.count})</span>
  </span>
</label>
```

**Why this approach:**  
Native `<input type="checkbox">` is universally supported across all browsers and assistive technologies. It provides `role="checkbox"`, `aria-checked` state automatically, keyboard focus, and space-bar activation with zero additional ARIA. This is strongly preferred over a custom ARIA widget, which would require manually adding `role="checkbox"`, `aria-checked`, `tabindex`, and `onKeyDown` handlers.

---

### CI-15 — Sort Button: Missing Combobox Role and Contextual Label

**Pages Affected:** Products (`/shop/new`)  
**File:** `src/pages/NewPage.jsx`  
**Evinced Violation Types:** `ELEMENT_HAS_INCORRECT_ROLE`, `CRITICAL_SEVERITY_MISSING_CONTEXTUAL_LABELING`  
**WCAG:** 4.1.2 (A) Name, Role, Value; 1.3.1 (A) Info and Relationships  
**Selector:** `.sort-btn`

**Affected Element:**
```html
<button class="sort-btn">Sort by Relevance (Default)…</button>
```

**Issue:**  
The sort trigger is a `<button>` but functions as a combobox (it opens a list of selectable options). Evinced detected that the button does not carry `role="combobox"` as required for a custom combobox widget, and it lacks the contextual labelling needed for assistive technologies to identify it as a sort control (no `aria-label`, `aria-controls`, or `aria-expanded`).

**Recommended Fix:**
```jsx
<button
  className="sort-btn"
  role="combobox"
  aria-label="Sort products"
  aria-haspopup="listbox"
  aria-expanded={isSortOpen}
  aria-controls="sort-options-list"
  onClick={toggleSort}
>
  {currentSortLabel}
</button>
<ul
  id="sort-options-list"
  role="listbox"
  aria-label="Sort options"
  hidden={!isSortOpen}
>
  {sortOptions.map(opt => (
    <li
      key={opt.value}
      role="option"
      aria-selected={opt.value === currentSort}
      tabIndex={isSortOpen ? 0 : -1}
      onClick={() => selectSort(opt.value)}
    >
      {opt.label}
    </li>
  ))}
</ul>
```

**Why this approach:**  
A sort widget that opens a dropdown list of exclusive options is semantically a `combobox`/`listbox` pattern per WAI-ARIA Authoring Practices. Adding `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`, along with `role="listbox"` on the container and `role="option"` + `aria-selected` on each item, fully describes the widget to assistive technologies. Alternatively, replacing with a native `<select>` element would be simpler and equally accessible.

---

### CI-16 — Product Detail Live Region: Invalid `aria-relevant="changes"` Value

**Pages Affected:** Product Detail (`/product/:id`)  
**File:** `src/pages/ProductPage.jsx`  
**Evinced Violation Type:** `AXE-ARIA-VALID-ATTR-VALUE`  
**WCAG:** 4.1.2 (A) Name, Role, Value  
**Selector:** `ul[aria-relevant="changes"]`

**Affected Element:**
```html
<ul class="…" aria-relevant="changes" aria-live="polite">…</ul>
```

**Issue:**  
The `aria-relevant` attribute accepts a space-separated list of tokens from the set: `additions`, `removals`, `text`, `all`. The value `"changes"` is not a valid token. Browsers ignore invalid values, so the live region behaviour may not work as intended.

**Recommended Fix:**
Replace `"changes"` with the appropriate valid tokens. Since the typical intent is to announce both added content and text changes:
```jsx
<ul aria-relevant="additions text" aria-live="polite">
```
If only text changes need to be announced, use `"text"`. If all mutations should be announced, use `"all"`.

**Why this approach:**  
Using a valid `aria-relevant` value ensures the live region behaviour is predictable across all screen readers. `"additions text"` is the most common value for product-detail stock indicators — it announces when new items appear and when text content is updated, without announcing removals (which can be confusing for hidden elements).

---

### CI-17 — Checkout "Continue" Button: `<div>` with No Interactive Semantics

**Pages Affected:** Checkout (`/checkout`) — basket step  
**File:** `src/pages/CheckoutPage.jsx`  
**Evinced Violation Types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**WCAG:** 4.1.2 (A), 2.1.1 (A)  
**Selector:** `.checkout-continue-btn`

**Affected Element:**
```html
<div class="checkout-continue-btn" style="cursor: pointer;">Continue</div>
```

**Issue:**  
The primary call-to-action for advancing through the checkout flow is a `<div>`. It has no button role and is not keyboard-focusable, effectively blocking non-mouse users from completing a purchase.

**Recommended Fix:**
```jsx
<button className="checkout-continue-btn" onClick={() => setStep('shipping')}>
  Continue
</button>
```

**Why this approach:**  
This is the primary checkout flow progression action. Using a `<button>` is non-negotiable for a purchase path. The text "Continue" already provides a sufficient accessible name. The `onClick` handler can remain unchanged.

---

### CI-18 — Checkout "Back to Cart" Button: `<div>` with No Interactive Semantics

**Pages Affected:** Checkout (`/checkout`) — shipping step  
**File:** `src/pages/CheckoutPage.jsx`  
**Evinced Violation Types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**WCAG:** 4.1.2 (A), 2.1.1 (A)  
**Selector:** `form > div > div` (`.checkout-back-btn`)

**Affected Element:**
```html
<div class="checkout-back-btn" style="cursor: pointer;">← Back to Cart</div>
```

**Issue:**  
The back navigation within the checkout flow is a `<div>`. Like CI-17, this blocks keyboard users from navigating backwards through the checkout steps.

**Recommended Fix:**
```jsx
<button className="checkout-back-btn" onClick={() => setStep('basket')}>
  ← Back to Cart
</button>
```

**Why this approach:**  
Same rationale as CI-17. All interactive controls that trigger actions must be focusable and carry the correct role. Using `<button>` provides both immediately.

---

### CI-19 — Order Confirmation "Back to Shop" Link: `<div>` with No Interactive Semantics

**Pages Affected:** Order Confirmation (`/order-confirmation`)  
**File:** `src/pages/OrderConfirmationPage.jsx`  
**Evinced Violation Types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**WCAG:** 4.1.2 (A), 2.1.1 (A)  
**Selector:** `.confirm-home-link`

**Affected Element:**
```html
<div class="confirm-home-link" style="cursor: pointer;">← Back to Shop</div>
```

**Issue:**  
The only action available on the order confirmation page — returning to the shop — is implemented as a `<div>`. This is the final step in the purchase funnel, and its inaccessibility means users who cannot use a mouse have no way to return to the homepage after completing an order.

**Recommended Fix:**
Since this navigates back to the homepage, use a React Router `<Link>` (which renders as `<a>`):
```jsx
<Link to="/" className="confirm-home-link">
  ← Back to Shop
</Link>
```

**Why this approach:**  
Navigation to another page or route should use `<a>` or `<Link>`, not `<button>`, because browsers provide additional semantics for links (context menu with "open in new tab", right-click copy URL, etc.). Using `<Link to="/">` is the semantically correct choice for this action.

---

## 5. Remediations Applied

**No remediations were applied.** This report is an audit-only document. All findings above represent the current state of the codebase as scanned on 2026-03-21.

---

## 6. Remaining Non-Critical Issues

The following 26 issues were detected but are classified as **Serious**, **Needs Review**, or **Best Practice**. They were not remediated.

### 6.1 Serious — Color Contrast (18 issues)

**Rule:** `AXE-COLOR-CONTRAST` — Elements must meet the minimum 4.5:1 contrast ratio (WCAG 1.4.3 AA)

| # | Page | Selector | Element | Issue |
|---|------|----------|---------|-------|
| 1 | Homepage | `.hero-content > p` | Hero subtitle "Warm hues for cooler days" | Insufficient contrast (~1.3:1) against hero background |
| 2 | Products | `.filter-count` (×12 filter options) | Product count badges in all filter groups (e.g. "(8)", "(14)") | `#c8c8c8` on `#ffffff` → ~1.4:1 ratio |
| 3 | Products | `.products-found` | "16 Products Found" result count | `#b0b4b8` on `#ffffff` → ~1.9:1 ratio |
| 4 | Product Detail | `p:nth-child(4)` (`.productDescription`) | Product description text | `#c0c0c0` on `#ffffff` → ~1.6:1 ratio |
| 5 | Checkout | `.checkout-step:nth-child(3) > .step-label` | "Shipping & Payment" inactive step label | Insufficient contrast in inactive step state |
| 6 | Checkout | `.summary-tax-note` | "Taxes calculated at next step" helper text | Low-contrast note text |
| 7 | Order Confirmation | `.confirm-order-id-label` | "Order ID" label in order ID box | Insufficient contrast for label text |

*Note: Filter count issues (2) represent 12 individual `.filter-count` spans across Price, Size, and Brand filter groups on the Products page — each is a separate Evinced finding.*

### 6.2 Serious — HTML Language Attribute (5 issues)

**Rule:** `AXE-HTML-HAS-LANG` — The `<html>` element must have a `lang` attribute (WCAG 3.1.1 A)

| # | Page | Selector | Issue |
|---|------|----------|-------|
| 1 | Homepage | `html` | `<html>` has no `lang` attribute — screen readers cannot detect the page language |
| 2 | Products | `html` | Same as above |
| 3 | Product Detail | `html` | Same as above |
| 4 | Checkout | `html` | Same as above |
| 5 | Order Confirmation | `html` | Same as above |

**Root cause:** `public/index.html` is missing `lang="en"` on the `<html>` element. This single fix in the HTML template would resolve all 5 instances.

### 6.3 Serious — Invalid Language Tag (1 issue)

**Rule:** `AXE-VALID-LANG` — The `lang` attribute must contain a valid BCP 47 language tag (WCAG 3.1.2 AA)

| # | Page | Selector | Element | Issue |
|---|------|----------|---------|-------|
| 1 | Homepage | `p[lang="zz"]` | Paragraph in TheDrop section | `lang="zz"` is not a valid BCP 47 language tag — screen readers cannot switch language |

### 6.4 Needs Review — Combobox Analysis Could Not Run (1 issue)

**Rule:** `COMBOBOX_ANALYSIS_CANNOT_RUN` — Evinced component tester could not expand the combobox programmatically

| # | Page | Selector | Element | Issue |
|---|------|----------|---------|-------|
| 1 | Products | `.sort-btn` | Sort combobox trigger | The combobox analysis was skipped because Evinced could not programmatically expand the sort dropdown. CI-15 (above) captures the role/labelling issues detected via full-page scan. |

### 6.5 Best Practice — Navigation Using `role="menu"` (1 issue)

**Rule:** `MENU_AS_A_NAV_ELEMENT` — Site navigation landmarks must not use `role="menu"` or `role="menubar"` on submenu containers

| # | Page | Selector | Element | Issue |
|---|------|----------|---------|-------|
| 1 | Homepage | `.has-submenu:nth-child(2) > .submenu[role="menu"]` | Header nav dropdown submenu `<ul>` | `role="menu"` applied to navigation submenu containers. The `menu` role implies application-widget semantics; within a `<nav>` landmark it causes assistive technologies to treat the navigation as a custom widget rather than a site navigation region. Submenu `<a>` elements also carry `role="menuitem"`, which is incorrect inside navigation landmarks. |

---

## 7. Appendix — Issue Count by Source

| Source | Type IDs | Count |
|--------|----------|-------|
| Evinced Engine (EV-CORE) | `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`, `ELEMENT_HAS_INCORRECT_ROLE`, `CRITICAL_SEVERITY_MISSING_CONTEXTUAL_LABELING`, `COMBOBOX_ANALYSIS_CANNOT_RUN`, `MENU_AS_A_NAV_ELEMENT` | 119 |
| axe-core | `AXE-BUTTON-NAME`, `AXE-IMAGE-ALT`, `AXE-ARIA-VALID-ATTR-VALUE`, `AXE-ARIA-REQUIRED-ATTR`, `AXE-COLOR-CONTRAST`, `AXE-HTML-HAS-LANG`, `AXE-VALID-LANG` | 38 |
| **Total** | | **157** |

---

*Report generated from Evinced SDK scan results in `tests/e2e/test-results/`.*

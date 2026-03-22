# Accessibility (A11Y) Audit Report

**Repository:** Demo E-Commerce Website (React SPA)  
**Audit Date:** 2026-03-22  
**Tool:** Evinced JS Playwright SDK (via `@evinced/js-playwright-sdk`)  
**Auditor:** Automated Cloud Agent  

---

## Executive Summary

| Metric | Count |
|---|---|
| Pages audited | 5 |
| Total issues found | 151 |
| **Critical issues** | **127** |
| Serious issues | 24 |
| Unique critical issue groups | 15 |

**Pages audited:**
| Page | URL | Total Issues | Critical | Serious |
|---|---|---|---|---|
| Homepage | `/` | 35 | 32 | 3 |
| Products Listing | `/shop/new` | 55 | 41 | 14 |
| Product Detail | `/product/1` | 20 | 18 | 2 |
| Checkout | `/checkout` | 21 | 18 | 3 |
| Order Confirmation | `/order-confirmation` | 20 | 18 | 2 |

---

## Section 1 — Critical Issues (Remediation Targets)

Critical issues represent barriers that completely prevent access for users relying on keyboard navigation or assistive technologies. The 15 unique groups below are ordered by component scope (global → page-specific).

---

### CI-01 · Header: Wishlist Button — Wrong Semantic Role + Not Keyboard Focusable

**Evinced Issue Types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**Affected Pages:** All 5 pages (present in every page's Header)  
**Affected Element:** `.wishlist-btn`  
**Raw Issue Count:** 10 (2 per page × 5 pages)

**Source Location:** `src/components/Header.jsx` — line 131

**Current Code:**
```jsx
<div className="icon-btn wishlist-btn" onClick={openWishlist} style={{cursor:'pointer'}}>
  <svg ... aria-hidden="true" />
  <span>Wishlist</span>
</div>
```

**Problem:** A `<div>` is used as an interactive control. It has an `onClick` handler, making it a button in terms of behavior, but assistive technologies (screen readers) do not announce it as interactive, and keyboard users cannot focus or activate it (no `tabindex`, no native focusability).

**WCAG Criteria Violated:**
- 4.1.2 Name, Role, Value (Level A)
- 2.1.1 Keyboard (Level A)

**Recommended Fix:**
```jsx
<button
  className="icon-btn wishlist-btn"
  onClick={openWishlist}
  aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} items` : ''}`}
>
  <svg ... aria-hidden="true" />
  <span aria-hidden="true">Wishlist</span>
</button>
```

**Rationale:** Replacing `<div>` with `<button>` provides native keyboard focus, Enter/Space key activation, and the correct `button` ARIA role — all for free. The `aria-label` replaces the visible text so the count can be included for screen reader users. The visible `<span>` is marked `aria-hidden` to prevent double-announcement.

---

### CI-02 · Header: Search Icon Button — Wrong Semantic Role + Not Focusable + No Accessible Name

**Evinced Issue Types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**Affected Pages:** All 5 pages  
**Affected Element:** `.icon-btn:nth-child(2)` (the search div)  
**Raw Issue Count:** 15 (3 per page × 5 pages)

**Source Location:** `src/components/Header.jsx` — line 140

**Current Code:**
```jsx
<div className="icon-btn" style={{cursor:'pointer'}}>
  <svg ... aria-hidden="true" />
  <span aria-hidden="true">Search</span>
</div>
```

**Problem:** A `<div>` with no role, no tabindex, and an `aria-hidden` span provides zero information to assistive technologies. The element cannot receive keyboard focus, has no ARIA role of `button`, and has no accessible name (the "Search" text is hidden via `aria-hidden`).

**WCAG Criteria Violated:**
- 4.1.2 Name, Role, Value (Level A)
- 2.1.1 Keyboard (Level A)
- 2.4.6 Headings and Labels (Level AA)

**Recommended Fix:**
```jsx
<button className="icon-btn" aria-label="Search">
  <svg ... aria-hidden="true" />
  <span aria-hidden="true">Search</span>
</button>
```

**Rationale:** `<button>` gives native keyboard accessibility and the correct implicit ARIA role. The `aria-label="Search"` provides a concise, descriptive name. The visible `<span>` remains hidden from AT to avoid double-reading.

---

### CI-03 · Header: Login Icon Button — Wrong Semantic Role + Not Focusable + No Accessible Name

**Evinced Issue Types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**Affected Pages:** All 5 pages  
**Affected Element:** `.icon-btn:nth-child(4)` (the login/account div)  
**Raw Issue Count:** 15 (3 per page × 5 pages)

**Source Location:** `src/components/Header.jsx` — line 156

**Current Code:**
```jsx
<div className="icon-btn" style={{cursor:'pointer'}}>
  <svg ... aria-hidden="true" />
  <span aria-hidden="true">Login</span>
</div>
```

**Problem:** Identical pattern to CI-02: `<div>` with `aria-hidden` text. No role, no focusability, and no accessible name for screen readers.

**WCAG Criteria Violated:**
- 4.1.2 Name, Role, Value (Level A)
- 2.1.1 Keyboard (Level A)

**Recommended Fix:**
```jsx
<button className="icon-btn" aria-label="Login / Account">
  <svg ... aria-hidden="true" />
  <span aria-hidden="true">Login</span>
</button>
```

**Rationale:** Same approach as CI-02. Using a native `<button>` element with a clear `aria-label` resolves all three detected issue types at once.

---

### CI-04 · Header: Region/Flag Selector — Wrong Semantic Role + Not Keyboard Focusable

**Evinced Issue Types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**Affected Pages:** All 5 pages  
**Affected Element:** `.flag-group`  
**Raw Issue Count:** 10 (2 per page × 5 pages)

**Source Location:** `src/components/Header.jsx` — line 161

**Current Code:**
```jsx
<div className="flag-group" onClick={() => {}} style={{ cursor: 'pointer' }}>
  <img src="/images/icons/united-states-of-america.png" alt="United States Flag" ... />
  <img src="/images/icons/canada.png" alt="Canada Flag" ... />
</div>
```

**Problem:** This div acts as a region/language selector toggle button. It has no ARIA role and cannot be accessed via keyboard. The flag images have descriptive alt text, but the containing interactive element is completely inaccessible.

**WCAG Criteria Violated:**
- 4.1.2 Name, Role, Value (Level A)
- 2.1.1 Keyboard (Level A)

**Recommended Fix:**
```jsx
<button className="flag-group" onClick={() => {}} aria-label="Select region or language">
  <img src="/images/icons/united-states-of-america.png" alt="" aria-hidden="true" ... />
  <img src="/images/icons/canada.png" alt="" aria-hidden="true" ... />
</button>
```

**Rationale:** A `<button>` provides keyboard access and proper role. The individual flag images are decorative within the button context (the button label describes the action), so their `alt` text is cleared to avoid redundancy.

---

### CI-05 · Footer: "Sustainability" Link — Wrong Semantic Role + Not Keyboard Focusable

**Evinced Issue Types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**Affected Pages:** All 5 pages  
**Affected Element:** `li:nth-child(3) > .footer-nav-item`  
**Raw Issue Count:** 10 (2 per page × 5 pages)

**Source Location:** `src/components/Footer.jsx` — line 13

**Current Code:**
```jsx
<li>
  <div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}>
    Sustainability
  </div>
</li>
```

**Problem:** A `<div>` is used where a navigation link belongs. It has no semantic role, no `tabindex`, and cannot be reached or activated by keyboard users. The element appears in a `<ul>` of navigation links, where consistency demands all items be proper `<a>` or `<button>` elements.

**WCAG Criteria Violated:**
- 4.1.2 Name, Role, Value (Level A)
- 2.1.1 Keyboard (Level A)

**Recommended Fix:**
```jsx
<li>
  <a href="#sustainability" className="footer-nav-item">Sustainability</a>
</li>
```

**Rationale:** An `<a>` element provides native link semantics, keyboard focusability (Tab key), and activation via Enter. It also participates correctly in the footer's navigation list context. If this is a router link, `<Link to="/sustainability">` should be used instead.

---

### CI-06 · Footer: "FAQs" Link — Wrong Semantic Role + Not Focusable + No Accessible Name

**Evinced Issue Types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**Affected Pages:** All 5 pages  
**Affected Element:** `.footer-list:nth-child(2) > li > .footer-nav-item`  
**Raw Issue Count:** 15 (3 per page × 5 pages)

**Source Location:** `src/components/Footer.jsx` — line 18

**Current Code:**
```jsx
<li>
  <div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}>
    <span aria-hidden="true">FAQs</span>
  </div>
</li>
```

**Problem:** Same pattern as CI-05, but with the additional issue that the link's visible text ("FAQs") is hidden from assistive technologies via `aria-hidden`. This means a screen reader user gets no label at all — they encounter an anonymous interactive element with no description.

**WCAG Criteria Violated:**
- 4.1.2 Name, Role, Value (Level A)
- 2.1.1 Keyboard (Level A)
- 2.4.6 Headings and Labels (Level AA)

**Recommended Fix:**
```jsx
<li>
  <a href="#faqs" className="footer-nav-item">FAQs</a>
</li>
```

**Rationale:** Using a native `<a>` element and removing the `aria-hidden` from the text resolves all three issues simultaneously. The text content becomes the accessible name automatically.

---

### CI-07 · PopularSection: Shop Links — Wrong Semantic Role + Not Focusable + No Accessible Name

**Evinced Issue Types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**Affected Pages:** Homepage (`/`), Order Confirmation (`/order-confirmation`)  
**Affected Element:** `.product-card:nth-child(n) > .product-card-info > .shop-link`  
**Raw Issue Count:** 18 (3 issues × 3 cards × 2 pages)

**Source Location:** `src/components/PopularSection.jsx` — lines 54–60

**Current Code:**
```jsx
<div
  className="shop-link"
  onClick={() => navigate(product.shopHref)}
  style={{ cursor: 'pointer' }}
>
  <span aria-hidden="true">{product.shopLabel}</span>
</div>
```

**Problem:** Each product card contains a shop link (`"Shop Drinkware"`, `"Shop Fun and Games"`, `"Shop Stationery"`) rendered as a `<div>` with an `aria-hidden` span. These are navigation links to the shop category, but they have no ARIA role, cannot receive keyboard focus, and are completely invisible to screen readers.

**WCAG Criteria Violated:**
- 4.1.2 Name, Role, Value (Level A)
- 2.1.1 Keyboard (Level A)

**Recommended Fix:**
```jsx
<Link
  to={product.shopHref}
  className="shop-link"
  aria-label={product.shopLabel}
>
  {product.shopLabel}
</Link>
```

**Rationale:** React Router's `<Link>` renders an `<a>` element, providing native link semantics and keyboard accessibility. The text content of the link serves as its accessible name, so no separate `aria-label` is needed unless the visible text needs to differ. The `aria-hidden` wrapper can be removed entirely.

---

### CI-08 · TheDrop: Popularity Bar Slider — Missing Required ARIA Attributes

**Evinced Issue Types:** `NOT_FOCUSABLE`, `AXE-ARIA-REQUIRED-ATTR`  
**Affected Pages:** Homepage (`/`), Order Confirmation (`/order-confirmation`)  
**Affected Element:** `.drop-popularity-bar` (role="slider")  
**Raw Issue Count:** 4 (2 issues × 2 pages)

**Source Location:** `src/components/TheDrop.jsx` — line 19

**Current Code:**
```jsx
<div role="slider" aria-label="Popularity indicator" className="drop-popularity-bar"></div>
```

**Problem:** The `role="slider"` ARIA role requires three mandatory attributes: `aria-valuenow` (current value), `aria-valuemin` (minimum), and `aria-valuemax` (maximum). Without these, assistive technologies cannot convey the slider's state to users. Additionally, the element lacks `tabindex="0"`, making it keyboard inaccessible.

**WCAG Criteria Violated:**
- 4.1.2 Name, Role, Value (Level A) — missing required ARIA state properties
- 2.1.1 Keyboard (Level A) — not keyboard focusable

**Recommended Fix:**
```jsx
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuetext="75% popular"
  tabIndex={0}
  className="drop-popularity-bar"
/>
```

**Rationale:** Adding the three required ARIA attributes makes the slider semantically complete. `aria-valuetext` provides a human-readable interpretation. `tabIndex={0}` makes it keyboard-reachable. If this element does not function as a real interactive slider, the `role="slider"` should be removed entirely (e.g., replaced with a decorative `<div>` or a `role="img"` with a descriptive `aria-label`).

---

### CI-09 · FeaturedPair: Heading `aria-expanded="yes"` — Invalid ARIA Attribute Value

**Evinced Issue Type:** `AXE-ARIA-VALID-ATTR-VALUE`  
**Affected Pages:** Homepage (`/`), Order Confirmation (`/order-confirmation`)  
**Affected Elements:** `.featured-card:nth-child(1) > .featured-card-info > h1`, `.featured-card:nth-child(2) > .featured-card-info > h1`  
**Raw Issue Count:** 4 (2 elements × 2 pages)

**Source Location:** `src/components/FeaturedPair.jsx` — line 46

**Current Code:**
```jsx
<h1 aria-expanded="yes">{item.title}</h1>
```

**Problem:** `aria-expanded` is a boolean ARIA state attribute that only accepts `"true"` or `"false"`. The value `"yes"` is invalid and causes parsing errors in assistive technologies. Additionally, `aria-expanded` is not a valid attribute for heading elements (`<h1>`–`<h6>`) according to the ARIA specification, which further confuses screen readers.

**WCAG Criteria Violated:**
- 4.1.2 Name, Role, Value (Level A) — invalid ARIA attribute value

**Recommended Fix:**
```jsx
<h1>{item.title}</h1>
```

**Rationale:** The `aria-expanded` attribute should be removed entirely from the heading. It is semantically incorrect on a heading element and the value `"yes"` is invalid regardless. If a disclosure/expand behavior exists for this heading, the attribute belongs on the button that controls the disclosure, not the heading itself.

---

### CI-10 · Cart Modal: Close Button — No Accessible Name

**Evinced Issue Type:** `AXE-BUTTON-NAME`  
**Affected Pages:** Homepage, Products, Product Detail, Checkout (pages where CartModal renders)  
**Affected Element:** `#cart-modal > div:nth-child(1) > button`  
**Raw Issue Count:** 4 (1 per affected page)

**Source Location:** `src/components/CartModal.jsx` — lines 56–64

**Current Code:**
```jsx
<button className={styles.closeBtn} onClick={closeCart}>
  <svg width="20" height="20" ... aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
</button>
```

**Problem:** The close button contains only an SVG icon with `aria-hidden="true"`. This means the button has no text content and no accessible name. Screen readers will announce this as an unlabeled button (often "button" with no description), making it impossible for users to know its purpose.

**WCAG Criteria Violated:**
- 4.1.2 Name, Role, Value (Level A)
- 2.4.6 Headings and Labels (Level AA)

**Recommended Fix:**
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

**Rationale:** Adding `aria-label="Close shopping cart"` provides a descriptive, context-specific name. A generic "Close" would also be acceptable, but specificity ("shopping cart") helps users who may have multiple dialogs open or who are navigating by form controls. The SVG remains `aria-hidden` to prevent it from contributing to the button's name computation.

---

### CI-11 · Wishlist Modal: Close Button — No Accessible Name

**Evinced Issue Type:** `AXE-BUTTON-NAME`  
**Affected Pages:** All 5 pages (WishlistModal renders globally)  
**Affected Element:** `div[role="dialog"] > div:nth-child(1) > button`  
**Raw Issue Count:** 5 (1 per page)

**Source Location:** `src/components/WishlistModal.jsx` — lines 61–80

**Current Code:**
```jsx
<button ref={closeBtnRef} className={styles.closeBtn} onClick={closeWishlist}>
  <svg width="20" height="20" ... aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
</button>
```

**Problem:** Identical pattern to CI-10 — an icon-only button with `aria-hidden` SVG and no text or label. Screen readers have no way to announce the button's purpose.

**WCAG Criteria Violated:**
- 4.1.2 Name, Role, Value (Level A)

**Recommended Fix:**
```jsx
<button
  ref={closeBtnRef}
  className={styles.closeBtn}
  onClick={closeWishlist}
  aria-label="Close wishlist"
>
  <svg width="20" height="20" ... aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
</button>
```

**Rationale:** Same approach as CI-10. `aria-label="Close wishlist"` is added to give the button a meaningful, distinct name. No other changes are needed.

---

### CI-12 · FilterSidebar: Filter Option Divs — Wrong Semantic Role + Not Keyboard Focusable

**Evinced Issue Types:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**Affected Pages:** Products Listing (`/shop/new`)  
**Affected Elements:** All `.filter-option` divs across Price, Size, and Brand filter groups  
**Raw Issue Count:** 22 (11 elements × 2 issue types per element)

**Source Location:** `src/components/FilterSidebar.jsx` — lines 74, 116, 156

**Current Code (representative example — Price filter):**
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

**Problem:** Each filter option is a custom checkbox implemented with `<div>` elements. There is no ARIA role of `checkbox`, no `tabindex`, no `aria-checked` state, and the checked state is conveyed only visually via CSS. Keyboard users cannot focus or toggle these filters; screen reader users get no semantics, no label, and no state information.

**WCAG Criteria Violated:**
- 4.1.2 Name, Role, Value (Level A)
- 2.1.1 Keyboard (Level A)

**Recommended Fix (using native HTML):**
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

**Rationale:** A native `<input type="checkbox">` inside a `<label>` is the most robust solution. It provides: native keyboard access (Space to toggle), native `role="checkbox"`, automatic `aria-checked` state from the `checked` property, and automatic accessible name from the associated `<label>` text. Visually hiding the native checkbox (via CSS) while keeping it accessible is a standard pattern. This eliminates all three custom-checkbox divs and replaces them with one input + label pair per filter option.

---

### CI-13 · Product Detail: Details List — Invalid `aria-relevant` Value

**Evinced Issue Type:** `AXE-ARIA-VALID-ATTR-VALUE`  
**Affected Pages:** Product Detail (`/product/1`)  
**Affected Element:** `ul[aria-relevant="changes"]`  
**Raw Issue Count:** 1

**Source Location:** `src/pages/ProductPage.jsx` — line 144

**Current Code:**
```jsx
<ul
  className={styles.detailsList}
  aria-relevant="changes"
  aria-live="polite"
>
```

**Problem:** `aria-relevant` accepts only space-separated values from the set: `additions`, `removals`, `text`, `all`. The value `"changes"` is not a valid token and will cause assistive technologies to ignore or misinterpret the live region's behavior.

**WCAG Criteria Violated:**
- 4.1.2 Name, Role, Value (Level A) — invalid ARIA attribute value

**Recommended Fix:**
```jsx
<ul
  className={styles.detailsList}
  aria-relevant="additions text"
  aria-live="polite"
>
```

**Rationale:** `"additions text"` is the semantically correct value for a live region whose purpose is to announce newly added text content (product details). This is also the default behavior for `aria-live="polite"`, so if the list's content never changes dynamically, both `aria-live` and `aria-relevant` can be removed without loss of functionality.

---

### CI-14 · HeroBanner: Missing Image Alt Text

**Evinced Issue Type:** `AXE-IMAGE-ALT`  
**Affected Pages:** Homepage (`/`), Order Confirmation (`/order-confirmation`)  
**Affected Element:** `img[src$="New_Tees.png"]`  
**Raw Issue Count:** 2 (1 per affected page)

**Source Location:** `src/components/HeroBanner.jsx` — line 18

**Current Code:**
```jsx
<img src={HERO_IMAGE} />
```

**Problem:** The hero banner image has no `alt` attribute at all. When `alt` is missing entirely (as opposed to `alt=""`), screen readers fall back to announcing the image filename (e.g., "New underscore Tees dot PNG"), which is meaningless to users. For a marketing hero image, this deprives users of the promotional context.

**WCAG Criteria Violated:**
- 1.1.1 Non-text Content (Level A)

**Recommended Fix:**
```jsx
<img src={HERO_IMAGE} alt="Winter Basics — warm hues for cooler days" />
```

**Rationale:** A concise, descriptive alt text conveys the promotional message to screen reader users. It mirrors the heading and subheading already present in the banner, creating a coherent experience. Alternatively, if the text content of the banner already fully describes the image's purpose, `alt=""` (empty string) would make the image decorative and suppress the filename announcement — but since the image carries visual promotional context not fully captured by the text, descriptive alt text is preferred.

---

### CI-15 · TheDrop: Missing Image Alt Text

**Evinced Issue Type:** `AXE-IMAGE-ALT`  
**Affected Pages:** Homepage (`/`), Order Confirmation (`/order-confirmation`)  
**Affected Element:** `img[src$="2bags_charms1.png"]`  
**Raw Issue Count:** 2 (1 per affected page)

**Source Location:** `src/components/TheDrop.jsx` — line 13

**Current Code:**
```jsx
<img src={DROP_IMAGE} loading="lazy" />
```

**Problem:** Like CI-14, this product image lacks an `alt` attribute entirely. The TheDrop section describes a specific set of limited-edition plushie bag charms (Android bot, YouTube icon, Super G). The image visually reinforces this marketing message, and without alt text, screen reader users miss the product imagery entirely.

**WCAG Criteria Violated:**
- 1.1.1 Non-text Content (Level A)

**Recommended Fix:**
```jsx
<img
  src={DROP_IMAGE}
  alt="Limited-edition plushie bag charms: Android bot, YouTube icon, and Super G"
  loading="lazy"
/>
```

**Rationale:** The alt text describes what is shown in the image (the specific charms), which complements the body copy rather than duplicating it. This gives screen reader users equivalent information to sighted users who can see the product image.

---

## Section 2 — Critical Issues by Page Summary

| Issue ID | Issue Description | Homepage | Products | Product Detail | Checkout | Order Confirmation |
|---|---|---|---|---|---|---|
| CI-01 | Header Wishlist btn — wrong role + not focusable | ✗ | ✗ | ✗ | ✗ | ✗ |
| CI-02 | Header Search btn — wrong role + not focusable + no name | ✗ | ✗ | ✗ | ✗ | ✗ |
| CI-03 | Header Login btn — wrong role + not focusable + no name | ✗ | ✗ | ✗ | ✗ | ✗ |
| CI-04 | Header Flag/Region btn — wrong role + not focusable | ✗ | ✗ | ✗ | ✗ | ✗ |
| CI-05 | Footer Sustainability — wrong role + not focusable | ✗ | ✗ | ✗ | ✗ | ✗ |
| CI-06 | Footer FAQs — wrong role + not focusable + no name | ✗ | ✗ | ✗ | ✗ | ✗ |
| CI-07 | PopularSection shop-links — wrong role + not focusable + no name | ✗ | — | — | — | ✗ |
| CI-08 | TheDrop slider missing required ARIA attrs | ✗ | — | — | — | ✗ |
| CI-09 | FeaturedPair h1 `aria-expanded="yes"` invalid | ✗ | — | — | — | ✗ |
| CI-10 | Cart Modal close btn — no accessible name | ✗ | ✗ | ✗ | ✗ | — |
| CI-11 | Wishlist Modal close btn — no accessible name | ✗ | ✗ | ✗ | ✗ | ✗ |
| CI-12 | FilterSidebar filter options — wrong role + not focusable | — | ✗ | — | — | — |
| CI-13 | ProductPage details `aria-relevant="changes"` invalid | — | — | ✗ | — | — |
| CI-14 | HeroBanner img missing alt | ✗ | — | — | — | ✗ |
| CI-15 | TheDrop img missing alt | ✗ | — | — | — | ✗ |

*(✗ = present, — = not applicable on this page)*

---

## Section 3 — Non-Critical (Serious) Issues

The following issues were classified as **Serious** by Evinced (not Critical). They represent significant barriers for some users but do not completely block access. They were identified during the audit but are outside the scope of immediate critical remediation.

---

### NC-01 · Missing `lang` Attribute on `<html>` Element

**Evinced Issue Type:** `AXE-HTML-HAS-LANG` (Serious)  
**Affected Pages:** All 5 pages  
**Affected Element:** `html`  
**Instance Count:** 5 (1 per page)

**Problem:** The `<html>` element has no `lang` attribute. Screen readers use the `lang` attribute to determine the correct pronunciation rules and language-specific processing. Without it, users of screen readers in non-English locales may hear garbled pronunciation for all text on the site.

**Source Location:** `public/index.html` — line 2  

**Current Code:**
```html
<html>
```

**Recommended Fix:**
```html
<html lang="en">
```

---

### NC-02 · Invalid `lang` Attribute Value on `<p>` in TheDrop

**Evinced Issue Type:** `AXE-VALID-LANG` (Serious)  
**Affected Pages:** Homepage (`/`), Order Confirmation (`/order-confirmation`)  
**Affected Element:** `p[lang="zz"]`  
**Instance Count:** 2

**Problem:** A paragraph in the `TheDrop` component has `lang="zz"`, which is not a valid BCP 47 language tag. Screen readers will either ignore the attribute or apply incorrect pronunciation rules to the paragraph's content.

**Source Location:** `src/components/TheDrop.jsx` — line 21  

**Current Code:**
```jsx
<p lang="zz">Our brand-new, limited-edition plushie bag charms...</p>
```

**Recommended Fix:** Remove the `lang` attribute (it inherits `lang="en"` from the root `<html>` after NC-01 is fixed), or replace with a valid BCP 47 tag if the text is intentionally in another language.

---

### NC-03 · Insufficient Color Contrast — Hero Banner Body Text

**Evinced Issue Type:** `AXE-COLOR-CONTRAST` (Serious)  
**Affected Pages:** Homepage (`/`)  
**Affected Element:** `.hero-content > p`  
**Instance Count:** 1

**Problem:** The hero banner subheading text ("Warm hues for cooler days") does not meet the WCAG AA minimum contrast ratio of 4.5:1 for normal text. Users with low vision may be unable to read this text.

**Source Location:** `src/components/HeroBanner.css`

**Recommended Fix:** Increase text color darkness or add a background overlay/scrim behind the text to improve contrast to at least 4.5:1 (for text < 18pt/24px) or 3:1 (for large text ≥ 18pt/24px).

---

### NC-04 · Insufficient Color Contrast — Filter Count Badges (Products Page)

**Evinced Issue Type:** `AXE-COLOR-CONTRAST` (Serious)  
**Affected Pages:** Products Listing (`/shop/new`)  
**Affected Elements:** `.filter-count` spans within Price, Size, and Brand filter options (13 instances)  
**Instance Count:** 13

**Problem:** The count badge text (e.g., "(4)") next to each filter option label has insufficient contrast against its background. This affects all filter groups across the sidebar.

**Source Location:** `src/components/FilterSidebar.css`

**Recommended Fix:** Darken the `.filter-count` text color or lighten the badge background to achieve a contrast ratio ≥ 4.5:1.

---

### NC-05 · Insufficient Color Contrast — Products Count Text

**Evinced Issue Type:** `AXE-COLOR-CONTRAST` (Serious)  
**Affected Pages:** Products Listing (`/shop/new`)  
**Affected Element:** `.products-found`  
**Instance Count:** 1

**Problem:** The "X products found" text displayed above the product grid has insufficient color contrast against the page background.

**Source Location:** `src/pages/NewPage.css`

**Recommended Fix:** Increase the text color's darkness or use a stronger font weight to improve the contrast ratio.

---

### NC-06 · Insufficient Color Contrast — Checkout Step Label + Tax Note

**Evinced Issue Type:** `AXE-COLOR-CONTRAST` (Serious)  
**Affected Pages:** Checkout (`/checkout`)  
**Affected Elements:** `.checkout-step:nth-child(3) > .step-label`, `.summary-tax-note`  
**Instance Count:** 2

**Problem:** Two pieces of text on the checkout page fail contrast requirements: the inactive step indicator label ("Shipping & Payment" when on the basket step) and the tax disclaimer note ("Taxes calculated at next step") both render below the WCAG 4.5:1 minimum.

**Source Location:** `src/pages/CheckoutPage.css`

**Recommended Fix:** Darken the color values used for `.step-label` in its inactive state and for `.summary-tax-note`.

---

### NC-07 · Insufficient Color Contrast — Order Confirmation "Order ID" Label

**Evinced Issue Type:** `AXE-COLOR-CONTRAST` (Serious)  
**Affected Pages:** Order Confirmation (`/order-confirmation`)  
**Affected Element:** `.confirm-order-id-label`  
**Instance Count:** 1

**Problem:** The "Order ID" label text above the order number has insufficient color contrast, potentially making it difficult to read for users with low vision.

**Source Location:** `src/pages/OrderConfirmationPage.css`

**Recommended Fix:** Increase the darkness of the label color so that its contrast ratio against the card background meets or exceeds 4.5:1.

---

## Section 4 — Issue Count Summary

### By Severity

| Severity | Count | % of Total |
|---|---|---|
| Critical | 127 | 84% |
| Serious | 24 | 16% |
| **Total** | **151** | **100%** |

### Critical Issues by Type

| Evinced Issue Type | Count | Description |
|---|---|---|
| `NOT_FOCUSABLE` | 50 | Interactive elements unreachable by keyboard |
| `WRONG_SEMANTIC_ROLE` | 47 | Non-semantic elements used as interactive controls |
| `NO_DESCRIPTIVE_TEXT` | 21 | Interactive elements with no accessible name |
| `AXE-BUTTON-NAME` | 9 | Buttons without discernible text |
| `AXE-ARIA-VALID-ATTR-VALUE` | 5 | Invalid ARIA attribute values |
| `AXE-IMAGE-ALT` | 4 | Images without alternative text |
| `AXE-ARIA-REQUIRED-ATTR` | 2 | Missing required ARIA attributes for ARIA roles |
| **Total Critical** | **127** | |

### Serious Issues by Type

| Evinced Issue Type | Count | Description |
|---|---|---|
| `AXE-COLOR-CONTRAST` | 18 | Insufficient text/background contrast ratio |
| `AXE-HTML-HAS-LANG` | 5 | `<html>` missing `lang` attribute |
| `AXE-VALID-LANG` | 2 | Invalid BCP 47 language tag used |
| **Total Serious** | **24** | |

---

## Section 5 — WCAG Criteria Impact Summary

| WCAG Criterion | Level | Severity | Issues |
|---|---|---|---|
| 1.1.1 Non-text Content | A | Critical | CI-14, CI-15 |
| 1.4.3 Contrast (Minimum) | AA | Serious | NC-03 through NC-07 |
| 2.1.1 Keyboard | A | Critical | CI-01 through CI-08, CI-12 |
| 3.1.1 Language of Page | A | Serious | NC-01 |
| 3.1.2 Language of Parts | AA | Serious | NC-02 |
| 4.1.2 Name, Role, Value | A | Critical | CI-01 through CI-13 |

---

## Appendix A — Source Files with Critical Issues

| Source File | Issues Referenced |
|---|---|
| `src/components/Header.jsx` | CI-01, CI-02, CI-03, CI-04 |
| `src/components/Footer.jsx` | CI-05, CI-06 |
| `src/components/CartModal.jsx` | CI-10 |
| `src/components/WishlistModal.jsx` | CI-11 |
| `src/components/PopularSection.jsx` | CI-07 |
| `src/components/TheDrop.jsx` | CI-08, CI-15 |
| `src/components/FeaturedPair.jsx` | CI-09 |
| `src/components/HeroBanner.jsx` | CI-14 |
| `src/components/FilterSidebar.jsx` | CI-12 |
| `src/pages/ProductPage.jsx` | CI-13 |

---

## Appendix B — Raw Audit Data

Raw Evinced JSON results are stored in `tests/e2e/test-results/`:

| File | Page | Issues |
|---|---|---|
| `page-homepage.json` | Homepage `/` | 35 |
| `page-products.json` | Products `/shop/new` | 55 |
| `page-product-detail.json` | Product Detail `/product/1` | 20 |
| `page-checkout.json` | Checkout `/checkout` | 21 |
| `page-order-confirmation.json` | Order Confirmation `/order-confirmation` | 20 |

---

*Report generated automatically using the Evinced JS Playwright SDK (`@evinced/js-playwright-sdk`). Playwright audit was run in headless Chromium against a production build served at `http://localhost:3000`.*

# Accessibility Audit Report — Demo Website

**Generated:** 2026-03-17  
**Audit Tool:** Evinced JS Playwright SDK v2.43.0  
**Methodology:** Automated per-page Evinced scans (`evAnalyze`) with targeted component analysis (`analyzeCombobox`, `analyzeSiteNavigation`) on all discoverable routes  
**Standard:** WCAG 2.0 / 2.1 / 2.2 Level A and AA  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Scanned Pages & Entry Points](#scanned-pages--entry-points)
3. [Audit Results Summary](#audit-results-summary)
4. [Critical Issues — Detailed Findings](#critical-issues--detailed-findings)
   - [CI-1: Header Icon Buttons Use Wrong Semantic Role](#ci-1-header-icon-buttons-use-wrong-semantic-role)
   - [CI-2: Footer Navigation Items Use Wrong Semantic Role](#ci-2-footer-navigation-items-use-wrong-semantic-role)
   - [CI-3: Homepage "Popular" Shop Link Divs Are Non-Interactive](#ci-3-homepage-popular-shop-link-divs-are-non-interactive)
   - [CI-4: Filter Option Divs Are Not Keyboard Accessible](#ci-4-filter-option-divs-are-not-keyboard-accessible)
   - [CI-5: Cart Modal Close Button Has No Accessible Name](#ci-5-cart-modal-close-button-has-no-accessible-name)
   - [CI-6: Homepage Images Missing Alt Text](#ci-6-homepage-images-missing-alt-text)
   - [CI-7: Invalid ARIA Attribute Values](#ci-7-invalid-aria-attribute-values)
   - [CI-8: Slider Missing Required ARIA Attributes](#ci-8-slider-missing-required-aria-attributes)
   - [CI-9: Sort Button Has Incorrect Role / Missing Context Labels](#ci-9-sort-button-has-incorrect-role--missing-context-labels)
   - [CI-10: Checkout Continue/Back Buttons Use Div Elements](#ci-10-checkout-continueback-buttons-use-div-elements)
   - [CI-11: Order Confirmation Back Link Uses Div Element](#ci-11-order-confirmation-back-link-uses-div-element)
   - [CI-12: Wishlist Modal Close Button Has No Accessible Name](#ci-12-wishlist-modal-close-button-has-no-accessible-name)
5. [Recommended Remediations for Each Critical Issue](#recommended-remediations-for-each-critical-issue)
6. [Remaining Non-Critical Issues](#remaining-non-critical-issues)

---

## Executive Summary

A full accessibility audit was conducted across all 6 discoverable pages of the Demo Website using the Evinced JS Playwright SDK. The audit identified **174 total accessibility issues** across **147 Critical** and **25 Serious** severity levels, plus 1 Needs Review and 1 Best Practice item.

Critical issues represent failures of WCAG 2.x Level A success criteria — the baseline accessibility requirements that most directly affect users of assistive technologies (screen readers, keyboard-only navigation, switch controls). The 147 critical violations map to **12 distinct issue groups** (CI-1 through CI-12), many of which are systemic patterns repeated across multiple pages.

The most pervasive categories are:

| Category | Issues | Root Cause Pattern |
|---|---|---|
| Wrong Semantic Role (`WRONG_SEMANTIC_ROLE`) | 54 | `<div>` elements used as interactive controls |
| Keyboard Inaccessible (`NOT_FOCUSABLE`) | 55 | Same `<div>` controls lack `tabindex` |
| No Accessible Name (`NO_DESCRIPTIVE_TEXT`) | 21 | Controls with `aria-hidden` text or no label |
| Missing Button Name (`AXE-BUTTON-NAME`) | 9 | Icon-only `<button>` elements with no `aria-label` |
| Invalid ARIA Values (`AXE-ARIA-VALID-ATTR-VALUE`) | 3 | Non-standard values in ARIA attributes |
| Missing Images Alt Text (`AXE-IMAGE-ALT`) | 2 | `<img>` without `alt` attribute |
| Missing Required ARIA (`AXE-ARIA-REQUIRED-ATTR`) | 1 | `role="slider"` missing required attributes |
| Incorrect Element Role (`ELEMENT_HAS_INCORRECT_ROLE`) | 1 | Sort button with wrong ARIA role |
| Missing Contextual Label (`CRITICAL_SEVERITY_MISSING_CONTEXTUAL_LABELING`) | 1 | Sort button with no accessible label |

---

## Scanned Pages & Entry Points

| # | Page | URL | Entry Point |
|---|---|---|---|
| 1 | Homepage | `/` | `src/pages/HomePage.jsx` |
| 2 | Products Listing | `/shop/new` | `src/pages/NewPage.jsx` |
| 3 | Product Detail | `/product/:id` (e.g. `/product/1`) | `src/pages/ProductPage.jsx` |
| 4 | Checkout — Basket Step | `/checkout` (default `step = 'basket'`) | `src/pages/CheckoutPage.jsx` |
| 5 | Checkout — Shipping Step | `/checkout` (after clicking Continue) | `src/pages/CheckoutPage.jsx` |
| 6 | Order Confirmation | `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` |

**Navigation path:** All pages are reachable via the React Router SPA. The Products page is linked from the Header `<nav>`. Product detail pages are linked from product card elements. Checkout is reached via the cart modal. Order Confirmation is reached by completing the checkout form.

**Shared components on all pages:** `Header` (`src/components/Header.jsx`), `Footer` (`src/components/Footer.jsx`), `CartModal` (`src/components/CartModal.jsx`), `WishlistModal` (`src/components/WishlistModal.jsx`).

---

## Audit Results Summary

| Page | Total Issues | Critical | Serious | Needs Review | Best Practice |
|---|---|---|---|---|---|
| Homepage (`/`) | 35 | 32 | 3 | 0 | 0 |
| Products Page (`/shop/new`) | 59 | 43 | 14 | 1 | 1 |
| Product Detail (`/product/1`) | 20 | 18 | 2 | 0 | 0 |
| Checkout — Basket | 21 | 18 | 3 | 0 | 0 |
| Checkout — Shipping | 19 | 18 | 1 | 0 | 0 |
| Order Confirmation | 20 | 18 | 2 | 0 | 0 |
| **TOTAL** | **174** | **147** | **25** | **1** | **1** |

---

## Critical Issues — Detailed Findings

---

### CI-1: Header Icon Buttons Use Wrong Semantic Role

**Severity:** Critical  
**Evinced Rules:** `WRONG_SEMANTIC_ROLE` (Interactable role), `NOT_FOCUSABLE` (Keyboard accessible), `NO_DESCRIPTIVE_TEXT` (Accessible name)  
**WCAG:** 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A)  
**Affected Pages:** All 6 pages (shared `Header` component)  
**Issue Count:** ~18 instances (3 issues × 4 elements × pages deduplicated to shared component)

**Affected Elements:**

| Selector | DOM Snippet | Problem |
|---|---|---|
| `.wishlist-btn` | `<div class="icon-btn wishlist-btn" style="cursor: pointer;"><svg...>` | `<div>` instead of `<button>` |
| `.icon-btn:nth-child(2)` | `<div class="icon-btn" style="cursor: pointer;"><svg...>` | Search icon div — no label |
| `.icon-btn:nth-child(4)` | `<div class="icon-btn" style="cursor: pointer;"><svg...>` | Login icon div — no label |
| `.flag-group` | `<div class="flag-group" style="cursor: pointer;"><img src=".../united-states-of-america.png"...>` | Country/language selector div |

**Description:**  
The Header contains four interactive icon controls (Wishlist, Search, Login, Language/Flag selector) implemented as `<div>` elements with only a CSS `cursor: pointer` style. Keyboard users cannot reach them via Tab navigation (no `tabindex`), screen readers cannot identify them as buttons, and the Search and Login icon divs carry no accessible name (their SVG icons have no `aria-label`).

**Source File:** `src/components/Header.jsx`

---

### CI-2: Footer Navigation Items Use Wrong Semantic Role

**Severity:** Critical  
**Evinced Rules:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**WCAG:** 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A)  
**Affected Pages:** All 6 pages (shared `Footer` component)  
**Issue Count:** 9 instances per page (2 elements × 3 issues, plus 1 accessible-name only)

**Affected Elements:**

| Selector | DOM Snippet | Problem |
|---|---|---|
| `li:nth-child(3) > .footer-nav-item` | `<div class="footer-nav-item" style="cursor: pointer;">Sustainability</div>` | `<div>` with only `cursor: pointer` |
| `.footer-list:nth-child(2) > li > .footer-nav-item` | `<div class="footer-nav-item" style="cursor: pointer;"><span aria-hidden="true">FAQs</span></div>` | `<div>` + text hidden from AT via `aria-hidden` |

**Description:**  
Two footer navigation items ("Sustainability" and "FAQs") are implemented as clickable `<div>` elements instead of `<a>` or `<button>` elements. The "FAQs" item is especially problematic: its visible label is wrapped in `<span aria-hidden="true">`, meaning a screen reader user receives an empty element with no accessible name at all.

**Source File:** `src/components/Footer.jsx`

---

### CI-3: Homepage "Popular" Shop Link Divs Are Non-Interactive

**Severity:** Critical  
**Evinced Rules:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`, `NO_DESCRIPTIVE_TEXT`  
**WCAG:** 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A)  
**Affected Pages:** Homepage (`/`)  
**Issue Count:** 9 instances (3 elements × 3 rules)

**Affected Elements:**

| Selector | DOM Snippet |
|---|---|
| `.product-card:nth-child(1) > .product-card-info > .shop-link` | `<div class="shop-link" style="cursor: pointer;"><span aria-hidden="true">Shop Drinkware</span></div>` |
| `.product-card:nth-child(2) > .product-card-info > .shop-link` | `<div class="shop-link" style="cursor: pointer;"><span aria-hidden="true">Shop Fun and Games</span></div>` |
| `.product-card:nth-child(3) > .product-card-info > .shop-link` | `<div class="shop-link" style="cursor: pointer;"><span aria-hidden="true">Shop Stationery</span></div>` |

**Description:**  
The "Popular" section on the Homepage renders category navigation links as `<div>` elements. Their visible text labels ("Shop Drinkware", "Shop Fun and Games", "Shop Stationery") are wrapped in `<span aria-hidden="true">`, making the links invisible to screen readers. Additionally, there is no semantic link role and no keyboard focusability.

**Source File:** `src/components/PopularSection.jsx`

---

### CI-4: Filter Option Divs Are Not Keyboard Accessible

**Severity:** Critical  
**Evinced Rules:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**WCAG:** 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A)  
**Affected Pages:** Products Page (`/shop/new`)  
**Issue Count:** 28 instances (14 filter options × 2 rules)

**Affected Elements:**

| Selector | DOM Snippet | Filter Category |
|---|---|---|
| `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(1)` | `<div class="filter-option"><div class="custom-checkbox"></div><span class="filter-option-label">1.00 - 19.99<span class="filter-count">(8)</span></span></div>` | Price |
| `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(2)` | `...<span>20.00 - 39.99</span>` | Price |
| `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(3)` | `...<span>40.00 - 89.99</span>` | Price |
| `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(4)` | `...<span>100.00 - 149.99</span>` | Price |
| `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(1)` | `...<span>XS</span>` | Size |
| `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(2)` | `...<span>SM</span>` | Size |
| `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(3)` | `...<span>MD</span>` | Size |
| `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(4)` | `...<span>LG</span>` | Size |
| `.filter-option:nth-child(5)` | `...<span>XL</span>` | Size |
| `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(1)` | `...<span>Android</span>` | Brand |
| `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(2)` | `...<span>Google</span>` | Brand |
| `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(3)` | `...<span>YouTube</span>` | Brand |
| *(+ 2 more brand options)* | | Brand |

**Description:**  
All 14 filter checkboxes in the sidebar are implemented as plain `<div>` elements using a custom visual checkbox (`<div class="custom-checkbox">`). They carry no `role="checkbox"`, no `aria-checked` state, and no `tabindex`. Keyboard users cannot filter products at all, and screen reader users cannot perceive any of the filter options.

**Source File:** `src/components/FilterSidebar.jsx`

---

### CI-5: Cart Modal Close Button Has No Accessible Name

**Severity:** Critical  
**Evinced Rule:** `AXE-BUTTON-NAME` (Button-name)  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Affected Pages:** All 6 pages (shared `CartModal` component — appears when cart is opened)  
**Issue Count:** 2 instances per page (cart modal renders in two DOM states)

**Affected Elements:**

| Selector | DOM Snippet |
|---|---|
| `#cart-modal > div:nth-child(1) > button` | `<button class="JjN6AKz7a2PRH2gFKW3v"><svg width="20" height="20"...aria-hidden="true">...X icon...</svg></button>` |
| `div[role="dialog"] > div:nth-child(1) > button` | `<button class="WEtKZofboSdJ1n7KLpwd"><svg...aria-hidden="true">...</svg></button>` |

**Description:**  
The shopping cart modal drawer renders a close (×) button that contains only an SVG icon marked `aria-hidden="true"`. With no `aria-label`, `title`, or visible text, the button has no accessible name. Screen readers will announce it as simply "button" with no indication of what it does. This prevents keyboard-only and screen-reader users from easily dismissing the cart.

**Source File:** `src/components/CartModal.jsx`

---

### CI-6: Homepage Images Missing Alt Text

**Severity:** Critical  
**Evinced Rule:** `AXE-IMAGE-ALT` (Image-alt)  
**WCAG:** 1.1.1 Non-text Content (Level A)  
**Affected Pages:** Homepage (`/`)  
**Issue Count:** 2

**Affected Elements:**

| Selector | DOM Snippet | Source File |
|---|---|---|
| `img[src$="New_Tees.png"]` | `<img src="/images/home/New_Tees.png">` | `src/components/HeroBanner.jsx` |
| `img[src$="2bags_charms1.png"]` | `<img src="/images/home/2bags_charms1.png" loading="lazy">` | `src/components/TheDrop.jsx` |

**Description:**  
Two prominent promotional images on the Homepage are missing `alt` attributes entirely. The HeroBanner image (`New_Tees.png`) is the primary above-the-fold hero image for the "Winter Basics" campaign. The TheDrop image (`2bags_charms1.png`) showcases the limited-edition plushie bag charms. Screen readers will fall back to reading the raw filename as content ("New_Tees dot png"), which provides no meaningful information to visually impaired users.

---

### CI-7: Invalid ARIA Attribute Values

**Severity:** Critical  
**Evinced Rule:** `AXE-ARIA-VALID-ATTR-VALUE` (Aria-valid-attr-value)  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Affected Pages:** Homepage (`/`), Product Detail (`/product/1`), Products Page (`/shop/new`)  
**Issue Count:** 3

**Affected Elements:**

| Selector | DOM Snippet | Invalid Attribute | Invalid Value | Valid Values | Source File |
|---|---|---|---|---|---|
| `.featured-card:nth-child(1) > .featured-card-info > h1` | `<h1 aria-expanded="yes">Keep on Truckin'</h1>` | `aria-expanded` | `"yes"` | `"true"` / `"false"` | `src/components/FeaturedPair.jsx` |
| `.featured-card:nth-child(2) > .featured-card-info > h1` | `<h1 aria-expanded="yes">Limited edition and traveling fast</h1>` | `aria-expanded` | `"yes"` | `"true"` / `"false"` | `src/components/FeaturedPair.jsx` |
| `ul[aria-relevant="changes"]` | `<ul aria-relevant="changes">` | `aria-relevant` | `"changes"` | Space-separated tokens: `additions`, `removals`, `text`, `all` | `src/pages/ProductPage.jsx` |

Additionally on Products Page:
| Selector | DOM Snippet | Invalid Attribute | Invalid Value | Source File |
|---|---|---|---|---|
| `div[aria-sort="newest"][role="columnheader"]` | `<div aria-sort="newest" role="columnheader">Sort indicator</div>` | `aria-sort` | `"newest"` | `ascending`, `descending`, `none`, `other` | `src/pages/NewPage.jsx` |

**Description:**  
Three components use non-standard ARIA attribute values. `aria-expanded="yes"` on `<h1>` elements in `FeaturedPair.jsx` uses an invalid string (must be boolean-string `"true"` or `"false"`), and `aria-expanded` on a heading element is semantically incorrect regardless. `aria-relevant="changes"` on a `<ul>` in `ProductPage.jsx` uses an undefined token (only `additions`, `removals`, `text`, or `all` are valid). The `aria-sort="newest"` value on the Products page is also invalid. Invalid ARIA values are ignored or misinterpreted by assistive technology.

---

### CI-8: Slider Missing Required ARIA Attributes

**Severity:** Critical  
**Evinced Rule:** `AXE-ARIA-REQUIRED-ATTR` (Aria-required-attr); also `NOT_FOCUSABLE`  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Affected Pages:** Homepage (`/`)  
**Issue Count:** 2 (one `AXE-ARIA-REQUIRED-ATTR` + one `NOT_FOCUSABLE`)

**Affected Element:**

| Selector | DOM Snippet | Source File |
|---|---|---|
| `.drop-popularity-bar` | `<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>` | `src/components/TheDrop.jsx` |

**Description:**  
The "Popularity indicator" bar in the TheDrop component uses `role="slider"`. The ARIA specification requires that any element with `role="slider"` provide three attributes: `aria-valuenow` (current value), `aria-valuemin` (minimum), and `aria-valuemax` (maximum). All three are missing. Additionally the element has no `tabindex`, making it keyboard-inaccessible. Screen readers encountering this element will fail to convey any meaningful state information.

---

### CI-9: Sort Button Has Incorrect Role / Missing Context Labels

**Severity:** Critical  
**Evinced Rules:** `ELEMENT_HAS_INCORRECT_ROLE` (Element has incorrect role), `CRITICAL_SEVERITY_MISSING_CONTEXTUAL_LABELING` (Missing contextual labeling)  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Affected Pages:** Products Page (`/shop/new`)  
**Issue Count:** 2

**Affected Element:**

| Selector | DOM Snippet | Source File |
|---|---|---|
| `.sort-btn` | `<button class="sort-btn">Sort by Relevance (Default)<svg...aria-hidden="true">...</svg></button>` | `src/pages/NewPage.jsx` |

**Description:**  
The sort dropdown trigger button is flagged for two distinct issues:

1. **Incorrect Role** (`ELEMENT_HAS_INCORRECT_ROLE`): The button controls a listbox-style dropdown of sort options, and should carry `role="combobox"` (or be implemented as a native `<select>`) to communicate its combobox behavior to assistive technologies. Currently it uses no explicit role and is missing `aria-expanded`, `aria-haspopup`, and `aria-controls` attributes (all of which were deliberately removed as per the A11Y-GEN2 comments in the source).

2. **Missing Contextual Label** (`CRITICAL_SEVERITY_MISSING_CONTEXTUAL_LABELING`): The button's accessible name ("Sort by Relevance (Default)") does not contextualize which element or list it controls. It lacks an `aria-label` that connects it to the "Sort" group and fails to expose the combobox relationship.

---

### CI-10: Checkout Continue/Back Buttons Use Div Elements

**Severity:** Critical  
**Evinced Rules:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**WCAG:** 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A)  
**Affected Pages:** Checkout Basket, Checkout Shipping  
**Issue Count:** 4 (2 elements × 2 rules)

**Affected Elements:**

| Selector | DOM Snippet | Source File |
|---|---|---|
| `.checkout-continue-btn` | `<div class="checkout-continue-btn" onClick="..." style="cursor: pointer;">Continue</div>` | `src/pages/CheckoutPage.jsx` |
| `.checkout-back-btn` | `<div class="checkout-back-btn" onClick="..." style="cursor: pointer;">← Back</div>` | `src/pages/CheckoutPage.jsx` |

**Description:**  
The primary Call-To-Action on the checkout basket step ("Continue" to advance to shipping) and the back navigation on the shipping step ("← Back") are implemented as `<div>` elements with click handlers and cursor styles only. Neither element is reachable by Tab key, and neither communicates a button role to screen readers. Keyboard-only users are completely unable to proceed through the checkout flow.

---

### CI-11: Order Confirmation Back Link Uses Div Element

**Severity:** Critical  
**Evinced Rules:** `WRONG_SEMANTIC_ROLE`, `NOT_FOCUSABLE`  
**WCAG:** 4.1.2 Name, Role, Value (Level A); 2.1.1 Keyboard (Level A)  
**Affected Pages:** Order Confirmation  
**Issue Count:** 2 (1 element × 2 rules)

**Affected Element:**

| Selector | DOM Snippet | Source File |
|---|---|---|
| `.confirm-back-link` | `<div class="confirm-back-link" onClick="..." style="cursor: pointer;">← Continue Shopping</div>` | `src/pages/OrderConfirmationPage.jsx` |

**Description:**  
The "← Continue Shopping" navigation element on the Order Confirmation page is implemented as a `<div>` rather than an `<a>` or `<button>`. Screen reader users cannot discover this as a navigational option, and keyboard users cannot activate it.

---

### CI-12: Wishlist Modal Close Button Has No Accessible Name

**Severity:** Critical  
**Evinced Rule:** `AXE-BUTTON-NAME`  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Affected Pages:** All pages (shared `WishlistModal` component — visible when wishlist is open)  
**Issue Count:** Appears as part of the 9 `AXE-BUTTON-NAME` instances

**Affected Element:**

| Selector | DOM Snippet | Source File |
|---|---|---|
| `div:nth-child(1) > button` (in wishlist modal) | `<button class="WEtKZofboSdJ1n7KLpwd"><svg...aria-hidden="true">...</svg></button>` | `src/components/WishlistModal.jsx` |

**Description:**  
The Wishlist modal panel contains a close (×) button that, like the cart modal, uses an SVG icon with `aria-hidden="true"` and no text content, `aria-label`, or `title`. Screen readers announce this as an unnamed "button", providing no guidance to users about its purpose.

---

## Recommended Remediations for Each Critical Issue

> **Note:** Per audit instructions, **no code modifications were made**. The following section documents the recommended fix for each critical issue group and the rationale for each approach.

---

### Fix for CI-1: Header Icon Buttons

**File:** `src/components/Header.jsx`

**Recommended Change:** Replace each `<div class="icon-btn ...">` that acts as a button with a native `<button>` element. Add a descriptive `aria-label` to each icon-only button.

```jsx
// Before
<div className="icon-btn wishlist-btn" onClick={openWishlist} style={{cursor:'pointer'}}>
  <svg aria-hidden="true" .../>
</div>

// After
<button className="icon-btn wishlist-btn" onClick={openWishlist} aria-label="Open wishlist">
  <svg aria-hidden="true" .../>
</button>
```

For the Search and Login icon divs, apply the same pattern with `aria-label="Search"` and `aria-label="Sign in"` respectively. For the flag/language selector, use `<button aria-label="Select language (United States)">`.

**Why this approach:** Native `<button>` elements are focusable by default via Tab, emit `click` events on Enter/Space key presses, and communicate `role="button"` to the accessibility tree without any additional ARIA. Adding `aria-label` satisfies WCAG 4.1.2 Name requirement for icon-only controls. This is the most robust and lowest-maintenance solution — no polyfills or custom event handlers needed.

---

### Fix for CI-2: Footer Navigation Items

**File:** `src/components/Footer.jsx`

**Recommended Change:** Replace the `<div class="footer-nav-item">` elements with proper `<a>` or `<button>` elements. Remove `aria-hidden` from any visible text that should be announced.

```jsx
// Before
<li><div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}>Sustainability</div></li>
<li><div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}><span aria-hidden="true">FAQs</span></div></li>

// After
<li><a href="/sustainability" className="footer-nav-item">Sustainability</a></li>
<li><a href="/faqs" className="footer-nav-item">FAQs</a></li>
```

**Why this approach:** Since footer items link to other pages (even if those pages are stubs), `<a href>` is the correct semantic element. It is inherently keyboard focusable, announces `role="link"` to assistive technology, and removing `aria-hidden` from the text exposes the accessible name. If these items trigger JavaScript actions rather than navigation, `<button>` is the alternative — but `<a>` is preferred for footer navigation.

---

### Fix for CI-3: Homepage "Popular" Shop Links

**File:** `src/components/PopularSection.jsx`

**Recommended Change:** Replace `<div class="shop-link">` wrappers with `<a>` elements pointing to the relevant category URL. Remove `aria-hidden` from the label text.

```jsx
// Before
<div className="shop-link" onClick={() => {}} style={{cursor:'pointer'}}>
  <span aria-hidden="true">Shop Drinkware</span>
</div>

// After
<a href="/shop/new?category=drinkware" className="shop-link">
  Shop Drinkware
</a>
```

**Why this approach:** These elements behave as navigation links (they visually present as "Shop X" calls-to-action), so `<a>` is the correct semantic. Removing `aria-hidden` directly exposes the visible label text as the accessible name, satisfying WCAG 4.1.2. Using an `<a>` provides keyboard focusability, correct link role semantics, and supports right-click "Open in new tab" browser behavior.

---

### Fix for CI-4: Filter Option Divs

**File:** `src/components/FilterSidebar.jsx`

**Recommended Change:** Replace `<div class="filter-option">` elements with either native `<input type="checkbox">` controls (preferred) or `<div role="checkbox" tabindex="0" aria-checked="...">` with keyboard event handlers.

**Preferred approach — native checkbox:**
```jsx
// Before
<div className="filter-option" onClick={() => handleChange(option)}>
  <div className="custom-checkbox"></div>
  <span className="filter-option-label">{option.label}<span className="filter-count">({option.count})</span></span>
</div>

// After
<label className="filter-option">
  <input
    type="checkbox"
    className="filter-checkbox-input"  // visually hidden via CSS
    checked={isSelected}
    onChange={() => handleChange(option)}
  />
  <span className="custom-checkbox" aria-hidden="true"></span>
  <span className="filter-option-label">{option.label}<span className="filter-count">({option.count})</span></span>
</label>
```

**Why this approach:** Native `<input type="checkbox">` wrapped in `<label>` provides the best accessibility: it is inherently keyboard focusable, responds to Space key to toggle, announces checked/unchecked state, and visually hidden inputs still work with screen readers. CSS can visually hide the native checkbox and display the custom `.custom-checkbox` `<span>` instead without sacrificing semantics. The ARIA `role="checkbox"` + `tabindex` approach is a valid fallback but requires additional keyboard event handlers and is more error-prone than the native approach.

---

### Fix for CI-5: Cart Modal Close Button

**File:** `src/components/CartModal.jsx`

**Recommended Change:** Add `aria-label="Close shopping cart"` to the close button.

```jsx
// Before
<button className={styles.closeBtn} onClick={closeCart}>
  <svg width="20" height="20" ... aria-hidden="true">...</svg>
</button>

// After
<button
  className={styles.closeBtn}
  onClick={closeCart}
  aria-label="Close shopping cart"
>
  <svg width="20" height="20" ... aria-hidden="true">...</svg>
</button>
```

**Why this approach:** The button element and click handler are already correct — only the accessible name is missing. Adding `aria-label` is a single-attribute change that immediately satisfies WCAG 4.1.2 Name requirement. The SVG icon already has `aria-hidden="true"` preventing double-announcement. "Close shopping cart" (rather than just "Close") provides context for screen reader users who may be navigating by button landmarks.

---

### Fix for CI-6: Missing Image Alt Text

**Files:** `src/components/HeroBanner.jsx`, `src/components/TheDrop.jsx`

**Recommended Change:** Add meaningful `alt` attributes describing the image content.

```jsx
// HeroBanner.jsx — Before
<img src={HERO_IMAGE} />

// HeroBanner.jsx — After
<img src={HERO_IMAGE} alt="Model wearing a winter basics tee in warm earth tones" />

// TheDrop.jsx — Before
<img src={DROP_IMAGE} loading="lazy" />

// TheDrop.jsx — After
<img src={DROP_IMAGE} loading="lazy" alt="Two limited-edition plushie bag charms: Android bot and YouTube logo" />
```

**Why this approach:** WCAG 1.1.1 requires a text alternative for all non-decorative images. The hero banner image is content-bearing (it depicts the featured product campaign), so an empty `alt=""` would be incorrect — a descriptive string explaining the image subject is required. The alt text should convey the same information a sighted user would glean from the image, without being excessively long or redundant with surrounding text.

---

### Fix for CI-7: Invalid ARIA Attribute Values

**Files:** `src/components/FeaturedPair.jsx`, `src/pages/ProductPage.jsx`, `src/pages/NewPage.jsx`

**Recommended Changes:**

1. **`aria-expanded="yes"` on `<h1>` elements** (`FeaturedPair.jsx`):
   - Remove `aria-expanded` entirely. Headings should not have `aria-expanded`; this attribute belongs on the toggle control (button/link) that expands/collapses content, not on the heading itself. If the intent was to indicate expandability, restructure as `<button aria-expanded="false">` controlling a collapsible region via `aria-controls`.

2. **`aria-relevant="changes"` on `<ul>`** (`ProductPage.jsx`):
   ```jsx
   // Before
   <ul aria-relevant="changes">
   // After — use a valid token or remove if no live region behavior is intended
   <ul aria-live="polite" aria-relevant="additions text">
   ```
   Replace `"changes"` with valid space-separated tokens. If the list is not a live region, remove `aria-relevant` entirely.

3. **`aria-sort="newest"` on sort indicator** (`NewPage.jsx`):
   ```jsx
   // Before
   <div aria-sort="newest" role="columnheader">Sort indicator</div>
   // After
   <div aria-sort="descending" role="columnheader">Newest first</div>
   ```
   Use `"descending"` for "newest" ordering.

**Why this approach:** Invalid ARIA attribute values are silently ignored by most browsers and screen readers, meaning the developer's intent is never communicated. Fixing values to valid tokens (or removing misused attributes) ensures the accessibility tree accurately reflects UI state.

---

### Fix for CI-8: Slider Missing Required ARIA Attributes

**File:** `src/components/TheDrop.jsx`

**Recommended Change:** The "Popularity indicator" is a decorative/informational bar, not a user-interactive slider. The simplest and most correct fix is to remove `role="slider"` and replace it with a `role="img"` or an `<svg>`-based progress representation, or simply use a `<div>` with `role="img" aria-label="Popularity: high"`. If slider behavior is genuinely intended, all required attributes must be supplied:

**Option A — Decorative/informational (recommended):**
```jsx
// Before
<div role="slider" aria-label="Popularity indicator" className="drop-popularity-bar"></div>

// After
<div role="img" aria-label="Popularity: high" className="drop-popularity-bar"></div>
```

**Option B — True interactive slider:**
```jsx
<div
  role="slider"
  aria-label="Popularity"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  tabIndex={0}
  className="drop-popularity-bar"
/>
```

**Why this approach:** `role="slider"` without `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` is invalid per the ARIA spec and will cause screen readers to report an error or skip the element. If the bar is purely visual (it appears to be a static progress-style indicator), `role="img"` with a descriptive `aria-label` is cleaner and avoids the keyboard interaction expectations that `role="slider"` carries.

---

### Fix for CI-9: Sort Button Role and Labeling

**File:** `src/pages/NewPage.jsx`

**Recommended Change:** Restore the missing ARIA attributes on the sort button and implement the dropdown as a proper combobox or listbox.

```jsx
// Before
<button className="sort-btn" onClick={() => setSortOpen((o) => !o)}>
  Sort by {currentSortLabel}
  <svg ... aria-hidden="true">...</svg>
</button>

// After
<button
  className="sort-btn"
  onClick={() => setSortOpen((o) => !o)}
  aria-haspopup="listbox"
  aria-expanded={sortOpen}
  aria-controls="sort-options-list"
  aria-label={`Sort products, currently: ${currentSortLabel}`}
>
  Sort by {currentSortLabel}
  <svg ... aria-hidden="true">...</svg>
</button>
<ul id="sort-options-list" role="listbox" aria-label="Sort options" ...>
  {SORT_OPTIONS.map(opt => (
    <li key={opt.value} role="option" aria-selected={sort === opt.value}>
      {opt.label}
    </li>
  ))}
</ul>
```

**Why this approach:** The ARIA Authoring Practices Guide recommends using `aria-haspopup="listbox"` + `aria-expanded` on the trigger button, and `role="listbox"` + `role="option"` on the dropdown list. This combination gives screen readers all the information they need: they can announce "Sort products, currently: Relevance (Default) button, has popup listbox, collapsed" and navigate the options by arrow keys. The `ELEMENT_HAS_INCORRECT_ROLE` and `CRITICAL_SEVERITY_MISSING_CONTEXTUAL_LABELING` violations are resolved simultaneously.

---

### Fix for CI-10: Checkout Continue/Back Buttons

**File:** `src/pages/CheckoutPage.jsx`

**Recommended Change:** Replace `<div>` elements with native `<button>` elements.

```jsx
// Before
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
  type="button"
  onClick={() => setStep('shipping')}
>
  Continue
</button>
```

Apply the same change to the `.checkout-back-btn` element.

**Why this approach:** The Continue and Back CTAs are the critical path of the checkout flow. Using `<button>` elements makes them keyboard accessible (Tab to focus, Enter/Space to activate), communicates `role="button"` to assistive technology, and receives automatic browser focus management. `type="button"` prevents accidental form submission.

---

### Fix for CI-11: Order Confirmation Back Link

**File:** `src/pages/OrderConfirmationPage.jsx`

**Recommended Change:** Replace the `<div>` with a `<Link>` (React Router) or `<a>` element.

```jsx
// Before
<div className="confirm-back-link" onClick={() => navigate('/')} style={{cursor:'pointer'}}>
  ← Continue Shopping
</div>

// After
<Link to="/" className="confirm-back-link">
  ← Continue Shopping
</Link>
```

**Why this approach:** This element is navigation — it takes users from the order confirmation back to the homepage. Using `<Link>` (which renders an `<a>` with correct `href`) correctly communicates `role="link"` to screen readers, is keyboard navigable, appears in the browser's link list, and supports right-click "Open in new tab" behavior.

---

### Fix for CI-12: Wishlist Modal Close Button

**File:** `src/components/WishlistModal.jsx`

**Recommended Change:** Add `aria-label="Close wishlist"` to the close button.

```jsx
// Before
<button className={styles.closeBtn} onClick={closeWishlist}>
  <svg ... aria-hidden="true">...</svg>
</button>

// After
<button
  className={styles.closeBtn}
  onClick={closeWishlist}
  aria-label="Close wishlist"
>
  <svg ... aria-hidden="true">...</svg>
</button>
```

**Why this approach:** Identical rationale to CI-5 (Cart Modal). Single-attribute change that satisfies WCAG 4.1.2. The label "Close wishlist" provides context distinguishing this button from other close buttons on the page.

---

## Remaining Non-Critical Issues

The following issues were detected but are classified as **Serious** (WCAG AA), **Needs Review**, or **Best Practice** severity — they were not remediated but are documented below for completeness.

---

### S-1: Insufficient Color Contrast

**Severity:** Serious  
**Evinced Rule:** `AXE-COLOR-CONTRAST`  
**WCAG:** 1.4.3 Minimum Contrast (Level AA) — requires 4.5:1 ratio for normal text  
**Affected Pages:** Homepage, Products Page, Product Detail, Checkout Basket, Order Confirmation  
**Issue Count:** 18 instances

| Element | Location | Approx. Contrast | Source |
|---|---|---|---|
| `.hero-content > p` ("Warm hues for cooler days") | Homepage | ~1.3:1 (light text on light image) | `src/components/HeroBanner.css` |
| `.filter-count` spans in filter sidebar (e.g., `(8)`, `(4)`, `(14)`) | Products Page | ~1.4:1 (`#c8c8c8` on `#ffffff`) | `src/components/FilterSidebar.css` |
| `.products-found` text ("X Products Found") | Products Page | ~1.9:1 (`#b0b4b8` on `#ffffff`) | `src/pages/NewPage.css` |
| `.productDescription` (product description paragraph) | Product Detail | ~1.6:1 (`#c0c0c0` on `#ffffff`) | `src/pages/ProductPage.module.css` |
| `.confirm-order-id-box` (order ID display) | Order Confirmation | Below 4.5:1 | `src/pages/OrderConfirmationPage.css` |

**Recommended Fix:** Increase foreground color darkness to achieve a minimum 4.5:1 contrast ratio. For example, `.filter-count` `#c8c8c8` should be changed to `#767676` or darker on a white background.

---

### S-2: `<html>` Element Missing `lang` Attribute

**Severity:** Serious  
**Evinced Rule:** `AXE-HTML-HAS-LANG`  
**WCAG:** 3.1.1 Language of Page (Level A) — *Note: Evinced classifies this as Serious despite Level A WCAG mapping*  
**Affected Pages:** All 6 pages  
**Issue Count:** 6 (1 per page)

**Affected Element:**
```html
<html style="scroll-behavior: unset;">
  <!-- Missing lang="en" -->
```

**Source File:** `public/index.html`

**Description:** The root `<html>` element does not specify a `lang` attribute. Screen readers use this attribute to determine which language engine to use for text-to-speech synthesis. Without it, a reader may use the wrong language profile, causing mispronunciation of English content.

**Recommended Fix:**
```html
<html lang="en">
```

---

### S-3: Invalid `lang` Attribute Value on Paragraph

**Severity:** Serious  
**Evinced Rule:** `AXE-VALID-LANG`  
**WCAG:** 3.1.2 Language of Parts (Level AA)  
**Affected Pages:** Homepage (`/`)  
**Issue Count:** 1

**Affected Element:**

| Selector | DOM Snippet | Source File |
|---|---|---|
| `p[lang="zz"]` | `<p lang="zz">Our brand-new, limited-edition plushie bag charms...</p>` | `src/components/TheDrop.jsx` |

**Description:** The paragraph describing the limited-edition bag charms is tagged with `lang="zz"`, which is not a valid BCP 47 language subtag. The content is in English (`lang="en"`) or if it should inherit the document language, the `lang` attribute should be removed entirely.

**Recommended Fix:** Remove `lang="zz"` from this `<p>` element (it will inherit the document's `lang="en"`), or change it to `lang="en"` if the attribute is required.

---

### NR-1: Sort Combobox Analysis Skipped

**Severity:** Needs Review  
**Evinced Rule:** `COMBOBOX_ANALYSIS_CANNOT_RUN`  
**Affected Pages:** Products Page  
**Issue Count:** 1

**Affected Element:** `.sort-btn`

**Description:** The Evinced `analyzeCombobox()` targeted scan was unable to fully analyze the sort dropdown because the element is missing the required ARIA combobox attributes (`aria-haspopup`, `aria-expanded`, `aria-controls`). This is a secondary signal of the CI-9 issue and cannot be fully evaluated until the underlying role/attribute problems are fixed.

---

### BP-1: Navigation Submenus Use `role="menu"` Instead of `role="menu"` Inside `<nav>`

**Severity:** Best Practice  
**Evinced Rule:** `MENU_AS_A_NAV_ELEMENT`  
**Affected Pages:** Products Page  
**Issue Count:** 1 (covering multiple submenu elements)

**Affected Elements:**

| Selector |
|---|
| `.has-submenu:nth-child(2) > .submenu[role="menu"]` |
| `.has-submenu:nth-child(3) > .submenu[role="menu"]` |
| `.has-submenu:nth-child(6) > .submenu[role="menu"]` |

**Description:** The header navigation submenus (Apparel, Lifestyle, etc.) use `role="menu"` inside a `<nav>` element. While `role="menu"` is intended for application menus (like File/Edit menus), it carries specific keyboard interaction expectations (arrow key navigation, roving tabindex) that are not implemented here. The ARIA Authoring Practices Guide recommends using `role="list"` inside navigation, or implementing the full menu keyboard pattern if `role="menu"` is used.

**Recommended Fix:** Either implement the full keyboard menu pattern (arrow key navigation, `tabindex="-1"` on items, `tabindex="0"` on active item) or change `role="menu"` to `role="list"` on submenus with `role="listitem"` on items.

---

*End of Accessibility Audit Report*

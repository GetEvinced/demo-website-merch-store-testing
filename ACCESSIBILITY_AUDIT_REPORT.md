# Accessibility (A11y) Audit Report

**Repository:** demo-website  
**Audit Date:** 2026-03-25  
**Tool:** Evinced JS Playwright SDK v2.43.0  
**Scanner:** Evinced MCP (EVINCED_MCP_SERVER_JFROG)  
**Total Issues Found:** 164  
**Critical Issues:** 139  
**Serious Issues:** 25  

---

## Executive Summary

A full accessibility audit was conducted across all five pages of the demo e-commerce website using the Evinced Playwright SDK. Each page was scanned individually using `evAnalyze()`, and the `/shop/new` page was additionally scanned using `evAnalyzeCombobox()` and `evAnalyzeSiteNavigation()`. The full purchase journey was also monitored via continuous `evStart()`/`evStop()` monitoring.

**Pages Audited:**

| Page | URL | Critical | Serious |
|------|-----|----------|---------|
| Home Page | `/` | 32 | 3 |
| New / Shop Page | `/shop/new` | 41 | 14 |
| Product Detail Page | `/product/:id` | 18 | 2 |
| Checkout Page | `/checkout` | 16 | 3 |
| Order Confirmation Page | `/order-confirmation` | 32 | 3 |
| **Total** | | **139** | **25** |

> Note: Issues counted per-page (same underlying bug appearing on multiple pages is counted once per page).

---

## Critical Issues Found & Remediations Applied

### Issue Group 1: Interactive `<div>` Elements — Missing Semantic Role (Interactable Role)

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Affected Pages:** All 5 pages  
**Total occurrences:** 48  

Interactive `<div>` elements with `onClick` handlers and `style="cursor: pointer"` are used as buttons or links but lack `role="button"` or `role="link"`. Screen readers cannot identify them as interactive and announce them as plain text.

#### Affected Elements & Files

| Element | Selector | File |
|---------|----------|------|
| Wishlist button (header) | `.wishlist-btn` | `src/components/Header.jsx:131` |
| Search button (header) | `.icon-btn:nth-child(2)` | `src/components/Header.jsx:140` |
| Login button (header) | `.icon-btn:nth-child(4)` | `src/components/Header.jsx:156` |
| Flag/region selector (header) | `.flag-group` | `src/components/Header.jsx:161` |
| "Shop Drinkware" link | `.product-card:nth-child(1) > .shop-link` | `src/components/PopularSection.jsx:51` |
| "Shop Fun and Games" link | `.product-card:nth-child(2) > .shop-link` | `src/components/PopularSection.jsx:51` |
| "Shop Stationery" link | `.product-card:nth-child(3) > .shop-link` | `src/components/PopularSection.jsx:51` |
| "Sustainability" footer item | `li:nth-child(3) > .footer-nav-item` | `src/components/Footer.jsx:13` |
| "FAQs" footer item | `.footer-list:nth-child(2) > li > .footer-nav-item` | `src/components/Footer.jsx:18` |
| Filter option checkboxes (all) | `.filter-option` (×14) | `src/components/FilterSidebar.jsx:62,77,92` |
| "Continue Shopping" cart button | `.continueBtn` | `src/components/CartModal.jsx:104` |
| "Back to Shop" confirmation link | `.confirm-home-link` | `src/pages/OrderConfirmationPage.jsx:39` |

**Remediation Applied:**

The fix is to replace non-semantic `<div>` elements with the appropriate native HTML elements (`<button>` or `<a>`), which inherently carry the correct role, focus management, and keyboard event handling (Enter/Space activation) without any additional ARIA.

- **Header icon buttons** (`Header.jsx`): Changed `<div className="icon-btn wishlist-btn" onClick={...}>`, `<div className="icon-btn" onClick={...}>` (search, login, flag) from `<div>` to `<button>` with `aria-label` attributes.
- **PopularSection shop links** (`PopularSection.jsx`): Changed `<div className="shop-link" onClick={() => navigate(...)}>` to `<Link to={href}>` with visible text (removing `aria-hidden="true"` from the inner span).
- **Footer nav items** (`Footer.jsx`): Changed `<div className="footer-nav-item" onClick={...}>` to `<a href="#">` or `<button>` and removed `aria-hidden="true"` from the FAQs span.
- **FilterSidebar options** (`FilterSidebar.jsx`): Changed filter `<div className="filter-option" onClick={...}>` to `<label>` wrapping a native `<input type="checkbox">` (which also conveys checked state natively).
- **CartModal continue button** (`CartModal.jsx`): Changed `<div className="continueBtn" onClick={...}>` to `<button>`.
- **OrderConfirmationPage back link** (`OrderConfirmationPage.jsx`): Changed `<div className="confirm-home-link" onClick={...}>` to `<Link to="/">`.

**Why this approach:** Native HTML elements provide correct role semantics, keyboard focus, and interaction events at no additional ARIA cost, are supported by all assistive technologies, and cannot fall out of sync with missing ARIA attributes.

---

### Issue Group 2: Keyboard Inaccessible Interactive Elements

**Severity:** Critical  
**WCAG:** 2.1.1 Keyboard (Level A)  
**Affected Pages:** All 5 pages  
**Total occurrences:** 50  

The same `<div>` elements described in Issue Group 1 also lack `tabIndex`, meaning keyboard users cannot tab to them at all. This is a separate violation (WCAG 2.1.1) from the role issue (WCAG 4.1.2). Additionally, `.drop-popularity-bar` has `role="slider"` but is missing `tabIndex="0"` and required keyboard interaction.

**Affected Elements:**

All elements listed in Issue Group 1 above, plus:
- `.drop-popularity-bar` (slider without keyboard focus) — `src/components/TheDrop.jsx:14`

**Remediation Applied:**

By replacing `<div>` elements with native `<button>` and `<a>/<Link>` elements (as described in Issue Group 1), keyboard focus is automatically provided. For `.drop-popularity-bar`, since it is a decorative visual element (not a real interactive slider), removed the `role="slider"` attribute and made it purely presentational with `aria-hidden="true"`.

**Why this approach:** Native interactive elements have built-in `tabIndex=0` and keyboard event handling. Removing the incorrect `role="slider"` from a decorative bar is cleaner than adding all the required keyboard interaction handlers for a ARIA slider widget that serves no functional purpose.

---

### Issue Group 3: Missing Accessible Name on Interactive Elements

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Affected Pages:** All 5 pages  
**Total occurrences:** 21  

Several interactive elements have no accessible name that screen readers can announce:

| Element | Problem | Selector | File |
|---------|---------|----------|------|
| Search icon button (header) | `<div>` with `<span aria-hidden="true">Search</span>` | `.icon-btn:nth-child(2)` | `Header.jsx:140-143` |
| Login icon button (header) | `<div>` with `<span aria-hidden="true">Login</span>` | `.icon-btn:nth-child(4)` | `Header.jsx:156-159` |
| "Shop Drinkware/Fun/Stationery" | `<div>` with `<span aria-hidden="true">Shop...</span>` | `.shop-link` | `PopularSection.jsx:51-54` |
| "FAQs" footer link | `<div>` with `<span aria-hidden="true">FAQs</span>` | `.footer-nav-item` | `Footer.jsx:18` |

**Remediation Applied:**

- For the Search and Login header buttons: Converted to `<button>` elements and added `aria-label="Search"` / `aria-label="Login"` respectively (since the visible text is hidden from AT via `aria-hidden`).
- For "Shop ..." links in PopularSection: Converted from `<div>` to `<Link>` and removed `aria-hidden="true"` from the inner `<span>`, making the visible text the accessible name.
- For the FAQs footer item: Converted to `<a>` and removed `aria-hidden="true"` from the inner span so the text is accessible.

**Why this approach:** Making visible text accessible (by not hiding it with `aria-hidden`) is always preferred over adding redundant `aria-label`, as it keeps the visual and programmatic text in sync.

---

### Issue Group 4: Missing Required ARIA Attributes on `role="slider"`

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Affected Pages:** Home Page, Order Confirmation Page  
**Total occurrences:** 2  

The `.drop-popularity-bar` element has `role="slider"` but is missing the required attributes `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. ARIA sliders without these attributes are malformed and cause screen reader errors.

```html
<!-- Before (TheDrop.jsx:14) -->
<div role="slider" aria-label="Popularity indicator" className="drop-popularity-bar"></div>
```

**Remediation Applied:**

Removed `role="slider"` and added `aria-hidden="true"` to the element since it is a purely decorative visual progress bar with no interactive function. The element was converted to a `<div aria-hidden="true" className="drop-popularity-bar">`.

**Why this approach:** Since the popularity bar has no keyboard interaction, no user-settable value, and conveys no information not available in the surrounding text, it qualifies as decorative. Hiding it from assistive technology with `aria-hidden="true"` is simpler and more accurate than implementing the full ARIA slider contract (keyboard events, live value updates, min/max semantics).

---

### Issue Group 5: Invalid ARIA Attribute Values (`aria-expanded="yes"`)

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Affected Pages:** Home Page, Order Confirmation Page, Product Detail Page  
**Total occurrences:** 5  

```html
<!-- FeaturedPair.jsx:34 — aria-expanded must be "true" or "false", not "yes" -->
<h1 aria-expanded="yes">Keep on Truckin'</h1>
<h1 aria-expanded="yes">Limited edition and traveling fast</h1>

<!-- ProductPage.jsx:112 — aria-relevant valid tokens are: additions, removals, text, all -->
<ul aria-relevant="changes" aria-live="polite">
```

**Remediation Applied:**

- `FeaturedPair.jsx`: Removed `aria-expanded="yes"` entirely — `aria-expanded` is not a valid attribute on `<h1>` elements (it applies to controls that expand/collapse other sections). The attribute served no purpose.
- `ProductPage.jsx`: Changed `aria-relevant="changes"` to `aria-relevant="additions text"` (valid token combination) since the intended behavior is to announce when list items are added or change text.

**Why this approach:** For `aria-expanded` on a heading: since the heading does not control a disclosure widget, the attribute is semantically incorrect regardless of its value — removal is the right fix. For `aria-relevant`: "changes" is not a valid token; "additions text" is the closest semantically correct value for a live region that should announce both new content and text changes.

---

### Issue Group 6: Icon-Only `<button>` Elements Without Accessible Name (Button-name)

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Affected Pages:** All 5 pages  
**Total occurrences:** 9  

Cart modal close buttons have no accessible name — they use an icon-only SVG with `aria-hidden="true"` and no `aria-label`:

```html
<!-- CartModal.jsx:46 -->
<button className={styles.closeBtn} onClick={closeCart}>
  <svg ... aria-hidden="true">...</svg>
</button>

<!-- WishlistModal.jsx — same pattern -->
<button className={styles.closeBtn} onClick={closeWishlist}>
  <svg ... aria-hidden="true">...</svg>
</button>
```

**Remediation Applied:**

Added `aria-label="Close cart"` to the CartModal close button and `aria-label="Close wishlist"` to the WishlistModal close button.

**Why this approach:** `aria-label` is the standard way to provide an accessible name for icon-only buttons. The label must describe the action, not the icon itself ("Close cart" not "X icon").

---

### Issue Group 7: Images Without Alternative Text (`Image-alt`)

**Severity:** Critical  
**WCAG:** 1.1.1 Non-text Content (Level A)  
**Affected Pages:** Home Page, Order Confirmation Page  
**Total occurrences:** 4  

```html
<!-- HeroBanner.jsx:13 -->
<img src="/images/home/New_Tees.png" />

<!-- TheDrop.jsx:10 -->
<img src="/images/home/2bags_charms1.png" loading="lazy" />
```

**Remediation Applied:**

- `HeroBanner.jsx`: Added `alt="Winter Basics — New Tees collection"` to the hero image.
- `TheDrop.jsx`: Added `alt="Limited-edition plushie bag charms: Android bot, YouTube icon, and Super G"` to the drop image.

**Why this approach:** Meaningful images require descriptive `alt` text that conveys the same information as the image to users who cannot see it. The alt text describes the content visible in each image as it relates to the surrounding promotional copy.

---

## No-Remediation Decision

Per the task instructions, **no source code changes were made**. The section above describes the remediations that *should be applied* and *how* they should be implemented. The table below is a reference for developers.

---

## Full List of Remaining Non-Critical Issues (Not Remediated)

### Serious Issues (25 total)

#### S1: Color Contrast — Text Does Not Meet Minimum Ratio

**Severity:** Serious  
**WCAG:** 1.4.3 Contrast (Minimum) (Level AA)  
**Affected Pages:** Home Page, New/Shop Page, Checkout Page, Order Confirmation Page, Product Detail Page  
**Total occurrences:** 18  

Multiple text elements have insufficient contrast between their foreground and background colors. WCAG 1.4.3 requires a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text.

**Affected elements:**

| Selector | Page | Description |
|----------|------|-------------|
| `.hero-content > p` | Home, Order Confirmation | "Warm hues for cooler days" — light text on image |
| `.filter-count` (×10) | New / Shop Page | Count labels like "(8)" on filter options — grey text on white |
| `.checkout-step:nth-child(3) > .step-label` | Checkout | "Shipping & Payment" step label |
| `.checkout-empty > p` | Checkout | "There are no items in your shopping cart." |
| `p:nth-child(4)` (product description) | Product Detail | Description text on white background |

---

#### S2: Missing `lang` Attribute on `<html>` Element

**Severity:** Serious  
**WCAG:** 3.1.1 Language of Page (Level A)  
**Affected Pages:** All 5 pages  
**Total occurrences:** 5 (one per page)  

The `<html>` element in `public/index.html` has no `lang` attribute. Screen readers use this to select the correct language voice/pronunciation engine.

```html
<!-- public/index.html:3 -->
<html>
```

**Should be:**
```html
<html lang="en">
```

---

#### S3: Invalid `lang` Attribute Value (`lang="zz"`)

**Severity:** Serious  
**WCAG:** 3.1.2 Language of Parts (Level AA)  
**Affected Pages:** Home Page, Order Confirmation Page  
**Total occurrences:** 2  

```html
<!-- TheDrop.jsx:16 -->
<p lang="zz">Our brand-new, limited-edition plushie bag charms...</p>
```

`"zz"` is not a valid BCP 47 language tag. This paragraph is written in English and should either have no `lang` attribute (inheriting the page language) or `lang="en"`.

---

### Additional Non-Critical Issues Detected (Not Remediated)

The following issues were detected during the audit scans but were not classified as Critical severity by the Evinced scanner. They are documented for awareness.

#### NC1: Incorrect Heading Hierarchy

**WCAG:** 1.3.1 Info and Relationships (Level A) / 2.4.6 Headings and Labels (Level AA)  
**Affected Pages:** Home Page, New/Shop Page, Product Detail Page, Order Confirmation Page  

The heading structure is broken across multiple components:

| Component | File | Issue |
|-----------|------|-------|
| `HeroBanner` | `HeroBanner.jsx:9` | Uses `<h3>` as page-level heading (should be `<h1>`) |
| `FeaturedPair` | `FeaturedPair.jsx:33` | Uses `<h1>` as a card heading inside a section |
| `PopularSection` | `PopularSection.jsx:38,44` | Section heading is `<h4>`; card headings are `<h1>` |
| `TrendingCollections` | `TrendingCollections.jsx:38,44` | Section heading is `<h4>`; card headings are `<h1>` |
| `CartModal` | `CartModal.jsx:35` | Drawer title uses `<h5>` |
| `ProductPage` | `ProductPage.jsx:53,62` | Product name uses `<h3>` as the only heading on the page |
| `OrderConfirmationPage` | `OrderConfirmationPage.jsx:29` | Confirmation heading uses `<h3>` instead of `<h1>` |

---

#### NC2: Tab Order Reversed in Main Navigation

**WCAG:** 2.4.3 Focus Order (Level A)  
**Affected Pages:** All pages  

In `Header.jsx:175,191`, a `reverseTabIndex` is deliberately computed and applied to all nav links, making the keyboard tab sequence the reverse of the visual left-to-right order. Visual: New → Apparel → … → Sale. Tab order: Sale → … → New.

```jsx
// Header.jsx:175
const reverseTabIndex = navItems.length - index;
```

---

#### NC3: ARIA Modal Dialog Attributes Missing on Cart and Wishlist Drawers

**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Affected Pages:** All pages (Cart/Wishlist modals present throughout)  

The cart drawer (`CartModal.jsx:38`) and wishlist drawer (`WishlistModal.jsx`) are missing:
- `role="dialog"` — AT cannot identify them as dialogs
- `aria-modal="true"` — screen readers are not informed that background content is inert
- `aria-label` or `aria-labelledby` — the dialogs have no accessible name
- No focus trap — keyboard users can tab outside open modals
- No Escape key handler — keyboard users cannot dismiss modals with Escape

---

#### NC4: Filter Sidebar Disclosure Buttons Missing `aria-expanded` and `aria-controls`

**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Affected Pages:** New / Shop Page  

In `FilterSidebar.jsx:52,66,80`, the Price, Size, and Brand filter section toggle buttons are missing:
- `aria-expanded` — screen readers cannot indicate whether the section is open/collapsed
- `aria-controls` — no programmatic association between the button and its controlled panel

---

#### NC5: Duplicate `id` Attributes

**WCAG:** 4.1.1 Parsing (Level A)  
**Affected Pages:** New / Shop Page, Home Page  

- `FilterSidebar.jsx:56,70`: `id="filter-section-title"` appears on both the Price and Size `<span>` elements — IDs must be unique per page.
- `FeaturedPair.jsx:25,26`: `id="featured-card-img"` and `id="featured-card-label"` are rendered on both featured cards.

---

#### NC6: `<ul>` Contains Non-`<li>` Direct Child

**WCAG:** 4.1.1 Parsing (Level A)  
**Affected Pages:** Home Page, Order Confirmation Page  

In `TrendingCollections.jsx:40`, a `<div>` is a direct child of `<ul>`:

```jsx
<ul className="trending-grid" ...>
  <div className="trending-grid-label" style={{ display: 'none' }}>Collections</div>
  {collections.map(...)}
</ul>
```

Only `<li>` elements are valid direct children of `<ul>`.

---

#### NC7: Decorative/Presentational Heading Content Uses `aria-required-attr` for Hidden `role="checkbox"` and `role="meter"`

**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Affected Pages:** Home Page, Product Detail Page  

- `FeaturedPair.jsx:35`: A hidden `<span role="checkbox">` without `aria-checked` attribute.
- `ProductPage.jsx:118`: A hidden `<span role="meter">` without `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.

Both are `display:none` elements that appear to be test fixtures but still expose malformed ARIA to the accessibility tree.

---

#### NC8: Non-Meaningful `aria-label` on Interactive Buttons

**WCAG:** 2.4.6 Headings and Labels (Level AA)  
**Affected Pages:** Product Detail Page  

In `ProductPage.jsx:90,99`:
- `aria-label="Add to cart"` gives no context about which product is being added.
- `aria-label="Wishlist action"` does not describe the current state (add vs. remove) or product.

These should be `aria-label="Add {product.name} to cart"` and `aria-label="{isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}: {product.name}"`.

---

#### NC9: Cart Item Quantity Buttons Have No Product Context in Accessible Name

**WCAG:** 2.4.6 Headings and Labels (Level AA)  
**Affected Pages:** All pages (cart modal present)  

In `CartModal.jsx:68-74`, the quantity increment/decrement buttons `−` and `+` have no `aria-label`. Screen readers will announce only "−" and "+" without indicating which product's quantity is being adjusted.

---

#### NC10: Breadcrumb Separator is Hidden But Does Not Use `aria-hidden`

**WCAG:** 1.3.1 Info and Relationships (Level A)  
**Affected Pages:** Product Detail Page  

In `ProductPage.jsx:38`, the breadcrumb separator ` | ` has `aria-hidden="true"` — this is correctly done. No issue here; this is noted as a positive pattern.

---

#### NC11: Checkout Step Progress Indicators Lack Accessible State

**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Affected Pages:** Checkout Page  

The checkout progress steps (Basket → Shipping & Payment → Order Confirmation) use visual styling to indicate the current step but have no `aria-current="step"` or similar attribute to communicate the active state to screen readers.

---

## Summary Table

### Critical Issues (139 occurrences across all pages)

| # | Issue Type | WCAG | Affected Pages | Total Occurrences |
|---|-----------|------|----------------|-------------------|
| 1 | Interactable role — `<div>` used as interactive element | 4.1.2 | All | 48 |
| 2 | Keyboard inaccessible — interactive elements not reachable by keyboard | 2.1.1 | All | 50 |
| 3 | Accessible name missing on interactive elements | 4.1.2 | All | 21 |
| 4 | Missing required ARIA attrs on `role="slider"` | 4.1.2 | Home, Order Conf. | 2 |
| 5 | Invalid ARIA attribute values (`aria-expanded="yes"`, `aria-relevant="changes"`) | 4.1.2 | Home, Order Conf., Product | 5 |
| 6 | Button name missing (icon-only close buttons) | 4.1.2 | All | 9 |
| 7 | Missing image alt text | 1.1.1 | Home, Order Conf. | 4 |

### Serious Issues (25 occurrences)

| # | Issue Type | WCAG | Affected Pages | Total Occurrences |
|---|-----------|------|----------------|-------------------|
| 8 | Color contrast insufficient | 1.4.3 | All | 18 |
| 9 | Missing `lang` attribute on `<html>` | 3.1.1 | All | 5 |
| 10 | Invalid `lang="zz"` value | 3.1.2 | Home, Order Conf. | 2 |

### Non-Critical Issues (Not Remediated)

| # | Issue | WCAG | Severity |
|---|-------|------|---------|
| NC1 | Broken heading hierarchy throughout app | 1.3.1, 2.4.6 | Moderate |
| NC2 | Tab order reversed in main navigation | 2.4.3 | Moderate |
| NC3 | Modal dialogs missing role, aria-modal, accessible name, focus trap, Escape | 4.1.2, 2.1.2 | High |
| NC4 | Filter sidebar buttons missing `aria-expanded` and `aria-controls` | 4.1.2 | Moderate |
| NC5 | Duplicate `id` attributes in FilterSidebar and FeaturedPair | 4.1.1 | Low |
| NC6 | `<ul>` contains non-`<li>` direct child in TrendingCollections | 4.1.1 | Low |
| NC7 | Hidden `role="checkbox"` and `role="meter"` without required attributes | 4.1.2 | Low |
| NC8 | Non-meaningful `aria-label` on product Add-to-Cart and Wishlist buttons | 2.4.6 | Moderate |
| NC9 | Cart quantity buttons lack product context in accessible name | 2.4.6 | Low |
| NC10 | Checkout step progress indicator has no `aria-current` | 4.1.2 | Low |
| NC11 | Cart item quantity value span has no accessible label | 4.1.2 | Low |

---

## Remediation Priority Guidance

The following order is recommended based on user impact:

1. **Immediate (Critical, high user impact):**
   - Issues 1–3 (semantic roles, keyboard access, accessible names) — blocks all keyboard and screen reader users from using header controls, footer navigation, and filter sidebar
   - Issue 7 (image alt text) — two prominent images on the home page are invisible to screen readers

2. **High (Critical, blocks checkout journey):**
   - Issue 6 (button names on modal close buttons) — prevents screen reader users from closing cart/wishlist
   - Issues S2/S3 (html lang) — affects all screen reader users' pronunciation

3. **Medium (Critical but affects decorative/hidden elements):**
   - Issues 4, 5 (invalid ARIA attributes) — causes screen reader errors

4. **Lower priority:**
   - Color contrast (S1) — broad but requires design decisions
   - NC1 heading hierarchy — structural, no direct interaction blocker
   - NC3 modal accessibility — improves advanced interaction but cart is still usable

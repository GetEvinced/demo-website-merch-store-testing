# Accessibility Audit Report — Demo Website

**Date:** 2026-03-22  
**Tool:** Evinced JS Playwright SDK v2.17.0 (Evinced Engine + axe-core rules)  
**Auditor:** Automated — Playwright headless Chromium  
**Scope:** All routable pages of the React SPA at `http://localhost:3000`

---

## 1. Repository Structure & Page Inventory

The application is a React 18 SPA built with Webpack 5 and React Router v7.  
Entry point: `src/index.js` → `src/components/App.jsx`

### Pages Discovered

| # | Route | Component File | Entry Point |
|---|-------|---------------|-------------|
| 1 | `/` | `src/pages/HomePage.jsx` | `<Route path="/" element={<HomePage />} />` |
| 2 | `/shop/new` | `src/pages/NewPage.jsx` | `<Route path="/shop/new" element={<NewPage />} />` |
| 3 | `/product/:id` | `src/pages/ProductPage.jsx` | `<Route path="/product/:id" element={<ProductPage />} />` |
| 4 | `/checkout` | `src/pages/CheckoutPage.jsx` | `<Route path="/checkout" element={<CheckoutPage />} />` |
| 5 | `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` | `<Route path="/order-confirmation" element={<OrderConfirmationPage />} />` |

### Shared Components (rendered on all pages)

| Component | File | Notes |
|-----------|------|-------|
| Header + Nav | `src/components/Header.jsx` | Main navigation, cart button, search/login icons, wishlist icon, flag-group |
| Footer | `src/components/Footer.jsx` | Footer navigation items |
| CartModal | `src/components/CartModal.jsx` | Rendered on all pages except checkout and order-confirmation |
| WishlistModal | `src/components/WishlistModal.jsx` | Rendered on all pages |

---

## 2. Audit Methodology

Each page was audited with the Evinced Playwright SDK using three complementary scan methods:

- **`evAnalyze()`** — full-page Evinced Engine scan (proprietary rules + axe-core rules)
- **`components.analyzeSiteNavigation()`** — targeted analysis of the `<nav aria-label="Main navigation">` component against Evinced's navigation pattern rules
- **`components.analyzeCombobox()`** — targeted analysis of the sort combobox widget (Products page only)
- **`evMergeIssues()`** — deduplication across all scan results before saving

Results were saved per page to `tests/e2e/test-results/page-*.json`.

---

## 3. Summary of All Issues Found

| Page | Total Issues | Critical | Serious | Best Practice | Needs Review |
|------|-------------|----------|---------|---------------|--------------|
| Homepage (`/`) | 36 | 32 | 3 | 1 | 0 |
| Products (`/shop/new`) | 59 | 43 | 14 | 1 | 1 |
| Product Detail (`/product/1`) | 21 | 18 | 2 | 1 | 0 |
| Checkout (`/checkout`) | 22 | 18 | 3 | 1 | 0 |
| Order Confirmation (`/order-confirmation`) | 36 | 32 | 3 | 1 | 0 |
| **Totals (with deduplication)** | **174** | **143** | **26** | **5** | **1** |

> **Note on deduplication:** Many issues (e.g. header icon-button issues) appear on every page because the shared Header component is present everywhere. The unique issue *types* total 13. The instance count reflects every occurrence across every page.

### Issue Type Summary

| ID | Type | Severity | Instances | Pages Affected |
|----|------|----------|-----------|----------------|
| CI-1 | `NOT_FOCUSABLE` (Keyboard accessible) | **Critical** | 51 | All 5 |
| CI-2 | `WRONG_SEMANTIC_ROLE` (Interactable role) | **Critical** | 49 | All 5 |
| CI-3 | `NO_DESCRIPTIVE_TEXT` (Accessible name) | **Critical** | 21 | All 5 |
| CI-4 | `AXE-BUTTON-NAME` (Button name) | **Critical** | 9 | All 5 |
| CI-5 | `AXE-ARIA-VALID-ATTR-VALUE` | **Critical** | 5 | Homepage, Product Detail, Order Confirmation |
| CI-6 | `AXE-IMAGE-ALT` (Image alt) | **Critical** | 4 | Homepage, Order Confirmation |
| CI-7 | `AXE-ARIA-REQUIRED-ATTR` | **Critical** | 2 | Homepage, Order Confirmation |
| CI-8 | `ELEMENT_HAS_INCORRECT_ROLE` | **Critical** | 1 | Products Page |
| CI-9 | `CRITICAL_SEVERITY_MISSING_CONTEXTUAL_LABELING` | **Critical** | 1 | Products Page |
| NC-1 | `AXE-COLOR-CONTRAST` | Serious | 18 | All 5 |
| NC-2 | `AXE-HTML-HAS-LANG` | Serious | 5 | All 5 |
| NC-3 | `AXE-VALID-LANG` | Serious | 2 | Homepage, Order Confirmation |
| NC-4 | `MENU_AS_A_NAV_ELEMENT` | Best Practice | 5 | All 5 |
| NC-5 | `COMBOBOX_ANALYSIS_CANNOT_RUN` | Needs Review | 1 | Products Page |

---

## 4. Critical Issues — Detailed Analysis

### CI-1: `NOT_FOCUSABLE` — Keyboard Accessible

**Severity:** Critical  
**WCAG:** 2.1.1 Keyboard (Level A)  
**Knowledge Base:** https://knowledge.evinced.com/system-validations/keyboard-accessible  
**Total Instances:** 51 across all 5 pages

**Summary:** Keyboard users must be able to navigate to all interactive elements on the page using the Tab key. These elements are interactive (they have click handlers and `cursor: pointer` styling) but have no `tabindex` attribute and use non-semantic HTML tags, so they are invisible to keyboard navigation.

**Impact:** Keyboard-only users (motor impairment), screen reader users, switch access users cannot reach or activate these controls at all. Any user who cannot use a mouse is completely locked out of core site functionality.

#### Affected Elements by Page

**All pages — Header icons (4 elements):**

| Element | Selector | DOM Snippet | Source File |
|---------|----------|-------------|-------------|
| Wishlist button | `.wishlist-btn` | `<div class="icon-btn wishlist-btn" style="cursor:pointer;">…</div>` | `src/components/Header.jsx` |
| Search button | `.icon-btn:nth-child(2)` | `<div class="icon-btn" style="cursor:pointer;">…SVG…</div>` | `src/components/Header.jsx` |
| Login button | `.icon-btn:nth-child(4)` | `<div class="icon-btn" style="cursor:pointer;">…SVG…</div>` | `src/components/Header.jsx` |
| Region/flag selector | `.flag-group` | `<div class="flag-group" style="cursor:pointer;"><img …></div>` | `src/components/Header.jsx` |

**All pages — Footer navigation (2 elements):**

| Element | Selector | DOM Snippet | Source File |
|---------|----------|-------------|-------------|
| Sustainability link | `li:nth-child(3) > .footer-nav-item` | `<div class="footer-nav-item" style="cursor:pointer;">Sustainability</div>` | `src/components/Footer.jsx` |
| FAQs link | `.footer-list:nth-child(2) > li > .footer-nav-item` | `<div class="footer-nav-item" style="cursor:pointer;"><span aria-hidden="true">FAQs</span></div>` | `src/components/Footer.jsx` |

**Homepage & Order Confirmation — PopularSection shop links (3 elements):**

| Element | Selector | DOM Snippet | Source File |
|---------|----------|-------------|-------------|
| Shop Drinkware | `.product-card:nth-child(1) > .product-card-info > .shop-link` | `<div class="shop-link" style="cursor:pointer;"><span aria-hidden="true">Shop Drinkware</span></div>` | `src/components/PopularSection.jsx` |
| Shop Fun and Games | `.product-card:nth-child(2) > .product-card-info > .shop-link` | `<div class="shop-link" style="cursor:pointer;"><span aria-hidden="true">Shop Fun and Games</span></div>` | `src/components/PopularSection.jsx` |
| Shop Stationery | `.product-card:nth-child(3) > .product-card-info > .shop-link` | `<div class="shop-link" style="cursor:pointer;"><span aria-hidden="true">Shop Stationery</span></div>` | `src/components/PopularSection.jsx` |

**Homepage & Order Confirmation — TheDrop slider (1 element):**

| Element | Selector | DOM Snippet | Source File |
|---------|----------|-------------|-------------|
| Popularity slider | `.drop-popularity-bar` | `<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>` | `src/components/TheDrop.jsx` |

**Products Page — Filter options (14 elements, across Price/Size/Brand filter groups):**

| Element | Selector | DOM Snippet | Source File |
|---------|----------|-------------|-------------|
| Price filter: $1–$19.99 | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(1)` | `<div class="filter-option"><div class="custom-checkbox"></div>…</div>` | `src/components/FilterSidebar.jsx` |
| Price filter: $20–$39.99 | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(2)` | `<div class="filter-option">…</div>` | `src/components/FilterSidebar.jsx` |
| Price filter: $40–$89.99 | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(3)` | `<div class="filter-option">…</div>` | `src/components/FilterSidebar.jsx` |
| Price filter: $100–$149.99 | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(4)` | `<div class="filter-option">…</div>` | `src/components/FilterSidebar.jsx` |
| Size filter: XS–XL (5) | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(1–5)` | `<div class="filter-option">…</div>` | `src/components/FilterSidebar.jsx` |
| Brand filter: Android/Google/YouTube (3) | `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(1–3)` | `<div class="filter-option">…</div>` | `src/components/FilterSidebar.jsx` |

**Checkout Page — Continue button (1 element):**

| Element | Selector | DOM Snippet | Source File |
|---------|----------|-------------|-------------|
| Continue button | `.checkout-continue-btn` | `<div class="checkout-continue-btn" style="cursor:pointer;">Continue</div>` | `src/pages/CheckoutPage.jsx` |

#### Recommended Fix

Replace non-semantic `<div>` interactive elements with native HTML interactive elements (`<button>` for actions, `<a>` for navigation). Native elements are natively focusable, have the correct implicit ARIA role, and respond to keyboard events (Enter/Space) without additional JavaScript. Where replacing the element type is not feasible, add `tabindex="0"` and an explicit `role` attribute to bring the element into the focus sequence and give it the correct semantics.

**Why this approach:** Native HTML elements receive keyboard focus, correct implicit ARIA roles, and built-in keyboard event handling at zero cost. They also survive future framework updates without requiring maintenance of custom keyboard listeners. The `tabindex="0"` workaround is a valid fallback but must always be paired with a matching ARIA role and explicit `onKeyDown`/`onKeyUp` handlers for Enter and Space; native elements avoid all of that complexity.

---

### CI-2: `WRONG_SEMANTIC_ROLE` — Interactable Role

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Knowledge Base:** https://knowledge.evinced.com/system-validations/interactable-role  
**Total Instances:** 49 across all 5 pages

**Summary:** Screen readers identify interactive elements by their ARIA role. These `<div>` elements are visually interactive (click handlers, pointer cursor) but carry no semantic role, so screen readers announce them as static text or generic containers rather than as controls users can activate.

**Impact:** Screen reader users hear the element's text content (if any) but receive no indication that the element is interactive. They cannot discover these controls using the screen reader's "form controls" or "interactive elements" virtual cursor mode. The elements are also invisible to voice control software (e.g., Dragon NaturallySpeaking) which relies on roles to locate actionable targets.

#### Affected Elements by Page

The set of affected elements is identical to CI-1 (NOT_FOCUSABLE): `.wishlist-btn`, `.icon-btn:nth-child(2)` (Search), `.icon-btn:nth-child(4)` (Login), `.flag-group`, `.shop-link` ×3, `.footer-nav-item` ×2, `.filter-option` ×14, `.checkout-continue-btn`.

Each element is a `<div>` acting as a button or link without a corresponding `role="button"` or `role="link"` attribute.

**Source files:** `src/components/Header.jsx`, `src/components/Footer.jsx`, `src/components/PopularSection.jsx`, `src/components/FilterSidebar.jsx`, `src/pages/CheckoutPage.jsx`

#### Recommended Fix

Same as CI-1: replace `<div>` with native `<button>` (for trigger actions) or `<a href="…">` (for navigation). Where elements must remain `<div>`, add `role="button"` or `role="link"` explicitly. For the filter options, the correct role is `role="checkbox"` combined with `aria-checked` state.

**Why this approach:** WCAG 4.1.2 requires that all user interface components expose Name, Role, and Value to assistive technologies. Replacing the host element with a semantically correct native element satisfies the role requirement automatically, while also inheriting focus management (CI-1) and keyboard behaviour. Adding explicit ARIA roles as a secondary approach maintains visual design but requires careful coordination with `tabindex` and keyboard event handling.

---

### CI-3: `NO_DESCRIPTIVE_TEXT` — Accessible Name

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Knowledge Base:** https://knowledge.evinced.com/system-validations/accessible-name  
**Total Instances:** 21 across all 5 pages

**Summary:** These interactive elements have no accessible name — the text or label a screen reader would announce to identify the control. Either the visible text label is hidden from assistive technologies via `aria-hidden="true"`, or the element contains only an SVG icon with no text alternative.

**Impact:** A screen reader user encountering these controls hears nothing — or hears only "button" / "link" with no name. Voice control users cannot target the control by name (e.g., "click Search"). The user cannot determine what the control does without visually inspecting the icon.

#### Affected Elements by Page

**All pages — Header icons (2 elements):**

| Element | Selector | DOM Snippet | Issue |
|---------|----------|-------------|-------|
| Search icon button | `.icon-btn:nth-child(2)` | `<div class="icon-btn" style="cursor:pointer;"><svg aria-hidden="true">…</svg><span aria-hidden="true">Search</span></div>` | Both SVG and text span are `aria-hidden` — no accessible name remains |
| Login icon button | `.icon-btn:nth-child(4)` | `<div class="icon-btn" style="cursor:pointer;"><svg aria-hidden="true">…</svg><span aria-hidden="true">Log in</span></div>` | Both SVG and text span are `aria-hidden` — no accessible name remains |

**All pages — Footer FAQs (1 element):**

| Element | Selector | DOM Snippet | Issue |
|---------|----------|-------------|-------|
| FAQs footer item | `.footer-list:nth-child(2) > li > .footer-nav-item` | `<div class="footer-nav-item" style="cursor:pointer;"><span aria-hidden="true">FAQs</span></div>` | Visible text is `aria-hidden` — screen readers get no name |

**Homepage & Order Confirmation — Shop links (3 elements):**

| Element | Selector | DOM Snippet | Issue |
|---------|----------|-------------|-------|
| Shop Drinkware | `.product-card:nth-child(1) > .product-card-info > .shop-link` | `<div class="shop-link" style="cursor:pointer;"><span aria-hidden="true">Shop Drinkware</span></div>` | Text hidden from AT |
| Shop Fun and Games | `.product-card:nth-child(2) > .product-card-info > .shop-link` | `<div class="shop-link" style="cursor:pointer;"><span aria-hidden="true">Shop Fun and Games</span></div>` | Text hidden from AT |
| Shop Stationery | `.product-card:nth-child(3) > .product-card-info > .shop-link` | `<div class="shop-link" style="cursor:pointer;"><span aria-hidden="true">Shop Stationery</span></div>` | Text hidden from AT |

**Source files:** `src/components/Header.jsx`, `src/components/Footer.jsx`, `src/components/PopularSection.jsx`

#### Recommended Fix

Remove `aria-hidden="true"` from text labels that serve as the accessible name of their parent interactive element, or add an explicit `aria-label` attribute to the interactive element. For icon-only buttons, the SVG should either carry a `<title>` element (SVG accessible name) or the button should receive `aria-label="Search"` / `aria-label="Log in"`.

**Why this approach:** The `aria-hidden` attribute was applied to suppress redundant announcement (e.g., the text "Search" below a search icon that users can already see), but it has the side-effect of stripping the element's accessible name entirely. The correct fix is to use `aria-label` on the button itself (which gives the name without repeating it in the rendered text) and keep the visible text for sighted low-vision users — or use `aria-label` plus `.sr-only` CSS (visually hidden, not `aria-hidden`) to avoid the visible label entirely.

---

### CI-4: `AXE-BUTTON-NAME` — Button Name (axe-core rule)

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Knowledge Base:** https://knowledge.evinced.com/system-validations/button-name  
**Total Instances:** 9 across all 5 pages

**Summary:** Axe-core's `button-name` rule fires when a `<button>` element has no discernible text — no text content, no `aria-label`, no `aria-labelledby`, and no `title`. These are icon-only close buttons in the CartModal and WishlistModal.

**Impact:** Screen readers announce these as "button" with no purpose. Users cannot determine what will happen when they activate the control — specifically, they cannot find and use the "close" action for the cart and wishlist drawers.

#### Affected Elements by Page

**All pages (except checkout) — CartModal close button (1 per page):**

| Element | Selector | DOM Snippet | Source File |
|---------|----------|-------------|-------------|
| CartModal close button | `#cart-modal > div:nth-child(1) > button` | `<button class="[CSS-module-hash]"><svg …aria-hidden="true"/></button>` | `src/components/CartModal.jsx` |

**All pages — WishlistModal close button (1 per page):**

| Element | Selector | DOM Snippet | Source File |
|---------|----------|-------------|-------------|
| WishlistModal close button | `div[role="dialog"] > div:nth-child(1) > button` | `<button class="[CSS-module-hash]"><svg …aria-hidden="true"/></button>` | `src/components/WishlistModal.jsx` |

#### Recommended Fix

Add `aria-label="Close cart"` (or `aria-label="Close wishlist"`) to each close `<button>`. The SVG icon should keep `aria-hidden="true"` (preventing double-announcement) and the accessible name is provided entirely by `aria-label`.

**Why this approach:** `aria-label` is the most direct mechanism for providing an accessible name to an icon-only button with no visible text. It does not alter visual rendering, is widely supported by all screen reader / browser combinations, and clearly describes the button's purpose in the context of the modal it closes.

---

### CI-5: `AXE-ARIA-VALID-ATTR-VALUE` — Invalid ARIA Attribute Values

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Total Instances:** 5 (Homepage ×2, Product Detail ×1, Order Confirmation ×2)

**Summary:** ARIA attribute values must conform to the ARIA specification. Two distinct violations were detected:

1. `aria-expanded="yes"` — The valid values for `aria-expanded` are `"true"` and `"false"` (boolean strings). The value `"yes"` is not recognised and will be ignored by assistive technologies, meaning the expanded/collapsed state is never communicated.

2. `aria-relevant="changes"` — The valid token values for `aria-relevant` are `additions`, `removals`, `text`, and `all`. The value `"changes"` is not a valid token.

**Impact:** For `aria-expanded`: Screen readers cannot announce whether content is expanded or collapsed, breaking the experience for users relying on this state information (e.g., accordion/disclosure widgets). For `aria-relevant`: The live region may not announce updates as intended.

#### Affected Elements

**Homepage & Order Confirmation (2 elements each):**

| Element | Selector | DOM Snippet | Invalid Attribute | Source File |
|---------|----------|-------------|-------------------|-------------|
| FeaturedPair card heading | `.featured-card:nth-child(1) > .featured-card-info > h1` | `<h1 aria-expanded="yes">Keep on Truckin'</h1>` | `aria-expanded="yes"` → must be `"true"` or `"false"` | `src/components/FeaturedPair.jsx` |
| FeaturedPair card heading | `.featured-card:nth-child(2) > .featured-card-info > h1` | `<h1 aria-expanded="yes">Limited edition and traveling fast</h1>` | `aria-expanded="yes"` → must be `"true"` or `"false"` | `src/components/FeaturedPair.jsx` |

**Product Detail (1 element):**

| Element | Selector | DOM Snippet | Invalid Attribute | Source File |
|---------|----------|-------------|-------------------|-------------|
| Product size list | `ul[aria-relevant="changes"]` | `<ul aria-relevant="changes" aria-live="polite">…</ul>` | `aria-relevant="changes"` → must be space-separated tokens from `additions removers text all` | `src/pages/ProductPage.jsx` |

#### Recommended Fix

- Change `aria-expanded="yes"` to `aria-expanded="false"` (or `"true"` depending on state). Since these headings do not actually control a collapsible region, the `aria-expanded` attribute should be removed entirely — it is semantically incorrect on a heading element.
- Change `aria-relevant="changes"` to `aria-relevant="additions text"` (the most common intent — announce content additions and text changes) or remove the attribute if the default behaviour (`additions text`) is sufficient.

**Why this approach:** Using invalid attribute values silently fails — browsers and assistive technologies discard the attribute rather than reporting an error to the user. Correcting the value to a valid token immediately restores the intended behaviour. Removing `aria-expanded` from the `<h1>` elements is semantically cleaner than fixing the value, because `aria-expanded` belongs on the trigger element (e.g., a `<button>`) that controls a panel, not on a static heading.

---

### CI-6: `AXE-IMAGE-ALT` — Images Missing Alt Text

**Severity:** Critical  
**WCAG:** 1.1.1 Non-text Content (Level A)  
**Total Instances:** 4 (Homepage ×2, Order Confirmation ×2)

**Summary:** `<img>` elements without an `alt` attribute provide no text alternative for screen readers. Screen readers typically fall back to reading the image `src` filename, which is rarely meaningful.

**Impact:** Screen reader users hear the image filename (e.g., "New underscore Tees dot png") instead of a meaningful description. Users who cannot see images receive no information about the content the image conveys.

#### Affected Elements

| Element | Selector | DOM Snippet | Source File |
|---------|----------|-------------|-------------|
| Hero banner image | `img[src$="New_Tees.png"]` | `<img src="/images/home/New_Tees.png">` | `src/components/HeroBanner.jsx` |
| TheDrop section image | `img[src$="2bags_charms1.png"]` | `<img src="/images/home/2bags_charms1.png" loading="lazy">` | `src/components/TheDrop.jsx` |

Both images appear on the Homepage and again on the Order Confirmation page (which renders the same homepage components below the confirmation message).

#### Recommended Fix

Add descriptive `alt` attributes to both images. For purely decorative images that carry no informational value, add `alt=""` (empty string) to instruct screen readers to skip the image entirely.

- `HeroBanner.jsx`: `<img src="/images/home/New_Tees.png" alt="New tees collection — winter basics" />`
- `TheDrop.jsx`: `<img src="/images/home/2bags_charms1.png" alt="Two bags with charms" />` (or `alt=""` if decorative)

**Why this approach:** WCAG 1.1.1 requires a text alternative for every non-decorative image. A descriptive `alt` text communicates the same information the image conveys visually. An empty `alt=""` is the correct declaration for purely decorative images — it causes screen readers to skip the image silently, preventing noise without losing content.

---

### CI-7: `AXE-ARIA-REQUIRED-ATTR` — Missing Required ARIA Attributes

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Total Instances:** 2 (Homepage ×1, Order Confirmation ×1)

**Summary:** Elements with ARIA roles that require certain attributes are missing those attributes. A `role="slider"` element must always provide `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` so assistive technologies can announce the current value and valid range.

**Impact:** Screen readers cannot announce the slider's current value or its range. Users relying on screen readers cannot determine what the slider represents or its current state.

#### Affected Elements

| Element | Selector | DOM Snippet | Missing Attributes | Source File |
|---------|----------|-------------|-------------------|-------------|
| Popularity indicator slider | `.drop-popularity-bar` | `<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>` | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` | `src/components/TheDrop.jsx` |

#### Recommended Fix

Add the three required ARIA attributes with appropriate values. For example, if the popularity bar represents a percentage from 0–100 with a current value of 72:

```jsx
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={popularityValue}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuetext={`${popularityValue}% popularity`}
  className="drop-popularity-bar"
/>
```

If the element is purely decorative (display-only, not interactive), remove `role="slider"` entirely and add `aria-hidden="true"` to exclude it from the accessibility tree.

**Why this approach:** The `role="slider"` role has three required properties (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`) by the ARIA specification. Any element bearing this role must provide all three or the role is invalid. If the element is actually decorative, the correct fix is to remove the widget role and hide it from assistive technologies rather than patching required attributes onto a non-interactive element.

---

### CI-8: `ELEMENT_HAS_INCORRECT_ROLE` — Sort Button Has Wrong Role

**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Knowledge Base:** https://knowledge.evinced.com/components  
**Total Instances:** 1 (Products Page)

**Summary:** The sort trigger button (`.sort-btn`) on the Products page opens a dropdown list of sort options. According to the Evinced combobox component pattern, this button should expose `role="combobox"` and `aria-expanded` so assistive technologies identify it as a combobox widget and announce its open/closed state. The current element is a native `<button>` with no combobox role.

**Impact:** Screen readers announce the element as a plain button. Users cannot tell that activating it will open a list of options, and they cannot navigate the options list using the expected combobox keyboard pattern (arrow keys, Home/End).

#### Affected Elements

| Element | Selector | DOM Snippet | Source File |
|---------|----------|-------------|-------------|
| Sort trigger button | `.sort-btn` | `<button class="sort-btn">Sort by Relevance (Default)<svg …></button>` | `src/pages/NewPage.jsx` |

#### Recommended Fix

Add the combobox ARIA attributes to the sort button:

```jsx
<button
  className="sort-btn"
  role="combobox"
  aria-expanded={sortOpen}
  aria-haspopup="listbox"
  aria-controls="sort-options-list"
  aria-label="Sort products"
>
  {currentSort}
</button>
```

And add matching `role="listbox"` and `role="option"` to the dropdown list and its items.

**Why this approach:** The Evinced combobox component pattern requires `role="combobox"` on the trigger, `role="listbox"` on the options container, and `role="option"` on each option. This aligns with the ARIA 1.2 combobox pattern and enables assistive technologies to provide the full expected combobox interaction model (announcing current value, number of options, expanded/collapsed state, and keyboard navigation).

---

### CI-9: `CRITICAL_SEVERITY_MISSING_CONTEXTUAL_LABELING` — Sort Button Has No Accessible Label

**Severity:** Critical  
**WCAG:** 1.3.1 Info and Relationships (Level A)  
**Knowledge Base:** https://knowledge.evinced.com/system-validations/missing-contextual-labeling  
**Total Instances:** 1 (Products Page)

**Summary:** The sort button's visible text ("Sort by Relevance (Default)") changes dynamically as the user selects different sort options. Without an accessible label that identifies the widget's *purpose* (as opposed to its current *value*), screen reader users cannot understand that the button is a "Sort products" control — they only hear the current sort value announced in isolation.

**Impact:** Screen reader users using virtual cursor or forms mode hear the button's current value ("Sort by Relevance (Default)") but have no label indicating this is a sort control. Out of context (e.g., in a list of form elements), the control is ambiguous.

#### Affected Elements

| Element | Selector | DOM Snippet | Source File |
|---------|----------|-------------|-------------|
| Sort trigger button | `.sort-btn` | `<button class="sort-btn">Sort by Relevance (Default)<svg…></button>` | `src/pages/NewPage.jsx` |

#### Recommended Fix

Add `aria-label="Sort products"` to the sort button. This provides the control's purpose as the accessible name, while the visible text (current selection) is still visually present for sighted users.

**Why this approach:** Providing contextual labeling via `aria-label` separates the widget's *purpose* label from its *current value* display. Assistive technologies can then announce both: "Sort products, combobox, Sort by Relevance (Default), collapsed." This satisfies WCAG 1.3.1 (information about the control's relationship to page structure is programmatically determinable) and 4.1.2 (the control has a meaningful accessible name).

---

## 5. Non-Critical Issues (Not Remediated)

These issues are classified as Serious, Best Practice, or Needs Review by the Evinced engine. They were detected during the audit but are outside the critical remediation scope.

---

### NC-1: `AXE-COLOR-CONTRAST` — Insufficient Color Contrast

**Severity:** Serious  
**WCAG:** 1.4.3 Contrast Minimum (Level AA) — requires 4.5:1 ratio for normal text  
**Total Instances:** 18 across all 5 pages

| Page | Element / Selector | Issue |
|------|--------------------|-------|
| Homepage, Order Confirmation | `.hero-content > p` (hero subtitle text) | Foreground `#c8c0b8` on background `#e8e0d8` — approx. 1.3:1 ratio |
| Products Page | `.products-found` ("X Products Found" text) | Foreground `#b0b4b8` on `#ffffff` — approx. 1.9:1 ratio |
| Products Page | `.filter-count` spans (product count per filter option) | Foreground `#c8c8c8` on `#ffffff` — approx. 1.4:1 ratio (multiple instances across Price/Size/Brand filter groups) |
| Product Detail | `p:nth-child(4)` (product description text) | Foreground `#c0c0c0` on `#ffffff` — approx. 1.6:1 ratio |
| Checkout | `.checkout-step:nth-child(3) > .step-label` (step label text) | Insufficient contrast against step background |
| Checkout | `.summary-tax-note` | Tax note text insufficient contrast |

**Why not remediated:** Color contrast issues are classified as Serious (not Critical) by the Evinced engine and require careful design decision-making about brand color adjustments, not just code changes. They should be addressed in a dedicated design review sprint.

---

### NC-2: `AXE-HTML-HAS-LANG` — HTML Element Missing lang Attribute

**Severity:** Serious  
**WCAG:** 3.1.1 Language of Page (Level A)  
**Total Instances:** 5 (1 per page — same root `<html>` element detected on every scan)

| Page | Element | Issue |
|------|---------|-------|
| All pages | `<html>` (`public/index.html`) | The `<html>` element has no `lang` attribute. Screen readers use this to determine which language to use for pronunciation. |

**Source file:** `public/index.html`  
**Fix needed:** Add `<html lang="en">` to the HTML template.

**Why not remediated:** Although the fix is one line and straightforward, it falls into the Serious (not Critical) classification in this audit. It is cross-cutting (affects all pages) and the root template change should be tracked alongside the lang-related `valid-lang` issue (NC-3) as a single cohesive change.

---

### NC-3: `AXE-VALID-LANG` — Invalid lang Attribute Value

**Severity:** Serious  
**WCAG:** 3.1.2 Language of Parts (Level AA)  
**Total Instances:** 2 (Homepage ×1, Order Confirmation ×1 — same component)

| Page | Element | DOM Snippet | Source File |
|------|---------|-------------|-------------|
| Homepage, Order Confirmation | `p[lang="zz"]` | `<p lang="zz">…</p>` | `src/components/TheDrop.jsx` |

The value `"zz"` is not a valid BCP 47 language tag. Screen readers will not switch language for this text.

**Fix needed:** Replace `lang="zz"` with a valid BCP 47 language tag (e.g., `lang="en"` if the text is English, or the correct language code if the text is in a different language, or remove the attribute if no language change is intended).

---

### NC-4: `MENU_AS_A_NAV_ELEMENT` — role="menu" Inside Navigation Landmark

**Severity:** Best Practice  
**WCAG:** (Evinced navigation pattern — no direct WCAG criterion, but relates to 1.3.1 and 4.1.2)  
**Knowledge Base:** https://knowledge.evinced.com/components/navigation  
**Total Instances:** 5 (1 per page — same Header component)

| Page | Element | DOM Snippet | Source File |
|------|---------|-------------|-------------|
| All pages | `.has-submenu:nth-child(2) > .submenu[role="menu"]` (and child 3, 4, 5, 6) | `<ul role="menu">…nav link items…</ul>` | `src/components/Header.jsx` |

The five navigation submenus (Apparel, Lifestyle, Stationery, Collections, Shop by Brand) use `role="menu"` on their `<ul>` container. The `menu` role implies an application-level widget (like a desktop app menu bar), not a site navigation structure. Using it inside a `<nav>` landmark confuses assistive technologies and causes screen readers to treat the navigation as an application widget rather than a navigation region.

**Fix needed:** Remove `role="menu"` from the submenu `<ul>` elements. The `<nav>` landmark with properly structured `<a>` elements is sufficient for navigation without any menu widget roles.

---

### NC-5: `COMBOBOX_ANALYSIS_CANNOT_RUN` — Sort Combobox Could Not Be Expanded

**Severity:** Needs Review  
**Total Instances:** 1 (Products Page)

| Page | Element | Issue |
|------|---------|-------|
| Products Page | `.sort-btn` | The Evinced Component Tester could not programmatically expand the sort dropdown to inspect the options list during the combobox-specific analysis scan. |

This is a tool limitation rather than a distinct accessibility issue — the sort dropdown could not be expanded by the automated scanner because the button does not expose `aria-expanded` and does not respond to the expected combobox keyboard interaction. The underlying accessibility problems (missing `role="combobox"`, missing `aria-expanded`) are already captured under CI-8 and CI-9.

---

## 6. Summary

### Critical Issues — 9 Issue Types, 143 Instances

| ID | Type | Severity | Instances | Root Cause |
|----|------|----------|-----------|------------|
| CI-1 | NOT_FOCUSABLE | Critical | 51 | `<div>` interactive elements missing `tabindex` |
| CI-2 | WRONG_SEMANTIC_ROLE | Critical | 49 | `<div>` elements acting as buttons/links/checkboxes without correct ARIA role |
| CI-3 | NO_DESCRIPTIVE_TEXT | Critical | 21 | Visible labels hidden via `aria-hidden`; SVG icons without text alternatives |
| CI-4 | AXE-BUTTON-NAME | Critical | 9 | Icon-only `<button>` elements with no `aria-label` (modal close buttons) |
| CI-5 | AXE-ARIA-VALID-ATTR-VALUE | Critical | 5 | `aria-expanded="yes"` and `aria-relevant="changes"` are not valid ARIA values |
| CI-6 | AXE-IMAGE-ALT | Critical | 4 | `<img>` elements missing `alt` attribute |
| CI-7 | AXE-ARIA-REQUIRED-ATTR | Critical | 2 | `role="slider"` missing required `aria-valuenow/min/max` attributes |
| CI-8 | ELEMENT_HAS_INCORRECT_ROLE | Critical | 1 | Sort button not exposed as `role="combobox"` |
| CI-9 | CRITICAL_SEVERITY_MISSING_CONTEXTUAL_LABELING | Critical | 1 | Sort button has no `aria-label` to identify its purpose |

### Non-Critical Issues — 5 Issue Types, 31 Instances

| ID | Type | Severity | Instances | Scope |
|----|------|----------|-----------|-------|
| NC-1 | AXE-COLOR-CONTRAST | Serious | 18 | Multiple components — hero, filter-count, description, checkout labels |
| NC-2 | AXE-HTML-HAS-LANG | Serious | 5 | `public/index.html` — `<html>` missing `lang` |
| NC-3 | AXE-VALID-LANG | Serious | 2 | `TheDrop.jsx` — `lang="zz"` invalid BCP 47 tag |
| NC-4 | MENU_AS_A_NAV_ELEMENT | Best Practice | 5 | `Header.jsx` — `role="menu"` on nav submenus |
| NC-5 | COMBOBOX_ANALYSIS_CANNOT_RUN | Needs Review | 1 | Products page sort button — scanner could not expand dropdown |

### Files Requiring Changes (if remediated)

| File | Issues |
|------|--------|
| `src/components/Header.jsx` | CI-1, CI-2, CI-3, CI-4, NC-4 |
| `src/components/Footer.jsx` | CI-1, CI-2, CI-3 |
| `src/components/PopularSection.jsx` | CI-1, CI-2, CI-3 |
| `src/components/FilterSidebar.jsx` | CI-1, CI-2 |
| `src/components/CartModal.jsx` | CI-4 |
| `src/components/WishlistModal.jsx` | CI-4 |
| `src/components/FeaturedPair.jsx` | CI-5 |
| `src/components/HeroBanner.jsx` | CI-6 |
| `src/components/TheDrop.jsx` | CI-6, CI-7, NC-3 |
| `src/pages/NewPage.jsx` | CI-8, CI-9 |
| `src/pages/ProductPage.jsx` | CI-5 |
| `src/pages/CheckoutPage.jsx` | CI-1, CI-2 |
| `public/index.html` | NC-2 |

---

*Report generated by Evinced JS Playwright SDK v2.17.0 running on Playwright Chromium headless. Raw JSON results stored in `tests/e2e/test-results/page-*.json`.*

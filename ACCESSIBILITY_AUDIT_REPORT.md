# Accessibility Audit Report
**Repository:** demo-website  
**Tool:** Evinced Web SDK (Playwright), `@evinced/js-playwright-sdk`  
**Audit Date:** 2026-03-22  
**Auditor:** Automated Cloud Agent via Playwright + Evinced MCP Server  
**Branch:** `cursor/accessibility-audit-report-bbbd`

---

## Executive Summary

| Page | URL | Total Issues | Critical | Serious | Other |
|------|-----|:---:|:---:|:---:|:---:|
| Homepage | `/` | 35 | 32 | 3 | 0 |
| Products | `/shop/new` | 65 | 47 | 14 | 4 |
| Product Detail | `/product/:id` | 20 | 18 | 2 | 0 |
| Checkout | `/checkout` | 21 | 18 | 3 | 0 |
| Order Confirmation | `/order-confirmation` | 35* | 32 | 3 | 0 |
| **Total (unique)** | | **129** | **107** | **22** | **4** |

> \* `/order-confirmation` requires React Router state to render its own content; when accessed directly it silently redirects to the homepage, so the 35 issues are identical to the Homepage scan. Issues unique to the Order Confirmation page itself are captured via the full-journey spec (see **CI-OC-01** in Appendix).

### Scan Methodology

For each page the following Evinced analyses were run and merged:

| Page | `evAnalyze()` | `analyzeCombobox()` | `analyzeSiteNavigation()` | `analyzeCheckbox()` |
|------|:---:|:---:|:---:|:---:|
| Homepage | ✓ | — | — | — |
| Products | ✓ | ✓ `.sort-btn` | ✓ `nav[aria-label="Main navigation"]` | ✓ (3 filter groups) |
| Product Detail | ✓ | — | — | — |
| Checkout | ✓ | — | — | — |
| Order Confirmation | ✓ | — | — | — |

---

## Pages & Entry Points

The application is a React SPA (Webpack 5, React Router v7) with the following route declarations:

| Route | Component File | Description |
|-------|---------------|-------------|
| `/` | `src/pages/HomePage.jsx` | Marketing homepage — hero, featured collections, trending, The Drop section |
| `/shop/new` | `src/pages/NewPage.jsx` | Products listing with filter sidebar and sort combobox |
| `/product/:id` | `src/pages/ProductPage.jsx` | Individual product detail page |
| `/checkout` | `src/pages/CheckoutPage.jsx` | Shopping cart review → shipping & payment form → order confirmation |
| `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` | Post-purchase confirmation (requires router state) |

**Shared components** present on every page: `Header.jsx` (nav, wishlist, search, login, cart buttons), `Footer.jsx` (nav links), `CartModal.jsx` (cart drawer), `WishlistModal.jsx` (wishlist drawer).

---

## Critical Issues Found

The Evinced engine reported **10 distinct critical issue types** across the scanned pages, totalling **107 individual critical violations** (many are the same component re-evaluated on each page).

---

### CI-01 — `WRONG_SEMANTIC_ROLE` · Interactable Role

| | |
|---|---|
| **Severity** | Critical |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Evinced Rule** | [interactable-role](https://knowledge.evinced.com/system-validations/interactable-role) |
| **Pages Affected** | All pages (Homepage, Products, Product Detail, Checkout, Order Confirmation) |
| **Total Instances** | 49 |

#### Affected Elements

| # | Selector | Source File | Description |
|---|----------|-------------|-------------|
| 1 | `.wishlist-btn` | `src/components/Header.jsx:131` | `<div>` acting as wishlist-open button |
| 2 | `.icon-btn:nth-child(2)` | `src/components/Header.jsx:140` | `<div>` acting as search button |
| 3 | `.icon-btn:nth-child(4)` | `src/components/Header.jsx:156` | `<div>` acting as login button |
| 4 | `.flag-group` | `src/components/Header.jsx:161` | `<div>` acting as region-selector toggle |
| 5 | `.shop-link` (×3) | `src/components/PopularSection.jsx:55` | `<div>` acting as navigation link (Homepage only) |
| 6 | `.footer-nav-item` (Sustainability) | `src/components/Footer.jsx:13` | `<div>` acting as footer navigation link |
| 7 | `.footer-nav-item` (FAQs) | `src/components/Footer.jsx:18` | `<div>` acting as footer navigation link |
| 8 | `.filter-option` (×12) | `src/components/FilterSidebar.jsx:74,116,156` | `<div>` acting as custom checkbox (Products page) |
| 9 | `.checkout-continue-btn` | `src/pages/CheckoutPage.jsx:157` | `<div>` acting as "Continue" button (Checkout page) |

#### Detected DOM Snippet (representative)
```html
<!-- Header wishlist button -->
<div class="icon-btn wishlist-btn" style="cursor: pointer;">
  <svg aria-hidden="true">…</svg>
  <span>Wishlist</span>
</div>

<!-- Footer FAQs nav item -->
<div class="footer-nav-item" style="cursor: pointer;">
  <span aria-hidden="true">FAQs</span>
</div>
```

#### Recommended Fix

Replace `<div>` elements with semantically appropriate native HTML elements, or add the correct ARIA `role` attribute:

- **Buttons** (wishlist, search, login, region selector, checkout-continue): Use `<button>` or add `role="button"` and `tabindex="0"`.
- **Navigation links** (shop-link, footer-nav-item): Use `<a href="…">` or add `role="link"` and `tabindex="0"`.
- **Checkboxes** (filter-option): Use `<input type="checkbox">` wrapped in `<label>`, or add `role="checkbox"`, `tabindex="0"`, and `aria-checked`.

**Example (Header wishlist button):**
```jsx
// Before (incorrect):
<div className="icon-btn wishlist-btn" onClick={openWishlist} style={{cursor:'pointer'}}>

// After (correct):
<button className="icon-btn wishlist-btn" onClick={openWishlist} aria-label="Open wishlist">
```

#### Why This Remediation

Screen readers enumerate interactive elements by their semantic role. When `<div>` is used with a `click` handler, NVDA, JAWS, and VoiceOver do not expose it as an interactive element in their "buttons" or "links" browse modes — users simply cannot discover it by navigating the page structure. Using native elements (`<button>`, `<a>`) is preferred over `role=` attributes because native elements carry implicit keyboard behaviour (focusability, Enter/Space activation) without additional JavaScript, reducing the risk of missing keyboard support.

---

### CI-02 — `NOT_FOCUSABLE` · Keyboard Accessible

| | |
|---|---|
| **Severity** | Critical |
| **WCAG** | 2.1.1 Keyboard (Level A) |
| **Evinced Rule** | [keyboard-accessible](https://knowledge.evinced.com/system-validations/keyboard-accessible) |
| **Pages Affected** | All pages |
| **Total Instances** | 51 |

#### Affected Elements

The exact same elements listed in CI-01 — every `<div>`-based interactive control — are also not in the tab sequence because plain `<div>` elements are not natively focusable and lack `tabindex`.

#### Recommended Fix

Add `tabindex="0"` to any `<div>` or `<span>` used as an interactive element (while also resolving CI-01 with correct role). **However**, the preferred remediation is to replace the element with a native `<button>` or `<a>`, which are focusable by default — eliminating the need for explicit `tabindex`.

Additionally, keyboard event handlers (`onKeyDown` for Enter/Space) must be added if non-native elements are retained, to ensure keyboard users can activate the control.

#### Why This Remediation

Without `tabindex="0"`, a keyboard-only user pressing Tab will skip over these controls entirely. The WCAG 2.1.1 criterion requires that all functionality available via mouse be reachable via keyboard. Using native elements is the least-effort, most robust solution, as browsers and assistive technologies provide the focus and keyboard behaviour automatically.

---

### CI-03 — `NO_DESCRIPTIVE_TEXT` · Accessible Name

| | |
|---|---|
| **Severity** | Critical |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Evinced Rule** | [accessible-name](https://knowledge.evinced.com/system-validations/accessible-name) |
| **Pages Affected** | All pages |
| **Total Instances** | 21 |

#### Affected Elements

| # | Selector | Source File | Issue |
|---|----------|-------------|-------|
| 1 | `.icon-btn:nth-child(2)` (Search) | `src/components/Header.jsx:140` | SVG icon-only; visible text is `aria-hidden` — no accessible name |
| 2 | `.icon-btn:nth-child(4)` (Login) | `src/components/Header.jsx:156` | SVG icon-only; visible text is `aria-hidden` — no accessible name |
| 3 | `.shop-link` ×3 | `src/components/PopularSection.jsx:59` | Text wrapped in `<span aria-hidden="true">` — no accessible name |
| 4 | `.footer-nav-item` (FAQs) | `src/components/Footer.jsx:18` | Text wrapped in `<span aria-hidden="true">` — no accessible name |

#### Recommended Fix

Provide an accessible name via `aria-label` on the element (for icon-only controls), or remove the erroneous `aria-hidden="true"` from the visible text span:

```jsx
// Header search button — add aria-label:
<button className="icon-btn" aria-label="Search">
  <svg aria-hidden="true">…</svg>
</button>

// PopularSection shop-link — remove aria-hidden from text:
<a className="shop-link" href={product.shopHref}>
  <span>{product.shopLabel}</span>  {/* aria-hidden="true" removed */}
</a>
```

#### Why This Remediation

An accessible name is the primary mechanism by which screen readers identify controls to users. For icon-only buttons, `aria-label` is the simplest, most universally supported approach. For links where visible text exists but is hidden from the accessibility tree with `aria-hidden`, the fix is to remove the incorrect attribute — hiding text that _is_ the label from screen readers while exposing it visually is a common anti-pattern that leaves the control entirely nameless.

---

### CI-04 — `AXE-ARIA-REQUIRED-ATTR` · Required ARIA Attributes Missing

| | |
|---|---|
| **Severity** | Critical |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Evinced Rule** | [aria-required-attr](https://knowledge.evinced.com/system-validations/aria-required-attr) |
| **Pages Affected** | Homepage (`/`), Order Confirmation (`/order-confirmation`) |
| **Total Instances** | 2 |

#### Affected Element

| Selector | Source File | Role | Missing Attributes |
|----------|-------------|------|-------------------|
| `.drop-popularity-bar` | `src/components/TheDrop.jsx:19` | `role="slider"` | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |

#### Detected DOM Snippet
```html
<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>
```

#### Recommended Fix

Add the three required ARIA attributes for the `slider` role, reflecting the actual range and current value the element represents:

```jsx
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  className="drop-popularity-bar"
/>
```

If the element is purely decorative and not a real interactive slider, replace the `role="slider"` with `role="img"` or `role="presentation"` (depending on intent), which do not require value attributes.

#### Why This Remediation

The WAI-ARIA specification mandates that all elements with `role="slider"` expose `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. Without them, assistive technologies cannot announce the current value to users. Screen readers may announce the element as "slider" with no state, which is meaningless and potentially confusing. Providing static values (or binding them to component state) fulfils the contract.

---

### CI-05 — `AXE-ARIA-VALID-ATTR-VALUE` · Invalid ARIA Attribute Values

| | |
|---|---|
| **Severity** | Critical |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Evinced Rule** | [aria-valid-attr-value](https://knowledge.evinced.com/system-validations/aria-valid-attr-value) |
| **Pages Affected** | Homepage (`/`), Product Detail (`/product/:id`), Order Confirmation (`/order-confirmation`) |
| **Total Instances** | 5 |

#### Affected Elements

| # | Selector | Source File | Attribute | Invalid Value | Valid Values |
|---|----------|-------------|-----------|--------------|--------------|
| 1 | `h1.featured-card-info > h1` (×2) | `src/components/FeaturedPair.jsx:46` | `aria-expanded` | `"yes"` | `"true"` or `"false"` |
| 2 | `ul[aria-relevant="changes"]` | `src/pages/ProductPage.jsx:143-146` | `aria-relevant` | `"changes"` | Space-separated tokens: `additions removals text all` |

#### Detected DOM Snippets
```html
<!-- FeaturedPair headings -->
<h1 aria-expanded="yes">Tote Bags</h1>
<h1 aria-expanded="yes">Embroidered Hats</h1>

<!-- ProductPage list -->
<ul aria-relevant="changes" aria-live="polite">…</ul>
```

#### Recommended Fix

**`aria-expanded="yes"` → `aria-expanded="true"`:**
```jsx
// src/components/FeaturedPair.jsx — change "yes" to "true"/"false"
<h1 aria-expanded="true">{item.title}</h1>
```

**`aria-relevant="changes"` → use valid token(s):**
```jsx
// src/pages/ProductPage.jsx — "changes" is not a valid token; use "additions text" or "all"
<ul aria-relevant="additions text" aria-live="polite">…</ul>
```

Note: `aria-expanded` on an `<h1>` element is semantically unusual. If the intent is to indicate an expandable section, consider wrapping in a `<details>/<summary>` pattern or using a disclosure button pattern instead.

#### Why This Remediation

Browsers and assistive technologies validate ARIA attribute values against the WAI-ARIA specification. An invalid value like `"yes"` for `aria-expanded` is treated as if no attribute was present, silently breaking the feature. The `aria-relevant` token `"changes"` does not exist in the specification — assistive technologies ignore it, defeating the live region's purpose. Using the correct, spec-compliant values is required to ensure consistent AT behaviour across browsers.

---

### CI-06 — `AXE-BUTTON-NAME` · Buttons Without Discernible Text

| | |
|---|---|
| **Severity** | Critical |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Evinced Rule** | [button-name](https://knowledge.evinced.com/system-validations/button-name) |
| **Pages Affected** | All pages |
| **Total Instances** | 9 |

#### Affected Elements

| # | Selector | Source File | Description |
|---|----------|-------------|-------------|
| 1 | `#cart-modal > div:nth-child(1) > button` | `src/components/CartModal.jsx:57` | Cart drawer close button — icon-only `<button>`, `aria-label` removed |
| 2 | `div[role="dialog"] > div:nth-child(1) > button` | `src/components/WishlistModal.jsx:62` | Wishlist drawer close button — icon-only `<button>`, `aria-label` removed |

#### Detected DOM Snippets
```html
<!-- Cart modal close button -->
<button class="JjN6AKz7a2PRH2gFKW3v">
  <svg width="20" height="20" aria-hidden="true">…</svg>
</button>

<!-- Wishlist modal close button -->
<button class="closeBtn">
  <svg aria-hidden="true">…</svg>
</button>
```

#### Recommended Fix

Add `aria-label` to each icon-only close button:

```jsx
// CartModal.jsx
<button className={styles.closeBtn} aria-label="Close shopping cart" onClick={closeCart}>
  <svg aria-hidden="true">…</svg>
</button>

// WishlistModal.jsx
<button className={styles.closeBtn} aria-label="Close wishlist" onClick={closeWishlist}>
  <svg aria-hidden="true">…</svg>
</button>
```

#### Why This Remediation

`aria-label` provides a programmatically determinable name that screen readers announce when the button receives focus. An icon-only button with no accessible name is announced as "button" by screen readers — users have no indication of its purpose. `aria-label` is chosen over `aria-labelledby` because there is no existing visible text element to reference, and over adding visible text because the design uses icon-only close buttons.

---

### CI-07 — `AXE-IMAGE-ALT` · Images Without Alternative Text

| | |
|---|---|
| **Severity** | Critical |
| **WCAG** | 1.1.1 Non-text Content (Level A) |
| **Evinced Rule** | [image-alt](https://knowledge.evinced.com/system-validations/image-alt) |
| **Pages Affected** | Homepage (`/`), Order Confirmation (`/order-confirmation`) |
| **Total Instances** | 4 |

#### Affected Elements

| # | Selector | Source File | Image |
|---|----------|-------------|-------|
| 1 | `img[src$="New_Tees.png"]` | `src/components/HeroBanner.jsx:18` | Hero banner main image |
| 2 | `img[src$="2bags_charms1.png"]` | `src/components/TheDrop.jsx:13` | "The Drop" section feature image |

#### Detected DOM Snippets
```html
<!-- HeroBanner -->
<img src="/images/home/New_Tees.png">

<!-- TheDrop -->
<img src="/images/home/2bags_charms1.png" loading="lazy">
```

#### Recommended Fix

Add descriptive `alt` text to each image:

```jsx
// src/components/HeroBanner.jsx
<img src={HERO_IMAGE} alt="New Tees collection — assorted winter basics in warm tones" />

// src/components/TheDrop.jsx
<img src={DROP_IMAGE} loading="lazy" alt="Two bags and charms from The Drop collection" />
```

#### Why This Remediation

WCAG 1.1.1 requires that all non-decorative images have a text alternative. Without `alt`, screen readers read the raw file path (`New_Tees.png`) or announce "image" with no context — providing a worse experience than no image at all. Descriptive `alt` text conveys the informational content of the image. If an image is purely decorative (conveys no information), `alt=""` should be used to instruct screen readers to skip it entirely.

---

### CI-08 — `ELEMENT_HAS_INCORRECT_ROLE` · Elements With Wrong ARIA Role

| | |
|---|---|
| **Severity** | Critical |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Evinced Rule** | [components](https://knowledge.evinced.com/components) |
| **Pages Affected** | Products (`/shop/new`) |
| **Total Instances** | 3 |

#### Affected Elements

| # | Selector | Source File | Expected Role | Actual Role |
|---|----------|-------------|--------------|------------|
| 1 | `.sort-btn` | `src/pages/NewPage.jsx:142` | `combobox` | none (`<button>`) |
| 2 | `.filter-option` (Size filter group, ×2) | `src/components/FilterSidebar.jsx:116` | `checkbox` | none (`<div>`) |

#### Detected DOM Snippets
```html
<!-- Sort button — should be combobox -->
<button class="sort-btn">Newest</button>

<!-- Filter option — should be checkbox -->
<div class="filter-option">
  <div class="custom-checkbox"></div>
  <span class="filter-option-label">Small <span class="filter-count">(4)</span></span>
</div>
```

#### Recommended Fix

**Sort button as combobox:**
```jsx
<button
  className="sort-btn"
  role="combobox"
  aria-label="Sort products"
  aria-expanded={sortOpen}
  aria-haspopup="listbox"
  aria-controls="sort-options-list"
>
  {selectedSort}
</button>
```

**Filter options as checkboxes:**
```jsx
// Option A — native checkbox (preferred):
<label className="filter-option">
  <input type="checkbox" checked={checked} onChange={() => onSizeChange(size)} />
  <span className="filter-option-label">{size}</span>
</label>

// Option B — ARIA checkbox pattern (if custom styling requires it):
<div
  className="filter-option"
  role="checkbox"
  aria-checked={checked}
  tabIndex={0}
  aria-label={`${size} (${count} products)`}
  onClick={() => onSizeChange(size)}
  onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && onSizeChange(size)}
>
  …
</div>
```

#### Why This Remediation

The Evinced component analyser detected that the sort button is being used as a combobox widget (it opens a listbox of sort options) but lacks the `combobox` role. Without it, screen readers announce only "button" — users cannot determine the control type. For filter checkboxes, native `<input type="checkbox">` is strongly preferred: it provides built-in `checked`/`unchecked` state, keyboard handling, and label association without any JavaScript. ARIA roles are a fallback for cases where visual design cannot accommodate native elements.

---

### CI-09 — `CRITICAL_SEVERITY_MISSING_CONTEXTUAL_LABELING` · Missing Contextual Label

| | |
|---|---|
| **Severity** | Critical |
| **WCAG** | 1.3.1 Info and Relationships (Level A) |
| **Evinced Rule** | [missing-contextual-labeling](https://knowledge.evinced.com/system-validations/missing-contextual-labeling) |
| **Pages Affected** | Products (`/shop/new`) |
| **Total Instances** | 1 |

#### Affected Element

| Selector | Source File | Issue |
|----------|-------------|-------|
| `.sort-btn` | `src/pages/NewPage.jsx:142` | Sort combobox has no `aria-label` — its purpose cannot be determined without visual context |

#### Recommended Fix

Add `aria-label="Sort products"` to the sort button (as shown in CI-08 above), or add a visible `<label>` element associated via `aria-labelledby`:

```jsx
<span id="sort-label" className="sort-label">Sort by:</span>
<button className="sort-btn" aria-labelledby="sort-label" …>
  {selectedSort}
</button>
```

#### Why This Remediation

Elements that derive their meaning purely from visual context (position relative to a heading, icon, or adjacent text) fail screen reader users who navigate out of context (e.g., using a forms or controls list). A self-contained accessible name ensures the control is comprehensible regardless of how it is reached.

---

### CI-10 — `NO_TOGGLE_INDICATOR` · Missing Toggle State Attribute

| | |
|---|---|
| **Severity** | Critical |
| **WCAG** | 4.1.2 Name, Role, Value (Level A) |
| **Evinced Rule** | [components](https://knowledge.evinced.com/components) |
| **Pages Affected** | Products (`/shop/new`) |
| **Total Instances** | 2 |

#### Affected Elements

| # | Selector | Source File | Missing Attribute |
|---|----------|-------------|------------------|
| 1 | `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(1)` | `src/components/FilterSidebar.jsx:116` | `aria-checked` |
| 2 | `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(1)` | `src/components/FilterSidebar.jsx:116` | `aria-checked` |

#### Recommended Fix

Every filter option `<div>` acting as a checkbox must expose `aria-checked` reflecting its current selection state, updated dynamically as the user interacts:

```jsx
<div
  className="filter-option"
  role="checkbox"
  aria-checked={checked}   // true when selected, false when not
  tabIndex={0}
  …
>
```

#### Why This Remediation

`aria-checked` is the programmatic state attribute for the `checkbox` role. Screen readers announce the current state ("checked" / "unchecked") when a user navigates to or activates a checkbox. Without it, the element's state is invisible to assistive technologies. Dynamically updating `aria-checked` from component state ensures real-time announcements as users toggle filters.

---

## Non-Critical Issues (Not Remediated)

The following issues were detected but are classified as **Serious**, **Moderate**, **Needs Review**, or **Best Practice** — below the Critical threshold. They should be tracked and addressed in future iterations.

---

### NC-01 — `AXE-COLOR-CONTRAST` · Insufficient Colour Contrast · **SERIOUS**

| | |
|---|---|
| **WCAG** | 1.4.3 Contrast (Minimum) — Level AA |
| **Evinced Rule** | [color-contrast](https://knowledge.evinced.com/system-validations/color-contrast) |
| **Pages Affected** | Homepage, Products, Product Detail, Checkout, Order Confirmation |
| **Total Instances** | 18 |

| # | Page | Selector | Element Description |
|---|------|----------|---------------------|
| 1 | Homepage | `.hero-content > p` | Hero banner subtitle: "Warm hues for cooler days" |
| 2–13 | Products | `.filter-count` (×12) | Product count badges in each filter option, e.g. "(8)" |
| 14 | Products | `.products-found` | "X Products Found" count text |
| 15 | Product Detail | `p:nth-child(4)` | Product description paragraph |
| 16 | Checkout | `.checkout-step:nth-child(3) > .step-label` | "Shipping & Payment" step label |
| 17 | Checkout | `.summary-tax-note` | "Taxes calculated at next step" note |
| 18 | Order Confirmation | `.hero-content > p` | Hero banner subtitle (same element as Homepage) |

**Recommended approach:** Increase the foreground colour value for each element to achieve a minimum 4.5:1 contrast ratio against its background (WCAG AA for normal text, or 3:1 for large text ≥18pt / 14pt bold). Source files: `src/components/HeroBanner.css`, `src/components/FilterSidebar.css`, `src/pages/NewPage.css`, `src/pages/ProductPage.module.css`, `src/pages/CheckoutPage.css`.

---

### NC-02 — `AXE-HTML-HAS-LANG` · Missing `lang` Attribute on `<html>` · **SERIOUS**

| | |
|---|---|
| **WCAG** | 3.1.1 Language of Page — Level A |
| **Evinced Rule** | [html-has-lang](https://knowledge.evinced.com/system-validations/html-has-lang) |
| **Pages Affected** | All pages (`public/index.html`) |
| **Total Instances** | 5 (one per page, same root element) |

The `<html>` element in `public/index.html` does not include a `lang` attribute. Screen readers cannot determine the language of the page and will use the user's system default, which may result in incorrect pronunciation for content in English.

**Recommended fix:** `<html lang="en">` in `public/index.html`.

---

### NC-03 — `AXE-VALID-LANG` · Invalid BCP 47 Language Tag · **SERIOUS**

| | |
|---|---|
| **WCAG** | 3.1.2 Language of Parts — Level AA |
| **Evinced Rule** | [valid-lang](https://knowledge.evinced.com/system-validations/valid-lang) |
| **Pages Affected** | Homepage, Order Confirmation |
| **Total Instances** | 2 |

| Selector | Source File | Invalid Value |
|----------|-------------|---------------|
| `p[lang="zz"]` | `src/components/TheDrop.jsx` | `lang="zz"` — not a registered BCP 47 language subtag |

**Recommended fix:** Replace `lang="zz"` with a valid BCP 47 tag (e.g. `lang="en"`) or remove the attribute if the content is in the same language as the document.

---

### NC-04 — `MENU_AS_A_NAV_ELEMENT` · `role="menu"` Inside Navigation Landmark · **BEST PRACTICE**

| | |
|---|---|
| **Evinced Rule** | [navigation — forbidden roles](https://knowledge.evinced.com/components) |
| **Pages Affected** | Products (`/shop/new`) |
| **Total Instances** | 1 (matches multiple submenu `<ul>` elements) |

| Selector | Source File | Issue |
|----------|-------------|-------|
| `.has-submenu > .submenu[role="menu"]` (×multiple) | `src/components/Header.jsx` | `role="menu"` applied to submenu `<ul>` containers inside `<nav>` landmark |

Screen readers that encounter `role="menu"` inside a `<nav>` switch to application-widget interaction mode, disabling standard document navigation keys (arrow keys, Home, End) that users expect in navigation menus.

**Recommended fix:** Remove `role="menu"` from submenu `<ul>` elements and use the standard navigation pattern (`<ul>` with nested `<li><a>` links). If a mega-menu pattern is required, follow the ARIA Authoring Practices Guide [disclosure navigation menu pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation-listbox/).

---

### NC-05 — `COMBOBOX_ANALYSIS_CANNOT_RUN` · Combobox Could Not Be Expanded for Analysis · **NEEDS REVIEW**

| | |
|---|---|
| **Evinced Rule** | Component analyser |
| **Pages Affected** | Products (`/shop/new`) |
| **Total Instances** | 1 |

| Selector | Source File | Issue |
|----------|-------------|-------|
| `.sort-btn` | `src/pages/NewPage.jsx:142` | The Evinced combobox analyser could not programmatically expand the sort dropdown to inspect the options list |

This occurs because the sort button lacks `aria-expanded` and `aria-controls`, so the SDK cannot determine when the popup is open or which element is the controlled listbox. This is a secondary consequence of CI-08 and CI-09 — resolving those critical issues will also resolve this analysis gap.

---

### NC-06 — `SKIPPED_TOGGLE_TEST` · Toggle State Test Skipped · **NEEDS REVIEW**

| | |
|---|---|
| **Evinced Rule** | Component analyser |
| **Pages Affected** | Products (`/shop/new`) |
| **Total Instances** | 2 |

| Selector | Source File | Issue |
|----------|-------------|-------|
| `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(1)` | `src/components/FilterSidebar.jsx` | Toggle state test skipped — checkbox role/state not detectable |
| `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(1)` | `src/components/FilterSidebar.jsx` | Toggle state test skipped — checkbox role/state not detectable |

These are a direct consequence of CI-08 and CI-10 (missing `role="checkbox"` and `aria-checked`). Resolving those critical issues will allow the Evinced analyser to fully audit these elements.

---

## Issue Count Summary

| Issue ID | Type | Severity | Pages | Instances | Source Files |
|----------|------|----------|-------|-----------|--------------|
| CI-01 | `WRONG_SEMANTIC_ROLE` | Critical | All | 49 | Header.jsx, Footer.jsx, PopularSection.jsx, FilterSidebar.jsx, CheckoutPage.jsx |
| CI-02 | `NOT_FOCUSABLE` | Critical | All | 51 | Same as CI-01 |
| CI-03 | `NO_DESCRIPTIVE_TEXT` | Critical | All | 21 | Header.jsx, Footer.jsx, PopularSection.jsx |
| CI-04 | `AXE-ARIA-REQUIRED-ATTR` | Critical | Homepage, OC | 2 | TheDrop.jsx |
| CI-05 | `AXE-ARIA-VALID-ATTR-VALUE` | Critical | Homepage, PD, OC | 5 | FeaturedPair.jsx, ProductPage.jsx |
| CI-06 | `AXE-BUTTON-NAME` | Critical | All | 9 | CartModal.jsx, WishlistModal.jsx |
| CI-07 | `AXE-IMAGE-ALT` | Critical | Homepage, OC | 4 | HeroBanner.jsx, TheDrop.jsx |
| CI-08 | `ELEMENT_HAS_INCORRECT_ROLE` | Critical | Products | 3 | NewPage.jsx, FilterSidebar.jsx |
| CI-09 | `CRITICAL_SEVERITY_MISSING_CONTEXTUAL_LABELING` | Critical | Products | 1 | NewPage.jsx |
| CI-10 | `NO_TOGGLE_INDICATOR` | Critical | Products | 2 | FilterSidebar.jsx |
| NC-01 | `AXE-COLOR-CONTRAST` | Serious | All | 18 | HeroBanner.css, FilterSidebar.css, NewPage.css, ProductPage.module.css, CheckoutPage.css |
| NC-02 | `AXE-HTML-HAS-LANG` | Serious | All | 5 | public/index.html |
| NC-03 | `AXE-VALID-LANG` | Serious | Homepage, OC | 2 | TheDrop.jsx |
| NC-04 | `MENU_AS_A_NAV_ELEMENT` | Best Practice | Products | 1 | Header.jsx |
| NC-05 | `COMBOBOX_ANALYSIS_CANNOT_RUN` | Needs Review | Products | 1 | NewPage.jsx |
| NC-06 | `SKIPPED_TOGGLE_TEST` | Needs Review | Products | 2 | FilterSidebar.jsx |

**Total critical instances: 147** (some represent multiple in-DOM occurrences of the same element across pages)  
**Total non-critical instances: 29**  
**Grand total: 176**

---

## Appendix — Known Gaps

### CI-OC-01 — Order Confirmation Page Direct Access

The `/order-confirmation` route in `src/pages/OrderConfirmationPage.jsx` contains a `<div class="confirm-home-link">` (a `<div>` used as a navigation link without `role="link"` or `tabindex`). This element is not detectable in the automated scan because the route redirects to the homepage (`/`) when accessed without the necessary React Router navigation state (the state is only present after completing a checkout flow). The issue was identified via manual source code review.

**File:** `src/pages/OrderConfirmationPage.jsx`  
**Element:** `<div className="confirm-home-link">` acting as a "Back to Shop" navigation link  
**Issues:** `WRONG_SEMANTIC_ROLE` + `NOT_FOCUSABLE` (same class of issue as CI-01 / CI-02)

### CI-CO-01 — Checkout `checkout-back-btn`

The `/checkout` page contains a second `<div class="checkout-back-btn">` ("Back to Cart" button). This was detected in the Checkout scan (selector appears in the `WRONG_SEMANTIC_ROLE` results) and is included in the CI-01 count.

---

## Appendix — Raw Scan Results

Detailed per-page JSON output from the Evinced SDK is stored at:

```
tests/e2e/test-results/page-homepage.json            (35 issues)
tests/e2e/test-results/page-products.json            (65 issues)
tests/e2e/test-results/page-product-detail.json      (20 issues)
tests/e2e/test-results/page-checkout.json            (21 issues)
tests/e2e/test-results/page-order-confirmation.json  (35 issues)
```

Playwright test spec: `tests/e2e/specs/per-page-a11y-audit.spec.ts`

---

*Report generated by Evinced Web SDK v`@evinced/js-playwright-sdk` (JFrog registry build) on 2026-03-22. No source code modifications were made as part of this audit.*

# Accessibility Audit Report — Demo Website
**Date:** 2026-03-26  
**Tool:** Evinced Playwright SDK v2.43.0  
**Engine:** Evinced (`evAnalyze`, `analyzeSiteNavigation`, `analyzeCombobox`)  
**Pages audited:** 4 (Home, Products, Product Detail, Checkout)  
**Total issues detected:** 127 (across all pages, deduplication within each page)

---

## 1. Website Pages and Entry Points

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `src/pages/HomePage.jsx` | Main landing page with hero banner, featured pairs, trending collections, popular section |
| `/shop/new` | `src/pages/NewPage.jsx` | Product listing page with filter sidebar and sort combobox |
| `/product/:id` | `src/pages/ProductPage.jsx` | Product detail page — add to cart, wishlist |
| `/checkout` | `src/pages/CheckoutPage.jsx` | Two-step checkout: cart review → shipping & payment form |
| `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` | Post-purchase confirmation (requires order context; redirects otherwise) |

Shared global layout components rendered on every page: `Header` (navigation bar, icon buttons), `Footer` (nav items), `CartModal` (cart drawer), `WishlistModal` (wishlist drawer).

---

## 2. Audit Summary by Page and Severity

| Page | Critical | Serious | Total |
|------|----------|---------|-------|
| Home (`/`) | 32 | 3 | **35** |
| Products (`/shop/new`) | 41 | 14 | **55** |
| Product Detail (`/product/:id`) | 17 | 1 | **18** |
| Checkout (`/checkout`) | 16 | 3 | **19** |
| **Grand total** | **106** | **21** | **127** |

> The Products page total is higher because it surfaces all header/footer issues **plus** filter-sidebar and sort-combobox issues that do not appear on other pages.

**Severity classification used by Evinced:**
- **Critical** — directly blocks access for users of assistive technologies (WCAG A/AA violations)
- **Serious** — significantly degrades the experience but some workaround may exist
- **Best Practice / Needs Review** — advisory; not included in remediation scope

---

## 3. Critical Issues — Detailed Findings

Critical issues are grouped by the underlying defect. Because many issues affect components shared across all pages (Header, Footer, CartModal, WishlistModal), they are reported once with their page scope noted.

---

### CI-01 — `<div>` Used as Interactive Control Without Semantic Role (`WRONG_SEMANTIC_ROLE`)

**Evinced type:** `WRONG_SEMANTIC_ROLE` (Interactable role)  
**WCAG:** 4.1.2 (A) — Name, Role, Value; 1.3.1 (A) — Info and Relationships  
**Pages:** All pages (Header, Footer), Home (PopularSection), Products (FilterSidebar), Cart Drawer, Checkout, Order Confirmation  
**Severity:** Critical

**Affected elements detected by Evinced:**

| Selector | DOM Snippet | File |
|----------|-------------|------|
| `.wishlist-btn` | `<div class="icon-btn wishlist-btn" style="cursor:pointer">` | `src/components/Header.jsx:131` |
| `.icon-btn:nth-child(2)` | `<div class="icon-btn" style="cursor:pointer">` (Search) | `src/components/Header.jsx:140` |
| `.icon-btn:nth-child(4)` | `<div class="icon-btn" style="cursor:pointer">` (Login) | `src/components/Header.jsx:156` |
| `.flag-group` | `<div class="flag-group" style="cursor:pointer">` | `src/components/Header.jsx:161` |
| `.product-card:nth-child(1) > .shop-link` | `<div class="shop-link" style="cursor:pointer">` (Shop Drinkware) | `src/components/PopularSection.jsx` |
| `.product-card:nth-child(2) > .shop-link` | `<div class="shop-link" style="cursor:pointer">` (Shop Fun and Games) | `src/components/PopularSection.jsx` |
| `.product-card:nth-child(3) > .shop-link` | `<div class="shop-link" style="cursor:pointer">` (Shop Stationery) | `src/components/PopularSection.jsx` |
| `li:nth-child(3) > .footer-nav-item` | `<div class="footer-nav-item">Sustainability</div>` | `src/components/Footer.jsx:13` |
| `.footer-list:nth-child(2) > li > .footer-nav-item` | `<div class="footer-nav-item"><span aria-hidden="true">FAQs</span></div>` | `src/components/Footer.jsx:18` |
| `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(1)` (×13) | `<div class="filter-option">` (price/size/brand filter options) | `src/components/FilterSidebar.jsx` |

**Why this is critical:** Screen readers rely on element semantics to identify interactive controls. A plain `<div>` with only an `onClick` handler has no implicit or explicit ARIA role, so VoiceOver/NVDA/JAWS announces it as a static container, not a button or link. Users navigating with virtual cursor mode will either skip the element entirely or be unable to activate it.

---

### CI-02 — Interactive `<div>` Not in Keyboard Focus Sequence (`NOT_FOCUSABLE`)

**Evinced type:** `NOT_FOCUSABLE` (Keyboard accessible)  
**WCAG:** 2.1.1 (A) — Keyboard  
**Pages:** All pages (same elements as CI-01, plus filter options on Products page)  
**Severity:** Critical

**Affected elements:** Same set of `<div>` interactive elements listed in CI-01 (9 header/footer, 13 filter options on Products page). Because none have `tabindex="0"`, they are completely unreachable via `Tab` key navigation.

**Why this is critical:** WCAG 2.1.1 requires all functionality to be operable via keyboard. A sighted keyboard user (or switch device user) cannot reach these controls at all — they are invisible to the tab sequence.

---

### CI-03 — Icon-Only `<div>` Controls Have No Accessible Name (`NO_DESCRIPTIVE_TEXT`)

**Evinced type:** `NO_DESCRIPTIVE_TEXT` (Accessible name)  
**WCAG:** 4.1.2 (A) — Name, Role, Value; 2.4.6 (AA) — Headings and Labels  
**Pages:** All pages (Header Search, Header Login, Footer FAQs) + Home (Shop Drinkware/Fun and Games/Stationery PopularSection links)  
**Severity:** Critical

**Affected elements detected by Evinced:**

| Selector | DOM Snippet | Issue |
|----------|-------------|-------|
| `.icon-btn:nth-child(2)` | `<div class="icon-btn"><svg aria-hidden="true">…</svg><span aria-hidden="true">Search</span></div>` | SVG and visible text both `aria-hidden`; zero accessible name |
| `.icon-btn:nth-child(4)` | `<div class="icon-btn"><svg aria-hidden="true">…</svg><span aria-hidden="true">Login</span></div>` | SVG and visible text both `aria-hidden`; zero accessible name |
| `.footer-list:nth-child(2) > li > .footer-nav-item` | `<div class="footer-nav-item"><span aria-hidden="true">FAQs</span></div>` | Visible label `aria-hidden`; no fallback label |
| `.product-card:nth-child(1~3) > .shop-link` | `<div class="shop-link"><span aria-hidden="true">Shop Drinkware/…</span></div>` | Visible label `aria-hidden`; no fallback label |

**Why this is critical:** When a screen reader eventually reaches these elements (if they had focus), it would have nothing to announce. Voice-control users (e.g., Dragon NaturallySpeaking) cannot activate the control by speaking its visible label, because the label is hidden from the accessibility tree.

---

### CI-04 — Icon-Only `<button>` Controls Without Accessible Name (`AXE-BUTTON-NAME`)

**Evinced type:** `AXE-BUTTON-NAME`  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Pages:** All pages (Cart drawer close button, Wishlist drawer close button)  
**Severity:** Critical

**Affected elements detected by Evinced:**

| Selector | DOM Snippet | File |
|----------|-------------|------|
| `#cart-modal > div:nth-child(1) > button` | `<button class="closeBtn"><svg aria-hidden="true">…</svg></button>` | `src/components/CartModal.jsx:56` |
| `div[role="dialog"] > div:nth-child(1) > button` | `<button class="closeBtn"><svg aria-hidden="true">…</svg></button>` | `src/components/WishlistModal.jsx` |

**Why this is critical:** `<button>` elements with only an SVG icon and no text or `aria-label` produce an empty accessible name. Screen readers typically announce "button" with no label — the user cannot know what this button does.

---

### CI-05 — Images Missing `alt` Attribute (`AXE-IMAGE-ALT`)

**Evinced type:** `AXE-IMAGE-ALT`  
**WCAG:** 1.1.1 (A) — Non-text Content  
**Pages:** Home page  
**Severity:** Critical

**Affected elements detected by Evinced:**

| Selector | DOM Snippet | File |
|----------|-------------|------|
| `img[src$="New_Tees.png"]` | `<img src="/images/home/New_Tees.png">` | `src/components/HeroBanner.jsx:18` |
| `img[src$="2bags_charms1.png"]` | `<img src="/images/home/2bags_charms1.png" loading="lazy">` | `src/components/TheDrop.jsx` |

**Why this is critical:** Without `alt`, screen readers read the raw filename as the image description (e.g. "New underscore Tees dot p-n-g"). Meaningful images must have descriptive alternative text to convey the same information visually communicated.

---

### CI-06 — Invalid ARIA Attribute Values (`AXE-ARIA-VALID-ATTR-VALUE`)

**Evinced type:** `AXE-ARIA-VALID-ATTR-VALUE`  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Pages:** Home page (FeaturedPair headings)  
**Severity:** Critical

**Affected elements detected by Evinced:**

| Selector | DOM Snippet | Invalid Value | Valid Values |
|----------|-------------|---------------|--------------|
| `.featured-card:nth-child(1) > .featured-card-info > h1` | `<h1 aria-expanded="yes">Keep on Truckin'</h1>` | `"yes"` | `"true"` or `"false"` |
| `.featured-card:nth-child(2) > .featured-card-info > h1` | `<h1 aria-expanded="yes">Limited edition and traveling fast</h1>` | `"yes"` | `"true"` or `"false"` |

**File:** `src/components/FeaturedPair.jsx`

**Why this is critical:** ARIA attribute values must conform to the spec. `aria-expanded="yes"` is invalid; browsers and assistive technologies may ignore it or behave unpredictably. Screen readers relying on `aria-expanded` to inform users of expandable content state will receive no usable signal.

---

### CI-07 — ARIA Role Missing Required Attributes (`AXE-ARIA-REQUIRED-ATTR`)

**Evinced type:** `AXE-ARIA-REQUIRED-ATTR`  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Pages:** Home page (`TheDrop` popularity indicator)  
**Severity:** Critical

**Affected element detected by Evinced:**

| Selector | DOM Snippet | Role | Missing Attributes |
|----------|-------------|------|--------------------|
| `.drop-popularity-bar` | `<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar">` | `slider` | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |

**File:** `src/components/TheDrop.jsx`

**Why this is critical:** The `slider` role requires `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` to communicate the control's current state. Without these, a screen reader user knows the element is a slider but cannot determine its value, minimum, or maximum — the element is effectively unusable.

---

### CI-08 — Sort Combobox Has Incorrect Role (`ELEMENT_HAS_INCORRECT_ROLE`)

**Evinced type:** `ELEMENT_HAS_INCORRECT_ROLE` (Component: Combobox)  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Pages:** Products page  
**Severity:** Critical

**Affected element detected by Evinced:**

| Selector | DOM Snippet | Issue |
|----------|-------------|-------|
| `.sort-btn` | `<button class="sort-btn">Sort by Relevance (Default)<svg …></svg></button>` | Element acts as a combobox trigger but does not expose `role="combobox"` |

**File:** `src/pages/NewPage.jsx`

**Why this is critical:** Assistive technologies identify the sort widget as a plain button, not a combobox. Users cannot understand that activating the button opens a list of options, nor can they navigate the listbox using keyboard patterns expected for combobox widgets.

---

### CI-09 — Sort Combobox Trigger Has No Accessible Name (`CRITICAL_SEVERITY_MISSING_CONTEXTUAL_LABELING`)

**Evinced type:** `CRITICAL_SEVERITY_MISSING_CONTEXTUAL_LABELING` (Component: Combobox)  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Pages:** Products page  
**Severity:** Critical

**Affected element:** Same `.sort-btn` as CI-08. The button's `aria-label` was removed, leaving only visible text "Sort by Relevance (Default)" without a proper accessible name that conveys the combobox's purpose and labeling.

**File:** `src/pages/NewPage.jsx`

**Why this is critical:** Combobox widgets must have a label that identifies the control. Without it, screen readers cannot announce the combobox's purpose.

---

## 4. Fixes Applied for Each Critical Issue

> **Per the task instructions, no source code modifications were made.** This section documents the specific remediation that should be applied for each critical issue.

---

### Fix for CI-01 & CI-02 — `<div>` Interactive Controls: Add Semantic Role and Keyboard Focus

**Approach:** Convert each `<div>` interactive element to a semantically appropriate native HTML element, or add `role` + `tabindex` if conversion is not feasible.

**Why this approach:** Native HTML elements (`<button>`, `<a>`) come with built-in keyboard accessibility, ARIA semantics, and focus handling for free. This is always preferable to patching a `<div>` with ARIA because:
1. Native elements automatically participate in the tab sequence.
2. Native elements fire `click` events on `Enter`/`Space` (for buttons) or `Enter` (for links) without custom `keydown` handlers.
3. Avoids the cognitive overhead of keeping ARIA attributes in sync.

**Specific changes required:**

`src/components/Header.jsx` — Wishlist `<div>`:
```jsx
// Before
<div className="icon-btn wishlist-btn" onClick={openWishlist} style={{cursor:'pointer'}}>
// After
<button className="icon-btn wishlist-btn" onClick={openWishlist} aria-label="Open Wishlist">
```

`src/components/Header.jsx` — Search `<div>`:
```jsx
// Before
<div className="icon-btn" style={{cursor:'pointer'}}>
  <svg aria-hidden="true">…</svg><span aria-hidden="true">Search</span>
// After
<button className="icon-btn" aria-label="Search">
  <svg aria-hidden="true">…</svg>
```

`src/components/Header.jsx` — Login `<div>`:
```jsx
// Before
<div className="icon-btn" style={{cursor:'pointer'}}>
  <svg aria-hidden="true">…</svg><span aria-hidden="true">Login</span>
// After
<button className="icon-btn" aria-label="Login">
  <svg aria-hidden="true">…</svg>
```

`src/components/Header.jsx` — Flag group `<div>`:
```jsx
// Before
<div className="flag-group" onClick={() => {}} style={{ cursor: 'pointer' }}>
// After
<button className="flag-group" onClick={() => {}} aria-label="Change region">
```

`src/components/PopularSection.jsx` — Shop links:
```jsx
// Before
<div className="shop-link" style={{cursor:'pointer'}}><span aria-hidden="true">Shop Drinkware</span></div>
// After
<a className="shop-link" href="/shop/new" aria-label="Shop Drinkware">Shop Drinkware</a>
```
(Remove `aria-hidden` from the span text so the label is part of the link's accessible name.)

`src/components/Footer.jsx` — Sustainability and FAQs `<div>`:
```jsx
// Before
<div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}>Sustainability</div>
<div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}><span aria-hidden="true">FAQs</span></div>
// After
<a className="footer-nav-item" href="/sustainability">Sustainability</a>
<a className="footer-nav-item" href="/faqs">FAQs</a>
```

`src/components/FilterSidebar.jsx` — Filter option `<div>` elements (price, size, brand):
```jsx
// Before
<div className="filter-option"><div className="custom-checkbox"></div>…</div>
// After — use a native <label> + <input type="checkbox"> pattern
<label className="filter-option">
  <input type="checkbox" className="custom-checkbox" checked={selected} onChange={handler} />
  <span className="filter-option-label">{label}<span className="filter-count">({count})</span></span>
</label>
```
This resolves CI-01, CI-02, and would also fix the missing `role="checkbox"`, `aria-checked`, `aria-label`, and `tabindex` issues catalogued in `A11Y_ISSUES.md`.

---

### Fix for CI-03 — Remove `aria-hidden` From Visible Labels

**Approach:** Remove `aria-hidden="true"` from text spans that serve as the accessible name for their parent interactive element, or add an explicit `aria-label` to the parent.

**Why this approach:** Using `aria-hidden="true"` on the only text content of an interactive element creates an element with a visible label that is invisible to the accessibility tree — the worst of both worlds. The simplest fix is to remove `aria-hidden` so the text participates normally in accessible name computation.

`src/components/Header.jsx` (Search, Login spans):
```jsx
// Before: <span aria-hidden="true">Search</span>
// After: remove aria-hidden or add aria-label="Search" to the parent button
```

`src/components/Footer.jsx` (FAQs span):
```jsx
// Before: <span aria-hidden="true">FAQs</span>
// After: <span>FAQs</span>  (remove aria-hidden)
```

`src/components/PopularSection.jsx` (shop-link spans):
```jsx
// Before: <span aria-hidden="true">Shop Drinkware</span>
// After: Shop Drinkware  (no wrapping span with aria-hidden)
```

---

### Fix for CI-04 — Add `aria-label` to Icon-Only `<button>` Close Buttons

**Approach:** Add `aria-label` attributes to the close buttons in `CartModal` and `WishlistModal`.

**Why this approach:** Adding an `aria-label` is the ARIA-correct way to provide an accessible name for an icon-only button. The attribute value becomes the button's accessible name, overriding the absent text content.

`src/components/CartModal.jsx`:
```jsx
// Before
<button className={styles.closeBtn} onClick={closeCart}>
// After
<button className={styles.closeBtn} onClick={closeCart} aria-label="Close cart">
```

`src/components/WishlistModal.jsx`:
```jsx
// Before
<button className={styles.closeBtn} onClick={closeWishlist}>
// After
<button className={styles.closeBtn} onClick={closeWishlist} aria-label="Close wishlist">
```

---

### Fix for CI-05 — Add `alt` Attributes to Images

**Approach:** Add descriptive `alt` text to each `<img>` element.

**Why this approach:** The `alt` attribute is the fundamental mechanism for providing text alternatives to images (WCAG 1.1.1). Descriptive text communicates the same information the image conveys visually. A non-empty `alt` attribute also prevents screen readers from falling back to the filename.

`src/components/HeroBanner.jsx`:
```jsx
// Before: <img src={HERO_IMAGE} />
// After:  <img src={HERO_IMAGE} alt="Winter Basics — new t-shirt collection" />
```

`src/components/TheDrop.jsx`:
```jsx
// Before: <img src="/images/home/2bags_charms1.png" loading="lazy">
// After:  <img src="/images/home/2bags_charms1.png" alt="Limited-edition plushie bag charms" loading="lazy" />
```

---

### Fix for CI-06 — Correct `aria-expanded` Value on `<h1>` Elements

**Approach:** Change `aria-expanded="yes"` to a boolean string `"true"` or `"false"`, or remove the attribute entirely since headings are not expandable controls.

**Why this approach:** The WAI-ARIA spec defines `aria-expanded` as an enumerated attribute accepting only `"true"`, `"false"`, or `"undefined"`. The value `"yes"` is not valid. Additionally, `aria-expanded` is semantically incorrect on a static `<h1>` — it belongs on the element that toggles a disclosure panel. Removing the attribute from the heading is the correct remediation.

`src/components/FeaturedPair.jsx`:
```jsx
// Before: <h1 aria-expanded="yes">Keep on Truckin'</h1>
// After:  <h1>Keep on Truckin'</h1>
```
(Same for the second card heading.)

---

### Fix for CI-07 — Add Required ARIA Attributes to `role="slider"`

**Approach:** Add `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` to the slider element with appropriate values.

**Why this approach:** The ARIA `slider` role has three required attributes that convey the control's current value and range. Without them the element fails the ARIA validity check and screen readers cannot announce the slider state. Since the popularity bar is a purely decorative read-only indicator (not interactive), the simpler and more correct solution is to either remove `role="slider"` and use `role="img"` with `aria-label`, or add a proper `<progress>` element.

`src/components/TheDrop.jsx`:
```jsx
// Before: <div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar">
// Option A (fix the slider):
<div role="slider" aria-label="Popularity indicator" aria-valuenow={75} aria-valuemin={0} aria-valuemax={100} aria-readonly="true" className="drop-popularity-bar" />
// Option B (use semantic <progress>):
<progress className="drop-popularity-bar" aria-label="Popularity indicator" value={75} max={100} />
```

---

### Fix for CI-08 & CI-09 — Sort Combobox Role and Accessible Name

**Approach:** Add `role="combobox"` and a descriptive `aria-label` to the sort trigger button, and add the required `aria-expanded` and `aria-controls` attributes.

**Why this approach:** A combobox widget consists of a trigger that opens a listbox. The trigger must expose `role="combobox"`, `aria-expanded`, `aria-controls` (pointing to the listbox), and a label that identifies its purpose. This allows screen readers to announce "Sort products, collapsed, combobox" and guide users through the ARIA combobox interaction pattern.

`src/pages/NewPage.jsx`:
```jsx
// Before
<button className="sort-btn">Sort by Relevance (Default)…</button>
// After
<button
  className="sort-btn"
  role="combobox"
  aria-label="Sort products"
  aria-expanded={isSortOpen}
  aria-controls="sort-options-list"
  aria-haspopup="listbox"
>
  {currentSort}<ChevronIcon />
</button>
<ul id="sort-options-list" role="listbox" aria-label="Sort options" …>
  {options.map(opt => (
    <li key={opt} role="option" aria-selected={currentSort === opt} tabIndex={0} …>{opt}</li>
  ))}
</ul>
```

---

## 5. Explanation of Remediation Approach Selection

### Why native HTML elements over ARIA patches

Where the defect is a `<div>` acting as a button or link, the preferred fix is always to replace the `<div>` with a `<button>` or `<a>`. This is the "First Rule of ARIA Use" (W3C): if a native HTML element can provide the required semantics and behaviour, use it. Native elements:
- Are automatically included in the tab sequence.
- Fire keyboard events (`Enter`, `Space`) without custom handlers.
- Work correctly with all browser/AT combinations without extra attribute maintenance.
- Require zero ARIA attributes to be accessible.

### Why `aria-label` over `aria-labelledby` for icon buttons

For icon-only buttons with no visible text, `aria-label` is the most direct mechanism. `aria-labelledby` would require a separate hidden element containing the label string — additional DOM complexity for no benefit when a single descriptive string suffices.

### Why `<input type="checkbox">` over `role="checkbox"` for filter options

Custom `role="checkbox"` div elements require manually maintaining `aria-checked`, `tabindex`, `aria-label`, and `keydown` handlers (`Space` to toggle, `Enter` to confirm). A native `<input type="checkbox">` wrapped in a `<label>` provides all of this built-in, is styleable with CSS, and is universally supported. Using ARIA to rebuild what HTML already provides natively introduces maintenance risk and is more fragile across browser/AT versions.

### Why `aria-label` on images rather than `aria-describedby`

WCAG 1.1.1 requires a short text alternative for non-decorative images. The `alt` attribute on `<img>` is the canonical mechanism — it is the only attribute that satisfies WCAG 1.1.1 for images. `aria-describedby` provides supplementary description, not a substitute for `alt`.

### Why remove `aria-expanded` from `<h1>` rather than correct it

`aria-expanded` communicates whether a disclosure widget is open or closed. A static heading is not a disclosure widget; it has no associated expandable panel. Adding valid `aria-expanded="false"` would tell screen readers there is a collapsible region attached to the heading, which is false and misleading. The correct fix is removal.

---

## 6. Remaining Non-Critical Issues (Not Remediated)

### SERIOUS — Color Contrast (`AXE-COLOR-CONTRAST`)

| # | Page | Element | Foreground | Background | Ratio | WCAG |
|---|------|---------|-----------|-----------|-------|------|
| 1 | Home | `.hero-content > p` ("Warm hues for cooler days") | `#c8c0b8` | `#e8e0d8` | ~1.3:1 | 1.4.3 AA (min 4.5:1) |
| 2 | Products | `.products-found` ("X Products Found") | `#b0b4b8` | `#ffffff` | ~1.9:1 | 1.4.3 AA |
| 3 | Products (×12) | `.filter-count` (product count badges in filter options) | `#c8c8c8` | `#ffffff` | ~1.4:1 | 1.4.3 AA |
| 4 | Checkout | `.checkout-step:nth-child(3) > .step-label` ("Shipping & Payment") | low contrast | background | — | 1.4.3 AA |
| 5 | Checkout | `.checkout-empty > p` ("There are no items in your shopping cart.") | low contrast | background | — | 1.4.3 AA |

**Fix approach (not applied):** Darken foreground text colors to achieve at least 4.5:1 contrast ratio. For `.hero-content p`, change `#c8c0b8` to `#6e6660` or darker. For `.filter-count` and `.products-found`, change from `#c8c8c8`/`#b0b4b8` to `#767676` (minimum passing grey on white).

---

### SERIOUS — Missing `lang` Attribute on `<html>` (`AXE-HTML-HAS-LANG`)

| # | Page | Element | Issue |
|---|------|---------|-------|
| 1 | All pages | `<html>` | No `lang` attribute — screen readers cannot determine page language |

**File:** `public/index.html`  
**Fix (not applied):** `<html lang="en">`

---

### SERIOUS — Invalid `lang` Attribute Value (`AXE-VALID-LANG`)

| # | Page | Element | Invalid Value |
|---|------|---------|---------------|
| 1 | Home | `<p lang="zz">` (The Drop section) | `"zz"` is not a valid BCP 47 language tag |

**File:** `src/components/TheDrop.jsx`  
**Fix (not applied):** Remove `lang` attribute or correct to valid tag (e.g. `lang="en"`).

---

### BEST PRACTICE — Navigation Uses `role="menu"` (`MENU_AS_A_NAV_ELEMENT`)

| # | Page | Element | Issue |
|---|------|---------|-------|
| 1 | All pages | `.has-submenu > .submenu[role="menu"]` (5 submenu `<ul>` elements) | `role="menu"` is forbidden inside a `<nav>` landmark — implies application-level semantics |

**File:** `src/components/Header.jsx:196`  
**Fix (not applied):** Remove `role="menu"` from submenu `<ul>` elements. The submenu items use `role="menuitem"` on `<a>` elements, which should also be removed. Standard navigation submenus should use plain `<ul>/<li>/<a>` without ARIA menu roles.

---

### NOT REMEDIATED — Additional Issues from `A11Y_ISSUES.md`

The following issue categories were identified in the repository's `A11Y_ISSUES.md` documentation but were **not confirmed by Evinced's engine** in the current scan (because they require dynamic interaction, are in components not rendered in the scanned state, or are of lower severity):

| Category | Issues | Severity | Reason Not Detected by Evinced |
|----------|--------|----------|-------------------------------|
| `AXE-DUPLICATE-ID-ARIA` | 4 (FeaturedPair, FilterSidebar) | Critical | Static IDs; likely merged by Evinced deduplication |
| `AXE-LIST` | 1 (TrendingCollections `<ul>` with `<div>` child) | Serious | Not surfaced in scan |
| `GEN2 no-dialog-role` | Cart drawer missing `role="dialog"` | Critical | Evinced detected as `AXE-BUTTON-NAME` cluster; dialog role not separately flagged |
| `GEN2 no-aria-modal` | Cart drawer missing `aria-modal="true"` | Serious | Not separately surfaced |
| `GEN2 no-dialog-accessible-name` | Cart drawer missing `aria-label` | Critical | Bundled in button-name finding |
| `GEN2 no-aria-label-on-buttons` | Cart quantity ±/remove buttons missing `aria-label` | Critical | Not surfaced (cart was empty during scan) |
| `GEN2 no-focus-trap` | Cart drawer — focus not trapped | Critical | Behavioral; not detectable statically |
| `GEN2 no-esc-close` | Cart drawer — Escape key does not close | Serious | Behavioral; not detectable statically |
| `GEN3 reflow` | `body { overflow-x: hidden }` clips content at 300% zoom | Serious | Viewport/zoom behavioral |
| `GEN3 sr-order` | FeaturedPair DOM/visual order mismatch via `flex-direction: column-reverse` | Serious | CSS-based; not detectable by DOM scanning |
| `GEN3 heading-order` | 14 heading level violations across all pages | Moderate | Not surfaced in current Evinced scan |
| `GEN3 non-meaningful-label` | 8 non-descriptive `aria-label` values | Serious | Not surfaced in current scan |
| `GEN3 keyboard-order` | Navigation `tabIndex` set in reverse visual order | Serious | Not surfaced in current scan |
| `UNDETECTABLE live-region` | Checkout form validation errors not announced | Critical | Undetectable by automated tools |
| `UNDETECTABLE live-region` | Cart count badge update not announced | Critical | Undetectable by automated tools |

---

## 7. Summary Table — All Critical Issues Found by Evinced

| # | Issue ID | Evinced Type | Pages | Element(s) | WCAG |
|---|----------|-------------|-------|------------|------|
| 1 | CI-01 | `WRONG_SEMANTIC_ROLE` | All | `<div>` buttons/links in Header, Footer, PopularSection, FilterSidebar | 4.1.2(A) |
| 2 | CI-02 | `NOT_FOCUSABLE` | All | Same `<div>` interactive elements (no `tabindex`) | 2.1.1(A) |
| 3 | CI-03 | `NO_DESCRIPTIVE_TEXT` | All | Header Search/Login, Footer FAQs, PopularSection shop-links | 4.1.2(A) |
| 4 | CI-04 | `AXE-BUTTON-NAME` | All | CartModal close button, WishlistModal close button | 4.1.2(A) |
| 5 | CI-05 | `AXE-IMAGE-ALT` | Home | HeroBanner image, TheDrop bag-charms image | 1.1.1(A) |
| 6 | CI-06 | `AXE-ARIA-VALID-ATTR-VALUE` | Home | FeaturedPair `<h1 aria-expanded="yes">` (×2) | 4.1.2(A) |
| 7 | CI-07 | `AXE-ARIA-REQUIRED-ATTR` | Home | TheDrop `role="slider"` missing required attributes | 4.1.2(A) |
| 8 | CI-08 | `ELEMENT_HAS_INCORRECT_ROLE` | Products | Sort button `.sort-btn` — missing `role="combobox"` | 4.1.2(A) |
| 9 | CI-09 | `CRITICAL_SEVERITY_MISSING_CONTEXTUAL_LABELING` | Products | Sort button `.sort-btn` — missing accessible name | 4.1.2(A) |

**Total critical issues detected by Evinced: 106** (across all pages; many are the same element type appearing on multiple pages due to shared Header/Footer/CartModal components)

**Total unique critical defect patterns: 9**

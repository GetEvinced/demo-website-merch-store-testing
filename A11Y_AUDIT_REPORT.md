# Accessibility Audit Report

**Repository:** demo-website (React SPA — e-commerce demo)  
**Audit Date:** 2026-03-18  
**Tool:** Evinced JS Playwright SDK v2.17.0 (`@evinced/js-playwright-sdk`)  
**Auditor:** Automated Cloud Agent (Cursor)  
**Branch:** cursor/accessibility-audit-report-e2dc  

---

## 1. Scope — Pages Audited

| # | Page | URL | Entry Point |
|---|------|-----|-------------|
| 1 | Homepage | `/` | `src/pages/HomePage.jsx` |
| 2 | New Products | `/shop/new` | `src/pages/NewPage.jsx` |
| 3 | Product Detail | `/product/1` | `src/pages/ProductPage.jsx` |
| 4 | Checkout – Basket | `/checkout` (basket state) | `src/pages/CheckoutPage.jsx` |
| 5 | Checkout – Shipping | `/checkout` (shipping state) | `src/pages/CheckoutPage.jsx` |
| 6 | Order Confirmation | `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` |

All shared layout components (`Header`, `Footer`, `CartModal`, `WishlistModal`) rendered on each page were included in the audit scope.

---

## 2. Summary of Findings

| Severity | Issue Count |
|----------|-------------|
| **Critical** | **145** |
| **Serious** | **25** |
| **Total** | **170** |

### Issue counts by page

| Page | Total | Critical | Serious |
|------|-------|----------|---------|
| Homepage (`/`) | 35 | 32 | 3 |
| New Products (`/shop/new`) | 55 | 41 | 14 |
| Product Detail (`/product/1`) | 20 | 18 | 2 |
| Checkout – Basket | 21 | 18 | 3 |
| Checkout – Shipping | 19 | 18 | 1 |
| Order Confirmation | 20 | 18 | 2 |

> **Note:** Issues appearing in shared components (Header, Footer, CartModal, WishlistModal) are counted on every page they appear. The table above reflects per-page counts, not unique-defect counts.

### Unique critical issue groups

| ID | Evinced Rule | Occurrences | Severity |
|----|-------------|-------------|----------|
| CI-1 | `NOT_FOCUSABLE` | 55 | Critical |
| CI-2 | `WRONG_SEMANTIC_ROLE` | 54 | Critical |
| CI-3 | `NO_DESCRIPTIVE_TEXT` | 21 | Critical |
| CI-4 | `AXE-BUTTON-NAME` | 9 | Critical |
| CI-5 | `AXE-ARIA-VALID-ATTR-VALUE` | 3 | Critical |
| CI-6 | `AXE-IMAGE-ALT` | 2 | Critical |
| CI-7 | `AXE-ARIA-REQUIRED-ATTR` | 1 | Critical |
| **Total** | | **145** | |

### Unique serious issue groups

| ID | Evinced Rule | Occurrences | Severity |
|----|-------------|-------------|----------|
| SI-1 | `AXE-COLOR-CONTRAST` | 18 | Serious |
| SI-2 | `AXE-HTML-HAS-LANG` | 6 | Serious |
| SI-3 | `AXE-VALID-LANG` | 1 | Serious |
| **Total** | | **25** | |

---

## 3. Critical Issues — Detailed Analysis

### CI-1 · NOT_FOCUSABLE

**Rule ID:** `NOT_FOCUSABLE`  
**WCAG:** 2.1.1 Keyboard (Level A) — all functionality must be operable via keyboard  
**Occurrences:** 55 (across all 6 pages)

**Description:** Interactive elements styled with `cursor: pointer` and `onClick` handlers are implemented as `<div>` elements. Because `<div>` is not a native interactive element, it does not receive keyboard focus when a user tabs through the page. Keyboard-only users and screen reader users navigating by Tab are completely unable to discover or activate these controls.

#### Affected Elements

| Element Selector | DOM Snippet | Pages | Source File |
|-----------------|-------------|-------|-------------|
| `.wishlist-btn` | `<div class="icon-btn wishlist-btn" onClick={openWishlist}>` | All 6 | `src/components/Header.jsx:131` |
| `.icon-btn:nth-child(2)` | `<div class="icon-btn" style="cursor: pointer;">` (Search) | All 6 | `src/components/Header.jsx:140` |
| `.icon-btn:nth-child(4)` | `<div class="icon-btn" style="cursor: pointer;">` (Login) | All 6 | `src/components/Header.jsx:156` |
| `.flag-group` | `<div class="flag-group" onClick={() => {}}>` | All 6 | `src/components/Header.jsx:161` |
| `.product-card:nth-child(1..3) > .product-card-info > .shop-link` | `<div class="shop-link" onClick={() => navigate(...)}>` | Homepage | `src/components/PopularSection.jsx:54` |
| `.footer-list:nth-child(1) li:nth-child(3) > .footer-nav-item` | `<div class="footer-nav-item" onClick={() => {}}>Sustainability</div>` | All 6 | `src/components/Footer.jsx:13` |
| `.footer-list:nth-child(2) > li > .footer-nav-item` | `<div class="footer-nav-item" onClick={() => {}}><span aria-hidden>FAQs</span></div>` | All 6 | `src/components/Footer.jsx:18` |
| `.drop-popularity-bar` | `<div role="slider" aria-label="Popularity indicator">` | Homepage | `src/components/TheDrop.jsx:19` |
| `.filter-option` (×12 price/size/brand rows) | `<div class="filter-option" onClick={() => onPriceChange(range)}>` | New Products | `src/components/FilterSidebar.jsx:74,116,156` |
| `.checkout-continue-btn` | `<div class="checkout-continue-btn" onClick={() => setStep('shipping')}>Continue</div>` | Checkout Basket | `src/pages/CheckoutPage.jsx:157` |
| `.checkout-back-btn` | `<div class="checkout-back-btn" onClick={() => setStep('basket')}>← Back to Cart</div>` | Checkout Shipping | `src/pages/CheckoutPage.jsx:298` |
| `.confirm-home-link` | `<div class="confirm-home-link" onClick={() => {}}>← Back to Shop</div>` | Order Confirmation | `src/pages/OrderConfirmationPage.jsx:40` |

#### Recommended Fix

Replace every `<div onClick={…}>` interactive control with a semantically correct native element:

- **Buttons** (trigger an action, no navigation): Use `<button type="button">`.
- **Links** (navigate to a route): Use `<Link to="…">` (React Router) or `<a href="…">`.
- **Filter checkboxes**: Replace the custom `<div class="filter-option">` pattern with a real `<label>` + `<input type="checkbox">` pair.

Native interactive elements are keyboard-focusable by default, receive Enter/Space activation, participate correctly in the tab order, and carry the correct implicit ARIA role — eliminating both CI-1 (not focusable) and CI-2 (wrong semantic role) simultaneously.

**Why this approach:** Replacing with native elements is the lowest-risk remediation because it relies on browser-built-in behaviour rather than adding manual `tabindex`, `onKeyDown`, and `role` attributes — each of which must be maintained independently and are prone to regression. It also satisfies WCAG SC 1.3.1, 2.1.1, and 4.1.2 in one change per element.

---

### CI-2 · WRONG_SEMANTIC_ROLE

**Rule ID:** `WRONG_SEMANTIC_ROLE`  
**WCAG:** 1.3.1 Info and Relationships (A) / 4.1.2 Name, Role, Value (A)  
**Occurrences:** 54 (across all 6 pages)

**Description:** The same `<div>` elements identified in CI-1 also fail to communicate their interactive nature to assistive technologies. A screen reader announces a `<div>` as a generic container, not as a button or link, so users are unaware that the element is actionable even if they somehow navigate to it.

#### Affected Elements

Identical set to CI-1 (see table above). Every `<div>` that acts as a button or link fails both CI-1 and CI-2 simultaneously.

#### Recommended Fix

Same as CI-1: replacing `<div>` with `<button>`, `<a>`, or `<Link>` gives the element the correct implicit ARIA role (`button` or `link`) at no additional cost. No explicit `role="button"` attribute is needed on a `<button>` element — the native element carries it.

**Why this approach:** Using explicit `role="button"` on a `<div>` (the alternative) still leaves the element non-focusable unless `tabindex="0"` is also added, and adds complexity. Native elements handle all semantics atomically.

---

### CI-3 · NO_DESCRIPTIVE_TEXT

**Rule ID:** `NO_DESCRIPTIVE_TEXT`  
**WCAG:** 4.1.2 Name, Role, Value (A) — interactive elements must have an accessible name  
**Occurrences:** 21 (across all 6 pages)

**Description:** Several interactive elements place their visible label text inside a `<span aria-hidden="true">`, which removes that text from the accessibility tree. This leaves the element with no accessible name: screen readers announce only the element's role ("button") with no description of its purpose.

#### Affected Elements

| Element Selector | Accessible Name Problem | Pages | Source File |
|-----------------|------------------------|-------|-------------|
| `.icon-btn:nth-child(2)` (Search) | `<span aria-hidden="true">Search</span>` — text hidden from AT | All 6 | `src/components/Header.jsx:143` |
| `.icon-btn:nth-child(4)` (Login) | `<span aria-hidden="true">Login</span>` — text hidden from AT | All 6 | `src/components/Header.jsx:158` |
| `.shop-link` ×3 (Drinkware / Fun and Games / Stationery) | `<span aria-hidden="true">Shop Drinkware</span>` etc. — text hidden from AT | Homepage | `src/components/PopularSection.jsx:59` |
| `.footer-nav-item` (FAQs) | `<span aria-hidden="true">FAQs</span>` — text hidden from AT | All 6 | `src/components/Footer.jsx:18` |

#### Recommended Fix

Remove the `aria-hidden="true"` attribute from all `<span>` elements that contain visible label text for interactive controls. In cases where the button is icon-only with no visible text at all (e.g. Search and Login are currently text-hidden), add an `aria-label` directly to the parent `<button>` or `<a>` element instead of using `aria-hidden` to suppress the text.

**Why this approach:** `aria-hidden="true"` is appropriate only for purely decorative content (e.g. icon SVGs). Applying it to a text label that describes an action is a misuse that breaks the accessible name computation. Removing it is the minimal, safe fix. Adding `aria-label` on icon-only buttons is the standard WCAG technique G91.

---

### CI-4 · AXE-BUTTON-NAME

**Rule ID:** `AXE-BUTTON-NAME`  
**WCAG:** 4.1.2 Name, Role, Value (A)  
**Occurrences:** 9 (Cart close + Wishlist close, across all pages where modals are rendered)

**Description:** The close buttons in `CartModal` and `WishlistModal` contain only an SVG icon with `aria-hidden="true"`. Because there is no visible text, `aria-label`, or `aria-labelledby` on the `<button>` element, screen readers announce the button with no name — typically as "button" — giving the user no indication of what activating it will do.

#### Affected Elements

| Selector | Modal | Pages Affected | Source File |
|----------|-------|----------------|-------------|
| `#cart-modal > div:nth-child(1) > button` | Cart modal close button | Homepage, New Products, Product Detail | `src/components/CartModal.jsx:56` |
| `div[role="dialog"] > div:nth-child(1) > button` | Wishlist modal close button | Homepage, New Products, Product Detail | `src/components/WishlistModal.jsx:61` |
| `div:nth-child(1) > button` | Wishlist modal close button | Checkout Basket, Checkout Shipping, Order Confirmation | `src/components/WishlistModal.jsx:61` |

Current code in `CartModal.jsx`:
```jsx
<button className={styles.closeBtn} onClick={closeCart}>
  <svg aria-hidden="true">…</svg>
</button>
```

#### Recommended Fix

Add an `aria-label` attribute to each close button:

```jsx
// CartModal.jsx
<button className={styles.closeBtn} onClick={closeCart} aria-label="Close cart">
  <svg aria-hidden="true">…</svg>
</button>

// WishlistModal.jsx
<button ref={closeBtnRef} className={styles.closeBtn} onClick={closeWishlist} aria-label="Close wishlist">
  <svg aria-hidden="true">…</svg>
</button>
```

**Why this approach:** `aria-label` is the most direct way to provide an accessible name when there is no visible text to reference. It avoids introducing new DOM elements (which could break layout), requires only a single attribute change per button, and is universally supported by all screen readers and browsers. WCAG Technique ARIA14 explicitly recommends `aria-label` for icon-only buttons.

---

### CI-5 · AXE-ARIA-VALID-ATTR-VALUE

**Rule ID:** `AXE-ARIA-VALID-ATTR-VALUE`  
**WCAG:** 4.1.2 Name, Role, Value (A)  
**Occurrences:** 3 (2 in FeaturedPair on Homepage; 1 in ProductPage)

**Description:** Two separate ARIA attributes have been assigned values that fall outside the permitted value set defined in the WAI-ARIA specification. Assistive technologies may ignore the attribute, use a default value, or behave unpredictably.

#### Affected Elements

**Occurrence A — `aria-expanded="yes"` on `<h1>` in FeaturedPair (Homepage)**  
Selector: `.featured-card:nth-child(1..2) > .featured-card-info > h1`  
Source: `src/components/FeaturedPair.jsx:46`

```jsx
<h1 aria-expanded="yes">{item.title}</h1>
```

`aria-expanded` requires a boolean value (`"true"` or `"false"`). The string `"yes"` is not valid. Additionally, `aria-expanded` is not a valid attribute for `heading` role elements — it should only appear on elements that control expandable content (buttons, disclosure widgets, etc.).

**Occurrence B — `aria-relevant="changes"` on `<ul>` in ProductPage**  
Selector: `ul[aria-relevant="changes"]`  
Source: `src/pages/ProductPage.jsx:146`

```jsx
<ul aria-relevant="changes" aria-live="polite">
```

`aria-relevant` is a space-separated list of tokens. The valid tokens are: `additions`, `removals`, `text`, `all`. `"changes"` is not a recognised token. Screen readers may ignore the live-region change notifications entirely.

#### Recommended Fix

**Occurrence A:** Remove `aria-expanded` from the `<h1>` element entirely. Heading elements describe document structure and do not expand/collapse; adding `aria-expanded` to them is a semantic error.

```jsx
// Before
<h1 aria-expanded="yes">{item.title}</h1>

// After
<h1>{item.title}</h1>
```

**Occurrence B:** Replace `"changes"` with a valid token. For a stock-level live region that announces text updates, use `aria-relevant="additions text"`. If the live region only needs to announce additions, use `aria-relevant="additions"`.

```jsx
// Before
<ul aria-relevant="changes" aria-live="polite">

// After
<ul aria-relevant="additions text" aria-live="polite">
```

**Why this approach:** Removing the invalid attribute entirely (Occurrence A) is preferable to replacing it with a valid boolean because `aria-expanded` has no semantic meaning on a heading. Fixing the token list (Occurrence B) is preferable to removing the attribute entirely because the intent — to announce live changes — is correct and beneficial for users; only the value needs correcting. Both changes are minimal and carry zero risk of layout impact.

---

### CI-6 · AXE-IMAGE-ALT

**Rule ID:** `AXE-IMAGE-ALT`  
**WCAG:** 1.1.1 Non-text Content (A)  
**Occurrences:** 2 (both on Homepage)

**Description:** Two `<img>` elements in the Homepage do not have an `alt` attribute. Without `alt`, screen readers typically read the image filename (e.g. "New underscore Tees dot P N G"), which is meaningless to the user. Additionally, if the image fails to load, there is no fallback description.

#### Affected Elements

| Selector | Source File | Current Code |
|----------|-------------|--------------|
| `img[src$="New_Tees.png"]` | `src/components/HeroBanner.jsx:18` | `<img src={HERO_IMAGE} />` |
| `img[src$="2bags_charms1.png"]` | `src/components/TheDrop.jsx:13` | `<img src={DROP_IMAGE} loading="lazy" />` |

#### Recommended Fix

Add descriptive `alt` attributes to both images:

```jsx
// HeroBanner.jsx — the image shows winter clothing/t-shirts for the "Winter Basics" promotion
<img src={HERO_IMAGE} alt="Winter Basics — New Tees collection" />

// TheDrop.jsx — the image shows two bag charms (Android, YouTube, Super G plushies)
<img src={DROP_IMAGE} alt="Limited-edition Android, YouTube and Super G plushie bag charms" loading="lazy" />
```

If the images are purely decorative (i.e. the surrounding text already conveys all information), use an empty `alt=""` to mark them as decorative:

```jsx
<img src={HERO_IMAGE} alt="" />
```

**Why this approach:** Adding descriptive `alt` text (WCAG technique H37) is the standard fix for WCAG 1.1.1. Providing a meaningful, concise description gives screen reader users an equivalent experience to sighted users. Using `alt=""` (empty string, not omitted) is appropriate only if the image adds no information beyond what is already in surrounding text.

---

### CI-7 · AXE-ARIA-REQUIRED-ATTR

**Rule ID:** `AXE-ARIA-REQUIRED-ATTR`  
**WCAG:** 4.1.2 Name, Role, Value (A)  
**Occurrences:** 1 (Homepage — TheDrop section)

**Description:** An element with `role="slider"` is missing the three required ARIA attributes that give a slider its state: `aria-valuenow` (current value), `aria-valuemin` (minimum), and `aria-valuemax` (maximum). Without these attributes, the element is non-functional for assistive technologies.

#### Affected Element

| Selector | Source File | Current Code |
|----------|-------------|--------------|
| `.drop-popularity-bar` | `src/components/TheDrop.jsx:19` | `<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>` |

The element appears to be a static visual indicator (no interactive behaviour is wired up), yet it carries `role="slider"` which implies full interactive semantics.

#### Recommended Fix

**Option A (Preferred) — Make it a static display element:**
If this is purely a decorative visual indicator with no interaction, remove `role="slider"` and replace with `role="img"` or make it a purely presentational element:

```jsx
// TheDrop.jsx — if decorative, hide from AT entirely
<div className="drop-popularity-bar" aria-hidden="true"></div>

// OR, if it conveys information (e.g. "high popularity"), use an appropriate role
<div
  className="drop-popularity-bar"
  role="meter"
  aria-label="Popularity indicator"
  aria-valuenow={85}
  aria-valuemin={0}
  aria-valuemax={100}
></div>
```

**Option B — Add required attributes to make it a valid slider:**
If the intent is to expose this as an interactive slider, add all required attributes and wire up keyboard interaction:

```jsx
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={85}
  aria-valuemin={0}
  aria-valuemax={100}
  tabIndex={0}
  className="drop-popularity-bar"
></div>
```

**Why this approach:** Option A is preferred because the current implementation shows no interactive handlers. Assigning `role="slider"` to a non-interactive element misleads both assistive technologies and developers. Removing the slider role and either hiding the element (`aria-hidden`) or exposing it as a meter/progressbar with proper state values is semantically honest and requires the least ongoing maintenance.

---

## 4. Proposed Remediations — File Summary

The following table maps each critical issue group to the source file(s) that need to change.

| Issue ID | Source File(s) | Change Required |
|----------|----------------|-----------------|
| CI-1, CI-2, CI-3 | `src/components/Header.jsx` | Replace `.wishlist-btn`, `.icon-btn:nth-child(2)`, `.icon-btn:nth-child(4)`, `.flag-group` `<div>` elements with `<button>` elements; remove `aria-hidden="true"` from visible text `<span>` children |
| CI-1, CI-2, CI-3 | `src/components/PopularSection.jsx` | Replace `.shop-link` `<div>` with `<Link>` or `<a>`; remove `aria-hidden="true"` from text `<span>` |
| CI-1, CI-2, CI-3 | `src/components/Footer.jsx` | Replace `.footer-nav-item` `<div>` elements with `<a>` or `<button>` elements; remove `aria-hidden="true"` from "FAQs" `<span>` |
| CI-1, CI-2 | `src/components/FilterSidebar.jsx` | Replace `.filter-option` `<div>` elements with `<label>` + `<input type="checkbox">` pairs |
| CI-1, CI-2 | `src/pages/CheckoutPage.jsx` | Replace `.checkout-continue-btn` and `.checkout-back-btn` `<div>` elements with `<button>` elements |
| CI-1, CI-2 | `src/pages/OrderConfirmationPage.jsx` | Replace `.confirm-home-link` `<div>` with `<Link to="/">` |
| CI-4 | `src/components/CartModal.jsx` | Add `aria-label="Close cart"` to close `<button>` |
| CI-4 | `src/components/WishlistModal.jsx` | Add `aria-label="Close wishlist"` to close `<button>` |
| CI-5 | `src/components/FeaturedPair.jsx` | Remove `aria-expanded="yes"` from `<h1>` elements |
| CI-5 | `src/pages/ProductPage.jsx` | Change `aria-relevant="changes"` to `aria-relevant="additions text"` |
| CI-6 | `src/components/HeroBanner.jsx` | Add `alt="Winter Basics — New Tees collection"` to `<img>` |
| CI-6 | `src/components/TheDrop.jsx` | Add `alt="Limited-edition bag charms"` to `<img>` |
| CI-7 | `src/components/TheDrop.jsx` | Remove `role="slider"` from `.drop-popularity-bar` (or add all required aria-value* attrs if interactive) |

---

## 5. Remediation Not Applied

Per the audit scope defined for this run, **no source code changes were made**. This report documents findings only. The table in Section 4 provides the proposed fixes which can be implemented in a follow-up pass.

---

## 6. Remaining Non-Critical Issues (Not Remediated)

The following **25 serious issues** were detected but are outside the critical severity threshold. They are documented here for completeness and future remediation.

---

### SI-1 · AXE-COLOR-CONTRAST

**Rule ID:** `AXE-COLOR-CONTRAST`  
**WCAG:** 1.4.3 Contrast (Minimum) — Level AA (4.5:1 ratio for normal text; 3:1 for large text)  
**Occurrences:** 18

**Description:** Multiple text elements across the site use foreground/background colour combinations that fall below the WCAG AA minimum contrast ratio of 4.5:1.

#### Affected Elements (selected)

| Page | Selector | Description |
|------|----------|-------------|
| Homepage | `.hero-content > p` | Hero subtitle ("Warm hues for cooler days") — light text on light gradient background |
| Homepage | `.hero-banner` | Full hero section flagged as contrast container |
| New Products | `.filter-count` (×9 instances) | Filter option count badge (e.g. "(8)") — light grey on white |
| New Products | `.products-found` | "16 Products Found" text — light grey on white |
| New Products | `.new-page` | New page container flagged |
| Product Detail | `p:nth-child(4)` | Product description text — low-contrast grey |
| Product Detail | `#main-content > div` | Page container flagged |
| Checkout Basket | `.checkout-step:nth-child(3) > .step-label` | "Shipping & Payment" step label — inactive step colour |
| Checkout Basket | `.summary-tax-note` | "Taxes calculated at next step" note — light grey |
| Checkout Basket | `aside` | Order summary aside flagged |
| Checkout Basket | `body` | Body container flagged |
| Order Confirmation | `.confirm-order-id-label` | "Order ID" label — light grey text |
| Order Confirmation | `.confirm-order-id-box` | Order ID container flagged |

**Recommended fix:** Increase the contrast of low-contrast text colours in the corresponding CSS files. Common fixes include darkening `#b0b4b8` filter counts to `#767676` or darker, and darkening the hero subtitle colour. Use a contrast checker (e.g. WebAIM) to verify each fix reaches 4.5:1.

---

### SI-2 · AXE-HTML-HAS-LANG

**Rule ID:** `AXE-HTML-HAS-LANG`  
**WCAG:** 3.1.1 Language of Page — Level A  
**Occurrences:** 6 (one unique root cause, appears on all 6 pages)

**Description:** The `<html>` element in `public/index.html` is missing a `lang` attribute. Screen readers use this attribute to select the correct language engine for pronunciation. Without it, text may be read in the wrong language.

**Source file:** `public/index.html:3`

Current:
```html
<html>
```

**Recommended fix:**
```html
<html lang="en">
```

This single change resolves all 6 occurrences (one per page).

---

### SI-3 · AXE-VALID-LANG

**Rule ID:** `AXE-VALID-LANG`  
**WCAG:** 3.1.2 Language of Parts — Level AA  
**Occurrences:** 1 (Homepage — TheDrop section)

**Description:** A `<p>` element in `TheDrop.jsx` has `lang="zz"`. The value `"zz"` is not a valid BCP 47 language tag. Screen readers may use an incorrect language model for the text inside it.

**Source file:** `src/components/TheDrop.jsx:21`

Current:
```jsx
<p lang="zz">
  Our brand-new, limited-edition plushie bag charms…
</p>
```

**Recommended fix:** Remove the `lang` attribute entirely (the text is in English and the document language is `en`) or correct it to `lang="en"`:

```jsx
<p>
  Our brand-new, limited-edition plushie bag charms…
</p>
```

---

## 7. WCAG Reference Summary

| WCAG Success Criterion | Level | Issue Groups |
|------------------------|-------|-------------|
| 1.1.1 Non-text Content | A | CI-6 |
| 1.3.1 Info and Relationships | A | CI-2 |
| 1.4.3 Contrast (Minimum) | AA | SI-1 |
| 2.1.1 Keyboard | A | CI-1 |
| 3.1.1 Language of Page | A | SI-2 |
| 3.1.2 Language of Parts | AA | SI-3 |
| 4.1.2 Name, Role, Value | A | CI-3, CI-4, CI-5, CI-7 |

---

## 8. Appendix — Raw Audit Data

Raw Evinced SDK JSON results are saved to `/workspace/a11y-results/`:

| File | Page |
|------|------|
| `a11y-results/homepage.json` | Homepage (`/`) |
| `a11y-results/new-products.json` | New Products (`/shop/new`) |
| `a11y-results/product-detail.json` | Product Detail (`/product/1`) |
| `a11y-results/checkout-basket.json` | Checkout – Basket |
| `a11y-results/checkout-shipping.json` | Checkout – Shipping |
| `a11y-results/order-confirmation.json` | Order Confirmation |

Each JSON file contains the full Evinced issue objects, including DOM snippets, bounding boxes, WCAG levels, and knowledge-base links.

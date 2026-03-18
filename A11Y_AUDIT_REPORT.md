# Accessibility Audit Report — Demo Website

**Audit Date:** 2026-03-18  
**Tool:** Evinced JS Playwright SDK v2.17.0  
**Scanner:** Evinced EV-CORE engine  
**Branch:** `cursor/accessibility-audit-report-2128`  
**Auditor:** Automated cloud agent

---

## 1. Executive Summary

A full-site accessibility audit was performed against all six page states of the demo e-commerce website. The Evinced SDK was used inside Playwright tests to scan each page in a running Chromium browser.

| Metric | Value |
|---|---|
| Pages / states scanned | 6 |
| Total issues detected | 170 |
| **Critical** | **145** |
| **Serious** | **25** |
| Moderate | 0 |
| Minor | 0 |

All 170 issues are documented below. **No source-code changes were made** as part of this report — this is a pure audit.

---

## 2. Pages Scanned and Entry Points

| # | Page / State | URL | Entry Point in Source |
|---|---|---|---|
| 1 | Homepage | `http://localhost:3000/` | `src/pages/HomePage.jsx` |
| 2 | New Products | `http://localhost:3000/shop/new` | `src/pages/NewPage.jsx` |
| 3 | Product Detail | `http://localhost:3000/product/1` | `src/pages/ProductPage.jsx` |
| 4 | Checkout – Basket | `http://localhost:3000/checkout` | `src/pages/CheckoutPage.jsx` (basket step) |
| 5 | Checkout – Shipping | `http://localhost:3000/checkout` | `src/pages/CheckoutPage.jsx` (shipping step) |
| 6 | Order Confirmation | `http://localhost:3000/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` |

Routes are declared in `src/components/App.jsx` using React Router v7.

---

## 3. Issue Count Per Page

| Page | Total | Critical | Serious |
|---|---|---|---|
| Homepage (/) | 35 | 32 | 3 |
| New Products (/shop/new) | 55 | 41 | 14 |
| Product Detail (/product/1) | 20 | 18 | 2 |
| Checkout – Basket | 21 | 18 | 3 |
| Checkout – Shipping | 19 | 18 | 1 |
| Order Confirmation | 20 | 18 | 2 |
| **TOTAL** | **170** | **145** | **25** |

---

## 4. Critical Issues (145 total)

Critical issues represent the most severe accessibility barriers. They prevent users of assistive technologies — primarily keyboard-only users and screen reader users — from understanding or operating the interface at all. These map to WCAG 2.x Level A success criteria violations.

---

### CI-1 · NOT_FOCUSABLE — Interactive elements not keyboard-reachable
**Evinced type:** `NOT_FOCUSABLE`  
**Severity:** Critical  
**WCAG:** 2.1.1 Keyboard (Level A)  
**Occurrences across all pages:** 55

#### Description
Multiple interactive `<div>` elements have `onClick` handlers and `cursor: pointer` styling, making them visually clickable, but they are not native interactive elements and have no `tabindex` attribute. Keyboard users cannot reach them via Tab navigation, and they are therefore completely inaccessible without a mouse.

#### Affected Elements and Pages

| Selector | Source File | Pages Affected | Count |
|---|---|---|---|
| `.wishlist-btn` (`div.icon-btn.wishlist-btn`) | `src/components/Header.jsx:131` | All 6 pages | 6 |
| `.icon-btn:nth-child(2)` (Search icon-btn div) | `src/components/Header.jsx:140` | All 6 pages | 6 |
| `.icon-btn:nth-child(4)` (Login icon-btn div) | `src/components/Header.jsx:156` | All 6 pages | 6 |
| `.flag-group` (region selector div) | `src/components/Header.jsx:161` | All 6 pages | 6 |
| `.shop-link` (PopularSection nav divs) | `src/components/PopularSection.jsx:47` | Homepage only | 3 |
| `.footer-nav-item` (Footer nav divs) | `src/components/Footer.jsx:14,18` | 5 pages (not Homepage) | 5 |
| `.checkout-continue-btn` and related checkout divs | `src/pages/CheckoutPage.jsx` | Checkout pages | 5 |
| Various product-card action divs | `src/components/ProductCard.jsx` | New Products | 18 |

**Representative DOM snippets:**
```html
<!-- Header.jsx -->
<div class="icon-btn wishlist-btn" style="cursor: pointer;">
  <svg aria-hidden="true">...</svg>
  <span>Wishlist</span>
</div>

<!-- PopularSection.jsx -->
<div class="shop-link" style="cursor: pointer;">
  <span aria-hidden="true">Shop Drinkware</span>
</div>

<!-- Footer.jsx -->
<div class="footer-nav-item" style="cursor: pointer;">
  <span aria-hidden="true">FAQs</span>
</div>
```

#### Recommended Fix
Replace each interactive `<div>` with a native `<button>` or `<a>` element. Native interactive elements receive keyboard focus automatically and expose the correct ARIA role to assistive technologies with no additional markup needed.

```jsx
// Before (inaccessible)
<div className="icon-btn wishlist-btn" onClick={openWishlist} style={{cursor:'pointer'}}>
  <svg aria-hidden="true">...</svg>
  <span>Wishlist</span>
</div>

// After (accessible)
<button className="icon-btn wishlist-btn" onClick={openWishlist} aria-label="Open wishlist">
  <svg aria-hidden="true">...</svg>
  <span>Wishlist</span>
</button>
```

If the element must remain a `<div>` for layout reasons, add `role="button"` and `tabIndex={0}` along with a `onKeyDown` handler for Enter/Space. However, replacing with a native `<button>` is strongly preferred.

#### Why This Approach
Native HTML elements carry built-in keyboard behaviour, focus management, and ARIA semantics without extra JavaScript. Using `<button>` for actions and `<a>` for navigation is the lowest-risk, most maintainable solution and satisfies WCAG 2.1.1 (Keyboard), 4.1.2 (Name, Role, Value).

---

### CI-2 · WRONG_SEMANTIC_ROLE — `div` used as interactive element without ARIA role
**Evinced type:** `WRONG_SEMANTIC_ROLE`  
**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Occurrences across all pages:** 54

#### Description
The same `<div>` elements described in CI-1 also lack the correct ARIA semantic role. Screen readers announce them as generic regions or plain text, not as buttons or links. Users relying on screen reader shortcuts to navigate by role (e.g., listing all buttons with a rotor) will miss these controls entirely.

#### Affected Elements and Pages

| Selector | Correct Role Needed | Source File | Pages |
|---|---|---|---|
| `.wishlist-btn` | `button` | `Header.jsx:131` | All 6 |
| `.icon-btn` (Search) | `button` | `Header.jsx:140` | All 6 |
| `.icon-btn` (Login) | `button` | `Header.jsx:156` | All 6 |
| `.flag-group` | `button` | `Header.jsx:161` | All 6 |
| `.shop-link` | `link` | `PopularSection.jsx:47` | Homepage |
| `.footer-nav-item` | `link` | `Footer.jsx:14,18` | 5 pages |
| Product-card action divs | `button` / `link` | `ProductCard.jsx` | New Products |
| Checkout action divs | `button` | `CheckoutPage.jsx` | Checkout pages |

**Representative DOM snippets:**
```html
<div class="icon-btn" style="cursor: pointer;">
  <svg aria-hidden="true">...</svg>
  <span aria-hidden="true">Login</span>
</div>
```

This element has `onClick`, `cursor: pointer`, and no `role`. Screen readers announce it as a generic element.

#### Recommended Fix
The same fix as CI-1 resolves CI-2: replacing `<div>` with `<button>` or `<a>` provides both keyboard focusability (CI-1) and the correct semantic role (CI-2) simultaneously.

For navigation links specifically use `<a>` or React Router's `<Link>`:
```jsx
// Footer.jsx — replace div.footer-nav-item with a Link
<li><Link to="/faqs">FAQs</Link></li>
```

#### Why This Approach
Correctly using native elements ensures that ARIA roles are automatic and do not need to be maintained manually. It eliminates the risk of role/state inconsistency when state changes (e.g., disabled state, active state).

---

### CI-3 · NO_DESCRIPTIVE_TEXT — Interactive elements with no accessible name
**Evinced type:** `NO_DESCRIPTIVE_TEXT`  
**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Occurrences across all pages:** 21

#### Description
Several interactive elements either wrap all their visible text in `aria-hidden="true"` or contain only an SVG icon with `aria-hidden="true"`, leaving no accessible name for assistive technologies to announce. Screen readers will either announce an empty label or fall back to reading the element's tag name.

#### Affected Elements and Pages

| Selector | Problem | Source File | Pages |
|---|---|---|---|
| `div.icon-btn` (Search) | `<span aria-hidden="true">Search</span>` | `Header.jsx:142` | All 6 |
| `div.icon-btn` (Login) | `<span aria-hidden="true">Login</span>` | `Header.jsx:158` | All 6 |
| `.shop-link` (PopularSection) | `<span aria-hidden="true">Shop Drinkware</span>` etc. | `PopularSection.jsx:51` | Homepage |
| `.footer-nav-item` | `<span aria-hidden="true">FAQs</span>` | `Footer.jsx:18` | 5 pages |

**Representative DOM snippet:**
```html
<!-- Header: Search button — text is hidden from AT -->
<div class="icon-btn" style="cursor: pointer;">
  <svg aria-hidden="true">...</svg>
  <span aria-hidden="true">Search</span>
</div>

<!-- PopularSection: shop link — label is hidden from AT -->
<div class="shop-link" style="cursor: pointer;">
  <span aria-hidden="true">Shop Drinkware</span>
</div>
```

#### Recommended Fix
Remove `aria-hidden="true"` from the `<span>` inside icon buttons (the text is the accessible name), or add `aria-label` to the interactive element:

```jsx
// Option A – remove aria-hidden from visible label text
<button className="icon-btn" onClick={...}>
  <svg aria-hidden="true">...</svg>
  <span>Search</span>   {/* no aria-hidden */}
</button>

// Option B – add aria-label on the button
<button className="icon-btn" aria-label="Search" onClick={...}>
  <svg aria-hidden="true">...</svg>
  <span aria-hidden="true">Search</span>
</button>
```

For `.shop-link` and `.footer-nav-item`, converting them to proper `<a>` or `<Link>` elements with visible text (without `aria-hidden`) resolves all three issues in CI-1, CI-2, and CI-3 at once.

#### Why This Approach
`aria-hidden="true"` on a text `<span>` that is the only source of an accessible name is a common anti-pattern. Removing it, or providing an explicit `aria-label`, follows the accessible name computation algorithm (AccName spec) and satisfies 4.1.2 Name, Role, Value.

---

### CI-4 · AXE-BUTTON-NAME — Icon-only modal close buttons with no accessible name
**Evinced type:** `AXE-BUTTON-NAME`  
**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A); 1.1.1 Non-text Content (Level A)  
**Occurrences across all pages:** 9

#### Description
The close buttons in `CartModal` and `WishlistModal` are native `<button>` elements (correct semantically), but they contain only an SVG icon with `aria-hidden="true"` and have no `aria-label`, `aria-labelledby`, or visible text. Screen readers will announce them as "button" with no name, which gives users no context about the button's purpose.

#### Affected Elements and Pages

| Selector | Modal | Source File | Pages |
|---|---|---|---|
| `#cart-modal > div:nth-child(1) > button` | CartModal close button | `CartModal.jsx:56` | Homepage, New Products, Product Detail (modal rendered but hidden) |
| `div[role="dialog"] > div:nth-child(1) > button` | WishlistModal close button | `WishlistModal.jsx` | All 6 pages |

**DOM snippet (CartModal):**
```html
<button class="JjN6AKz7a2PRH2gFKW3v">
  <svg width="20" height="20" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
</button>
```

**Source (CartModal.jsx:56–64):**
```jsx
<button
  className={styles.closeBtn}
  onClick={closeCart}
>
  <svg ... aria-hidden="true">...</svg>
</button>
```

#### Recommended Fix
Add `aria-label="Close cart"` (or `"Close wishlist"`) to each close button:

```jsx
// CartModal.jsx
<button
  className={styles.closeBtn}
  onClick={closeCart}
  aria-label="Close cart"
>
  <svg ... aria-hidden="true">...</svg>
</button>

// WishlistModal.jsx
<button
  className={styles.closeBtn}
  onClick={closeWishlist}
  aria-label="Close wishlist"
>
  <svg ... aria-hidden="true">...</svg>
</button>
```

#### Why This Approach
`aria-label` on the `<button>` overrides the accessible name computation and provides a meaningful label without affecting the visual appearance. It is the simplest, most widely supported solution for icon-only buttons (WCAG technique ARIA6).

---

### CI-5 · AXE-ARIA-VALID-ATTR-VALUE — Invalid ARIA attribute values
**Evinced type:** `AXE-ARIA-VALID-ATTR-VALUE`  
**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Occurrences:** 3 (Homepage ×2, Product Detail ×1)

#### Description
Two distinct ARIA attribute values are invalid according to the ARIA specification:

1. **`aria-expanded="yes"`** — The `aria-expanded` attribute accepts only `"true"` or `"false"`. Using `"yes"` means assistive technologies may ignore the attribute entirely, preventing users from knowing whether a section is expanded or collapsed.

2. **`aria-relevant="changes"`** — The `aria-relevant` attribute accepts space-separated tokens from the set: `"additions"`, `"removals"`, `"text"`, `"all"`. `"changes"` is not a valid token; browsers and screen readers will treat the attribute as if it were absent.

#### Affected Elements

| Selector | Invalid Attribute | Correct Value | Source File | Page |
|---|---|---|---|---|
| `.featured-card:nth-child(1) > .featured-card-info > h1` | `aria-expanded="yes"` | `aria-expanded="true"` or remove | `FeaturedPair.jsx:31` | Homepage |
| `.featured-card:nth-child(2) > .featured-card-info > h1` | `aria-expanded="yes"` | `aria-expanded="true"` or remove | `FeaturedPair.jsx:31` | Homepage |
| `ul[aria-relevant="changes"]` | `aria-relevant="changes"` | `aria-relevant="additions text"` | `ProductPage.jsx` | Product Detail |

**DOM snippets:**
```html
<!-- FeaturedPair.jsx: h1 heading incorrectly uses aria-expanded with non-boolean value -->
<h1 aria-expanded="yes">Keep on Truckin'</h1>
<h1 aria-expanded="yes">Limited edition and traveling fast</h1>

<!-- ProductPage.jsx: live region uses invalid aria-relevant token -->
<ul class="..." aria-relevant="changes" aria-live="polite">...</ul>
```

#### Recommended Fix

**For `FeaturedPair.jsx`:**  
The `aria-expanded` attribute is semantically incorrect on a heading `<h1>` (it belongs on disclosure widgets like buttons or comboboxes). The attribute should be removed entirely from the heading. If the intent is to indicate that a section is expanded, use `aria-expanded` on the controlling `<button>` element instead.

```jsx
// Before
<h1 aria-expanded="yes">{item.title}</h1>

// After — remove aria-expanded from the heading
<h1>{item.title}</h1>
```

**For `ProductPage.jsx`:**  
Change the invalid `aria-relevant="changes"` to a valid token combination. The most common equivalent to "changes" (meaning additions and removals of text) is `"additions text"`:

```jsx
// Before
<ul aria-relevant="changes" aria-live="polite">

// After
<ul aria-relevant="additions text" aria-live="polite">
```

#### Why This Approach
Invalid ARIA attribute values cause assistive technologies to silently ignore the attribute, which is worse than omitting the attribute — developers may believe the feature is working when it is not. Correcting to valid values restores the intended semantics. Removing `aria-expanded` from the heading eliminates the semantic mismatch entirely.

---

### CI-6 · AXE-IMAGE-ALT — `<img>` elements missing `alt` attribute
**Evinced type:** `AXE-IMAGE-ALT`  
**Severity:** Critical  
**WCAG:** 1.1.1 Non-text Content (Level A)  
**Occurrences:** 2 (Homepage only)

#### Description
Two informational images on the Homepage do not have an `alt` attribute. When `alt` is absent (not empty, but absent), screen readers typically read the image file name as a fallback (e.g., "New_Tees.png"), which is meaningless and disruptive to screen reader users.

#### Affected Elements

| Selector | Image | Source File | Page |
|---|---|---|---|
| `img[src$="New_Tees.png"]` | Hero banner product image | `HeroBanner.jsx:14` | Homepage |
| `img[src$="2bags_charms1.png"]` | TheDrop product image | `TheDrop.jsx:10` | Homepage |

**DOM snippets:**
```html
<!-- HeroBanner.jsx: img with no alt attribute -->
<img src="/images/home/New_Tees.png">

<!-- TheDrop.jsx: img with no alt attribute -->
<img src="/images/home/2bags_charms1.png" loading="lazy">
```

**Source (HeroBanner.jsx:14):**
```jsx
<img src={HERO_IMAGE} />
```

**Source (TheDrop.jsx:10):**
```jsx
<img src={DROP_IMAGE} loading="lazy" />
```

#### Recommended Fix
Add a meaningful `alt` attribute that describes the image content in the context of the section. If the image is purely decorative and is already described by surrounding heading or paragraph text, use an empty `alt=""` to signal to screen readers that it should be skipped.

```jsx
// HeroBanner.jsx — descriptive alt (image shows new T-shirts)
<img src={HERO_IMAGE} alt="New winter basics collection T-shirts" />

// TheDrop.jsx — the surrounding paragraph describes the product
// So empty alt is appropriate here (decorative in context)
<img src={DROP_IMAGE} loading="lazy" alt="Google Android, YouTube and Super G plushie bag charms" />
```

#### Why This Approach
WCAG 1.1.1 requires that all non-decorative images have a text alternative. For promotional images that add context to adjacent text, a short descriptive `alt` is preferred. For purely decorative images, `alt=""` explicitly tells screen readers to skip the image, avoiding spurious announcements.

---

### CI-7 · AXE-ARIA-REQUIRED-ATTR — `role="slider"` missing required ARIA attributes
**Evinced type:** `AXE-ARIA-REQUIRED-ATTR`  
**Severity:** Critical  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Occurrences:** 1 (Homepage only)

#### Description
An element with `role="slider"` in the TheDrop section is missing the three required ARIA attributes for the slider role: `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. Without these attributes, screen readers cannot announce the current value or valid range of the slider, rendering it completely unusable by assistive technology.

#### Affected Element

| Selector | Source File | Page |
|---|---|---|
| `.drop-popularity-bar` | `TheDrop.jsx:14` | Homepage |

**DOM snippet:**
```html
<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>
```

**Source (TheDrop.jsx:14):**
```jsx
<div role="slider" aria-label="Popularity indicator" className="drop-popularity-bar"></div>
```

#### Recommended Fix
Add the three required ARIA attributes for `role="slider"`. Since this appears to be a read-only popularity indicator (not an interactive slider), consider whether `role="slider"` is even appropriate. A `<meter>` or `<progress>` element, or a simple `role="img"` with a descriptive `aria-label`, may be more semantically correct for a static indicator.

**Option A — Fix the slider role (if interactive):**
```jsx
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-readonly="true"
  className="drop-popularity-bar"
/>
```

**Option B — Use a semantic `<meter>` element (if read-only indicator):**
```jsx
<meter
  value={75}
  min={0}
  max={100}
  aria-label="Popularity indicator"
  className="drop-popularity-bar"
/>
```

**Option C — Use `role="img"` if purely decorative visual indicator:**
```jsx
<div
  role="img"
  aria-label="High popularity indicator"
  className="drop-popularity-bar"
/>
```

#### Why This Approach
The ARIA specification requires `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` for `role="slider"` to be valid. Using a native `<meter>` element (Option B) is preferred because it provides built-in semantics and does not require manual ARIA attribute management. It also degrades gracefully in browsers without ARIA support.

---

## 5. Non-Critical Issues (25 total)

The following issues are classified as **Serious** by Evinced. They represent meaningful barriers but do not completely prevent assistive technology users from accessing content. No remediations are proposed in this report — they are documented for prioritisation in a future sprint.

---

### SI-1 · AXE-COLOR-CONTRAST — Insufficient text/background contrast ratio
**Evinced type:** `AXE-COLOR-CONTRAST`  
**Severity:** Serious  
**WCAG:** 1.4.3 Contrast (Minimum) (Level AA)  
**Occurrences:** 18

WCAG 1.4.3 requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text. The following elements fail this requirement.

| Affected Element | Selector | Page |
|---|---|---|
| Hero subtext paragraph | `.hero-content > p` ("Warm hues for cooler days") | Homepage |
| Filter count badge (×13) | `.filter-count` (e.g., "(8)", "(4)", "(14)") | New Products |
| Products-found counter | `.products-found` | New Products |
| Product description text | `p:nth-child(4)` in product info | Product Detail |
| Step label (inactive) | `.checkout-step:nth-child(3) > .step-label` | Checkout – Basket |
| Tax calculation note | `.summary-tax-note` | Checkout – Basket |
| Order ID label | `.confirm-order-id-label` | Order Confirmation |

**Root cause:** Light grey text on white or near-white backgrounds in multiple components:
- `FilterSidebar.css` — `.filter-count` uses a muted grey colour
- `HeroBanner.css` — the hero subtitle uses a light-coloured font
- `CheckoutPage.css` — inactive step labels and helper text use low-contrast grey
- `OrderConfirmationPage.css` — secondary label text uses a light grey

**Remediation approach (not applied):** Darken the foreground colour of each failing text element to achieve a 4.5:1 contrast ratio against its background. Use a browser contrast-checking tool (e.g., Chrome DevTools colour picker or the WebAIM Contrast Checker) to verify the exact ratio before and after.

---

### SI-2 · AXE-HTML-HAS-LANG — `<html>` element missing `lang` attribute
**Evinced type:** `AXE-HTML-HAS-LANG`  
**Severity:** Serious  
**WCAG:** 3.1.1 Language of Page (Level A)  
**Occurrences:** 6 (one per page — same root cause on all pages)

The `<html>` element in `public/index.html` has no `lang` attribute:

```html
<!-- public/index.html (current) -->
<html>
```

Without a `lang` attribute, screen readers cannot determine the language of the page and may apply incorrect pronunciation rules or switch to the user's system default language settings, producing mispronounced content.

**Remediation approach (not applied):** Add `lang="en"` (or the appropriate BCP 47 language tag) to `public/index.html`:

```html
<html lang="en">
```

This single-file change fixes all 6 occurrences across every page.

---

### SI-3 · AXE-VALID-LANG — Invalid `lang` attribute value on inline element
**Evinced type:** `AXE-VALID-LANG`  
**Severity:** Serious  
**WCAG:** 3.1.2 Language of Parts (Level AA)  
**Occurrences:** 1 (Homepage only)

In `TheDrop.jsx`, a paragraph is marked with `lang="zz"`, which is not a valid BCP 47 language tag:

```html
<!-- TheDrop.jsx rendered output -->
<p lang="zz">
  Our brand-new, limited-edition plushie bag charms have officially dropped...
</p>
```

**Source (TheDrop.jsx:18):**
```jsx
<p lang="zz">
  Our brand-new, limited-edition plushie bag charms...
</p>
```

`"zz"` is not a registered IANA language subtag. Screen readers that honour `lang` attributes may attempt to switch to an unrecognised language and fail to pronounce the paragraph correctly.

**Remediation approach (not applied):** The paragraph content is English. Remove the `lang` attribute or change it to `lang="en"`:

```jsx
<p>
  Our brand-new, limited-edition plushie bag charms have officially dropped...
</p>
```

---

## 6. Issue Summary Table

### Critical Issues

| ID | Type | WCAG | Occurrences | Components Affected |
|---|---|---|---|---|
| CI-1 | NOT_FOCUSABLE | 2.1.1 | 55 | Header, Footer, PopularSection, ProductCard, CheckoutPage |
| CI-2 | WRONG_SEMANTIC_ROLE | 4.1.2 | 54 | Header, Footer, PopularSection, ProductCard, CheckoutPage |
| CI-3 | NO_DESCRIPTIVE_TEXT | 4.1.2 | 21 | Header (Search/Login), PopularSection, Footer |
| CI-4 | AXE-BUTTON-NAME | 4.1.2, 1.1.1 | 9 | CartModal, WishlistModal |
| CI-5 | AXE-ARIA-VALID-ATTR-VALUE | 4.1.2 | 3 | FeaturedPair, ProductPage |
| CI-6 | AXE-IMAGE-ALT | 1.1.1 | 2 | HeroBanner, TheDrop |
| CI-7 | AXE-ARIA-REQUIRED-ATTR | 4.1.2 | 1 | TheDrop |
| | **TOTAL CRITICAL** | | **145** | |

### Non-Critical (Serious) Issues

| ID | Type | WCAG | Occurrences | Components Affected |
|---|---|---|---|---|
| SI-1 | AXE-COLOR-CONTRAST | 1.4.3 | 18 | HeroBanner, FilterSidebar, ProductPage, CheckoutPage, OrderConfirmationPage |
| SI-2 | AXE-HTML-HAS-LANG | 3.1.1 | 6 | `public/index.html` (all pages) |
| SI-3 | AXE-VALID-LANG | 3.1.2 | 1 | TheDrop |
| | **TOTAL SERIOUS** | | **25** | |

---

## 7. Recommended Remediation Priority

Based on severity, breadth of impact, and implementation effort:

| Priority | Issue | Reason |
|---|---|---|
| P1 | CI-1 + CI-2 (NOT_FOCUSABLE + WRONG_SEMANTIC_ROLE) | 109 occurrences, blocks all keyboard navigation site-wide, fix is straightforward (replace divs with buttons/links) |
| P1 | CI-3 (NO_DESCRIPTIVE_TEXT) | 21 occurrences, screen readers announce empty labels, often co-located with P1 changes |
| P1 | SI-2 (AXE-HTML-HAS-LANG) | 1-line fix in `public/index.html`, fixes all 6 page instances, enables correct language detection |
| P2 | CI-4 (AXE-BUTTON-NAME) | 9 occurrences in modals, add `aria-label` to close buttons |
| P2 | CI-5 (AXE-ARIA-VALID-ATTR-VALUE) | 3 occurrences, invalid ARIA silently broken, quick attribute fixes |
| P2 | CI-6 (AXE-IMAGE-ALT) | 2 occurrences, add `alt` to two images |
| P2 | CI-7 (AXE-ARIA-REQUIRED-ATTR) | 1 occurrence, add required slider attributes or change to `<meter>` |
| P3 | SI-1 (AXE-COLOR-CONTRAST) | 18 occurrences, requires design review to select new colours without breaking visual identity |
| P3 | SI-3 (AXE-VALID-LANG) | 1 occurrence, remove invalid `lang="zz"` from TheDrop paragraph |

---

## 8. Raw Data

All raw issue data from the Evinced SDK is available in the `/workspace/a11y-results/` directory:

| File | Page |
|---|---|
| `a11y-results/homepage.json` | Homepage (/) |
| `a11y-results/new-products.json` | New Products (/shop/new) |
| `a11y-results/product-detail.json` | Product Detail (/product/1) |
| `a11y-results/checkout-basket.json` | Checkout – Basket |
| `a11y-results/checkout-shipping.json` | Checkout – Shipping |
| `a11y-results/order-confirmation.json` | Order Confirmation |

The Playwright test spec used to generate this data is located at `tests/e2e/specs/all-pages-audit.spec.ts`.

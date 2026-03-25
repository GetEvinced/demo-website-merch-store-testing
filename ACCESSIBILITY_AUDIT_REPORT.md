# Accessibility Audit Report

**Repository:** `demo-website` (React SPA)  
**Audit Date:** 2026-03-25  
**Tool Used:** Evinced MCP Server v1.0.28 (`@evinced/mcp-server-web`)  
**Engine:** Evinced Web SDK (Playwright headless Chromium)  
**Auditor:** Automated cloud agent

---

## Table of Contents

1. [Pages Audited](#pages-audited)
2. [Issue Summary](#issue-summary)
3. [Critical Issues — Detailed Findings](#critical-issues--detailed-findings)
   - [CI-01: Interactable Role — Non-Semantic Interactive Elements](#ci-01-interactable-role--non-semantic-interactive-elements)
   - [CI-02: Keyboard Accessible — Elements Not Reachable by Keyboard](#ci-02-keyboard-accessible--elements-not-reachable-by-keyboard)
   - [CI-03: Accessible Name — Interactive Elements Without Names](#ci-03-accessible-name--interactive-elements-without-names)
   - [CI-04: Button Name — Icon-Only Buttons Without Accessible Names](#ci-04-button-name--icon-only-buttons-without-accessible-names)
   - [CI-05: Image Alt — Images Missing Alternative Text](#ci-05-image-alt--images-missing-alternative-text)
   - [CI-06: Aria-Valid-Attr-Value — Invalid ARIA Attribute Values](#ci-06-aria-valid-attr-value--invalid-aria-attribute-values)
   - [CI-07: Aria-Required-Attr — Missing Required ARIA Attributes](#ci-07-aria-required-attr--missing-required-aria-attributes)
4. [Proposed Remediations for Critical Issues](#proposed-remediations-for-critical-issues)
5. [Non-Critical Issues (Serious Severity) — Not Remediated](#non-critical-issues-serious-severity--not-remediated)
6. [Appendix: Raw Evinced Report IDs](#appendix-raw-evinced-report-ids)

---

## Pages Audited

The repository is a React SPA (Webpack 5, React 18, React Router v7) with the following routes:

| Page | URL | Entry Component |
|------|-----|-----------------|
| Homepage | `/` | `src/pages/HomePage.jsx` |
| Shop / Products Page | `/shop/new` | `src/pages/NewPage.jsx` |
| Product Detail | `/product/:id` | `src/pages/ProductPage.jsx` |
| Checkout | `/checkout` | `src/pages/CheckoutPage.jsx` |
| Order Confirmation | `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` |

Shared components rendered on every page: `src/components/Header.jsx`, `src/components/Footer.jsx`, `src/components/CartModal.jsx`, `src/components/WishlistModal.jsx`.

---

## Issue Summary

| Page | Critical | Serious | Total |
|------|----------|---------|-------|
| Homepage | 32 | 3 | 35 |
| Shop / Products Page | 41 | 14 | 55 |
| Product Detail | 18 | 2 | 20 |
| Checkout | 16 | 3 | 19 |
| Order Confirmation | 32 | 3 | 35 |

> **Note:** Many critical issues are caused by the same underlying defect repeated across all pages (e.g., the same `<div>` widgets in the global Header and Footer). The distinct underlying root causes are counted in the section below.

### Issue Types Detected

| Issue Type | Severity | Count (raw, across all pages) | WCAG Criteria |
|------------|----------|-------------------------------|---------------|
| Interactable role | Critical | 48 | 1.3.1 (A), 4.1.2 (A) |
| Keyboard accessible | Critical | 50 | 2.1.1 (A) |
| Accessible name | Critical | 21 | 1.3.1 (A), 4.1.2 (A) |
| Button-name | Critical | 9 | 4.1.2 (A) |
| Image-alt | Critical | 4 | 1.1.1 (A) |
| Aria-valid-attr-value | Critical | 5 | 4.1.2 (A) |
| Aria-required-attr | Critical | 2 | 4.1.2 (A) |
| Color-contrast | Serious | 18 | 1.4.3 (AA) |
| Html-has-lang | Serious | 5 | 3.1.1 (A) |
| Valid-lang | Serious | 2 | 3.1.2 (AA) |

**Total critical issues detected: 139**  
**Total serious issues detected: 25**

---

## Critical Issues — Detailed Findings

### CI-01: Interactable Role — Non-Semantic Interactive Elements

**Severity:** Critical  
**WCAG:** 1.3.1 (A) — Info and Relationships; 4.1.2 (A) — Name, Role, Value  
**Evinced Rule:** `Interactable role`  
**Pages Affected:** All pages (Header, Footer, PopularSection, CartModal)

#### What Evinced Detected

Evinced flagged `<div>` elements that are wired up with `onClick` handlers but carry no semantic role. Screen readers announce these as plain content (e.g., "Wishlist, Sustainability") rather than as interactive controls, so screen reader users have no indication they can activate these elements.

#### Affected Elements

| # | Selector | Component | File | What It Is |
|---|----------|-----------|------|-----------|
| 1 | `.wishlist-btn` | Header | `src/components/Header.jsx:131` | Wishlist open button (div) |
| 2 | `.icon-btn:nth-child(2)` | Header | `src/components/Header.jsx:140` | Search button (div) |
| 3 | `.icon-btn:nth-child(4)` | Header | `src/components/Header.jsx:156` | Login button (div) |
| 4 | `.flag-group` | Header | `src/components/Header.jsx:161` | Region selector toggle (div) |
| 5 | `li:nth-child(3) > .footer-nav-item` | Footer | `src/components/Footer.jsx:13` | "Sustainability" footer nav item (div) |
| 6 | `.footer-list:nth-child(2) > li > .footer-nav-item` | Footer | `src/components/Footer.jsx:17` | "FAQs" footer nav item (div) |
| 7 | `.product-card:nth-child(N) > .product-card-info > .shop-link` | PopularSection | `src/components/PopularSection.jsx:52` | "Shop Drinkware/Fun and Games/Stationery" links (div×3) |
| 8 | `.filter-option` (×11 variants) | FilterSidebar | `src/components/FilterSidebar.jsx` | Price/Size/Brand filter checkboxes (div) |
| 9 | `#cart-modal .continueBtn` | CartModal | `src/components/CartModal.jsx:100` | "Continue Shopping" button (div) |

**Root Source Code (Header — lines 130–164):**
```jsx
{/* div used as wishlist button — no role="button", no tabindex */}
<div className="icon-btn wishlist-btn" onClick={openWishlist} style={{cursor:'pointer'}}>
  ...
</div>
{/* div used as search button — no role="button", no tabindex */}
<div className="icon-btn" style={{cursor:'pointer'}}>
  ...
</div>
{/* div used as login button — no role="button", no tabindex */}
<div className="icon-btn" style={{cursor:'pointer'}}>
  ...
</div>
{/* div used as region-selector toggle — no role="button", no tabindex */}
<div className="flag-group" onClick={() => {}} style={{ cursor: 'pointer' }}>
  ...
</div>
```

**Root Source Code (Footer — lines 12–18):**
```jsx
<li><div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}>Sustainability</div></li>
<li><div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}><span aria-hidden="true">FAQs</span></div></li>
```

**Root Source Code (PopularSection — line 52):**
```jsx
<div className="shop-link" onClick={() => navigate(product.shopHref)} style={{ cursor: 'pointer' }}>
  <span aria-hidden="true">{product.shopLabel}</span>
</div>
```

---

### CI-02: Keyboard Accessible — Elements Not Reachable by Keyboard

**Severity:** Critical  
**WCAG:** 2.1.1 (A) — Keyboard  
**Evinced Rule:** `Keyboard accessible`  
**Pages Affected:** All pages

#### What Evinced Detected

The same elements from CI-01 are also not reachable via Tab navigation because they lack `tabindex="0"`. In addition, the `.drop-popularity-bar` element has `role="slider"` but no `tabindex`, so it is completely excluded from keyboard navigation.

#### Affected Elements

All elements from CI-01, plus:

| # | Selector | Component | File | Notes |
|---|----------|-----------|------|-------|
| + | `.drop-popularity-bar` | TheDrop | `src/components/TheDrop.jsx:16` | `role="slider"` but no `tabindex` and no keyboard event handlers |

**Root Source Code (TheDrop.jsx line 16):**
```jsx
{/* role="slider" without tabindex — not keyboard accessible */}
<div role="slider" aria-label="Popularity indicator" className="drop-popularity-bar"></div>
```

---

### CI-03: Accessible Name — Interactive Elements Without Names

**Severity:** Critical  
**WCAG:** 1.3.1 (A), 4.1.2 (A) — Name, Role, Value  
**Evinced Rule:** `Accessible name`  
**Pages Affected:** All pages (Header, Footer, PopularSection)

#### What Evinced Detected

These interactive elements have no accessible name at all — the text visible on screen is hidden from assistive technologies via `aria-hidden="true"`, and no `aria-label` or `aria-labelledby` was provided as a replacement.

#### Affected Elements

| # | Selector | Component | File | Problem |
|---|----------|-----------|------|---------|
| 1 | `.icon-btn:nth-child(2)` | Header | `src/components/Header.jsx:141–143` | Search div — SVG is `aria-hidden`, text label is `aria-hidden="true"` |
| 2 | `.icon-btn:nth-child(4)` | Header | `src/components/Header.jsx:157–159` | Login div — SVG is `aria-hidden`, text label is `aria-hidden="true"` |
| 3 | `.footer-list:nth-child(2) > li > .footer-nav-item` | Footer | `src/components/Footer.jsx:17` | "FAQs" div — visible label wrapped in `aria-hidden="true"` |
| 4–6 | `.product-card:nth-child(N) > .product-card-info > .shop-link` | PopularSection | `src/components/PopularSection.jsx:52–54` | Shop links — each label wrapped in `aria-hidden="true"`, no `aria-label` |

**Root Source Code (Header):**
```jsx
{/* Search: visible label aria-hidden — no accessible name */}
<div className="icon-btn" style={{cursor:'pointer'}}>
  <svg ... aria-hidden="true">...</svg>
  <span aria-hidden="true">Search</span>
</div>

{/* Login: visible label aria-hidden — no accessible name */}
<div className="icon-btn" style={{cursor:'pointer'}}>
  <svg ... aria-hidden="true">...</svg>
  <span aria-hidden="true">Login</span>
</div>
```

**Root Source Code (Footer):**
```jsx
{/* FAQs: visible label aria-hidden — no accessible name */}
<li><div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}>
  <span aria-hidden="true">FAQs</span>
</div></li>
```

**Root Source Code (PopularSection):**
```jsx
{/* Shop links: visible label aria-hidden — no accessible name */}
<div className="shop-link" onClick={() => navigate(product.shopHref)} style={{ cursor: 'pointer' }}>
  <span aria-hidden="true">{product.shopLabel}</span>
</div>
```

---

### CI-04: Button Name — Icon-Only Buttons Without Accessible Names

**Severity:** Critical  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Evinced Rule:** `Button-name`  
**Pages Affected:** All pages (CartModal, WishlistModal)

#### What Evinced Detected

These are `<button>` elements (properly semantic) that contain only an SVG icon. The SVG is marked `aria-hidden="true"` and no `aria-label` is present, so screen readers announce the button as "button" with no name.

#### Affected Elements

| # | Selector | Component | File | Notes |
|---|----------|-----------|------|-------|
| 1 | `#cart-modal > div:nth-child(1) > button` | CartModal | `src/components/CartModal.jsx:49–56` | Cart drawer close button — icon-only, `aria-label` removed |
| 2 | `div[role="dialog"] > div:nth-child(1) > button` | WishlistModal | `src/components/WishlistModal.jsx` | Wishlist drawer close button — icon-only, `aria-label` removed |

**Root Source Code (CartModal.jsx lines 49–56):**
```jsx
{/* close button: icon-only, no aria-label */}
<button className={styles.closeBtn} onClick={closeCart}>
  <svg width="20" height="20" ... aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
</button>
```

---

### CI-05: Image Alt — Images Missing Alternative Text

**Severity:** Critical  
**WCAG:** 1.1.1 (A) — Non-text Content  
**Evinced Rule:** `Image-alt`  
**Pages Affected:** Homepage, Order Confirmation

#### What Evinced Detected

Two `<img>` elements in the homepage content sections have no `alt` attribute. Screen readers fall back to reading the image filename, which is meaningless to users.

#### Affected Elements

| # | Selector | Component | File | Image |
|---|----------|-----------|------|-------|
| 1 | `img[src$="New_Tees.png"]` | HeroBanner | `src/components/HeroBanner.jsx:14` | Hero promotional image |
| 2 | `img[src$="2bags_charms1.png"]` | TheDrop | `src/components/TheDrop.jsx:12` | "The Drop" section product image |

**Root Source Code (HeroBanner.jsx line 14):**
```jsx
{/* img has no alt attribute */}
<img src={HERO_IMAGE} />
```

**Root Source Code (TheDrop.jsx line 12):**
```jsx
{/* img has no alt attribute */}
<img src={DROP_IMAGE} loading="lazy" />
```

---

### CI-06: Aria-Valid-Attr-Value — Invalid ARIA Attribute Values

**Severity:** Critical  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Evinced Rule:** `Aria-valid-attr-value`  
**Pages Affected:** Homepage, Order Confirmation (FeaturedPair); Product Detail (ProductPage)

#### What Evinced Detected

ARIA attributes are present but set to values outside their allowed set, causing assistive technologies to ignore or misparse them.

#### Affected Elements

| # | Selector | Component | File | Invalid Attribute | Invalid Value | Valid Values |
|---|----------|-----------|------|------------------|--------------|-------------|
| 1 | `.featured-card:nth-child(1) > .featured-card-info > h1` | FeaturedPair | `src/components/FeaturedPair.jsx:42` | `aria-expanded` | `"yes"` | `"true"` or `"false"` |
| 2 | `.featured-card:nth-child(2) > .featured-card-info > h1` | FeaturedPair | `src/components/FeaturedPair.jsx:42` | `aria-expanded` | `"yes"` | `"true"` or `"false"` |
| 3 | `ul[aria-relevant="changes"]` | ProductPage | `src/pages/ProductPage.jsx:146` | `aria-relevant` | `"changes"` | Space-separated tokens: `additions`, `removals`, `text`, `all` |

**Root Source Code (FeaturedPair.jsx line 42):**
```jsx
{/* aria-expanded="yes" is invalid — must be "true" or "false" */}
<h1 aria-expanded="yes">{item.title}</h1>
```

**Root Source Code (ProductPage.jsx line 146):**
```jsx
{/* aria-relevant="changes" is invalid — "changes" is not a valid token */}
<ul aria-relevant="changes">
```

---

### CI-07: Aria-Required-Attr — Missing Required ARIA Attributes

**Severity:** Critical  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Evinced Rule:** `Aria-required-attr`  
**Pages Affected:** Homepage, Order Confirmation

#### What Evinced Detected

An element has `role="slider"` but is missing all three required ARIA attributes (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`). Without these, screen readers cannot convey the slider's current or range values to users.

#### Affected Elements

| # | Selector | Component | File | Role | Missing Required Attributes |
|---|----------|-----------|------|------|-----------------------------|
| 1 | `.drop-popularity-bar` | TheDrop | `src/components/TheDrop.jsx:16` | `slider` | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |

**Root Source Code (TheDrop.jsx line 16):**
```jsx
{/* role="slider" but missing aria-valuenow, aria-valuemin, aria-valuemax */}
<div role="slider" aria-label="Popularity indicator" className="drop-popularity-bar"></div>
```

---

## Proposed Remediations for Critical Issues

> **Note:** Per task instructions, no code changes were applied. The following section describes the precise remediations that should be implemented.

---

### R-01: Replace `<div>` Buttons/Links with Semantic Elements or Add `role` + `tabindex`

**Addresses:** CI-01 (Interactable role), CI-02 (Keyboard accessible)  
**Files:** `src/components/Header.jsx`, `src/components/Footer.jsx`, `src/components/PopularSection.jsx`, `src/components/CartModal.jsx`, `src/components/FilterSidebar.jsx`

**Why this approach:** The root cause in each case is a `<div>` or `<span>` being used as an interactive control. The preferred fix is to use the natively semantic element (`<button>` for buttons, `<a>` for links) which automatically receives role semantics and keyboard focus. Where a visual redesign is not desired, the minimum change is to add `role="button"` (or `role="link"`) and `tabIndex={0}` together with an `onKeyDown` handler that fires on `Enter`/`Space`, matching the behavior expected by screen readers for that role.

**Specific changes:**

1. **`Header.jsx` — Wishlist, Search, Login `<div>` buttons**  
   Replace each `<div className="icon-btn ...">` that has an `onClick` with `<button className="icon-btn ...">`. Buttons are natively keyboard-focusable and announced as "button" by screen readers, requiring no extra ARIA.

2. **`Header.jsx` — Flag-group region selector**  
   Replace `<div className="flag-group">` with `<button className="flag-group">` or add `role="button"` and `tabIndex={0}`. If this control expands a region-selector dropdown, also add `aria-expanded` and `aria-haspopup`.

3. **`Footer.jsx` — Sustainability and FAQs `<div>` nav items**  
   Wrap the content in an `<a href="...">` element (for genuine navigation) or change to `<button>` if they trigger an in-page action. Remove the `aria-hidden="true"` from the visible text spans, since that text is the accessible name.

4. **`PopularSection.jsx` — Shop link `<div>` elements**  
   Replace each `<div className="shop-link">` with `<a href={product.shopHref} className="shop-link">`. Remove the `aria-hidden="true"` from the text spans so the link text is exposed to screen readers.

5. **`CartModal.jsx` — "Continue Shopping" `<div>`**  
   Replace `<div className={styles.continueBtn}>` with `<button className={styles.continueBtn}>`. Remove `aria-hidden="true"` from the text span inside.

6. **`FilterSidebar.jsx` — Filter option `<div>` elements**  
   Each filter option `<div className="filter-option">` acts as a checkbox. Replace each with a real `<label><input type="checkbox" .../> {label}</label>` pair, which is natively accessible. Alternatively, add `role="checkbox"`, `tabIndex={0}`, `aria-checked={checked}`, and `onKeyDown` for Space-key activation.

---

### R-02: Add `aria-label` to Accessible-Name-Less Interactive Elements

**Addresses:** CI-03 (Accessible name)  
**Files:** `src/components/Header.jsx`, `src/components/Footer.jsx`, `src/components/PopularSection.jsx`

**Why this approach:** Where the visible text is deliberately hidden from assistive technology via `aria-hidden="true"` (for visual styling reasons), the text content must still be exposed through an alternative mechanism. Adding `aria-label` directly to the interactive element is the most reliable approach because it works regardless of whether the element has been changed to a `<button>` or retains a role attribute.

**Specific changes:**

1. **`Header.jsx:140` — Search button**  
   Add `aria-label="Search"` to the element (after converting it to a `<button>`). Remove `aria-hidden="true"` from the `<span>Search</span>` — or, if the span must remain hidden visually, the `aria-label` on the button is sufficient.

2. **`Header.jsx:156` — Login button**  
   Add `aria-label="Login"` to the element (after converting it to a `<button>`).

3. **`Footer.jsx:17` — FAQs nav item**  
   Remove `aria-hidden="true"` from the `<span>FAQs</span>`. If the outer element becomes an `<a>` or `<button>`, the text content becomes its accessible name automatically.

4. **`PopularSection.jsx:52–54` — Shop link divs**  
   Remove `aria-hidden="true"` from the `<span>{product.shopLabel}</span>` inside each shop link. After converting the container to an `<a>`, the text content becomes the accessible name of the link.

---

### R-03: Add `aria-label` to Icon-Only Close Buttons

**Addresses:** CI-04 (Button-name)  
**Files:** `src/components/CartModal.jsx`, `src/components/WishlistModal.jsx`

**Why this approach:** The close buttons are already semantically correct `<button>` elements, but contain only an SVG icon with `aria-hidden="true"`. The missing accessible name is the only defect. Adding `aria-label="Close cart"` (or `aria-label="Close wishlist"`) to the button element is the minimal, non-disruptive fix that satisfies the requirement.

**Specific changes:**

1. **`CartModal.jsx:49`** — Add `aria-label="Close cart"` to `<button className={styles.closeBtn}>`.
2. **`WishlistModal.jsx` close button** — Add `aria-label="Close wishlist"` to `<button className={styles.closeBtn}>`.

---

### R-04: Add `alt` Attributes to Images

**Addresses:** CI-05 (Image-alt)  
**Files:** `src/components/HeroBanner.jsx`, `src/components/TheDrop.jsx`

**Why this approach:** WCAG 1.1.1 requires all `<img>` elements to have an `alt` attribute. Decorative images that convey no information should use `alt=""` (empty string), which signals to screen readers to skip the image. Informative images should have descriptive text. In both cases here, the images are part of promotional/editorial content, so a brief, descriptive `alt` is more appropriate than an empty string.

**Specific changes:**

1. **`HeroBanner.jsx:14`** — Change `<img src={HERO_IMAGE} />` to `<img src={HERO_IMAGE} alt="Winter Basics — new tees collection" />`.
2. **`TheDrop.jsx:12`** — Change `<img src={DROP_IMAGE} loading="lazy" />` to `<img src={DROP_IMAGE} loading="lazy" alt="Android, YouTube, and Super G plushie bag charms" />`.

---

### R-05: Fix Invalid `aria-expanded` on `<h1>` in FeaturedPair

**Addresses:** CI-06 (Aria-valid-attr-value — FeaturedPair)  
**File:** `src/components/FeaturedPair.jsx`

**Why this approach:** `aria-expanded` is a state attribute that is only meaningful on elements that control the visibility of another element (e.g., a button controlling a dropdown). It has no semantic meaning on a heading element. The correct fix is to remove `aria-expanded` from the `<h1>` entirely. If the intent was to denote that the card section is expanded, the correct approach would be to put `aria-expanded` on the interactive control (e.g., the CTA link or a toggle button), not the heading.

**Specific change:**

**`FeaturedPair.jsx:42`** — Remove the `aria-expanded="yes"` attribute from `<h1>`:
```jsx
{/* Before */}
<h1 aria-expanded="yes">{item.title}</h1>

{/* After */}
<h1>{item.title}</h1>
```

---

### R-06: Fix Invalid `aria-relevant` on Product Size List

**Addresses:** CI-06 (Aria-valid-attr-value — ProductPage)  
**File:** `src/pages/ProductPage.jsx`

**Why this approach:** `aria-relevant` accepts a space-separated list of tokens from the set: `additions`, `removals`, `text`, `all`. The value `"changes"` is not in this set. If the intent is to announce any changes to the list (additions and removals), the correct value is `"additions removals"` or `"all"`. If this attribute is not functionally needed (i.e., the list is not a live region), it should be removed.

**Specific change:**

**`ProductPage.jsx:146`** — Change `aria-relevant="changes"` to `aria-relevant="additions removals"` (or remove it if the list is not a live region):
```jsx
{/* Before */}
<ul aria-relevant="changes">

{/* After */}
<ul aria-live="polite" aria-relevant="additions removals">
```

---

### R-07: Add Required ARIA Attributes to the Slider

**Addresses:** CI-07 (Aria-required-attr)  
**File:** `src/components/TheDrop.jsx`

**Why this approach:** A `role="slider"` element requires `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` to be present. Without them, the slider is announced by screen readers without any value information, making it meaningless. Since the `.drop-popularity-bar` appears to be a decorative visual-only indicator (no interaction), the simplest fix is to either:
- Remove `role="slider"` entirely and add `aria-hidden="true"` to make it purely presentational, OR
- If it is intended to be an informative widget, supply the required attributes with appropriate values.

**Recommended change (treat as decorative):**

**`TheDrop.jsx:16`** — Replace with `aria-hidden="true"` to mark it as presentational:
```jsx
{/* Before */}
<div role="slider" aria-label="Popularity indicator" className="drop-popularity-bar"></div>

{/* After — decorative, hidden from AT */}
<div aria-hidden="true" className="drop-popularity-bar"></div>
```

**Alternative (treat as informative indicator):**
```jsx
{/* If a popularity value is available, expose it as a slider */}
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={popularityValue}
  aria-valuemin={0}
  aria-valuemax={100}
  className="drop-popularity-bar"
/>
```

---

## Non-Critical Issues (Serious Severity) — Not Remediated

The following issues were detected by Evinced at **Serious** severity. They are documented here for completeness but were not remediated per the task scope (only critical issues are in scope for remediation).

---

### S-01: Color Contrast — Insufficient Text-to-Background Ratio

**Severity:** Serious  
**WCAG:** 1.4.3 (AA) — Minimum Contrast (4.5:1 for normal text)  
**Evinced Rule:** `Color-contrast`

| # | Page | Selector | File | Foreground | Background | Approx. Ratio |
|---|------|----------|------|-----------|-----------|---------------|
| 1 | Homepage | `.hero-content > p` | `src/components/HeroBanner.css` | `#c8c0b8` | `#e8e0d8` | ~1.3:1 |
| 2 | Products Page | `.filter-count` (×12 instances) | `src/components/FilterSidebar.css` | `#c8c8c8` | `#ffffff` | ~1.4:1 |
| 3 | Products Page | `.products-found` | `src/pages/NewPage.css` | `#b0b4b8` | `#ffffff` | ~1.9:1 |
| 4 | Checkout | `.checkout-step:nth-child(3) > .step-label` | `src/pages/CheckoutPage.css` | Low contrast | Background | Below 4.5:1 |
| 5 | Checkout | `.checkout-empty > p` | `src/pages/CheckoutPage.css` | Low contrast | Background | Below 4.5:1 |
| 6 | Product Detail | `p:nth-child(4)` (product description) | `src/pages/ProductPage.module.css` | `#c0c0c0` | `#ffffff` | ~1.6:1 |

**Recommended fix (not applied):** Darken foreground colors to achieve at least 4.5:1 contrast ratio against their backgrounds. For example, `.hero-content > p` should change from `#c8c0b8` to approximately `#6b6460` or darker to meet AA requirements.

---

### S-02: Html-Has-Lang — `<html>` Element Missing `lang` Attribute

**Severity:** Serious  
**WCAG:** 3.1.1 (A) — Language of Page  
**Evinced Rule:** `Html-has-lang`  
**Pages Affected:** All pages  
**Selector:** `html`  
**File:** `public/index.html`

The `<html>` element lacks a `lang` attribute. Screen readers use this attribute to determine which text-to-speech language engine to apply. Without it, users whose default screen reader language differs from the page language will hear the content mispronounced.

**Current code:**
```html
<!-- A11Y-AXE html-has-lang: <html> element is missing a lang attribute -->
<html>
```

**Recommended fix (not applied):**
```html
<html lang="en">
```

---

### S-03: Valid-Lang — Invalid BCP 47 Language Tag

**Severity:** Serious  
**WCAG:** 3.1.2 (AA) — Language of Parts  
**Evinced Rule:** `Valid-lang`  
**Pages Affected:** Homepage, Order Confirmation  
**Selector:** `p[lang="zz"]`  
**File:** `src/components/TheDrop.jsx`

A `<p>` element uses `lang="zz"`, which is not a valid BCP 47 language tag. Screen readers rely on `lang` to switch to the appropriate voice/pronunciation engine for that content segment. An invalid tag causes no switch, so content may be mispronounced.

**Current code (`TheDrop.jsx`):**
```jsx
{/* lang="zz" is not a valid BCP 47 language tag */}
<p lang="zz">
  Our brand-new, limited-edition plushie bag charms...
</p>
```

**Recommended fix (not applied):** Remove the `lang` attribute if the content is in the same language as the page, or replace `"zz"` with a valid IETF language tag (e.g., `"en"` for English):
```jsx
<p>
  Our brand-new, limited-edition plushie bag charms...
</p>
```

---

## Appendix: Raw Evinced Report IDs

The following Report IDs were assigned by the Evinced MCP server during this audit run. They can be used with `evinced_get_webpage_issue_details` (within the same server process lifetime) to retrieve full issue detail payloads.

| Page | Evinced Report ID |
|------|-------------------|
| Homepage | `00919f9f-7663-4a9a-957c-8fded3ac3732` |
| Shop / Products Page | `b129abb7-624f-4410-a92d-659443047c51` |
| Product Detail | `d3c0526d-a36d-4c66-b219-52f83e348eda` |
| Checkout | `26460358-50d9-46ca-b5ea-6f7b1d2c90c4` |
| Order Confirmation | `82659526-7d2e-47e8-a01f-289d198a0bac` |

> **Note:** Evinced report IDs are scoped to a single MCP server process. To re-query issue details, the audit must be re-run against the live server.

---

*Report generated by automated Evinced MCP accessibility audit on 2026-03-25.*

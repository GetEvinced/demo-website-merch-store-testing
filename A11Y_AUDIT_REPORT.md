# Accessibility Audit Report

**Repository:** demo-website (React SPA)  
**Audit Date:** 2026-03-18  
**Tool:** Evinced Playwright SDK v2.17.0 (`@evinced/js-playwright-sdk`)  
**Engine:** Evinced GEN1/GEN2/GEN3 + axe-core  
**Branch:** `cursor/repository-accessibility-audit-4277`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Scanning Methodology](#2-scanning-methodology)
3. [Pages Scanned and Entry Points](#3-pages-scanned-and-entry-points)
4. [Issue Classification Summary](#4-issue-classification-summary)
5. [Critical Issues — Detailed Analysis](#5-critical-issues--detailed-analysis)
   - [CI-1: NOT_FOCUSABLE — Interactive Elements Not Keyboard Accessible](#ci-1-not_focusable--interactive-elements-not-keyboard-accessible-58-occurrences)
   - [CI-2: WRONG_SEMANTIC_ROLE — Divs Used as Interactive Controls Without Role](#ci-2-wrong_semantic_role--divs-used-as-interactive-controls-without-role-56-occurrences)
   - [CI-3: NO_DESCRIPTIVE_TEXT — Interactive Elements Without Accessible Name](#ci-3-no_descriptive_text--interactive-elements-without-accessible-name-24-occurrences)
   - [CI-4: AXE-BUTTON-NAME — Close Buttons With No Discernible Text](#ci-4-axe-button-name--close-buttons-with-no-discernible-text-10-occurrences)
   - [CI-5: AXE-ARIA-VALID-ATTR-VALUE — Invalid ARIA Attribute Values](#ci-5-axe-aria-valid-attr-value--invalid-aria-attribute-values-5-occurrences)
   - [CI-6: AXE-IMAGE-ALT — Images Missing Alternative Text](#ci-6-axe-image-alt--images-missing-alternative-text-4-occurrences)
   - [CI-7: AXE-ARIA-REQUIRED-ATTR — Required ARIA Attributes Missing](#ci-7-axe-aria-required-attr--required-aria-attributes-missing-2-occurrences)
6. [Non-Critical Issues — Full List](#6-non-critical-issues--full-list)
   - [SI-1: AXE-COLOR-CONTRAST — Insufficient Color Contrast](#si-1-axe-color-contrast--insufficient-color-contrast-18-occurrences)
   - [SI-2: AXE-HTML-HAS-LANG — HTML Element Missing Language Attribute](#si-2-axe-html-has-lang--html-element-missing-language-attribute-6-occurrences)
   - [SI-3: AXE-VALID-LANG — Invalid Language Attribute Value](#si-3-axe-valid-lang--invalid-language-attribute-value-2-occurrences)

---

## 1. Executive Summary

A full accessibility audit was conducted against the demo-website React SPA using the Evinced Playwright SDK with Chromium. All six application pages were scanned from a running production build.

| Metric | Value |
|--------|-------|
| Pages scanned | 6 |
| Total issues detected | **185** |
| Critical severity | **159** |
| Serious severity | **26** |
| Distinct critical issue groups | 7 |
| Distinct serious issue groups | 3 |
| Source files requiring changes | 11 |

The **critical issues block screen reader users entirely** from several core user journeys: header navigation, footer links, product browsing, filter interaction, checkout, and cart management. These represent WCAG 2.1 Level A failures — the minimum required conformance level.

---

## 2. Scanning Methodology

### Tool

The [Evinced Playwright SDK](https://knowledge.evinced.com) (`@evinced/js-playwright-sdk`) was used in online authenticated mode. This SDK combines:

- **Evinced GEN1 engine** — semantic role and keyboard accessibility analysis
- **Evinced GEN2 engine** — component-level analysis (navigation patterns, combobox, dialogs)
- **axe-core integration** — standard axe rules (ARIA attribute validation, color contrast, image alt, etc.)

### Test Execution

A Playwright test suite (`tests/e2e/specs/all-pages-audit.spec.ts`) was created to navigate to each page, wait for content to fully render, and call `evinced.evAnalyze()`. The site was served as a production build via `serve dist -p 3000`. Raw JSON results were saved per page to `/workspace/a11y-results/`.

### Severity Classification

Issues are classified by severity as reported by the Evinced engine:

| Severity | WCAG Level | Meaning |
|----------|-----------|---------|
| **Critical** | A / AA | Users are completely blocked from accessing content or functionality |
| **Serious** | A / AA | Users experience significant difficulty; workarounds exist but are unreliable |
| Moderate | AA | Users experience noticeable friction |
| Minor | AAA | Cosmetic or low-impact deviations |

---

## 3. Pages Scanned and Entry Points

| Page | URL | Entry Point / Route | Issues Found |
|------|-----|---------------------|--------------|
| Homepage | `http://localhost:3000/` | `src/pages/HomePage.jsx` | 35 (32 critical, 3 serious) |
| New Products | `http://localhost:3000/shop/new` | `src/pages/NewPage.jsx` | 55 (41 critical, 14 serious) |
| Product Detail | `http://localhost:3000/product/1` | `src/pages/ProductPage.jsx` | 20 (18 critical, 2 serious) |
| Checkout — Basket | `http://localhost:3000/checkout` (step 1) | `src/pages/CheckoutPage.jsx` | 21 (18 critical, 3 serious) |
| Checkout — Shipping | `http://localhost:3000/checkout` (step 2) | `src/pages/CheckoutPage.jsx` | 19 (18 critical, 1 serious) |
| Order Confirmation | `http://localhost:3000/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` | 35 (32 critical, 3 serious) |

**Shared components rendered on all pages:**
- `src/components/Header.jsx` — navigation, cart button, wishlist button, search, login, region selector
- `src/components/Footer.jsx` — footer navigation links
- `src/components/CartModal.jsx` — slide-out cart drawer
- `src/components/WishlistModal.jsx` — slide-out wishlist drawer

---

## 4. Issue Classification Summary

### Critical Issues

| ID | Rule | Rule Name | Occurrences | Pages Affected |
|----|------|-----------|-------------|----------------|
| CI-1 | `NOT_FOCUSABLE` | Keyboard Accessible | 58 | All 6 |
| CI-2 | `WRONG_SEMANTIC_ROLE` | Interactable Role | 56 | All 6 |
| CI-3 | `NO_DESCRIPTIVE_TEXT` | Accessible Name | 24 | All 6 |
| CI-4 | `AXE-BUTTON-NAME` | Button Name | 10 | All 6 |
| CI-5 | `AXE-ARIA-VALID-ATTR-VALUE` | Aria Valid Attr Value | 5 | Homepage, Product Detail, Order Confirmation |
| CI-6 | `AXE-IMAGE-ALT` | Image Alt | 4 | Homepage, Order Confirmation |
| CI-7 | `AXE-ARIA-REQUIRED-ATTR` | Aria Required Attr | 2 | Homepage, Order Confirmation |
| | | **Total Critical** | **159** | |

### Serious Issues

| ID | Rule | Rule Name | Occurrences | Pages Affected |
|----|------|-----------|-------------|----------------|
| SI-1 | `AXE-COLOR-CONTRAST` | Color Contrast | 18 | Homepage, New Products, Product Detail, Checkout, Order Confirmation |
| SI-2 | `AXE-HTML-HAS-LANG` | Html Has Lang | 6 | All 6 |
| SI-3 | `AXE-VALID-LANG` | Valid Lang | 2 | Homepage, Order Confirmation |
| | | **Total Serious** | **26** | |

---

## 5. Critical Issues — Detailed Analysis

---

### CI-1: NOT_FOCUSABLE — Interactive Elements Not Keyboard Accessible (58 occurrences)

**Evinced Rule:** `NOT_FOCUSABLE` — Keyboard Accessible  
**WCAG:** 2.1.1 Success Criterion — Keyboard (Level A)  
**KB:** https://knowledge.evinced.com/system-validations/keyboard-accessible

#### Description

Multiple `<div>` elements with `onClick` handlers and `cursor: pointer` styling function as interactive controls but carry no `tabindex` attribute. They are invisible to keyboard navigation — Tab key focus never reaches them. Keyboard-only users and switch device users cannot operate these controls at all.

#### Affected Elements

| # | Selector | DOM Snippet | Source File | Pages |
|---|----------|-------------|-------------|-------|
| 1 | `.wishlist-btn` | `<div class="icon-btn wishlist-btn" style="cursor: pointer;">` | `src/components/Header.jsx:131` | All 6 |
| 2 | `.icon-btn:nth-child(2)` | `<div class="icon-btn" style="cursor: pointer;">` (Search) | `src/components/Header.jsx:140` | All 6 |
| 3 | `.icon-btn:nth-child(4)` | `<div class="icon-btn" style="cursor: pointer;">` (Login) | `src/components/Header.jsx:156` | All 6 |
| 4 | `.flag-group` | `<div class="flag-group" style="cursor: pointer;">` | `src/components/Header.jsx:161` | All 6 |
| 5 | `.footer-nav-item` (Sustainability) | `<div class="footer-nav-item" style="cursor: pointer;">Sustainability</div>` | `src/components/Footer.jsx:13` | All 6 |
| 6 | `.footer-nav-item` (FAQs) | `<div class="footer-nav-item" style="cursor: pointer;"><span aria-hidden="true">FAQs</span></div>` | `src/components/Footer.jsx:18` | All 6 |
| 7 | `.shop-link` (Shop Drinkware) | `<div class="shop-link" style="cursor: pointer;"><span aria-hidden="true">Shop Drinkware</span></div>` | `src/components/PopularSection.jsx:55` | Homepage, Order Confirmation |
| 8 | `.shop-link` (Shop Fun and Games) | `<div class="shop-link" style="cursor: pointer;"><span aria-hidden="true">Shop Fun and Games</span></div>` | `src/components/PopularSection.jsx:55` | Homepage, Order Confirmation |
| 9 | `.shop-link` (Shop Stationery) | `<div class="shop-link" style="cursor: pointer;"><span aria-hidden="true">Shop Stationery</span></div>` | `src/components/PopularSection.jsx:55` | Homepage, Order Confirmation |
| 10 | `.filter-option` (×11) | `<div class="filter-option"><div class="custom-checkbox"></div>…` | `src/components/FilterSidebar.jsx` | New Products |
| 11 | `.checkout-continue-btn` | `<div class="checkout-continue-btn" style="cursor: pointer;">Continue</div>` | `src/pages/CheckoutPage.jsx:157` | Checkout Basket |
| 12 | `.checkout-back-btn` | `<div class="checkout-back-btn" style="cursor: pointer;">← Back to Cart</div>` | `src/pages/CheckoutPage.jsx:298` | Checkout Shipping |
| 13 | `.drop-popularity-bar` | `<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>` | `src/components/TheDrop.jsx:19` | Homepage, Order Confirmation |

#### Recommended Fix

**Preferred approach:** Replace each interactive `<div>` with a semantically appropriate native element:
- Action controls (buttons, toggles) → `<button>`
- Navigation controls (links to pages) → `<a href="...">` or `<Link to="...">`

For `<div>` elements that cannot be immediately replaced (e.g. for CSS/layout reasons), apply the minimum ARIA fix:
1. Add `tabindex="0"` to include the element in the keyboard focus sequence.
2. Pair this with the role fix described in CI-2.
3. Add keyboard event handling (`onKeyDown`) to support Enter/Space activation.

#### Why This Approach

Native `<button>` and `<a>` elements provide keyboard focusability, Enter/Space activation, and correct ARIA semantics automatically — reducing the number of manual attributes required and ensuring consistent browser/screen-reader behavior. The `tabindex="0"` workaround on `<div>` elements is acceptable as an interim fix but requires additional keyboard event handlers to be complete.

---

### CI-2: WRONG_SEMANTIC_ROLE — Divs Used as Interactive Controls Without Role (56 occurrences)

**Evinced Rule:** `WRONG_SEMANTIC_ROLE` — Interactable Role  
**WCAG:** 4.1.2 Name, Role, Value (Level A); 1.3.1 Info and Relationships (Level A)  
**KB:** https://knowledge.evinced.com/system-validations/interactable-role

#### Description

The same `<div>` elements identified in CI-1 also lack a semantic `role` attribute. Screen readers cannot identify them as interactive controls — they announce only the element's text content with no indication that the element can be activated. Users of NVDA, JAWS, VoiceOver, and other AT will have no indication that "Wishlist", "Search", "Login", "FAQs", or "Continue" can be clicked.

#### Affected Elements

Identical element set to CI-1 above (the two issues are co-located on the same elements). Each `<div>` is missing both `tabindex` and `role`.

| Element | Required Role |
|---------|--------------|
| `.wishlist-btn` | `role="button"` |
| `.icon-btn` (Search, Login) | `role="button"` |
| `.flag-group` | `role="button"` |
| `.footer-nav-item` (Sustainability, FAQs) | `role="link"` |
| `.shop-link` | `role="link"` |
| `.filter-option` | `role="checkbox"` |
| `.checkout-continue-btn` | `role="button"` |
| `.checkout-back-btn` | `role="button"` |
| `.drop-popularity-bar` | already has `role="slider"` but missing required attributes — see CI-7 |

#### Recommended Fix

Add the appropriate `role` attribute to each `<div>`:
- `role="button"` for controls that trigger an action (modal open, form submit, etc.)
- `role="link"` for controls that navigate to another page or section

Alongside `tabindex="0"` (CI-1 fix), this satisfies the minimum ARIA pattern for interactive divs. The preferred approach remains replacing with native `<button>` or `<a>` elements, which carry both role and focusability inherently.

#### Why This Approach

The `role` attribute is the single attribute that tells assistive technologies what kind of control an element is. Without it, screen readers announce the element as static text. Setting `role="button"` causes VoiceOver/NVDA to announce "button" after the label, signaling to the user that the element can be activated. Combined with `tabindex="0"` and keyboard handlers, this brings the `<div>` into full ARIA compliance. Native elements are still preferred as they are less error-prone.

---

### CI-3: NO_DESCRIPTIVE_TEXT — Interactive Elements Without Accessible Name (24 occurrences)

**Evinced Rule:** `NO_DESCRIPTIVE_TEXT` — Accessible Name  
**WCAG:** 4.1.2 Name, Role, Value (Level A); 1.3.1 Info and Relationships (Level A)  
**KB:** https://knowledge.evinced.com/system-validations/accessible-name

#### Description

Certain interactive elements have their visible text or icon hidden from the accessibility tree via `aria-hidden="true"` on their content, without providing a replacement accessible name via `aria-label` or `aria-labelledby`. Screen readers announce these controls with no name — for example: "button" with no label for the Search button, or "link" with no label for the FAQs footer link.

#### Affected Elements

| # | Selector | DOM Snippet | Source File | Reason No Name | Pages |
|---|----------|-------------|-------------|----------------|-------|
| 1 | `.icon-btn:nth-child(2)` (Search) | `<div class="icon-btn">` — SVG icon child has `aria-hidden` | `src/components/Header.jsx:140` | Icon-only, no `aria-label` | All 6 |
| 2 | `.icon-btn:nth-child(4)` (Login) | `<div class="icon-btn">` — icon + text child has `aria-hidden` | `src/components/Header.jsx:156` | Icon-only + hidden text, no `aria-label` | All 6 |
| 3 | `.footer-nav-item` (FAQs) | `<div class="footer-nav-item"><span aria-hidden="true">FAQs</span></div>` | `src/components/Footer.jsx:18` | Visible label is `aria-hidden`, no `aria-label` | All 6 |
| 4 | `.shop-link` (Shop Drinkware) | `<div class="shop-link"><span aria-hidden="true">Shop Drinkware</span></div>` | `src/components/PopularSection.jsx:59` | Visible label is `aria-hidden`, no `aria-label` | Homepage, Order Confirmation |
| 5 | `.shop-link` (Shop Fun and Games) | `<div class="shop-link"><span aria-hidden="true">Shop Fun and Games</span></div>` | `src/components/PopularSection.jsx:59` | Visible label is `aria-hidden`, no `aria-label` | Homepage, Order Confirmation |
| 6 | `.shop-link` (Shop Stationery) | `<div class="shop-link"><span aria-hidden="true">Shop Stationery</span></div>` | `src/components/PopularSection.jsx:59` | Visible label is `aria-hidden`, no `aria-label` | Homepage, Order Confirmation |

#### Recommended Fix

1. **Remove `aria-hidden="true"` from visible text content** where the text is already a meaningful accessible name (FAQs footer link, shop-link spans). This is the simplest fix — if the text is visible and descriptive, it should be accessible.
2. For icon-only controls (Search, Login) where the SVG icon carries no text: **add `aria-label="Search"` and `aria-label="Log in"` directly to the container element.**
3. For controls that are converted to native `<button>`/`<a>` elements (as recommended in CI-1/CI-2), ensure the text content is not hidden from the accessibility tree.

#### Why This Approach

`aria-hidden="true"` on visible text is the root cause — it was applied to prevent double-announcement of content that is also rendered visually. The correct pattern for icon-with-text buttons is to hide the icon (`aria-hidden` on the `<svg>`) but keep the text visible. For icon-only controls, an `aria-label` on the button itself is the correct mechanism for providing an accessible name. Removing `aria-hidden` from already-visible text is the least invasive fix and avoids the overhead of synchronising a separate `aria-label` string with the visible text.

---

### CI-4: AXE-BUTTON-NAME — Close Buttons With No Discernible Text (10 occurrences)

**Evinced Rule:** `AXE-BUTTON-NAME` — Button Name  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**KB:** https://knowledge.evinced.com/system-validations/button-name

#### Description

The close buttons in `CartModal` and `WishlistModal` render only an SVG "×" icon. The `aria-label` attribute was removed from these buttons and the SVG icon is `aria-hidden="true"`, leaving screen readers nothing to announce. Users of AT hear only "button" when focused, with no indication of the button's purpose.

#### Affected Elements

| # | Selector | DOM Snippet | Source File | Pages |
|---|----------|-------------|-------------|-------|
| 1 | `#cart-modal > div:nth-child(1) > button` | `<button class="[CartModal module CSS hash]">` — icon-only, `aria-label` removed | `src/components/CartModal.jsx:57` | Homepage, New Products, Product Detail, Order Confirmation |
| 2 | `div[role="dialog"] > div:nth-child(1) > button` | `<button class="[WishlistModal module CSS hash]">` — icon-only, `aria-label` removed | `src/components/WishlistModal.jsx:63` | All 6 pages (Wishlist always rendered) |
| 3 | `div:nth-child(1) > button` (Wishlist on checkout pages) | same as above | `src/components/WishlistModal.jsx:63` | Checkout Basket, Checkout Shipping |

#### Recommended Fix

Add `aria-label` to each close button with a descriptive value specific to the modal:

```jsx
// CartModal.jsx
<button
  className={styles.closeBtn}
  onClick={closeCart}
  aria-label="Close shopping cart"
>
  {/* SVG icon */}
</button>

// WishlistModal.jsx
<button
  className={styles.closeBtn}
  onClick={closeWishlist}
  aria-label="Close wishlist"
>
  {/* SVG icon */}
</button>
```

#### Why This Approach

`aria-label` on the `<button>` element itself is the W3C-recommended technique for icon-only buttons. It overrides the computed name derived from the button's contents, replacing the empty announcement with a clear, specific description. The label includes the modal name ("shopping cart", "wishlist") to disambiguate the button when multiple modals may be open or when announcements are queued.

---

### CI-5: AXE-ARIA-VALID-ATTR-VALUE — Invalid ARIA Attribute Values (5 occurrences)

**Evinced Rule:** `AXE-ARIA-VALID-ATTR-VALUE` — Aria Valid Attr Value  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**KB:** https://knowledge.evinced.com/system-validations/aria-valid-attr-value

#### Description

Three ARIA attributes carry values that are not permitted by the ARIA specification. Invalid attribute values are ignored by browsers/AT and may cause unpredictable announcements or complete failure to communicate state.

#### Affected Elements

| # | Selector | DOM Snippet | Source File | Invalid Attribute | Invalid Value | Valid Values |
|---|----------|-------------|-------------|-------------------|--------------|-------------|
| 1 | `.featured-card:nth-child(1) > .featured-card-info > h1` | `<h1 aria-expanded="yes">Keep on Truckin'</h1>` | `src/components/FeaturedPair.jsx:46` | `aria-expanded` | `"yes"` | `"true"` or `"false"` |
| 2 | `.featured-card:nth-child(2) > .featured-card-info > h1` | `<h1 aria-expanded="yes">Limited edition and traveling fast</h1>` | `src/components/FeaturedPair.jsx:46` | `aria-expanded` | `"yes"` | `"true"` or `"false"` |
| 3 | `ul[aria-relevant="changes"]` | `<ul aria-relevant="changes" aria-live="polite">` | `src/pages/ProductPage.jsx:146` | `aria-relevant` | `"changes"` | Space-separated tokens from: `additions`, `removals`, `text`, `all` |

> **Note:** Issues 1 and 2 appear on both Homepage and Order Confirmation (because FeaturedPair renders on both pages), accounting for 4 of the 5 total occurrences.

#### Recommended Fix

**FeaturedPair.jsx — `aria-expanded="yes"`:**
```jsx
// Option A: Remove aria-expanded entirely (h1 headings don't expand)
<h1>{item.title}</h1>

// Option B: If expansion state is genuinely needed, use valid value
<h1 aria-expanded={isExpanded ? "true" : "false"}>{item.title}</h1>
```
`aria-expanded` should only be used on controls that show/hide content (buttons, comboboxes, disclosure widgets). Its presence on a static `<h1>` heading is semantically incorrect regardless of the value.

**ProductPage.jsx — `aria-relevant="changes"`:**
```jsx
// Fix: Use a valid token — "additions text" is the most common pattern for live regions
<ul aria-relevant="additions text" aria-live="polite">
```

#### Why This Approach

The ARIA specification defines enumerated values for `aria-expanded` (`"true"`, `"false"`, `"undefined"`) and space-separated token values for `aria-relevant`. Browsers validate these values and discard ones they do not recognise, resulting in the attribute having no effect. For `aria-expanded`, the deepest fix is to remove it from the heading element entirely, as the attribute has no semantic meaning on a non-interactive element. For `aria-relevant`, choosing `"additions text"` is the most practical token for a live region that announces new content.

---

### CI-6: AXE-IMAGE-ALT — Images Missing Alternative Text (4 occurrences)

**Evinced Rule:** `AXE-IMAGE-ALT` — Image Alt  
**WCAG:** 1.1.1 Non-text Content (Level A)  
**KB:** https://knowledge.evinced.com/system-validations/image-alt

#### Description

Two `<img>` elements across two components have no `alt` attribute. Screen readers will attempt to derive an alternative from the image URL, typically reading the filename (e.g. "New underscore Tees dot png") — which is meaningless to a visually impaired user.

#### Affected Elements

| # | Selector | DOM Snippet | Source File | Pages |
|---|----------|-------------|-------------|-------|
| 1 | `img[src$="New_Tees.png"]` | `<img src="/images/home/New_Tees.png">` | `src/components/HeroBanner.jsx:17` | Homepage, Order Confirmation |
| 2 | `img[src$="2bags_charms1.png"]` | `<img src="/images/home/2bags_charms1.png" loading="lazy">` | `src/components/TheDrop.jsx:12` | Homepage, Order Confirmation |

#### Recommended Fix

```jsx
// HeroBanner.jsx
<img src="/images/home/New_Tees.png" alt="New winter basics collection — tees and sweaters" />

// TheDrop.jsx
<img src="/images/home/2bags_charms1.png" alt="Two bags with charm accessories from The Drop collection" loading="lazy" />
```

If an image is purely decorative and conveys no meaning, use an empty `alt` attribute (`alt=""`), which tells screen readers to skip the image silently.

#### Why This Approach

The `alt` attribute is the primary mechanism for communicating image content to screen readers and other non-visual AT. For informational images like hero banners and featured collection photos, a brief, descriptive text alternative ensures users understand the visual context. The descriptions should be concise (typically under 100 characters), describe the visual content as it relates to the surrounding context, and avoid starting with "image of" (screen readers already announce "image"). Decorative images that are purely cosmetic should use `alt=""` to avoid adding noise to the AT experience.

---

### CI-7: AXE-ARIA-REQUIRED-ATTR — Required ARIA Attributes Missing (2 occurrences)

**Evinced Rule:** `AXE-ARIA-REQUIRED-ATTR` — Aria Required Attr  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**KB:** https://knowledge.evinced.com/system-validations/aria-required-attr

#### Description

A `<div>` with `role="slider"` is missing the three required ARIA attributes that sliders must expose: `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. Without these, screen readers cannot communicate the slider's current value, minimum, or maximum to the user, making the widget completely unusable for AT users.

#### Affected Elements

| # | Selector | DOM Snippet | Source File | Missing Attributes | Pages |
|---|----------|-------------|-------------|-------------------|-------|
| 1 | `.drop-popularity-bar` | `<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>` | `src/components/TheDrop.jsx:19` | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` | Homepage, Order Confirmation |

#### Recommended Fix

```jsx
// TheDrop.jsx
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={popularityValue}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuetext={`${popularityValue}% popular`}
  className="drop-popularity-bar"
/>
```

If the slider is static/decorative (not interactive), it should either be removed from the accessibility tree with `aria-hidden="true"` or replaced with a simpler element (e.g., `<div role="img" aria-label="High popularity">`) that does not require dynamic value attributes.

#### Why This Approach

The ARIA specification mandates that `role="slider"` elements provide `aria-valuenow` (current value), `aria-valuemin` (minimum), and `aria-valuemax` (maximum). These are not optional — assistive technologies rely on them to read out a meaningful state like "Popularity indicator, 75, slider". Without `aria-valuenow`, the browser will not compute a valid accessible value, and many screen readers will either skip the element or announce "slider" with no value. Adding `aria-valuetext` additionally provides a human-readable format (e.g. "75%") for screen readers that support it.

---

## 6. Non-Critical Issues — Full List

The following **26 serious-severity issues** were detected but are not classified as critical. They represent meaningful barriers to users but do not completely block access to functionality.

---

### SI-1: AXE-COLOR-CONTRAST — Insufficient Color Contrast (18 occurrences)

**Rule:** `AXE-COLOR-CONTRAST`  
**WCAG:** 1.4.3 Contrast (Minimum) (Level AA) — minimum ratio 4.5:1 for normal text, 3:1 for large text

| # | Page | Selector | Element Description | Source File | Approximate Ratio |
|---|------|----------|--------------------|-----------|--------------------|
| 1 | Homepage | `.hero-content > p` | Hero subtitle "Warm hues for cooler days" | `src/components/HeroBanner.css:30` | ~1.3:1 (color: `#c8c0b8` on `#e8e0d8`) |
| 2 | New Products | `.filter-count` (×13) | Filter option count badges "(8)", "(4)", etc. in sidebar | `src/components/FilterSidebar.css:115` | ~1.4:1 (color: `#c8c8c8` on `#ffffff`) |
| 3 | New Products | `.products-found` | "16 Products Found" count text | `src/pages/NewPage.css:77` | ~1.9:1 (color: `#b0b4b8` on `#ffffff`) |
| 4 | Product Detail | `p:nth-child(4)` | Product description paragraph | `src/pages/ProductPage.module.css:108` | ~1.6:1 (color: `#c0c0c0` on `#ffffff`) |
| 5 | Checkout Basket | `.checkout-step:nth-child(3) > .step-label` | "Shipping & Payment" step indicator label | `src/pages/CheckoutPage.css` | Insufficient |
| 6 | Checkout Basket | `.summary-tax-note` | "Taxes calculated at next step" note | `src/pages/CheckoutPage.css` | Insufficient |
| 7 | Order Confirmation | `.hero-content > p` | Same hero subtitle (shared component) | `src/components/HeroBanner.css:30` | ~1.3:1 |

**Recommended Fix:** Update CSS `color` values to achieve at minimum a 4.5:1 contrast ratio against their respective backgrounds:
- `.hero-content p`: change `#c8c0b8` to a darker tone such as `#6e6258` (~4.6:1 on `#e8e0d8`)
- `.filter-count`: change `#c8c8c8` to `#767676` (~4.5:1 on `#ffffff`)
- `.products-found`: change `#b0b4b8` to `#767676` (~4.5:1 on `#ffffff`)
- `.productDescription`: change `#c0c0c0` to `#767676` (~4.5:1 on `#ffffff`)
- Checkout step label and tax note: darken to pass 4.5:1 ratio on their respective backgrounds

---

### SI-2: AXE-HTML-HAS-LANG — HTML Element Missing Language Attribute (6 occurrences)

**Rule:** `AXE-HTML-HAS-LANG`  
**WCAG:** 3.1.1 Language of Page (Level A)

| # | Page | Selector | DOM Snippet | Source File |
|---|------|----------|-------------|-------------|
| 1 | Homepage | `html` | `<html>` | `public/index.html:3` |
| 2 | New Products | `html` | `<html>` | `public/index.html:3` |
| 3 | Product Detail | `html` | `<html>` | `public/index.html:3` |
| 4 | Checkout Basket | `html` | `<html>` | `public/index.html:3` |
| 5 | Checkout Shipping | `html` | `<html>` | `public/index.html:3` |
| 6 | Order Confirmation | `html` | `<html>` | `public/index.html:3` |

This is a single defect in one file, appearing once per page scan because all pages share the same `index.html` shell.

**Recommended Fix:**
```html
<!-- public/index.html -->
<html lang="en">
```

---

### SI-3: AXE-VALID-LANG — Invalid Language Attribute Value (2 occurrences)

**Rule:** `AXE-VALID-LANG`  
**WCAG:** 3.1.2 Language of Parts (Level AA)

| # | Page | Selector | DOM Snippet | Source File | Invalid Value |
|---|------|----------|-------------|-------------|--------------|
| 1 | Homepage | `p[lang="zz"]` | `<p lang="zz">…</p>` | `src/components/TheDrop.jsx:21` | `"zz"` is not a valid BCP 47 language tag |
| 2 | Order Confirmation | `p[lang="zz"]` | `<p lang="zz">…</p>` | `src/components/TheDrop.jsx:21` | `"zz"` is not a valid BCP 47 language tag |

This is a single defect in `TheDrop.jsx` appearing on both pages that render the component.

**Recommended Fix:**
```jsx
// TheDrop.jsx — replace "zz" with the correct BCP 47 tag for the paragraph's language
// If the text is in English: remove the lang attribute entirely (inherits from <html lang="en">)
// If the text is in another language, use the correct tag (e.g. lang="fr" for French)
<p lang="en">…</p>
```

---

*Report generated by Evinced Playwright SDK v2.17.0 on 2026-03-18. Raw JSON scan results stored in `/workspace/a11y-results/`.*

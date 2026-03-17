# Accessibility Audit Report — Demo Website

**Audit Date:** 2026-03-17  
**Tool:** Evinced JS Playwright SDK v2.17.0 (`@evinced/js-playwright-sdk`)  
**Engine:** Evinced GEN1/GEN2/GEN3 + axe-core rules  
**Environment:** Chromium (headless), viewport 1280×720  
**Base URL:** http://localhost:3000  
**Branch:** `cursor/accessibility-audit-report-62bf`

---

## 1. Scanned Pages and Entry Points

| # | Page | URL | Entry Component | Route |
|---|------|-----|-----------------|-------|
| 1 | Homepage | `/` | `src/pages/HomePage.jsx` | `<Route path="/" element={<HomePage />} />` |
| 2 | Products Page | `/shop/new` | `src/pages/NewPage.jsx` | `<Route path="/shop/new" element={<NewPage />} />` |
| 3 | Product Detail | `/product/:id` (tested with id=1) | `src/pages/ProductPage.jsx` | `<Route path="/product/:id" element={<ProductPage />} />` |
| 4 | Checkout — Basket Step | `/checkout` (step=basket) | `src/pages/CheckoutPage.jsx` | `<Route path="/checkout" element={<CheckoutPage />} />` |
| 5 | Checkout — Shipping Step | `/checkout` (step=shipping) | `src/pages/CheckoutPage.jsx` | Same route, second internal state |
| 6 | Order Confirmation | `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` | `<Route path="/order-confirmation" element={<OrderConfirmationPage />} />` |

Global components rendered on every page: `src/components/Header.jsx`, `src/components/Footer.jsx`, `src/components/CartModal.jsx` (hidden on checkout/confirmation), `src/components/WishlistModal.jsx`.

---

## 2. Issue Summary

| Severity | Count | % of Total |
|----------|-------|------------|
| **Critical** | **145** | **85.3 %** |
| Serious | 25 | 14.7 % |
| **Total** | **170** | |

### By Page

| Page | Total | Critical | Serious |
|------|-------|----------|---------|
| Homepage | 35 | 32 | 3 |
| Products Page | 55 | 41 | 14 |
| Product Detail | 20 | 18 | 2 |
| Checkout — Basket | 21 | 18 | 3 |
| Checkout — Shipping | 19 | 18 | 1 |
| Order Confirmation | 20 | 18 | 2 |

### By Issue Type

| ID | Evinced Rule | Severity | Count | WCAG |
|----|-------------|----------|-------|------|
| CI-1 | `NOT_FOCUSABLE` / Keyboard accessible | Critical | 55 | 2.1.1 (A) |
| CI-2 | `WRONG_SEMANTIC_ROLE` / Interactable role | Critical | 54 | 1.3.1 (A), 4.1.2 (A) |
| CI-3 | `NO_DESCRIPTIVE_TEXT` / Accessible name | Critical | 21 | 2.4.6 (AA), 4.1.2 (A) |
| CI-4 | `AXE-BUTTON-NAME` / Button-name | Critical | 9 | 4.1.2 (A) |
| CI-5 | `AXE-ARIA-VALID-ATTR-VALUE` / Aria-valid-attr-value | Critical | 3 | 4.1.2 (A) |
| CI-6 | `AXE-IMAGE-ALT` / Image-alt | Critical | 2 | 1.1.1 (A) |
| CI-7 | `AXE-ARIA-REQUIRED-ATTR` / Aria-required-attr | Critical | 1 | 4.1.2 (A) |
| SI-1 | `AXE-COLOR-CONTRAST` / Color-contrast | Serious | 18 | 1.4.3 (AA) |
| SI-2 | `AXE-HTML-HAS-LANG` / Html-has-lang | Serious | 6 | 3.1.1 (A) |
| SI-3 | `AXE-VALID-LANG` / Valid-lang | Serious | 1 | 3.1.2 (AA) |

---

## 3. Critical Issues — Detailed Findings

### CI-1 — Keyboard accessible / NOT_FOCUSABLE

**Evinced Rule:** `NOT_FOCUSABLE`  
**Severity:** Critical  
**Count:** 55 occurrences across all 6 pages  
**WCAG:** 2.1.1 (A) — Keyboard  
**Description:** Interactive elements are not reachable via keyboard Tab navigation because they lack `tabindex`. Keyboard-only users cannot access these controls at all.

#### Affected Elements

| # | Page(s) | Element / Selector | Source File | Line |
|---|---------|-------------------|-------------|------|
| 1 | All pages | `.wishlist-btn` — `<div class="icon-btn wishlist-btn">` | `src/components/Header.jsx` | 131 |
| 2 | All pages | `.icon-btn:nth-child(2)` — Search `<div class="icon-btn">` | `src/components/Header.jsx` | 140 |
| 3 | All pages | `.icon-btn:nth-child(4)` — Login `<div class="icon-btn">` | `src/components/Header.jsx` | 156 |
| 4 | All pages | `.flag-group` — Region selector `<div>` | `src/components/Header.jsx` | 161 |
| 5 | All pages (footer) | `.footer-nav-item` (Sustainability) | `src/components/Footer.jsx` | 13 |
| 6 | All pages (footer) | `.footer-nav-item` (FAQs) | `src/components/Footer.jsx` | 18 |
| 7 | Homepage | `.shop-link` (×3) — "Shop Drinkware/Fun/Stationery" | `src/components/PopularSection.jsx` | 54–60 |
| 8 | All pages (cart drawer) | `.continueBtn` — "Continue Shopping" `<div>` | `src/components/CartModal.jsx` | 128–134 |
| 9 | All pages (wishlist) | `.removeBtn` — Remove item `<div>` | `src/components/WishlistModal.jsx` | 128–147 |
| 10 | Products Page | `.filter-option` (×11) — Price/Size/Brand filter items | `src/components/FilterSidebar.jsx` | (filter-option divs) |
| 11 | Checkout | `.checkout-continue-btn` — "Continue" `<div>` | `src/pages/CheckoutPage.jsx` | (checkout-continue-btn) |
| 12 | Checkout | `.checkout-back-btn` — "← Back to Cart" `<div>` | `src/pages/CheckoutPage.jsx` | (checkout-back-btn) |
| 13 | Order Confirmation | `.confirm-home-link` — "← Back to Shop" `<div>` | `src/pages/OrderConfirmationPage.jsx` | (confirm-home-link) |

**Proposed Fix:** Replace every interactive `<div>` acting as a button or link with a native `<button>` element (for actions) or `<a>` element (for navigation). Native semantic elements are keyboard-focusable by default, receive Enter/Space activation, and convey their role to assistive technologies without any additional ARIA. Where replacing the element tag is not feasible, adding `tabIndex={0}` and a corresponding `onKeyDown` handler for Enter/Space would provide keyboard access, but native elements are always preferred.

**Rationale for the native-element approach:** The W3C ARIA Authoring Practices Guide recommends using native HTML elements over ARIA role overrides whenever possible ("First rule of ARIA use"). Native `<button>` and `<a>` elements handle focus management, keyboard interaction, and screen-reader announcement automatically and work correctly across all major assistive technologies without additional scripting. Using ARIA `role="button"` + `tabIndex` is a valid fallback only when the element cannot be changed.

---

### CI-2 — Interactable role / WRONG_SEMANTIC_ROLE

**Evinced Rule:** `WRONG_SEMANTIC_ROLE`  
**Severity:** Critical  
**Count:** 54 occurrences across all 6 pages  
**WCAG:** 1.3.1 (A) — Info and Relationships; 4.1.2 (A) — Name, Role, Value  
**Description:** `<div>` elements are used as interactive controls (buttons, links, checkboxes) without a corresponding ARIA `role`. Screen readers announce these elements as plain text or containers, preventing users from discovering and activating them via the element-type navigation shortcuts (e.g., "B" to navigate buttons, "K" to navigate links).

#### Affected Elements

The affected elements are the same set as CI-1 (every non-semantic interactive element also violates the semantic role requirement). Additionally:

| # | Page(s) | Element / Selector | Expected Role | Source File |
|---|---------|-------------------|---------------|-------------|
| 1 | All pages | `.wishlist-btn` | `role="button"` | `src/components/Header.jsx:131` |
| 2 | All pages | `.icon-btn` (Search, Login) | `role="button"` | `src/components/Header.jsx:140,156` |
| 3 | All pages | `.flag-group` | `role="button"` | `src/components/Header.jsx:161` |
| 4 | All pages (footer) | `.footer-nav-item` (both) | `role="link"` or `<a>` | `src/components/Footer.jsx:13,18` |
| 5 | Homepage | `.shop-link` (×3) | `role="link"` or `<a>` | `src/components/PopularSection.jsx:54` |
| 6 | All pages (cart) | `.continueBtn` | `role="button"` | `src/components/CartModal.jsx:128` |
| 7 | All pages (wishlist) | `.removeBtn` | `role="button"` | `src/components/WishlistModal.jsx:128` |
| 8 | Products Page | `.filter-option` (×11) | `role="checkbox"` | `src/components/FilterSidebar.jsx` |
| 9 | Checkout | `.checkout-continue-btn` | `role="button"` | `src/pages/CheckoutPage.jsx` |
| 10 | Checkout | `.checkout-back-btn` | `role="button"` | `src/pages/CheckoutPage.jsx` |
| 11 | Order Confirmation | `.confirm-home-link` | `role="link"` or `<a>` | `src/pages/OrderConfirmationPage.jsx` |

**Proposed Fix:** Same as CI-1 — replace `<div>` elements with semantically appropriate native HTML elements (`<button>` for actions, `<a>` for navigation, `<input type="checkbox">` or a properly ARIA-attributed element for checkboxes). The semantic role is conveyed automatically by the native element tag, eliminating the need for explicit `role` attributes.

**Rationale:** Assistive technologies rely on the accessibility tree role to announce an element's purpose and to enable type-specific shortcuts (e.g., a screen reader user can press "B" to jump between buttons). When a `<div>` is used without a role, the element is announced as "group" or ignored entirely. Switching to native elements is the lowest-risk remediation because it requires no additional ARIA and is backward-compatible with all browsers and screen readers.

---

### CI-3 — Accessible name / NO_DESCRIPTIVE_TEXT

**Evinced Rule:** `NO_DESCRIPTIVE_TEXT`  
**Severity:** Critical  
**Count:** 21 occurrences across all 6 pages  
**WCAG:** 4.1.2 (A) — Name, Role, Value; 2.4.6 (AA) — Headings and Labels  
**Description:** Interactive elements have no computed accessible name. The visible label text has been suppressed with `aria-hidden="true"` on the containing `<span>` and no `aria-label` or `aria-labelledby` has been provided as a substitute. Screen readers announce these controls as nameless, and voice-control users cannot activate them by speaking a label.

#### Affected Elements

| # | Page(s) | Element / Selector | Hidden Label Text | Source File |
|---|---------|-------------------|--------------------|-------------|
| 1 | All pages | `.icon-btn:nth-child(2)` — Search div | `<span aria-hidden="true">Search</span>` | `src/components/Header.jsx:142` |
| 2 | All pages | `.icon-btn:nth-child(4)` — Login div | `<span aria-hidden="true">Login</span>` | `src/components/Header.jsx:158` |
| 3 | Homepage | `.shop-link` (Shop Drinkware) | `<span aria-hidden="true">Shop Drinkware</span>` | `src/components/PopularSection.jsx:59` |
| 4 | Homepage | `.shop-link` (Shop Fun and Games) | `<span aria-hidden="true">Shop Fun and Games</span>` | `src/components/PopularSection.jsx:59` |
| 5 | Homepage | `.shop-link` (Shop Stationery) | `<span aria-hidden="true">Shop Stationery</span>` | `src/components/PopularSection.jsx:59` |
| 6 | All pages (footer) | `.footer-nav-item` (FAQs) | `<span aria-hidden="true">FAQs</span>` | `src/components/Footer.jsx:18` |
| 7–21 | Checkout/Confirmation (×15) | Various inherited occurrences across pages from global Header/Footer components | (same elements counted once per page scanned) | (same source files) |

**Proposed Fix:**
- Remove `aria-hidden="true"` from the visible label `<span>` so the text is naturally included in the accessible name computation, **and** convert the parent `<div>` to a native `<button>` or `<a>` (resolving CI-2 simultaneously).
- Where the visible text must remain hidden from AT for visual design reasons, add an `aria-label` attribute directly on the interactive element with equivalent descriptive text.

**Rationale:** The accessible name algorithm (accname-1.1) uses visible text content as the label source for interactive elements. Marking the label text `aria-hidden="true"` prevents it from being included in the computed name, leaving the element nameless. Removing the `aria-hidden` from the span is the most direct fix. Where the visual text is intentionally styled differently from what should be announced, `aria-label` on the element provides an explicit override without altering the visual presentation.

---

### CI-4 — Button-name / AXE-BUTTON-NAME

**Evinced Rule:** `AXE-BUTTON-NAME`  
**Severity:** Critical  
**Count:** 9 occurrences across all 6 pages  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Description:** Icon-only `<button>` elements (the close "×" buttons in CartModal and WishlistModal) have no accessible name. The SVG icons are marked `aria-hidden="true"` and no `aria-label` has been provided. Screen readers announce these as "button" with no label, preventing users from knowing their purpose.

#### Affected Elements

| # | Page(s) | Selector | Context | Source File | Line |
|---|---------|----------|---------|-------------|------|
| 1 | Homepage, Products, Product Detail | `#cart-modal > div:nth-child(1) > button` | Cart drawer close button | `src/components/CartModal.jsx` | 56–64 |
| 2 | All 6 pages | `div[role="dialog"] > div:nth-child(1) > button` | Wishlist drawer close button | `src/components/WishlistModal.jsx` | 61–80 |

(Each button appears once per page scan — 3 occurrences for CartModal on the pages where the cart is rendered, 6 occurrences for WishlistModal across all pages.)

**DOM Snippet (CartModal close button):**
```html
<button class="JjN6AKz7a2PRH2gFKW3v">
  <svg aria-hidden="true">…×…</svg>
</button>
```

**Proposed Fix:** Add `aria-label="Close shopping cart"` to the CartModal close button and `aria-label="Close wishlist"` to the WishlistModal close button.

```jsx
// CartModal.jsx line 56
<button
  className={styles.closeBtn}
  onClick={closeCart}
  aria-label="Close shopping cart"
>

// WishlistModal.jsx line 61
<button
  ref={closeBtnRef}
  className={styles.closeBtn}
  onClick={closeWishlist}
  aria-label="Close wishlist"
>
```

**Rationale:** `aria-label` is the simplest, most widely supported mechanism for providing an accessible name to icon-only buttons. It takes precedence over all other name-computation sources, guarantees a consistent label regardless of SVG rendering, and does not require any DOM restructuring. The label text includes the name of the container ("shopping cart" / "wishlist") so the button purpose is unambiguous when announced out of context by a screen reader's forms/button navigation.

---

### CI-5 — Aria-valid-attr-value / AXE-ARIA-VALID-ATTR-VALUE

**Evinced Rule:** `AXE-ARIA-VALID-ATTR-VALUE`  
**Severity:** Critical  
**Count:** 3 occurrences (Homepage ×2, Product Detail ×1)  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Description:** ARIA attributes are present but contain invalid values. Browsers and assistive technologies ignore or misinterpret invalid attribute values, potentially conveying incorrect state information.

#### Affected Elements

| # | Page | Selector | Attribute | Invalid Value | Valid Values | Source File | Line |
|---|------|----------|-----------|--------------|--------------|-------------|------|
| 1 | Homepage | `.featured-card:nth-child(1) > … > h1` | `aria-expanded` | `"yes"` | `"true"` or `"false"` | `src/components/FeaturedPair.jsx` | 46 |
| 2 | Homepage | `.featured-card:nth-child(2) > … > h1` | `aria-expanded` | `"yes"` | `"true"` or `"false"` | `src/components/FeaturedPair.jsx` | 46 |
| 3 | Product Detail | `ul[aria-relevant="changes"]` | `aria-relevant` | `"changes"` | Space-separated tokens from: `additions`, `removals`, `text`, `all` | `src/pages/ProductPage.jsx` | 144–148 |

**DOM Snippets:**
```html
<!-- FeaturedPair.jsx — Issues 1 & 2 -->
<h1 aria-expanded="yes">Keep on Truckin'</h1>
<h1 aria-expanded="yes">Limited edition and traveling fast</h1>

<!-- ProductPage.jsx — Issue 3 -->
<ul aria-relevant="changes" aria-live="polite">…</ul>
```

**Proposed Fix:**
- **Issues 1–2:** `aria-expanded` must be either `"true"` or `"false"`. Since these are static card headings (not disclosure/accordion triggers), `aria-expanded` is semantically inappropriate on an `<h1>` and should be removed entirely.
  ```jsx
  // FeaturedPair.jsx line 46 — remove aria-expanded
  <h1>{item.title}</h1>
  ```
- **Issue 3:** `aria-relevant` accepts a space-separated list of tokens: `additions`, `removals`, `text`, or `all`. The value `"changes"` is not valid. The intended behavior (announcing added and removed content) should be expressed as `aria-relevant="additions removals"`.
  ```jsx
  // ProductPage.jsx line 144
  <ul
    className={styles.detailsList}
    aria-relevant="additions removals"
    aria-live="polite"
  >
  ```

**Rationale:** Browsers pass ARIA attribute values to the accessibility tree verbatim; if the value is not in the allowed set, the attribute is treated as absent (for `aria-expanded`) or the live region may behave unpredictably (for `aria-relevant`). For `aria-expanded` on a static heading: headings do not have an expanded/collapsed state — the attribute is meaningless and should not be present. For `aria-relevant`: the corrected `"additions removals"` token set accurately reflects the intended semantics (announce when list items are added or removed).

---

### CI-6 — Image-alt / AXE-IMAGE-ALT

**Evinced Rule:** `AXE-IMAGE-ALT`  
**Severity:** Critical  
**Count:** 2 occurrences (Homepage only)  
**WCAG:** 1.1.1 (A) — Non-text Content  
**Description:** Two `<img>` elements have no `alt` attribute. Without `alt`, screen readers fall back to announcing the image filename (e.g., "New_Tees.png"), which provides no meaningful information and may confuse users.

#### Affected Elements

| # | Page | Selector | Image Path | Source File | Line |
|---|------|----------|-----------|-------------|------|
| 1 | Homepage | `img[src$="New_Tees.png"]` | `/images/home/New_Tees.png` | `src/components/HeroBanner.jsx` | 18 |
| 2 | Homepage | `img[src$="2bags_charms1.png"]` | `/images/home/2bags_charms1.png` | `src/components/TheDrop.jsx` | 13 |

**DOM Snippets:**
```html
<!-- HeroBanner.jsx line 18 -->
<img src="/images/home/New_Tees.png">

<!-- TheDrop.jsx line 13 -->
<img src="/images/home/2bags_charms1.png" loading="lazy">
```

**Proposed Fix:**
```jsx
// HeroBanner.jsx line 18
<img src={HERO_IMAGE} alt="Winter Basics collection — new tees" />

// TheDrop.jsx line 13
<img src={DROP_IMAGE} alt="Android, YouTube, and Super G plushie bag charms" loading="lazy" />
```

If the images are considered purely decorative and carry no informational content beyond what is already conveyed in surrounding text, `alt=""` (empty alt, not missing alt) is the correct resolution:
```jsx
<img src={HERO_IMAGE} alt="" />
```

**Rationale:** WCAG 1.1.1 requires all non-text content to have a text alternative. An absent `alt` attribute is not the same as `alt=""`. Missing `alt` causes screen readers to read the filename. Both images are in a promotional context (hero banner, "The Drop" section) and are the primary content of their section — they are informative images requiring descriptive alt text. If the surrounding heading and paragraph already fully describe the image content, `alt=""` would be acceptable to suppress redundant announcement; however, providing meaningful alt text is the safer default because the images appear before their descriptive text in the DOM.

---

### CI-7 — Aria-required-attr / AXE-ARIA-REQUIRED-ATTR

**Evinced Rule:** `AXE-ARIA-REQUIRED-ATTR`  
**Severity:** Critical  
**Count:** 1 occurrence (Homepage)  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Description:** An element with `role="slider"` is missing the three required ARIA attributes that a slider must expose to assistive technologies: `aria-valuenow` (current value), `aria-valuemin` (minimum), and `aria-valuemax` (maximum). Without these, screen readers cannot announce the current value or the valid range of the slider.

#### Affected Element

| Page | Selector | Source File | Line |
|------|----------|-------------|------|
| Homepage | `.drop-popularity-bar` | `src/components/TheDrop.jsx` | 19 |

**DOM Snippet:**
```html
<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>
```

**Proposed Fix:**
```jsx
// TheDrop.jsx line 19
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  className="drop-popularity-bar"
/>
```

If this element is purely decorative (a visual progress bar with no interactive or informational purpose), it should either use `role="img"` with a descriptive `aria-label`, or have the role removed entirely and be marked `aria-hidden="true"`:
```jsx
<div aria-hidden="true" className="drop-popularity-bar" />
```

**Rationale:** The WAI-ARIA specification mandates `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` as required states/properties for `role="slider"`. Without them the accessibility tree is malformed and screen readers may refuse to interact with the element or announce it incorrectly. Since the `.drop-popularity-bar` element appears to be a static visual indicator rather than a user-controllable slider, the cleanest fix is to remove the `role="slider"` designation and mark the element as decorative with `aria-hidden="true"`. If it must convey a value, `role="img"` with a descriptive label is the correct pattern for a non-interactive meter.

---

## 4. Remaining Non-Critical Issues (Serious)

These 25 issues are classified **Serious** by Evinced and were not remediated. They are documented below for tracking and future remediation.

---

### SI-1 — Color-contrast / AXE-COLOR-CONTRAST

**Severity:** Serious  
**Count:** 18 occurrences across 5 pages  
**WCAG:** 1.4.3 (AA) — Contrast (Minimum); required ratio 4.5:1 for normal text  

| # | Page | Selector | Element | Approximate Ratio | Source File |
|---|------|----------|---------|-------------------|-------------|
| 1 | Homepage | `.hero-content > p` | Hero subtitle "Warm hues for cooler days" | ~1.3:1 (`#c8c0b8` on `#e8e0d8`) | `src/components/HeroBanner.css` |
| 2–12 | Products Page | `.filter-count` (×11 filter option badges) | "(8)", "(4)", "(14)", etc. count labels | ~1.4:1 (`#c8c8c8` on `#ffffff`) | `src/components/FilterSidebar.css` |
| 13 | Products Page | `.products-found` | "16 Products Found" paragraph | ~1.9:1 (`#b0b4b8` on `#ffffff`) | `src/pages/NewPage.css` |
| 14 | Product Detail | `p:nth-child(4)` — `.productDescription` | Product description paragraph | ~1.6:1 (`#c0c0c0` on `#ffffff`) | `src/pages/ProductPage.module.css` |
| 15 | Checkout Basket | `.step-label` (Shipping & Payment step) | "Shipping & Payment" inactive step label | insufficient | `src/pages/CheckoutPage.css` |
| 16 | Checkout Basket | `.summary-tax-note` | "Taxes calculated at next step" note | insufficient | `src/pages/CheckoutPage.css` |
| 17 | Order Confirmation | `.confirm-order-id-label` | "Order ID" label text | insufficient | `src/pages/OrderConfirmationPage.css` |
| 18 | Order Confirmation | `.confirm-order-id-box` (container) | Order ID box compound element | insufficient | `src/pages/OrderConfirmationPage.css` |

**Description:** Text colors are too light relative to their backgrounds. Low-vision users, users in bright-light environments, and users with color-vision deficiencies cannot read these elements. The contrast ratio must be at least 4.5:1 for normal text (under 18pt / 14pt bold).

---

### SI-2 — Html-has-lang / AXE-HTML-HAS-LANG

**Severity:** Serious  
**Count:** 6 occurrences (once per scanned page — the same root `<html>` element counted on every page)  
**WCAG:** 3.1.1 (A) — Language of Page  

| Page | Selector | Source File |
|------|----------|-------------|
| All 6 pages | `html` | `public/index.html` |

**DOM Snippet:**
```html
<!-- public/index.html -->
<html>
  <head>…</head>
  <body>…</body>
</html>
```

**Description:** The root `<html>` element has no `lang` attribute. Screen readers use the language declaration to select the correct speech synthesis engine and pronunciation rules. Without it, TTS engines may default to a system language that does not match the content, producing mispronounced or garbled speech.

---

### SI-3 — Valid-lang / AXE-VALID-LANG

**Severity:** Serious  
**Count:** 1 occurrence (Homepage)  
**WCAG:** 3.1.2 (AA) — Language of Parts  

| Page | Selector | Invalid Value | Source File | Line |
|------|----------|--------------|-------------|------|
| Homepage | `p[lang="zz"]` | `"zz"` | `src/components/TheDrop.jsx` | 21 |

**DOM Snippet:**
```html
<p lang="zz">Our brand-new, limited-edition plushie bag charms…</p>
```

**Description:** `"zz"` is not a valid BCP 47 language tag. Screen readers cannot identify the language of this paragraph and will apply the document's default language rules (or none) to it. If the paragraph is genuinely English, the `lang` attribute should be removed or set to `"en"`.

---

## 5. Summary Table of Critical Issues and Proposed Fixes

| Issue ID | Rule | Affected Pages | Occurrences | File(s) | Proposed Fix (brief) |
|----------|------|----------------|-------------|---------|---------------------|
| CI-1 | NOT_FOCUSABLE | All 6 | 55 | Header.jsx, Footer.jsx, PopularSection.jsx, CartModal.jsx, WishlistModal.jsx, FilterSidebar.jsx, CheckoutPage.jsx, OrderConfirmationPage.jsx | Replace interactive `<div>` elements with native `<button>` or `<a>` elements |
| CI-2 | WRONG_SEMANTIC_ROLE | All 6 | 54 | Same files as CI-1 | Same as CI-1 — native elements carry the correct implicit role |
| CI-3 | NO_DESCRIPTIVE_TEXT | All 6 | 21 | Header.jsx, Footer.jsx, PopularSection.jsx, CartModal.jsx | Remove `aria-hidden="true"` from visible label spans, or add `aria-label` on the interactive element |
| CI-4 | AXE-BUTTON-NAME | All 6 | 9 | CartModal.jsx, WishlistModal.jsx | Add `aria-label="Close shopping cart"` / `aria-label="Close wishlist"` to close buttons |
| CI-5 | AXE-ARIA-VALID-ATTR-VALUE | Homepage, Product Detail | 3 | FeaturedPair.jsx, ProductPage.jsx | Remove `aria-expanded` from static `<h1>`; change `aria-relevant="changes"` to `aria-relevant="additions removals"` |
| CI-6 | AXE-IMAGE-ALT | Homepage | 2 | HeroBanner.jsx, TheDrop.jsx | Add descriptive `alt` text to both `<img>` elements |
| CI-7 | AXE-ARIA-REQUIRED-ATTR | Homepage | 1 | TheDrop.jsx | Add `aria-valuenow`, `aria-valuemin`, `aria-valuemax` to the slider, or remove `role="slider"` and mark decorative with `aria-hidden="true"` |

---

## 6. Methodology

1. **Build:** The React SPA was built with `npm run build` (Webpack 5, production mode) and served statically via `npx serve dist -p 3000 --single`.
2. **Scan:** Each page was navigated to in a dedicated Playwright test using the Evinced `EvincedSDK.evAnalyze()` API, which performs a full-page static + dynamic DOM analysis.
3. **Multi-step pages:** The Checkout page has two internal states (basket and shipping). Both were scanned separately by driving the Playwright test through the required click sequence (add to cart → proceed to checkout → advance to shipping step).
4. **Data collection:** Raw issues were serialized to JSON via `fs.writeFileSync` to `/workspace/a11y-results/` and parsed for this report.
5. **Severity classification:** Evinced assigns severity (`CRITICAL` / `SERIOUS`) based on impact on assistive technology users. No axe severity overrides were applied.
6. **Source mapping:** Affected elements were traced from their CSS selector and DOM snippet back to the originating JSX source file using the known component structure.

---

*Report generated automatically using the Evinced JS Playwright SDK. Raw JSON data is stored in `/workspace/a11y-results/`.*

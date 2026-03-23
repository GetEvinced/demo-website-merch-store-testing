# Accessibility Audit Report — Demo Website

**Audit Date:** 2026-03-23  
**Tool:** Evinced JS Playwright SDK v2.44.0  
**Auditor:** Automated Cron Audit (Cursor Cloud Agent)  
**Audit Type:** Per-page static snapshot (`evAnalyze()`) on 5 routes  
**Standard:** WCAG 2.0 / 2.1 / 2.2 — Levels A, AA, AAA

---

## Executive Summary

| Page | Route | Total Issues | Critical | Serious |
|------|-------|-------------|----------|---------|
| Homepage | `/` | 35 | 32 | 3 |
| Products (New) | `/shop/new` | 55 | 41 | 14 |
| Product Detail | `/product/1` | 20 | 18 | 2 |
| Checkout | `/checkout` | 21 | 18 | 3 |
| Order Confirmation | `/order-confirmation` | 20 | 18 | 2 |
| **TOTAL** | — | **151** | **127** | **24** |

**127 Critical issues** and **24 Serious issues** were identified across all five pages. Critical issues directly block or severely impair access for users relying on keyboard navigation, screen readers, or assistive technologies. Serious issues reduce accessibility quality but do not outright prevent access.

---

## Part 1 — Critical Issues (127 instances)

Critical issues are classified as those that, if left unaddressed, prevent users with disabilities from interacting with or understanding key page content.

---

### CI-1: NOT_FOCUSABLE — Interactive elements unreachable by keyboard

**Evinced Type ID:** `NOT_FOCUSABLE`  
**Evinced Name:** Keyboard accessible  
**Total Instances:** 48  
**WCAG Criterion:** 2.1.1 Keyboard (Level A)  
**Knowledge Base:** https://knowledge.evinced.com/system-validations/keyboard-accessible

**Description:** Interactive elements (those with `onClick` handlers and `cursor: pointer`) are implemented as `<div>` elements without `tabindex="0"`. These elements are excluded from the browser's default tab order, making them completely inaccessible to keyboard-only users who navigate using Tab.

**Affected Elements by Page:**

| Page | Selector | DOM Snippet |
|------|----------|-------------|
| All pages (×5) | `.wishlist-btn` | `<div class="icon-btn wishlist-btn" style="cursor: pointer;">` |
| All pages (×5) | `.icon-btn:nth-child(2)` (Search) | `<div class="icon-btn" style="cursor: pointer;">` |
| All pages (×5) | `.icon-btn:nth-child(4)` (Login) | `<div class="icon-btn" style="cursor: pointer;">` |
| All pages (×5) | `.flag-group` | `<div class="flag-group" onClick={...} style="cursor: pointer;">` |
| Homepage (×4) | `.shop-link` (product cards) | `<div class="shop-link" style="cursor: pointer;">` |
| Products | `.filter-option` (×18 filter checkboxes) | `<div class="filter-option" onClick={...}>` |
| Products | `.products-found` | count display div |
| Checkout | `.checkout-continue-btn` | `<div class="checkout-continue-btn" style="cursor: pointer;">Continue</div>` |
| Checkout | Checkout step divs | `<div class="checkout-step" onClick={...}>` |
| Order Confirmation | `.confirm-home-link` | `<div class="confirm-home-link" style="cursor: pointer;">← Back to Shop</div>` |
| Product Detail | `.footer-nav-item` | `<div class="footer-nav-item" style="cursor: pointer;">` |

**Source Files:**
- `src/components/Header.jsx` (lines 131, 140, 156, 161) — wishlist-btn, icon-btns, flag-group
- `src/components/PopularSection.jsx` (line 55) — shop-link divs
- `src/components/FilterSidebar.jsx` (lines 74, 116, 156) — filter-option divs
- `src/components/Footer.jsx` (lines 13, 18) — footer-nav-item divs
- `src/pages/CheckoutPage.jsx` (line 157) — checkout-continue-btn
- `src/pages/OrderConfirmationPage.jsx` (line 40) — confirm-home-link

**Recommended Fix:** Replace `<div onClick={...}>` interactive elements with semantically appropriate `<button>` or `<a>` elements, which are natively focusable. For navigation-type actions, use `<button>` with `type="button"`. For links, use React Router's `<Link>`. If a `<div>` must be retained, add `tabIndex={0}` and a `role` attribute, and handle `onKeyDown` for Enter/Space — though replacing with a native element is the preferred approach.

**Why this approach:** Native HTML interactive elements (`<button>`, `<a>`) receive focus automatically, are announced correctly by screen readers, and already handle keyboard events. They also provide better baseline styling and behaviour across browser/AT combinations. Retrofitting `tabindex` onto `<div>` elements requires additional `role`, `onKeyDown`, and focus styling work — all of which is provided for free by native elements.

---

### CI-2: WRONG_SEMANTIC_ROLE — Interactive `<div>` elements lack proper ARIA roles

**Evinced Type ID:** `WRONG_SEMANTIC_ROLE`  
**Evinced Name:** Interactable role  
**Total Instances:** 47  
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)  
**Knowledge Base:** https://knowledge.evinced.com/system-validations/interactable-role

**Description:** The same `<div onClick={...}>` elements identified under CI-1 also lack any ARIA role. Screen readers cannot identify these elements as interactive, so users who rely on assistive technology will not be told they can activate them, will not hear their purpose, and may not even be able to locate them.

**Affected Elements by Page:**

| Page | Selector | Expected Role |
|------|----------|---------------|
| All pages | `.wishlist-btn` | `button` |
| All pages | `.icon-btn:nth-child(2)` (Search) | `button` |
| All pages | `.icon-btn:nth-child(4)` (Login) | `button` |
| All pages | `.flag-group` | `button` |
| Homepage | `.shop-link` (×4 product cards) | `link` |
| Products | `.filter-option` (×18 filter checkboxes) | `checkbox` or `button` |
| Checkout | `.checkout-continue-btn` | `button` |
| Checkout | Checkout step divs | `button` |
| Order Confirmation | `.confirm-home-link` | `link` |
| Product Detail / Footer | `.footer-nav-item` | `link` or `button` |

**Source Files:** Same as CI-1.

**Recommended Fix:** Identical to CI-1. Converting `<div>` interactive elements to `<button>` or `<a>`/`<Link>` automatically assigns the correct implicit ARIA role. Where the visual design requires a non-semantic container, add `role="button"` or `role="link"` explicitly. Filter options that behave as checkboxes should use `<input type="checkbox">` (or `role="checkbox"` with `aria-checked`).

**Why this approach:** ARIA roles tell assistive technologies what an element *is* — without a correct role, screen readers announce the element as generic text or ignore it entirely. Using the correct native element is the most robust and maintainable approach because it leverages built-in browser semantics rather than requiring manually-maintained ARIA attributes.

---

### CI-3: NO_DESCRIPTIVE_TEXT — Interactive elements have no accessible name

**Evinced Type ID:** `NO_DESCRIPTIVE_TEXT`  
**Evinced Name:** Accessible name  
**Total Instances:** 18  
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A); 2.4.6 Headings and Labels (Level AA)  
**Knowledge Base:** https://knowledge.evinced.com/system-validations/accessible-name

**Description:** Several interactive elements contain no text visible to assistive technologies. The icon-only buttons (Search, Login) contain SVG icons whose text is wrapped in `aria-hidden="true"`. The `.shop-link` divs have their label text wrapped in `<span aria-hidden="true">`, meaning the clickable area has no accessible label. The "FAQs" footer nav item has identical hiding. Screen readers announce these elements as empty or by their tag name.

**Affected Elements by Page:**

| Page | Selector | Issue |
|------|----------|-------|
| All pages | `.icon-btn:nth-child(2)` | Search icon button — SVG with no label |
| All pages | `.icon-btn:nth-child(4)` | Login icon button — SVG with no label |
| Homepage | `.product-card:nth-child(n) > .product-card-info > .shop-link` | `<span aria-hidden="true">Shop Drinkware</span>` — label hidden |
| All pages | `.footer-list:nth-child(2) > li > .footer-nav-item` | `<span aria-hidden="true">FAQs</span>` — label hidden |

**Source Files:**
- `src/components/Header.jsx` — Search and Login icon-only `<div>` buttons without accessible names
- `src/components/PopularSection.jsx` (line 59) — `<span aria-hidden="true">{product.shopLabel}</span>`
- `src/components/Footer.jsx` (line 18) — `<span aria-hidden="true">FAQs</span>`

**Recommended Fix:** Add `aria-label` to icon-only buttons (e.g., `aria-label="Search"`, `aria-label="Log in"`). Remove the `aria-hidden="true"` from the span labels inside `.shop-link` and `.footer-nav-item`, or keep it but add an `aria-label` on the parent interactive element.

**Why this approach:** An accessible name is required for every interactive control. Screen readers read the accessible name to announce the element's purpose when it receives focus. `aria-label` is the canonical approach for icon-only or text-that-must-be-visually-hidden controls, as it is universally supported across all major screen reader/browser combinations.

---

### CI-4: AXE-BUTTON-NAME — Close buttons on modals have no accessible name

**Evinced Type ID:** `AXE-BUTTON-NAME`  
**Evinced Name:** Button-name  
**Total Instances:** 8  
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)  
**Knowledge Base:** https://knowledge.evinced.com/system-validations/button-name

**Description:** The close buttons on `CartModal` and `WishlistModal` are `<button>` elements that contain only an SVG icon. Neither an `aria-label` attribute nor any visible text label is present. Screen readers announce these as "button" with no name, providing no indication of the action they perform.

**Affected Elements by Page:**

| Page | Selector | DOM Snippet |
|------|----------|-------------|
| Homepage, Products, Product Detail | `#cart-modal > div:nth-child(1) > button` | `<button class="[hashed]"><svg ...>` (CartModal close) |
| Homepage, Products, Product Detail, Checkout, Order Confirmation | `div[role="dialog"] > div:nth-child(1) > button` | `<button class="[hashed]"><svg ...>` (WishlistModal close) |
| Checkout, Order Confirmation | `div:nth-child(1) > button` | WishlistModal close button |

**Source Files:**
- `src/components/CartModal.jsx` (line 56) — `<button className={styles.closeBtn} onClick={closeCart}>` — no aria-label
- `src/components/WishlistModal.jsx` — equivalent close button with no aria-label

**Recommended Fix:** Add `aria-label="Close cart"` to the CartModal close button and `aria-label="Close wishlist"` to the WishlistModal close button. Example:

```jsx
<button
  className={styles.closeBtn}
  onClick={closeCart}
  aria-label="Close cart"
>
  {/* SVG icon */}
</button>
```

**Why this approach:** The `aria-label` attribute is the simplest, most widely supported mechanism to provide an accessible name for an icon-only button. It does not require DOM changes beyond adding the attribute, making it the lowest-risk fix. A `<span className="sr-only">Close cart</span>` visually-hidden text node inside the button is an equally valid alternative.

---

### CI-5: AXE-ARIA-VALID-ATTR-VALUE — Invalid ARIA attribute values

**Evinced Type ID:** `AXE-ARIA-VALID-ATTR-VALUE`  
**Evinced Name:** Aria-valid-attr-value  
**Total Instances:** 3  
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)  
**Knowledge Base:** https://knowledge.evinced.com/system-validations/aria-valid-attr-value

**Description:** Two distinct invalid ARIA attribute values were detected:

1. **`aria-expanded="yes"`** — Two `<h1>` elements in `FeaturedPair.jsx` use `aria-expanded="yes"`. The valid values for `aria-expanded` are `"true"`, `"false"`, or `"undefined"`. Browsers and screen readers may ignore or misinterpret a non-boolean string value.

2. **`aria-relevant="changes"`** — A `<ul>` in `ProductPage.jsx` uses `aria-relevant="changes"`. The valid tokenised values for `aria-relevant` are: `additions`, `removals`, `text`, `all`, and combinations thereof. `"changes"` is not a valid token.

**Affected Elements by Page:**

| Page | Selector | Invalid Attribute |
|------|----------|-------------------|
| Homepage | `.featured-card:nth-child(1) > .featured-card-info > h1` | `aria-expanded="yes"` |
| Homepage | `.featured-card:nth-child(2) > .featured-card-info > h1` | `aria-expanded="yes"` |
| Product Detail | `ul[aria-relevant="changes"]` | `aria-relevant="changes"` |

**Source Files:**
- `src/components/FeaturedPair.jsx` (line 46) — `<h1 aria-expanded="yes">`
- `src/pages/ProductPage.jsx` (line 146) — `aria-relevant="changes"`

**Recommended Fix:**

For `FeaturedPair.jsx`: `aria-expanded` is semantically incorrect on a static heading `<h1>`. It should be removed entirely, or if there is collapsible behaviour, the boolean value `"true"` or `"false"` should be used.

```jsx
{/* Remove aria-expanded from static headings */}
<h1>{item.title}</h1>
```

For `ProductPage.jsx`: Replace `aria-relevant="changes"` with a valid token such as `aria-relevant="additions text"`:

```jsx
<ul aria-relevant="additions text" aria-live="polite">
```

**Why this approach:** Invalid ARIA attribute values are silently ignored by some browsers or trigger warnings in AT. Using valid values ensures that the intended assistive behaviour (live region updates, expanded state) actually functions. Removing `aria-expanded` from a non-collapsible heading is the correct semantic choice.

---

### CI-6: AXE-IMAGE-ALT — Images missing alternative text

**Evinced Type ID:** `AXE-IMAGE-ALT`  
**Evinced Name:** Image-alt  
**Total Instances:** 2  
**WCAG Criterion:** 1.1.1 Non-text Content (Level A)  
**Knowledge Base:** https://knowledge.evinced.com/system-validations/image-alt

**Description:** Two decorative/informational images are rendered without an `alt` attribute. Screen readers will announce these as the raw filename (e.g., "New underscore Tees dot p-n-g"), which is confusing and meaningless to a visually impaired user.

**Affected Elements by Page:**

| Page | Selector | DOM Snippet |
|------|----------|-------------|
| Homepage | `img[src$="New_Tees.png"]` | `<img src="/images/home/New_Tees.png">` |
| Homepage | `img[src$="2bags_charms1.png"]` | `<img src="/images/home/2bags_charms1.png" loading="lazy">` |

**Source Files:**
- `src/components/HeroBanner.jsx` (line 18) — `<img src={HERO_IMAGE} />` (no `alt`)
- `src/components/TheDrop.jsx` (line 13) — `<img src={DROP_IMAGE} loading="lazy" />` (no `alt`)

**Recommended Fix:**

For `HeroBanner.jsx` — add a descriptive alt text reflecting the hero banner content:
```jsx
<img src={HERO_IMAGE} alt="New tees collection — winter clothing showcase" />
```

For `TheDrop.jsx` — add descriptive alt text for the product image:
```jsx
<img src={DROP_IMAGE} loading="lazy" alt="Limited-edition bag charms — The Drop collection" />
```

If the images are purely decorative and convey no information, use `alt=""` (empty string) to signal this to assistive technologies:
```jsx
<img src={HERO_IMAGE} alt="" role="presentation" />
```

**Why this approach:** WCAG 1.1.1 requires every `<img>` to have an `alt` attribute. The `alt` attribute serves as the text equivalent for screen reader users. Providing a meaningful description conveys the visual information; an empty `alt=""` on a purely decorative image tells the AT to skip it. Either is correct depending on whether the image carries information.

---

### CI-7: AXE-ARIA-REQUIRED-ATTR — `role="slider"` missing required ARIA attributes

**Evinced Type ID:** `AXE-ARIA-REQUIRED-ATTR`  
**Evinced Name:** Aria-required-attr  
**Total Instances:** 1  
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)  
**Knowledge Base:** https://knowledge.evinced.com/system-validations/aria-required-attr

**Description:** The `.drop-popularity-bar` element in `TheDrop.jsx` declares `role="slider"` but does not provide the three required ARIA attributes for that role: `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. The WAI-ARIA specification mandates these attributes for the `slider` role. Without them, AT cannot convey the current or range value of the slider to users.

**Affected Elements by Page:**

| Page | Selector | DOM Snippet |
|------|----------|-------------|
| Homepage | `.drop-popularity-bar` | `<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>` |

**Source File:**
- `src/components/TheDrop.jsx` (line 19)

**Recommended Fix:**

If this is a visual-only popularity indicator (not user-interactable):
```jsx
{/* Remove slider role — use a progressbar or status role for display-only indicators */}
<div
  role="progressbar"
  aria-label="Popularity indicator"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  className="drop-popularity-bar"
/>
```

If it must remain a slider, add the required attributes:
```jsx
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  tabIndex={0}
  className="drop-popularity-bar"
/>
```

**Why this approach:** The WAI-ARIA specification defines `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` as required properties for `role="slider"`. Without them, validators flag the element as broken and screen readers may announce it incorrectly or not at all. If the element is only a display indicator (not interactive), using `role="progressbar"` or `role="meter"` with the same required attributes is more semantically accurate and still requires the value attributes.

---

## Part 2 — Critical Issues Summary Table

| # | Type ID | Name | Instances | Pages Affected | WCAG |
|---|---------|------|-----------|----------------|------|
| CI-1 | `NOT_FOCUSABLE` | Keyboard accessible | 48 | All 5 | 2.1.1 (A) |
| CI-2 | `WRONG_SEMANTIC_ROLE` | Interactable role | 47 | All 5 | 4.1.2 (A) |
| CI-3 | `NO_DESCRIPTIVE_TEXT` | Accessible name | 18 | All 5 | 4.1.2 (A) |
| CI-4 | `AXE-BUTTON-NAME` | Button-name | 8 | All 5 | 4.1.2 (A) |
| CI-5 | `AXE-ARIA-VALID-ATTR-VALUE` | Aria-valid-attr-value | 3 | Homepage, Product Detail | 4.1.2 (A) |
| CI-6 | `AXE-IMAGE-ALT` | Image-alt | 2 | Homepage | 1.1.1 (A) |
| CI-7 | `AXE-ARIA-REQUIRED-ATTR` | Aria-required-attr | 1 | Homepage | 4.1.2 (A) |
| — | **Total** | | **127** | | |

---

## Part 3 — Non-Critical Issues (24 instances — Serious severity)

The following issues were identified as **Serious** severity. They reduce accessibility but do not completely block access. They are documented here for remediation planning but were not addressed in this audit cycle.

---

### NC-1: AXE-COLOR-CONTRAST — Insufficient colour contrast (18 instances)

**Evinced Type ID:** `AXE-COLOR-CONTRAST`  
**Evinced Name:** Color-contrast  
**WCAG Criterion:** 1.4.3 Contrast (Minimum) — Level AA  
**Total Instances:** 18

**Description:** Text and background colour combinations across multiple pages do not meet the WCAG AA minimum contrast ratio of 4.5:1 for normal text or 3:1 for large text.

**Affected Elements:**

| Page | Selector | Element Description |
|------|----------|---------------------|
| Homepage | `.hero-content > p` | Hero tagline ("Warm hues for cooler days") — light text on hero background |
| Products | `.filter-count` (×3) | Filter count spans `(8)`, `(4)`, `(4)` — grey text on white |
| Products | `.products-found` / `.new-page` | "X Products Found" text |
| Product Detail | `p:nth-child(4)` | Product description paragraph — low contrast grey text |
| Checkout | `.step-label` | "Shipping & Payment" step label |
| Checkout | `.summary-tax-note` | "Taxes calculated at next step" note |
| Order Confirmation | `.confirm-order-id-label` | "Order ID" label text |

**Recommended Fix (not applied this cycle):** Increase foreground text colour darkness or background lightness in the corresponding CSS files to achieve at least 4.5:1 ratio. Tools like the WebAIM Contrast Checker can validate specific colour pairs. Primary CSS files: `HeroBanner.css`, `FilterSidebar.css`, `NewPage.css`, `ProductPage.module.css`, `CheckoutPage.css`, `OrderConfirmationPage.css`.

---

### NC-2: AXE-HTML-HAS-LANG — `<html>` element missing `lang` attribute (5 instances)

**Evinced Type ID:** `AXE-HTML-HAS-LANG`  
**Evinced Name:** Html-has-lang  
**WCAG Criterion:** 3.1.1 Language of Page — Level A  
**Total Instances:** 5 (one per page — all from the same root `public/index.html`)

**Description:** The root `<html>` element in `public/index.html` does not have a `lang` attribute. This means screen readers cannot automatically switch to the correct language voice/dialect for the page content. All five pages are affected since they share a single HTML shell.

**Affected Element:**
- `html` element — `public/index.html` line 3: `<html>` (no lang attribute)

**Recommended Fix (not applied this cycle):**
```html
<html lang="en">
```

**Why not fixed:** Although this affects all 5 pages and the fix is a one-line change to `public/index.html`, it was classified as Serious (not Critical) by the Evinced engine. However, this is arguably the highest-value single fix in terms of effort-to-impact ratio and should be prioritised in the next remediation cycle.

---

### NC-3: AXE-VALID-LANG — Invalid `lang` attribute value (1 instance)

**Evinced Type ID:** `AXE-VALID-LANG`  
**Evinced Name:** Valid-lang  
**WCAG Criterion:** 3.1.2 Language of Parts — Level AA  
**Total Instances:** 1

**Description:** A `<p>` element in `TheDrop.jsx` has `lang="zz"`, which is not a valid BCP 47 language tag. Screen readers rely on the `lang` attribute to switch pronunciation models; an invalid tag may trigger incorrect pronunciation or be silently ignored.

**Affected Element:**

| Page | Selector | DOM Snippet |
|------|----------|-------------|
| Homepage | `p[lang="zz"]` | `<p lang="zz">Our brand-new, limited-edition plushie bag charms have officially dropped...</p>` |

**Source File:** `src/components/TheDrop.jsx` (line 21)

**Recommended Fix (not applied this cycle):**
Remove the invalid `lang` attribute (since the text is in English, the document-level `lang="en"` is sufficient):
```jsx
<p>Our brand-new, limited-edition plushie bag charms have officially dropped...</p>
```

---

## Part 4 — Non-Critical Issues Summary Table

| # | Type ID | Name | Instances | Pages Affected | WCAG |
|---|---------|------|-----------|----------------|------|
| NC-1 | `AXE-COLOR-CONTRAST` | Color-contrast | 18 | All 5 | 1.4.3 (AA) |
| NC-2 | `AXE-HTML-HAS-LANG` | Html-has-lang | 5 | All 5 | 3.1.1 (A) |
| NC-3 | `AXE-VALID-LANG` | Valid-lang | 1 | Homepage | 3.1.2 (AA) |
| — | **Total** | | **24** | | |

---

## Part 5 — Source-to-Issue Mapping

The table below maps source files to the critical issue categories they are responsible for, to aid remediation planning.

| Source File | Issues |
|-------------|--------|
| `src/components/Header.jsx` | CI-1, CI-2, CI-3 (icon buttons, flag selector, wishlist button) |
| `src/components/CartModal.jsx` | CI-4 (close button) |
| `src/components/WishlistModal.jsx` | CI-4 (close button) |
| `src/components/FilterSidebar.jsx` | CI-1, CI-2 (filter option divs) |
| `src/components/Footer.jsx` | CI-1, CI-2, CI-3 (footer nav items, FAQs) |
| `src/components/PopularSection.jsx` | CI-1, CI-2, CI-3 (shop-link divs) |
| `src/components/FeaturedPair.jsx` | CI-5 (`aria-expanded="yes"` on h1) |
| `src/components/HeroBanner.jsx` | CI-6 (missing alt on hero image) |
| `src/components/TheDrop.jsx` | CI-6 (missing alt on drop image), CI-7 (slider missing attrs), NC-3 (invalid lang) |
| `src/pages/CheckoutPage.jsx` | CI-1, CI-2 (checkout-continue-btn, step divs) |
| `src/pages/OrderConfirmationPage.jsx` | CI-1, CI-2 (confirm-home-link) |
| `src/pages/ProductPage.jsx` | CI-5 (`aria-relevant="changes"`) |
| `public/index.html` | NC-2 (missing `lang` on `<html>`) |

---

## Part 6 — Audit Methodology

### Pages Audited

The audit covered all five routes defined in the React SPA's router configuration:

| Page | Route | Entry Point |
|------|-------|-------------|
| Homepage | `/` | `src/pages/HomePage.jsx` |
| Products (New) | `/shop/new` | `src/pages/NewPage.jsx` |
| Product Detail | `/product/:id` | `src/pages/ProductPage.jsx` |
| Checkout | `/checkout` | `src/pages/CheckoutPage.jsx` |
| Order Confirmation | `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` |

### Tool and Configuration

- **SDK:** `@evinced/js-playwright-sdk` v2.44.0  
- **Method:** `evAnalyze()` — static single-point snapshot per page  
- **Browser:** Chromium (Playwright headless, viewport 1280×800)  
- **Server:** `npx serve dist -p 3000 --single` (production build)  
- **Auth:** Evinced Service Account (online mode)

### Limitations

- The `evAnalyze()` method captures issues visible in the DOM at the time of the snapshot. Dynamic components that only appear after user interaction (e.g., the CartModal drawer, dropdown menus, toast notifications) may contain additional issues not captured here.
- The checkout and order-confirmation pages were reached via a simulated user flow to ensure the correct application state was present.
- Colour contrast ratios are approximated by the axe-core engine used internally by Evinced; actual ratios depend on rendering conditions (font rendering, subpixel antialiasing).

---

*Report generated by Cursor Cloud Agent — Evinced Playwright SDK v2.44.0*  
*Raw JSON results: `tests/e2e/test-results/page-{slug}.json`*  
*HTML reports: `tests/e2e/test-results/page-{slug}.html`*

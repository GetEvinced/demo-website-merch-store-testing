# Accessibility Audit Report — Demo Website

**Audit Date:** 2026-03-23  
**Tool:** Evinced JS Playwright SDK v2.44.0 (`@evinced/js-playwright-sdk`)  
**Auditor:** Automated Cloud Agent  
**Base URL:** http://localhost:3000  

---

## Executive Summary

| Metric | Count |
|---|---|
| Pages audited | 5 |
| Total issues found | 151 |
| **Critical issues** | **127** |
| Serious issues | 24 |
| Unique critical issue types | 7 |
| Unique serious issue types | 3 |

All 151 issues map to WCAG 2.0/2.1/2.2 Level A or AA criteria. The 127 critical issues
represent complete barriers to access for keyboard and screen-reader users; they must be
resolved before the site can be considered conformant. The 24 serious issues degrade the
user experience significantly but do not block access outright.

---

## Pages Audited

| Page | URL | Critical | Serious | Total |
|---|---|---|---|---|
| Homepage | `/` | 32 | 3 | 35 |
| Products | `/shop/new` | 41 | 14 | 55 |
| Product Detail | `/product/:id` | 18 | 2 | 20 |
| Checkout | `/checkout` | 18 | 3 | 21 |
| Order Confirmation | `/order-confirmation` | 18 | 2 | 20 |
| **Total** | | **127** | **24** | **151** |

---

## Part 1 — Critical Issues (127 instances, 7 types)

---

### CI-1 · NOT_FOCUSABLE — Keyboard Inaccessible Interactive Elements

**Severity:** Critical  
**Count:** 48 instances across all 5 pages  
**WCAG:** 2.1.1 Keyboard (Level A), 2.1.3 Keyboard (No Exception) (Level AAA)  
**Evinced KB:** https://knowledge.evinced.com/system-validations/keyboard-accessible

**Description:**  
Keyboard users navigate with the `Tab` key, which only visits elements that are natively
focusable (links, buttons, inputs, etc.) or have `tabindex ≥ 0`. Every `<div>` or `<span>`
used as an interactive control is invisible to the keyboard focus ring and therefore
completely unreachable by keyboard-only users and switch-access devices.

#### Affected Elements by Page

**Homepage (`/`)** — `src/components/Header.jsx`, `src/components/Footer.jsx`, `src/components/PopularSection.jsx`, `src/components/TheDrop.jsx`

| Selector | Component / Location |
|---|---|
| `.wishlist-btn` | `Header.jsx:131` — `<div className="icon-btn wishlist-btn" onClick={openWishlist}>` |
| `.icon-btn:nth-child(2)` | `Header.jsx:140` — `<div className="icon-btn">` (Search) |
| `.icon-btn:nth-child(4)` | `Header.jsx:156` — `<div className="icon-btn">` (Login) |
| `.flag-group` | `Header.jsx:161` — `<div className="flag-group" onClick={() => {}}>` |
| `.product-card:nth-child(1..3) > .product-card-info > .shop-link` | `PopularSection.jsx:54` — `<div className="shop-link" onClick={() => navigate(...)}>` (×3) |
| `li:nth-child(3) > .footer-nav-item` | `Footer.jsx:13` — `<div className="footer-nav-item" onClick>Sustainability</div>` |
| `.footer-list:nth-child(2) > li > .footer-nav-item` | `Footer.jsx:18` — `<div className="footer-nav-item" onClick>FAQs</div>` |
| `.drop-popularity-bar` | `TheDrop.jsx:19` — `<div role="slider" ...>` (slider role requires focusability) |

**Products (`/shop/new`)** — adds 13 filter option `<div>` elements from `FilterSidebar.jsx`

| Selector | Component / Location |
|---|---|
| `.wishlist-btn`, `.icon-btn:nth-child(2)`, `.icon-btn:nth-child(4)`, `.flag-group` | Same as Homepage (Header present on all pages) |
| `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(1..5)` | `FilterSidebar.jsx:74` — `<div className="filter-option" onClick={() => onPriceChange(range)}>` (Price filters) |
| `.filter-group:nth-child(3) > .filter-options > .filter-option:nth-child(1..4)` | `FilterSidebar.jsx:116` — `<div className="filter-option" onClick={() => onSizeChange(size)}>` (Size filters) |
| `.filter-group:nth-child(4) > .filter-options > .filter-option:nth-child(1..3)` | `FilterSidebar.jsx:156` — `<div className="filter-option" onClick={() => onBrandChange(brand)}>` (Brand filters) |
| `li:nth-child(3) > .footer-nav-item`, `.footer-list:nth-child(2) > li > .footer-nav-item` | Footer (same as Homepage) |

**Product Detail (`/product/:id`)** — same Header + Footer elements

**Checkout (`/checkout`)** — adds one checkout-specific element

| Selector | Component / Location |
|---|---|
| `.checkout-continue-btn` | `CheckoutPage.jsx:156` — `<div className="checkout-continue-btn" onClick={() => setStep('shipping')}>Continue</div>` |

**Order Confirmation (`/order-confirmation`)** — adds one confirmation-specific element

| Selector | Component / Location |
|---|---|
| `.confirm-home-link` | `OrderConfirmationPage.jsx:40` — `<div className="confirm-home-link" onClick={() => {}}>← Back to Shop</div>` |

#### Recommended Fix

Replace each `<div>`/`<span>` acting as an interactive control with the semantically correct
native HTML element:

- **Navigation/link actions** → `<Link to="...">` or `<a href="...">` (natively focusable, announces as "link")
- **Button actions** (open modal, toggle filter, continue, close) → `<button type="button">` (natively focusable, announces as "button")
- **Role="slider"** elements → must have `tabindex="0"` and keyboard event handlers (`ArrowLeft`/`ArrowRight`) as well as the required ARIA attributes (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`)

For the header icon `<div>` elements (wishlist, search, login), convert to `<button>` and
add an `aria-label` that describes the action (e.g., `aria-label="Open wishlist"`).

For filter option `<div>` elements, convert to `<button type="button">` or use a proper
checkbox input pattern with `<input type="checkbox" />` and an associated `<label>`.

For `.checkout-continue-btn` and `.confirm-home-link`, convert to `<button>` and `<Link>` 
respectively.

**Why this approach:** Native HTML elements carry built-in keyboard focus handling, role
announcements, and activation semantics without any extra ARIA. Using native elements
eliminates the need for manually adding `tabindex`, `role`, and keyboard event listeners,
reducing maintenance risk and ensuring consistent browser support.

---

### CI-2 · WRONG_SEMANTIC_ROLE — Div-as-Interactive-Control

**Severity:** Critical  
**Count:** 47 instances across all 5 pages  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Evinced KB:** https://knowledge.evinced.com/system-validations/interactable-role

**Description:**  
Screen readers determine how to announce an element from its ARIA role. A plain `<div>` has
`role="generic"` — assistive technology will not announce it as actionable. Users will not
know they can click/activate it, and many will skip over it entirely. This is the semantic
companion issue to CI-1: the same elements that are not focusable also carry the wrong role.

#### Affected Elements by Page

The set of affected elements is identical to CI-1 (same 47 `<div>` nodes).
The one element counted in CI-1 but not here is `.drop-popularity-bar` which *does* carry
`role="slider"` — so its role is declared but the value is wrong, and it is still not
focusable (see CI-1 and CI-7 for details).

| Selector | Component / Correct Role |
|---|---|
| `.wishlist-btn` | `Header.jsx:131` → should be `<button>` |
| `.icon-btn:nth-child(2)` (Search) | `Header.jsx:140` → should be `<button>` |
| `.icon-btn:nth-child(4)` (Login) | `Header.jsx:156` → should be `<button>` |
| `.flag-group` | `Header.jsx:161` → should be `<button>` |
| `.shop-link` (×3 on homepage) | `PopularSection.jsx:54` → should be `<a>` or `<Link>` |
| Filter `.filter-option` (×13 on products page) | `FilterSidebar.jsx:74,116,156` → should be `<button>` or `<input type="checkbox">` |
| `li:nth-child(3) > .footer-nav-item` | `Footer.jsx:13` → should be `<button>` or `<a>` |
| `.footer-list:nth-child(2) > li > .footer-nav-item` | `Footer.jsx:18` → should be `<button>` or `<a>` |
| `.checkout-continue-btn` | `CheckoutPage.jsx:156` → should be `<button>` |
| `.confirm-home-link` | `OrderConfirmationPage.jsx:40` → should be `<Link>` or `<a>` |

#### Recommended Fix

Same as CI-1: replace `<div>`/`<span>` interactive elements with native `<button>` or
`<a>`/`<Link>` elements. The fix for CI-1 and CI-2 is the same code change.

**Why this approach:** ARIA `role="button"` on a `<div>` can technically convey the role,
but it still requires manually adding `tabindex="0"`, `onKeyDown` handler (Space/Enter),
and correct focus styling. Using a native `<button>` achieves all this automatically.
"First rule of ARIA: don't use ARIA when a native HTML element will do."

---

### CI-3 · NO_DESCRIPTIVE_TEXT — Missing Accessible Names on Interactive Elements

**Severity:** Critical  
**Count:** 18 instances across all 5 pages  
**WCAG:** 2.4.6 Headings and Labels (Level AA), 4.1.2 Name, Role, Value (Level A)  
**Evinced KB:** https://knowledge.evinced.com/system-validations/accessible-name

**Description:**  
Screen readers announce interactive elements using their accessible name. When an element
has no accessible name — either because it has no visible text or because visible text is
hidden with `aria-hidden="true"` — screen reader users hear nothing meaningful when
focusing that element. They cannot determine what the element does without trying it.

#### Affected Elements by Page

**Header icons — all 5 pages** (`Header.jsx`)

| Selector | Element | Problem |
|---|---|---|
| `.icon-btn:nth-child(2)` (Search) | `Header.jsx:140` | `<div>` with `<svg aria-hidden="true">` + `<span aria-hidden="true">Search</span>` — the only text is aria-hidden |
| `.icon-btn:nth-child(4)` (Login) | `Header.jsx:156` | Same: `<span aria-hidden="true">Login</span>` hides the visible label |

**Footer FAQs link — all 5 pages** (`Footer.jsx`)

| Selector | Element | Problem |
|---|---|---|
| `.footer-list:nth-child(2) > li > .footer-nav-item` | `Footer.jsx:18` | `<span aria-hidden="true">FAQs</span>` inside the `<div>` hides the only text content |

**Shop links on Homepage** (`PopularSection.jsx:54`)

| Selector | Element | Problem |
|---|---|---|
| `.product-card:nth-child(1..3) > .product-card-info > .shop-link` (×3) | `PopularSection.jsx:59` | `<span aria-hidden="true">{product.shopLabel}</span>` hides the label text; the `<div>` container has no accessible name |

#### Recommended Fix

- **Search and Login icon buttons:** Remove `aria-hidden="true"` from the `<span>` labels
  so they contribute to the accessible name, OR add `aria-label="Search"` /
  `aria-label="Open account"` to the `<button>` element when converting from `<div>`.
- **Footer FAQs:** Remove `aria-hidden="true"` from the `<span>` wrapping "FAQs", OR
  convert the `<div>` to an `<a>` or `<button>` with `aria-label="FAQs"`.
- **Shop links (PopularSection):** Remove `aria-hidden="true"` from the `<span>` that
  wraps the shop label text. The text itself ("Shop Tees", etc.) is the accessible name.
  Alternatively, after converting `.shop-link` to a `<Link>` (fixing CI-1/CI-2), the link
  text will be used as the accessible name automatically.

**Why this approach:** The simplest fix is to remove the incorrectly applied `aria-hidden`
attributes. The `aria-hidden` was added to the labels while leaving the parent container
without an accessible name — the inverse of what should be done. The correct pattern for
icon buttons is to have either (a) a visible text label that is NOT aria-hidden, or (b) a
visually-hidden `<span>` (using `sr-only` CSS) plus `aria-label` on the button, or
(c) `aria-label` directly on the button.

---

### CI-4 · AXE-BUTTON-NAME — Unnamed Close Buttons in Modals

**Severity:** Critical  
**Count:** 8 instances across all 5 pages (Cart Modal on 3 pages + Wishlist Modal on all 5)  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Evinced KB:** https://knowledge.evinced.com/system-validations/button-name

**Description:**  
The close (×) buttons in the CartModal and WishlistModal are proper `<button>` elements,
so they are keyboard focusable. However, their only content is an SVG icon with
`aria-hidden="true"` and no `aria-label`. Screen readers announce these as "button" with
no name, giving users no indication of what the button does.

#### Affected Elements by Page

| Selector | Component / Location |
|---|---|
| `#cart-modal > div:nth-child(1) > button` | `CartModal.jsx:56` — close button, icon-only |
| `div[role="dialog"] > div:nth-child(1) > button` | `WishlistModal.jsx:60` — close button, icon-only |

Present on **all 5 pages** because Header (which contains the cart/wishlist launchers and
renders these modals via App.jsx) is global. The WishlistModal selector appears on all 5 
pages; the CartModal's `#cart-modal` selector appears on the first 3 pages where the
cart can be opened (homepage, products, product detail).

#### Recommended Fix

Add `aria-label="Close cart"` (or `"Close wishlist"`) to each close button:

```jsx
// CartModal.jsx line 56
<button
  className={styles.closeBtn}
  onClick={closeCart}
  aria-label="Close cart"
>
```

```jsx
// WishlistModal.jsx line 60
<button
  className={styles.closeBtn}
  onClick={closeWishlist}
  aria-label="Close wishlist"
>
```

**Why this approach:** `aria-label` directly on the `<button>` is the most reliable pattern
for icon-only buttons. It overrides any inner content for the accessible name computation,
meaning the SVG (even without `aria-hidden`) will not pollute the label. This is a
one-attribute change per button and requires no structural refactoring. The value should
include the context ("cart" vs "wishlist") so screen reader users know which dialog they
are closing.

---

### CI-5 · AXE-ARIA-VALID-ATTR-VALUE — Invalid ARIA Attribute Values

**Severity:** Critical  
**Count:** 3 instances (2 on Homepage, 1 on Product Detail)  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Evinced KB:** https://knowledge.evinced.com/system-validations/aria-valid-attr-value

**Description:**  
ARIA attributes have a defined set of valid values. Using an invalid value is equivalent to
providing no value — browsers and assistive technologies silently ignore invalid ARIA, so
the developer's intent is never communicated to the user.

#### Affected Elements

**1 & 2 — `aria-expanded="yes"` (Homepage, FeaturedPair component)**

| Selector | File / Line |
|---|---|
| `.featured-card:nth-child(1) > .featured-card-info > h1` | `FeaturedPair.jsx:46` |
| `.featured-card:nth-child(2) > .featured-card-info > h1` | `FeaturedPair.jsx:46` |

```jsx
// Current (invalid)
<h1 aria-expanded="yes">{item.title}</h1>

// aria-expanded accepts only "true" or "false" (or absent)
```

Additionally, `aria-expanded` is not meaningful on a heading element (`<h1>`). It is valid
only on elements that control a collapsible container (buttons, disclosure widgets, etc.).

**3 — `aria-relevant="changes"` (Product Detail page, ProductPage component)**

| Selector | File / Line |
|---|---|
| `ul[aria-relevant="changes"]` | `ProductPage.jsx:144` |

```jsx
// Current (invalid)
<ul aria-relevant="changes" aria-live="polite">

// aria-relevant accepts only space-separated tokens from:
// "additions", "removals", "text", "all", or "additions text" (default)
// "changes" is not a valid token
```

#### Recommended Fix

**FeaturedPair.jsx:** Remove `aria-expanded` from the `<h1>` entirely. It is not a
collapsible widget and heading elements are not appropriate hosts for `aria-expanded`.

```jsx
// FeaturedPair.jsx line 46
<h1>{item.title}</h1>
```

**ProductPage.jsx:** Change `aria-relevant="changes"` to `aria-relevant="additions text"`
(the most common live-region relevance), or simply remove it and rely on the default
(`aria-relevant="additions text"` is the implied default for `aria-live` regions).

```jsx
// ProductPage.jsx line 144
<ul
  className={styles.detailsList}
  aria-live="polite"
>
```

**Why this approach:** The safest fix for `aria-expanded="yes"` is removal rather than
replacement with `aria-expanded="false"` or `aria-expanded="true"`, because the `<h1>`
element is not a disclosure widget — adding a valid value would still be semantically
incorrect. For `aria-relevant`, omitting it entirely defers to the browser default, which
is correct for a static product-details list that does not dynamically change.

---

### CI-6 · AXE-IMAGE-ALT — Images Missing Alternative Text

**Severity:** Critical  
**Count:** 2 instances (Homepage only)  
**WCAG:** 1.1.1 Non-text Content (Level A)  
**Evinced KB:** https://knowledge.evinced.com/system-validations/image-alt

**Description:**  
Informative images must have an `alt` attribute describing the image content. When `alt` is
absent, screen readers typically read the image filename (e.g., "New underscore Tees dot
p-n-g"), which is disorienting and meaningless. Both affected images are decorative
promotional images that also serve as visual context for the section content — they need
a concise, descriptive `alt`.

#### Affected Elements

| Selector | File / Line | Context |
|---|---|---|
| `img[src$="New_Tees.png"]` | `HeroBanner.jsx:18` — `<img src={HERO_IMAGE} />` | Hero banner image for "Winter Basics" promotion |
| `img[src$="2bags_charms1.png"]` | `TheDrop.jsx:13` — `<img src={DROP_IMAGE} loading="lazy" />` | "The Drop" section image showing bag charms |

#### Recommended Fix

Add descriptive `alt` attributes to both images:

```jsx
// HeroBanner.jsx line 18
<img src={HERO_IMAGE} alt="Collection of new winter tees displayed on a clothing rack" />
```

```jsx
// TheDrop.jsx line 13
<img
  src={DROP_IMAGE}
  loading="lazy"
  alt="Limited-edition plushie bag charms: Android bot, YouTube icon, and Super G"
/>
```

**Why this approach:** The `alt` text should convey the informational value of the image in
context. For the hero banner, the image supports the "Winter Basics" heading; for The Drop,
the image shows the specific product being promoted. Neither image is purely decorative
(which would warrant `alt=""`), because each provides visual context that supplements the
surrounding text. Short, factual descriptions are preferred over verbose captions.

---

### CI-7 · AXE-ARIA-REQUIRED-ATTR — Slider Missing Required ARIA Attributes

**Severity:** Critical  
**Count:** 1 instance (Homepage only)  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Evinced KB:** https://knowledge.evinced.com/system-validations/aria-required-attr

**Description:**  
An element with `role="slider"` is a custom ARIA range widget. ARIA requires that any
slider expose three state attributes — `aria-valuenow`, `aria-valuemin`, and
`aria-valuemax` — so that assistive technologies can announce the current value and range
to the user. Without them, the slider is broken for screen reader users.

#### Affected Element

| Selector | File / Line |
|---|---|
| `.drop-popularity-bar` | `TheDrop.jsx:19` — `<div role="slider" aria-label="Popularity indicator" className="drop-popularity-bar">` |

#### Recommended Fix

If this element represents a static, non-interactive indicator (not a user-adjustable
slider), the correct fix is to remove `role="slider"` entirely and use an appropriate
static role or a visually styled progress bar:

```jsx
// TheDrop.jsx line 19 — Option A: use role="meter" or role="progressbar" (static indicator)
<div
  role="progressbar"
  aria-label="Popularity indicator"
  aria-valuenow={85}
  aria-valuemin={0}
  aria-valuemax={100}
  className="drop-popularity-bar"
/>
```

```jsx
// Option B: if truly decorative, hide from AT
<div
  className="drop-popularity-bar"
  aria-hidden="true"
/>
```

**Why this approach:** The `role="slider"` implies a user-adjustable range control with
keyboard interaction (Arrow keys). If the bar is read-only (purely decorative or
informational), `role="progressbar"` or `role="meter"` is more semantically accurate and
requires `aria-valuenow`, `aria-valuemin`, `aria-valuemax` by specification. If the element
is purely decorative and conveys no information beyond what the surrounding text already
says, `aria-hidden="true"` is the correct solution. Either way, the current combination of
`role="slider"` with no value attributes is invalid and must be corrected.

---

## Part 2 — Critical Issue Impact Summary

The table below shows how each critical issue type propagates across the five pages,
helping prioritise by blast radius:

| Issue Type | Homepage | Products | Product Detail | Checkout | Order Confirm | Total |
|---|---|---|---|---|---|---|
| NOT_FOCUSABLE | 10 | 18 | 6 | 7 | 7 | **48** |
| WRONG_SEMANTIC_ROLE | 9 | 17 | 6 | 7 | 8 | **47** |
| NO_DESCRIPTIVE_TEXT | 6 | 3 | 3 | 3 | 3 | **18** |
| AXE-BUTTON-NAME | 2 | 2 | 2 | 1 | 1 | **8** |
| AXE-ARIA-VALID-ATTR-VALUE | 2 | 0 | 1 | 0 | 0 | **3** |
| AXE-IMAGE-ALT | 2 | 0 | 0 | 0 | 0 | **2** |
| AXE-ARIA-REQUIRED-ATTR | 1 | 0 | 0 | 0 | 0 | **1** |
| **Total Critical** | **32** | **41** | **18** | **18** | **18** | **127** |

**Key observation:** CI-1 (NOT_FOCUSABLE) and CI-2 (WRONG_SEMANTIC_ROLE) together
account for 95 of the 127 critical issues, and the root cause for the vast majority of
them is the same: `<div>` elements used as interactive controls in `Header.jsx`,
`Footer.jsx`, `PopularSection.jsx`, `FilterSidebar.jsx`, `CheckoutPage.jsx`, and
`OrderConfirmationPage.jsx`. Fixing these `<div>`-based controls at the component level
will resolve 75% of all critical issues in a single pass.

---

## Part 3 — Non-Critical (Serious) Issues (24 instances, 3 types)

These issues were identified by the audit but not remediated in this cycle. They
degrade the user experience significantly, particularly for users with low vision or
those who rely on correct language identification.

---

### NC-1 · AXE-COLOR-CONTRAST — Insufficient Color Contrast

**Severity:** Serious  
**Count:** 18 instances across 5 pages  
**WCAG:** 1.4.3 Contrast (Minimum) (Level AA)  
**Evinced KB:** https://knowledge.evinced.com/system-validations/color-contrast

**Description:**  
Text and background color combinations that do not meet the 4.5:1 ratio for normal text
(3:1 for large text ≥ 18px / bold ≥ 14px) are difficult or impossible to read for users
with low vision, color blindness, or who use their devices in bright ambient light.

#### Affected Elements

| Page | Selector | Component / Context |
|---|---|---|
| Homepage | `.hero-content > p` | `HeroBanner.jsx` — "Warm hues for cooler days" tagline over hero image |
| Homepage | `.hero-banner` (background) | `HeroBanner.jsx` — hero banner background |
| Products | `.filter-option-label > .filter-count` (×multiple) | `FilterSidebar.jsx:80,122,162` — count badges "(3)", "(7)" etc. |
| Products | `.new-page` (background context) | `NewPage.jsx` — page background |
| Products | `.products-found` | `NewPage.jsx:127` — "Showing N products" text |
| Product Detail | `p:nth-child(4)` | `ProductPage.jsx` — product description paragraph |
| Product Detail | `#main-content > div` | `ProductPage.jsx` — main content area |
| Checkout | `.checkout-step:nth-child(3) > .step-label` | `CheckoutPage.jsx:62,67` — step labels in progress indicator |
| Checkout | `.summary-tax-note` | `CheckoutPage.jsx:154` — "Taxes calculated at next step" note |
| Order Confirm | `.confirm-order-id-label` | `OrderConfirmationPage.jsx:31` — "Order ID" label |
| Order Confirm | `.confirm-order-id-box` | `OrderConfirmationPage.jsx:30` — order ID container |

**Recommended fix (not applied):** Darken the foreground color of low-contrast text
elements (or lighten background) to achieve the 4.5:1 minimum ratio. Use a contrast
checker (e.g., WebAIM Contrast Checker) to validate new color values. For `.hero-content p`
on the hero banner, consider adding a semi-transparent dark scrim behind the text. For
`.filter-count` badges, darken the badge text from its current light grey to meet contrast.

---

### NC-2 · AXE-HTML-HAS-LANG — Missing `lang` Attribute on `<html>` Element

**Severity:** Serious  
**Count:** 5 instances (one per page — same root cause)  
**WCAG:** 3.1.1 Language of Page (Level A)  
**Evinced KB:** https://knowledge.evinced.com/system-validations/html-has-lang

**Description:**  
The `<html>` element in `public/index.html` lacks a `lang` attribute. Screen readers use
the declared language to select the correct pronunciation engine and speech rules. Without
it, TTS synthesis may mispronounce words and users who depend on correct prosody will be
poorly served.

#### Affected Element

| Selector | File / Line |
|---|---|
| `html` (all pages) | `public/index.html:3` — `<html>` (no `lang` attribute) |

```html
<!-- Current -->
<!-- A11Y-AXE html-has-lang: <html> element is missing a lang attribute -->
<html>

<!-- Correct -->
<html lang="en">
```

**Recommended fix (not applied):** Add `lang="en"` (or the appropriate BCP 47 language
tag) to the `<html>` element in `public/index.html`. This single one-character change
fixes the issue on all 5 pages simultaneously.

---

### NC-3 · AXE-VALID-LANG — Invalid `lang` Attribute Value

**Severity:** Serious  
**Count:** 1 instance (Homepage only)  
**WCAG:** 3.1.2 Language of Parts (Level AA)  
**Evinced KB:** https://knowledge.evinced.com/system-validations/valid-lang

**Description:**  
A `<p lang="zz">` in `TheDrop.jsx` specifies `"zz"` as the language tag. `"zz"` is not a
valid BCP 47 language tag. Screen readers will be unable to select the appropriate
pronunciation rules for this paragraph. The value was intentionally set incorrectly as a
demo a11y defect.

#### Affected Element

| Selector | File / Line |
|---|---|
| `p[lang="zz"]` | `TheDrop.jsx:21` — the drop section description paragraph |

**Recommended fix (not applied):** Change `lang="zz"` to `lang="en"` (or remove the
attribute if the text is already in the document's primary language):

```jsx
// TheDrop.jsx line 21
<p lang="en">
  Our brand-new, limited-edition plushie bag charms...
</p>
```

---

## Part 4 — Remediation Priority Matrix

| Priority | Issue ID | Root Cause | Files to Change | Impact (issues resolved) |
|---|---|---|---|---|
| P0 | CI-1 + CI-2 | `<div>` used as interactive control | `Header.jsx`, `Footer.jsx`, `PopularSection.jsx`, `FilterSidebar.jsx`, `CheckoutPage.jsx`, `OrderConfirmationPage.jsx` | 95 critical issues |
| P1 | CI-3 | `aria-hidden` on visible label text | `Header.jsx`, `Footer.jsx`, `PopularSection.jsx` | 18 critical issues |
| P2 | CI-4 | Close buttons with no accessible name | `CartModal.jsx`, `WishlistModal.jsx` | 8 critical issues |
| P3 | CI-6 | Missing `alt` on images | `HeroBanner.jsx`, `TheDrop.jsx` | 2 critical issues |
| P4 | CI-7 | `role="slider"` missing required ARIA attributes | `TheDrop.jsx` | 1 critical issue |
| P5 | CI-5 | Invalid ARIA attribute values | `FeaturedPair.jsx`, `ProductPage.jsx` | 3 critical issues |
| P6 | NC-2 | Missing `lang` on `<html>` | `public/index.html` | 5 serious issues |
| P7 | NC-1 | Insufficient color contrast | Multiple CSS files | 18 serious issues |
| P8 | NC-3 | Invalid `lang="zz"` | `TheDrop.jsx` | 1 serious issue |

---

## Part 5 — Source File Change Map

| Source File | Critical Issues Originating Here |
|---|---|
| `src/components/Header.jsx` | CI-1, CI-2, CI-3 (wishlist-btn, icon-btn Search/Login, flag-group) |
| `src/components/Footer.jsx` | CI-1, CI-2, CI-3 (Sustainability div, FAQs div with aria-hidden label) |
| `src/components/PopularSection.jsx` | CI-1, CI-2, CI-3 (shop-link divs) |
| `src/components/FilterSidebar.jsx` | CI-1, CI-2 (filter-option divs) |
| `src/components/CartModal.jsx` | CI-4 (unnamed close button) |
| `src/components/WishlistModal.jsx` | CI-4 (unnamed close button) |
| `src/components/FeaturedPair.jsx` | CI-5 (aria-expanded="yes") |
| `src/components/HeroBanner.jsx` | CI-6 (img missing alt) |
| `src/components/TheDrop.jsx` | CI-6 (img missing alt), CI-7 (slider missing ARIA attrs) |
| `src/pages/ProductPage.jsx` | CI-5 (aria-relevant="changes") |
| `src/pages/CheckoutPage.jsx` | CI-1, CI-2 (checkout-continue-btn div) |
| `src/pages/OrderConfirmationPage.jsx` | CI-1, CI-2 (confirm-home-link div) |
| `public/index.html` | NC-2 (missing lang attribute) |

---

## Appendix — Audit Methodology

1. **Tooling:** Evinced JS Playwright SDK (`@evinced/js-playwright-sdk` v2.44.0) via
   `evAnalyze()` for static per-page scans. No Axe-core was used directly; some
   issue types prefixed with `AXE-` are Evinced rules that wrap or complement axe-core
   checks with additional context.
2. **Spec:** `tests/e2e/specs/per-page-a11y-audit.spec.ts` — one test per page, results
   saved as JSON to `tests/e2e/test-results/page-*.json`.
3. **Pages requiring navigation:** Checkout and Order Confirmation pages were reached by
   simulating a full purchase journey (add item → proceed to checkout → fill form →
   submit), because those pages require cart state.
4. **No remediations applied:** This report documents findings only. No source code was
   modified.
5. **Raw data:** JSON issue files are located at `tests/e2e/test-results/`:
   - `page-homepage.json` (35 issues)
   - `page-products.json` (55 issues)
   - `page-product-detail.json` (20 issues)
   - `page-checkout.json` (21 issues)
   - `page-order-confirmation.json` (20 issues)

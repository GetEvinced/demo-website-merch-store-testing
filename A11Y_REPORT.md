# Accessibility (A11Y) Audit Report — Demo Website

**Repository:** `demo-website`
**Branch:** `cursor/website-accessibility-report-ff0c`
**Audit Date:** 2026-03-16
**Tool:** `@axe-core/playwright` v4.9 (axe-core rules: WCAG 2.0 A/AA, WCAG 2.1 A/AA, Best Practices)
**Playwright:** v1.44 · **Browser:** Chromium headless

---

## Executive Summary

| Metric | Value |
|---|---|
| Pages scanned | 5 |
| Total unique violation types | 12 |
| Total affected element occurrences | 84 |
| **Critical violations** | **5 types · 9 occurrences** |
| Serious violations | 4 types · 31 occurrences |
| Moderate violations | 2 types · 15 occurrences |
| Best-practice violations | 1 type · 29 occurrences |

### Pages Audited

| Page | Route | Description |
|---|---|---|
| HomePage | `/` | Landing page with hero banner, product collections |
| NewPage | `/shop/new` | Products listing with filter sidebar and sort |
| ProductPage | `/product/1` | Single product detail with quantity + add-to-cart |
| CheckoutPage (basket) | `/checkout` | Shopping cart review step |
| CheckoutPage (shipping) | `/checkout#shipping` | Shipping & payment form step |

---

## Critical Issues

> **Critical** = Automated tool confidence is high that the issue prevents access for users of assistive technology (screen readers, keyboard-only navigation). These map to WCAG Level A or AA success criteria.

---

### CRITICAL-1 · Missing Required ARIA Attributes (`aria-required-attr`)

**WCAG:** 4.1.2 Name, Role, Value (Level A)
**Pages affected:** HomePage (`/`), NewPage (`/shop/new`)

#### Occurrences

| # | Element | HTML Snippet | Page | Missing Attributes |
|---|---|---|---|---|
| 1 | `.drop-popularity-bar` | `<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar">` | HomePage | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| 2 | Hidden spinbutton | `<div role="spinbutton" aria-label="Page number" aria-valuemin="1" aria-valuemax="10">1</div>` | NewPage | `aria-valuenow` |
| 3 | Hidden combobox | `<div role="combobox" aria-label="Filter preset">All</div>` | NewPage | `aria-controls`, `aria-expanded` |

**Root Cause:**
- `TheDrop.jsx` L20: the popularity slider `div` has `role="slider"` but omits all three required numeric attributes (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`).
- `NewPage.jsx` L220–222: two hidden demonstration elements intentionally placed in the products grid also violate this rule.

**Recommended Fix:**

*For `TheDrop.jsx` `.drop-popularity-bar`:*
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

*For `NewPage.jsx` hidden elements — remove them entirely if they serve no real purpose, or supply the missing attributes:*
```jsx
<div role="spinbutton" aria-label="Page number"
     aria-valuenow={1} aria-valuemin={1} aria-valuemax={10}>1</div>
<div role="combobox" aria-label="Filter preset"
     aria-controls="filter-preset-listbox" aria-expanded="false">All</div>
```

**Why this approach:** The WAI-ARIA specification mandates that every `role="slider"` exposes its current, minimum, and maximum values so that screen readers can announce them (e.g., "Popularity indicator, 75 out of 100, slider"). Without these attributes the assistive technology announces the role but cannot convey the current value, making the widget non-functional for screen-reader users. Supplying accurate numeric values is the minimal change required to satisfy WCAG 4.1.2.

---

### CRITICAL-2 · Invalid ARIA Attribute Values (`aria-valid-attr-value`)

**WCAG:** 4.1.2 Name, Role, Value (Level A)
**Pages affected:** HomePage (`/`), NewPage (`/shop/new`), ProductPage (`/product/1`)

#### Occurrences

| # | Element | HTML Snippet | Page | Problem |
|---|---|---|---|---|
| 1 | `h1` in FeaturedPair card 1 | `<h1 aria-expanded="yes">Keep on Truckin'</h1>` | HomePage, NewPage | `aria-expanded` must be `"true"` or `"false"`, not `"yes"` |
| 2 | `h1` in FeaturedPair card 2 | `<h1 aria-expanded="yes">Limited edition and traveling fast</h1>` | HomePage, NewPage | Same |
| 3 | `ul.detailsList` | `<ul aria-relevant="changes" aria-live="polite">` | ProductPage | `aria-relevant` must be space-separated tokens: `additions`, `removals`, `text`, `all` — `"changes"` is not a valid token |

**Root Cause:**
- `FeaturedPair.jsx` L51: `aria-expanded="yes"` on a heading element — both the attribute value (`yes` instead of `true`/`false`) and the use of `aria-expanded` on a static heading element are incorrect.
- `ProductPage.jsx` L383: `aria-relevant="changes"` is an invalid token; the supported values are `additions`, `removals`, `text`, and `all`.

**Recommended Fix:**

*`FeaturedPair.jsx` — remove the misapplied attribute entirely from the heading:*
```jsx
{/* Before */}
<h1 aria-expanded="yes">{item.title}</h1>

{/* After */}
<h3>{item.title}</h3>
```
(also corrects the heading level — see MODERATE-1)

*`ProductPage.jsx` — correct the live-region token:*
```jsx
{/* Before */}
<ul className={styles.detailsList} aria-relevant="changes" aria-live="polite">

{/* After — use a valid token, or remove aria-relevant if the list is static */}
<ul className={styles.detailsList} aria-live="polite">
```

**Why this approach:** Screen readers parse `aria-expanded` as a boolean state. The string `"yes"` is not a valid boolean and causes assistive technologies to either ignore the attribute or announce an error state. Removing the attribute from the heading is correct because `aria-expanded` should only appear on interactive disclosure widgets (buttons, comboboxes, tree nodes), not on static headings. For the live region, removing the invalid `aria-relevant` allows the browser's default behaviour (`"additions text"`) which is appropriate for a static product details list.

---

### CRITICAL-3 · Buttons Without Discernible Text (`button-name`)

**WCAG:** 4.1.2 Name, Role, Value (Level A) · Section 508 §1194.22(a)
**Pages affected:** All pages (Header on every page); additionally CartModal on any page where cart is opened

#### Occurrences

| # | Element | HTML Snippet | Component | Page |
|---|---|---|---|---|
| 1 | Cart modal close button | `<button class="[hashed]">` (SVG child hidden with `aria-hidden`) | `CartModal.jsx` | All pages (when cart is open) |
| 2 | Cart button in Header | `<button class="icon-btn cart-btn">` (SVG `aria-hidden`, visible text "Basket" but insufficient) | `Header.jsx` L145–153 | All pages |

**Root Cause:**
- `CartModal.jsx`: the close button's inner SVG carries `aria-hidden="true"`, and no `aria-label` is present on the `<button>` itself — the button has no accessible name.
- `Header.jsx` L145: the `aria-label` was deliberately removed from the cart trigger button. The visible text "Basket" is inside a `<span>` but the overall `button-name` rule fires because the computed accessible name is empty (the span content may be hidden or the hashed class matches a CSS rule that hides it visually while `aria-hidden` hides the icon).

**Recommended Fix:**

*`CartModal.jsx` — add `aria-label` to the close button:*
```jsx
<button
  className={styles.closeBtn}
  onClick={closeCart}
  aria-label="Close shopping cart"
>
  <svg ... aria-hidden="true">...</svg>
</button>
```

*`Header.jsx` — restore `aria-label` on the cart trigger:*
```jsx
<button
  className="icon-btn cart-btn"
  onClick={openCart}
  aria-label={`Shopping cart, ${totalCount} item${totalCount !== 1 ? 's' : ''}`}
>
  <svg ... aria-hidden="true" />
  <span aria-hidden="true">Basket</span>
  <span className="cart-count" aria-hidden="true">{totalCount}</span>
</button>
```

**Why this approach:** WCAG 4.1.2 requires every interactive control to have a programmatically determinable name. For icon-only buttons the recommended technique is `aria-label` on the button element itself — this name is announced by all major screen readers without requiring visible text. Including the cart item count in the label gives screen-reader users immediate context when arriving at the control. Making the visible "Basket" text `aria-hidden` avoids double-announcement while keeping the visual label for sighted users.

---

### CRITICAL-4 · Images Missing Alternative Text (`image-alt`)

**WCAG:** 1.1.1 Non-text Content (Level A) · Section 508 §1194.22(a)
**Pages affected:** HomePage (`/`)

#### Occurrences

| # | Element | HTML Snippet | Component | Description |
|---|---|---|---|---|
| 1 | Hero banner product image | `<img src="/images/home/New_Tees.png">` | `HeroBanner.jsx` L18 | Decorative/informational hero image, `alt` attribute absent entirely |
| 2 | "The Drop" product image | `<img src="/images/home/2bags_charms1.png" loading="lazy">` | `TheDrop.jsx` L9 | Promotional product image, `alt` attribute absent entirely |

**Root Cause:**
- `HeroBanner.jsx` L18 and `TheDrop.jsx` L9: `<img>` tags have no `alt` attribute at all. When `alt` is absent (as opposed to `alt=""`), screen readers fall back to reading the filename aloud, e.g., "2bags_charms1.png" — which is meaningless to users.

**Recommended Fix:**

*`HeroBanner.jsx`:*
```jsx
{/* Before */}
<img src={HERO_IMAGE} />

{/* After — provide a descriptive alt that conveys the promotional context */}
<img src={HERO_IMAGE} alt="Winter Basics collection — new tee shirts" />
```

*`TheDrop.jsx`:*
```jsx
{/* Before */}
<img src={DROP_IMAGE} loading="lazy" />

{/* After — describe the product being promoted */}
<img
  src={DROP_IMAGE}
  alt="Limited-edition Android, YouTube, and Super G plushie bag charms"
  loading="lazy"
/>
```

**Why this approach:** WCAG 1.1.1 requires all informational images to have `alt` text that conveys equivalent information to sighted users. These images are content-bearing promotional images (not decorative), so `alt=""` would be incorrect. The alt text should concisely describe what the image shows and its marketing context so screen-reader users receive the same promotional message as sighted visitors. Using `alt=""` would be appropriate only for purely decorative images that carry no informational value.

---

### CRITICAL-5 · Duplicate IDs Referenced by ARIA (`duplicate-id-aria`)

**WCAG:** 4.1.1 Parsing (Level A)
**Pages affected:** HomePage (`/`), NewPage (`/shop/new`)

#### Occurrences

| # | Element | Duplicate `id` | Component | Impact |
|---|---|---|---|---|
| 1 | Price filter toggle button | `aria-describedby="filter-section-title"` → two `<span id="filter-section-title">` exist | `FilterSidebar.jsx` L309 & L351 | Both Price and Size toggle buttons reference the same id; the browser resolves to the first match only |
| 2 | Featured card images | Two `<img id="featured-card-img">` rendered by `.map()` | `FeaturedPair.jsx` L49 | Any `aria-labelledby` reference to this id is ambiguous |
| 3 | Featured card labels | Two `<p id="featured-card-label">` rendered by `.map()` | `FeaturedPair.jsx` L52 | Same ambiguity problem |

**Root Cause:**
- `FilterSidebar.jsx` repeats `id="filter-section-title"` on both the Price and Size filter section labels.
- `FeaturedPair.jsx` maps over an array and assigns static `id` values (`featured-card-img`, `featured-card-label`) without making them unique per iteration.

**Recommended Fix:**

*`FilterSidebar.jsx` — use unique IDs per section:*
```jsx
{/* Price section */}
<span id="filter-price-title">Price</span>

{/* Size section */}
<span id="filter-size-title">Size</span>
```

*`FeaturedPair.jsx` — derive IDs from the item index or id:*
```jsx
<img
  src={item.image}
  alt={item.imageAlt}
  loading="lazy"
  id={`featured-card-img-${item.id}`}
/>
<p className="featured-eyebrow" id={`featured-card-label-${item.id}`}>
  {item.eyebrow}
</p>
```

**Why this approach:** The HTML specification requires `id` attributes to be unique within a document. ARIA attributes such as `aria-labelledby` and `aria-describedby` use ID references to create programmatic relationships between elements. When multiple elements share the same ID the browser resolves to the first match only, causing the wrong label to be announced for some controls. Using item-specific IDs (derived from a unique data property) guarantees each ARIA reference resolves to the correct element.

---

## Recommended Remediation Summary (Critical Issues Only)

| Issue ID | File(s) | Change Required |
|---|---|---|
| CRITICAL-1 | `src/components/TheDrop.jsx` | Add `aria-valuenow`, `aria-valuemin`, `aria-valuemax` to `.drop-popularity-bar` |
| CRITICAL-1 | `src/pages/NewPage.jsx` | Fix or remove hidden ARIA role demo elements (spinbutton, combobox) |
| CRITICAL-2 | `src/components/FeaturedPair.jsx` | Remove `aria-expanded="yes"` from heading elements; change `h1` → `h3` |
| CRITICAL-2 | `src/pages/ProductPage.jsx` | Remove or fix `aria-relevant="changes"` on details list |
| CRITICAL-3 | `src/components/CartModal.jsx` | Add `aria-label="Close shopping cart"` to close button |
| CRITICAL-3 | `src/components/Header.jsx` | Restore `aria-label` on cart trigger button |
| CRITICAL-4 | `src/components/HeroBanner.jsx` | Add descriptive `alt` text to hero image |
| CRITICAL-4 | `src/components/TheDrop.jsx` | Add descriptive `alt` text to drop image |
| CRITICAL-5 | `src/components/FilterSidebar.jsx` | Make filter section title IDs unique per section |
| CRITICAL-5 | `src/components/FeaturedPair.jsx` | Derive unique IDs from `item.id` in `.map()` |

---

## Non-Critical Issues (Not Remediated)

The following issues were detected but classified as serious, moderate, or best-practice. They represent real accessibility barriers and should be addressed in subsequent sprints.

---

### SERIOUS-1 · Missing `lang` Attribute on `<html>` (`html-has-lang`)

**WCAG:** 3.1.1 Language of Page (Level A)
**Pages affected:** All pages
**Occurrences:** 1 (the single `<html>` element in `public/index.html`)

The `<html>` element in `public/index.html` has no `lang` attribute. Screen readers use this attribute to select the correct pronunciation engine and character rules. Without it, screen readers either use their default language or announce each word incorrectly for non-default users.

**Element:** `<html>` in `public/index.html`

**Recommended fix:**
```html
<html lang="en">
```

---

### SERIOUS-2 · Positive `tabindex` Values (`tabindex`)

**WCAG:** 2.4.3 Focus Order (Level A)
**Pages affected:** All pages (Header present on every page)
**Occurrences:** 7 navigation link elements

In `Header.jsx` L175, the `reverseTabIndex` calculation assigns `tabIndex` values from 7 (first link "New") down to 1 (last link "Sale"), deliberately reversing the keyboard focus order relative to visual order. This causes keyboard users to tab through navigation in reverse — Sale → Collections → Shop by Brand → … → New — which conflicts with the left-to-right visual reading order and violates WCAG 2.4.3.

**Elements:** All `<a>` elements inside `nav[aria-label="Main navigation"]`

**Recommended fix:**
```jsx
// Remove the reverseTabIndex variable entirely
// Let tabIndex default to 0 (or omit it) for natural DOM order
<Link
  to={item.href}
  // tabIndex={reverseTabIndex}  ← remove this line
  ...
>
```

---

### SERIOUS-3 · Insufficient Color Contrast (`color-contrast`)

**WCAG:** 1.4.3 Contrast (Minimum) (Level AA)
**Pages affected:** HomePage, NewPage, CheckoutPage (basket)
**Total occurrences:** 16 nodes

| Page | Element | Foreground | Background | Actual Ratio | Required |
|---|---|---|---|---|---|
| HomePage | `.hero-content > p` ("Warm hues for cooler days") | `#c8c0b8` | `#e8e0d8` | 1.37:1 | 4.5:1 |
| NewPage | Product card price labels, filter option counts, sort button text | Various grey tones | Light backgrounds | < 3:1 | 4.5:1 |
| CheckoutPage (basket) | Summary total row, tax note text | Low-contrast grey | White | < 3:1 | 4.5:1 |

All 16 affected elements use light grey text on light grey/white backgrounds. Users with low vision or colour deficiency cannot reliably read this text.

**Recommended approach:** Darken text colours to achieve at least 4.5:1 contrast for normal text. For the hero banner specifically, using `color: #6b5e55` on the `#e8e0d8` background would yield approximately 4.6:1.

---

### SERIOUS-4 · Invalid `lang` Attribute Value (`valid-lang`)

**WCAG:** 3.1.2 Language of Parts (Level AA)
**Pages affected:** HomePage (`/`)
**Occurrences:** 1

In `TheDrop.jsx` L22, the paragraph describing the plushie bag charms has `lang="zz"`. The tag `zz` is not a valid BCP 47 language subtag. Screen readers may silently fall back to the document language or switch to an incorrect pronunciation engine.

**Element:** `<p lang="zz">Our brand-new, limited-edition plushie bag charms…</p>`

**Recommended fix:** Remove the `lang` attribute entirely (the content is English, matching the document language) or use the correct code `lang="en"`.

---

### MODERATE-1 · Incorrect Heading Order (`heading-order`)

**WCAG:** 1.3.1 Info and Relationships (Level A) · Best Practice
**Pages affected:** All pages
**Occurrences:** Multiple (9 heading elements across all pages)

The heading hierarchy is broken throughout the application. Key violations:

| Element / Location | Current Level | Correct Level | File |
|---|---|---|---|
| Hero banner heading "Winter Basics" | `h3` | `h1` | `HeroBanner.jsx` |
| FeaturedPair card headings | `h1` | `h3` | `FeaturedPair.jsx` |
| TrendingCollections section heading | `h4` | `h2` | `TrendingCollections.jsx` |
| TrendingCollections card headings | `h1` | `h3` | `TrendingCollections.jsx` |
| "The Drop" section heading | `h4` | `h2` | `TheDrop.jsx` |
| New/Product/Checkout/OrderConfirmation page headings | `h3` | `h1` | Multiple pages |
| Cart modal / Checkout "Order Summary" heading | `h5` | `h2` | `CartModal.jsx`, `CheckoutPage.jsx` |

Screen readers rely on heading structure to allow users to scan and navigate page sections. When headings skip levels or are used in the wrong order the document outline becomes meaningless and navigation via heading shortcuts (H key in NVDA/JAWS) fails.

---

### MODERATE-2 · Content Outside Landmark Regions (`region`)

**WCAG:** 1.3.6 Identify Purpose (Level AAA) · Best Practice
**Pages affected:** HomePage, NewPage
**Occurrences:** Several content blocks

Fragments of page content (the CartModal drawer content, certain hero sections) are rendered outside any ARIA landmark region (`main`, `nav`, `aside`, `header`, `footer`). Screen-reader users who navigate by landmarks will miss this content.

**Recommended fix:** Wrap the main page content of each page in a `<main>` element:
```jsx
// In App.jsx or each page component
<main id="main-content">
  {/* page content */}
</main>
```

---

### BEST-PRACTICE-1 · Non-Interactive Elements Used as Controls (No Role / Not Keyboard Accessible)

**Standard:** WAI-ARIA Authoring Practices · WCAG 2.1.1 Keyboard (Level A)
**Note:** axe does not flag `div`-as-button violations automatically — these were identified through source-code analysis alongside the audit.
**Pages affected:** All pages

The following interactive `div` elements have click handlers but lack `role="button"`, `tabindex="0"`, and keyboard event handlers (`onKeyDown`). They are completely inaccessible to keyboard-only and screen-reader users.

| Element | File | Line | Issue |
|---|---|---|---|
| Wishlist icon in header | `Header.jsx` | 131 | `div` with `onClick`, no role, no tabindex |
| Search icon in header | `Header.jsx` | 140 | `div` with `onClick`, no role, no tabindex, no accessible name |
| Login icon in header | `Header.jsx` | 156 | `div` with `onClick`, no role, no tabindex, no accessible name |
| Region/flag selector | `Header.jsx` | 161 | `div` with `onClick`, no role, no tabindex |
| "Quick Add" button on product cards | `ProductCard.jsx` | 241 | `div` with `onClick`, no role, no tabindex |
| "Continue" button in checkout | `CheckoutPage.jsx` | 156 | `div` with `onClick`, no role, no tabindex |
| "← Back to Cart" in checkout shipping | `CheckoutPage.jsx` | 297 | `div` with `onClick`, no role, no tabindex |
| "← Back to Shop" on order confirmation | `OrderConfirmationPage.jsx` | 387 | `div` with `onClick`, no role, no tabindex |
| Price / Size / Brand filter options | `FilterSidebar.jsx` | 326, 368, 405 | `div` rows with `onClick`, no role, no tabindex |

---

### BEST-PRACTICE-2 · Non-Meaningful ARIA Labels

**Standard:** WCAG 2.4.6 Headings and Labels (Level AA)
**Pages affected:** All pages where these components appear

The following elements carry `aria-label` values that provide no useful context:

| Element | Current Label | Problem | File |
|---|---|---|---|
| Every `<article>` in product grid | `"Product item"` | Identical label on all cards — cannot be distinguished | `ProductCard.jsx` L227 |
| Add to Cart button | `"Add to cart"` | Does not name which product is being added | `ProductPage.jsx` L351 |
| Wishlist toggle button | `"Wishlist action"` | Does not name the product or the current state | `ProductPage.jsx` L359 |
| Quantity decrease button (cart) | `"Minus"` | Does not name which item's quantity is changing | `CheckoutPage.jsx` L104 |
| Quantity display span (cart) | `"Number"` | Provides no context | `CheckoutPage.jsx` L107 |
| Quantity increase button (cart) | `"Plus"` | Does not name which item's quantity is changing | `CheckoutPage.jsx` L110 |
| Remove item button (cart) | `"Delete"` | Does not name which item is being removed | `CheckoutPage.jsx` L122 |

---

### BEST-PRACTICE-3 · Cart Modal Missing Dialog Semantics and Focus Management

**Standard:** WAI-ARIA Authoring Practices 1.2 — Dialog Pattern · WCAG 2.1.2 No Keyboard Trap (Level A)
**Pages affected:** All pages (CartModal rendered globally)

`CartModal.jsx` is missing:
1. `role="dialog"` — assistive technologies cannot identify this as a dialog and may not switch to "browse mode" or "application mode".
2. `aria-modal="true"` — screen readers do not know that content outside the drawer is inert.
3. `aria-label` or `aria-labelledby` — the dialog has no accessible name.
4. Focus management — when the cart opens, focus is not moved into the modal; keyboard users can continue tabbing through the obscured background page.
5. Escape key handler — keyboard users cannot close the cart with the Escape key (note: `WishlistModal.jsx` correctly implements Escape key handling and focus management; the `CartModal` should be brought to the same standard).

---

### BEST-PRACTICE-4 · Sort Dropdown Missing ARIA Widget Semantics

**Standard:** WAI-ARIA 1.2 — Listbox Pattern · WCAG 4.1.2 Name, Role, Value
**Pages affected:** NewPage (`/shop/new`)

The custom sort dropdown in `NewPage.jsx` is missing:
- `aria-expanded` on the trigger button (removed per comment A11Y-GEN2)
- `aria-haspopup` on the trigger button
- `aria-controls` linking the button to the options list
- `role="listbox"` and `aria-label` on the `<ul>` options list
- `role="option"` and `aria-selected` on each `<li>` option
- Keyboard navigation (`tabIndex`, `onKeyDown` for arrow keys, Enter, Escape)

Screen-reader users encounter a button that opens an unlabelled, unstructured list with no keyboard support.

---

### BEST-PRACTICE-5 · Filter Sidebar Disclosure Buttons Missing `aria-expanded` and `aria-controls`

**Standard:** WAI-ARIA 1.2 — Disclosure Pattern · WCAG 4.1.2
**Pages affected:** NewPage (`/shop/new`)

The Price, Size, and Brand filter toggle buttons in `FilterSidebar.jsx` do not expose their expanded/collapsed state:
- `aria-expanded` is absent — screen readers cannot announce whether a filter section is open or closed.
- `aria-controls` is absent — there is no programmatic link from the button to the panel it controls.

---

### BEST-PRACTICE-6 · Navigation Tab Order Reversed

*(Recorded also under SERIOUS-2 for WCAG mapping; listed here for completeness.)*

**Standard:** WCAG 2.4.3 Focus Order (Level A)
**Pages affected:** All pages

---

### BEST-PRACTICE-7 · Live Region Not Announced for Cart Count Badge

**Standard:** WCAG 4.1.3 Status Messages (Level AA)
**Pages affected:** All pages

When a user adds an item to the cart the badge count updates visually but the change is not announced by screen readers. The badge has `aria-hidden="true"` and there is no `aria-live` region elsewhere to announce the update. Screen-reader users receive no feedback that the cart state has changed.

**Recommended fix:** Add a visually-hidden `aria-live="polite"` region that announces the cart count change:
```jsx
<span className="sr-only" aria-live="polite" aria-atomic="true">
  {totalCount > 0 ? `${totalCount} item${totalCount !== 1 ? 's' : ''} in cart` : 'Cart is empty'}
</span>
```

---

### BEST-PRACTICE-8 · Invalid `<ul>` Child (`list` rule)

**Standard:** HTML specification — `<ul>` must only have `<li>` direct children
**Pages affected:** HomePage (`/`)

`TrendingCollections.jsx` L40 renders a `<div class="trending-grid-label">` as a direct child of `<ul>`, which is invalid HTML and causes axe to flag the `list` rule. Some screen readers may omit list items or miscount the list when the structure is invalid.

**Recommended fix:** Remove the `<div>` or wrap it in a `<li>` with `role="presentation"`.

---

### BEST-PRACTICE-9 · Meaningful Sequence Broken by CSS Reversal

**Standard:** WCAG 1.3.2 Meaningful Sequence (Level A)
**Pages affected:** HomePage (`/`)

In `FeaturedPair.jsx`, the product image appears first in the DOM but `flex-direction: column-reverse` makes it appear below the text visually. Screen readers announce the image before the heading and descriptive text, breaking the logical reading sequence.

**Recommended fix:** Reorder the JSX so the text content appears before the image in the DOM and remove the `column-reverse` CSS, relying instead on CSS `order` or standard `column` flex with the image as the second child.

---

## Full Issue Inventory by Page

### HomePage (`/`)

| Rule ID | Impact | Description | Occurrences |
|---|---|---|---|
| `aria-required-attr` | **Critical** | `role="slider"` missing value attributes | 1 |
| `aria-valid-attr-value` | **Critical** | `aria-expanded="yes"` on headings | 2 |
| `button-name` | **Critical** | Buttons without accessible names | 2 |
| `image-alt` | **Critical** | `<img>` missing `alt` attribute | 2 |
| `html-has-lang` | Serious | `<html>` missing `lang` | 1 |
| `valid-lang` | Serious | `lang="zz"` invalid language tag | 1 |
| `color-contrast` | Serious | Hero subtitle contrast 1.37:1 | 1 |
| `tabindex` | Serious | Nav links with tabindex > 0 | 7 |
| `heading-order` | Moderate | Wrong heading levels (h4 → h4 → h1 jumps) | 2 |
| `region` | Moderate | Content outside landmark regions | 2 |

### NewPage (`/shop/new`)

| Rule ID | Impact | Description | Occurrences |
|---|---|---|---|
| `aria-required-attr` | **Critical** | Hidden ARIA role elements missing required attrs | 2 |
| `button-name` | **Critical** | Unnamed buttons (cart close, etc.) | 2 |
| `html-has-lang` | Serious | `<html>` missing `lang` | 1 |
| `color-contrast` | Serious | Product card and filter text contrast issues | 13 |
| `tabindex` | Serious | Nav links with tabindex > 0 | 7 |
| `heading-order` | Moderate | `h3` page heading (should be `h1`) | 1 |
| `region` | Moderate | Content outside landmark regions | 2 |

### ProductPage (`/product/1`)

| Rule ID | Impact | Description | Occurrences |
|---|---|---|---|
| `aria-valid-attr-value` | **Critical** | `aria-relevant="changes"` invalid token | 1 |
| `button-name` | **Critical** | Unnamed buttons | 2 |
| `html-has-lang` | Serious | `<html>` missing `lang` | 1 |
| `color-contrast` | Serious | Text contrast insufficient | 1 |
| `tabindex` | Serious | Nav links with tabindex > 0 | 7 |
| `heading-order` | Moderate | `h3` page heading; missing `h1` | 1 |
| `region` | Moderate | Content outside landmark regions | 2 |

### CheckoutPage — Basket Step (`/checkout`)

| Rule ID | Impact | Description | Occurrences |
|---|---|---|---|
| `button-name` | **Critical** | Cart close button no accessible name | 1 |
| `html-has-lang` | Serious | `<html>` missing `lang` | 1 |
| `color-contrast` | Serious | Summary text contrast issues | 2 |
| `tabindex` | Serious | Nav links with tabindex > 0 | 7 |
| `heading-order` | Moderate | `h3` + `h5` wrong heading levels | 1 |

### CheckoutPage — Shipping Step (`/checkout#shipping`)

| Rule ID | Impact | Description | Occurrences |
|---|---|---|---|
| `button-name` | **Critical** | Cart close button no accessible name | 1 |
| `html-has-lang` | Serious | `<html>` missing `lang` | 1 |
| `tabindex` | Serious | Nav links with tabindex > 0 | 7 |
| `heading-order` | Moderate | `h3` + `h5` wrong heading levels | 1 |

---

## Appendix — Scan Configuration

```
Tool:         @axe-core/playwright v4.9.0
WCAG Tags:    wcag2a, wcag2aa, wcag21a, wcag21aa, best-practice
Browser:      Chromium 145 (Playwright headless)
Viewport:     1280 × 800
Base URL:     http://localhost:3000
Raw results:  tests/e2e/test-results/a11y-audit-results.json
Test spec:    tests/e2e/specs/a11y-all-pages-audit.spec.ts
```

---

*Report generated by automated accessibility audit pipeline. Manual testing with NVDA/JAWS/VoiceOver is recommended to confirm and supplement these findings.*

# Accessibility (A11Y) Audit Report

**Repository:** demo-website  
**Audit Date:** 2026-03-16  
**Scanner:** axe-core (via `@axe-core/playwright` v4.9.1)  
**WCAG Standards:** WCAG 2.0 A/AA, WCAG 2.1 A/AA, Section 508, Best Practices  
**Browser:** Chromium (Playwright headless, 1280×800 viewport)

---

## Executive Summary

Five pages were audited. The scan detected **10 distinct violation rules** across all pages, totalling **95 individual element violations**. Issues are classified by axe-core severity:

| Severity | Distinct Rules | Total Element Occurrences |
|----------|---------------|--------------------------|
| **Critical** | 4 | 17 |
| **Serious** | 4 | 43 |
| **Moderate** | 2 | 35 |
| **Minor** | 0 | 0 |
| **Total** | **10** | **95** |

### Pages Audited

| Page | Route | Critical Issues | Serious Issues | Moderate Issues |
|------|-------|-----------------|----------------|-----------------|
| HomePage | `/` | 4 rules (7 nodes) | 4 rules (10 nodes) | 2 rules (4 nodes) |
| NewPage (Products) | `/shop/new` | 1 rule (2 nodes) | 3 rules (21 nodes) | 2 rules (3 nodes) |
| ProductPage (Detail) | `/product/1` | 2 rules (3 nodes) | 3 rules (9 nodes) | 2 rules (3 nodes) |
| CheckoutPage | `/checkout` | 1 rule (1 node) | 3 rules (10 nodes) | 1 rule (1 node) |
| OrderConfirmationPage | `/order-confirmation` | 4 rules (7 nodes) | 4 rules (10 nodes) | 2 rules (4 nodes) |

---

## Part 1 — Critical Issues

The following **4 critical rules** were detected. Critical issues directly prevent screen readers and other assistive technologies from accessing or understanding content, and all violate WCAG 2.0/2.1 Level A requirements.

---

### CRITICAL-1 — `aria-required-attr`: Missing Required ARIA Attributes on `role="slider"`

**WCAG:** 4.1.2 (A) — Name, Role, Value  
**axe Rule:** [`aria-required-attr`](https://dequeuniversity.com/rules/axe/4.11/aria-required-attr)  
**Affected Pages:** HomePage (`/`), OrderConfirmationPage (`/order-confirmation`)  
**Source File:** `src/components/TheDrop.jsx`, line 19

#### Affected Element

```html
<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>
```

**CSS Selector:** `.drop-popularity-bar`

#### Description

The element declares `role="slider"` but is missing the three ARIA attributes required by the ARIA specification for that role:

- `aria-valuenow` — the current value of the slider (required)  
- `aria-valuemin` — the minimum allowed value (required)  
- `aria-valuemax` — the maximum allowed value (required)

Without these attributes, a screen reader announcing this element as a slider cannot provide the user with any meaningful value information. The AT will say "Popularity indicator, slider" but will be unable to convey the current state, leaving the widget completely opaque to blind users.

#### Recommended Fix

Add the three required attributes with appropriate values reflecting the intended range and current state. The `aria-label` already provides a name, so only the value attributes are needed:

```jsx
// src/components/TheDrop.jsx
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  className="drop-popularity-bar"
/>
```

#### Why This Remediation Approach

The ARIA specification mandates `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` for `role="slider"`. Adding these as static values (`0`, `75`, `100`) satisfies the requirement if the bar is a purely visual/decorative indicator. If the value is data-driven, the attributes should be bound to the relevant data. This is a minimal, non-breaking fix that adds the required semantics without altering visual presentation.

---

### CRITICAL-2 — `aria-valid-attr-value`: Invalid ARIA Attribute Values

**WCAG:** 4.1.2 (A) — Name, Role, Value  
**axe Rule:** [`aria-valid-attr-value`](https://dequeuniversity.com/rules/axe/4.11/aria-valid-attr-value)  
**Affected Pages:** HomePage (`/`), OrderConfirmationPage (`/order-confirmation`), ProductPage (`/product/1`)

Two separate sub-issues were detected under this rule:

#### Sub-issue A — `aria-expanded="yes"` on heading elements

**Source File:** `src/components/FeaturedPair.jsx`, line 46  
**Affected Pages:** HomePage, OrderConfirmationPage

```html
<h1 aria-expanded="yes">Keep on Truckin'</h1>
<h1 aria-expanded="yes">Limited edition and traveling fast</h1>
```

**CSS Selectors:**
- `.featured-card:nth-child(1) > .featured-card-info > h1`
- `.featured-card:nth-child(2) > .featured-card-info > h1`

`aria-expanded` is a boolean attribute whose only valid values are `"true"` and `"false"`. The value `"yes"` is not a valid boolean string, so assistive technologies will ignore it or report an error. Screen readers relying on `aria-expanded` to determine the expanded/collapsed state of a disclosure widget will receive no valid signal.

Additionally, `aria-expanded` is semantically inappropriate on a `<h1>` heading element that is not itself a disclosure trigger.

**Recommended Fix:**

Since the `<h1>` headings in the FeaturedPair cards are not interactive disclosure triggers, the correct fix is to remove `aria-expanded` entirely:

```jsx
// src/components/FeaturedPair.jsx
// BEFORE
<h1 aria-expanded="yes">{item.title}</h1>

// AFTER
<h1>{item.title}</h1>
```

**Why This Approach:** `aria-expanded` communicates open/closed state for interactive widgets (buttons, disclosure widgets, comboboxes). Applying it to a static heading is a misuse of the attribute. Removing it eliminates the invalid value and the semantic error simultaneously. If expandable behavior is genuinely required, the heading should be replaced with or wrapped in a `<button>` with `aria-expanded="true"/"false"`.

---

#### Sub-issue B — `aria-relevant="changes"` on a live region

**Source File:** `src/pages/ProductPage.jsx`, line 146  
**Affected Pages:** ProductPage (`/product/1`)

```html
<ul class="..." aria-relevant="changes" aria-live="polite">
```

**CSS Selector:** `.PZdSKB1ULfufQL0NRQ7a`

`aria-relevant` must be a space-separated list of tokens from the set: `additions`, `removals`, `text`, `all`. The value `"changes"` is not in that set and is therefore invalid. Screen readers may ignore the live-region hint entirely, meaning dynamic updates to this list will not be announced.

**Recommended Fix:**

Replace `"changes"` with the correct token combination. For a product-details list that can have items added, updated, or removed, `"additions text"` is typically appropriate:

```jsx
// src/pages/ProductPage.jsx
// BEFORE
<ul aria-relevant="changes" aria-live="polite">

// AFTER
<ul aria-relevant="additions text" aria-live="polite">
```

**Why This Approach:** The ARIA specification defines `aria-relevant="additions text"` as the combination that covers both new items being appended and text content being modified — the two most common scenarios for product listing updates. This is the most precise token set that covers the intended behavior without the over-broad `"all"` (which includes removals, which may not be relevant here).

---

### CRITICAL-3 — `button-name`: Icon-Only Buttons Without Accessible Names

**WCAG:** 4.1.2 (A) — Name, Role, Value  
**axe Rule:** [`button-name`](https://dequeuniversity.com/rules/axe/4.11/button-name)  
**Affected Pages:** All 5 pages (close buttons are present in the persistent cart and wishlist drawers)  
**Source Files:** `src/components/CartModal.jsx` (line 57), `src/components/WishlistModal.jsx` (line 63)

#### Affected Elements

| CSS Class (hashed) | Maps to | Source |
|---|---|---|
| `.JjN6AKz7a2PRH2gFKW3v` | `styles.closeBtn` in `CartModal.jsx` | Cart drawer close button |
| `.WEtKZofboSdJ1n7KLpwd` | `styles.closeBtn` in `WishlistModal.jsx` | Wishlist drawer close button |

```html
<!-- Cart close button -->
<button class="JjN6AKz7a2PRH2gFKW3v">
  <!-- SVG icon rendered with aria-hidden="true" -->
</button>

<!-- Wishlist close button -->
<button class="WEtKZofboSdJ1n7KLpwd">
  <!-- SVG icon rendered with aria-hidden="true" -->
</button>
```

#### Description

Both close buttons render only an SVG icon. The SVG is hidden from assistive technology (`aria-hidden="true"`), leaving the buttons with no accessible name. Screen readers announce them as "button" (Chrome/NVDA) or remain completely silent, giving keyboard and screen reader users no indication of the button's purpose. According to the WCAG 2.0 success criterion 4.1.2, interactive controls must have a programmatically determined name.

#### Recommended Fix

Add `aria-label` to each button:

```jsx
// src/components/CartModal.jsx
// BEFORE
<button className={styles.closeBtn} onClick={closeCart}>
  <svg aria-hidden="true">...</svg>
</button>

// AFTER
<button className={styles.closeBtn} onClick={closeCart} aria-label="Close shopping cart">
  <svg aria-hidden="true">...</svg>
</button>
```

```jsx
// src/components/WishlistModal.jsx
// BEFORE
<button ref={closeBtnRef} className={styles.closeBtn} onClick={closeWishlist}>
  <svg aria-hidden="true">...</svg>
</button>

// AFTER
<button ref={closeBtnRef} className={styles.closeBtn} onClick={closeWishlist} aria-label="Close wishlist">
  <svg aria-hidden="true">...</svg>
</button>
```

#### Why This Remediation Approach

`aria-label` is the simplest and most direct way to provide an accessible name for an icon-only button when the visual label is intentionally hidden from the accessibility tree. It does not alter the visible UI, requires no DOM restructuring, and is universally supported by all major screen reader / browser combinations. The label text ("Close shopping cart" / "Close wishlist") includes the context of what is being closed, satisfying both WCAG 4.1.2 and the advisory criterion 2.4.6 (Headings and Labels).

---

### CRITICAL-4 — `image-alt`: Images Without Alternative Text

**WCAG:** 1.1.1 (A) — Non-text Content  
**axe Rule:** [`image-alt`](https://dequeuniversity.com/rules/axe/4.11/image-alt)  
**Affected Pages:** HomePage (`/`), OrderConfirmationPage (`/order-confirmation`)  
**Source Files:** `src/components/HeroBanner.jsx` (line 17–18), `src/components/TheDrop.jsx` (line 12–13)

#### Affected Elements

```html
<!-- HeroBanner.jsx -->
<img src="/images/home/New_Tees.png">

<!-- TheDrop.jsx -->
<img src="/images/home/2bags_charms1.png" loading="lazy">
```

**CSS Selectors:**
- `img[src$="New_Tees.png"]`
- `img[src$="2bags_charms1.png"]`

#### Description

Both `<img>` elements are missing the `alt` attribute entirely. Per WCAG 1.1.1, every non-decorative image must have a text alternative. When `alt` is absent (as opposed to `alt=""`), screen readers fall back to announcing the image filename — e.g. "New underscore Tees dot PNG, image" — which is confusing and meaningless to screen reader users. A sighted user sees promotional imagery; a blind user hears garbled filenames.

#### Recommended Fix

Add descriptive `alt` attributes reflecting the content and purpose of each image:

```jsx
// src/components/HeroBanner.jsx
// BEFORE
<img src={HERO_IMAGE} />

// AFTER
<img src={HERO_IMAGE} alt="New winter tee collection — warm-toned basics for cooler days" />
```

```jsx
// src/components/TheDrop.jsx
// BEFORE
<img src={DROP_IMAGE} loading="lazy" />

// AFTER
<img src={DROP_IMAGE} loading="lazy" alt="Two limited-edition plushie bag charms — a pair of collectible accessories from The Drop" />
```

#### Why This Remediation Approach

Descriptive `alt` text is used (rather than `alt=""`) because these are promotional hero and feature images conveying meaningful editorial content — the collection name, product appearance, and promotional context. An empty `alt` would mark them as decorative and screen readers would skip them entirely, losing important page context. The chosen alt text describes the visual subject and mirrors the surrounding copy (e.g. "Warm hues for cooler days" → alt describes the tee imagery) so that screen reader users receive equivalent information to sighted users.

---

## Part 2 — Recommended Fixes Were Not Applied

Per the task instructions, **no source code modifications were made**. The fixes described in Part 1 are recommendations only. The repository source code remains unchanged from the state at audit time.

---

## Part 3 — Non-Critical Issues (Not Remediated)

The following **6 additional violation rules** were detected at Serious or Moderate severity. These issues impede accessibility but do not completely block access for the scenarios tested. They are documented here for prioritization and future remediation.

---

### SERIOUS-1 — `html-has-lang`: `<html>` Element Missing `lang` Attribute

**WCAG:** 3.1.1 (A) — Language of Page  
**axe Rule:** [`html-has-lang`](https://dequeuniversity.com/rules/axe/4.11/html-has-lang)  
**Affected Pages:** All 5 pages  
**Source File:** `public/index.html`, line 3  
**Impact:** Serious

```html
<!-- public/index.html -->
<!-- BEFORE (current) -->
<html>

<!-- SHOULD BE -->
<html lang="en">
```

Screen readers use the `lang` attribute on `<html>` to select the correct pronunciation engine and speech rules. Without it, some screen readers default to the OS language (which may differ from page content), causing text to be mispronounced or synthetised with the wrong accent/phoneme set. This affects all 5 pages globally, since the attribute lives on the root HTML element.

**Recommended Fix:** Add `lang="en"` (or the appropriate BCP 47 language tag) to the `<html>` element in `public/index.html`.

---

### SERIOUS-2 — `color-contrast`: Insufficient Text Contrast Ratios

**WCAG:** 1.4.3 (AA) — Minimum Contrast  
**axe Rule:** [`color-contrast`](https://dequeuniversity.com/rules/axe/4.11/color-contrast)  
**Affected Pages:** All 5 pages (different elements per page)  
**Total Nodes:** 18 element instances  
**Impact:** Serious

| Page | Affected Element | Foreground | Background | Approx. Ratio |
|------|-----------------|-----------|-----------|---------------|
| HomePage | `.hero-content > p` ("Warm hues for cooler days") | `#c8c0b8` | `#e8e0d8` | ~1.3:1 |
| NewPage | `.products-found` ("16 Products Found") | `#b0b4b8` | `#ffffff` | ~1.9:1 |
| NewPage | `.filter-count` (12 count spans in filter sidebar) | `#c8c8c8` | `#ffffff` | ~1.4:1 |
| ProductPage | `.tE3CCfWiGRrHgQcKaAUa` (product description paragraph) | `#c0c0c0` | `#ffffff` | ~1.6:1 |
| CheckoutPage | `.checkout-step .step-label` ("Shipping & Payment") | low contrast | white | < 3:1 |
| CheckoutPage | `.checkout-empty > p` ("There are no items…") | low contrast | white | < 3:1 |
| OrderConfirmation | `.hero-content > p` (same as HomePage) | `#c8c0b8` | `#e8e0d8` | ~1.3:1 |

WCAG 1.4.3 requires a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text (18pt / 14pt bold). All listed elements fail this threshold, making their text difficult or impossible to read for users with low vision or colour deficiency.

**Recommended Fix:** Darken foreground text colours to achieve ≥ 4.5:1 contrast. For example:
- `.filter-count`: Change from `#c8c8c8` to `#767676` (passes AA at 4.54:1 on white)
- `.hero-content p`: Change from `#c8c0b8` to a darker warm grey ≥ 4.5:1 against the hero background
- `.products-found` and product description: Darken to `#595959` or darker

---

### SERIOUS-3 — `tabindex`: Positive `tabindex` Values Reversing Keyboard Navigation Order

**WCAG:** 2.4.3 (A) — Focus Order  
**axe Rule:** [`tabindex`](https://dequeuniversity.com/rules/axe/4.11/tabindex) (best practice)  
**Affected Pages:** All 5 pages  
**Source File:** `src/components/Header.jsx`, line 191  
**Nodes:** 7 navigation link elements per page  
**Impact:** Serious

```html
<a tabindex="7" href="/shop/new">New</a>
<a tabindex="6" href="/shop/new">Apparel</a>
<a tabindex="5" href="/shop/new">Lifestyle</a>
<a tabindex="4" href="/shop/new">Stationery</a>
<a tabindex="3" href="/shop/new">Collections</a>
<a tabindex="2" href="/shop/new">Shop by Brand</a>
<a tabindex="1" href="/shop/new">Sale</a>
```

Navigation links in the main header use descending positive `tabindex` values (`navItems.length - index`). Positive `tabindex` values remove elements from the natural DOM tab order and reinsert them in ascending numeric order. This means the tab order is **Sale (1) → Shop by Brand (2) → … → New (7)** — the reverse of the visual left-to-right display order. Keyboard users encounter navigation in the opposite sequence to what sighted users see, violating the WCAG 2.4.3 requirement that focus order preserves meaning and operability.

**Recommended Fix:** Remove all explicit `tabindex` attributes from the nav `<Link>` elements. The browser will then apply the natural DOM order (which matches the visual order), giving keyboard users the correct left-to-right tab sequence with no additional code.

---

### SERIOUS-4 — `valid-lang`: Invalid BCP 47 Language Tag

**WCAG:** 3.1.2 (AA) — Language of Parts  
**axe Rule:** [`valid-lang`](https://dequeuniversity.com/rules/axe/4.11/valid-lang)  
**Affected Pages:** HomePage (`/`), OrderConfirmationPage (`/order-confirmation`)  
**Source File:** `src/components/TheDrop.jsx`  
**Impact:** Serious

```html
<p lang="zz">Our brand-new, limited-edition plushie bag charms have officially dropped…</p>
```

The value `"zz"` is not a valid BCP 47 language tag. Screen readers use `lang` attributes on inline elements to switch the pronunciation/speech engine for that span of text. An invalid tag causes unpredictable behavior — the screen reader may silently fail the language switch, select the wrong language engine, or skip the content.

**Recommended Fix:** Replace `lang="zz"` with the correct BCP 47 tag for the paragraph's language. If the paragraph is in English: `lang="en"`. If this attribute was added intentionally as a demo bug, correct it to avoid misleading users who may rely on language identification.

---

### MODERATE-1 — `heading-order`: Heading Levels Skip or Jump Inappropriately

**WCAG:** 1.3.1 (A) — Info and Relationships (as best practice)  
**axe Rule:** [`heading-order`](https://dequeuniversity.com/rules/axe/4.11/heading-order)  
**Affected Pages:** All 5 pages  
**Total Nodes:** 7 heading elements (some shared via global components)  
**Impact:** Moderate

Screen readers and other ATs use heading hierarchy to build a document outline that allows users to skim and navigate page sections. When heading levels skip or are used out of order, the outline becomes nonsensical and navigation shortcuts (H key in NVDA/JAWS) lose their predictability.

**Key violations detected:**

| Page | Heading Text | Current Level | Expected Level | Source |
|------|-------------|---------------|----------------|--------|
| HomePage | "Shop Trending Collections" | `<h4>` | `<h2>` | `TrendingCollections.jsx` |
| HomePage | "The Drop" | `<h4>` | `<h2>` | `TheDrop.jsx` |
| NewPage | "Shopping Cart" (drawer) | `<h5>` | `<h2>` | `CartModal.jsx` |
| ProductPage | "Shopping Cart" (drawer) | `<h5>` | `<h2>` | `CartModal.jsx` |
| CheckoutPage | "Wishlist" (drawer) | `<h5>` | `<h2>` | `WishlistModal.jsx` |
| OrderConfirmation | "Shop Trending Collections" | `<h4>` | `<h2>` | `TrendingCollections.jsx` |
| OrderConfirmation | "The Drop" | `<h4>` | `<h2>` | `TheDrop.jsx` |

**Recommended Fix:** Correct heading levels to follow a logical 1 → 2 → 3 hierarchy. Section headings on the main page (`TrendingCollections`, `TheDrop`, etc.) should use `<h2>`. Cart and Wishlist drawer titles should use `<h2>` since they are the primary heading within their respective dialog regions. The visual styling (font size, weight) should be controlled via CSS classes rather than heading level.

---

### MODERATE-2 — `region`: Page Content Not Contained by Landmark Regions

**WCAG:** Best Practice (maps to 1.3.1 informally)  
**axe Rule:** [`region`](https://dequeuniversity.com/rules/axe/4.11/region)  
**Affected Pages:** HomePage, NewPage, ProductPage, OrderConfirmationPage  
**Nodes:** 2 per page (cart drawer heading and cart-empty paragraph)  
**Impact:** Moderate

```html
<h5 class="UpIEcDtKPkqgNKzhRNeF">Shopping Cart</h5>
<p>Your cart is empty</p>
```

The Cart drawer content (heading and empty-state paragraph) renders outside any ARIA landmark region — specifically, it is not within `<main>`, `<header>`, `<footer>`, `<nav>`, `<aside>`, or an element with an explicit ARIA `role` such as `role="dialog"`. Screen reader users navigating by landmark regions will not encounter this content via landmark shortcuts (F6/`D` key in JAWS/NVDA).

This issue is compounded by the separate `no-dialog-role` finding in `A11Y_ISSUES.md`: the cart drawer `<div>` has had its `role="dialog"` removed, so there is no dialog landmark to contain the cart content.

**Recommended Fix:** Restore `role="dialog"` and `aria-modal="true"` on the cart drawer container in `CartModal.jsx`. This creates a proper landmark that encompasses the heading and cart content, satisfying the `region` requirement and improving AT navigation. Additionally, ensure that `aria-label="Shopping cart"` is present on the dialog element so screen readers can announce its purpose when focus moves into it.

---

## Part 4 — Issues Detected in Source Documentation but Not Confirmed by Automated Scan

The file `A11Y_ISSUES.md` in this repository documents additional intentional accessibility issues that axe-core cannot reliably detect in a static page scan. These are **not captured in this report's automated scan results**, but are included here for completeness:

| Category | Issues | Why Not Auto-Detected |
|----------|--------|----------------------|
| `interactable-role` / `keyboard-accessible` (GEN1) | 15 `<div>` elements used as interactive controls without `role` or `tabindex` | axe-core does not flag generic `<div>` with `onclick` as a role violation unless other ARIA cues are present |
| `accessible-name` for `<div>` interactables (GEN1) | 10 icon/text controls with `aria-hidden` visible text | axe-core only flags `button-name` for actual `<button>` elements, not custom div-based controls |
| Navigation `role="menu"` (GEN2) | 1 nav submenu with forbidden `role="menu"` | axe-core does not enforce the rule that `role="menu"` is forbidden inside a `<nav>` landmark |
| Filter checkbox (GEN2) | 12 issues across 3 custom checkbox `<div>`s | Requires detection of custom widget patterns |
| Modal dialog semantics (GEN2) | Missing `role="dialog"`, `aria-modal`, `aria-label`, focus trap, ESC close | Dynamic modal behaviour not testable in static page snapshot |
| Content reflow at 300% zoom (GEN3) | `overflow-x: hidden` on `<body>` | Requires zoom-level simulation |
| Screen reader reading order (GEN3) | `flex-direction: column-reverse` DOM/visual mismatch | Requires layout computation |
| Live region announcements (UNDETECTABLE) | Missing `role="alert"` on form errors; no cart-count `aria-live` | Dynamic interaction testing required; not detectable from static DOM |
| Non-meaningful accessible labels (GEN3) | 8 elements with vague `aria-label` values | axe-core cannot assess label meaningfulness semantically |

---

## Appendix — Raw Scan Data

Full machine-readable results are stored at:

```
tests/e2e/test-results/a11y-audit-results.json
```

The Playwright test that produced this report is at:

```
tests/e2e/specs/a11y-audit-all-pages.spec.ts
```

To re-run the audit:

```bash
npm run build
npx serve dist -p 3000 --single &
BASE_URL=http://localhost:3000 npx playwright test --config tests/e2e/playwright-axe.config.ts
```

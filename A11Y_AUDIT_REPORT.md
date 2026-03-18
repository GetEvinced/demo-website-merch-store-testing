# Accessibility (A11Y) Audit Report

**Repository:** demo-website (React SPA — Webpack 5, React 18, React Router v7)  
**Audit Date:** 2026-03-18  
**Audit Tool:** Evinced JS Playwright SDK v2.17.0  
**Branch:** cursor/repository-accessibility-audit-e882  
**Auditor:** Automated Cloud Agent

---

## Executive Summary

| Metric | Value |
|---|---|
| Pages Audited | 6 |
| Total Issues Found | 185 |
| Critical Issues | 159 |
| Serious Issues | 26 |
| Critical Issue Types | 7 |
| Serious Issue Types | 3 |

The site has **pervasive keyboard-accessibility and semantic-role failures** that affect every page. The most prevalent root causes are interactive `<div>` elements used in place of native HTML controls, and missing accessible names on icon-only buttons. These failures make the site largely unusable for keyboard-only users and screen-reader users.

---

## Pages Audited

| Page | Route | Issue Count | Critical | Serious |
|---|---|---|---|---|
| Homepage | `/` | 35 | 32 | 3 |
| New Products | `/shop/new` | 55 | 41 | 14 |
| Product Detail | `/product/1` | 20 | 18 | 2 |
| Checkout — Basket | `/checkout` (step 1) | 21 | 18 | 3 |
| Checkout — Shipping | `/checkout` (step 2) | 19 | 18 | 1 |
| Order Confirmation | `/order-confirmation` | 35 | 32 | 3 |
| **TOTAL** | | **185** | **159** | **26** |

---

## Part I — Critical Issues

Critical issues completely block access for users relying on assistive technology (screen readers, keyboard navigation, switch access). There are **159 critical issue instances** across **7 distinct issue types**.

---

### CI-1 · NOT_FOCUSABLE — Interactive `<div>` elements not reachable by keyboard

**Evinced type:** `NOT_FOCUSABLE` ("Keyboard accessible")  
**WCAG:** 2.1.1 Keyboard (Level A)  
**Total occurrences:** 58 (present on all 6 pages)

#### Description

Multiple interactive elements that respond to mouse clicks are implemented as `<div>` elements (and one as a `<span>`). Because they are not natively focusable and have no `tabindex` attribute, keyboard users cannot reach them using the Tab key, and switch-access / voice-navigation users cannot activate them.

#### Affected Elements and Pages

| Element | Selector | Source File | Present on Pages |
|---|---|---|---|
| Wishlist launcher button | `.wishlist-btn` | `src/components/Header.jsx:131` | All 6 |
| Search launcher (icon-only) | `.icon-btn:nth-child(2)` | `src/components/Header.jsx:140` | All 6 |
| Login launcher (icon-only) | `.icon-btn:nth-child(4)` | `src/components/Header.jsx:156` | All 6 |
| Country/region flag selector | `.flag-group` | `src/components/Header.jsx:161` | All 6 |
| Product card "Quick Add" | `.product-card-quick-add` | `src/components/ProductCard.jsx:21` | New Products, Product Detail |
| Wishlist item "Remove" button | `.removeBtn` (in WishlistModal) | `src/components/WishlistModal.jsx:126` | All 6 (modal) |
| Popular section "Shop X" link | `.shop-link` | `src/components/PopularSection.jsx:57` | Homepage, Order Confirmation |
| Footer nav items | `.footer-nav-item` | `src/components/Footer.jsx` | All 6 |
| Cart modal "Continue Shopping" | `.continueBtn` | `src/components/CartModal.jsx:95` | All 6 (modal) |

**Representative DOM snippet (wishlist launcher):**
```html
<div class="icon-btn wishlist-btn" style="cursor: pointer;">
  <svg aria-hidden="true">...</svg>
  <span>Wishlist</span>
</div>
```

#### Recommended Fix

Replace each interactive `<div>` (or `<span>`) with the semantically correct native HTML element:

- Interactive controls that trigger an action → `<button type="button">`
- Controls that navigate to another URL → `<a href="...">`

**Example — Wishlist launcher:**
```jsx
// Before
<div className="icon-btn wishlist-btn" onClick={openWishlist} style={{cursor:'pointer'}}>

// After
<button type="button" className="icon-btn wishlist-btn" onClick={openWishlist} aria-label="Open wishlist">
```

**Example — "Quick Add" on ProductCard:**
```jsx
// Before
<div className="product-card-quick-add" onClick={() => {}} style={{cursor:'pointer'}}>
  + Quick Add
</div>

// After
<button type="button" className="product-card-quick-add" onClick={...}>
  + Quick Add
</button>
```

#### Why This Approach

Native HTML `<button>` and `<a>` elements have built-in keyboard support (Tab focus, Enter/Space activation), correct ARIA roles, and are correctly announced by all screen readers without any additional ARIA. Using `tabindex="0"` + `role="button"` on a `<div>` would technically satisfy focusability but would require manually wiring keyboard event handlers and replicating behaviour that browsers provide for free with native elements. The native-element approach is the lowest-risk and most cross-browser-compatible fix.

---

### CI-2 · WRONG_SEMANTIC_ROLE — Interactive elements lack correct ARIA/HTML role

**Evinced type:** `WRONG_SEMANTIC_ROLE` ("Interactable role")  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Total occurrences:** 56 (present on all 6 pages)

#### Description

The same `<div>` elements listed in CI-1 are also reported under this separate rule because, in addition to not being focusable, they expose no semantic role to the accessibility tree. Screen readers therefore cannot identify them as buttons or links; users who navigate by role (e.g., "show me all buttons") will miss them entirely.

#### Affected Elements and Pages

Identical element set to CI-1 (same root cause — `<div>` used instead of `<button>`/`<a>`).

#### Recommended Fix

The fix is the same as CI-1: replace `<div>`/`<span>` interactive elements with `<button>` or `<a>`. Native elements automatically expose the correct implicit ARIA role (`button` or `link`) without any extra markup.

If a `<div>` must be kept for layout reasons, add `role="button"` (or `role="link"`) together with `tabindex="0"` and keyboard event handlers — but this is only a fallback when refactoring to a native element is truly not feasible.

#### Why This Approach

Fixing CI-1 and CI-2 with the same change (native element replacement) is deliberate. Separating them into two fixes would be redundant and error-prone. A single element refactor addresses both the focusability deficiency (CI-1) and the missing semantic role (CI-2) simultaneously.

---

### CI-3 · NO_DESCRIPTIVE_TEXT — Accessible name hidden from assistive technology

**Evinced type:** `NO_DESCRIPTIVE_TEXT` ("Accessible name")  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Total occurrences:** 24 (present on all 6 pages)

#### Description

Several interactive elements carry visible text labels but those labels are wrapped in `aria-hidden="true"`, so they are invisible to assistive technology. Screen readers have no name to announce for these controls.

#### Affected Elements and Pages

| Element | Selector | Source File | Present on Pages |
|---|---|---|---|
| Header Search button text | `.icon-btn:nth-child(2)` — `<span aria-hidden="true">Search</span>` | `Header.jsx:142` | All 6 |
| Header Login button text | `.icon-btn:nth-child(4)` — `<span aria-hidden="true">Login</span>` | `Header.jsx:158` | All 6 |
| PopularSection "Shop X" link | `.shop-link` — `<span aria-hidden="true">Shop Drinkware</span>` etc. | `PopularSection.jsx:59` | Homepage, Order Confirmation |
| Footer nav items | `.footer-nav-item` — `<span aria-hidden="true">FAQs</span>` etc. | `Footer.jsx` | All 6 |

**Representative DOM snippet:**
```html
<!-- Search icon-button: text is hidden from AT -->
<div class="icon-btn" style="cursor: pointer;">
  <svg aria-hidden="true">...</svg>
  <span aria-hidden="true">Search</span>
</div>
```

#### Recommended Fix

Two complementary changes are needed:

1. **Remove `aria-hidden="true"` from visible text labels** so the text is part of the accessible name computation.  
2. **Fix the parent element's role** (CI-1/CI-2 fix) so the accessible name is actually associated with a meaningful interactive element.

For icon-only controls (where there is no visible text), supply an explicit `aria-label` on the button:

```jsx
// After (Search button — no visible text scenario)
<button type="button" className="icon-btn" aria-label="Search">
  <svg aria-hidden="true">...</svg>
</button>

// After (PopularSection "Shop" link — visible text kept accessible)
<a href="/shop/new" className="shop-link">
  Shop Drinkware   {/* no aria-hidden wrapper */}
</a>
```

#### Why This Approach

Removing `aria-hidden` from visible text is the minimal-change fix that immediately restores the accessible name. Using `aria-label` on the button is preferred for icon-only controls because it provides a concise, purpose-specific name. Keeping visible text labels without `aria-hidden` is preferred for text-based links/buttons because the visible name and the accessible name then match, satisfying WCAG 2.5.3 Label in Name.

---

### CI-4 · AXE-BUTTON-NAME — Icon-only `<button>` elements have no accessible name

**Evinced type:** `AXE-BUTTON-NAME` ("Button-name")  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Total occurrences:** 10 (present on all 6 pages)

#### Description

The close buttons inside the Cart Modal (`CartModal.jsx`) and the Wishlist Modal (`WishlistModal.jsx`) are native `<button>` elements (good), but they contain only an SVG icon with `aria-hidden="true"` and no text or `aria-label`. Screen readers have no name to announce — users hear only "button" with no context about what the button does.

#### Affected Elements and Pages

| Element | Selector | Source File | Present on Pages |
|---|---|---|---|
| Cart Modal close button | `#cart-modal > div:nth-child(1) > button` | `CartModal.jsx:55` | All 6 (via persistent header) |
| Wishlist Modal close button | `div[role="dialog"] > div:nth-child(1) > button` | `WishlistModal.jsx:59` | All 6 (via persistent header) |

**DOM snippet:**
```html
<button class="JjN6AKz7a2PRH2gFKW3v">
  <svg width="20" height="20" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
</button>
```

#### Recommended Fix

Add `aria-label="Close cart"` (or `"Close wishlist"`) to each close button:

```jsx
// CartModal.jsx — close button
<button
  className={styles.closeBtn}
  onClick={closeCart}
  aria-label="Close cart"
>

// WishlistModal.jsx — close button
<button
  ref={closeBtnRef}
  className={styles.closeBtn}
  onClick={closeWishlist}
  aria-label="Close wishlist"
>
```

#### Why This Approach

An `aria-label` on the `<button>` is the simplest and most reliable mechanism. It overrides the computed name and provides a clear, concise description without adding any visible DOM text. Adding visually-hidden text (e.g., a `<span className="sr-only">`) is an equally valid alternative, but `aria-label` requires no extra CSS class or element.

---

### CI-5 · AXE-ARIA-VALID-ATTR-VALUE — Invalid ARIA attribute values

**Evinced type:** `AXE-ARIA-VALID-ATTR-VALUE` ("Aria-valid-attr-value")  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Total occurrences:** 5 (Homepage ×2, Product Detail ×1, Order Confirmation ×2)

#### Description

Two distinct invalid ARIA attribute values are present:

**A) `aria-expanded="yes"` on heading elements (FeaturedPair component)**  
`aria-expanded` is a state attribute that accepts only the boolean string values `"true"` or `"false"`. The value `"yes"` is not a valid token and is ignored by assistive technology. Additionally, `aria-expanded` is semantically inappropriate on a `<h1>` heading element (it applies to disclosure widgets).

**B) `aria-relevant="changes"` on a live region list (ProductPage)**  
`aria-relevant` accepts a space-separated list of tokens from the set: `additions`, `removals`, `text`, `all`. The token `"changes"` does not exist in the specification and is silently ignored.

#### Affected Elements and Pages

| Element | Attribute | Source File | Present on Pages |
|---|---|---|---|
| `<h1>Keep on Truckin'</h1>` | `aria-expanded="yes"` | `FeaturedPair.jsx:44` | Homepage, Order Confirmation |
| `<h1>Limited edition...</h1>` | `aria-expanded="yes"` | `FeaturedPair.jsx:44` | Homepage, Order Confirmation |
| `<ul aria-relevant="changes">` | `aria-relevant="changes"` | `ProductPage.jsx:146` | Product Detail |

**DOM snippets:**
```html
<!-- FeaturedPair.jsx -->
<h1 aria-expanded="yes">Keep on Truckin'</h1>

<!-- ProductPage.jsx -->
<ul aria-relevant="changes" aria-live="polite">...</ul>
```

#### Recommended Fix

**A) FeaturedPair — `aria-expanded`:**  
Remove `aria-expanded` entirely from the `<h1>` elements. These headings are static content, not disclosure widgets. If an expand/collapse behaviour is ever needed, it should be on the controlling trigger element (e.g., a `<button>`), not on the heading.

```jsx
// Before
<h1 aria-expanded="yes">{item.title}</h1>

// After
<h1>{item.title}</h1>
```

**B) ProductPage — `aria-relevant`:**  
Replace `"changes"` with a valid token. For a live region that announces new additions (e.g., stock-level updates), use `"additions text"`:

```jsx
// Before
aria-relevant="changes"

// After
aria-relevant="additions text"
```

#### Why This Approach

Removing an invalid attribute is the most conservative change — it eliminates the spec violation without introducing new behaviour. For `aria-relevant`, choosing `"additions text"` matches the apparent intent (announcing when content is added or updated) and is the default value browsers use when `aria-relevant` is omitted, so it is risk-free.

---

### CI-6 · AXE-IMAGE-ALT — Images missing `alt` attributes

**Evinced type:** `AXE-IMAGE-ALT` ("Image-alt")  
**WCAG:** 1.1.1 Non-text Content (Level A)  
**Total occurrences:** 4 (Homepage ×2, Order Confirmation ×2)

#### Description

Two `<img>` elements are rendered without an `alt` attribute. Screen readers fall back to reading the image file path/name, which is meaningless to users. Both images are meaningful content (hero banner image and product drop image).

#### Affected Elements and Pages

| Element | Selector | Source File | Present on Pages |
|---|---|---|---|
| Hero banner image (`New_Tees.png`) | `img[src$="New_Tees.png"]` | `HeroBanner.jsx:17` | Homepage, Order Confirmation |
| The Drop section image (`2bags_charms1.png`) | `img[src$="2bags_charms1.png"]` | `TheDrop.jsx:10` | Homepage, Order Confirmation |

**DOM snippets:**
```html
<!-- HeroBanner.jsx -->
<img src="/images/home/New_Tees.png">

<!-- TheDrop.jsx -->
<img src="/images/home/2bags_charms1.png" loading="lazy">
```

#### Recommended Fix

Add a descriptive `alt` attribute to each image that conveys its content and function in context:

```jsx
// HeroBanner.jsx — hero image for "Winter Basics" promotion
<img src={HERO_IMAGE} alt="Model wearing winter basics collection — warm-toned T-shirts" />

// TheDrop.jsx — product drop section image
<img src={DROP_IMAGE} loading="lazy" alt="Limited edition Android, YouTube, and Super G plushie bag charms" />
```

#### Why This Approach

Images that convey meaningful content about the promotion or product require descriptive `alt` text so screen-reader users get equivalent information. The alternative — `alt=""` (empty) — is only appropriate for purely decorative images. Both images here are integral to understanding the product/promotion being presented, so meaningful descriptions are required by WCAG 1.1.1.

---

### CI-7 · AXE-ARIA-REQUIRED-ATTR — `role="slider"` missing required ARIA attributes

**Evinced type:** `AXE-ARIA-REQUIRED-ATTR` ("Aria-required-attr")  
**WCAG:** 4.1.2 Name, Role, Value (Level A)  
**Total occurrences:** 2 (Homepage ×1, Order Confirmation ×1)

#### Description

In `TheDrop.jsx`, a `<div>` is given `role="slider"` to represent a popularity indicator. The WAI-ARIA specification mandates that the `slider` role includes three required attributes: `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. Without these, assistive technology cannot compute or announce the current state of the slider, making it completely opaque to screen-reader users.

#### Affected Elements and Pages

| Element | Selector | Source File | Present on Pages |
|---|---|---|---|
| Popularity indicator | `.drop-popularity-bar` | `TheDrop.jsx:17` | Homepage, Order Confirmation |

**DOM snippet:**
```html
<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>
```

#### Recommended Fix

**Option A (recommended if the element is purely decorative):** Remove `role="slider"` and make the element purely presentational. Add `aria-hidden="true"` to exclude it from the accessibility tree:

```jsx
<div aria-hidden="true" className="drop-popularity-bar"></div>
```

**Option B (if the slider is meant to communicate a value):** Provide all three required attributes with the actual value and range:

```jsx
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={75}
  aria-valuemin={0}
  aria-valuemax={100}
  className="drop-popularity-bar"
/>
```

#### Why This Approach

If the bar is a read-only visual indicator (not user-interactive), Option A is strongly preferred — a `<div>` with `aria-hidden` adds zero noise for AT users while preserving the visual design. Option B is only appropriate if the element genuinely represents a range value that users should know about. Using `role="slider"` on a non-interactive element is a semantic mismatch, since `slider` implies a user-controllable widget; if retained, all required attributes must be present to satisfy WCAG 4.1.2.

---

## Part II — Critical Issues by Page (Cross-Reference Matrix)

| Issue Type | Homepage | New Products | Product Detail | Checkout Basket | Checkout Shipping | Order Confirmation |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| CI-1 NOT_FOCUSABLE | 10 | 18 | 6 | 7 | 7 | 10 |
| CI-2 WRONG_SEMANTIC_ROLE | 10 | 18 | 6 | 7 | 7 | 10 |
| CI-3 NO_DESCRIPTIVE_TEXT | 6 | 3 | 3 | 3 | 3 | 6 |
| CI-4 AXE-BUTTON-NAME | 2 | 2 | 2 | 1 | 1 | 2 |
| CI-5 AXE-ARIA-VALID-ATTR-VALUE | 2 | 0 | 1 | 0 | 0 | 2 |
| CI-6 AXE-IMAGE-ALT | 2 | 0 | 0 | 0 | 0 | 2 |
| CI-7 AXE-ARIA-REQUIRED-ATTR | 1 | 0 | 0 | 0 | 0 | 1 |
| **Page critical total** | **32** | **41** | **18** | **18** | **18** | **32** |

> New Products page has a higher count for CI-1 and CI-2 because it renders many `ProductCard` components, each of which contains a non-focusable "Quick Add" `<div>`.

---

## Part III — Source Files Requiring Changes (Critical Issues Only)

| Source File | Critical Issue Types Present |
|---|---|
| `src/components/Header.jsx` | CI-1, CI-2, CI-3 |
| `src/components/CartModal.jsx` | CI-1, CI-2, CI-3, CI-4 |
| `src/components/WishlistModal.jsx` | CI-1, CI-2, CI-4 |
| `src/components/ProductCard.jsx` | CI-1, CI-2 |
| `src/components/PopularSection.jsx` | CI-1, CI-2, CI-3 |
| `src/components/Footer.jsx` | CI-1, CI-2, CI-3 |
| `src/components/FeaturedPair.jsx` | CI-5 |
| `src/components/HeroBanner.jsx` | CI-6 |
| `src/components/TheDrop.jsx` | CI-6, CI-7 |
| `src/pages/ProductPage.jsx` | CI-5 |

---

## Part IV — Non-Critical (Serious) Issues — Not Remediated

The following 26 issues are classified as **Serious** (one level below Critical). They do not completely block access but significantly degrade the experience for users of assistive technology. They are documented here for tracking and future remediation.

---

### SI-1 · AXE-COLOR-CONTRAST — Insufficient text/background contrast ratio

**Evinced type:** `AXE-COLOR-CONTRAST` ("Color-contrast")  
**WCAG:** 1.4.3 Contrast (Minimum) — Level AA  
**Total occurrences:** 18 (Homepage ×3, New Products ×11, Product Detail ×1, Checkout Basket ×2, Order Confirmation ×1)  
**Status:** Not remediated

#### Description

Text elements do not meet the WCAG AA minimum contrast ratio of 4.5:1 for normal text (3:1 for large text). Affected users include those with low vision, colour-vision deficiencies, and users in bright ambient environments.

#### Affected Elements

| Element | Selector | Present on Pages |
|---|---|---|
| Hero banner sub-text "Warm hues for cooler days" | `.hero-content > p` | Homepage |
| Filter count labels `(8)`, `(4)` etc. | `.filter-count` | New Products |
| Product description text | Various `.product-description` selectors | New Products, Product Detail |
| Checkout form field labels | Various `.checkout-label` selectors | Checkout Basket |
| Featured section sub-labels | `.popular-section p` | Homepage, Order Confirmation |

#### Recommended Fix (not applied)

Increase the foreground colour of each failing text element to meet a 4.5:1 contrast ratio against its background. Tools such as the [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) can identify passing colour values. Typically this means darkening the grey text used for secondary labels:

- Hero sub-text: change from `#888` to `#595959` (passes at 7:1 on white)
- Filter counts: change from `#aaa` to `#767676` (minimum passing grey on white)
- Checkout labels: review and darken any `color: #999` or lighter values

---

### SI-2 · AXE-HTML-HAS-LANG — `<html>` element missing `lang` attribute

**Evinced type:** `AXE-HTML-HAS-LANG` ("Html-has-lang")  
**WCAG:** 3.1.1 Language of Page — Level A  
**Total occurrences:** 6 (all 6 pages — same root cause)  
**Status:** Not remediated

#### Description

The root `<html>` element in `public/index.html` has no `lang` attribute. Screen readers use this attribute to select the correct speech synthesis language and pronunciation rules. Without it, content may be read in the system default language, which can be incorrect for non-English-speaking users.

#### Affected Element

```html
<!-- public/index.html (current) -->
<html>

<!-- Required -->
<html lang="en">
```

**Source file:** `public/index.html:3`

#### Recommended Fix (not applied)

Add `lang="en"` (or the appropriate BCP 47 language tag) to the `<html>` element:

```html
<html lang="en">
```

This single one-line change in `public/index.html` resolves all 6 instances simultaneously.

---

### SI-3 · AXE-VALID-LANG — `lang` attribute contains invalid language tag

**Evinced type:** `AXE-VALID-LANG` ("Valid-lang")  
**WCAG:** 3.1.2 Language of Parts — Level AA  
**Total occurrences:** 2 (Homepage ×1, Order Confirmation ×1)  
**Status:** Not remediated

#### Description

In `TheDrop.jsx`, a `<p>` element has `lang="zz"`. The value `"zz"` is not a valid [BCP 47](https://www.rfc-editor.org/rfc/bcp/bcp47.txt) language tag. Screen readers rely on this attribute to switch speech synthesis to the correct language engine. An invalid tag causes unpredictable behaviour.

#### Affected Element

```html
<p lang="zz">Our brand-new, limited-edition plushie bag charms...</p>
```

**Source file:** `src/components/TheDrop.jsx:20`

#### Recommended Fix (not applied)

If the text is in English, remove the `lang` attribute (the page-level `lang="en"` will apply, once SI-2 is fixed). If the text is genuinely in a different language, replace `"zz"` with the correct BCP 47 tag (e.g., `lang="es"` for Spanish):

```jsx
// If English (remove invalid lang):
<p>Our brand-new, limited-edition plushie bag charms...</p>

// If another language (use correct BCP 47 tag):
<p lang="fr">...</p>
```

---

## Part V — Prioritised Remediation Roadmap

The following order is recommended for maximum impact with minimum risk:

| Priority | Issue | Effort | Impact |
|---|---|---|---|
| 1 | SI-2: Add `lang="en"` to `<html>` | 1 line change | Resolves 6 instances across all pages |
| 2 | CI-6: Add `alt` to hero/drop images | 2 attribute additions | Resolves 4 critical instances |
| 3 | CI-7: Fix `role="slider"` missing required attrs | 1 element change | Resolves 2 critical instances |
| 4 | CI-5: Fix `aria-expanded="yes"` and `aria-relevant="changes"` | 3 attribute changes | Resolves 5 critical instances |
| 5 | CI-4: Add `aria-label` to modal close buttons | 2 attribute additions | Resolves 10 critical instances |
| 6 | CI-1 + CI-2 + CI-3: Replace `<div>` interactive elements | Refactor ~10 components | Resolves ~138 critical instances |
| 7 | SI-3: Fix or remove `lang="zz"` | 1 attribute change | Resolves 2 serious instances |
| 8 | SI-1: Fix colour-contrast across all pages | CSS colour updates | Resolves 18 serious instances |

---

## Appendix A — Methodology

1. **Repository scan:** All source files under `src/pages/` and `src/components/` were enumerated to identify all routes and entry points. React Router v7 routes were traced from `App.jsx`.
2. **Build & serve:** The application was built with `npm run build` and served via `npx serve dist -p 3000 --single`.
3. **Audit tool:** Each page was scanned using the [Evinced JS Playwright SDK](https://docs.evinced.com/docs/playwright-sdk) v2.17.0 with `sdk.evAnalyze()`. The Checkout page was scanned in two states (basket and shipping) by programmatically adding a product to the cart and advancing the checkout flow.
4. **Severity classification:** Evinced's native severity levels are used — `CRITICAL` and `SERIOUS`. No Axe tools were used.
5. **Raw results:** JSON output for each page is stored in `/workspace/a11y-results/`.

## Appendix B — Raw Issue Counts (JSON Files)

| File | Issues | Critical | Serious |
|---|---|---|---|
| `a11y-results/homepage.json` | 35 | 32 | 3 |
| `a11y-results/new-products.json` | 55 | 41 | 14 |
| `a11y-results/product-detail.json` | 20 | 18 | 2 |
| `a11y-results/checkout-basket.json` | 21 | 18 | 3 |
| `a11y-results/checkout-shipping.json` | 19 | 18 | 1 |
| `a11y-results/order-confirmation.json` | 35 | 32 | 3 |

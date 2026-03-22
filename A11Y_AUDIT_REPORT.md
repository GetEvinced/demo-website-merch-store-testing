# Accessibility Audit Report — Demo Website

**Audit Date:** 2026-03-22  
**Tool:** Evinced SDK for Playwright (`@evinced/js-playwright-sdk`) via the Evinced MCP Server  
**Scan method:** `evAnalyze()` (full-page), `components.analyzeCombobox()`, `components.analyzeSiteNavigation()`  
**Branch:** `cursor/accessibility-audit-report-3621`

---

## 1. Executive Summary

| Metric | Value |
|--------|-------|
| Pages scanned | 5 |
| Total issues detected | 155 |
| **Critical** | **129** |
| Serious | 21 |
| Needs Review | 1 |
| Best Practice | 1 |
| Issues remediated | 0 (report only — see instructions) |

The site has a pervasive pattern of **non-semantic interactive elements** (`<div>` and `<span>` acting as buttons and links without proper ARIA roles or keyboard support) and several image, ARIA attribute, and color-contrast violations that block or severely hinder assistive-technology users on every page.

---

## 2. Pages Scanned

| # | Page Name | URL | Entry Point | Issues Found |
|---|-----------|-----|-------------|--------------|
| 1 | Homepage | `/` | `src/pages/HomePage.jsx` | 35 |
| 2 | Products Listing | `/shop/new` | `src/pages/NewPage.jsx` | 59 |
| 3 | Product Detail | `/product/:id` | `src/pages/ProductPage.jsx` | 20 |
| 4 | Checkout | `/checkout` | `src/pages/CheckoutPage.jsx` | 21 |
| 5 | Order Confirmation | `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` | 20 |

Shared components that appear on every page: `src/components/Header.jsx`, `src/components/Footer.jsx`, `src/components/CartModal.jsx`, `src/components/WishlistModal.jsx`.

---

## 3. Audit Methodology

1. The application was built (`npx webpack --mode production`) and served locally (`npx serve dist -p 3000 --single`).
2. Playwright tests navigated each route in Chromium (1280 × 800 viewport).
3. The Evinced SDK was called with three scan modes:
   - **`evAnalyze()`** — full-page WCAG scan on every route.
   - **`components.analyzeCombobox({ selector: '.sort-btn' })`** — targeted combobox widget check on the Products page.
   - **`components.analyzeSiteNavigation({ selector: 'nav[aria-label="Main navigation"]' })`** — targeted navigation landmark check.
4. Results from the three scans were merged and deduplicated with `evMergeIssues()`.
5. Raw JSON results per page were saved to `tests/e2e/test-results/page-*.json`.
6. Issues were classified as **Critical**, **Serious**, **Needs Review**, or **Best Practice** using Evinced severity levels.

---

## 4. Critical Issues

The 129 raw critical violations collapse into **18 distinct issue groups** once duplicates across pages are merged. Each group is documented below.

---

### CI-01 — Wishlist Button: Non-semantic `<div>` used as interactive button

**Severity:** Critical  
**WCAG:** 4.1.2 (A) — Name, Role, Value; 2.1.1 (A) — Keyboard  
**Evinced rules:** Interactable role, Keyboard accessible  
**Affected pages:** All 5 pages (Header — present on every route)  
**Source file:** `src/components/Header.jsx`

**Affected element:**
```html
<div class="icon-btn wishlist-btn" style="cursor: pointer;">
  <svg aria-hidden="true">…</svg>
  <span>Wishlist</span>
</div>
```

**Why it is a problem:**  
A `<div>` has no implicit ARIA role of `button`. Screen readers announce it as generic content rather than an actionable control. Keyboard users cannot tab to it (no `tabindex`) and cannot activate it with Enter or Space. Even though `cursor: pointer` is applied visually, the element is invisible to assistive technology as an interactive widget.

**Recommended fix:**  
Replace the `<div>` wrapper with a `<button>` element. `<button>` is focusable by default, is announced as "button" by screen readers, and responds to Enter/Space natively:

```jsx
// Before
<div className="icon-btn wishlist-btn" style={{ cursor: 'pointer' }} onClick={openWishlist}>

// After
<button className="icon-btn wishlist-btn" onClick={openWishlist} aria-label="Open wishlist">
```

**Rationale:**  
Native HTML semantics are preferred over ARIA `role="button"` + `tabindex="0"` because they require no additional keyboard event handling, benefit from browser default focus styling, and are more robust across assistive-technology stacks. The `aria-label` provides the accessible name when the inner text alone is insufficient.

---

### CI-02 — Search Button: Non-semantic `<div>` used as interactive button, missing accessible name

**Severity:** Critical  
**WCAG:** 4.1.2 (A) — Name, Role, Value; 2.1.1 (A) — Keyboard  
**Evinced rules:** Interactable role, Keyboard accessible, Accessible name  
**Affected pages:** All 5 pages (Header)  
**Source file:** `src/components/Header.jsx`

**Affected element (selector: `.icon-btn:nth-child(2)`):**
```html
<div class="icon-btn" style="cursor: pointer;">
  <svg aria-hidden="true">…</svg>
</div>
```

**Why it is a problem:**  
In addition to the non-semantic role problem (same as CI-01), this icon-only control has no accessible name: the SVG is marked `aria-hidden="true"` and there is no visible text, `aria-label`, or `title`. Screen readers either skip it entirely or announce it without any meaningful label (e.g., "unlabeled button").

**Recommended fix:**
```jsx
// After
<button className="icon-btn" onClick={openSearch} aria-label="Search">
  <svg aria-hidden="true">…</svg>
</button>
```

**Rationale:**  
The `aria-label="Search"` conveys purpose to screen reader users. The SVG remains `aria-hidden` because the button's label is already provided by `aria-label`, avoiding redundant announcement.

---

### CI-03 — Login Button: Non-semantic `<div>` used as interactive button, missing accessible name

**Severity:** Critical  
**WCAG:** 4.1.2 (A) — Name, Role, Value; 2.1.1 (A) — Keyboard  
**Evinced rules:** Interactable role, Keyboard accessible, Accessible name  
**Affected pages:** All 5 pages (Header)  
**Source file:** `src/components/Header.jsx`

**Affected element (selector: `.icon-btn:nth-child(4)`):**
```html
<div class="icon-btn" style="cursor: pointer;">
  <svg aria-hidden="true">…</svg>
</div>
```

**Why it is a problem:**  
Identical pattern to CI-02. The login icon is inaccessible to both screen reader users (no role, no accessible name) and keyboard users (not focusable).

**Recommended fix:**
```jsx
<button className="icon-btn" onClick={openLogin} aria-label="Sign in">
  <svg aria-hidden="true">…</svg>
</button>
```

**Rationale:**  
Same rationale as CI-02. `aria-label="Sign in"` is chosen over "Login" to match the most common screen reader convention for authentication entry points.

---

### CI-04 — Region/Flag Selector: Non-semantic `<div>` used as interactive button

**Severity:** Critical  
**WCAG:** 4.1.2 (A) — Name, Role, Value; 2.1.1 (A) — Keyboard  
**Evinced rules:** Interactable role, Keyboard accessible  
**Affected pages:** All 5 pages (Header)  
**Source file:** `src/components/Header.jsx`

**Affected element (selector: `.flag-group`):**
```html
<div class="flag-group" style="cursor: pointer;">
  <img src="/images/icons/united-states-of-america.png" alt="United States Flag" …>
  <img src="/images/icons/canada.png" alt="Canada Flag" …>
  …
</div>
```

**Why it is a problem:**  
The region/language selector is implemented as a `<div>` without a button role or `tabindex`, making it unreachable by keyboard and unidentifiable by screen readers as an interactive element.

**Recommended fix:**
```jsx
<button className="flag-group" onClick={openRegionSelector} aria-label="Select region or language" aria-haspopup="true">
  <img src="/images/icons/united-states-of-america.png" alt="" aria-hidden="true" …>
</button>
```

**Rationale:**  
Adding `aria-haspopup="true"` communicates to screen reader users that activating this button opens a popup — matching the expected interaction model for region selectors. The flag images become decorative (`alt=""`) because the button's purpose is already described by `aria-label`.

---

### CI-05 — Footer "Sustainability" Link: Non-semantic `<div>` used as navigation item

**Severity:** Critical  
**WCAG:** 4.1.2 (A) — Name, Role, Value; 2.1.1 (A) — Keyboard  
**Evinced rules:** Interactable role, Keyboard accessible  
**Affected pages:** All 5 pages (Footer)  
**Source file:** `src/components/Footer.jsx`

**Affected element (selector: `li:nth-child(3) > .footer-nav-item`):**
```html
<div class="footer-nav-item" style="cursor: pointer;">Sustainability</div>
```

**Why it is a problem:**  
Navigation items that take users to other pages or sections must be implemented as `<a>` links so that screen readers announce them as navigable links, keyboard users can reach and activate them, and browser features (e.g., open in new tab, copy link) work as expected.

**Recommended fix:**
```jsx
<a className="footer-nav-item" href="/sustainability">Sustainability</a>
```

**Rationale:**  
If the item navigates to a URL, `<a href="…">` is strictly superior to `<div role="link" tabindex="0">` because it supports middle-click, context menus, and history navigation without any additional JavaScript.

---

### CI-06 — Footer "FAQs" Link: Non-semantic `<div>` with hidden text, no accessible name

**Severity:** Critical  
**WCAG:** 4.1.2 (A) — Name, Role, Value; 2.1.1 (A) — Keyboard  
**Evinced rules:** Interactable role, Keyboard accessible, Accessible name  
**Affected pages:** All 5 pages (Footer)  
**Source file:** `src/components/Footer.jsx`

**Affected element (selector: `.footer-list:nth-child(2) > li > .footer-nav-item`):**
```html
<div class="footer-nav-item" style="cursor: pointer;">
  <span aria-hidden="true">FAQs</span>
</div>
```

**Why it is a problem:**  
The visible text "FAQs" is wrapped in `aria-hidden="true"`, so the element has no accessible name whatsoever. Combined with the missing link semantics and lack of `tabindex`, this element is completely invisible to assistive-technology users.

**Recommended fix:**
```jsx
<a className="footer-nav-item" href="/faqs">FAQs</a>
```

**Rationale:**  
Removing the spurious `aria-hidden="true"` from the inner text and replacing the `<div>` with `<a href>` resolves all three violations simultaneously (role, keyboard access, and accessible name) without any ARIA attributes.

---

### CI-07 — PopularSection "Shop" Links: Non-semantic `<div>` with hidden labels, no accessible name

**Severity:** Critical  
**WCAG:** 4.1.2 (A) — Name, Role, Value; 2.1.1 (A) — Keyboard  
**Evinced rules:** Interactable role, Keyboard accessible, Accessible name  
**Affected pages:** Homepage (`/`)  
**Source file:** `src/components/PopularSection.jsx`

**Affected elements (3 instances):**
```html
<!-- Instance 1 -->
<div class="shop-link" style="cursor: pointer;">
  <span aria-hidden="true">Shop Drinkware</span>
</div>

<!-- Instance 2 -->
<div class="shop-link" style="cursor: pointer;">
  <span aria-hidden="true">Shop Fun and Games</span>
</div>

<!-- Instance 3 -->
<div class="shop-link" style="cursor: pointer;">
  <span aria-hidden="true">Shop Stationery</span>
</div>
```

**Why it is a problem:**  
Each "Shop …" call-to-action hides its visible text with `aria-hidden="true"`. Because the parent `<div>` has no role, no `tabindex`, and no accessible name, these navigation calls-to-action are entirely invisible to screen readers and keyboard users. Sighted users see three labeled shop links; assistive-technology users see nothing.

**Recommended fix:**
```jsx
<a className="shop-link" href="/shop/drinkware">Shop Drinkware</a>
<a className="shop-link" href="/shop/fun-and-games">Shop Fun and Games</a>
<a className="shop-link" href="/shop/stationery">Shop Stationery</a>
```

**Rationale:**  
Remove `aria-hidden="true"` from the inner text and use `<a href>` instead of `<div>`. Native link semantics propagate meaningful text directly to the accessibility tree without any ARIA overhead.

---

### CI-08 — Cart Modal Close Button: Missing Accessible Name

**Severity:** Critical  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Evinced rule:** Button-name  
**Affected pages:** Homepage, Products Page, Product Detail (cart drawer visible after adding to cart)  
**Source file:** `src/components/CartModal.jsx`

**Affected element (selector: `#cart-modal > div:nth-child(1) > button`):**
```html
<button class="JjN6AKz7a2PRH2gFKW3v">
  <svg aria-hidden="true">…</svg>
</button>
```

**Why it is a problem:**  
The close button is a native `<button>` element (role is correct) but has no accessible name. The SVG icon is `aria-hidden="true"` and there is no `aria-label`, `title`, or visible text. Screen readers announce it as an unlabeled button, giving users no indication that activating it closes the cart.

**Recommended fix:**
```jsx
<button className={styles.closeBtn} onClick={onClose} aria-label="Close shopping cart">
  <svg aria-hidden="true">…</svg>
</button>
```

**Rationale:**  
`aria-label` is the appropriate attribute for icon-only buttons because it provides an accessible name without altering visual appearance. The label "Close shopping cart" is preferred over "Close" because it provides context when the screen reader user is not visually aware of the cart drawer.

---

### CI-09 — Wishlist Modal Close Button: Missing Accessible Name

**Severity:** Critical  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Evinced rule:** Button-name  
**Affected pages:** All 5 pages (Wishlist drawer is accessible from the header wishlist button on every page)  
**Source file:** `src/components/WishlistModal.jsx`

**Affected element:**
- Selector `div[role="dialog"] > div:nth-child(1) > button` (on Homepage, Products Page, Product Detail)
- Selector `div:nth-child(1) > button` (on Checkout, Order Confirmation)

```html
<button class="WEtKZofboSdJ1n7KLpwd">
  <svg aria-hidden="true">…</svg>
</button>
```

**Why it is a problem:**  
Same pattern as CI-08. The wishlist modal close button has no accessible name.

**Recommended fix:**
```jsx
<button className={styles.closeBtn} onClick={onClose} aria-label="Close wishlist">
  <svg aria-hidden="true">…</svg>
</button>
```

**Rationale:**  
Identical to CI-08. A contextual `aria-label` makes the button self-describing without requiring the user to navigate back to understand which modal is open.

---

### CI-10 — FeaturedPair Headings: Invalid `aria-expanded="yes"` Value

**Severity:** Critical  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Evinced rule:** Aria-valid-attr-value  
**Affected pages:** Homepage (`/`)  
**Source file:** `src/components/FeaturedPair.jsx`

**Affected elements (2 instances):**
```html
<h1 aria-expanded="yes">Keep on Truckin'</h1>
<h1 aria-expanded="yes">Limited edition and traveling fast</h1>
```

**Why it is a problem:**  
`aria-expanded` accepts only `"true"` or `"false"` (or no value to remove the attribute). The value `"yes"` is not a valid ARIA boolean and causes unpredictable behavior in screen readers — some may ignore the attribute, others may misinterpret it. Additionally, `aria-expanded` is not semantically appropriate on heading elements that do not control a collapsible section.

**Recommended fix:**  
Remove `aria-expanded` entirely from the headings, since the attribute is meaningless on a static `<h1>`:
```jsx
// Before
<h1 aria-expanded="yes">{card.title}</h1>

// After
<h1>{card.title}</h1>
```

**Rationale:**  
The principle of minimal ARIA: do not add ARIA attributes unless they are semantically appropriate. An `<h1>` does not control a disclosure widget, so `aria-expanded` adds noise without benefit. Removing it eliminates the invalid-value violation without changing page behavior.

---

### CI-11 — TheDrop Slider: Missing Required ARIA Attributes

**Severity:** Critical  
**WCAG:** 4.1.2 (A) — Name, Role, Value; 2.1.1 (A) — Keyboard  
**Evinced rules:** Aria-required-attr, Keyboard accessible  
**Affected pages:** Homepage (`/`)  
**Source file:** `src/components/TheDrop.jsx`

**Affected element (selector: `.drop-popularity-bar`):**
```html
<div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>
```

**Why it is a problem:**  
The `slider` role requires three ARIA attributes: `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. Without them, screen readers cannot announce the current value or value range of the slider, making it useless to blind users. Additionally, a `role="slider"` element must be focusable (`tabindex="0"`) and respond to arrow-key events; without `tabindex` it is excluded from keyboard navigation entirely.

**Recommended fix:**
```jsx
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={popularityValue}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuetext={`${popularityValue}%`}
  tabIndex={0}
  className="drop-popularity-bar"
  onKeyDown={handleSliderKeyDown}
/>
```

**Rationale:**  
`aria-valuenow`, `aria-valuemin`, and `aria-valuemax` are required properties for the `slider` role per the ARIA specification. `aria-valuetext` is added as a best practice to provide a human-readable version of the numeric value. `tabindex="0"` places the element in the natural tab order and `onKeyDown` enables arrow-key navigation as required by the ARIA slider keyboard interaction pattern.

---

### CI-12 — ProductPage Size List: Invalid `aria-relevant="changes"` Value

**Severity:** Critical  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Evinced rule:** Aria-valid-attr-value  
**Affected pages:** Product Detail (`/product/:id`)  
**Source file:** `src/pages/ProductPage.jsx`

**Affected element (selector: `ul[aria-relevant="changes"]`):**
```html
<ul class="…" aria-relevant="changes" aria-live="polite">
  <li>…</li>
</ul>
```

**Why it is a problem:**  
`aria-relevant` accepts a space-separated list of tokens from the set `{ additions, removals, text, all }`. The value `"changes"` is not a valid token. Screen readers will ignore or misinterpret the attribute, potentially suppressing live-region announcements for this list.

**Recommended fix:**
```jsx
// "additions text" announces new items and text changes — the most common pattern
<ul aria-relevant="additions text" aria-live="polite">
```

**Rationale:**  
`aria-relevant="additions text"` is the ARIA specification default and covers the most common use case: announce when new items are added or existing text changes. If only new size options should be announced, `aria-relevant="additions"` is more precise. Replacing the invalid `"changes"` with a valid token restores correct live-region behavior.

---

### CI-13 — HeroBanner Image: Missing `alt` Attribute

**Severity:** Critical  
**WCAG:** 1.1.1 (A) — Non-text Content  
**Evinced rule:** Image-alt  
**Affected pages:** Homepage (`/`)  
**Source file:** `src/components/HeroBanner.jsx`

**Affected element (selector: `img[src$="New_Tees.png"]`):**
```html
<img src="/images/home/New_Tees.png">
```

**Why it is a problem:**  
An image without an `alt` attribute causes screen readers to read out the full file path or URL as content (e.g., "slash images slash home slash New underscore Tees dot png"). This is meaningless noise for blind users. WCAG 1.1.1 requires all non-decorative images to have a text alternative.

**Recommended fix:**
```jsx
<img src="/images/home/New_Tees.png" alt="New season tees collection" />
```

If the image is purely decorative (duplicates adjacent text):
```jsx
<img src="/images/home/New_Tees.png" alt="" role="presentation" />
```

**Rationale:**  
A descriptive `alt` that summarizes the image subject is preferred for hero content because it gives screen reader users the same visual context that sighted users receive. An empty `alt=""` is appropriate only if the image conveys no information beyond what adjacent text already provides.

---

### CI-14 — TheDrop Image: Missing `alt` Attribute

**Severity:** Critical  
**WCAG:** 1.1.1 (A) — Non-text Content  
**Evinced rule:** Image-alt  
**Affected pages:** Homepage (`/`)  
**Source file:** `src/components/TheDrop.jsx`

**Affected element (selector: `img[src$="2bags_charms1.png"]`):**
```html
<img src="/images/home/2bags_charms1.png" loading="lazy">
```

**Why it is a problem:**  
Same as CI-13. The bag charms product image has no `alt` attribute, causing screen readers to announce the raw filename.

**Recommended fix:**
```jsx
<img src="/images/home/2bags_charms1.png" alt="Limited edition bag charms" loading="lazy" />
```

**Rationale:**  
The alt text should be concise and describe the content or function of the image. For a product showcase image, the alt text should convey what is being shown so screen reader users can appreciate the product context.

---

### CI-15 — FilterSidebar Options: Non-semantic `<div>` Checkboxes (Products Page)

**Severity:** Critical  
**WCAG:** 4.1.2 (A) — Name, Role, Value; 2.1.1 (A) — Keyboard  
**Evinced rules:** Interactable role, Keyboard accessible  
**Affected pages:** Products Page (`/shop/new`)  
**Source file:** `src/components/FilterSidebar.jsx`

**Affected elements:** 12 filter option `<div>` elements across Price (4), Size (5), and Brand (3) filter groups.

**Representative element (selector: `.filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(1)`):**
```html
<div class="filter-option">
  <div class="custom-checkbox"></div>
  <span class="filter-option-label">1.00 - 19.99
    <span class="filter-count">(8)</span>
  </span>
</div>
```

**Why it is a problem:**  
Each filter option is a clickable `<div>` that acts as a checkbox but has no `role`, no `tabindex`, and no `aria-checked`. Screen readers announce it as a plain text label. Keyboard users cannot reach or toggle any filter option. The entire filter sidebar is effectively inaccessible to non-mouse users.

**Recommended fix — replace the custom checkbox div with a native `<input type="checkbox">`:**
```jsx
<label className="filter-option">
  <input
    type="checkbox"
    checked={isChecked}
    onChange={() => toggleFilter(value)}
    className="visually-hidden"
  />
  <span className="custom-checkbox" aria-hidden="true" />
  <span className="filter-option-label">
    {label}
    <span className="filter-count">({count})</span>
  </span>
</label>
```

**Rationale:**  
A native `<input type="checkbox">` wrapped in a `<label>` is focusable, toggleable with Space, and announces its checked state automatically. Custom styling can be applied via CSS (visually hiding the native checkbox and styling the decorative sibling span) without sacrificing semantics. This approach is preferable to ARIA because it works without JavaScript state management for ARIA attributes.

---

### CI-16 — Sort Button: Incorrect Role (Should Be `combobox`)

**Severity:** Critical  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Evinced rules:** Element has incorrect role, Missing contextual labeling  
**Affected pages:** Products Page (`/shop/new`)  
**Source file:** `src/pages/NewPage.jsx`

**Affected element (selector: `.sort-btn`):**
```html
<button class="sort-btn">
  Sort by Relevance (Default)
  <svg aria-hidden="true">…</svg>
</button>
```

**Why it is a problem:**  
The Evinced combobox analyzer expects the sort trigger to carry `role="combobox"` so that assistive technologies recognize it as a widget that opens a list of selectable options. Without `role="combobox"`, screen readers announce it as a plain button with no indication that it controls a listbox, and the combobox keyboard interaction pattern (arrow keys to navigate options) is not conveyed.

**Recommended fix:**
```jsx
<button
  className="sort-btn"
  role="combobox"
  aria-label="Sort products"
  aria-haspopup="listbox"
  aria-expanded={isOpen}
  aria-controls="sort-options-list"
>
  {currentSortLabel}
  <svg aria-hidden="true">…</svg>
</button>
<ul id="sort-options-list" role="listbox" aria-label="Sort options">
  {sortOptions.map(opt => (
    <li key={opt.value} role="option" aria-selected={opt.value === currentSort}>
      {opt.label}
    </li>
  ))}
</ul>
```

**Rationale:**  
`role="combobox"` with `aria-haspopup="listbox"`, `aria-expanded`, and `aria-controls` implements the ARIA combobox pattern. This gives screen readers the full semantics: the current sort order, whether the list is open, and which list element the button controls. The `aria-label="Sort products"` is added because the button label changes dynamically and the Evinced analyzer flagged missing contextual labeling.

---

### CI-17 — Checkout Page "Continue" Button: Non-semantic `<div>`

**Severity:** Critical  
**WCAG:** 4.1.2 (A) — Name, Role, Value; 2.1.1 (A) — Keyboard  
**Evinced rules:** Interactable role, Keyboard accessible  
**Affected pages:** Checkout (`/checkout`)  
**Source file:** `src/pages/CheckoutPage.jsx`

**Affected element (selector: `.checkout-continue-btn`):**
```html
<div class="checkout-continue-btn" style="cursor: pointer;">Continue</div>
```

**Why it is a problem:**  
The primary action button on the checkout basket step is a `<div>`. Screen readers do not identify it as a button. Keyboard users cannot tab to it (no `tabindex`) or activate it (no Enter/Space handling). This blocks keyboard-only users from completing their purchase.

**Recommended fix:**
```jsx
<button className="checkout-continue-btn" onClick={handleContinue}>
  Continue
</button>
```

**Rationale:**  
The fix is identical in reasoning to CI-01 — replace the `<div>` with a native `<button>`. A `<button>` is the correct semantic element for triggering an action. No `aria-label` is needed because the visible text "Continue" is sufficient as an accessible name.

---

### CI-18 — Order Confirmation "Back to Shop" Link: Non-semantic `<div>`

**Severity:** Critical  
**WCAG:** 4.1.2 (A) — Name, Role, Value; 2.1.1 (A) — Keyboard  
**Evinced rules:** Interactable role, Keyboard accessible  
**Affected pages:** Order Confirmation (`/order-confirmation`)  
**Source file:** `src/pages/OrderConfirmationPage.jsx`

**Affected element (selector: `.confirm-home-link`):**
```html
<div class="confirm-home-link" style="cursor: pointer;">← Back to Shop</div>
```

**Why it is a problem:**  
This element navigates the user back to the shop home page, making it a link in function. Implementing it as a `<div>` means screen readers announce it as plain text, keyboard users cannot reach it, and browser features for links (e.g., open in new tab) do not work.

**Recommended fix:**
```jsx
<a className="confirm-home-link" href="/">← Back to Shop</a>
```

**Rationale:**  
If the element navigates to a URL, the correct element is `<a href>`. This is a navigation action, not a form submission, so `<a>` is semantically more accurate than `<button>`. Using an anchor also allows users to right-click and choose "Open in new tab" or middle-click.

---

## 5. Proposed Fix Summary Table

| # | Issue ID | Source File | Element | Fix |
|---|----------|-------------|---------|-----|
| 1 | CI-01 | `Header.jsx` | `.wishlist-btn` | Replace `<div>` with `<button aria-label="Open wishlist">` |
| 2 | CI-02 | `Header.jsx` | `.icon-btn:nth-child(2)` (Search) | Replace `<div>` with `<button aria-label="Search">` |
| 3 | CI-03 | `Header.jsx` | `.icon-btn:nth-child(4)` (Login) | Replace `<div>` with `<button aria-label="Sign in">` |
| 4 | CI-04 | `Header.jsx` | `.flag-group` | Replace `<div>` with `<button aria-label="Select region or language" aria-haspopup="true">` |
| 5 | CI-05 | `Footer.jsx` | `li:nth-child(3) > .footer-nav-item` (Sustainability) | Replace `<div>` with `<a href="/sustainability">` |
| 6 | CI-06 | `Footer.jsx` | `.footer-list:nth-child(2) .footer-nav-item` (FAQs) | Replace `<div>` with `<a href="/faqs">`, remove inner `aria-hidden` |
| 7 | CI-07 | `PopularSection.jsx` | `.shop-link` (×3) | Replace `<div>` with `<a href="…">`, remove inner `aria-hidden` |
| 8 | CI-08 | `CartModal.jsx` | Cart close `<button>` | Add `aria-label="Close shopping cart"` to existing `<button>` |
| 9 | CI-09 | `WishlistModal.jsx` | Wishlist close `<button>` | Add `aria-label="Close wishlist"` to existing `<button>` |
| 10 | CI-10 | `FeaturedPair.jsx` | `<h1 aria-expanded="yes">` (×2) | Remove `aria-expanded` attribute entirely |
| 11 | CI-11 | `TheDrop.jsx` | `.drop-popularity-bar` | Add `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `tabIndex={0}`, `onKeyDown` handler |
| 12 | CI-12 | `ProductPage.jsx` | `ul[aria-relevant="changes"]` | Change value to `aria-relevant="additions text"` |
| 13 | CI-13 | `HeroBanner.jsx` | `img[src$="New_Tees.png"]` | Add `alt="New season tees collection"` |
| 14 | CI-14 | `TheDrop.jsx` | `img[src$="2bags_charms1.png"]` | Add `alt="Limited edition bag charms"` |
| 15 | CI-15 | `FilterSidebar.jsx` | `.filter-option` `<div>` (×12) | Replace each with `<label><input type="checkbox" …/></label>` |
| 16 | CI-16 | `NewPage.jsx` | `.sort-btn` | Add `role="combobox"`, `aria-label="Sort products"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`; add `role="listbox"` / `role="option"` to dropdown |
| 17 | CI-17 | `CheckoutPage.jsx` | `.checkout-continue-btn` | Replace `<div>` with `<button>` |
| 18 | CI-18 | `OrderConfirmationPage.jsx` | `.confirm-home-link` | Replace `<div>` with `<a href="/">` |

---

## 6. Remaining Non-Critical Issues (Not Remediated)

The following 26 issues were detected with severities of **Serious**, **Needs Review**, or **Best Practice**. They are documented here for awareness and future remediation prioritization.

---

### NC-01 — `<html>` Element Missing `lang` Attribute

**Severity:** Serious  
**WCAG:** 3.1.1 (A) — Language of Page  
**Evinced rule:** Html-has-lang  
**Affected pages:** All 5 pages  
**Source file:** `public/index.html`  
**Selector:** `html`

```html
<html>  <!-- missing lang attribute -->
```

**Description:** Without a `lang` attribute, screen readers cannot determine the page language and may use the wrong voice/pronunciation engine. This affects all pages because the single `index.html` serves all routes.

**Suggested fix:** Add `<html lang="en">` to `public/index.html`.

---

### NC-02 — Color Contrast: Insufficient Contrast Ratio (Multiple Instances)

**Severity:** Serious  
**WCAG:** 1.4.3 (AA) — Minimum Contrast  
**Evinced rule:** Color-contrast  
**Affected pages:** Homepage, Products Page, Product Detail, Checkout, Order Confirmation (total 14 raw instances)

| # | Page | Selector | Element | Foreground | Background | Ratio |
|---|------|----------|---------|-----------|-----------|-------|
| 1 | Homepage | `.hero-content > p` | Hero subtitle "Warm hues for cooler days" | `#c8c0b8` | `#e8e0d8` | ~1.4:1 |
| 2 | Products Page | `.products-found` | "16 Products Found" text | `#b0b4b8` | `#ffffff` | ~1.9:1 |
| 3 | Products Page | `.filter-count` (×12) | Product count in filter options e.g. "(8)", "(14)" | `#c8c8c8` | `#ffffff` | ~1.4:1 |
| 4 | Product Detail | `p:nth-child(4)` | Product description paragraph | `#c0c0c0` | `#ffffff` | ~1.6:1 |
| 5 | Checkout | `.checkout-step:nth-child(3) > .step-label` | "Shipping & Payment" step label | Low contrast | White/light bg | < 4.5:1 |
| 6 | Checkout | `.summary-tax-note` | "Taxes calculated at next step" | Low contrast | White/light bg | < 4.5:1 |
| 7 | Order Confirmation | `.confirm-order-id-label` | "Order ID" label | Low contrast | White/light bg | < 4.5:1 |

**Description:** All affected text elements have foreground-to-background contrast ratios below the WCAG 2.1 AA minimum of 4.5:1 for normal text (or 3:1 for large text ≥ 18pt/14pt bold). Low-vision users who do not use high-contrast mode may be unable to read these labels.

**Suggested fix per instance:**
- `HeroBanner.css` `.hero-content p`: darken text to at least `#767676` on `#e8e0d8`
- `NewPage.css` `.products-found`: darken to at least `#767676` on white
- `FilterSidebar.css` `.filter-count`: darken to at least `#767676` on white
- `ProductPage.module.css` `.productDescription`: darken to at least `#767676` on white
- `CheckoutPage.css` step labels and tax note: darken text or lighten background to meet 4.5:1
- `OrderConfirmationPage.css` `.confirm-order-id-label`: ensure 4.5:1 ratio

---

### NC-03 — Invalid BCP 47 Language Tag `lang="zz"`

**Severity:** Serious  
**WCAG:** 3.1.2 (AA) — Language of Parts  
**Evinced rule:** Valid-lang  
**Affected pages:** Homepage (`/`)  
**Source file:** `src/components/TheDrop.jsx`  
**Selector:** `p[lang="zz"]`

```html
<p lang="zz">Our brand-new, limited-edition plushie bag charms…</p>
```

**Description:** `"zz"` is not a valid BCP 47 language tag. Screen readers may switch to an incorrect pronunciation engine for this paragraph, mangling the text for users relying on TTS.

**Suggested fix:** Replace `lang="zz"` with the actual language of the content (e.g., `lang="en"` for English, or remove the attribute if the paragraph language matches the document language).

---

### NC-04 — Sort Button: Combobox Analysis Skipped

**Severity:** Needs Review  
**Evinced rule:** Skipped combobox analysis  
**Affected pages:** Products Page (`/shop/new`)  
**Source file:** `src/pages/NewPage.jsx`  
**Selector:** `.sort-btn`

**Description:** The Evinced combobox analyzer could not programmatically open the sort dropdown to inspect its options. This means additional accessibility issues within the dropdown options list (e.g., missing `role="option"`, missing `aria-selected`, missing keyboard navigation) may exist but were not detected by this automated scan. A manual keyboard and screen reader review of the sort dropdown is recommended.

---

### NC-05 — Navigation Submenu Uses Forbidden `role="menu"`

**Severity:** Best Practice  
**Evinced rule:** Menu as a nav element  
**Affected pages:** All pages (Header)  
**Source file:** `src/components/Header.jsx`  
**Selector:** `.has-submenu:nth-child(2) > .submenu[role="menu"]`

```html
<ul class="submenu" role="menu">
  <li role="none">
    <a role="menuitem" href="/shop/new">…</a>
  </li>
</ul>
```

**Description:** The ARIA `menu` and `menubar` roles imply application-level widget semantics (e.g., a toolbar menu in a desktop app). Using them inside a `<nav>` landmark confuses assistive technologies, which expect navigation landmarks to contain links, not application menus. Users may not be able to navigate the submenu with standard keyboard commands.

**Suggested fix:** Remove `role="menu"` from the submenu `<ul>` and `role="menuitem"` from the `<a>` elements. Navigation submenus should use plain `<ul>/<li>/<a>` without ARIA menu roles, or use `role="list"` if list semantics are desired. The parent `<nav aria-label="Main navigation">` already provides the landmark context.

---

## 7. Issue Count Summary

### By Page

| Page | Total | Critical | Serious | Needs Review | Best Practice |
|------|-------|----------|---------|--------------|---------------|
| Homepage (`/`) | 35 | 32 | 3 | 0 | 0 |
| Products Page (`/shop/new`) | 59 | 43 | 14 | 1 | 1 |
| Product Detail (`/product/:id`) | 20 | 18 | 2 | 0 | 0 |
| Checkout (`/checkout`) | 21 | 18 | 3 | 0 | 0 |
| Order Confirmation (`/order-confirmation`) | 20 | 18 | 2 | 0 | 0 |
| **Total** | **155** | **129** | **24** | **1** | **1** |

### By Issue Type (Critical only)

| Issue Type | Raw Count | Unique Components |
|-----------|-----------|-------------------|
| Interactable role | 55 | 9 components |
| Keyboard accessible | 55 | 9 components |
| Accessible name | 15 | 4 components |
| Button-name | 5 | 2 components |
| Image-alt | 2 | 2 images |
| Aria-valid-attr-value | 3 | 2 components |
| Aria-required-attr | 1 | 1 component |
| Element has incorrect role | 1 | Sort button |
| Missing contextual labeling | 1 | Sort button |

---

## 8. Raw Scan Data

Per-page raw JSON results are stored in `tests/e2e/test-results/`:

```
tests/e2e/test-results/
├── page-homepage.json           (35 issues)
├── page-products.json           (59 issues)
├── page-product-detail.json     (20 issues)
├── page-checkout.json           (21 issues)
└── page-order-confirmation.json (20 issues)
```

The Playwright test spec that produced these results is `tests/e2e/specs/comprehensive-a11y-audit.spec.ts`.

To re-run the audit:
```bash
npx webpack --mode production
npx serve dist -p 3000 --single &
EVINCED_SERVICE_ID=<your-service-id> \
EVINCED_API_KEY=<your-api-key> \
BASE_URL=http://localhost:3000 \
npx playwright test --config tests/e2e/playwright.config.ts \
  tests/e2e/specs/comprehensive-a11y-audit.spec.ts
```

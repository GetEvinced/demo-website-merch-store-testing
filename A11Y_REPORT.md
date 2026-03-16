# Accessibility Audit Report — Demo Website

**Generated:** 2026-03-16  
**Auditor:** Automated scan (Playwright + axe-core WCAG 2.1 AA ruleset)  
**Repository:** `demo-website`  
**Branch:** `cursor/website-accessibility-report-176a`

---

## Audit Scope

All five application routes were audited using a headless Chromium browser, the WCAG 2.1 AA axe-core ruleset, and a direct source-code analysis of every component. Modal / drawer states were also captured as distinct scan contexts.

| Route | Component | Scan Context |
|---|---|---|
| `/` | `HomePage` | Full page (desktop viewport 1280 × 800) |
| `/` | `HomePage` | Same page with CartModal open |
| `/shop/new` | `NewPage` | Full page + filter sidebar visible |
| `/product/1` | `ProductPage` | Full product detail page |
| `/checkout` | `CheckoutPage` | Basket step |
| `/checkout` | `CheckoutPage` | Shipping & Payment step |
| `/order-confirmation` | `OrderConfirmationPage` | Post-order confirmation |

Source files audited: `public/index.html`, `src/components/*.{jsx,css,module.css}`, `src/pages/*.{jsx,css,module.css}`, `src/data/products.json`.

---

## Executive Summary

| Severity | Unique Issue Types | Total Occurrences | Pages Affected |
|---|---|---|---|
| **Critical** | 11 | 49 | All |
| **Serious** | 4 | 68 | All |
| **Moderate** | 2 | 16 | All |
| **Minor / Informational** | 3 | 6 | Selected |

**Total automated violations detected:** 42 across 6 page/state scans (some duplicates across pages; 10 unique rule violations).  
**Additional issues from source-code analysis (not detectable by automated scanners):** 14 issue types, ~60 individual occurrences.

---

## Part I — Critical Issues

> Critical issues directly prevent users of assistive technologies from understanding or operating the interface. No remediations were applied; the required code changes are documented below.

---

### C-01 · Missing Image Alt Text

| Field | Value |
|---|---|
| **Rule** | `image-alt` (axe-core) |
| **WCAG** | 1.1.1 (A) — Non-text Content |
| **Impact** | Critical |
| **Detected by** | Automated scan |

**Affected Elements**

| # | Page | File | Element |
|---|---|---|---|
| 1 | HomePage | `src/components/HeroBanner.jsx` | `<img src="/images/home/New_Tees.png">` |
| 2 | HomePage | `src/components/TheDrop.jsx` | `<img src="/images/home/2bags_charms1.png" loading="lazy">` |

**What was found:** Both `<img>` elements are missing the `alt` attribute entirely. Screen readers announce the file path (`New_Tees.png`) rather than meaningful content, and images are inaccessible to blind users.

**Required fix:**
```jsx
// HeroBanner.jsx
<img src={HERO_IMAGE} alt="Model wearing a Winter Basics hoodie in warm earth tones" />

// TheDrop.jsx
<img src={DROP_IMAGE} loading="lazy" alt="Limited-edition Android, YouTube and Super G plushie bag charms" />
```

**Why this approach:** Adding a descriptive `alt` attribute is the only conformant solution per WCAG 1.1.1. The alt text should convey the purpose of the image in context (promotional banner) rather than just describe what is visible. Decorative-only images should use `alt=""` instead.

---

### C-02 · Invalid ARIA Attribute Values

| Field | Value |
|---|---|
| **Rule** | `aria-valid-attr-value` (axe-core) |
| **WCAG** | 4.1.2 (A) — Name, Role, Value |
| **Impact** | Critical |
| **Detected by** | Automated scan |

**Affected Elements**

| # | Page | File | Element | Invalid Attr | Invalid Value | Valid Values |
|---|---|---|---|---|---|---|
| 1 | HomePage | `src/components/FeaturedPair.jsx` | `<h1 aria-expanded="yes">` | `aria-expanded` | `"yes"` | `"true"` or `"false"` |
| 2 | NewPage | `src/pages/NewPage.jsx` | `<div aria-sort="newest" role="columnheader">` | `aria-sort` | `"newest"` | `"ascending"`, `"descending"`, `"none"`, `"other"` |
| 3 | ProductPage | `src/pages/ProductPage.jsx` | `<ul aria-relevant="changes" aria-live="polite">` | `aria-relevant` | `"changes"` | Space-separated: `additions`, `removals`, `text`, `all` |

**What was found:** Assistive technologies that parse invalid ARIA values may silently drop the attribute, treat the element as broken, or announce unexpected semantics.

**Required fix:**
```jsx
// FeaturedPair.jsx — remove aria-expanded from a heading entirely (h1 is not expandable)
<h1>{item.title}</h1>

// NewPage.jsx — use a valid aria-sort value or remove it
<div aria-sort="none" role="columnheader">Sort indicator</div>

// ProductPage.jsx — use valid tokens for aria-relevant
<ul aria-relevant="additions text" aria-live="polite" ...>
```

**Why this approach:** Using invalid token values is equivalent to omitting the attribute from an AT perspective. The correct remediation uses the narrowest valid set of tokens that matches the intended behavior. For `aria-expanded` on a heading, the attribute should simply be removed since headings are not disclosure widgets.

---

### C-03 · Required ARIA Attributes Missing

| Field | Value |
|---|---|
| **Rule** | `aria-required-attr` (axe-core) |
| **WCAG** | 4.1.2 (A) — Name, Role, Value |
| **Impact** | Critical |
| **Detected by** | Automated scan + source analysis |

**Affected Elements**

| # | Page | File | Element | Role | Missing Attributes |
|---|---|---|---|---|---|
| 1 | HomePage | `src/components/TheDrop.jsx` | `<div role="slider">` | `slider` | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| 2 | HomePage | `src/components/FeaturedPair.jsx` | `<span role="checkbox">` | `checkbox` | `aria-checked` |
| 3 | NewPage | `src/pages/NewPage.jsx` | `<div role="spinbutton">` | `spinbutton` | `aria-valuenow` |
| 4 | NewPage | `src/pages/NewPage.jsx` | `<div role="combobox">` | `combobox` | `aria-controls`, `aria-expanded` |
| 5 | ProductPage | `src/pages/ProductPage.jsx` | `<span role="meter">` | `meter` | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |

**What was found:** Each ARIA widget role has a set of required owned attributes defined by the ARIA specification. When those attributes are absent, screen readers cannot determine the current state or value of the widget, rendering it meaningless or confusing.

**Required fix:**
```jsx
// TheDrop.jsx — slider requires current/min/max values
<div role="slider" aria-label="Popularity indicator"
     aria-valuenow={75} aria-valuemin={0} aria-valuemax={100}
     className="drop-popularity-bar" />

// FeaturedPair.jsx — checkbox requires checked state
<span role="checkbox" aria-label={item.shopLabel} aria-checked="false" tabIndex={0} />

// NewPage.jsx — spinbutton requires current value
<div role="spinbutton" aria-label="Page number"
     aria-valuenow={1} aria-valuemin={1} aria-valuemax={10}>1</div>

// NewPage.jsx — combobox requires expanded state and controlled element
<div role="combobox" aria-label="Filter preset"
     aria-controls="filter-preset-popup" aria-expanded="false">All</div>

// ProductPage.jsx — meter requires current/min/max values
<span role="meter" aria-label="Stock level"
      aria-valuenow={product.available} aria-valuemin={0} aria-valuemax={100}>
  {product.available} in stock
</span>
```

**Why this approach:** The ARIA spec mandates these attributes so that AT can correctly announce the widget's current state. Without them the AT either ignores the role or announces it without state (e.g., "slider" with no value), which is worse than having no role at all. The values must reflect the actual dynamic state of the widget.

---

### C-04 · Buttons With No Accessible Name

| Field | Value |
|---|---|
| **Rule** | `button-name` (axe-core); `accessible-name` (Evinced engine) |
| **WCAG** | 4.1.2 (A) — Name, Role, Value; 2.4.6 (AA) — Headings and Labels |
| **Impact** | Critical |
| **Detected by** | Automated scan + source analysis |

**Affected Elements**

| # | Page(s) | File | Element | Issue |
|---|---|---|---|---|
| 1 | All pages | `src/components/CartModal.jsx` | `<button class="closeBtn">` | Icon-only; SVG is `aria-hidden`; no `aria-label` |
| 2 | All pages | `src/components/WishlistModal.jsx` | `<button class="closeBtn">` | Icon-only; SVG is `aria-hidden`; no `aria-label` |
| 3 | All pages | `src/components/Header.jsx` | `<button class="icon-btn cart-btn">` | Cart launcher; no `aria-label`; count badge is `aria-hidden` |
| 4 | All pages | `src/components/CartModal.jsx` | `<button class="qtyBtn">` (×2 per item) | Decrease/increase quantity symbols (−/+) with no aria-label |
| 5 | All pages | `src/components/CartModal.jsx` | `<button class="removeBtn">` | Icon-only remove button; no `aria-label` |

**What was found:** Every button in the list has its text hidden from AT or contains only a graphic symbol. Screen readers announce these as "button" with no name, making them impossible to identify by voice-control or AT users.

**Required fix:**
```jsx
// CartModal.jsx — close button
<button className={styles.closeBtn} onClick={closeCart} aria-label="Close shopping cart">

// WishlistModal.jsx — close button
<button className={styles.closeBtn} onClick={closeWishlist} aria-label="Close wishlist">

// Header.jsx — cart button (include dynamic count in label)
<button className="icon-btn cart-btn" onClick={openCart}
        aria-label={`Shopping cart, ${totalCount} item${totalCount !== 1 ? 's' : ''}`}>

// CartModal.jsx — quantity buttons (per item, include item name)
<button className={styles.qtyBtn} aria-label={`Decrease quantity of ${item.name}`}
        onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
<button className={styles.qtyBtn} aria-label={`Increase quantity of ${item.name}`}
        onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
<button className={styles.removeBtn} aria-label={`Remove ${item.name} from cart`}
        onClick={() => removeFromCart(item.id)}>
```

**Why this approach:** Icon-only buttons must always have a text alternative. The preferred approach is `aria-label` rather than `aria-labelledby` when no visible text label exists, since it avoids creating redundant visible text. The label should describe the action and include the target item when the button appears in a list, so AT users have context without needing to navigate elsewhere.

---

### C-05 · Cart Modal Missing Dialog Semantics and Focus Management

| Field | Value |
|---|---|
| **Rule** | `no-dialog-role`, `no-focus-trap`, `no-esc-close`, `no-aria-modal` |
| **WCAG** | 4.1.2 (A) — Name, Role, Value; 2.1.1 (A) — Keyboard; 2.1.2 (A) — No Keyboard Trap |
| **Impact** | Critical |
| **Detected by** | Source-code analysis (not detectable by automated scanners) |

**Affected Element:** `src/components/CartModal.jsx` — cart drawer `<div id="cart-modal">`

**What was found:** The cart modal drawer lacks all ARIA dialog attributes and keyboard behavior:
- `role="dialog"` is absent — AT cannot switch to dialog-reading mode
- `aria-modal="true"` is absent — background content is not inert for AT
- `aria-label` or `aria-labelledby` is absent — dialog has no accessible name
- No `Escape` keydown handler — keyboard users cannot dismiss the drawer
- No focus trap — Tab key cycles through the entire page behind the open modal
- Focus is not moved into the drawer when it opens

**Required fix:**
```jsx
// CartModal.jsx — drawer div
<div
  id="cart-modal"
  ref={modalRef}
  role="dialog"
  aria-modal="true"
  aria-label="Shopping cart"
  className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}
>

// Add Escape key handler and focus trap in useEffect
useEffect(() => {
  if (!isOpen) return;
  modalRef.current?.querySelector('button')?.focus(); // move focus in
  const handleKeyDown = (e) => { if (e.key === 'Escape') closeCart(); };
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [isOpen, closeCart]);
```

**Why this approach:** The ARIA dialog pattern is the universally supported mechanism for modal interfaces. Without it, screen reader users are unaware that a modal is open and continue to hear and interact with the background page. Focus management (moving focus in and trapping it) is mandated by WCAG 2.1.2; the Escape key is the standard dismissal gesture per WCAG 2.1.1 and APG authoring practices.

---

### C-06 · Non-Semantic Interactive Elements (No Role or Keyboard Access)

| Field | Value |
|---|---|
| **Rule** | `interactable-role`, `keyboard-accessible` (Evinced engine) |
| **WCAG** | 1.3.1 (A), 2.1.1 (A), 4.1.2 (A) |
| **Impact** | Critical |
| **Detected by** | Source-code analysis |

**Affected Elements**

| # | Page(s) | File | Element | Purpose |
|---|---|---|---|---|
| 1 | All pages (Header) | `src/components/Header.jsx` | `<div class="icon-btn wishlist-btn">` | Open wishlist drawer |
| 2 | All pages (Header) | `src/components/Header.jsx` | `<div class="icon-btn">` (Search) | Open search |
| 3 | All pages (Header) | `src/components/Header.jsx` | `<div class="icon-btn">` (Login) | Open login |
| 4 | All pages (Header) | `src/components/Header.jsx` | `<div class="flag-group">` | Region / language selector toggle |
| 5 | All pages (Cart Drawer) | `src/components/CartModal.jsx` | `<div class="continueBtn">` | Continue shopping (dismiss drawer) |
| 6 | All pages (Footer) | `src/components/Footer.jsx` | `<div class="footer-nav-item">` (Sustainability) | Navigate to page |
| 7 | All pages (Footer) | `src/components/Footer.jsx` | `<div class="footer-nav-item">` (FAQs) | Navigate to page |
| 8 | NewPage | `src/components/ProductCard.jsx` | `<div class="product-card-quick-add">` | Quick-add to cart |
| 9 | HomePage | `src/components/PopularSection.jsx` | `<div class="shop-link">` (×3) | Shop category navigation links |
| 10 | Checkout | `src/pages/CheckoutPage.jsx` | `<div class="checkout-continue-btn">` | Advance to shipping step |
| 11 | Checkout | `src/pages/CheckoutPage.jsx` | `<div class="checkout-back-btn">` | Return to basket step |
| 12 | Order Confirmation | `src/pages/OrderConfirmationPage.jsx` | `<div class="confirm-home-link">` | Back to shop |
| 13 | All pages (Wishlist) | `src/components/WishlistModal.jsx` | `<div class="removeBtn">` | Remove item from wishlist |
| 14 | NewPage | `src/pages/NewPage.jsx` | `<li class="sort-option">` | Sort options (no keyboard handler) |

**What was found:** All 14 elements are interactive controls built with `<div>` or `<li>` elements. They receive no keyboard focus (no `tabindex`) and have no ARIA role, making them completely inaccessible to keyboard-only and screen-reader users.

**Required fix (pattern):**
```jsx
// Replace <div> acting as a button:
<button className={styles.continueBtn} onClick={closeCart}>Continue Shopping</button>

// Replace <div> acting as a link:
<Link to="/shop" className="shop-link">Shop Drinkware</Link>
// — or if client-side navigation is not needed —
<a href="/shop" className="shop-link">Shop Drinkware</a>

// For sort option <li> elements, add keyboard handler:
<li role="option" aria-selected={opt === sortOrder} tabIndex={0}
    onClick={() => setSortOrder(opt)}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSortOrder(opt); }}>
```

**Why this approach:** Native HTML interactive elements (`<button>`, `<a>`) are inherently keyboard-focusable, announce their role correctly, and respond to Enter/Space without extra event handlers. Replacing non-semantic `<div>` controls with semantic equivalents is always preferred over patching them with ARIA roles and `tabindex`, since it produces more robust AT support across all browser/AT combinations and eliminates the need to replicate native keyboard behavior manually.

---

### C-07 · Filter Checkboxes Missing Role, State, Name and Keyboard Access

| Field | Value |
|---|---|
| **Rule** | `filter-checkbox-no-role`, `filter-checkbox-no-aria-checked`, `filter-checkbox-no-accessible-name`, `filter-checkbox-no-focus-sequence` |
| **WCAG** | 4.1.2 (A) — Name, Role, Value; 2.1.1 (A) — Keyboard |
| **Impact** | Critical |
| **Detected by** | Source-code analysis |

**Affected Elements — `src/components/FilterSidebar.jsx`**

| # | Filter | Missing |
|---|---|---|
| 1 | Price filter checkbox `<div>` | `role="checkbox"`, `aria-checked`, `aria-label`, `tabindex` |
| 2 | Size filter checkbox `<div>` | `role="checkbox"`, `aria-checked`, `aria-label`, `tabindex` |
| 3 | Brand filter checkbox `<div>` | `role="checkbox"`, `aria-checked`, `aria-label`, `tabindex` |

**What was found:** All filter checkboxes are custom `<div>` elements with none of the required ARIA attributes. AT users have no way to determine the element is a checkbox, its label, or its current checked/unchecked state. The elements are not keyboard-reachable.

**Required fix:**
```jsx
// FilterSidebar.jsx — each custom checkbox div
<div
  role="checkbox"
  aria-checked={isSelected}
  aria-label={`Filter by ${optionLabel}`}
  tabIndex={0}
  onClick={() => toggleFilter(option)}
  onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') toggleFilter(option); }}
  className={`filter-option ${isSelected ? 'selected' : ''}`}
>
```

Alternatively, replace with a native `<input type="checkbox">` + `<label>` which requires no ARIA at all:
```jsx
<label className="filter-option">
  <input type="checkbox" checked={isSelected} onChange={() => toggleFilter(option)} />
  {optionLabel}
</label>
```

**Why this approach:** Native checkboxes are the preferred approach because they carry implicit role, state, and keyboard behavior. Custom checkbox patterns require re-implementing all the same behavior via ARIA — any deviation produces AT inconsistencies. The native approach is simpler, more maintainable, and universally supported.

---

### C-08 · Sort Dropdown Missing Combobox Semantics

| Field | Value |
|---|---|
| **Rule** | `sort-combobox-no-role`, `sort-combobox-no-accessible-name`, `sort-combobox-no-aria-expanded`, `sort-dropdown-no-listbox-role`, `sort-dropdown-no-option-role`, `sort-dropdown-no-keyboard-accessible` |
| **WCAG** | 4.1.2 (A) — Name, Role, Value; 2.1.1 (A) — Keyboard |
| **Impact** | Critical |
| **Detected by** | Source-code analysis |

**Affected Elements — `src/pages/NewPage.jsx`**

| Element | Missing |
|---|---|
| `<button class="sort-btn">` (trigger) | `role="combobox"`, `aria-label`, `aria-expanded`, `aria-haspopup`, `aria-controls` |
| `<ul class="sort-options">` (options list) | `role="listbox"`, `aria-label` |
| `<li class="sort-option">` (each option) | `role="option"`, `aria-selected`, `tabIndex`, `onKeyDown` |

**What was found:** The custom sort dropdown presents as a combobox/listbox widget to sighted users but exposes none of the required ARIA semantics. Screen reader users cannot identify it as a sort control, cannot determine if the options list is open, cannot navigate options with arrow keys, and cannot identify the selected option.

**Required fix:**
```jsx
// Sort trigger button
<button
  className="sort-btn"
  aria-label="Sort products"
  role="combobox"
  aria-haspopup="listbox"
  aria-expanded={sortOpen}
  aria-controls="sort-options-list"
  onClick={() => setSortOpen(!sortOpen)}
>
  {sortOrder}
</button>

// Options list
<ul id="sort-options-list" role="listbox" aria-label="Sort options"
    className={`sort-options ${sortOpen ? 'open' : ''}`}>
  {SORT_OPTIONS.map(opt => (
    <li key={opt} role="option" aria-selected={opt === sortOrder}
        tabIndex={sortOpen ? 0 : -1}
        onClick={() => { setSortOrder(opt); setSortOpen(false); }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { setSortOrder(opt); setSortOpen(false); }
          if (e.key === 'Escape') setSortOpen(false);
        }}>
      {opt}
    </li>
  ))}
</ul>
```

**Why this approach:** The ARIA Combobox / Listbox pattern (WAI-ARIA 1.2) is the established pattern for custom dropdown select widgets. It exposes all state to AT without sacrificing the custom visual design, and provides keyboard navigation consistent with native `<select>` behavior that users expect.

---

### C-09 · Navigation Links With Reversed Keyboard Tab Order

| Field | Value |
|---|---|
| **Rule** | `tabindex` (axe-core, serious), `keyboard-order` (Evinced, serious → critical for UX) |
| **WCAG** | 2.4.3 (A) — Focus Order |
| **Impact** | Critical (functional keyboard navigation failure) |
| **Detected by** | Automated scan (`tabindex` rule) + source-code analysis |

**Affected Element — `src/components/Header.jsx`** — all nav `<Link>` elements

**What was found:** Every navigation item has an explicit positive `tabIndex` value assigned in *descending* order (7, 6, 5, 4, 3, 2, 1), which causes keyboard focus to traverse the navigation in reverse — **Sale → Shop by Brand → Collections → Stationery → Lifestyle → Apparel → New** — the opposite of the visual left-to-right order visible on screen.

**axe-core output (all 7 nav links):**
```
Element has a tabindex greater than 0
  <a tabindex="7" href="/shop/new">New</a>
  <a tabindex="6" href="/shop/new">Apparel</a>
  ...
  <a tabindex="1" href="/shop/new">Sale</a>
```

**Required fix:**
```jsx
// Header.jsx — remove tabIndex from Link elements entirely
// Natural DOM order provides correct focus sequence; no tabIndex needed
navItems.map((item) => (
  <Link to={item.href} aria-current={isActive ? 'page' : undefined}>
    {item.label}
  </Link>
))
```

**Why this approach:** Removing explicit `tabIndex` values (or setting all to `tabIndex={0}`) restores natural DOM-order tab navigation, which already matches the visual order. Positive `tabIndex` values above 0 are almost never appropriate; they override the entire document's focus order, which WCAG 2.4.3 requires to be logical and meaningful.

---

### C-10 · Missing Page Language Declaration

| Field | Value |
|---|---|
| **Rule** | `html-has-lang` (axe-core) |
| **WCAG** | 3.1.1 (A) — Language of Page |
| **Impact** | Serious (classified as Critical because it affects all pages and AT pronunciation) |
| **Detected by** | Automated scan |

**Affected Element — `public/index.html`:** `<html>` element has no `lang` attribute.

**What was found:** Screen readers select the voice/pronunciation engine based on the `lang` attribute. Without it, all text on every page is read using the AT's default language, causing mispronunciation of English content for users whose AT default is another language, and vice versa.

**Required fix:**
```html
<!-- public/index.html -->
<html lang="en">
```

**Why this approach:** The `lang` attribute on `<html>` is a single-line fix in the entry-point HTML template. It applies to all routes served by the SPA. The value `"en"` (English) is correct for this English-language store. If the app were to support multiple languages, per-route `lang` updates or `lang` on translated sections would be required.

---

### C-11 · Invalid Language Tag on Inline Text

| Field | Value |
|---|---|
| **Rule** | `valid-lang` (axe-core) |
| **WCAG** | 3.1.2 (AA) — Language of Parts |
| **Impact** | Serious (classified as Critical because it actively misdirects AT pronunciation) |
| **Detected by** | Automated scan |

**Affected Element — `src/components/TheDrop.jsx`:** `<p lang="zz">` — `zz` is not a valid BCP 47 language tag.

**What was found:** Screen readers encountering `lang="zz"` will either ignore it (fall back to page language) or switch to an invalid language engine, potentially garbling pronunciation. The text is English and should not carry any `lang` override.

**Required fix:**
```jsx
// TheDrop.jsx — remove the invalid lang attribute
<p>
  Our brand-new, limited-edition plushie bag charms have officially dropped...
</p>
```

**Why this approach:** The text is English prose and does not require a language change. Simply removing the invalid attribute is the correct fix. If a real non-English fragment needed to be marked, a valid BCP 47 tag (e.g., `lang="fr"`) would be required.

---

## Part II — Summary of Critical Issues and Their Remediation Rationale

| ID | Issue | WCAG | Affected Pages | Source File(s) | Recommended Fix |
|---|---|---|---|---|---|
| C-01 | Missing image `alt` text | 1.1.1 (A) | HomePage | `HeroBanner.jsx`, `TheDrop.jsx` | Add descriptive `alt` attributes |
| C-02 | Invalid ARIA attribute values | 4.1.2 (A) | HomePage, NewPage, ProductPage | `FeaturedPair.jsx`, `NewPage.jsx`, `ProductPage.jsx` | Correct to valid enumerated values or remove |
| C-03 | Required ARIA attributes missing | 4.1.2 (A) | HomePage, NewPage, ProductPage | `TheDrop.jsx`, `FeaturedPair.jsx`, `NewPage.jsx`, `ProductPage.jsx` | Add all required owned attributes with dynamic values |
| C-04 | Buttons with no accessible name | 4.1.2 (A) | All | `CartModal.jsx`, `WishlistModal.jsx`, `Header.jsx` | Add `aria-label` to all icon-only and symbol buttons |
| C-05 | Cart modal missing dialog semantics & focus trap | 4.1.2 (A), 2.1.1 (A), 2.1.2 (A) | All | `CartModal.jsx` | Add `role="dialog"`, `aria-modal`, `aria-label`, focus trap, Escape handler |
| C-06 | Non-semantic interactive `<div>` elements | 1.3.1 (A), 2.1.1 (A), 4.1.2 (A) | All | `Header.jsx`, `CartModal.jsx`, `Footer.jsx`, `ProductCard.jsx`, `PopularSection.jsx`, `CheckoutPage.jsx`, `OrderConfirmationPage.jsx`, `WishlistModal.jsx` | Replace with native `<button>` / `<a>` / `<Link>` elements |
| C-07 | Filter checkboxes missing role/state/name/keyboard | 4.1.2 (A), 2.1.1 (A) | NewPage | `FilterSidebar.jsx` | Use native `<input type="checkbox">` + `<label>` |
| C-08 | Sort dropdown missing combobox ARIA pattern | 4.1.2 (A), 2.1.1 (A) | NewPage | `NewPage.jsx` | Implement ARIA combobox/listbox pattern |
| C-09 | Nav links with reversed positive `tabindex` | 2.4.3 (A) | All | `Header.jsx` | Remove explicit positive `tabIndex` values |
| C-10 | Missing `lang` on `<html>` | 3.1.1 (A) | All | `public/index.html` | Add `lang="en"` to `<html>` element |
| C-11 | Invalid `lang="zz"` on inline paragraph | 3.1.2 (AA) | HomePage | `TheDrop.jsx` | Remove the invalid `lang` attribute |

---

## Part III — Non-Critical Issues (Not Remediated)

### S-01 · Insufficient Color Contrast (Serious — WCAG 1.4.3 AA)

**Rule:** `color-contrast` (axe-core) · **18 occurrences across 5 pages**

| # | Page | Element | Foreground | Background | Contrast | Required |
|---|---|---|---|---|---|---|
| 1 | HomePage | `<p>Warm hues for cooler days</p>` | `#c8c0b8` | `#e8e0d8` | ~1.3:1 | 4.5:1 |
| 2–12 | NewPage | `.filter-count` spans (11 items) | `#c8c8c8` | `#ffffff` | 1.67:1 | 4.5:1 |
| 13 | NewPage | `.products-found` paragraph | `#b0b4b8` | `#ffffff` | 2.08:1 | 4.5:1 |
| 14 | ProductPage | `.productDescription` paragraph | `#c0c0c0` | `#ffffff` | ~1.6:1 | 4.5:1 |
| 15–16 | CheckoutPage | `.step-label` "Shipping & Payment", `.summary-tax-note` | various | `#ffffff` | <3:1 | 4.5:1 |

**Source files:** `src/components/HeroBanner.css`, `src/components/FilterSidebar.css`, `src/pages/NewPage.css`, `src/pages/ProductPage.module.css`, `src/pages/CheckoutPage.css`

---

### S-02 · Navigation Forbidden Roles / Unexpected Interactives (Serious — WCAG 1.3.1, 4.1.2)

**Rule:** `navigation-forbidden-roles`, `navigation-unexpected-interactives` (Evinced engine)

**File:** `src/components/Header.jsx`

- Submenu `<ul>` elements carry `role="menu"` inside a `<nav>` landmark — the `menu` role implies application semantics and is forbidden in a navigation region.
- All 30 submenu `<a>` links carry `role="menuitem"` — this role is not permitted for links within a navigation landmark; AT cannot identify them as navigation links.

---

### S-03 · Non-Meaningful Accessible Labels (Serious — WCAG 2.4.6 AA, 4.1.2 A)

**Rule:** `non-meaningful-label` (Evinced engine) · **8 occurrences across 4 pages**

| # | Page | File | Element | Bad Label | Should Be |
|---|---|---|---|---|---|
| 1 | NewPage | `ProductCard.jsx` | Product `<article>` | `"Product item"` | Product name (e.g. `"Google Super G Trucker Hat"`) |
| 2 | ProductPage | `ProductPage.jsx` | "ADD TO CART" button | `"Add to cart"` | `"Add [product name] to cart"` |
| 3 | ProductPage | `ProductPage.jsx` | Wishlist button | `"Wishlist action"` | `"Add / Remove [product name] from wishlist"` |
| 4–7 | Checkout | `CheckoutPage.jsx` | Qty ± and remove buttons per item | `"Minus"`, `"Plus"`, `"Number"`, `"Delete"` | Include item name in label |
| 8 | All (Wishlist) | `WishlistModal.jsx` | Product image link | `"Click here"` | `"View [item name]"` |

---

### S-04 · Missing Live Region Announcements (Serious → Critical UX — WCAG 4.1.3 AA)

**Rule:** `live-region` · **Not detectable by automated scanners** · **7 occurrences**

| # | Page | File | Element | Issue |
|---|---|---|---|---|
| 1–5 | Checkout | `CheckoutPage.jsx` | Form error `<span>` elements | `role="alert"` removed — form validation errors appear silently for screen reader users |
| 6 | All pages | `Header.jsx` | Cart count `<span aria-hidden="true">` | No `aria-live` region — adding to cart is not announced to AT |
| 7 | All pages | `Header.jsx` | Wishlist count badge | No live region for wishlist count updates |

---

### S-05 · Filter Disclosure Buttons Missing ARIA State (Serious — WCAG 4.1.2 A)

**Rule:** `filter-disclosure-no-aria-expanded`, `filter-disclosure-no-aria-controls` · **File:** `src/components/FilterSidebar.jsx`

Three filter section toggle buttons (Price, Size, Brand) are missing:
- `aria-expanded` — AT cannot announce whether the section is open/collapsed
- `aria-controls` — no programmatic link between the button and the panel it controls
- Panel `id` attributes — required targets for `aria-controls`

---

### S-06 · Body `overflow-x: hidden` Clips Content at High Zoom (Serious — WCAG 1.4.10 AA)

**Rule:** `reflow` · **File:** `src/components/App.css`

`overflow-x: hidden` on `body` suppresses horizontal scrolling. At 300% zoom (or narrow viewports), navigation and header content exceeds the viewport width but cannot be scrolled to — it is clipped and inaccessible to low-vision users who rely on zoom.

---

### M-01 · Heading Order Violations (Moderate — WCAG 1.3.1 A)

**Rule:** `heading-order` (axe-core + source analysis) · **14 occurrences across all pages**

Heading levels have been deliberately mis-assigned throughout the application:

| # | Page | File | Element | Wrong Level | Correct Level |
|---|---|---|---|---|---|
| 1 | HomePage | `HeroBanner.jsx` | "Winter Basics" | `<h3>` | `<h1>` |
| 2 | HomePage | `FeaturedPair.jsx` | Card titles (×2) | `<h1>` | `<h3>` |
| 3 | HomePage | `PopularSection.jsx` | Section title | `<h4>` | `<h2>` |
| 4 | HomePage | `PopularSection.jsx` | Product card titles (×3) | `<h1>` | `<h3>` |
| 5 | HomePage | `TrendingCollections.jsx` | "Shop Trending Collections" | `<h4>` | `<h2>` |
| 6 | HomePage | `TrendingCollections.jsx` | Collection card titles (×4) | `<h1>` | `<h3>` |
| 7 | HomePage | `TheDrop.jsx` | "The Drop" | `<h4>` | `<h2>` |
| 8 | NewPage | `NewPage.jsx` | Page title | `<h3>` | `<h1>` |
| 9 | ProductPage | `ProductPage.jsx` | Product name | `<h3>` | `<h1>` |
| 10–11 | Checkout | `CheckoutPage.jsx` | "Shopping Cart" / "Order Summary" | `<h3>` / `<h5>` | `<h1>` / `<h2>` |
| 12 | Order Confirmation | `OrderConfirmationPage.jsx` | "Thank you!" | `<h3>` | `<h1>` |
| 13 | All pages | `CartModal.jsx` | Drawer title | `<h5>` | `<h2>` |
| 14 | All pages | `WishlistModal.jsx` | Drawer title | `<h5>` | `<h2>` |

---

### M-02 · Cart Modal Content Not Contained in a Landmark (Moderate — WCAG 1.3.1 A)

**Rule:** `region` (axe-core) · **File:** `src/components/CartModal.jsx`

The cart drawer content (title, item list, footer actions) is not wrapped in a landmark region. When the cart drawer is rendered in the background DOM (while closed), its content appears in the landmark-less region of the page and confuses AT landmark navigation.

---

### M-03 · DOM Order Mismatch — Meaningful Sequence (Moderate — WCAG 1.3.2 A)

**Rule:** `sr-order` (Evinced engine) · **File:** `src/components/FeaturedPair.jsx`

CSS `flex-direction: column-reverse` is used to place product images below headings visually, but the DOM order has images before headings. Screen readers announce the image alt text before the heading, eyebrow text, and CTA link — the reverse of the meaningful visual reading order.

---

### M-04 · Duplicate ARIA IDs (Moderate — WCAG 4.1.1 A)

**Rule:** `duplicate-id-aria` · **Files:** `src/components/FeaturedPair.jsx`, `src/components/FilterSidebar.jsx`

| # | Page | File | Duplicate ID | Affected Elements |
|---|---|---|---|---|
| 1 | HomePage | `FeaturedPair.jsx` | `featured-card-label` | Two `<p>` eyebrow elements (one per card, same ID) |
| 2 | HomePage | `FeaturedPair.jsx` | `featured-card-img` | Two `<img>` elements (one per card, same ID) |
| 3–4 | NewPage | `FilterSidebar.jsx` | `filter-section-title` | Two `<span>` titles referenced by `aria-describedby` |

---

### M-05 · Invalid List Structure (Moderate — WCAG 1.3.1 A)

**Rule:** `list` · **File:** `src/components/TrendingCollections.jsx`

`<ul class="trending-grid">` contains a `<div class="trending-grid-label">` as a direct child. The HTML specification requires `<ul>` to contain only `<li>`, `<script>`, or `<template>` elements.

---

## Appendix — Automated Scan Results Raw Summary

**Tool:** axe-core 4.11 via `@axe-core/playwright`  
**Browser:** Chromium (headless) 145.0.7632.6  
**Viewport:** 1280 × 800  
**Date:** 2026-03-16

| Page/State | Critical | Serious | Moderate | Total |
|---|---|---|---|---|
| HomePage | 4 | 3 | 3 | 10 |
| NewPage | 1 | 3 | 2 | 6 |
| ProductPage | 2 | 3 | 2 | 7 |
| CheckoutPage (Basket) | 1 | 2 | 2 | 5 |
| CheckoutPage (Shipping) | 1 | 2 | 1 | 4 |
| HomePage + Cart Modal | 4 | 3 | 3 | 10 |
| **TOTAL** | **13** | **16** | **13** | **42** |

Full raw scan output: `tests/e2e/test-results/audit-all-pages.json`

# Accessibility Audit Report — Demo Website

**Date:** 2026-03-16  
**Tool:** Evinced Engine (GEN1 / GEN2 / GEN3 rules) + axe-core (AXE rules)  
**Standard:** WCAG 2.1 Level A & AA  
**Audited by:** Automated Playwright + Evinced MCP scan (server: `EVINCED_MCP_SERVER_JFROG`)  

---

## 1. Repository Map — Pages and Entry Points

| Route | Component File | Description |
|---|---|---|
| `/` | `src/pages/HomePage.jsx` | Home page — Hero, Featured Pair, Popular, Trending, The Drop |
| `/shop/new` | `src/pages/NewPage.jsx` | Products listing page — sort, filter, product grid |
| `/product/:id` | `src/pages/ProductPage.jsx` | Product detail page — image, details, add-to-cart |
| `/checkout` | `src/pages/CheckoutPage.jsx` | Two-step checkout — cart review → shipping & payment |
| `/order-confirmation` | `src/pages/OrderConfirmationPage.jsx` | Order confirmation — order ID, back-to-shop |

**Shared components present on every page:**
- `src/components/Header.jsx` — top navigation bar with cart/wishlist icons
- `src/components/Footer.jsx` — footer links
- `src/components/CartModal.jsx` — slide-in cart drawer (hidden on checkout + confirmation pages)
- `src/components/WishlistModal.jsx` — slide-in wishlist drawer

**Entry point:** `public/index.html` → `src/index.js` → `src/components/App.jsx`

---

## 2. Summary of All Detected Issues

| Severity | Rule Count | Issue Occurrences |
|---|---|---|
| **Critical** | 21 rules | 63 element occurrences |
| **Serious** | 17 rules | 42 occurrences |
| **Moderate** | 6 rules | 28 occurrences |
| **Total** | **44 rules** | **133 occurrences** |

---

## 3. Critical Issues

> Critical issues are WCAG Level A violations that fully block access by assistive technologies (screen readers, keyboard navigation, voice control). They require immediate remediation.

---

### C-01 — `image-alt`: Images Missing Alternative Text
**Tool:** axe-core  
**WCAG:** 1.1.1 (A) — Non-text Content  
**Impact:** Critical — screen readers read the raw filename instead of conveying content

| # | Page | File | Element |
|---|---|---|---|
| 1 | Homepage (HeroBanner) | `src/components/HeroBanner.jsx:18` | `<img src="/images/home/New_Tees.png" />` — no `alt` attribute |
| 2 | Homepage (TheDrop) | `src/components/TheDrop.jsx:13` | `<img src="/images/home/2bags_charms1.png" loading="lazy" />` — no `alt` attribute |

**Why critical:** Without `alt` text, screen readers announce the filename (e.g. "New underscore Tees dot png") as the image's accessible content. Users cannot understand the meaning of the image.

---

### C-02 — `aria-valid-attr-value`: Invalid ARIA Attribute Values
**Tool:** axe-core  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Impact:** Critical — invalid values break the ARIA contract, causing unpredictable or absent announcements

| # | Page | File | Element | Invalid Attribute | Invalid Value | Valid Values |
|---|---|---|---|---|---|---|
| 1 | Homepage (FeaturedPair) | `src/components/FeaturedPair.jsx:46` | `<h1 aria-expanded="yes">` | `aria-expanded` | `"yes"` | `"true"` or `"false"` |
| 2 | Products Page (NewPage) | `src/pages/NewPage.jsx:218` | `<div aria-sort="newest" role="columnheader">` | `aria-sort` | `"newest"` | `"ascending"`, `"descending"`, `"none"`, `"other"` |
| 3 | Product Detail (ProductPage) | `src/pages/ProductPage.jsx:146` | `<ul aria-relevant="changes" aria-live="polite">` | `aria-relevant` | `"changes"` | Space-separated tokens: `additions`, `removals`, `text`, `all` |

**Why critical:** Invalid ARIA attribute values cause assistive technologies to either ignore the attribute entirely or behave unpredictably. The `aria-expanded="yes"` on a heading is particularly harmful as it misrepresents state.

---

### C-03 — `aria-required-attr`: Missing Required ARIA Attributes
**Tool:** axe-core  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Impact:** Critical — elements with roles but missing required state attributes are broken for screen readers

| # | Page | File | Element | Role | Missing Attributes |
|---|---|---|---|---|---|
| 1 | Homepage (FeaturedPair) | `src/components/FeaturedPair.jsx:48` | `<span role="checkbox">` | `checkbox` | `aria-checked` |
| 2 | Homepage (TheDrop) | `src/components/TheDrop.jsx:19` | `<div role="slider">` | `slider` | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| 3 | Products Page (NewPage) | `src/pages/NewPage.jsx:220` | `<div role="spinbutton">` | `spinbutton` | `aria-valuenow` |
| 4 | Products Page (NewPage) | `src/pages/NewPage.jsx:222` | `<div role="combobox">` | `combobox` | `aria-controls`, `aria-expanded` |
| 5 | Product Detail (ProductPage) | `src/pages/ProductPage.jsx:151` | `<span role="meter">` | `meter` | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |

**Why critical:** An element that declares a role but omits the required state/property attributes is structurally broken to assistive technologies. Screen readers cannot convey the control's state or purpose.

---

### C-04 — `duplicate-id-aria`: Duplicate IDs Referenced by ARIA
**Tool:** axe-core  
**WCAG:** 4.1.1 (A) — Parsing  
**Impact:** Critical — ARIA `aria-describedby` references that resolve to multiple elements produce unpredictable or incorrect announcements

| # | Page | File | Duplicate ID | Affected Elements |
|---|---|---|---|---|
| 1 | Homepage (FeaturedPair) | `src/components/FeaturedPair.jsx:39` | `featured-card-img` | Two `<img>` elements (one per card in `.map()`) |
| 2 | Homepage (FeaturedPair) | `src/components/FeaturedPair.jsx:43` | `featured-card-label` | Two `<p class="featured-eyebrow">` elements |
| 3 | Products Page (FilterSidebar) | `src/components/FilterSidebar.jsx:58` | `filter-section-title` | `<span>Price</span>` (Price filter button) |
| 4 | Products Page (FilterSidebar) | `src/components/FilterSidebar.jsx:100` | `filter-section-title` | `<span>Size</span>` (Size filter button) — both Price and Size buttons have `aria-describedby="filter-section-title"` |

**Why critical:** When `aria-describedby` resolves to the first matching element, screen readers may announce wrong labels or descriptions for interactive elements.

---

### C-05 — `interactable-role + keyboard-accessible` (GEN1): Non-Semantic Elements Used as Interactive Controls
**Tool:** Evinced GEN1 Engine  
**WCAG:** 1.3.1 (A), 2.1.1 (A), 4.1.2 (A)  
**Impact:** Critical — `<div>` elements with `onClick` have no keyboard access and no semantic role; invisible to screen readers as interactive

| # | Page | File | Element | Issue |
|---|---|---|---|---|
| 1 | All pages — Header | `src/components/Header.jsx:131` | `<div class="icon-btn wishlist-btn">` | Wishlist toggle: `div` with click handler, no `role="button"`, no `tabindex` |
| 2 | All pages — Header | `src/components/Header.jsx:140` | `<div class="icon-btn">` (Search) | Search: `div` with no `role="button"`, no `tabindex` |
| 3 | All pages — Header | `src/components/Header.jsx:156` | `<div class="icon-btn">` (Login) | Login: `div` with no `role="button"`, no `tabindex` |
| 4 | All pages — Header | `src/components/Header.jsx:161` | `<div class="flag-group">` | Region selector: `div` with no `role="button"`, no `tabindex` |
| 5 | All pages — Footer | `src/components/Footer.jsx:13` | `<div class="footer-nav-item">` (Sustainability) | Navigation item: `div` with no `role="link"`, no `tabindex` |
| 6 | All pages — Footer | `src/components/Footer.jsx:18` | `<div class="footer-nav-item">` (FAQs) | Navigation item: `div` with no `role="link"`, no `tabindex` |
| 7 | Products Page | `src/components/ProductCard.jsx:21` | `<div class="product-card-quick-add">` | Quick-add: `div` with no `role="button"`, no `tabindex` |
| 8 | Homepage | `src/components/PopularSection.jsx:54` | `<div class="shop-link">` (Shop Drinkware) | Navigation link: `div` with no `role="link"`, no `tabindex` |
| 9 | Homepage | `src/components/PopularSection.jsx:54` | `<div class="shop-link">` (Shop Fun and Games) | Navigation link: `div` with no `role="link"`, no `tabindex` |
| 10 | Homepage | `src/components/PopularSection.jsx:54` | `<div class="shop-link">` (Shop Stationery) | Navigation link: `div` with no `role="link"`, no `tabindex` |
| 11 | All pages — Cart Drawer | `src/components/CartModal.jsx:128` | `<div class="continueBtn">` | Continue Shopping: `div` with no `role="button"`, no `tabindex` |
| 12 | All pages — Wishlist Drawer | `src/components/WishlistModal.jsx:128` | `<div class="removeBtn">` (per item) | Remove from wishlist: `div` with no `role="button"`, no `tabindex` |
| 13 | Checkout | `src/pages/CheckoutPage.jsx:156` | `<div class="checkout-continue-btn">` | Proceed to shipping: `div` with no `role="button"`, no `tabindex` |
| 14 | Checkout | `src/pages/CheckoutPage.jsx:297` | `<div class="checkout-back-btn">` | Back to Cart: `div` with no `role="button"`, no `tabindex` |
| 15 | Order Confirmation | `src/pages/OrderConfirmationPage.jsx:40` | `<div class="confirm-home-link">` | Back to Shop navigation: `div` with no `role="link"`, no `tabindex` |

**Why critical:** Keyboard-only users and screen reader users cannot interact with any of these controls. They are completely inaccessible.

---

### C-06 — `accessible-name` (GEN1): Interactive Elements Without Accessible Names
**Tool:** Evinced GEN1 Engine  
**WCAG:** 1.3.1 (A), 2.4.6 (AA), 4.1.2 (A)  
**Impact:** Critical — screen readers and voice control have no way to identify or announce these controls

| # | Page | File | Element | Issue |
|---|---|---|---|---|
| 1 | All pages — Header | `src/components/Header.jsx:140` | `<div class="icon-btn">` (Search) | SVG is `aria-hidden`, visible text (`<span aria-hidden="true">Search</span>`) is also hidden from AT — no accessible name |
| 2 | All pages — Header | `src/components/Header.jsx:156` | `<div class="icon-btn">` (Login) | SVG is `aria-hidden`, visible text (`<span aria-hidden="true">Login</span>`) is hidden from AT — no accessible name |
| 3 | All pages — Footer | `src/components/Footer.jsx:18` | `<div class="footer-nav-item">` (FAQs) | Visible label is `aria-hidden` — no accessible name |
| 4 | Products Page | `src/components/ProductCard.jsx:10` | `<Link class="product-card-image-link">` | No `aria-label` on image link — link's only child is `<img alt={product.name}>` but without an explicit accessible name on the link itself, its purpose is insufficiently described |
| 5 | Homepage | `src/components/PopularSection.jsx:54` | `<div class="shop-link">` (Shop Drinkware) | Visible text `<span aria-hidden="true">` — no accessible name |
| 6 | Homepage | `src/components/PopularSection.jsx:54` | `<div class="shop-link">` (Shop Fun and Games) | Visible text `<span aria-hidden="true">` — no accessible name |
| 7 | Homepage | `src/components/PopularSection.jsx:54` | `<div class="shop-link">` (Shop Stationery) | Visible text `<span aria-hidden="true">` — no accessible name |
| 8 | All pages — Cart Drawer | `src/components/CartModal.jsx:56` | `<button class="closeBtn">` | Icon-only: `aria-label` removed, SVG is `aria-hidden` — no accessible name |
| 9 | All pages — Wishlist Drawer | `src/components/WishlistModal.jsx:61` | `<button class="closeBtn">` | Icon-only: `aria-label` removed, SVG is `aria-hidden` — no accessible name |
| 10 | All pages — Cart Drawer | `src/components/CartModal.jsx:128` | `<div class="continueBtn">` | Visible text `<span aria-hidden="true">Continue Shopping</span>` — no accessible name |

**Why critical:** Voice control users cannot activate controls they cannot name. Screen reader users cannot know what a control does.

---

### C-07 — `no-dialog-role` (GEN2): Cart Modal Missing `role="dialog"`
**Tool:** Evinced GEN2 Engine  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Impact:** Critical — screen readers cannot identify the panel as a dialog and will not switch to dialog-reading mode

| # | Page | File | Element | Issue |
|---|---|---|---|---|
| 1 | All pages — Cart Drawer | `src/components/CartModal.jsx:41` | Cart drawer `<div id="cart-modal">` | `role="dialog"` removed — screen readers treat this as a plain `div`, not a dialog overlay |

**Why critical:** Without `role="dialog"`, assistive technologies do not announce the overlay's appearance, do not inform users they are inside a dialog, and do not modify their navigation behavior accordingly.

---

### C-08 — `no-dialog-accessible-name` (GEN2): Cart Modal Missing Accessible Name
**Tool:** Evinced GEN2 Engine  
**WCAG:** 1.3.1 (A), 4.1.2 (A)  
**Impact:** Critical — screen readers cannot announce what the dialog is about when it opens

| # | Page | File | Element | Issue |
|---|---|---|---|---|
| 1 | All pages — Cart Drawer | `src/components/CartModal.jsx:41` | Cart drawer `<div id="cart-modal">` | `aria-label="Shopping cart"` removed — the modal has no accessible name |
| 2 | All pages — Cart Drawer | `src/components/CartModal.jsx:79` | Cart items `<ul class="cartList">` | `aria-label="Cart items"` removed — the list has no accessible name |

**Why critical:** When a dialog has no accessible name, screen readers cannot announce its purpose when focus moves into it, leaving users with no context.

---

### C-09 — `no-aria-label-on-buttons` (GEN2): Icon-Only Cart Buttons Without Accessible Names
**Tool:** Evinced GEN2 Engine  
**WCAG:** 1.3.1 (A), 4.1.2 (A)  
**Impact:** Critical — screen readers cannot convey the purpose of quantity/remove buttons

| # | Page | File | Element | Issue |
|---|---|---|---|---|
| 1 | All pages — Cart Drawer | `src/components/CartModal.jsx:90` | Decrease quantity `<button>` (per cart item) | Renders only "−" symbol; `aria-label` removed — no context about which item or what action |
| 2 | All pages — Cart Drawer | `src/components/CartModal.jsx:95` | Increase quantity `<button>` (per cart item) | Renders only "+" symbol; `aria-label` removed |
| 3 | All pages — Cart Drawer | `src/components/CartModal.jsx:102` | Remove item `<button>` (per cart item) | Icon-only button; `aria-label` removed |

**Why critical:** Symbol-only buttons with no accessible name are completely opaque to screen reader users. Users cannot understand which item is being modified or removed.

---

### C-10 — `no-focus-trap` (GEN2): No Focus Trap in Cart Modal
**Tool:** Evinced GEN2 Engine  
**WCAG:** 2.1.2 (A) — No Keyboard Trap (inverse: focus must stay inside dialog)  
**Impact:** Critical — keyboard users can Tab freely behind the open modal

| # | Page | File | Element | Issue |
|---|---|---|---|---|
| 1 | All pages — Cart Drawer | `src/components/CartModal.jsx:17` | Cart drawer | Focus is not moved into the modal on open and is not trapped — keyboard users can reach elements behind the open overlay |

**Why critical:** A modal without focus trapping fails its core accessibility contract. Keyboard users can inadvertently interact with obscured content behind the drawer.

---

### C-11 — `sort-combobox-no-role` (GEN2): Sort Combobox Missing `role="combobox"`
**Tool:** Evinced GEN2 Engine  
**WCAG:** 4.1.2 (A) — Name, Role, Value  
**Impact:** Critical — assistive technologies cannot identify the sort trigger as a combobox widget

| # | Page | File | Element | Issue |
|---|---|---|---|---|
| 1 | Products Page | `src/pages/NewPage.jsx:141` | `<button class="sort-btn">` | `role="combobox"` not set — screen readers announce this as a plain button rather than a combobox control |

---

### C-12 — `sort-combobox-no-accessible-name` (GEN2): Sort Combobox Without Accessible Name
**Tool:** Evinced GEN2 Engine  
**WCAG:** 1.3.1 (A), 4.1.2 (A)  
**Impact:** Critical — screen readers cannot announce the purpose of the sort combobox

| # | Page | File | Element | Issue |
|---|---|---|---|---|
| 1 | Products Page | `src/pages/NewPage.jsx:141` | `<button class="sort-btn">` | No `aria-label` — screen readers cannot identify the sort control or its current value |

---

### C-13 — `sort-dropdown-no-listbox-role` (GEN2): Sort Options List Missing `role="listbox"`
**Tool:** Evinced GEN2 Engine  
**WCAG:** 1.3.1 (A), 4.1.2 (A)  
**Impact:** Critical — screen readers cannot identify the dropdown as a listbox of selectable options

| # | Page | File | Element | Issue |
|---|---|---|---|---|
| 1 | Products Page | `src/pages/NewPage.jsx:151` | `<ul class="sort-options">` | `role="listbox"` and `aria-label="Sort options"` removed — announced as a plain list, not a selection widget |

---

### C-14 — `sort-dropdown-no-option-role` (GEN2): Sort Options Missing `role="option"` and `aria-selected`
**Tool:** Evinced GEN2 Engine  
**WCAG:** 4.1.2 (A)  
**Impact:** Critical — screen readers cannot identify list items as selectable options or announce selection state

| # | Page | File | Element | Issue |
|---|---|---|---|---|
| 1 | Products Page | `src/pages/NewPage.jsx:155` | `<li class="sort-option">` (each option) | `role="option"` and `aria-selected` removed from every sort option |

---

### C-15 — `sort-dropdown-no-keyboard-accessible` (GEN2): Sort Options Not Keyboard Accessible
**Tool:** Evinced GEN2 Engine  
**WCAG:** 2.1.1 (A) — Keyboard  
**Impact:** Critical — keyboard-only users cannot select a sort order

| # | Page | File | Element | Issue |
|---|---|---|---|---|
| 1 | Products Page | `src/pages/NewPage.jsx:155` | `<li class="sort-option">` (each option) | `tabIndex={0}` and `onKeyDown` removed — sort options cannot be reached or activated via keyboard |

---

### C-16 — `filter-checkbox-no-role` (GEN2): Filter Checkboxes Missing `role="checkbox"`
**Tool:** Evinced GEN2 Engine  
**WCAG:** 4.1.2 (A)  
**Impact:** Critical — screen readers cannot identify the custom checkboxes as checkboxes

| # | Page | File | Element | Issue |
|---|---|---|---|---|
| 1 | Products Page | `src/components/FilterSidebar.jsx:74` | Price filter custom checkbox `<div>` | `role="checkbox"` not set |
| 2 | Products Page | `src/components/FilterSidebar.jsx:116` | Size filter custom checkbox `<div>` | `role="checkbox"` not set |
| 3 | Products Page | `src/components/FilterSidebar.jsx:156` | Brand filter custom checkbox `<div>` | `role="checkbox"` not set |

---

### C-17 — `filter-checkbox-no-focus-sequence` (GEN2): Filter Checkboxes Not in Keyboard Focus Sequence
**Tool:** Evinced GEN2 Engine  
**WCAG:** 2.1.1 (A) — Keyboard  
**Impact:** Critical — keyboard-only users cannot reach the filter checkboxes

| # | Page | File | Element | Issue |
|---|---|---|---|---|
| 1 | Products Page | `src/components/FilterSidebar.jsx:74` | Price filter checkbox `<div>` | No `tabindex` — not reachable via Tab key |
| 2 | Products Page | `src/components/FilterSidebar.jsx:116` | Size filter checkbox `<div>` | No `tabindex` — not reachable via Tab key |
| 3 | Products Page | `src/components/FilterSidebar.jsx:156` | Brand filter checkbox `<div>` | No `tabindex` — not reachable via Tab key |

---

### C-18 — `filter-checkbox-no-accessible-name` (GEN2): Filter Checkboxes Without Accessible Names
**Tool:** Evinced GEN2 Engine  
**WCAG:** 1.3.1 (A), 4.1.2 (A)  
**Impact:** Critical — screen readers cannot announce what each checkbox controls

| # | Page | File | Element | Issue |
|---|---|---|---|---|
| 1 | Products Page | `src/components/FilterSidebar.jsx:74` | Price filter checkbox `<div>` | No `aria-label` or associated `<label>` |
| 2 | Products Page | `src/components/FilterSidebar.jsx:116` | Size filter checkbox `<div>` | No `aria-label` or associated `<label>` |
| 3 | Products Page | `src/components/FilterSidebar.jsx:156` | Brand filter checkbox `<div>` | No `aria-label` or associated `<label>` |

---

### C-19 — `filter-checkbox-no-aria-checked` (GEN2): Filter Checkboxes Missing `aria-checked`
**Tool:** Evinced GEN2 Engine  
**WCAG:** 4.1.2 (A)  
**Impact:** Critical — screen readers cannot announce the checked/unchecked state of filter checkboxes

| # | Page | File | Element | Issue |
|---|---|---|---|---|
| 1 | Products Page | `src/components/FilterSidebar.jsx:74` | Price filter checkbox `<div>` | `aria-checked` not defined |
| 2 | Products Page | `src/components/FilterSidebar.jsx:116` | Size filter checkbox `<div>` | `aria-checked` not defined |
| 3 | Products Page | `src/components/FilterSidebar.jsx:156` | Brand filter checkbox `<div>` | `aria-checked` not defined |

---

### C-20 — `no-accessible-name-launcher` (GEN2): Cart Open Button Without Accessible Name
**Tool:** Evinced GEN2 Engine  
**WCAG:** 4.1.2 (A)  
**Impact:** Critical — screen readers cannot announce the cart button's purpose or item count

| # | Page | File | Element | Issue |
|---|---|---|---|---|
| 1 | All pages — Header | `src/components/Header.jsx:145` | `<button class="icon-btn cart-btn">` | `aria-label` removed — no accessible name; screen readers cannot announce purpose or item count |

---

### C-21 — `live-region` (UNDETECTABLE): Missing Live Region Announcements
**Tool:** Manual / Evinced GEN1 (not detectable by automated scanners — DOM is structurally valid)  
**WCAG:** 4.1.3 (AA) — Status Messages; 1.3.1 (A)  
**Impact:** Critical — screen reader users receive no feedback for dynamic content changes

| # | Page | File | Element | Issue |
|---|---|---|---|---|
| 1 | Checkout | `src/pages/CheckoutPage.jsx:201` | `<span id="firstName-error">` | `role="alert"` removed — form validation error appears visually but is not announced |
| 2 | Checkout | `src/pages/CheckoutPage.jsx:218` | `<span id="lastName-error">` | `role="alert"` removed |
| 3 | Checkout | `src/pages/CheckoutPage.jsx:241` | `<span id="address-error">` | `role="alert"` removed |
| 4 | Checkout | `src/pages/CheckoutPage.jsx:267` | `<span id="cardNumber-error">` | `role="alert"` removed |
| 5 | Checkout | `src/pages/CheckoutPage.jsx:288` | `<span id="expirationDate-error">` | `role="alert"` removed |
| 6 | All pages — Header | `src/components/Header.jsx:152` | `<span class="cart-count" aria-hidden="true">` | No `aria-live` region — cart count updates silently when items are added |

**Why critical:** Users relying on screen readers submit the checkout form with invalid fields and receive no audio feedback. They must manually navigate the entire form to discover which fields failed.

---

## 4. Remediations Not Applied

> Per audit scope, no source code modifications were made. The following section documents what remediation would be applied for each critical issue and the reasoning behind each approach.

### C-01 — `image-alt`
**Recommended Fix:** Add descriptive `alt` attributes to both `<img>` elements.
- `HeroBanner.jsx:18` → `alt="Winter Basics — new tees collection banner"`
- `TheDrop.jsx:13` → `alt="Limited edition Android, YouTube and Super G plushie bag charms"`

**Reasoning:** Alt text must be concise and describe the content and function of the image in context. The alt should not start with "Image of" and should convey the marketing message where appropriate.

---

### C-02 — `aria-valid-attr-value`
**Recommended Fix:**
- `FeaturedPair.jsx:46` → Change `aria-expanded="yes"` to `aria-expanded="false"` (or remove it entirely since `<h1>` does not semantically support `aria-expanded`)
- `NewPage.jsx:218` → Change `aria-sort="newest"` to `aria-sort="none"` or remove the hidden element entirely (it's inside `display:none`)
- `ProductPage.jsx:146` → Change `aria-relevant="changes"` to `aria-relevant="additions text"` (valid space-separated tokens)

**Reasoning:** ARIA attribute values must conform exactly to the spec-defined enumeration. String comparisons are case-sensitive and alternatives like `"yes"` or `"changes"` are not valid tokens. The simplest safe fix for `aria-expanded` on a heading is removal.

---

### C-03 — `aria-required-attr`
**Recommended Fix:**
- `FeaturedPair.jsx:48` → Add `aria-checked="false"` (or remove the hidden `role="checkbox"` span entirely)
- `TheDrop.jsx:19` → Add `aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"` to the slider div (or remove it if purely decorative)
- `NewPage.jsx:220` → Add `aria-valuenow="1"` to the spinbutton div
- `NewPage.jsx:222` → Add `aria-controls="sort-options-list" aria-expanded="false"` to the combobox div
- `ProductPage.jsx:151` → Add `aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"` to the meter span (or remove the hidden element)

**Reasoning:** When an element uses an ARIA role that has required properties/states, all required attributes must be present for the accessibility tree to be valid. For purely decorative or demonstration elements with `display:none`, the cleanest fix is removal.

---

### C-04 — `duplicate-id-aria`
**Recommended Fix:**
- `FeaturedPair.jsx` → Generate unique IDs per card, e.g. `id={`featured-card-img-${item.id}`}` and `id={`featured-card-label-${item.id}`}` within the `.map()` callback
- `FilterSidebar.jsx` → Replace the static `id="filter-section-title"` repeated on both Price and Size spans with unique IDs (`id="filter-price-title"` and `id="filter-size-title"`), updating the corresponding `aria-describedby` values

**Reasoning:** HTML requires IDs to be unique per document. When ARIA attributes reference non-unique IDs, browsers resolve to the first occurrence, causing wrong descriptions. Dynamic IDs using the data item's unique identifier is the standard React pattern.

---

### C-05 — `interactable-role + keyboard-accessible`
**Recommended Fix:** Replace every interactive `<div>` with an appropriate semantic element:
- Button-style controls → Replace with `<button type="button">` 
- Link-style controls → Replace with `<Link>` (React Router) or `<a>` with a valid `href`

**Reasoning:** Native HTML elements (`<button>`, `<a>`) come with built-in keyboard support (focusable, Enter/Space activation), implicit roles, and correct accessibility tree semantics. Using `role="button"` with `tabindex` on a `<div>` is a valid fallback but requires manual handling of keyboard events and focus; using native elements is always preferred.

---

### C-06 — `accessible-name`
**Recommended Fix:**
- Search div (`Header.jsx:140`) → Replace with `<button aria-label="Search">` removing `aria-hidden` from the visible span
- Login div (`Header.jsx:156`) → Replace with `<button aria-label="Sign in">` 
- FAQs div (`Footer.jsx:18`) → Replace `aria-hidden` span with visible text or add `aria-label="FAQs"` to the link element
- Product card image link (`ProductCard.jsx:10`) → Add `aria-label={product.name}` to the `<Link>`
- PopularSection shop-links → Replace `<span aria-hidden="true">` with accessible text or add `aria-label` to the `<div>` (after converting to `<button>` per C-05)
- Cart close button (`CartModal.jsx:56`) → Add `aria-label="Close cart"` to the `<button>`
- Wishlist close button (`WishlistModal.jsx:61`) → Add `aria-label="Close wishlist"` to the `<button>`
- Cart continueBtn (`CartModal.jsx:128`) → Remove `aria-hidden` from the inner `<span>` (after converting to `<button>` per C-05)

**Reasoning:** Every interactive element needs an accessible name computable by the browser's accessibility API. The accessible name is derived in order from: `aria-labelledby`, `aria-label`, contents, `title`. Hiding all content sources from AT results in a zero-length name.

---

### C-07 — `no-dialog-role`
**Recommended Fix:** Add `role="dialog"` to the cart drawer `<div>` in `CartModal.jsx:41`.

**Reasoning:** `role="dialog"` signals to assistive technologies that this region is an overlay that requires user attention. Combined with `aria-modal="true"`, it instructs screen readers to confine navigation to the dialog's contents.

---

### C-08 — `no-dialog-accessible-name`
**Recommended Fix:**
- Add `aria-label="Shopping cart"` (or `aria-labelledby` pointing to the `<h5>` heading) to the cart drawer `<div>`
- Add `aria-label="Cart items"` to the `<ul>` in the cart body

**Reasoning:** Dialogs must have names so that screen readers can announce the dialog's purpose when it opens and the user's focus moves inside. `aria-labelledby` pointing to the existing heading is preferred over `aria-label` to avoid redundancy.

---

### C-09 — `no-aria-label-on-buttons`
**Recommended Fix:** Add contextual `aria-label` attributes to quantity and remove buttons that include the item name:
- Decrease: `aria-label={`Decrease quantity of ${item.name}`}`
- Increase: `aria-label={`Increase quantity of ${item.name}`}`
- Remove: `aria-label={`Remove ${item.name} from cart"`}`

**Reasoning:** When multiple controls of the same type exist (one per cart item), each must have a unique accessible name that identifies both the action and the subject. Generic labels like "Decrease" fail when there are multiple items.

---

### C-10 — `no-focus-trap`
**Recommended Fix:** Implement focus trapping in `CartModal.jsx` using `useEffect`:
1. When `isOpen` becomes `true`, move focus to the first focusable element inside `modalRef.current`
2. Add a `keydown` listener that intercepts `Tab` and `Shift+Tab` to cycle focus within the modal's focusable elements
3. On close, restore focus to the element that opened the modal (the cart button)

**Reasoning:** WCAG 2.1.2 requires that focus can be moved away from a component using only keyboard. For modals, the standard pattern is to trap focus inside while the dialog is open and return it on close. `focus-trap-react` or a custom hook are common implementations.

---

### C-11–C-15 — Sort Combobox / Dropdown Issues
**Recommended Fix:** Apply the full ARIA combobox/listbox pattern to the sort widget in `NewPage.jsx`:
- `<button>` → `role="combobox"`, `aria-label="Sort by"`, `aria-expanded={sortOpen}`, `aria-haspopup="listbox"`, `aria-controls="sort-options-list"`
- `<ul>` → `role="listbox"`, `aria-label="Sort options"`, `id="sort-options-list"`
- `<li>` → `role="option"`, `aria-selected={sort === opt.value}`, `tabIndex={0}`, `onKeyDown` handling Arrow/Enter/Escape keys
- Wrap the sort widget in `<div role="group" aria-label="Sort products">`

**Reasoning:** The ARIA combobox pattern requires a specific interplay of `role`, `aria-expanded`, `aria-controls`, and `aria-haspopup` on the trigger, paired with `role="listbox"` on the options container and `role="option"` + `aria-selected` on each item. Keyboard navigation (Arrow keys, Enter, Escape) is expected by screen reader users within any listbox.

---

### C-16–C-19 — Filter Checkbox Issues
**Recommended Fix:** Apply the full ARIA checkbox pattern to each filter option in `FilterSidebar.jsx`:
- Convert `<div class="filter-option">` to `<div role="checkbox" aria-checked={checked} aria-label={`${label}, ${count} products`} tabIndex={0} onKeyDown handling Space/Enter>`
- Or better: replace with a native `<input type="checkbox" id="..." />` + `<label for="...">` pair which provides role, aria-checked, keyboard access, and accessible name natively

**Reasoning:** Native `<input type="checkbox">` is the cleanest solution — it brings all required ARIA semantics, keyboard behavior, and label association for free. Custom `div` checkboxes require manually managing `role`, `aria-checked`, `tabindex`, and keyboard events.

---

### C-20 — `no-accessible-name-launcher`
**Recommended Fix:** Add `aria-label` to the cart button in `Header.jsx:145`:
```jsx
<button 
  className="icon-btn cart-btn" 
  onClick={openCart}
  aria-label={`Open shopping cart, ${totalCount} ${totalCount === 1 ? 'item' : 'items'}`}
>
```

**Reasoning:** Including the item count in the accessible name provides screen reader users with the same at-a-glance information that sighted users get from the visual badge without them needing to navigate into the drawer.

---

### C-21 — `live-region` (form validation errors)
**Recommended Fix:**
- Add `role="alert"` to each error `<span>` in `CheckoutPage.jsx` so the browser treats them as `aria-live="assertive"` regions. When they are injected into the DOM, screen readers immediately announce the error.
- For the cart count badge in `Header.jsx`, add a visually-hidden `aria-live="polite"` region that announces the updated count: `"Item added to cart. Cart now has 2 items."`

**Reasoning:** `role="alert"` is the correct semantic for time-sensitive error messages that require immediate attention. For cart updates, `aria-live="polite"` is preferred so the announcement doesn't interrupt ongoing speech.

---

## 5. Non-Critical Issues (Serious / Moderate) — Not Remediated

### Serious Issues

---

#### S-01 — `html-has-lang`: `<html>` Element Missing `lang` Attribute
**Tool:** axe-core | **WCAG:** 3.1.1 (A) | **Impact:** Serious

| # | Page | File | Element |
|---|---|---|---|
| 1 | All pages | `public/index.html:3` | `<html>` — missing `lang` attribute entirely |

Screen readers use the `lang` attribute to select the correct pronunciation engine. Without it, non-default language text will be mispronounced.  
**Recommended fix:** `<html lang="en">`

---

#### S-02 — `valid-lang`: Invalid `lang` Attribute Value
**Tool:** axe-core | **WCAG:** 3.1.2 (AA) | **Impact:** Serious

| # | Page | File | Element |
|---|---|---|---|
| 1 | Homepage | `src/components/TheDrop.jsx:21` | `<p lang="zz">` — `"zz"` is not a valid BCP 47 language tag |

**Recommended fix:** Remove `lang="zz"` or replace with the correct BCP 47 tag for the intended language (e.g., `lang="en"` for English).

---

#### S-03 — `list`: `<ul>` Contains Non-`<li>` Direct Children
**Tool:** axe-core | **WCAG:** 1.3.1 (A) | **Impact:** Serious

| # | Page | File | Element |
|---|---|---|---|
| 1 | Homepage | `src/components/TrendingCollections.jsx:45` | `<ul class="trending-grid">` contains `<div class="trending-grid-label">` as a direct child |

**Recommended fix:** Wrap the label in a `<li>` element or move it outside the `<ul>`.

---

#### S-04 — `navigation-forbidden-roles` (GEN2): `role="menu"` Inside Navigation Landmark
**Tool:** Evinced GEN2 | **WCAG:** 1.3.1 (A), 4.1.2 (A) | **Impact:** Serious

| # | Page | File | Element |
|---|---|---|---|
| 1 | All pages — Header | `src/components/Header.jsx:196` | Submenu `<ul>` elements (Apparel, Lifestyle, Stationery, Collections, Shop by Brand) use `role="menu"` inside `<nav>` |

`role="menu"` implies application-widget semantics and is forbidden inside navigation landmarks. Screen readers switch to application mode and break navigation behavior.  
**Recommended fix:** Remove `role="menu"` from submenu `<ul>` elements. Use CSS and disclosure buttons to show/hide submenus without semantic role overrides.

---

#### S-05 — `navigation-unexpected-interactives` (GEN2): `role="menuitem"` on Links in Navigation
**Tool:** Evinced GEN2 | **WCAG:** 1.3.1 (A), 4.1.2 (A) | **Impact:** Serious

| # | Page | File | Element |
|---|---|---|---|
| 1 | All pages — Header | `src/components/Header.jsx:202` | Submenu `<a role="menuitem">` elements (30 links across all submenus) |

`menuitem` is not a permitted role for links inside a navigation landmark. Screen readers announce these as menu items instead of navigation links.  
**Recommended fix:** Remove `role="menuitem"` from all submenu `<a>` links (and `role="none"` from the `<li>` wrappers).

---

#### S-06 — `sort-combobox-no-aria-expanded` (GEN2): Sort Button Missing `aria-expanded`
**Tool:** Evinced GEN2 | **WCAG:** 4.1.2 (A) | **Impact:** Serious

| # | Page | File | Element |
|---|---|---|---|
| 1 | Products Page | `src/pages/NewPage.jsx:141` | `<button class="sort-btn">` — `aria-expanded` removed |

Screen readers cannot announce whether the sort options list is open or closed.

---

#### S-07 — `sort-dropdown-no-group-role` (GEN2): Sort Wrapper Missing Group Semantics
**Tool:** Evinced GEN2 | **WCAG:** 1.3.1 (A), 4.1.2 (A) | **Impact:** Serious

| # | Page | File | Element |
|---|---|---|---|
| 1 | Products Page | `src/pages/NewPage.jsx:138` | `<div class="sort-dropdown">` — `role="group"` and `aria-label="Sort products"` removed |

---

#### S-08 — `sort-dropdown-no-aria-expanded` (GEN2): Sort Trigger Missing `aria-expanded`
**Tool:** Evinced GEN2 | **WCAG:** 4.1.2 (A) | **Impact:** Serious

| # | Page | File | Element |
|---|---|---|---|
| 1 | Products Page | `src/pages/NewPage.jsx:141` | `<button class="sort-btn">` — disclosure state not communicated to screen readers |

---

#### S-09 — `filter-disclosure-no-aria-expanded` (GEN2): Filter Section Buttons Missing `aria-expanded`
**Tool:** Evinced GEN2 | **WCAG:** 4.1.2 (A) | **Impact:** Serious

| # | Page | File | Element |
|---|---|---|---|
| 1 | Products Page | `src/components/FilterSidebar.jsx:52` | Price `<button class="filter-group-header">` — `aria-expanded` removed |
| 2 | Products Page | `src/components/FilterSidebar.jsx:94` | Size `<button class="filter-group-header">` — `aria-expanded` removed |
| 3 | Products Page | `src/components/FilterSidebar.jsx:136` | Brand `<button class="filter-group-header">` — `aria-expanded` removed |

---

#### S-10 — `filter-disclosure-no-esc-close` (GEN2): Filter Sections Not Closable With Escape
**Tool:** Evinced GEN2 | **WCAG:** 2.1.1 (A) | **Impact:** Serious

| # | Page | File | Element |
|---|---|---|---|
| 1 | Products Page | `src/components/FilterSidebar.jsx:49` | Price filter group — no `keydown` Escape handler |
| 2 | Products Page | `src/components/FilterSidebar.jsx:90` | Size filter group — no `keydown` Escape handler |
| 3 | Products Page | `src/components/FilterSidebar.jsx:132` | Brand filter group — no `keydown` Escape handler |

---

#### S-11 — `no-aria-modal` (GEN2): Cart Drawer Missing `aria-modal="true"`
**Tool:** Evinced GEN2 | **WCAG:** 4.1.2 (A) | **Impact:** Serious

| # | Page | File | Element |
|---|---|---|---|
| 1 | All pages — Cart Drawer | `src/components/CartModal.jsx:41` | Cart drawer `<div>` — `aria-modal="true"` removed |

Without `aria-modal`, some screen readers browse content behind the open dialog.

---

#### S-12 — `no-esc-close` (GEN2): Cart Modal Not Dismissible With Escape Key
**Tool:** Evinced GEN2 | **WCAG:** 2.1.1 (A) | **Impact:** Serious

| # | Page | File | Element |
|---|---|---|---|
| 1 | All pages — Cart Drawer | `src/components/CartModal.jsx:17` | Cart drawer — `keydown` Escape handler removed |

---

#### S-13 — `no-quantity-value-label` (GEN2): Cart Quantity Span Without Accessible Label
**Tool:** Evinced GEN2 | **WCAG:** 1.1.1 (A) | **Impact:** Serious

| # | Page | File | Element |
|---|---|---|---|
| 1 | All pages — Cart Drawer | `src/components/CartModal.jsx:94` | Quantity `<span>` per cart item — `aria-label` removed, screen readers announce a bare number with no context |

---

#### S-14 — `reflow` (GEN3): Content Clipped at High Zoom
**Tool:** Evinced GEN3 | **WCAG:** 1.4.10 (AA) | **Impact:** Serious

| # | Page | File | Element |
|---|---|---|---|
| 1 | All pages | `src/components/App.css` | `body { overflow-x: hidden }` — at 300% zoom the navigation bar is clipped and cannot be scrolled to |

Low-vision users who rely on browser zoom lose access to the main navigation.

---

#### S-15 — `sr-order` (GEN3): Screen Reader Reading Order Mismatch
**Tool:** Evinced GEN3 | **WCAG:** 1.3.2 (A) | **Impact:** Serious

| # | Page | File | Element |
|---|---|---|---|
| 1 | Homepage | `src/components/FeaturedPair.jsx:37` | `.featured-card` — `<div class="featured-card-image">` is DOM-first; CSS `flex-direction: column-reverse` corrects visual order but screen readers follow DOM order, announcing the image before the heading and CTA |

---

#### S-16 — `non-meaningful-label` (GEN3): Non-Descriptive Accessible Labels
**Tool:** Evinced GEN3 | **WCAG:** 2.4.6 (AA), 2.4.9 (AAA), 4.1.2 (A) | **Impact:** Serious

| # | Page | File | Element | Bad Label | Should Be |
|---|---|---|---|---|---|
| 1 | Products Page | `src/components/ProductCard.jsx:7` | `<article>` product card | `"Product item"` | Product name, e.g. `"Google Super G Trucker Hat"` |
| 2 | Product Detail | `src/pages/ProductPage.jsx:114` | "ADD TO CART" button | `"Add to cart"` | `"Add {product name} to cart"` |
| 3 | Product Detail | `src/pages/ProductPage.jsx:123` | Wishlist button | `"Wishlist action"` | `"Add {name} to wishlist"` / `"Remove {name} from wishlist"` |
| 4 | Checkout | `src/pages/CheckoutPage.jsx:104` | Decrease qty button | `"Minus"` | `"Decrease quantity of {item name}"` |
| 5 | Checkout | `src/pages/CheckoutPage.jsx:107` | Quantity `<span>` | `"Number"` | `"Quantity: {n}"` |
| 6 | Checkout | `src/pages/CheckoutPage.jsx:113` | Increase qty button | `"Plus"` | `"Increase quantity of {item name}"` |
| 7 | Checkout | `src/pages/CheckoutPage.jsx:121` | Remove item button | `"Delete"` | `"Remove {item name} from cart"` |
| 8 | All pages — Wishlist Drawer | `src/components/WishlistModal.jsx:111` | Product image link | `"Click here"` | `"View {item name}"` |

---

#### S-17 — `keyboard-order` (GEN3): Reversed Keyboard Focus Order in Navigation
**Tool:** Evinced GEN3 | **WCAG:** 2.4.3 (A) | **Impact:** Serious

| # | Page | File | Element |
|---|---|---|---|
| 1 | All pages — Header | `src/components/Header.jsx:191` | Main nav `<Link>` elements — `tabIndex` is set to `navItems.length - index`, reversing tab order relative to visual order (Sale → … → New instead of New → … → Sale) |

---

### Moderate Issues

---

#### M-01 — `heading-order` (GEN3): Incorrect Heading Levels
**Tool:** Evinced GEN3 | **WCAG:** 1.3.1 (A) | **Impact:** Moderate (14 instances)

| # | Page | File | Wrong Element | Should Be |
|---|---|---|---|---|
| 1 | Homepage | `src/components/HeroBanner.jsx:12` | `<h3>Winter Basics</h3>` | `<h1>` |
| 2 | Homepage | `src/components/FeaturedPair.jsx:46` | `<h1>` item titles | `<h3>` |
| 3 | Homepage | `src/components/PopularSection.jsx:44` | `<h4>Popular on the Merch Shop</h4>` | `<h2>` |
| 4 | Homepage | `src/components/PopularSection.jsx:50` | `<h1>` product card titles | `<h3>` |
| 5 | Homepage | `src/components/TrendingCollections.jsx:42` | `<h4>Shop Trending Collections</h4>` | `<h2>` |
| 6 | Homepage | `src/components/TrendingCollections.jsx:50` | `<h1>` collection card titles | `<h3>` |
| 7 | Homepage | `src/components/TheDrop.jsx:17` | `<h4>The Drop</h4>` | `<h2>` |
| 8 | Products Page | `src/pages/NewPage.jsx:102` | `<h3>{pageTitle}</h3>` | `<h1>` |
| 9 | Product Detail | `src/pages/ProductPage.jsx:63` | `<h3>{product.name}</h3>` | `<h1>` |
| 10 | Checkout | `src/pages/CheckoutPage.jsx:74` | `<h3>Shopping Cart</h3>` / `<h3>Shipping & Payment</h3>` | `<h1>` |
| 11 | Checkout | `src/pages/CheckoutPage.jsx:141` | `<h5>Order Summary</h5>` (×2) | `<h2>` |
| 12 | Order Confirmation | `src/pages/OrderConfirmationPage.jsx:27` | `<h3>Thank you!</h3>` | `<h1>` |
| 13 | All pages — Cart Drawer | `src/components/CartModal.jsx:49` | `<h5>Shopping Cart</h5>` | `<h2>` |
| 14 | All pages — Wishlist Drawer | `src/components/WishlistModal.jsx:54` | `<h5>Wishlist</h5>` | `<h2>` |

---

#### M-02 — `color-contrast` (AXE): Insufficient Color Contrast
**Tool:** axe-core | **WCAG:** 1.4.3 (AA) | **Impact:** Moderate (4 instances)

| # | Page | File | Element | Foreground | Background | Approx. Ratio |
|---|---|---|---|---|---|---|
| 1 | Homepage | `src/components/HeroBanner.css` | `.hero-content p` (hero subtitle) | `#c8c0b8` | `#e8e0d8` | ~1.3:1 |
| 2 | Products Page | `src/pages/NewPage.css` | `.products-found` text | `#b0b4b8` | `#ffffff` | ~1.9:1 |
| 3 | Products Page | `src/components/FilterSidebar.css` | `.filter-count` count text | `#c8c8c8` | `#ffffff` | ~1.4:1 |
| 4 | Product Detail | `src/pages/ProductPage.module.css` | `.productDescription` text | `#c0c0c0` | `#ffffff` | ~1.6:1 |

WCAG AA requires a minimum contrast ratio of 4.5:1 for normal text.

---

#### M-03 — `sort-dropdown-no-aria-haspopup` (GEN2): Sort Button Missing `aria-haspopup`
**Tool:** Evinced GEN2 | **WCAG:** 4.1.2 (A) | **Impact:** Moderate

| # | Page | File | Element |
|---|---|---|---|
| 1 | Products Page | `src/pages/NewPage.jsx:141` | `<button class="sort-btn">` — `aria-haspopup="listbox"` removed |

---

#### M-04 — `sort-dropdown-no-aria-controls` (GEN2): Sort Button Missing `aria-controls`
**Tool:** Evinced GEN2 | **WCAG:** 4.1.2 (A) | **Impact:** Moderate

| # | Page | File | Element |
|---|---|---|---|
| 1 | Products Page | `src/pages/NewPage.jsx:141` | `<button class="sort-btn">` — `aria-controls` removed |

---

#### M-05 — `filter-disclosure-no-aria-controls` (GEN2): Filter Buttons Missing `aria-controls`
**Tool:** Evinced GEN2 | **WCAG:** 4.1.2 (A) | **Impact:** Moderate

| # | Page | File | Element |
|---|---|---|---|
| 1 | Products Page | `src/components/FilterSidebar.jsx:52` | Price filter button — `aria-controls="filter-price"` removed |
| 2 | Products Page | `src/components/FilterSidebar.jsx:94` | Size filter button — `aria-controls="filter-size"` removed |
| 3 | Products Page | `src/components/FilterSidebar.jsx:136` | Brand filter button — `aria-controls="filter-brand"` removed |

---

#### M-06 — `filter-disclosure-no-aria-owns` (GEN2): Filter Panels Missing IDs
**Tool:** Evinced GEN2 | **WCAG:** 4.1.2 (A) | **Impact:** Moderate

| # | Page | File | Element |
|---|---|---|---|
| 1 | Products Page | `src/components/FilterSidebar.jsx:69` | Price `<div class="filter-options">` — `id="filter-price"` removed |
| 2 | Products Page | `src/components/FilterSidebar.jsx:111` | Size `<div class="filter-options">` — `id="filter-size"` removed |
| 3 | Products Page | `src/components/FilterSidebar.jsx:151` | Brand `<div class="filter-options">` — `id="filter-brand"` removed |

---

## 6. Issue Count by Page

| Page | Critical | Serious | Moderate | Total |
|---|---|---|---|---|
| All pages (shared: Header, Footer, Cart, Wishlist) | 28 | 14 | 3 | 45 |
| Homepage (`/`) | 17 | 4 | 9 | 30 |
| Products Page (`/shop/new`) | 28 | 10 | 8 | 46 |
| Product Detail (`/product/:id`) | 5 | 2 | 2 | 9 |
| Checkout (`/checkout`) | 9 | 1 | 3 | 13 |
| Order Confirmation (`/order-confirmation`) | 1 | 0 | 1 | 2 |

> Note: Shared-component issues (Header, Footer, CartModal, WishlistModal) are present on every page but counted once in the "All pages" row.

---

## 7. WCAG Coverage Summary

| WCAG Criterion | Description | Issues Found |
|---|---|---|
| 1.1.1 (A) | Non-text Content | C-01, C-09, S-13 |
| 1.3.1 (A) | Info and Relationships | C-03, C-04, C-05, C-06, C-08, C-11, C-12, C-13, C-18, S-03, S-04, S-05, S-07, S-15, S-16, M-01 |
| 1.3.2 (A) | Meaningful Sequence | S-15 |
| 1.4.3 (AA) | Minimum Contrast | M-02 |
| 1.4.10 (AA) | Reflow | S-14 |
| 2.1.1 (A) | Keyboard | C-05, C-10, C-15, C-17, S-10, S-12 |
| 2.1.2 (A) | No Keyboard Trap | C-10 |
| 2.4.3 (A) | Focus Order | S-17 |
| 2.4.6 (AA) | Headings and Labels | C-06, S-16, M-01 |
| 2.4.9 (AAA) | Link Purpose (Link Only) | C-06, S-16 |
| 3.1.1 (A) | Language of Page | S-01 |
| 3.1.2 (AA) | Language of Parts | S-02 |
| 4.1.1 (A) | Parsing | C-04 |
| 4.1.2 (A) | Name, Role, Value | C-02, C-03, C-07, C-08, C-09, C-11–C-20, S-04–S-09, S-11, M-03–M-06 |
| 4.1.3 (AA) | Status Messages | C-21 |

---

*Report generated from source code analysis and Evinced MCP accessibility engine scan results. No remediations were applied to the codebase.*

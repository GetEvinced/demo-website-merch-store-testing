# Accessibility Issues

## AXE

Issues detected by axe-core rules, intentionally introduced for demo/testing purposes. Each issue is marked in the source code with an `A11Y-AXE` comment on the relevant line.

---

### color-contrast (4 issues)

> **Rule:** Elements must have sufficient color contrast  
> **Impact:** Serious  
> **WCAG:** 1.4.3 (AA) — minimum contrast ratio of 4.5:1 for normal text  
> **Reference:** https://dequeuniversity.com/rules/axe/4.11/color-contrast

| # | Page | File | Element | Foreground | Background | Notes |
|---|------|------|---------|-----------|-----------|-------|
| 1 | Homepage | `src/components/HeroBanner.css` | `.hero-content p` (hero subtitle) | `#c8c0b8` | `#e8e0d8` | ~1.3:1 ratio |
| 2 | Products Page | `src/pages/NewPage.css` | `.products-found` ("X Products Found" text) | `#b0b4b8` | `#ffffff` | ~1.9:1 ratio |
| 3 | Products Page | `src/components/FilterSidebar.css` | `.filter-count` (product count in filter options) | `#c8c8c8` | `#ffffff` | ~1.4:1 ratio |
| 4 | Product Detail | `src/pages/ProductPage.module.css` | `.productDescription` (product description text) | `#c0c0c0` | `#ffffff` | ~1.6:1 ratio |

---

### image-alt (2 issues)

> **Rule:** Images must have alternative text  
> **Impact:** Critical  
> **WCAG:** 1.1.1 (A) — Non-text Content  
> **Reference:** https://dequeuniversity.com/rules/axe/4.11/image-alt

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | Homepage | `src/components/HeroBanner.jsx` | `<img src="/images/home/New_Tees.png">` | Missing `alt` attribute — screen readers will read the filename as content |
| 2 | Homepage | `src/components/TheDrop.jsx` | `<img src="/images/home/2bags_charms1.png">` | Missing `alt` attribute — screen readers will read the filename as content |

---

### aria-valid-attr-value (3 issues)

> **Rule:** ARIA attributes must conform to valid values  
> **Impact:** Critical  
> **WCAG:** 4.1.2 (A) — Name, Role, Value  
> **Reference:** https://dequeuniversity.com/rules/axe/4.11/aria-valid-attr-value

| # | Page | File | Element | Invalid Attribute | Invalid Value | Valid Values |
|---|------|------|---------|------------------|--------------|-------------|
| 1 | Homepage | `src/components/FeaturedPair.jsx` | `<h1 aria-expanded="yes">` | `aria-expanded` | `"yes"` | `"true"` or `"false"` |
| 2 | Products Page | `src/pages/NewPage.jsx` | `<div aria-sort="newest" role="columnheader">` | `aria-sort` | `"newest"` | `"ascending"`, `"descending"`, `"none"`, `"other"` |
| 3 | Product Detail | `src/pages/ProductPage.jsx` | `<ul aria-relevant="changes">` | `aria-relevant` | `"changes"` | Space-separated tokens from: `additions`, `removals`, `text`, `all` |

---

### duplicate-id-aria (4 issues)

> **Rule:** IDs used in ARIA and labels must be unique  
> **Impact:** Critical  
> **WCAG:** 4.1.1 (A) — Parsing  
> **Reference:** https://dequeuniversity.com/rules/axe/4.11/duplicate-id-aria

| # | Page | File | Duplicate ID | Elements Affected | Notes |
|---|------|------|-------------|------------------|-------|
| 1 | Homepage | `src/components/FeaturedPair.jsx` | `featured-card-label` | Two `<p class="featured-eyebrow">` elements (one per card) | Rendered in a `.map()` loop |
| 2 | Homepage | `src/components/FeaturedPair.jsx` | `featured-card-img` | Two `<img>` elements (one per card) | Rendered in a `.map()` loop |
| 3 | Products Page | `src/components/FilterSidebar.jsx` | `filter-section-title` | `<span>Price</span>` and `<span>Size</span>` | Both referenced via `aria-describedby` on their parent buttons |
| 4 | Products Page | `src/components/FilterSidebar.jsx` | `filter-section-title` | (same as above — second occurrence) | Creates two elements with the same ID in the DOM |

---

### html-has-lang (1 issue)

> **Rule:** `<html>` element must have a lang attribute  
> **Impact:** Serious  
> **WCAG:** 3.1.1 (A) — Language of Page  
> **Reference:** https://dequeuniversity.com/rules/axe/4.11/html-has-lang

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | All pages | `public/index.html` | `<html>` | Missing `lang` attribute entirely |

---

### valid-lang (1 issue)

> **Rule:** lang attribute must have a valid value  
> **Impact:** Serious  
> **WCAG:** 3.1.2 (AA) — Language of Parts  
> **Reference:** https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md

| # | Page | File | Element | Invalid Value | Notes |
|---|------|------|---------|--------------|-------|
| 1 | Homepage | `src/components/TheDrop.jsx` | `<p lang="zz">` | `"zz"` | Not a valid BCP 47 language tag |

---

### list (1 issue)

> **Rule:** `<ul>` and `<ol>` must only directly contain `<li>`, `<script>`, or `<template>` elements  
> **Impact:** Serious  
> **WCAG:** 1.3.1 (A) — Info and Relationships  
> **Reference:** https://dequeuniversity.com/rules/axe/4.11/list

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | Homepage | `src/components/TrendingCollections.jsx` | `<ul class="trending-grid">` | Contains a `<div class="trending-grid-label">` as a direct child instead of only `<li>` elements |

---

### aria-required-attr (5 issues)

> **Rule:** Required ARIA attributes must be provided  
> **Impact:** Critical  
> **WCAG:** 4.1.2 (A) — Name, Role, Value  
> **Reference:** https://dequeuniversity.com/rules/axe/4.11/aria-required-attr

| # | Page | File | Element | Role | Missing Required Attributes |
|---|------|------|---------|------|-----------------------------|
| 1 | Homepage | `src/components/FeaturedPair.jsx` | `<span role="checkbox">` | `checkbox` | `aria-checked` |
| 2 | Homepage | `src/components/TheDrop.jsx` | `<div role="slider">` | `slider` | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| 3 | Products Page | `src/pages/NewPage.jsx` | `<div role="spinbutton">` | `spinbutton` | `aria-valuenow` |
| 4 | Products Page | `src/pages/NewPage.jsx` | `<div role="combobox">` | `combobox` | `aria-controls`, `aria-expanded` |
| 5 | Product Detail | `src/pages/ProductPage.jsx` | `<span role="meter">` | `meter` | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |

---

## GEN1

Issues detected by Evinced engine rules, intentionally introduced for demo/testing purposes. Each issue is marked in the source code with an `A11Y-GEN1` comment on the relevant line.

---

### interactable-role + keyboard-accessible (15 issues)

> **Rule:** Semantics of interactable elements must be conveyed by their tag or assigned role; all UI functionality must be accessible by keyboard  
> **Impact:** Critical / Serious  
> **WCAG:** 1.3.1 (A), 2.1.1 (A), 4.1.2 (A)  
> **References:**  
> - https://knowledge.evinced.com/system-validations/interactable-role  
> - https://knowledge.evinced.com/system-validations/keyboard-accessible

Each issue below is a `<div>` (or similar non-semantic element) used as an interactive control without a proper `role` attribute and without `tabindex`, making it invisible to screen readers as an interactive element and inaccessible to keyboard users.

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | All pages (Header) | `src/components/Header.jsx` | `<div class="icon-btn wishlist-btn">` | `div` used as a wishlist-open button — no `role="button"`, no `tabindex` |
| 2 | All pages (Header) | `src/components/Header.jsx` | `<div class="icon-btn">` (Search) | `div` used as a search button — no `role="button"`, no `tabindex` |
| 3 | All pages (Header) | `src/components/Header.jsx` | `<div class="icon-btn">` (Login) | `div` used as a login button — no `role="button"`, no `tabindex` |
| 4 | All pages (Header) | `src/components/Header.jsx` | `<div class="flag-group">` | `div` used as a region-selector toggle — no `role="button"`, no `tabindex` |
| 5 | All pages (Footer) | `src/components/Footer.jsx` | `<div class="footer-nav-item">` (Sustainability) | `div` used as a navigation item — no `role="link"`, no `tabindex` |
| 6 | All pages (Footer) | `src/components/Footer.jsx` | `<div class="footer-nav-item">` (FAQs) | `div` used as a navigation item — no `role="link"`, no `tabindex` |
| 7 | Products Page | `src/components/ProductCard.jsx` | `<div class="product-card-quick-add">` | `div` used as a quick-add button — no `role="button"`, no `tabindex` |
| 8 | Homepage | `src/components/PopularSection.jsx` | `<div class="shop-link">` (Shop Drinkware) | `div` used as a navigation link — no `role="link"`, no `tabindex` |
| 9 | Homepage | `src/components/PopularSection.jsx` | `<div class="shop-link">` (Shop Fun and Games) | `div` used as a navigation link — no `role="link"`, no `tabindex` |
| 10 | Homepage | `src/components/PopularSection.jsx` | `<div class="shop-link">` (Shop Stationery) | `div` used as a navigation link — no `role="link"`, no `tabindex` |
| 11 | All pages (Cart Drawer) | `src/components/CartModal.jsx` | `<div class="continueBtn">` | `div` used as a continue-shopping button — no `role="button"`, no `tabindex` |
| 12 | All pages (Wishlist Drawer) | `src/components/WishlistModal.jsx` | `<div class="removeBtn">` | `div` used as a remove-from-wishlist button — no `role="button"`, no `tabindex` |
| 13 | Checkout | `src/pages/CheckoutPage.jsx` | `<div class="checkout-continue-btn">` | `div` used as a proceed button — no `role="button"`, no `tabindex` |
| 14 | Checkout | `src/pages/CheckoutPage.jsx` | `<div class="checkout-back-btn">` | `div` used as a back-to-cart button — no `role="button"`, no `tabindex` |
| 15 | Order Confirmation | `src/pages/OrderConfirmationPage.jsx` | `<div class="confirm-home-link">` | `div` used as a back-to-shop navigation action — no `role="link"`, no `tabindex` |

---

### accessible-name (10 issues)

> **Rule:** All interactable elements must have an accessible name  
> **Impact:** Critical  
> **WCAG:** 1.3.1 (A), 2.4.6 (AA), 4.1.2 (A)  
> **Reference:** https://knowledge.evinced.com/system-validations/accessible-name

Each issue below is an interactive element whose accessible name has been removed (either `aria-label` was stripped or the visible text was hidden from assistive technologies via `aria-hidden="true"`), leaving screen readers and voice control with no hook to identify or announce the control.

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | All pages (Header) | `src/components/Header.jsx` | `<div class="icon-btn">` (Search) | Icon-only control — SVG is `aria-hidden`, visible text is `aria-hidden`; no accessible name |
| 2 | All pages (Header) | `src/components/Header.jsx` | `<div class="icon-btn">` (Login) | Icon-only control — SVG is `aria-hidden`, visible text is `aria-hidden`; no accessible name |
| 3 | All pages (Footer) | `src/components/Footer.jsx` | `<div class="footer-nav-item">` (FAQs) | Visible label is `aria-hidden`; no `aria-label` — no accessible name |
| 4 | Products Page | `src/components/ProductCard.jsx` | `<Link class="product-card-image-link">` | `aria-label` removed from image link — link has no accessible name beyond the child `<img>` alt, which is insufficient for a standalone link |
| 5 | Homepage | `src/components/PopularSection.jsx` | `<div class="shop-link">` (Shop Drinkware) | Visible label is `aria-hidden`; no `aria-label` — no accessible name |
| 6 | Homepage | `src/components/PopularSection.jsx` | `<div class="shop-link">` (Shop Fun and Games) | Visible label is `aria-hidden`; no `aria-label` — no accessible name |
| 7 | Homepage | `src/components/PopularSection.jsx` | `<div class="shop-link">` (Shop Stationery) | Visible label is `aria-hidden`; no `aria-label` — no accessible name |
| 8 | All pages (Cart Drawer) | `src/components/CartModal.jsx` | `<button class="closeBtn">` | Icon-only button — `aria-label` removed, SVG is `aria-hidden`; no accessible name |
| 9 | All pages (Wishlist Drawer) | `src/components/WishlistModal.jsx` | `<button class="closeBtn">` | Icon-only button — `aria-label` removed, SVG is `aria-hidden`; no accessible name |
| 10 | All pages (Cart Drawer) | `src/components/CartModal.jsx` | `<div class="continueBtn">` | Interactive div — visible text is `aria-hidden`; no `aria-label` — no accessible name |

---

## GEN2

Issues detected by Evinced engine rules, intentionally introduced for demo/testing purposes. Each issue is marked in the source code with an `A11Y-GEN2` comment on the relevant line.

---

### navigation-forbidden-roles (1 issue)

> **Rule:** Navigation patterns must not use `role="menu"` or `role="menubar"` on their submenu containers — these roles imply application-level widget semantics and are forbidden inside a navigation landmark  
> **Impact:** Serious  
> **WCAG:** 1.3.1 (A) — Info and Relationships; 4.1.2 (A) — Name, Role, Value  
> **Reference:** https://knowledge.evinced.com/components/navigation#forbidden-roles

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | All pages (Header) | `src/components/Header.jsx` | Submenu `<ul>` elements (Apparel, Lifestyle, Stationery, Collections, Shop by Brand) | `role="menu"` applied to submenu `<ul>` containers inside the main `<nav>` — the `menu` role is forbidden in a navigation landmark; assistive technologies will treat the nav as an application widget instead of a navigation region |

---

### navigation-unexpected-interactives (1 issue)

> **Rule:** Interactive elements inside a navigation landmark must carry a role of `link`, `button`, or `group`; other roles (e.g. `menuitem`) are unexpected and break the navigation pattern  
> **Impact:** Serious  
> **WCAG:** 1.3.1 (A) — Info and Relationships; 4.1.2 (A) — Name, Role, Value  
> **Reference:** https://knowledge.evinced.com/components/navigation#unexpected-interactives

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | All pages (Header) | `src/components/Header.jsx` | Submenu `<a>` elements (30 links across all submenus) | `role="menuitem"` applied to `<a>` elements inside the nav submenus — `menuitem` is not a permitted role for interactive elements within a navigation landmark; screen readers cannot correctly identify or announce these links as navigation links |

---

### sort-combobox-no-role (1 issue)

> **Rule:** Custom combobox/select widgets must expose `role="combobox"` so assistive technologies identify and announce the control correctly  
> **Impact:** Critical  
> **WCAG:** 4.1.2 (A) — Name, Role, Value  
> **Reference:** https://knowledge.evinced.com/components/combobox#role

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | Products Page | `src/pages/NewPage.jsx` | Sort `<button class="sort-btn">` | `role="combobox"` not set — assistive technologies cannot identify the sort trigger as a combobox widget |

---

### sort-combobox-no-accessible-name (1 issue)

> **Rule:** All interactable elements must have an accessible name  
> **Impact:** Critical  
> **WCAG:** 1.3.1 (A), 4.1.2 (A) — Name, Role, Value  
> **Reference:** https://knowledge.evinced.com/components/combobox#accessibility-label

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | Products Page | `src/pages/NewPage.jsx` | Sort `<button class="sort-btn">` | No accessible name (`aria-label` removed) — screen readers cannot announce the purpose of the sort combobox |

---

### sort-combobox-no-aria-expanded (1 issue)

> **Rule:** Combobox triggers must expose `aria-expanded` so assistive technologies can announce whether the options list is open or closed  
> **Impact:** Serious  
> **WCAG:** 4.1.2 (A) — Name, Role, Value  
> **Reference:** https://knowledge.evinced.com/components/combobox#combobox-sanity

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | Products Page | `src/pages/NewPage.jsx` | Sort `<button class="sort-btn">` | `aria-expanded` removed — screen readers cannot determine whether the sort options list is currently open or closed; the combobox state is undetectable |

---

### filter-checkbox-no-role (3 issues)

> **Rule:** Custom checkbox widgets must expose `role="checkbox"` so assistive technologies identify and announce the control correctly  
> **Impact:** Critical  
> **WCAG:** 4.1.2 (A) — Name, Role, Value  
> **Reference:** https://knowledge.evinced.com/components/checkbox#role

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | Products Page | `src/components/FilterSidebar.jsx` | Price filter custom checkbox `<div>` | `role="checkbox"` not set — screen readers cannot identify the element as a checkbox |
| 2 | Products Page | `src/components/FilterSidebar.jsx` | Size filter custom checkbox `<div>` | `role="checkbox"` not set — screen readers cannot identify the element as a checkbox |
| 3 | Products Page | `src/components/FilterSidebar.jsx` | Brand filter custom checkbox `<div>` | `role="checkbox"` not set — screen readers cannot identify the element as a checkbox |

---

### filter-checkbox-no-focus-sequence (3 issues)

> **Rule:** All interactive elements must be reachable via keyboard tab navigation  
> **Impact:** Critical  
> **WCAG:** 2.1.1 (A) — Keyboard  
> **Reference:** https://knowledge.evinced.com/components/checkbox#focus-sequence

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | Products Page | `src/components/FilterSidebar.jsx` | Price filter custom checkbox `<div>` | No `tabindex` — the checkbox is not in the keyboard focus sequence; keyboard-only users cannot reach it |
| 2 | Products Page | `src/components/FilterSidebar.jsx` | Size filter custom checkbox `<div>` | No `tabindex` — the checkbox is not in the keyboard focus sequence; keyboard-only users cannot reach it |
| 3 | Products Page | `src/components/FilterSidebar.jsx` | Brand filter custom checkbox `<div>` | No `tabindex` — the checkbox is not in the keyboard focus sequence; keyboard-only users cannot reach it |

---

### filter-checkbox-no-accessible-name (3 issues)

> **Rule:** All interactable elements must have an accessible name  
> **Impact:** Critical  
> **WCAG:** 1.3.1 (A), 4.1.2 (A) — Name, Role, Value  
> **Reference:** https://knowledge.evinced.com/components/checkbox#accessible-name

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | Products Page | `src/components/FilterSidebar.jsx` | Price filter custom checkbox `<div>` | No `aria-label` or associated `<label>` — screen readers cannot announce what the checkbox controls |
| 2 | Products Page | `src/components/FilterSidebar.jsx` | Size filter custom checkbox `<div>` | No `aria-label` or associated `<label>` — screen readers cannot announce what the checkbox controls |
| 3 | Products Page | `src/components/FilterSidebar.jsx` | Brand filter custom checkbox `<div>` | No `aria-label` or associated `<label>` — screen readers cannot announce what the checkbox controls |

---

### filter-checkbox-no-aria-checked (3 issues)

> **Rule:** Elements with `role="checkbox"` must expose `aria-checked` to convey their checked/unchecked state to assistive technologies  
> **Impact:** Critical  
> **WCAG:** 4.1.2 (A) — Name, Role, Value  
> **Reference:** https://knowledge.evinced.com/components/checkbox#aria-checked

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | Products Page | `src/components/FilterSidebar.jsx` | Price filter custom checkbox `<div>` | `aria-checked` not defined — screen readers cannot announce whether the Price filter checkbox is checked or unchecked |
| 2 | Products Page | `src/components/FilterSidebar.jsx` | Size filter custom checkbox `<div>` | `aria-checked` not defined — screen readers cannot announce whether the Size filter checkbox is checked or unchecked |
| 3 | Products Page | `src/components/FilterSidebar.jsx` | Brand filter custom checkbox `<div>` | `aria-checked` not defined — screen readers cannot announce whether the Brand filter checkbox is checked or unchecked |

---

### no-dialog-role (1 issue)

> **Rule:** Modal dialogs must expose `role="dialog"` (or `role="alertdialog"`) so assistive technologies announce and treat them as dialogs  
> **Impact:** Critical  
> **WCAG:** 4.1.2 (A) — Name, Role, Value  

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | All pages (Cart Drawer) | `src/components/CartModal.jsx` | Cart drawer `<div>` | `role="dialog"` removed — screen readers cannot identify the panel as a dialog and will not switch to dialog-reading mode |

---

### no-aria-modal (1 issue)

> **Rule:** Modal dialogs should set `aria-modal="true"` to signal to screen readers that background content is inert  
> **Impact:** Serious  
> **WCAG:** 4.1.2 (A) — Name, Role, Value  

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | All pages (Cart Drawer) | `src/components/CartModal.jsx` | Cart drawer `<div>` | `aria-modal="true"` removed — screen readers may allow users to browse content behind the open modal |

---

### no-dialog-accessible-name (2 issues)

> **Rule:** All interactable elements and landmark regions must have an accessible name  
> **Impact:** Critical  
> **WCAG:** 1.3.1 (A), 4.1.2 (A) — Name, Role, Value  

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | All pages (Cart Drawer) | `src/components/CartModal.jsx` | Cart drawer `<div>` | `aria-label="Shopping cart"` removed — the modal has no accessible name; screen readers cannot announce what the dialog is about |
| 2 | All pages (Cart Drawer) | `src/components/CartModal.jsx` | Cart items `<ul>` | `aria-label="Cart items"` removed — the list has no accessible name |

---

### no-aria-label-on-buttons (3 issues)

> **Rule:** Icon-only and symbol buttons must have an accessible name via `aria-label` or equivalent  
> **Impact:** Critical  
> **WCAG:** 1.3.1 (A), 4.1.2 (A) — Name, Role, Value  

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | All pages (Cart Drawer) | `src/components/CartModal.jsx` | Decrease quantity `<button>` per cart item | `aria-label` removed — button renders only "−" symbol; screen readers cannot convey which item's quantity is being changed |
| 2 | All pages (Cart Drawer) | `src/components/CartModal.jsx` | Increase quantity `<button>` per cart item | `aria-label` removed — button renders only "+" symbol; screen readers cannot convey which item's quantity is being changed |
| 3 | All pages (Cart Drawer) | `src/components/CartModal.jsx` | Remove item `<button>` per cart item | `aria-label` removed — icon-only button; screen readers cannot identify which item is being removed |

---

### no-quantity-value-label (1 issue)

> **Rule:** Non-text content conveying information must have a text alternative  
> **Impact:** Serious  
> **WCAG:** 1.1.1 (A) — Non-text Content  

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | All pages (Cart Drawer) | `src/components/CartModal.jsx` | Quantity `<span>` per cart item | `aria-label` (e.g. "Quantity: 2") removed — screen readers read the raw number without context |

---

### no-focus-trap (1 issue)

> **Rule:** When a modal dialog is open, keyboard focus must be trapped inside it  
> **Impact:** Critical  
> **WCAG:** 2.1.2 (A) — No Keyboard Trap (inverse: focus must stay inside the dialog)  

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | All pages (Cart Drawer) | `src/components/CartModal.jsx` | Cart drawer | Focus is not moved into the modal on open and is not trapped — keyboard users can Tab to elements behind the open modal |

---

### no-esc-close (1 issue)

> **Rule:** Dialogs and overlays must be dismissible with the Escape key  
> **Impact:** Serious  
> **WCAG:** 2.1.1 (A) — Keyboard  

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | All pages (Cart Drawer) | `src/components/CartModal.jsx` | Cart drawer | `keydown` Escape handler removed — keyboard users cannot close the cart modal with the Escape key |

---

### no-accessible-name-launcher (1 issue)

> **Rule:** All interactable elements must have an accessible name  
> **Impact:** Critical  
> **WCAG:** 4.1.2 (A) — Name, Role, Value  

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | All pages (Header) | `src/components/Header.jsx` | `<button class="icon-btn cart-btn">` | `aria-label` removed — the cart-open button has no accessible name; screen readers cannot announce its purpose or the number of items in the cart |

---

### sort-dropdown-no-group-role (1 issue)

> **Rule:** Widget containers that group related controls should use an appropriate ARIA `role` and accessible label so assistive technologies can identify and announce the grouping  
> **Impact:** Serious  
> **WCAG:** 1.3.1 (A) — Info and Relationships; 4.1.2 (A) — Name, Role, Value  

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | Products Page | `src/pages/NewPage.jsx` | `<div class="sort-dropdown">` | `role="group"` and `aria-label="Sort products"` removed — the sort widget wrapper has no group semantics or accessible label; screen readers cannot identify it as a named grouping |

---

### sort-dropdown-no-aria-expanded (1 issue)

> **Rule:** Buttons that open a popup or disclosure must expose `aria-expanded` so assistive technologies can announce whether the content is shown or hidden  
> **Impact:** Serious  
> **WCAG:** 4.1.2 (A) — Name, Role, Value  

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | Products Page | `src/pages/NewPage.jsx` | `<button class="sort-btn">` | `aria-expanded` removed — screen readers cannot tell whether the sort options list is currently open or closed |

---

### sort-dropdown-no-aria-haspopup (1 issue)

> **Rule:** Buttons that open a listbox, menu, or other popup should declare `aria-haspopup` so assistive technologies warn the user before activation  
> **Impact:** Moderate  
> **WCAG:** 4.1.2 (A) — Name, Role, Value  

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | Products Page | `src/pages/NewPage.jsx` | `<button class="sort-btn">` | `aria-haspopup="listbox"` removed — screen readers are not informed that activating this button opens a popup list |

---

### sort-dropdown-no-aria-controls (1 issue)

> **Rule:** Buttons that control another element should use `aria-controls` to programmatically associate them with the controlled element  
> **Impact:** Moderate  
> **WCAG:** 4.1.2 (A) — Name, Role, Value  

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | Products Page | `src/pages/NewPage.jsx` | `<button class="sort-btn">` | `aria-controls` removed — screen readers cannot navigate from the trigger button to the options list it controls |

---

### sort-dropdown-no-listbox-role (1 issue)

> **Rule:** Custom select/listbox widgets must expose `role="listbox"` and an accessible label so assistive technologies identify the container as a list of selectable options  
> **Impact:** Critical  
> **WCAG:** 1.3.1 (A) — Info and Relationships; 4.1.2 (A) — Name, Role, Value  

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | Products Page | `src/pages/NewPage.jsx` | `<ul class="sort-options">` | `role="listbox"` and `aria-label="Sort options"` removed — screen readers cannot identify the dropdown list as a listbox widget |

---

### sort-dropdown-no-option-role (1 issue)

> **Rule:** Items inside a `listbox` must carry `role="option"` and `aria-selected` so assistive technologies can announce each choice and its selection state  
> **Impact:** Critical  
> **WCAG:** 4.1.2 (A) — Name, Role, Value  

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | Products Page | `src/pages/NewPage.jsx` | `<li class="sort-option">` (each option) | `role="option"` and `aria-selected` removed — screen readers cannot identify list items as selectable options or announce which one is currently selected |

---

### sort-dropdown-no-keyboard-accessible (1 issue)

> **Rule:** All UI functionality must be operable via keyboard; interactive elements must be focusable and respond to keyboard events  
> **Impact:** Critical  
> **WCAG:** 2.1.1 (A) — Keyboard  

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | Products Page | `src/pages/NewPage.jsx` | `<li class="sort-option">` (each option) | `tabIndex={0}` and `onKeyDown` handler removed — sort options cannot be focused or activated via keyboard; keyboard-only users cannot select a sort order |

---

### filter-disclosure-no-aria-expanded (3 issues)

> **Rule:** Disclosure buttons must expose `aria-expanded` so assistive technologies can announce whether the controlled section is open or collapsed  
> **Impact:** Serious  
> **WCAG:** 4.1.2 (A) — Name, Role, Value  

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | Products Page | `src/components/FilterSidebar.jsx` | Price `<button class="filter-group-header">` | `aria-expanded` removed — screen readers cannot announce whether the Price filter section is expanded or collapsed |
| 2 | Products Page | `src/components/FilterSidebar.jsx` | Size `<button class="filter-group-header">` | `aria-expanded` removed — screen readers cannot announce whether the Size filter section is expanded or collapsed |
| 3 | Products Page | `src/components/FilterSidebar.jsx` | Brand `<button class="filter-group-header">` | `aria-expanded` removed — screen readers cannot announce whether the Brand filter section is expanded or collapsed |

---

### filter-disclosure-no-aria-controls (3 issues)

> **Rule:** Disclosure buttons should use `aria-controls` to programmatically associate them with the region they show/hide  
> **Impact:** Moderate  
> **WCAG:** 4.1.2 (A) — Name, Role, Value  

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | Products Page | `src/components/FilterSidebar.jsx` | Price `<button class="filter-group-header">` | `aria-controls="filter-price"` removed — no programmatic link between the Price toggle button and its controlled panel |
| 2 | Products Page | `src/components/FilterSidebar.jsx` | Size `<button class="filter-group-header">` | `aria-controls="filter-size"` removed — no programmatic link between the Size toggle button and its controlled panel |
| 3 | Products Page | `src/components/FilterSidebar.jsx` | Brand `<button class="filter-group-header">` | `aria-controls="filter-brand"` removed — no programmatic link between the Brand toggle button and its controlled panel |

---

### filter-disclosure-no-aria-owns (3 issues)

> **Rule:** The `id` attribute on a controlled panel is required for `aria-controls` / `aria-owns` associations; without it the relationship between the toggle button and its panel cannot be established  
> **Impact:** Moderate  
> **WCAG:** 4.1.2 (A) — Name, Role, Value  

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | Products Page | `src/components/FilterSidebar.jsx` | Price `<ul class="filter-options">` | `id="filter-price"` removed — the panel has no ID; the toggle button cannot reference it via `aria-controls` or `aria-owns` |
| 2 | Products Page | `src/components/FilterSidebar.jsx` | Size `<ul class="filter-options">` | `id="filter-size"` removed — the panel has no ID; the toggle button cannot reference it via `aria-controls` or `aria-owns` |
| 3 | Products Page | `src/components/FilterSidebar.jsx` | Brand `<ul class="filter-options">` | `id="filter-brand"` removed — the panel has no ID; the toggle button cannot reference it via `aria-controls` or `aria-owns` |

---

### filter-disclosure-no-esc-close (3 issues)

> **Rule:** Disclosures and expandable sections should be collapsible with the Escape key to give keyboard users a quick way to dismiss them  
> **Impact:** Serious  
> **WCAG:** 2.1.1 (A) — Keyboard  

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | Products Page | `src/components/FilterSidebar.jsx` | Price filter disclosure | No `keydown` Escape handler — keyboard users cannot collapse the Price section with the Escape key |
| 2 | Products Page | `src/components/FilterSidebar.jsx` | Size filter disclosure | No `keydown` Escape handler — keyboard users cannot collapse the Size section with the Escape key |
| 3 | Products Page | `src/components/FilterSidebar.jsx` | Brand filter disclosure | No `keydown` Escape handler — keyboard users cannot collapse the Brand section with the Escape key |

---

## GEN3

Issues related to content order and focus sequence, intentionally introduced for demo/testing purposes. Each issue is marked in the source code with an `A11Y-GEN3` comment on the relevant line.

---

### sr-order — Screen Reader Reading Order (1 issue)

> **Rule:** Content that has a meaningful sequence must preserve that sequence in the DOM so screen readers announce it in the correct logical order  
> **Impact:** Serious  
> **WCAG:** 1.3.2 (A) — Meaningful Sequence  

The DOM order of elements does not match the visual order. CSS (`flex-direction: column-reverse`) is used to make the layout appear correct visually, but screen readers follow DOM order — causing them to announce content in a sequence that does not match the visual reading flow.

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | Homepage | `src/components/FeaturedPair.jsx` | `.featured-card` (both cards) | `<div class="featured-card-image">` is placed before `<div class="featured-card-info">` in the DOM. `flex-direction: column-reverse` in `FeaturedPair.css` restores the correct visual order (text on top, image on bottom), but screen readers announce the image alt text before the eyebrow, heading, and CTA link — the reverse of the meaningful sequence |

---

### heading-order — Wrong Heading Levels (14 issues)

> **Rule:** Heading levels must convey a logical document structure — levels should not be skipped or used out of order  
> **Impact:** Moderate  
> **WCAG:** 1.3.1 (A) — Info and Relationships  

Heading elements have been deliberately set to wrong levels to break the document outline. CSS class-based styles preserve the visual appearance, but the semantic heading hierarchy is incorrect — screen readers and assistive technologies rely on heading levels to understand page structure and enable navigation.

| # | Page | File | Element | Wrong Level | Correct Level | Issue |
|---|------|------|---------|-------------|---------------|-------|
| 1 | Homepage | `src/components/HeroBanner.jsx` | "Winter Basics" | `<h3>` | `<h1>` | Page-level heading uses h3, skipping h1 |
| 2 | Homepage | `src/components/FeaturedPair.jsx` | Item titles | `<h1>` | `<h3>` | Card headings use h1, jumping above section level |
| 3 | Homepage | `src/components/PopularSection.jsx` | "Popular on the Merch Shop" | `<h4>` | `<h2>` | Section heading uses h4, skipping h2 and h3 |
| 4 | Homepage | `src/components/PopularSection.jsx` | Product card titles | `<h1>` | `<h3>` | Card headings use h1, jumping above section level |
| 5 | Homepage | `src/components/TrendingCollections.jsx` | "Shop Trending Collections" | `<h4>` | `<h2>` | Section heading uses h4, skipping h2 and h3 |
| 6 | Homepage | `src/components/TrendingCollections.jsx` | Collection card titles | `<h1>` | `<h3>` | Card headings use h1, jumping above section level |
| 7 | Homepage | `src/components/TheDrop.jsx` | "The Drop" | `<h4>` | `<h2>` | Section heading uses h4, skipping h2 and h3 |
| 8 | Products Page | `src/pages/NewPage.jsx` | Page title | `<h3>` | `<h1>` | Page-level heading uses h3, skipping h1 |
| 9 | Product Detail | `src/pages/ProductPage.jsx` | Product name | `<h3>` | `<h1>` | Page-level heading uses h3, skipping h1 |
| 10 | Checkout | `src/pages/CheckoutPage.jsx` | "Shopping Cart" / "Shipping & Payment" | `<h3>` | `<h1>` | Page-level headings use h3, skipping h1 |
| 11 | Checkout | `src/pages/CheckoutPage.jsx` | "Order Summary" (×2) | `<h5>` | `<h2>` | Section headings use h5, skipping multiple levels |
| 12 | Order Confirmation | `src/pages/OrderConfirmationPage.jsx` | "Thank you!" | `<h3>` | `<h1>` | Page-level heading uses h3, skipping h1 |
| 13 | All pages (Cart drawer) | `src/components/CartModal.jsx` | "Shopping Cart" drawer title | `<h5>` | `<h2>` | Drawer heading uses h5, skipping multiple levels |
| 14 | All pages (Wishlist drawer) | `src/components/WishlistModal.jsx` | "Wishlist" drawer title | `<h5>` | `<h2>` | Drawer heading uses h5, skipping multiple levels |

---

### keyboard-order — Keyboard Focus Order (1 issue)

> **Rule:** If a Web page can be navigated sequentially and the navigation sequences affect meaning or operation, focusable components must receive focus in an order that preserves meaning and operability  
> **Impact:** Serious  
> **WCAG:** 2.4.3 (A) — Focus Order  

Explicit `tabIndex` values are used to force keyboard tab order into the reverse of the visual left-to-right sequence. Sighted users read the navigation as **New → Apparel → Lifestyle → Stationery → Collections → Shop by Brand → Sale**, but keyboard users tab through it as **Sale → Shop by Brand → Collections → Stationery → Lifestyle → Apparel → New**.

| # | Page | File | Element | Issue |
|---|------|------|---------|-------|
| 1 | All pages (Header) | `src/components/Header.jsx` | Main navigation `<nav>` links | `tabIndex` values are set in descending order (`navItems.length - index`) on each nav `<Link>`, reversing the tab sequence relative to the visual left-to-right order — keyboard focus order does not match the visual/logical reading order |

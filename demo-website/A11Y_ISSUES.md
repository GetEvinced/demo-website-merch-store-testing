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
| 1 | Homepage | `src/components/FeaturedPair.jsx` | `<h3 aria-expanded="yes">` | `aria-expanded` | `"yes"` | `"true"` or `"false"` |
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

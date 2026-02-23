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

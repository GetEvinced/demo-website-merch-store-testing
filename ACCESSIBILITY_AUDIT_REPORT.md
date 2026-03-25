# Accessibility (A11y) Audit Report — demo-website

**Tool used:** Evinced JS Playwright SDK (Evinced MCP Server / JFrog)  
**Scan date:** 2026-03-25  
**Branch:** cursor/accessibility-audit-report-5589  
**Framework:** React 18 + Webpack 5, Client-side routing via react-router-dom v7  
**Base URL:** http://localhost:3000  

---

## 1. Repository Overview & Pages Audited

The repository is a single-page React application (`demo-website`) with five distinct routes:

| Route | Page Component | File |
|-------|---------------|------|
| `/` | Home Page | `src/pages/HomePage.jsx` |
| `/shop/new` | New/Products Page | `src/pages/NewPage.jsx` |
| `/product/:id` | Product Detail Page | `src/pages/ProductPage.jsx` |
| `/checkout` | Checkout Page | `src/pages/CheckoutPage.jsx` |
| `/order-confirmation` | Order Confirmation Page | `src/pages/OrderConfirmationPage.jsx` |

**Shared components** (rendered on every page): `Header`, `Footer`, `CartModal`, `WishlistModal`

---

## 2. Audit Methodology

Each page was audited using the **Evinced JS Playwright SDK** (`@evinced/js-playwright-sdk`) running in Chromium via Playwright. For each page, the following Evinced analysis methods were used:

- `evAnalyze()` — full-page accessibility scan
- `components.analyzeCombobox()` — targeted scan of the sort combobox on the products page
- `components.analyzeSiteNavigation()` — targeted scan of the main navigation
- `evMergeIssues()` — deduplication of results across scan types

The complete raw JSON reports are stored in `tests/e2e/test-results/`.

---

## 3. Summary of Issues by Page

| Page | Total Issues | Critical | Serious |
|------|-------------|---------|---------|
| Home Page (`/`) | 35 | 32 | 3 |
| New/Products Page (`/shop/new`) | 59 | 43 | 14 + 2 best-practice + 1 needs-review |
| Product Detail Page (`/product/:id`) | 20 | 18 | 2 |
| Checkout Page (`/checkout`) | 23 | 20 | 3 |
| Order Confirmation (`/order-confirmation`) | 20 | 18 | 2 |
| **Total unique issues (cross-page deduplicated)** | **~98** | **~66 unique** | **~32 unique** |

> Note: Many critical issues are present on all pages because they originate from shared components (Header, Footer, CartModal, WishlistModal).

---

## 4. Critical Issues — Detailed Findings

The following sections document every unique critical issue, the affected element(s) and page(s), the recommended fix, and the rationale for the remediation approach chosen.

> **Per the task instructions, no code modifications were made. This section documents what remediation WOULD be applied.**

---

### CRITICAL-01: Wishlist Button Uses `<div>` Instead of `<button>`

**Severity:** Critical  
**Issue Type:** Interactable Role (`WRONG_SEMANTIC_ROLE`) + Keyboard Accessible (`NOT_FOCUSABLE`)  
**WCAG:** 4.1.2 Name, Role, Value; 2.1.1 Keyboard  
**Affected Pages:** All pages (component appears in Header on every route)  
**Affected Element:**
```
Selector: .wishlist-btn
DOM: <div class="icon-btn wishlist-btn" style="cursor: pointer;">
       <svg aria-hidden="true">...</svg>
       <span>Wishlist</span>
     </div>
```
**Source File:** `src/components/Header.jsx:131`

**Issue Description:**  
The wishlist opener is implemented as a `<div>` with an `onClick` handler. Divs are not natively interactive and cannot receive keyboard focus via Tab. Screen readers do not announce it as a button. Keyboard-only users cannot activate it at all.

**Recommended Fix:**  
Replace the outer `<div>` with a `<button>` element. Add an `aria-label` so the button's purpose is clear even when the text is visually hidden for screen readers. The text "Wishlist" inside the element should remain visible or be provided through `aria-label`.

```jsx
// Before
<div className="icon-btn wishlist-btn" onClick={openWishlist} style={{cursor:'pointer'}}>
  <svg aria-hidden="true">...</svg>
  <span>Wishlist</span>
</div>

// After (recommended)
<button className="icon-btn wishlist-btn" onClick={openWishlist} aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} items` : ''}`}>
  <svg aria-hidden="true">...</svg>
  <span aria-hidden="true">Wishlist</span>
  {wishlistCount > 0 && <span className="wishlist-count" aria-hidden="true">{wishlistCount}</span>}
</button>
```

**Why this approach:** Using a native `<button>` element gives the control keyboard focus, correct ARIA role (`button`), and standard keyboard activation (Enter/Space) for free, without needing `role="button"`, `tabIndex`, or keyboard event handlers.

---

### CRITICAL-02: Search Icon Button Uses `<div>` Without Accessible Name

**Severity:** Critical  
**Issue Type:** Interactable Role (`WRONG_SEMANTIC_ROLE`) + Keyboard Accessible (`NOT_FOCUSABLE`) + Accessible Name (`NO_DESCRIPTIVE_TEXT`)  
**WCAG:** 4.1.2 Name, Role, Value; 2.1.1 Keyboard  
**Affected Pages:** All pages (Header component)  
**Affected Element:**
```
Selector: .icon-btn:nth-child(2)
DOM: <div class="icon-btn" style="cursor: pointer;">
       <svg aria-hidden="true">...</svg>
       <span aria-hidden="true">Search</span>
     </div>
```
**Source File:** `src/components/Header.jsx:140`

**Issue Description:**  
The search button is a `<div>` with `cursor: pointer`. The label text "Search" has `aria-hidden="true"`, which means screen readers receive absolutely no accessible name for this element. The element also has no keyboard focus or button role.

**Recommended Fix:**  
Replace with a `<button>` element, remove `aria-hidden` from the text label, or add an explicit `aria-label="Search"`.

```jsx
// After (recommended)
<button className="icon-btn" aria-label="Search">
  <svg aria-hidden="true">...</svg>
  <span aria-hidden="true">Search</span>
</button>
```

**Why this approach:** The simplest and most robust fix. `<button>` handles role, focus, and keyboard activation natively. The `aria-label` explicitly provides an accessible name without relying on visible text that might change.

---

### CRITICAL-03: Login Icon Button Uses `<div>` Without Accessible Name

**Severity:** Critical  
**Issue Type:** Interactable Role (`WRONG_SEMANTIC_ROLE`) + Keyboard Accessible (`NOT_FOCUSABLE`) + Accessible Name (`NO_DESCRIPTIVE_TEXT`)  
**WCAG:** 4.1.2 Name, Role, Value; 2.1.1 Keyboard  
**Affected Pages:** All pages (Header component)  
**Affected Element:**
```
Selector: .icon-btn:nth-child(4)
DOM: <div class="icon-btn" style="cursor: pointer;">
       <svg aria-hidden="true">...</svg>
       <span aria-hidden="true">Login</span>
     </div>
```
**Source File:** `src/components/Header.jsx:156`

**Issue Description:**  
The login/user-profile button uses a `<div>` with the label text "Login" hidden from screen readers via `aria-hidden="true"`. Identical pattern to the search button: no role, no keyboard access, no accessible name.

**Recommended Fix:**  
```jsx
<button className="icon-btn" aria-label="Login">
  <svg aria-hidden="true">...</svg>
  <span aria-hidden="true">Login</span>
</button>
```

**Why this approach:** Same rationale as CRITICAL-02. Native `<button>` with `aria-label` is the correct pattern for icon-only interactive controls.

---

### CRITICAL-04: Region/Flag Selector Uses `<div>` — No Role, No Focus

**Severity:** Critical  
**Issue Type:** Interactable Role (`WRONG_SEMANTIC_ROLE`) + Keyboard Accessible (`NOT_FOCUSABLE`)  
**WCAG:** 4.1.2 Name, Role, Value; 2.1.1 Keyboard  
**Affected Pages:** All pages (Header component)  
**Affected Element:**
```
Selector: .flag-group
DOM: <div class="flag-group" style="cursor: pointer;">
       <img src="...united-states-of-america.png" alt="United States Flag" width="24" height="24" />
       <img src="...canada.png" alt="Canada Flag" width="24" height="24" />
     </div>
```
**Source File:** `src/components/Header.jsx:161`

**Issue Description:**  
The country/region selector toggle is a `<div>` with an `onClick={() => {}}` (currently does nothing). It has no focusable role and no keyboard accessibility. While the images have `alt` text, the container itself has no semantic role announcing it as interactive.

**Recommended Fix:**  
```jsx
<button className="flag-group" onClick={handleRegionToggle} aria-label="Select region" aria-expanded={regionOpen}>
  <img src="/images/icons/united-states-of-america.png" alt="" aria-hidden="true" width="24" height="24" />
  <img src="/images/icons/canada.png" alt="" aria-hidden="true" width="24" height="24" />
</button>
```

Note: The flag images' `alt` attributes should be set to empty string (`alt=""`) since the button's `aria-label` already names the control. Announcing both "United States Flag" AND "Canada Flag" to screen reader users for a single toggle button would be confusing redundancy.

**Why this approach:** The button element is the correct semantic container for a toggle control. `aria-expanded` communicates state. Flag images become decorative (`alt=""`) because the button label conveys the purpose.

---

### CRITICAL-05: Footer "Sustainability" Link Uses `<div>` — No Role, No Focus

**Severity:** Critical  
**Issue Type:** Interactable Role (`WRONG_SEMANTIC_ROLE`) + Keyboard Accessible (`NOT_FOCUSABLE`)  
**WCAG:** 4.1.2 Name, Role, Value; 2.1.1 Keyboard  
**Affected Pages:** All pages (Footer component)  
**Affected Element:**
```
Selector: li:nth-child(3) > .footer-nav-item
DOM: <div class="footer-nav-item" style="cursor: pointer;">Sustainability</div>
```
**Source File:** `src/components/Footer.jsx:13`

**Issue Description:**  
A navigation item that looks and behaves like a link is rendered as a `<div>`. It has no role, no tab focus, and cannot be activated via keyboard.

**Recommended Fix:**  
```jsx
// Before
<li><div className="footer-nav-item" onClick={() => {}} style={{cursor:'pointer'}}>Sustainability</div></li>

// After (recommended)
<li><a href="/sustainability" className="footer-nav-item">Sustainability</a></li>
```

If Sustainability is a real route, use `<Link to="/sustainability">`. If it navigates externally, use `<a href="...">`.

**Why this approach:** Navigation items should use `<a>` or `<Link>` elements. They naturally convey "link" semantics, are keyboard focusable, and activated by Enter. If the item triggers a JavaScript function (not a real URL), use `<button>` instead.

---

### CRITICAL-06: Footer "FAQs" Link Uses `<div>` With Hidden Text

**Severity:** Critical  
**Issue Type:** Interactable Role (`WRONG_SEMANTIC_ROLE`) + Keyboard Accessible (`NOT_FOCUSABLE`) + Accessible Name (`NO_DESCRIPTIVE_TEXT`)  
**WCAG:** 4.1.2 Name, Role, Value; 2.1.1 Keyboard  
**Affected Pages:** All pages (Footer component)  
**Affected Element:**
```
Selector: .footer-list:nth-child(2) > li > .footer-nav-item
DOM: <div class="footer-nav-item" style="cursor: pointer;"><span aria-hidden="true">FAQs</span></div>
```
**Source File:** `src/components/Footer.jsx:18`

**Issue Description:**  
Like "Sustainability", this footer link is a `<div>`. Additionally, the label text "FAQs" is wrapped in `<span aria-hidden="true">`, making the element completely unnamed for screen readers.

**Recommended Fix:**  
```jsx
// After (recommended)
<li><a href="/faqs" className="footer-nav-item">FAQs</a></li>
```

Remove the `aria-hidden="true"` from the span or simply put the text directly in a proper `<a>` element.

**Why this approach:** A native anchor element is the correct semantic for footer navigation. The accessible name comes from its text content without any extra ARIA manipulation.

---

### CRITICAL-07: Cart Modal Close Button Has No Accessible Name

**Severity:** Critical  
**Issue Type:** Button Name (`AXE-BUTTON-NAME`)  
**WCAG:** 4.1.2 Name, Role, Value  
**Affected Pages:** Home Page, New/Products Page, Product Detail Page (pages where CartModal renders)  
**Affected Element:**
```
Selector: #cart-modal > div:nth-child(1) > button
DOM: <button class="..."><svg aria-hidden="true">...</svg></button>
```
**Source File:** `src/components/CartModal.jsx:56`

**Issue Description:**  
The close button inside the Cart modal drawer is icon-only (an "×" SVG with `aria-hidden="true"`). There is no visible text, no `aria-label`, and no `title` attribute. Screen readers announce it simply as "button" with no indication of its purpose.

**Recommended Fix:**  
```jsx
// After (recommended)
<button
  className={styles.closeBtn}
  onClick={closeCart}
  aria-label="Close shopping cart"
>
  <svg ... aria-hidden="true">...</svg>
</button>
```

**Why this approach:** Adding `aria-label` to the button element is the standard pattern for icon-only buttons. It overrides the computed accessible name calculation and gives screen readers a descriptive label. The SVG remains `aria-hidden` to prevent double-announcement.

---

### CRITICAL-08: Wishlist Modal Close Button Has No Accessible Name

**Severity:** Critical  
**Issue Type:** Button Name (`AXE-BUTTON-NAME`)  
**WCAG:** 4.1.2 Name, Role, Value  
**Affected Pages:** Home Page, New/Products Page, Product Detail Page  
**Affected Element:**
```
Selector: div[role="dialog"] > div:nth-child(1) > button
DOM: <button class="..."><svg aria-hidden="true">...</svg></button>
```
**Source File:** `src/components/WishlistModal.jsx:61`

**Issue Description:**  
Identical pattern to CRITICAL-07. The Wishlist modal's close button has no accessible name.

**Recommended Fix:**  
```jsx
<button
  ref={closeBtnRef}
  className={styles.closeBtn}
  onClick={closeWishlist}
  aria-label="Close wishlist"
>
  <svg aria-hidden="true">...</svg>
</button>
```

**Why this approach:** Same as CRITICAL-07. `aria-label` on the `<button>` provides the accessible name for screen reader users.

---

### CRITICAL-09: Hero Banner Image Missing `alt` Text

**Severity:** Critical  
**Issue Type:** Image Alt (`AXE-IMAGE-ALT`)  
**WCAG:** 1.1.1 Non-text Content  
**Affected Pages:** Home Page (`/`)  
**Affected Element:**
```
Selector: img[src$="New_Tees.png"]
DOM: <img src="/images/home/New_Tees.png">
```
**Source File:** `src/components/HeroBanner.jsx:18`

**Issue Description:**  
The hero banner image has no `alt` attribute at all. When an image lacks `alt`, screen readers announce the file name ("New_Tees.png"), which is meaningless to users. This is a WCAG 1.1.1 Level A failure.

**Recommended Fix:**  
```jsx
// Before
<img src={HERO_IMAGE} />

// After (recommended)
<img src={HERO_IMAGE} alt="Winter Basics — warm tees for cooler days" />
```

Or, if the image is purely decorative (the heading and paragraph already describe the content):
```jsx
<img src={HERO_IMAGE} alt="" role="presentation" />
```

**Why this approach:** Every image must have an `alt` attribute. If the image conveys meaningful content not already described in nearby text, the alt text should describe that content. If it is decorative, `alt=""` signals to screen readers to skip it entirely.

---

### CRITICAL-10: "The Drop" Section Image Missing `alt` Text

**Severity:** Critical  
**Issue Type:** Image Alt (`AXE-IMAGE-ALT`)  
**WCAG:** 1.1.1 Non-text Content  
**Affected Pages:** Home Page (`/`)  
**Affected Element:**
```
Selector: img[src$="2bags_charms1.png"]
DOM: <img src="/images/home/2bags_charms1.png" loading="lazy">
```
**Source File:** `src/components/TheDrop.jsx:13`

**Issue Description:**  
The "The Drop" promotional section shows a product image without any `alt` attribute. Screen readers will announce the file name.

**Recommended Fix:**  
```jsx
// After (recommended)
<img src={DROP_IMAGE} loading="lazy" alt="Limited edition plushie bag charms: Android bot, YouTube icon, and Super G" />
```

**Why this approach:** The adjacent paragraph describes the charms but doesn't name them visually. The `alt` text should describe what a sighted user sees — three specific plushie charms. This allows visually impaired users to understand the promotional image.

---

### CRITICAL-11: `<html>` Element Missing `lang` Attribute

**Severity:** Critical (classified Serious by Evinced, but WCAG Level A failure which is effectively critical for AT)  
**Issue Type:** HTML Has Lang (`AXE-HTML-HAS-LANG`)  
**WCAG:** 3.1.1 Language of Page  
**Affected Pages:** All pages (defined in `public/index.html`)  
**Affected Element:**
```
Selector: html
DOM: <html>  (no lang attribute)
```
**Source File:** `public/index.html:3`

**Issue Description:**  
The `<html>` element has no `lang` attribute. Screen readers use the language attribute to select the correct pronunciation engine/voice. Without it, the screen reader may mispronounce content or use the wrong voice entirely. This is a WCAG 3.1.1 Level A failure — one of the most fundamental accessibility requirements.

**Recommended Fix:**  
```html
<!-- Before -->
<html>

<!-- After (recommended) -->
<html lang="en">
```

**Why this approach:** The `lang` attribute is a mandatory attribute for the root `<html>` element. Since this is an English-language site, `lang="en"` is the correct value. This single-character change fixes the issue for every single page simultaneously.

---

### CRITICAL-12: `aria-expanded="yes"` — Invalid Attribute Value on `<h1>` Elements

**Severity:** Critical  
**Issue Type:** ARIA Valid Attribute Value (`AXE-ARIA-VALID-ATTR-VALUE`)  
**WCAG:** 4.1.2 Name, Role, Value  
**Affected Pages:** Home Page (`/`)  
**Affected Elements:**
```
Selector: .featured-card:nth-child(1) > .featured-card-info > h1
DOM: <h1 aria-expanded="yes">Keep on Truckin'</h1>

Selector: .featured-card:nth-child(2) > .featured-card-info > h1
DOM: <h1 aria-expanded="yes">Limited edition and traveling fast</h1>
```
**Source File:** `src/components/FeaturedPair.jsx:46`

**Issue Description:**  
`aria-expanded` accepts only `"true"` or `"false"` (or no value). The value `"yes"` is not a valid boolean string in ARIA, so it is parsed as `undefined`/`invalid` and screen readers ignore or mishandle it. Furthermore, `aria-expanded` is only meaningful on interactive elements that control a collapsible region — using it on a heading (`<h1>`) is semantically incorrect.

**Recommended Fix:**  
Remove `aria-expanded` entirely from the `<h1>` elements, since a static heading is not an interactive disclosure control:
```jsx
// Before
<h1 aria-expanded="yes">{item.title}</h1>

// After (recommended)
<h1>{item.title}</h1>
```

**Why this approach:** `aria-expanded` communicates the open/closed state of a widget (dropdown, accordion, disclosure). A static heading is never "expanded" or "collapsed". Removing the attribute eliminates invalid ARIA, reduces screen reader confusion, and keeps the heading semantics clean.

---

### CRITICAL-13: `role="slider"` Missing Required ARIA Attributes

**Severity:** Critical  
**Issue Type:** ARIA Required Attributes (`AXE-ARIA-REQUIRED-ATTR`)  
**WCAG:** 4.1.2 Name, Role, Value  
**Affected Pages:** Home Page (`/`)  
**Affected Element:**
```
Selector: .drop-popularity-bar
DOM: <div role="slider" aria-label="Popularity indicator" class="drop-popularity-bar"></div>
```
**Source File:** `src/components/TheDrop.jsx:19`

**Issue Description:**  
The ARIA `slider` role requires three mandatory attributes: `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. Without them, the accessibility tree is incomplete and screen readers cannot convey the slider's current or range values. Additionally, a static decorative bar that simply displays a visual indicator should not use `role="slider"` at all, since that implies it is interactive.

**Recommended Fix (Option A — decorative use):**  
If the bar is purely visual (not interactive), remove the ARIA role entirely:
```jsx
// After (recommended for decorative)
<div className="drop-popularity-bar" aria-hidden="true"></div>
```

**Recommended Fix (Option B — functional slider):**  
If it represents a meaningful value (e.g., 85% popularity):
```jsx
<div
  role="slider"
  aria-label="Popularity indicator"
  aria-valuenow={85}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuetext="85% popular"
  className="drop-popularity-bar"
  tabIndex={0}
></div>
```

**Why this approach:** Option A is preferred because the element appears to be a decorative bar, not an interactive input. Marking it `aria-hidden="true"` removes it from the accessibility tree entirely, preventing screen readers from encountering an incomplete or misleading widget. If the element must communicate a meaningful value without being interactive, `role="meter"` with `aria-valuenow/min/max` would be semantically more appropriate.

---

### CRITICAL-14: `aria-relevant="changes"` — Invalid Attribute Value on `<ul>`

**Severity:** Critical  
**Issue Type:** ARIA Valid Attribute Value (`AXE-ARIA-VALID-ATTR-VALUE`)  
**WCAG:** 4.1.2 Name, Role, Value  
**Affected Pages:** Product Detail Page (`/product/:id`)  
**Affected Element:**
```
Selector: ul[aria-relevant="changes"]
DOM: <ul aria-relevant="changes" aria-live="polite">...</ul>
```
**Source File:** `src/pages/ProductPage.jsx:145`

**Issue Description:**  
The `aria-relevant` attribute accepts only space-separated tokens from: `additions`, `removals`, `text`, `all`. The value `"changes"` is not a valid token. Browsers and screen readers will ignore it, silently breaking the intended live-region behavior.

**Recommended Fix:**  
Replace `"changes"` with the correct token(s). "Changes to text content" is expressed as `"text"` or `"additions text"`:
```jsx
// Before
<ul aria-relevant="changes" aria-live="polite">

// After (recommended)
<ul aria-relevant="additions text" aria-live="polite">
```

Or simply remove `aria-relevant` to use the default (`additions text`):
```jsx
<ul aria-live="polite">
```

**Why this approach:** `aria-live="polite"` already announces new content additions by default. Unless the specific subset of "removals" also needs to be announced, `aria-relevant` can be omitted. If only additions matter, `"additions text"` is the precise correct value. Removing an invalid attribute is always preferable to leaving it.

---

### CRITICAL-15: "Continue" (Checkout Basket → Shipping) Uses `<div>` — No Role, No Focus

**Severity:** Critical  
**Issue Type:** Interactable Role (`WRONG_SEMANTIC_ROLE`) + Keyboard Accessible (`NOT_FOCUSABLE`)  
**WCAG:** 4.1.2 Name, Role, Value; 2.1.1 Keyboard  
**Affected Pages:** Checkout Page (`/checkout`) — basket step  
**Affected Element:**
```
Selector: .checkout-continue-btn
DOM: <div class="checkout-continue-btn" style="cursor: pointer;">Continue</div>
```
**Source File:** `src/pages/CheckoutPage.jsx:156`

**Issue Description:**  
The primary call-to-action to advance from the basket step to the shipping step is a `<div>`. It cannot be reached by Tab key or activated by Enter/Space. This is a critical barrier: keyboard-only users cannot proceed through checkout.

**Recommended Fix:**  
```jsx
// Before
<div className="checkout-continue-btn" onClick={() => setStep('shipping')} style={{ cursor: 'pointer' }}>
  Continue
</div>

// After (recommended)
<button type="button" className="checkout-continue-btn" onClick={() => setStep('shipping')}>
  Continue
</button>
```

**Why this approach:** This is the most critical interaction on the checkout page. A `<button>` element ensures keyboard users can Tab to it and activate it with Enter or Space. No `aria-*` attributes are needed since the button has visible, descriptive text content.

---

### CRITICAL-16: "← Back to Cart" Uses `<div>` — No Role, No Focus

**Severity:** Critical  
**Issue Type:** Interactable Role (`WRONG_SEMANTIC_ROLE`) + Keyboard Accessible (`NOT_FOCUSABLE`)  
**WCAG:** 4.1.2 Name, Role, Value; 2.1.1 Keyboard  
**Affected Pages:** Checkout Page (`/checkout`) — shipping step  
**Affected Element:**
```
Selector: form > div > div
DOM: <div class="checkout-back-btn" style="cursor: pointer;">← Back to Cart</div>
```
**Source File:** `src/pages/CheckoutPage.jsx:297`

**Issue Description:**  
The "← Back to Cart" navigation control in the shipping form is a `<div>`. Keyboard-only users cannot reach or activate it.

**Recommended Fix:**  
```jsx
// After (recommended)
<button type="button" className="checkout-back-btn" onClick={() => setStep('basket')}>
  ← Back to Cart
</button>
```

**Why this approach:** `<button type="button">` is appropriate because this action changes application state (step) rather than navigating to a new URL. Prevents unintended form submission.

---

### CRITICAL-17: "← Back to Shop" On Order Confirmation Uses `<div>` — No Role, No Focus

**Severity:** Critical  
**Issue Type:** Interactable Role (`WRONG_SEMANTIC_ROLE`) + Keyboard Accessible (`NOT_FOCUSABLE`)  
**WCAG:** 4.1.2 Name, Role, Value; 2.1.1 Keyboard  
**Affected Pages:** Order Confirmation (`/order-confirmation`)  
**Affected Element:**
```
Selector: .confirm-home-link
DOM: <div class="confirm-home-link" style="cursor: pointer;">← Back to Shop</div>
```
**Source File:** `src/pages/OrderConfirmationPage.jsx:40`

**Issue Description:**  
The post-purchase "Back to Shop" navigation action is a non-interactive `<div>`. The `onClick={() => {}}` handler is also a no-op. Keyboard users are stranded on the confirmation page.

**Recommended Fix:**  
```jsx
// After (recommended — navigates to home)
<Link to="/" className="confirm-home-link">← Back to Shop</Link>
```

**Why this approach:** This is a navigation link (goes to another route), so `<Link>` (which renders as `<a>`) is the correct semantic element. It is inherently focusable, announces as "link", and is activated with Enter.

---

### CRITICAL-18: Products Page Filter Options Use `<div>` — Not Keyboard Accessible

**Severity:** Critical  
**Issue Type:** Interactable Role (`WRONG_SEMANTIC_ROLE`) + Keyboard Accessible (`NOT_FOCUSABLE`)  
**WCAG:** 4.1.2 Name, Role, Value; 2.1.1 Keyboard  
**Affected Pages:** New/Products Page (`/shop/new`)  
**Affected Elements (examples):**
```
Selector: .filter-group:nth-child(2) > .filter-options > .filter-option:nth-child(1)
DOM: <div class="filter-option"><div class="custom-checkbox"></div>
       <span class="filter-option-label">1.00 - 19.99<span class="filter-count">(8)</span></span>
     </div>
```
(Also: Size filters XS/SM/MD/LG/XL and Brand filters Android/Google/YouTube)  
**Source File:** `src/components/FilterSidebar.jsx:74, 116, 156`

**Issue Description:**  
All filter options (price ranges, sizes, brands) are implemented as `<div>` elements with `onClick` handlers. None are keyboard accessible. Users who rely on keyboard navigation cannot apply any product filters. This blocks a key e-commerce interaction for keyboard users.

**Recommended Fix:**  
Replace `<div class="filter-option">` with native `<input type="checkbox">` wrapped in `<label>`, or use `<button role="checkbox">` with `aria-checked`:

```jsx
// After (recommended — using native checkbox)
{PRICE_RANGES.map((range) => {
  const checked = selectedPrices.some((r) => r.label === range.label);
  const count = priceCount(range);
  const id = `price-${range.label.replace(/\s/g, '-')}`;
  return (
    <div key={range.label} className="filter-option">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={() => onPriceChange(range)}
        className="filter-checkbox-input"
      />
      <label htmlFor={id} className="filter-option-label">
        {range.label}
        <span className="filter-count">({count})</span>
      </label>
    </div>
  );
})}
```

**Why this approach:** Native `<input type="checkbox">` provides keyboard focus, toggle behavior (Space to check/uncheck), correct ARIA role (`checkbox`), and the `aria-checked` state — all for free. Associating it with a `<label>` also increases the click target size and improves mobile usability. The custom checkbox visual can be styled via CSS while keeping native semantics.

---

### CRITICAL-19: Sort Button Has Incorrect Role (`Element has incorrect role`) and Missing Contextual Label

**Severity:** Critical  
**Issue Type:** Element Has Incorrect Role + Missing Contextual Labeling  
**WCAG:** 4.1.2 Name, Role, Value  
**Affected Pages:** New/Products Page (`/shop/new`)  
**Affected Element:**
```
Selector: .sort-btn
DOM: <button class="sort-btn">Sort by Relevance (Default)<svg ...></svg></button>
```
**Source File:** `src/pages/NewPage.jsx` (sort button implementation)

**Issue Description:**  
Evinced identified that the sort button's role is incorrect relative to how it functions (it controls a combobox/listbox pattern but is declared as a plain `<button>`) and lacks contextual label information that would help screen readers understand its relationship to the sorted content.

**Recommended Fix:**  
Implement the sort control as a proper combobox or `<select>` element:

```jsx
// Option A: Use native <select> (most accessible)
<label htmlFor="sort-select" className="sort-label">Sort by:</label>
<select
  id="sort-select"
  className="sort-select"
  value={sortBy}
  onChange={(e) => setSortBy(e.target.value)}
>
  <option value="relevance">Relevance (Default)</option>
  <option value="price-asc">Price: Low to High</option>
  <option value="price-desc">Price: High to Low</option>
  <option value="newest">Newest</option>
</select>

// Option B: If custom UI is required, use proper ARIA combobox pattern
<button
  id="sort-btn"
  className="sort-btn"
  aria-haspopup="listbox"
  aria-expanded={sortOpen}
  aria-controls="sort-listbox"
  aria-label={`Sort by: ${currentSortLabel}`}
>
  {currentSortLabel}
</button>
<ul id="sort-listbox" role="listbox" aria-labelledby="sort-btn">
  {sortOptions.map(opt => (
    <li key={opt.value} role="option" aria-selected={sortBy === opt.value}>
      {opt.label}
    </li>
  ))}
</ul>
```

**Why this approach:** A native `<select>` element is the most accessible and requires the least code. If a custom styled dropdown is required, the ARIA combobox pattern with `aria-haspopup="listbox"`, `aria-expanded`, and `role="listbox"` on the dropdown is the W3C-recommended approach. The label provides context about what is being sorted.

---

## 5. Summary Table of Critical Issues Found

| ID | Issue Type | Source Element | Source File | Affected Pages |
|----|-----------|---------------|------------|---------------|
| CRITICAL-01 | Interactable Role + Keyboard Accessible | `.wishlist-btn` (`<div>`) | `Header.jsx:131` | All pages |
| CRITICAL-02 | Interactable Role + Keyboard Accessible + Accessible Name | `.icon-btn:nth-child(2)` (Search `<div>`) | `Header.jsx:140` | All pages |
| CRITICAL-03 | Interactable Role + Keyboard Accessible + Accessible Name | `.icon-btn:nth-child(4)` (Login `<div>`) | `Header.jsx:156` | All pages |
| CRITICAL-04 | Interactable Role + Keyboard Accessible | `.flag-group` (`<div>`) | `Header.jsx:161` | All pages |
| CRITICAL-05 | Interactable Role + Keyboard Accessible | `li .footer-nav-item` "Sustainability" `<div>` | `Footer.jsx:13` | All pages |
| CRITICAL-06 | Interactable Role + Keyboard Accessible + Accessible Name | `.footer-list:nth-child(2) .footer-nav-item` "FAQs" `<div>` | `Footer.jsx:18` | All pages |
| CRITICAL-07 | Button Name (No Accessible Name) | Cart modal close `<button>` | `CartModal.jsx:56` | Home, New, Product pages |
| CRITICAL-08 | Button Name (No Accessible Name) | Wishlist modal close `<button>` | `WishlistModal.jsx:61` | Home, New, Product pages |
| CRITICAL-09 | Image Alt Missing | `<img src="New_Tees.png">` in HeroBanner | `HeroBanner.jsx:18` | Home Page |
| CRITICAL-10 | Image Alt Missing | `<img src="2bags_charms1.png">` in TheDrop | `TheDrop.jsx:13` | Home Page |
| CRITICAL-11 | HTML Missing Lang | `<html>` element | `public/index.html:3` | All pages |
| CRITICAL-12 | ARIA Valid Attr Value (`aria-expanded="yes"`) | `<h1>` in FeaturedPair | `FeaturedPair.jsx:46` | Home Page |
| CRITICAL-13 | ARIA Required Attributes (`role="slider"` missing attrs) | `.drop-popularity-bar` | `TheDrop.jsx:19` | Home Page |
| CRITICAL-14 | ARIA Valid Attr Value (`aria-relevant="changes"`) | `<ul>` in ProductPage | `ProductPage.jsx:145` | Product Detail Page |
| CRITICAL-15 | Interactable Role + Keyboard Accessible | `.checkout-continue-btn` (`<div>`) | `CheckoutPage.jsx:156` | Checkout Page |
| CRITICAL-16 | Interactable Role + Keyboard Accessible | `.checkout-back-btn` (`<div>`) | `CheckoutPage.jsx:297` | Checkout Page |
| CRITICAL-17 | Interactable Role + Keyboard Accessible | `.confirm-home-link` (`<div>`) | `OrderConfirmationPage.jsx:40` | Order Confirmation |
| CRITICAL-18 | Interactable Role + Keyboard Accessible | Filter options (`<div>`) × 12+ | `FilterSidebar.jsx:74,116,156` | New/Products Page |
| CRITICAL-19 | Incorrect Role + Missing Contextual Label | `.sort-btn` | `NewPage.jsx` (sort button) | New/Products Page |

---

## 6. Non-Critical Issues (Not Remediated)

The following issues were detected but classified as **Serious**, **Best Practice**, or **Needs Review** severity. No code changes were made for these issues per the audit scope.

### 6.1 Serious Issues — Color Contrast

All color contrast issues are classified as **Serious** (WCAG 1.4.3 Level AA).

| Selector | Page | Description |
|----------|------|-------------|
| `.hero-content > p` | Home Page | Hero subheading text has insufficient contrast against the banner background image |
| `.hero-banner` | Home Page | General contrast issue across the hero banner section |
| `p[lang="zz"]` | Home Page | Contrast issue on "The Drop" paragraph text |
| `.filter-count` spans (×11) | New/Products Page | Filter option count badges (e.g., "(8)", "(4)") have low contrast against the filter background |
| `.new-page` | New/Products Page | Page-level contrast issue on the products listing page |
| `.products-found` | New/Products Page | "X products found" count text has insufficient contrast |
| `p:nth-child(4)` | Product Detail Page | A paragraph on the product detail page has insufficient contrast |
| `#main-content > div` | Product Detail Page | General contrast issue on product detail page background |
| `.checkout-step:nth-child(3) > .step-label` | Checkout Page | "Shipping & Payment" step label has low contrast (inactive step) |
| `body` | Checkout Page | General contrast issue on checkout page body |
| `.summary-tax-note` | Checkout Page | "Taxes calculated at next step" note has insufficient contrast |
| `aside` (order summary) | Checkout Page | Order summary sidebar has contrast issues |
| `.confirm-order-id-label` | Order Confirmation | "Order ID" label text has insufficient contrast |
| `.confirm-order-id-box` | Order Confirmation | The order ID display box has contrast issues |

### 6.2 Serious Issue — Missing `lang` Attribute (Also Critical per WCAG)

| Selector | Page | Description |
|----------|------|-------------|
| `html` | All pages | `<html>` element has no `lang` attribute (also listed as CRITICAL-11 above) |

### 6.3 Serious Issue — Invalid Language Tag

| Selector | Page | Description |
|----------|------|-------------|
| `p[lang="zz"]` | Home Page | The "The Drop" section has `lang="zz"` on a paragraph. `"zz"` is not a valid BCP 47 language tag. This was an intentional demo issue. **Fix:** Remove the `lang` attribute or change to `lang="en"`.  Source: `src/components/TheDrop.jsx:21` |

### 6.4 Best Practice Issues — Navigation Menu Role Pattern

| Selector | Page | Description |
|----------|------|-------------|
| `.has-submenu:nth-child(2..6) > .submenu[role="menu"]` | New/Products Page | Submenu dropdown lists use `role="menu"`, which implies an application menu (like a file menu bar) rather than a site navigation structure. W3C recommends using a plain `<ul>` within the nav, with `aria-haspopup="true"` on the parent link, rather than `role="menu"`. **Fix:** Remove `role="menu"` from submenus; the `<nav>` landmark and semantic list structure are sufficient. Source: `src/components/Header.jsx:196` |

### 6.5 Needs Review — Combobox Analysis Skipped

| Selector | Page | Description |
|----------|------|-------------|
| `.sort-btn` | New/Products Page | The Evinced combobox analyzer could not expand the sort dropdown programmatically, so combobox-specific analysis was skipped. The sort button was flagged under CRITICAL-19 for incorrect role. Manual review of the sort dropdown's keyboard interaction and ARIA pattern is recommended. |

### 6.6 Heading Order Issues (Not Detected by Evinced as Critical, but Present in Source)

The following heading hierarchy violations are intentional demo issues present throughout the codebase (noted in source comments as `A11Y-GEN3 heading-order`). They were not reported as Critical by Evinced but represent WCAG 1.3.1 and 2.4.6 issues:

| Component | Issue | Correct Level |
|-----------|-------|--------------|
| `HeroBanner.jsx:12` | `<h3>` used as page-level heading | Should be `<h1>` |
| `PopularSection.jsx:44` | `<h4>` used as section heading | Should be `<h2>` |
| `PopularSection.jsx:50` | `<h1>` inside product cards | Should be `<h3>` |
| `FeaturedPair.jsx:46` | `<h1>` inside feature cards | Should be `<h3>` |
| `TheDrop.jsx:17` | `<h4>` as section heading | Should be `<h2>` |
| `CartModal.jsx:49` | `<h5>` as drawer heading | Should be `<h2>` |
| `WishlistModal.jsx:54` | `<h5>` as drawer heading | Should be `<h2>` |
| `CheckoutPage.jsx:74` | `<h3>` as page-level heading | Should be `<h1>` |
| `CheckoutPage.jsx:172` | `<h3>` as page-level heading | Should be `<h1>` |
| `CheckoutPage.jsx:141` | `<h5>` as section heading | Should be `<h2>` |
| `ProductPage.jsx:63` | `<h3>` as page-level heading | Should be `<h1>` |
| `OrderConfirmationPage.jsx:27` | `<h3>` as page-level heading | Should be `<h1>` |

### 6.7 Other Non-Critical Issues (Not Detected by Evinced but Present in Source)

These are intentional demo issues (`A11Y-GEN2`, `A11Y-GEN3`, `A11Y-UNDETECTABLE`) noted in the codebase that Evinced did not classify as Critical/Serious:

| Issue | Location | Description |
|-------|----------|-------------|
| Cart modal missing `role="dialog"` and `aria-modal` | `CartModal.jsx:41` | Modal drawer has no dialog role or aria-modal — AT cannot identify it as a modal |
| Cart modal no focus trap / no Escape key close | `CartModal.jsx:17` | Focus not managed when cart opens; Escape key does not close it |
| Cart modal no accessible label | `CartModal.jsx:41` | The drawer has no `aria-label` or `aria-labelledby` |
| Cart close button no accessible name | `CartModal.jsx:55` | Icon-only `<button>` with no `aria-label` (also CRITICAL-07) |
| Quantity buttons generic labels in CartModal | `CartModal.jsx:91` | `−` and `+` buttons have no `aria-label` identifying which item they affect |
| Remove item button no accessible name in CartModal | `CartModal.jsx:102` | Icon-only remove button has no `aria-label` |
| Wishlist modal close button no accessible name | `WishlistModal.jsx:61` | Icon-only `<button>` with no `aria-label` (also CRITICAL-08) |
| Wishlist remove item uses `<div>` | `WishlistModal.jsx:128` | Remove button is a `<div>` with no role or tabindex |
| Wishlist item link non-descriptive label `"Click here"` | `WishlistModal.jsx:111` | Image link `aria-label="Click here"` tells AT users nothing about the destination |
| Cart `aria-live` region absent for count changes | `Header.jsx:152` | Cart count badge is `aria-hidden="true"`, no live region — AT users don't hear count changes |
| Navigation reverse tab order | `Header.jsx:175` | `tabIndex` is set to inverse order, so keyboard tab sequence is reversed from visual order |
| Checkout form validation errors have no `role="alert"` | `CheckoutPage.jsx:200` | Validation error messages appear in DOM without live region announcement |
| Checkout quantity buttons generic labels | `CheckoutPage.jsx:104` | `aria-label="Minus"/"Plus"/"Number"` don't identify which cart item they affect |
| Product "Add to cart" generic label | `ProductPage.jsx:114` | `aria-label="Add to cart"` doesn't include the product name |
| Product wishlist generic label | `ProductPage.jsx:123` | `aria-label="Wishlist action"` is not descriptive |
| Product detail `aria-relevant="changes"` invalid | `ProductPage.jsx:145` | (Also CRITICAL-14) |
| Product detail `role="meter"` missing required attributes | `ProductPage.jsx:151` | `<span role="meter">` missing `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| Filter section `filter-section-title` duplicate ID | `FilterSidebar.jsx:58,100` | `id="filter-section-title"` used twice — ARIA `aria-describedby` points to first match only |
| Filter section buttons missing `aria-expanded`/`aria-controls` | `FilterSidebar.jsx:52,94,136` | Disclosure buttons don't announce open/closed state to AT |
| FeaturedPair duplicate `id="featured-card-img"` and `id="featured-card-label"` | `FeaturedPair.jsx:39,43` | Same IDs rendered twice in DOM; ARIA references will always resolve to the first element |
| FeaturedPair hidden `role="checkbox"` missing `aria-checked` | `FeaturedPair.jsx:48` | Hidden element with `role="checkbox"` is missing required `aria-checked` attribute |
| Popular section "shop" links use `<div>` with hidden text | `PopularSection.jsx:54` | Non-interactive divs with `onClick` and `aria-hidden` span text |
| FeaturedPair meaningful sequence broken | `FeaturedPair.jsx:37` | Image placed before heading in DOM; visual order reversed by CSS — violates WCAG 1.3.2 |
| `lang="zz"` invalid language code | `TheDrop.jsx:21` | Not a valid BCP 47 tag (also listed in 6.3) |

---

## 7. Prioritized Remediation Roadmap

Based on severity and user impact, the recommended fix order is:

**Immediate Priority (All block accessibility for specific user groups):**
1. `public/index.html` — Add `lang="en"` to `<html>` element (CRITICAL-11)
2. `Header.jsx` — Convert all 4 `<div>` header controls to `<button>` elements with `aria-label` (CRITICAL-01, 02, 03, 04)
3. `Footer.jsx` — Convert footer nav items to `<a>` or `<Link>` elements (CRITICAL-05, 06)
4. `CheckoutPage.jsx` — Convert Continue, Back to Cart `<div>`s to `<button>` elements (CRITICAL-15, 16)
5. `OrderConfirmationPage.jsx` — Convert "Back to Shop" `<div>` to `<Link>` (CRITICAL-17)
6. `CartModal.jsx` / `WishlistModal.jsx` — Add `aria-label` to close buttons (CRITICAL-07, 08)

**High Priority:**
7. `HeroBanner.jsx` / `TheDrop.jsx` — Add `alt` text to images (CRITICAL-09, 10)
8. `FeaturedPair.jsx` — Remove invalid `aria-expanded="yes"` from `<h1>` (CRITICAL-12)
9. `TheDrop.jsx` — Fix `role="slider"` missing required ARIA attributes (CRITICAL-13)
10. `ProductPage.jsx` — Fix `aria-relevant="changes"` invalid value (CRITICAL-14)
11. `FilterSidebar.jsx` — Convert filter `<div>` checkboxes to native `<input type="checkbox">` (CRITICAL-18)
12. Sort button — Implement proper combobox/select pattern (CRITICAL-19)

**Medium Priority (Serious issues):**
13. CSS — Fix color contrast ratios across filter counts, hero, checkout, confirmation pages
14. `TheDrop.jsx` — Remove or correct `lang="zz"` attribute

**Lower Priority (Best Practice, heading order, non-critical patterns):**
15. Heading hierarchy — Fix all mismatched heading levels across pages
16. Navigation — Remove `role="menu"` from site nav submenus
17. Cart/Wishlist modals — Add `role="dialog"`, `aria-modal`, focus trap, Escape key handler
18. Interactive elements — Add descriptive `aria-label` to product quantity/action buttons

---

## 8. Raw Audit Data

All machine-readable Evinced JSON reports are stored in:
- `tests/e2e/test-results/home-page-report.json`
- `tests/e2e/test-results/new-page-report.json`
- `tests/e2e/test-results/product-page-report.json`
- `tests/e2e/test-results/checkout-page-report.json`
- `tests/e2e/test-results/order-confirmation-report.json`

The Playwright test that generated these reports is:
- `tests/e2e/specs/a11y-audit-all-pages.spec.ts`

---

*Report generated by automated Evinced accessibility audit via Playwright. All issues verified against the live development server (`http://localhost:3000`) running the React application.*

#!/bin/bash
# ACCEPTANCE TEST CHECKLIST FOR INTERSACKS APPAREL MVP
# Run this checklist manually in the browser to verify all functionality

## HOMEPAGE TESTS

### Navigation & Header
- [ ] Homepage loads without console errors (F12)
- [ ] Announcement bar displays "NEW DROPS COMING SOON — BUILT DIFFERENT."
- [ ] Logo "INTERSACKS" is clickable and links to home
- [ ] Navigation links: Home, Shop, Designs, About, Contact, Cart
- [ ] Cart badge displays "0" initially
- [ ] Mobile hamburger menu appears at 768px and below
- [ ] Mobile menu opens/closes and closes when link clicked
- [ ] Navigation links have visible active state and underline animation
- [ ] Sticky navbar appears after scrolling 60px

### Hero Section
- [ ] Large hero section with gradient background
- [ ] Title "INTERSACKS APPAREL" with blue accent
- [ ] Tagline "Built Different."
- [ ] Subtitle "Choose your garment. Choose your design. Make it yours."
- [ ] Two CTA buttons: "START DESIGNING" → product.html
- [ ] "VIEW DESIGNS" button scrolls to designs section
- [ ] Scroll hint at bottom with animated line
- [ ] Hero is responsive on mobile (text sizes adjust)

### Featured Drop Section
- [ ] "Panther Collection" section displays
- [ ] Section title, eyebrow, and description visible
- [ ] Product image displays or shows placeholder
- [ ] "Limited Release" badge appears
- [ ] "CUSTOMIZE THIS DROP" button links to product.html
- [ ] Stock status badge visible

### Shop by Garment Section
- [ ] Section title "Shop By Garment" displays
- [ ] Dynamically rendered garment cards from data.js
- [ ] Each card shows: garment image, name, price, colour count
- [ ] "CUSTOMIZE" button links to product.html?garment=id
- [ ] Cards are responsive (4 cols desktop, 2 cols tablet, 1 col mobile)
- [ ] At least 4 garments visible (Classic Tee, Oversized, Long Sleeve, Hoodie)
- [ ] Hover effect on cards (border color changes to blue, slight lift)

### Shop by Design Section
- [ ] Section title "Choose Your Design" displays
- [ ] Filter buttons appear: All, Graphic, Logo, Typography, Limited, New
- [ ] Filter buttons are clickable and highlight active state
- [ ] All button shows all designs initially
- [ ] Clicking category filters designs dynamically (no page reload)
- [ ] Designs render from data.js
- [ ] Each design card shows: image, name, category, price modifier
- [ ] "USE THIS DESIGN" button functional
- [ ] Placeholder designs show "Coming Soon" overlay and are grayed out
- [ ] No broken images (fallback error handling works)

### How It Works Section
- [ ] 4-step section displays
- [ ] Step numbers (01, 02, 03, 04) visible
- [ ] Titles: Choose Garment, Choose Design, Make It Yours, Place Order
- [ ] Descriptions for each step
- [ ] Responsive layout (4 cols desktop, 2 cols tablet, 1 col mobile)
- [ ] Cards have border and hover effects

### Why InterSacks Section
- [ ] 4 feature cards: Premium Quality, Unique Designs, Small Batch, Made with Passion
- [ ] Feature icons visible
- [ ] Hover effects on cards
- [ ] Responsive grid layout

### About Section
- [ ] Section title "Not Fast Fashion. Never Was."
- [ ] About text and description
- [ ] "View Collection" button
- [ ] Image displays or shows placeholder
- [ ] Section responsive on mobile (text centered)

### Reviews/Instagram Section
- [ ] Section title "@InterSacks"
- [ ] 4 image grid (or placeholder images)
- [ ] Responsive: 4 cols desktop, 2 cols mobile
- [ ] "Follow on Instagram" button

### Contact Section
- [ ] 4 contact cards: Email, WhatsApp, Instagram, Facebook
- [ ] Each card has icon and link
- [ ] Cards are clickable links
- [ ] Responsive layout (4 cols desktop, 2 cols tablet, 1 col mobile)
- [ ] Hover effects visible

### Footer
- [ ] Footer displays brand name and tagline
- [ ] Quick links present: Home, Shop, Designs, About, Contact
- [ ] Copyright notice
- [ ] "Built Different" tagline
- [ ] Footer responsive (vertical layout on mobile)

### Back to Top Button
- [ ] Back to top button appears after scrolling 400px
- [ ] Button disappears when near top
- [ ] Clicking smoothly scrolls to top
- [ ] Button is accessible on mobile

## PRODUCT CUSTOMIZATION PAGE (product.html)

### Page Load
- [ ] product.html loads without errors
- [ ] Navigation bar present and functional
- [ ] Page title "Customize | InterSacks Apparel"

### Step 1: Garment Selection
- [ ] Garment selector shows all active garments
- [ ] First garment pre-selected
- [ ] Each option shows name and price
- [ ] Selecting garment updates the customizer state
- [ ] Colour selector updates when garment changes

### Step 2: Colour Selection
- [ ] Colour swatches appear for selected garment
- [ ] Swatches are circles with actual colours
- [ ] First colour pre-selected
- [ ] Clicking colour updates the preview
- [ ] Colour name tooltip appears on hover
- [ ] Preview image updates immediately

### Step 3: Size Selection
- [ ] Size selector shows sizes for garment
- [ ] Grid of size buttons (S, M, L, XL, 2XL, etc.)
- [ ] First size pre-selected
- [ ] Selecting size updates summary

### Step 4: Design Selection
- [ ] Design selector shows compatible designs only
- [ ] "No Design" option appears first
- [ ] Each design shows: image, name, category, price
- [ ] Selecting design shows placement selector
- [ ] Placement selector hidden if no design selected
- [ ] Design update reflects in preview

### Step 5: Placement (Conditional)
- [ ] Appears only when design is selected
- [ ] Shows placement options (Front Small, Front Centre, Back Large)
- [ ] Only shows compatible placements for selected design
- [ ] Selecting placement updates design position in preview
- [ ] Placement clearly visible in summary

### Live Preview
- [ ] Product preview displays with garment mockup
- [ ] Preview updates when garment/colour changes
- [ ] Design overlay appears when design selected
- [ ] Design placement is correct (matches CSS styles)
- [ ] Front/Back toggle buttons visible
- [ ] Clicking FRONT/BACK switches view
- [ ] Back view shows correct mockup and placement
- [ ] Preview is centered and visible on all screen sizes

### Order Summary
- [ ] Summary card displays: Garment, Colour, Size, Design, Placement
- [ ] Price calculated correctly (Garment + Design)
- [ ] Price displayed in Rands (R399 format)
- [ ] "ADD TO BAG" button visible
- [ ] Clicking "ADD TO BAG" adds item to cart
- [ ] Button shows "✓ ADDED TO BAG" feedback for 2 seconds
- [ ] Cart badge updates with new item count

### Mobile Customizer
- [ ] All steps accessible on mobile (no horizontal scroll)
- [ ] Preview readable and properly sized
- [ ] Colour swatches fit on screen
- [ ] Buttons are large enough to tap (44px minimum)
- [ ] Summary is visible below preview

## CART PAGE (cart.html)

### Cart Display
- [ ] cart.html loads without errors
- [ ] Page title "YOUR BAG"
- [ ] Navigation bar present
- [ ] Cart items display if items exist

### Empty Cart
- [ ] Empty state displays if cart is empty
- [ ] Message "Your bag is empty"
- [ ] "Continue Shopping" button links to index.html

### Cart Items List (After Adding Items)
- [ ] Add 2-3 items to cart from product.html
- [ ] Items display in cart with all details:
  - Garment name
  - Colour
  - Size
  - Design name (if applicable)
  - Placement (if applicable)
  - Unit price
- [ ] Quantity controls present (-/input/+ buttons)
- [ ] Remove button (X) works
- [ ] Each item shows total (unit price × qty)

### Cart Summary
- [ ] Subtotal displayed
- [ ] "Delivery: To be confirmed" shown
- [ ] Total price calculated correctly
- [ ] "ORDER VIA WHATSAPP" button visible
- [ ] "CONTINUE SHOPPING" button links to index.html
- [ ] "EMPTY BAG" button clears cart after confirmation

### Quantity Management
- [ ] Click + button increases quantity
- [ ] Click - button decreases quantity
- [ ] Typing in quantity input and pressing Enter updates quantity
- [ ] Totals recalculate immediately
- [ ] Quantity cannot go below 1
- [ ] Cart persists after page refresh

### WhatsApp Order
- [ ] Click "ORDER VIA WHATSAPP" button
- [ ] Pre-formatted message includes:
  - All items (quantity × garment name)
  - Colours, sizes, designs, placements
  - Total price
  - Name and delivery area fields
- [ ] WhatsApp web opens (or app if installed)
- [ ] Message is readable and properly formatted
- [ ] Message is correctly URL-encoded (no broken characters)

### Cart Persistence
- [ ] Add items to cart
- [ ] Close browser tab
- [ ] Reopen index.html → cart.html
- [ ] Items still present (localStorage working)
- [ ] Cart badge shows correct item count on homepage

## RESPONSIVE DESIGN TESTS

### Test Breakpoints
- [ ] 320px (small phone): All content readable, no horizontal scroll
- [ ] 375px (iPhone): Text large, buttons tappable, grids responsive
- [ ] 430px: Similar to 375px
- [ ] 768px (tablet): 2-column grids, menu hamburger visible
- [ ] 1024px (laptop): 4-column grids start to appear
- [ ] 1440px+ (desktop): Full layout, all 4-column grids active

### Mobile-Specific Tests (320px - 768px)
- [ ] No horizontal scrollbar at any width
- [ ] Text is readable (minimum 14px)
- [ ] Buttons are tappable (minimum 44px × 44px)
- [ ] Product cards stack properly
- [ ] Navigation menu works and closes properly
- [ ] Hero section is optimized for mobile height
- [ ] Customizer page has vertical layout
- [ ] Cart page displays items properly stacked
- [ ] All forms and inputs are accessible
- [ ] Footer stacks vertically

## ACCESSIBILITY TESTS

### Keyboard Navigation
- [ ] Tab through all buttons and links
- [ ] Enter activates buttons
- [ ] Links are keyboard accessible
- [ ] Focus state is visible (blue highlight)
- [ ] Focus order is logical (top to bottom, left to right)
- [ ] Can open/close mobile menu with keyboard

### Screen Reader
- [ ] Alt text on all images
- [ ] Buttons have descriptive text (not just "Click here")
- [ ] Form inputs have associated labels
- [ ] Page has proper heading hierarchy (h1, h2, h3)
- [ ] Landmark regions used properly (nav, main, section)

### Visual Design
- [ ] Text-to-background contrast meets WCAG AA (4.5:1 minimum)
- [ ] Blue (#0066FF) on white background passes
- [ ] Blue on dark (#111111) background passes
- [ ] No information conveyed by colour alone (quantity shows number)

### Forms & Inputs
- [ ] Size buttons clearly indicate selection (blue background)
- [ ] Colour swatches have border to show selection
- [ ] Quantity input is accessible
- [ ] "ADD TO BAG" button is keyboard accessible

## FUNCTIONALITY TESTS

### Data-Driven Rendering
- [ ] Garments from data.js render on homepage
- [ ] Designs from data.js render on homepage
- [ ] Featured designs/garments render correctly
- [ ] No hardcoded product cards visible
- [ ] All data comes from js/data.js

### Price Calculation
- [ ] Classic Tee (R349) + No Design = R349
- [ ] Classic Tee (R349) + Panther Design (+R50) = R399
- [ ] Oversized Tee (R349) + Skull Design (+R50) = R399
- [ ] Price displays in correct format: R399
- [ ] Cart totals calculate correctly with multiple items
- [ ] Quantity × price = item total

### Filter Functionality
- [ ] "All" shows all active designs
- [ ] "Graphic" shows only graphic designs
- [ ] "Logo" shows only logo designs
- [ ] Filters don't reload page
- [ ] Active filter button highlighted in blue
- [ ] Filter results update dynamically

### Search (If Implemented)
- [ ] Search input appears in design section
- [ ] Typing "panther" filters to Panther design
- [ ] Typing "skull" filters to Skull design
- [ ] Clearing search shows all designs
- [ ] Search is case-insensitive

### Image Fallback Handling
- [ ] If garment image fails to load, fallback appears
- [ ] If design image fails to load, fallback appears
- [ ] Fallback shows icon and "Image not available"
- [ ] Fallback doesn't break layout

### Links & Navigation
- [ ] All navigation links work
- [ ] Logo links to home
- [ ] "START DESIGNING" links to product.html
- [ ] "VIEW DESIGNS" scrolls to designs section smoothly
- [ ] Garment "CUSTOMIZE" buttons link to product.html?garment=id
- [ ] Design "USE THIS DESIGN" buttons link to product.html?design=id
- [ ] Contact buttons link correctly:
  - Email button opens mailto:
  - WhatsApp button opens WhatsApp
  - Instagram/Facebook open social links

## ERROR HANDLING

### Console Errors
- [ ] Open DevTools (F12)
- [ ] Console tab shows no errors (only warnings acceptable)
- [ ] Network tab shows no 404s for assets
- [ ] All images either load or show fallback

### Missing Images
- [ ] Placeholder designs show "Coming Soon" state
- [ ] Broken garment images show fallback
- [ ] No broken image <img> icons
- [ ] Design overlay uses transparent PNG when available

### Edge Cases
- [ ] Adding 0-size items doesn't break
- [ ] Very long product names don't overflow
- [ ] 100+ items in cart still work (performance acceptable)
- [ ] Extremely narrow viewports (280px) handled gracefully

## PERFORMANCE TESTS

### Page Load
- [ ] Homepage loads in under 3 seconds
- [ ] product.html loads in under 2 seconds
- [ ] cart.html loads in under 2 seconds
- [ ] No unused CSS or JavaScript
- [ ] Images are optimized

### Browser DevTools Audit
- [ ] Lighthouse score 80+ on Performance
- [ ] Lighthouse score 90+ on Accessibility
- [ ] Lighthouse score 90+ on Best Practices
- [ ] No console errors on load

## SEO TESTS

### Metadata
- [ ] Page title is descriptive: "InterSacks Apparel | Built Different"
- [ ] Meta description present and relevant
- [ ] Open Graph tags present (og:title, og:description, og:type)
- [ ] Canonical tag (if needed)

### Semantic HTML
- [ ] Uses proper heading hierarchy (h1, h2, h3)
- [ ] Uses semantic tags: <nav>, <main>, <section>, <article>
- [ ] Image alt text is descriptive (not "image1")
- [ ] Links have descriptive text

## FINAL DEPLOYMENT CHECKS

### File Structure
- [ ] All files present and properly organized
- [ ] No unused files in the repository
- [ ] README.md is comprehensive and up-to-date
- [ ] No passwords or secrets in code

### GitHub Pages Readiness
- [ ] .gitignore present and proper
- [ ] No large files (>100MB)
- [ ] Repository is public
- [ ] README visible and helpful

### Code Quality
- [ ] No console.log() debugging statements
- [ ] No commented-out code blocks
- [ ] Consistent naming conventions (camelCase for JS, kebab-case for CSS)
- [ ] Comments only where complex logic exists
- [ ] No inline styles or scripts

---

## SUMMARY

Total Checklist Items: 150+

✅ = Pass
❌ = Fail
🔶 = Needs Investigation

After completing these tests, the project is ready for:
- GitHub Pages deployment
- Production use
- Sharing with users

---

## NOTES FOR ACCEPTANCE TESTER

This is a static MVP designed for deployment on GitHub Pages. 

**What works:**
- Browse garments and designs
- Customize items with colours, sizes, placements
- Add items to cart
- Order via WhatsApp
- Fully responsive on mobile
- No backend needed

**What doesn't work (by design):**
- Payment processing (use WhatsApp for orders)
- User accounts/login
- Order history
- Inventory tracking
- Email confirmations

Future upgrades require backend services (Firebase, Supabase, or custom API).

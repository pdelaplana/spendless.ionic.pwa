# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Spendless Landing Page** - A high-converting, SEO-optimized one-page marketing site for the Spendless mindful spending tracker PWA. Built as a static website with vanilla HTML, CSS, and JavaScript for maximum performance and SEO.

**Tech Stack:**
- Pure HTML5 (semantic markup)
- CSS3 with CSS custom properties (variables)
- Vanilla JavaScript (no frameworks)
- Static hosting (designed for Netlify, Vercel, GitHub Pages, etc.)

**Key Philosophy:**
- Mobile-first responsive design
- Privacy-first messaging (no bank linking, no ads)
- Conversion-optimized with strategic CTAs
- Mindful spending awareness through 6 emotional categories

## Development Commands

### Local Development Server

**Recommended: http-server (already installed globally)**

```bash
# Start server on default port 8080
http-server

# Or specify port 8000
http-server -p 8000
```

Then open `http://localhost:8080` (or `http://localhost:8000`) in your browser.

**Alternative options:**

```bash
# Python (if available)
python -m http.server 8000

# Node.js http-server (via npx, if not installed globally)
npx http-server -p 8000

# PHP
php -S localhost:8000
```

**Note:** No build process required for the main site. For blog posts, run `npm run build:blog` after adding new articles.

### Testing & Validation

```bash
# Validate HTML (using validator.nu or w3c validator)
# Manually test at: https://validator.w3.org/

# Check accessibility
# Use browser DevTools Lighthouse audit or axe DevTools

# Performance audit
# Use Google PageSpeed Insights: https://pagespeed.web.dev/
```

### Deployment

Simple deployment - upload entire directory to any static hosting service:
- Netlify: Drag & drop folder or connect Git repo
- Vercel: `vercel` CLI or Git integration
- GitHub Pages: Push to gh-pages branch
- Traditional hosting: FTP upload all files

## Architecture & File Organization

### Key Files

- **`index.html`** - Complete landing page (all 10 sections in one file)
- **`css/variables.css`** - Design system tokens (colors, typography, spacing)
- **`css/styles.css`** - Main stylesheet with all component styles
- **`css/blog.css`** - Blog-specific styles (listing page, article pages)
- **`js/main.js`** - Core interactions, analytics, PWA features, scroll animations
- **`js/email-capture.js`** - Email form validation and submission handling
- **`scripts/build-blog.js`** - Blog build script (generates static HTML from markdown)
- **`blog/_articles/`** - Source markdown files for blog posts

### Reference Documentation

- **`IMPLEMENTATION_PLAN.md`** - Complete technical specifications and design system
- **`references/DESIGN_SYSTEM.md`** - Brand colors, typography, component styles
- **`references/CONVERSION_BRIEF.md`** - Product positioning, value props, target audience
- **`README.md`** - Setup instructions, testing checklist, deployment guide

## Design System

### Brand Colors
- **Primary Purple:** `#8B5FBF` - Main brand color, CTAs, accents
- **Primary Hover:** `#7c3aed` - Button hover states
- **Text Primary:** `#18181b` - Headlines and body text
- **Text Secondary:** `#71717a` - Supporting text
- **Success Green:** `#10b981`, **Warning:** `#f59e0b`, **Error:** `#ef4444`

### Typography Scale
- **H1:** 48px desktop / 32px mobile, weight 900 (black)
- **H2:** 36px desktop / 28px mobile, weight 700 (bold)
- **Body:** 16px, weight 400 (regular)
- **System font stack:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, sans-serif`

### Spacing System
8px base unit: `8px, 16px, 24px, 32px, 40px, 48px, 64px, 80px, 96px, 128px`

CSS variables in `variables.css`: `--space-1` through `--space-20`

### Component Patterns
- **Buttons:** 8px border radius, hover lift effect (`translateY(-2px)`)
- **Cards:** 12px border radius, subtle shadow
- **Sections:** Alternating white/light-gray backgrounds
- **CTAs:** Purple buttons with high contrast

## Page Structure

10 sections (in order):
1. **Hero** - Centered, bold headline with CTAs and app mockup
2. **Social Proof** - Trust metrics and user count
3. **Value Proposition** - Alternating text/image block
4. **Features** - 3x2 grid of key features
5. **How It Works** - 3-step process with alternating blocks
6. **Categories** - 6 mindful spending categories grid
7. **Manual Tracking** - Philosophy section (turns limitation into strength)
8. **Pricing** - Free vs Premium comparison
9. **Final CTA** - Purple background conversion section
10. **Footer** - Minimal footer with links

## Common Development Tasks

### Adding/Updating Content

**Edit text content:**
- Open `index.html`
- Find section by ID (e.g., `id="hero-modern"`, `id="pricing"`)
- Update HTML content directly
- No build step needed - refresh browser

**Update colors/spacing:**
- Edit `css/variables.css` to change design tokens globally
- Or edit `css/styles.css` for specific component styles

### Adding New Sections

1. Add semantic HTML in `index.html` after existing sections
2. Add section-specific styles in `css/styles.css`
3. Follow existing pattern: white/gray alternating backgrounds
4. Use CSS variables for colors, spacing, typography
5. Add responsive breakpoints: `@media (max-width: 767px)` for mobile

### Email Form Configuration

**Setup email service integration:**
1. Open `js/email-capture.js`
2. Replace `API_ENDPOINT: 'YOUR_EMAIL_SERVICE_ENDPOINT'` with actual endpoint
3. Configure for Mailchimp, ConvertKit, EmailOctopus, or custom API
4. Update CORS headers on backend if needed

**Current state:** Demo mode (logs to console, no actual submission)

### Analytics Configuration

**Google Analytics 4:**
- In `index.html` lines 370-376, replace `GA_MEASUREMENT_ID` with actual ID

**Facebook Pixel:**
- In `index.html` line 388, replace `YOUR_PIXEL_ID` with actual ID

**Custom events tracked:**
- CTA clicks, scroll depth (25/50/75/100%), email signup, section views, PWA install

### Blog System

The blog uses a simple CMS approach: markdown files with YAML frontmatter are converted to static HTML via a Node.js build script.

**Adding a new blog post:**

1. Create a markdown file in `blog/_articles/` with frontmatter:
   ```markdown
   ---
   title: Your Article Title
   description: Brief description for SEO and previews
   date: 2025-01-19
   author: The Spendless Team
   ---

   Your markdown content here...
   ```

2. Build the blog:
   ```bash
   npm run build:blog
   # or
   node scripts/build-blog.js
   ```

3. The script generates:
   - `blog/index.html` - Listing page with all articles
   - `blog/[slug]/index.html` - Individual article pages

**Frontmatter fields:**
- `title` (required) - Article title
- `description` (required) - SEO meta description
- `date` (required) - Publication date (YYYY-MM-DD)
- `author` (optional) - Author name, defaults to "The Spendless Team"
- `modified` (optional) - Date last modified (YYYY-MM-DD), for SEO
- `image` (optional) - Custom og:image URL for social sharing
- `tags` (optional) - Array of keywords for SEO and article:tag meta

**After adding new posts:**
- Update `sitemap.xml` with new article URLs
- Deploy all generated files

### Image Assets

**Required placeholder images** (currently missing):
- `images/hero-mockup.png` - Main hero image (1200x800px recommended)
- `images/value-prop.png` - Value proposition screenshot
- `images/step-1-period.png` - Period setup screen
- `images/step-2-track.png` - Quick entry modal
- `images/step-3-insights.png` - Dashboard insights
- `images/manual-tracking.png` - Manual tracking flow

**Image optimization:**
- Compress with TinyPNG or ImageOptim before adding
- Use WebP format with fallbacks for better performance
- Add descriptive alt text for accessibility

## Important Implementation Notes

### Conversion Optimization
- Multiple CTAs throughout page (hero, after features, pricing, final CTA)
- Strategic placement: "Get Started Free" buttons prominent in purple
- Trust indicators: "No credit card required", privacy badges
- Social proof early (after hero)

### SEO Optimization
- Single H1 tag in hero section
- Semantic HTML5 structure (`<header>`, `<section>`, `<footer>`)
- Meta tags complete: title, description, Open Graph, Twitter Cards
- Structured data (Schema.org) for SoftwareApplication
- Image alt tags required for all images

### Accessibility (WCAG AA)
- Skip link for keyboard navigation
- ARIA labels on interactive elements
- Color contrast ratios meet 4.5:1 minimum
- Focus indicators visible on all interactive elements
- Form labels present and properly associated

### Performance Targets
- Google PageSpeed score: 90+ (mobile and desktop)
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Uses native lazy loading on images (`loading="lazy"`)
- Critical CSS should be inlined in `<head>` for production

### Browser Support
- Chrome/Edge/Firefox/Safari (last 2 versions)
- iOS Safari 14+, Android Chrome (Android 8+)
- Progressive enhancement approach

## Key Messaging & Brand Voice

### Value Proposition
"Understand your spending **without the guilt**"

**Core differentiation:**
- Manual tracking by design (mindfulness, not automation)
- 6 emotional categories (the "why" not just "what")
- Privacy-first (no bank linking, no ads)
- PWA architecture (offline-first, no app store)

### Tone Guidelines
- **DO:** Encouraging, clear, empowering, trustworthy, optimistic
- **DON'T:** Preachy, judgmental, technical jargon, guilt-inducing
- Example: "You're making progress!" not "You failed again"

### Target Audience
- Age: 25-40 (Millennials/Gen Z)
- Pain point: "Where did my money go?"
- Goal: Financial wellness without restrictions
- Values: Privacy, simplicity, mindfulness

## Testing Before Deployment

**Functional:**
- [ ] All CTAs link correctly (hero, features, pricing, footer)
- [ ] Email form validates (try valid/invalid emails)
- [ ] Smooth scrolling works on anchor links
- [ ] No console errors in browser DevTools

**Responsive:**
- [ ] Mobile (375px - iPhone), Tablet (768px - iPad), Desktop (1024px+)
- [ ] Images scale properly, text readable at all sizes
- [ ] CTAs accessible with adequate touch targets (44x44px minimum)

**Performance:**
- [ ] Run Lighthouse audit in Chrome DevTools (target 90+ all categories)
- [ ] Check PageSpeed Insights (mobile and desktop)
- [ ] Verify images compressed and lazy loading working

**SEO & Meta:**
- [ ] Validate HTML at validator.w3.org
- [ ] Test Open Graph with Facebook Sharing Debugger
- [ ] Test Twitter Card with Twitter Card Validator
- [ ] Verify structured data with Google Rich Results Test

**Analytics:**
- [ ] Open browser console, verify events logging in demo mode
- [ ] After analytics configured, verify events in GA4 DebugView

## Pre-Deployment Checklist

Before deploying to production:
1. **Add all placeholder images** to `images/` directory
2. **Configure email service** in `js/email-capture.js`
3. **Add Google Analytics ID** in `index.html`
4. **Add Facebook Pixel ID** in `index.html` (if using)
5. **Test email form** end-to-end
6. **Run full accessibility audit** (Lighthouse + manual testing)
7. **Compress and optimize** all images
8. **Spell-check** all content
9. **Verify legal pages** linked (Privacy Policy, Terms)

## Maintenance & Optimization

**Regular tasks:**
- Monitor analytics weekly for conversion rates
- A/B test headlines and CTA copy
- Update content based on user feedback
- Run `npm run build:blog` after adding new blog posts
- Periodically update npm dependencies (`npm update`)

**Performance:**
- Enable gzip compression on hosting server
- Set cache headers for static assets (CSS, JS, images)
- Consider CDN for images if traffic grows
- Minify CSS/JS for production (optional, not required)

## Common Issues & Solutions

**Issue: Images not loading**
- Check file paths are correct (relative from HTML file)
- Verify images exist in `images/` directory
- Check file extensions match (case-sensitive on some servers)

**Issue: Email form not working**
- Check `API_ENDPOINT` is configured in `js/email-capture.js`
- Verify CORS headers on backend allow origin
- Check browser console for error messages
- Test with demo mode first (logs to console)

**Issue: Analytics not tracking**
- Verify analytics IDs replaced placeholder text
- Check browser console for gtag/fbq errors
- Disable ad blockers when testing
- Use GA4 DebugView to verify events

**Issue: Styles not applying**
- Clear browser cache (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
- Check CSS file paths in HTML `<link>` tags
- Verify CSS custom properties supported (very old browsers may not)
- Check browser DevTools Console for CSS errors

## Additional Resources

**Design specs:** See `IMPLEMENTATION_PLAN.md` for complete technical documentation
**Brand guidelines:** See `references/DESIGN_SYSTEM.md` for detailed design system
**Product context:** See `references/CONVERSION_BRIEF.md` for positioning and messaging

**External validation tools:**
- HTML Validator: https://validator.w3.org/
- PageSpeed Insights: https://pagespeed.web.dev/
- Open Graph Debugger: https://developers.facebook.com/tools/debug/
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- Rich Results Test: https://search.google.com/test/rich-results

---

**Last Updated:** January 2025
**Project Status:** Implementation complete, pending image assets and analytics configuration

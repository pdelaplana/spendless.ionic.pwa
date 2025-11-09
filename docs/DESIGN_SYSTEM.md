# Spendless Design System

## Brand Overview

**Spendless** is a Progressive Web App (PWA) for mindful spending tracking, built with Ionic Framework and React. The design system is inspired by modern fintech aesthetics, particularly Zip/Afterpay, featuring clean layouts, purple brand colors, and a focus on accessibility and usability.

---

## Brand Identity

### Logo & Icon

- **Icon**: White wallet symbol on vibrant purple background (#8B5FBF)
- **Shape**: Rounded square with modern, friendly corners
- **Style**: Minimalist, clean, immediately recognizable
- **Variations**: Available in multiple sizes (64x64, 192x192, 512x512)

### Brand Personality

- **Modern**: Contemporary fintech aesthetic
- **Trustworthy**: Clean, professional design
- **Approachable**: Friendly purple palette, easy-to-use interface
- **Mindful**: Focus on awareness and intentional spending

---

## Color System

### Primary Brand Color: Purple

The purple color family is the core of the Spendless brand identity, conveying creativity, mindfulness, and modern fintech energy.

```css
/* Primary Purple Scale */
--color-primary-50: #faf5ff    /* Lightest - backgrounds */
--color-primary-100: #f3e8ff   /* Very light - hover states */
--color-primary-200: #e9d5ff   /* Light - borders */
--color-primary-300: #d8b4fe   /* Medium light */
--color-primary-400: #c084fc   /* Medium */
--color-primary-500: #8B5FBF   /* BRAND PRIMARY */
--color-primary-600: #7c3aed   /* Dark - hover states */
--color-primary-700: #6b21a8   /* Darker */
--color-primary-800: #581c87   /* Very dark */
--color-primary-900: #4a044e   /* Darkest */
```

**Primary Use Cases:**
- Primary buttons and CTAs
- Active states and selections
- Progress indicators
- Brand accents and highlights

### Neutral Grays (Zinc Scale)

Clean, modern gray scale for text, borders, and surfaces.

```css
/* Gray Scale */
--color-gray-50: #fafafa     /* Lightest - page background */
--color-gray-100: #f4f4f5    /* Very light - card backgrounds */
--color-gray-200: #e4e4e7    /* Light - borders, dividers */
--color-gray-300: #d4d4d8    /* Medium light - disabled states */
--color-gray-400: #a1a1aa    /* Medium */
--color-gray-500: #71717a    /* Medium dark - secondary text */
--color-gray-600: #52525b    /* Dark */
--color-gray-700: #3f3f46    /* Darker */
--color-gray-800: #27272a    /* Very dark */
--color-gray-900: #18181b    /* PRIMARY TEXT */
```

### Semantic Colors

Colors for specific actions and states.

```css
/* Success (Green) */
--color-success: #10b981

/* Warning (Amber) */
--color-warning: #f59e0b

/* Danger/Error (Red) */
--color-danger: #ef4444
```

### Surface Colors

```css
--color-background: #fafafa      /* Page background */
--color-surface: #ffffff         /* Card/component background */
--color-surface-variant: #f4f4f5 /* Alternative surface */
```

### Text Colors

```css
--text-primary: #18181b          /* Primary text (gray-900) */
--text-secondary: #71717a        /* Secondary text (gray-500) */
--text-disabled: #a1a1aa         /* Disabled text (gray-400) */
--text-inverse: #ffffff          /* Text on dark backgrounds */
```

---

## Typography

### Font Family

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif;
```

**System font stack** ensures optimal readability and native feel across all platforms.

### Typography Scale

The brand uses a clear typographic hierarchy:

| Scale | Size | Weight | Line Height | Use Case |
|-------|------|--------|-------------|----------|
| **Headline 1** | 48px (3rem) | 900 (Black) | 1.1 | Hero headlines, major page titles |
| **Headline 2** | 36px (2.25rem) | 700 (Bold) | 1.2 | Section headings |
| **Body Large** | 18px (1.125rem) | 400 (Regular) | 1.6 | Important body text, descriptions |
| **Body Regular** | 16px (1rem) | 400 (Regular) | 1.5 | Standard body text |
| **Caption** | 14px (0.875rem) | 500 (Medium) | 1.4 | Labels, captions, metadata |

### Font Weights

```css
--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
--font-weight-black: 900   /* For headline-1 */
```

### Responsive Typography

```css
/* Mobile (≤480px) */
Headline 1: 32px (2rem)
Headline 2: 28px (1.75rem)

/* Tablet (≤768px) */
Headline 1: 40px (2.5rem)
Headline 2: 32px (2rem)
Body Large: 16px (1rem)
```

---

## Spacing System

Consistent spacing scale based on 4px increments:

```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-2xl: 48px
--spacing-3xl: 64px
```

**Usage Guidelines:**
- `xs/sm`: Inline spacing, small gaps
- `md`: Standard component padding, gaps
- `lg`: Card padding, section spacing
- `xl-3xl`: Major layout sections, page margins

---

## Border Radius

```css
--radius-sm: 4px      /* Small elements, tags */
--radius-md: 8px      /* Buttons, inputs */
--radius-lg: 12px     /* Cards, containers */
--radius-xl: 16px     /* Modals, large cards */
--radius-full: 9999px /* Circular elements, pills */
```

---

## Shadows

Subtle, modern shadows for depth hierarchy:

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)      /* Subtle elevation */
--shadow-md: 0 1px 3px 0 rgba(0, 0, 0, 0.1)       /* Standard cards */
--shadow-lg: 0 4px 6px -1px rgba(0, 0, 0, 0.1)    /* Elevated cards */
--shadow-xl: 0 10px 15px -3px rgba(0, 0, 0, 0.1)  /* Modals, popovers */
```

---

## Components

### Buttons

#### Primary Button
- **Background**: Purple gradient (#8B5FBF)
- **Text**: White
- **Border Radius**: 8px
- **Font Weight**: 600 (Semibold)
- **Padding**: 12px vertical, 24px horizontal
- **Shadow**: Small elevation
- **Hover**: Darker purple (#7c3aed), increased shadow

#### Secondary Button
- **Background**: Light gray (#f4f4f5)
- **Text**: Dark gray (#18181b)
- **Border Radius**: 8px
- **Hover**: Medium gray (#e4e4e7)

#### Outline Button
- **Background**: Transparent
- **Border**: 1px solid purple (#8B5FBF)
- **Text**: Purple (#8B5FBF)
- **Hover**: Light purple background (#faf5ff)

#### Ghost/Text Button
- **Background**: Transparent
- **Text**: Purple (#8B5FBF)
- **No border**
- **Hover**: Light gray background

#### Floating Action Button (FAB)
- **Shape**: Circular (50% border-radius)
- **Size**: 56px (medium) or 64px (large)
- **Background**: Purple gradient
- **Shadow**: Large elevation
- **Icon Size**: 24px (medium) or 28px (large)
- **Hover**: Lift effect (translateY -2px)

### Cards

#### Standard Card
- **Background**: White (#ffffff)
- **Border Radius**: 12px
- **Shadow**: Medium (0 1px 3px rgba(0,0,0,0.1))
- **Padding**: 24px (default), 16px (small), 32px (large)
- **Border**: Optional 1px solid #f4f4f5

#### Elevated Card
- **Shadow**: Large elevation for prominence
- **No border**
- **Hover**: Slight lift and increased shadow

#### Glass Card (Modern Variant)
- **Background**: rgba(255, 255, 255, 0.8)
- **Backdrop Filter**: blur(10px)
- **Border**: 1px solid rgba(255, 255, 255, 0.2)
- **Shadow**: Enhanced (0 8px 32px rgba(0,0,0,0.1))
- **Use**: Transaction lists, modern sections

#### Metric Card
- **Layout**: Centered content
- **Min Height**: 120px
- **Contains**: Icon (optional), Title (uppercase, gray), Value (large, bold), Subtitle (optional)
- **Title**: 14px uppercase, medium weight, gray-500
- **Value**: 24px bold, gray-900

#### Action Card
- **Layout**: Horizontal flex with icon and text
- **Icon Container**: 44x44px, rounded (12px), colored background
- **Primary Variant**: Purple gradient background, white text
- **Secondary Variant**: White background, purple accents
- **Hover**: Lift effect

### Forms & Inputs

#### Text Input
- **Border**: 1px solid #d4d4d8 (gray-300)
- **Border Radius**: 8px
- **Padding**: 12px vertical, 16px horizontal
- **Font Size**: 16px (body regular)
- **Focus State**: Border color changes to purple (#8B5FBF)
- **Background**: White

#### Input Labels
- **Font Size**: 14px
- **Font Weight**: 500 (Medium)
- **Color**: Gray-700 (#3f3f46)
- **Margin Bottom**: 8px

### Progress Bars

- **Height**: 8px
- **Background**: Light gray (#e4e4e7)
- **Fill**: Purple (#8B5FBF)
- **Border Radius**: 4px

### Modals & Alerts

#### Alert/Dialog
- **Max Width**: 320px
- **Border Radius**: 16px
- **Shadow**: Extra large elevation
- **Background**: White
- **Padding**: 24px (top/sides), 16px (content)
- **Title**: 18px semibold, gray-900
- **Message**: 16px regular, gray-600
- **Button**: Rounded (8px), medium weight

### Lists & Items

- **Background**: Transparent
- **Border**: Bottom border 1px solid #e4e4e7
- **Padding**: 16px vertical
- **Hover**: Light gray background

---

## Layout Patterns

### Gradient Background

Modern gradient background used across key pages:

```css
background: linear-gradient(
  135deg,
  #ffffff 0%,
  #fafafa 50%,
  #faf5ff 100%
);
```

Creates subtle depth with white → light gray → light purple progression.

### Page Structure

```
┌─────────────────────────┐
│ Header (Toolbar)        │
│ - White background      │
│ - Bottom border         │
├─────────────────────────┤
│                         │
│ Content Area            │
│ - Gradient background   │
│ - Padding: 16px sides   │
│                         │
├─────────────────────────┤
│ FAB (if applicable)     │
│ - Bottom right          │
│ - 16px margin           │
└─────────────────────────┘
```

### Grid Systems

- **2-column grid**: For action cards, metrics
- **Gap**: 16px (medium spacing)
- **Mobile**: Stacks to single column

---

## Animations & Transitions

### Standard Transitions

```css
transition: all 0.2s ease;  /* Default for most interactions */
transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);  /* Material-style */
```

### Common Effects

**Fade In:**
```css
animation: fadeIn 0.5s ease-in-out;
/* From opacity 0, translateY(10px) → opacity 1, translateY(0) */
```

**Pulse (for emphasis):**
```css
animation: pulse 2s infinite;
/* Opacity oscillates 1 → 0.7 → 1 */
```

**Hover Lift:**
```css
&:hover {
  transform: translateY(-2px);
  box-shadow: [increased];
}
```

### Motion Preferences

Respects user motion preferences:
```css
@media (prefers-reduced-motion: reduce) {
  /* Disable all animations */
}
```

---

## Accessibility

### Focus States

```css
.brand-focus:focus {
  outline: 2px solid #8B5FBF;  /* Purple outline */
  outline-offset: 2px;
}
```

### High Contrast Mode

```css
@media (prefers-contrast: high) {
  /* Enhanced borders and contrasts */
  .btn-brand-primary {
    border: 2px solid #8B5FBF;
  }
}
```

### Screen Reader Only Content

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### Color Contrast

All text/background combinations meet **WCAG AA** standards:
- Primary text on white: 14.85:1 (AAA)
- Secondary text on white: 4.76:1 (AA)
- White text on purple: 5.18:1 (AA)

---

## CSS Utility Classes

### Typography

```css
.headline-1       /* 48px, weight 900, tight line height */
.headline-2       /* 36px, weight 700 */
.body-large       /* 18px, weight 400, relaxed line height */
.body-regular     /* 16px, weight 400, normal line height */
.caption          /* 14px, weight 500, uppercase, letter spacing */
```

### Colors

```css
.text-brand-purple    /* Purple text */
.text-primary         /* Gray-900 text */
.text-secondary       /* Gray-500 text */
.bg-brand-purple      /* Purple background */
.bg-brand-light       /* Light gray background */
```

### Button Classes

```css
.btn-brand-primary    /* Purple filled button */
.btn-brand-outline    /* Purple outline button */
.btn-brand-text       /* Text-only purple button */
```

### Card Classes

```css
.card-brand           /* White card with subtle shadow */
.card-brand-purple    /* Purple gradient card */
```

---

## Ionic Framework Integration

### Component Overrides

The design system customizes Ionic components via CSS variables:

```css
/* Content Pages */
ion-content {
  --background: #fafafa;  /* Light gray */
}

/* Cards */
ion-card {
  --background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* Buttons */
ion-button {
  --border-radius: 8px;
  font-weight: 500;
  text-transform: none;  /* Removes uppercase default */
}

/* Headers */
ion-header ion-toolbar {
  --background: #fafafa;
  --color: #18181b;
  --border-color: #e4e4e7;
}
```

---

## Design Tokens (JavaScript/TypeScript)

The design system is available as TypeScript constants:

```typescript
import { designSystem } from '@/theme/designSystem';

// Access colors
designSystem.colors.primary[500]    // #8B5FBF
designSystem.colors.text.primary    // #18181b

// Access spacing
designSystem.spacing.md             // 16px
designSystem.spacing.lg             // 24px

// Access typography
designSystem.typography.fontSize.headline1  // 3rem
designSystem.typography.fontWeight.bold     // 700

// Access component tokens
designSystem.components.button.borderRadius  // 8px
designSystem.components.card.shadow          // 0 1px 3px...
```

---

## Implementation Notes for Landing Page

### Critical Design Elements

1. **Hero Section:**
   - Use `headline-1` class for main headline
   - Purple (#8B5FBF) brand accents
   - Gradient background for depth
   - Primary CTA button in brand purple

2. **Feature Cards:**
   - Use glass cards or clean elevated cards
   - 12px border radius
   - Medium shadow for depth
   - Icons in purple accent color

3. **CTA Buttons:**
   - Primary: Purple with white text
   - Secondary: Outlined purple or light gray
   - 8px border radius, medium font weight
   - Hover states with lift effect

4. **Color Usage:**
   - **Purple**: CTAs, active states, brand moments
   - **White/Light Gray**: Backgrounds, cards
   - **Dark Gray**: Primary text (#18181b)
   - **Medium Gray**: Secondary text (#71717a)

5. **Typography Hierarchy:**
   - Headlines: Bold, dark gray, tight line height
   - Body: Regular weight, good spacing (1.5-1.6 line height)
   - Captions: Uppercase, medium weight, letter spacing

6. **Spacing:**
   - Sections: 48px-64px vertical spacing
   - Cards: 24px padding
   - Elements: 16px standard gap
   - Mobile: Reduce to 16px section padding

### Brand Voice

- **Professional yet friendly**
- **Clear and direct** (avoid jargon)
- **Empowering** (focus on user control and mindfulness)
- **Trustworthy** (emphasize security, privacy)

### Key Messaging Points

- Mindful spending tracking
- Multi-currency support
- Offline-first PWA
- Simple, beautiful interface
- Your data, your control

---

## Resources

### Files Reference

- **CSS Variables**: `src/theme/variables.css`
- **Design Tokens**: `src/theme/designSystem.ts`
- **Component Classes**: `src/theme/components.css`
- **React Components**: `src/theme/components.tsx`
- **Brand Icon**: `public/favicon.png`

### Tech Stack

- **Framework**: Ionic + React 19
- **Styling**: Styled Components + Emotion + CSS Variables
- **Build**: Vite
- **Platform**: Progressive Web App (PWA)

---

## Version

**Design System Version**: 1.0
**Last Updated**: 2025
**App Version**: 0.1.0

---

This design system provides everything needed to create a high-converting, brand-consistent landing page for Spendless.

# Spendless Brand Components

This directory contains the React components for displaying the Spendless brand identity consistently throughout the application.

## Components

### SpendlessLogo

The main logo component that displays the full "Spendless" wordmark with the purple accent on the "p".

```tsx
import { SpendlessLogo } from '@/components/brand';

// Primary logo for auth pages
<SpendlessLogo variant="primary" size="large" />

// Horizontal logo for headers
<SpendlessLogo variant="horizontal" size="medium" />

// Reverse logo for dark backgrounds
<SpendlessLogo variant="reverse" size="medium" />

// Interactive logo with click handler
<SpendlessLogo 
  variant="horizontal" 
  size="medium" 
  interactive 
  onClick={handleLogoClick} 
/>
```

**Props:**
- `variant`: 'primary' | 'reverse' | 'horizontal'
- `size`: 'small' | 'medium' | 'large' | 'xl'
- `interactive`: boolean (adds hover effects and cursor pointer)
- `onClick`: () => void
- `className`: string

### SpendlessIcon

The standalone "S" icon mark component, perfect for compact spaces and app icons.

```tsx
import { SpendlessIcon } from '@/components/brand';

// Standard brand icon
<SpendlessIcon size={40} />

// Reverse icon for dark backgrounds
<SpendlessIcon size={32} variant="reverse" />

// Outline variant
<SpendlessIcon size={48} variant="outline" />

// Interactive icon
<SpendlessIcon 
  size={44} 
  interactive 
  onClick={handleIconClick} 
/>
```

**Props:**
- `size`: number (in pixels)
- `variant`: 'brand' | 'reverse' | 'outline'
- `interactive`: boolean
- `onClick`: () => void
- `borderRadius`: number (defaults to 12px)
- `className`: string

### LogoShowcase

A comprehensive showcase component that displays all logo variations and sizes. Useful for development and design system documentation.

```tsx
import { LogoShowcase } from '@/components/brand';

<LogoShowcase />
```

## Usage Guidelines

### When to Use Each Variant

**Primary Logo (`variant="primary"`):**
- Authentication pages (signin/signup)
- Landing pages
- Marketing materials
- Large hero sections

**Horizontal Logo (`variant="horizontal"`):**
- Application headers
- Navigation bars
- Business cards
- Email signatures

**Reverse Logo (`variant="reverse"`):**
- Dark backgrounds
- Purple/gradient backgrounds
- Night mode interfaces

**Icon Only:**
- Favicons
- App icons
- Loading states
- Compact navigation
- Social media profiles

### Size Guidelines

- **Favicon/App Icons**: 16px - 48px
- **Navigation/Headers**: 32px - 60px (medium size)
- **Auth Pages**: 48px - 80px (large/xl size)
- **Marketing/Hero**: 64px+ (xl size)

### Accessibility Features

Both components include:
- Proper ARIA labels
- Keyboard navigation support (when interactive)
- Focus states
- Screen reader compatibility

### Brand Consistency

These components automatically use:
- Brand purple (#8B5FBF) from the design system
- Correct typography (font family, weights)
- Consistent spacing and proportions
- Proper color contrast ratios

## Examples

### Header Navigation
```tsx
const AppHeader = () => (
  <IonHeader>
    <IonToolbar>
      <SpendlessLogo 
        variant="horizontal" 
        size="medium"
        interactive
        onClick={() => router.push('/')}
      />
    </IonToolbar>
  </IonHeader>
);
```

### Auth Page
```tsx
const SignInPage = () => (
  <div className="auth-container">
    <SpendlessLogo variant="primary" size="large" />
    <h1 className="headline-2">Welcome back</h1>
    {/* Form content */}
  </div>
);
```

### Loading State
```tsx
const LoadingSpinner = () => (
  <div className="loading-container">
    <SpendlessIcon size={40} className="pulse-brand" />
    <p>Loading your financial data...</p>
  </div>
);
```

### Dark Background
```tsx
const DarkHero = () => (
  <div style={{ background: '#27272a', padding: '2rem' }}>
    <SpendlessLogo variant="reverse" size="xl" />
    <p style={{ color: 'white' }}>Take control of your spending</p>
  </div>
);
```

## Development Notes

- Components use styled-components for dynamic styling
- All styles are based on the design system tokens
- Responsive behavior is built-in
- TypeScript interfaces provide full type safety
- Components are optimized for tree-shaking

## Testing

To view all logo variations during development, you can temporarily add the LogoShowcase component to any page:

```tsx
import { LogoShowcase } from '@/components/brand';

// Add to any component for testing
<LogoShowcase />
```
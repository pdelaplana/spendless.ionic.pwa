/* Spendless Design System - TypeScript tokens for programmatic access */

export const designSystem = {
  colors: {
    // Brand Colors (AI Financial Coach Design System)
    brand: {
      primary: '#3D1B5B', // Dark, deep purple - core brand color
      secondary: '#5D338C', // Mid-range purple for visual depth
      accentLight: '#DDD0E6', // Very light, muted purple
    },

    // Primary Purple Scale (AI Financial Coach)
    primary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#DDD0E6', // Accent Light
      400: '#B788DC', // Action Interactive
      500: '#5D338C', // Secondary brand
      600: '#3D1B5B', // Primary brand
      700: '#2d1443',
      800: '#1d0d2b',
      900: '#0d0513',
    },

    // Secondary Purple Scale (for weekly cards)
    secondary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#DDD0E6', // Accent Light
      400: '#c9b3db',
      500: '#B788DC', // Action Interactive
      600: '#9966cc',
      700: '#7b52a3',
      800: '#5D338C', // Secondary brand
      900: '#3D1B5B', // Primary brand
    },

    // Gray Scale (Brand neutrals)
    gray: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
    },

    // Semantic Colors (from brand identity)
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',

    // Surface Colors
    background: '#fafafa', // Brand background
    surface: '#ffffff',
    surfaceVariant: '#f4f4f5',

    // Text Colors (from brand identity)
    text: {
      primary: '#18181b', // Brand text primary
      secondary: '#71717a', // Brand text secondary
      disabled: '#a1a1aa',
      inverse: '#ffffff',
    },

    // Brand aliases for easy access
    brandPurple: '#8B5FBF',
    textPrimary: '#18181b',
    textSecondary: '#71717a',
    backgroundPrimary: '#fafafa',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },

  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    lg: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    xl: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },

  typography: {
    // Brand Font Family
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif',

    // Brand Typography Scale (from brand identity)
    scale: {
      headline1: {
        size: '3rem', // 48px
        weight: 900,
        lineHeight: 1.1,
        letterSpacing: '-1px',
      },
      headline2: {
        size: '2.25rem', // 36px
        weight: 700,
        lineHeight: 1.2,
      },
      bodyLarge: {
        size: '1.125rem', // 18px
        weight: 400,
        lineHeight: 1.6,
      },
      bodyRegular: {
        size: '1rem', // 16px
        weight: 400,
        lineHeight: 1.5,
      },
      caption: {
        size: '0.875rem', // 14px
        weight: 500,
        lineHeight: 1.4,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      },
    },

    // Legacy fontSize tokens (kept for backward compatibility)
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      // Brand scale aliases
      headline1: '3rem',
      headline2: '2.25rem',
      bodyLarge: '1.125rem',
      bodyRegular: '1rem',
      caption: '0.875rem',
    },

    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 900, // Added for brand headlines
    },

    lineHeight: {
      tight: 1.1, // For headlines
      snug: 1.2, // For subheadings
      normal: 1.5, // For body text
      relaxed: 1.6, // For large body text
      loose: 1.75,
    },
  },

  components: {
    card: {
      background: '#ffffff',
      borderRadius: '12px',
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      padding: '24px',
    },

    button: {
      borderRadius: '8px',
      paddingY: '12px',
      paddingX: '24px',
      fontWeight: 500,
    },

    input: {
      borderRadius: '8px',
      borderColor: '#d4d4d8',
      borderColorFocus: '#8B5FBF',
      paddingY: '12px',
      paddingX: '16px',
    },

    progressBar: {
      height: '8px',
      background: '#e4e4e7',
      fill: '#8B5FBF',
      borderRadius: '4px',
    },
  },
} as const;

// Type definitions for better TypeScript support
export type DesignSystemColors = typeof designSystem.colors;
export type DesignSystemSpacing = typeof designSystem.spacing;
export type DesignSystemBorderRadius = typeof designSystem.borderRadius;
export type DesignSystemShadows = typeof designSystem.shadows;
export type DesignSystemTypography = typeof designSystem.typography;
export type DesignSystemComponents = typeof designSystem.components;

// Helper functions for accessing design tokens
export const getColor = (path: string): string => {
  const keys = path.split('.');
  let value: Record<string, unknown> = designSystem.colors;

  for (const key of keys) {
    value = value[key] as Record<string, unknown>;
    if (value === undefined) {
      console.warn(`Color path "${path}" not found in design system`);
      return '#000000'; // fallback
    }
  }

  return value as unknown as string;
};

export const getSpacing = (key: keyof typeof designSystem.spacing): string => {
  return designSystem.spacing[key];
};

export const getShadow = (key: keyof typeof designSystem.shadows): string => {
  return designSystem.shadows[key];
};

export const getFontSize = (key: keyof typeof designSystem.typography.fontSize): string => {
  return designSystem.typography.fontSize[key];
};

// Brand Typography Helpers
export const getTypographyScale = (scale: keyof typeof designSystem.typography.scale) => {
  return designSystem.typography.scale[scale];
};

export const getBrandColor = (color: keyof typeof designSystem.colors.brand): string => {
  return designSystem.colors.brand[color];
};

// CSS helper functions for brand typography
export const createTypographyCSS = (scale: keyof typeof designSystem.typography.scale): string => {
  const typography = designSystem.typography.scale[scale];
  return `
    font-size: ${typography.size};
    font-weight: ${typography.weight};
    line-height: ${typography.lineHeight};
    ${'letterSpacing' in typography ? `letter-spacing: ${typography.letterSpacing};` : ''}
    ${'textTransform' in typography ? `text-transform: ${typography.textTransform};` : ''}
  `;
};

// Brand constants for easy access
export const BRAND_COLORS = {
  primary: designSystem.colors.brand.primary,
  secondary: designSystem.colors.brand.secondary,
  accentLight: designSystem.colors.brand.accentLight,
  textPrimary: designSystem.colors.text.primary,
  textSecondary: designSystem.colors.text.secondary,
  background: designSystem.colors.background,
} as const;

export const TYPOGRAPHY_SCALES = {
  headline1: designSystem.typography.scale.headline1,
  headline2: designSystem.typography.scale.headline2,
  bodyLarge: designSystem.typography.scale.bodyLarge,
  bodyRegular: designSystem.typography.scale.bodyRegular,
  caption: designSystem.typography.scale.caption,
} as const;

// CSS-in-JS helper for styled-components
export const theme = designSystem;

export default designSystem;

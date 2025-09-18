# Spendless Coding Style Guide

## Project Overview

**Spendless** is a Progressive Web App built with:
- **Frontend**: React 19 + TypeScript + Ionic Framework
- **Build Tool**: Vite with PWA plugin
- **State Management**: TanStack Query (React Query) for server state
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **Styling**: Emotion + Styled Components + Design System
- **Testing**: Vitest (unit) + Cypress (E2E)

## Core Standards

### File and Directory Naming

**Components**
```
// React Components - PascalCase
SpendlessLogo.tsx
UserProfile.tsx
WalletSetupModal.tsx

// Component directories - camelCase
components/
├── brand/
├── forms/
│   └── fields/
└── layouts/
```

**Utilities and Hooks**
```
// Hooks - camelCase with 'use' prefix
useCreateWallet.ts
useSpendingAccount.ts
useFormatters.ts

// Utilities - camelCase
walletUtils.ts
dateHelpers.ts
validationRules.ts

// Domain entities - PascalCase
Wallet.ts
Account.ts
Spend.ts
```

**Directories**
```
// Feature-based organization - camelCase
pages/
├── spending/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   └── modals/
└── auth/
    ├── signin/
    └── signup/
```

### TypeScript Standards

**Interface Naming**
```typescript
// Domain interfaces - prefixed with 'I'
export interface IWallet {
  readonly id?: string;
  readonly accountId: string;
  readonly name: string;
}

// Component props - suffix with 'Props'
export interface SpendlessLogoProps {
  variant?: 'primary' | 'reverse' | 'horizontal';
  size?: 'small' | 'medium' | 'large' | 'xl';
  className?: string;
}

// DTO types - suffix with 'DTO'
export type CreateWalletDTO = Omit<IWallet, 'id' | 'createdAt' | 'updatedAt'>;
```

**Type Definitions**
```typescript
// Use readonly for domain interfaces
export interface IWallet {
  readonly id?: string;
  readonly accountId: string;
  readonly createdAt: Date;
}

// Use strict typing for component props
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick: () => void;
}

// Export types alongside interfaces
export type WalletSetup = Pick<IWallet, 'name' | 'spendingLimit' | 'isDefault'>;
```

### Code Structure and Formatting

**Indentation and Spacing**
- **Indentation**: 2 spaces (no tabs)
- **Line Length**: 100 characters maximum
- **Line Endings**: LF (Unix-style)
- **Trailing Commas**: Always in multiline structures
- **Semicolons**: Always required

**Import Organization**
```typescript
// 1. External libraries
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react';

// 2. Internal modules (absolute imports using aliases)
import { type CreateWalletDTO, createWallet, validateWallet } from '@/domain/Wallet';
import { useLogging } from '@/hooks/logging';
import { db } from '@/infrastructure/firebase';

// 3. Relative imports
import { getWalletCollectionPath, mapWalletToFirestore } from './walletUtils';
import './Component.css';
```

**Quotes and Punctuation**
```typescript
// Single quotes for strings
const message = 'Hello world';

// Single quotes for JSX attributes
<SpendlessLogo variant='primary' size='large' />

// Template literals for dynamic strings
const greeting = `Hello, ${userName}!`;
```

### Component Architecture

**Component Structure**
```typescript
// 1. Imports
import React from 'react';
import styled from 'styled-components';
import { BRAND_COLORS } from '@/theme/designSystem';

// 2. Interface/Type definitions
export interface ComponentProps {
  variant?: 'primary' | 'secondary';
  children?: React.ReactNode;
}

// 3. Styled components
const Container = styled.div<{ variant: string }>`
  display: flex;
  background: ${(props) => props.variant === 'primary' ? BRAND_COLORS.purple : '#fff'};
`;

// 4. Component implementation with JSDoc
/**
 * Component description with usage examples
 *
 * @example
 * ```tsx
 * <MyComponent variant="primary">Content</MyComponent>
 * ```
 */
export const MyComponent: React.FC<ComponentProps> = ({
  variant = 'primary',
  children
}) => {
  return (
    <Container variant={variant}>
      {children}
    </Container>
  );
};

// 5. Default export
export default MyComponent;
```

**Hook Patterns**
```typescript
// API hooks follow the pattern: use[Action][Entity]
export function useCreateWallet() {
  const queryClient = useQueryClient();
  const { logError } = useLogging();

  return useMutation({
    mutationFn: async (params: CreateWalletParams) => {
      // Sentry span for monitoring
      return Sentry.startSpan({
        name: 'useCreateWallet',
        attributes: { accountId: params.accountId },
      }, async () => {
        // Implementation
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ['wallets', variables.accountId]
      });
    },
    onError: (error) => {
      logError(error);
    },
  });
}
```

### Styling Guidelines

**Design System Usage**
```typescript
// Import design tokens
import { BRAND_COLORS, designSystem } from '@/theme/designSystem';

// Use design system tokens consistently
const Card = styled.div`
  background: ${designSystem.colors.surface};
  border-radius: ${designSystem.borderRadius.lg};
  padding: ${designSystem.spacing.lg};
  box-shadow: ${designSystem.shadows.md};
`;

// Color references
const PrimaryButton = styled.button`
  background: ${BRAND_COLORS.purple};
  color: ${BRAND_COLORS.textPrimary};
`;
```

**Responsive Design**
```typescript
const ResponsiveContainer = styled.div`
  display: grid;
  gap: ${designSystem.spacing.md};

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;
```

### State Management Patterns

**TanStack Query Usage**
```typescript
// Query keys should be arrays with hierarchical structure
const QUERY_KEYS = {
  wallets: (accountId: string, periodId: string) => ['wallets', accountId, periodId],
  wallet: (walletId: string) => ['wallet', walletId],
} as const;

// Use query keys consistently
export function useFetchWallets(accountId: string, periodId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.wallets(accountId, periodId),
    queryFn: () => fetchWallets(accountId, periodId),
    enabled: !!accountId && !!periodId,
  });
}
```

**Provider Pattern**
```typescript
// Context and provider co-location
interface WalletContextType {
  wallets: IWallet[];
  selectedWallet: IWallet | null;
  actions: {
    selectWallet: (wallet: IWallet) => void;
    createWallet: (data: CreateWalletDTO) => Promise<void>;
  };
}

const WalletContext = createContext<WalletContextType | null>(null);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  // Provider implementation
  const value = { wallets, selectedWallet, actions };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook for context consumption
export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};
```

### Error Handling Standards

**Sentry Integration**
```typescript
import * as Sentry from '@sentry/react';

// Wrap async operations in Sentry spans
export async function createWallet(data: CreateWalletDTO) {
  return Sentry.startSpan({
    name: 'createWallet',
    attributes: { walletName: data.name },
  }, async (span) => {
    try {
      // Implementation
      const result = await performCreate(data);

      span.setAttributes({
        walletId: result.id,
        success: true,
      });

      return result;
    } catch (error) {
      span.setAttributes({ success: false });
      throw error;
    }
  });
}
```

**Error Boundaries**
```typescript
// Use SentryErrorBoundary for pages
<SentryErrorBoundary>
  <PageContent />
</SentryErrorBoundary>

// Custom error handling in hooks
const { logError } = useLogging();

useMutation({
  mutationFn: createWallet,
  onError: (error) => {
    logError(error); // Centralized error logging
  },
});
```

### Testing Guidelines

**Unit Test Structure**
```typescript
// Component tests
describe('SpendlessLogo', () => {
  it('should render primary variant by default', () => {
    render(<SpendlessLogo />);
    expect(screen.getByText(/spendless/i)).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<SpendlessLogo className="custom-class" />);
    expect(screen.getByRole('img')).toHaveClass('custom-class');
  });
});

// Hook tests
describe('useCreateWallet', () => {
  it('should create wallet and invalidate cache', async () => {
    const { result } = renderHook(() => useCreateWallet());

    await act(async () => {
      await result.current.mutateAsync(mockWalletData);
    });

    expect(result.current.isSuccess).toBe(true);
  });
});
```

**Mock Patterns**
```typescript
// Firebase mocking
vi.mock('@/infrastructure/firebase', () => ({
  db: mockFirestore,
  auth: mockAuth,
}));

// Hook mocking
vi.mock('@/hooks/api/wallet/useCreateWallet', () => ({
  useCreateWallet: () => mockMutation,
}));
```

### Documentation Standards

**JSDoc Comments**
```typescript
/**
 * SpendlessLogo component displays the brand logo in various formats
 *
 * @example
 * ```tsx
 * // Primary logo for auth pages
 * <SpendlessLogo variant="primary" size="large" />
 *
 * // Interactive logo for headers
 * <SpendlessLogo variant="horizontal" interactive onClick={handleClick} />
 * ```
 */
export const SpendlessLogo: React.FC<SpendlessLogoProps> = (props) => {
  // Implementation
};
```

**Interface Documentation**
```typescript
export interface SpendlessLogoProps {
  /**
   * Logo variant to display
   * - primary: "S[p]endless" with purple accent on "p"
   * - reverse: White version for dark backgrounds
   * - horizontal: Icon + "Spendless" text side by side
   */
  variant?: 'primary' | 'reverse' | 'horizontal';

  /**
   * Size of the logo
   * - small: 1.2rem (19px)
   * - medium: 2rem (32px)
   * - large: 3rem (48px)
   * - xl: 4rem (64px)
   */
  size?: 'small' | 'medium' | 'large' | 'xl';
}
```

## AI Agent Integration Guidelines

### Code Generation Preferences

**Component Generation**
- Always include TypeScript interfaces with JSDoc comments
- Use styled-components with design system tokens
- Include accessibility attributes (role, tabIndex, onKeyDown)
- Follow the established component structure pattern
- Export both named and default exports

**Hook Generation**
- Follow the `use[Action][Entity]` naming convention
- Include Sentry monitoring spans for API operations
- Use TanStack Query patterns consistently
- Include proper error handling with centralized logging
- Implement cache invalidation strategies

**Domain Entity Creation**
- Use readonly interfaces for domain models
- Include validation functions alongside entity definitions
- Create factory functions (e.g., `createWallet`, `updateWallet`)
- Export helper functions for common operations
- Include comprehensive TypeScript types

### Review Criteria for AI-Generated Code

**Code Quality Checklist**
- [ ] TypeScript strict mode compliance
- [ ] Proper import organization (external → internal → relative)
- [ ] Design system token usage instead of hardcoded values
- [ ] Accessibility attributes for interactive elements
- [ ] Error handling with Sentry integration
- [ ] JSDoc comments for public APIs
- [ ] Consistent naming conventions
- [ ] Test coverage for new functionality

**Architecture Compliance**
- [ ] Domain logic separated from UI concerns
- [ ] Hooks follow established patterns
- [ ] State management uses TanStack Query + Context
- [ ] Firebase operations include proper error handling
- [ ] Components use provider pattern for shared state

### Prompt Templates for Common Tasks

**Component Creation**
```
Create a new [ComponentName] component that:
- Uses TypeScript with proper interfaces
- Follows Spendless design system patterns
- Includes styled-components with design tokens
- Has accessibility support
- Includes JSDoc documentation
- Exports both named and default exports
```

**Hook Creation**
```
Create a new use[Action][Entity] hook that:
- Uses TanStack Query patterns
- Includes Sentry monitoring
- Has proper TypeScript typing
- Implements error handling with useLogging
- Follows cache invalidation patterns
- Includes comprehensive JSDoc
```

**Domain Entity**
```
Create a new [Entity] domain model that:
- Uses readonly interface pattern
- Includes validation functions
- Has factory and update functions
- Includes TypeScript helper types
- Has comprehensive business logic helpers
- Exports all utilities in a clean API
```

## Enforcement and Quality Gates

### Pre-commit Hooks
- Biome formatting and linting
- TypeScript compilation check
- Unit test execution
- Import organization

### CI/CD Pipeline
- Full test suite execution
- Build verification
- Code coverage requirements (>85%)
- Architecture compliance validation

## Currency and Date Formatting Standards

### Currency Formatting

**Primary Formatter Hook**
```typescript
// Use the centralized useFormatters hook for consistency
import useFormatters from '@/hooks/ui/useFormatters';

const { formatCurrency } = useFormatters();

// Usage
formatCurrency(123.45, 'USD', 'en-US'); // Returns: "$123.45"
formatCurrency(123.45, 'AUD', 'en-AU'); // Returns: "A$123.45"
formatCurrency(123.45, 'PHP', 'en-PH'); // Returns: "₱123.45"
```

**Currency Domain Entity**
```typescript
// Use Currency domain class for type safety
import { Currency } from '@/domain/Currencies';

// Pre-defined currencies
Currency.USD   // { code: 'USD', symbol: '$' }
Currency.AUD   // { code: 'AUD', symbol: 'A$' }
Currency.PHP   // { code: 'PHP', symbol: '₱' }

// Factory methods
Currency.fromCode('USD');           // Returns Currency.USD or undefined
Currency.getAllCurrencies();       // Returns all available currencies

// Formatting with Currency class
const currency = Currency.USD;
currency.format(123.45);           // Returns: "$123.45"
```

**Implementation Standards**
```typescript
// ✅ PREFERRED: Use centralized useFormatters hook with account currency
import useFormatters from '@/hooks/ui/useFormatters';
import { useSpendingAccount } from '@/providers/spendingAccount/SpendingAccountProvider';

const { formatCurrency } = useFormatters();
const { account } = useSpendingAccount();
const displayAmount = formatCurrency(amount, account?.currency);

// ✅ ACCEPTABLE: Use Intl.NumberFormat for specialized cases
const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// ❌ AVOID: Hardcoded currency formatting
const displayAmount = `$${amount.toFixed(2)}`; // Doesn't support multiple currencies
```

**ProminentAmountInput Component**
```typescript
// For amount input fields, use the specialized component with account currency
import { ProminentAmountInput } from '@/components/ui/ProminentAmountInput';
import { Currency } from '@/domain/Currencies';
import { useSpendingAccount } from '@/providers/spendingAccount/SpendingAccountProvider';

const { account } = useSpendingAccount();
const currency = Currency.fromCode(account?.currency) ?? Currency.USD;

<ProminentAmountInput
  label="Amount"
  value={amount}
  onChange={setAmount}
  currency={currency}
  placeholder="$0.00"
/>
```

### Date Formatting

**Primary Formatter Hook**
```typescript
// Use the centralized useFormatters hook for consistency
import useFormatters from '@/hooks/ui/useFormatters';

const { formatDate, formatDaysUntil } = useFormatters();

// Basic date formatting
formatDate(new Date());                    // Returns: "Wed Jan 15"
formatDate(new Date(), true);              // Returns: "Today", "Yesterday", or formatted date

// Days until calculation
formatDaysUntil(futureDate);               // Returns: "5" (days from now)
```

**Date Format Constants**
```typescript
// Use predefined format constants from useFormatters
import { DateFormatString } from '@/hooks/ui/useFormatters';

DateFormatString.MMM_DD_YYYY;             // 'MMM dd, yyyy' → "Jan 15, 2024"
DateFormatString.MM_DD_YYYY;              // 'MM/dd/yyyy' → "01/15/2024"
DateFormatString.YYYY_MM_DD;              // 'yyyy-MM-dd' → "2024-01-15"
DateFormatString.EEE_MM_DD_YYYY;          // 'EEE MMM dd' → "Wed Jan 15"
```

**Date Domain Entity (Available but not commonly used)**
```typescript
// DateFormat class exists for specialized formatting needs
import { DateFormat } from '@/domain/DateFormats';

DateFormat.DD_MM_YYYY_SLASH;              // "dd/MM/yyyy"
DateFormat.MM_DD_YYYY_DASH;               // "MM-dd-yyyy"
DateFormat.YYYY_MM_DD_DOT;                // "yyyy.MM.dd"
```

**Date-fns Integration**
```typescript
// The project uses date-fns for date manipulation
import { differenceInCalendarDays, format, addWeeks } from 'date-fns';

// ✅ PREFERRED: Use date-fns functions for date operations
const daysDiff = differenceInCalendarDays(endDate, startDate);
const futureDate = addWeeks(new Date(), 4);
const formattedDate = format(date, 'MMM dd, yyyy');

// ❌ AVOID: Manual date manipulation
const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
```

**Implementation Standards**
```typescript
// ✅ PREFERRED: Use centralized useFormatters hook
const { formatDate, formatCurrency } = useFormatters();

// ✅ ACCEPTABLE: Direct date-fns usage for complex operations
import { format, addDays, isAfter } from 'date-fns';
const deadline = format(addDays(new Date(), 30), 'yyyy-MM-dd');

// ❌ AVOID: Native Date methods for formatting
const formatted = date.toLocaleDateString(); // Inconsistent formatting
const dateString = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
```

**Relative Date Formatting**
```typescript
// Use the built-in relative formatting from useFormatters
const { formatDate } = useFormatters();

// Automatic relative formatting
formatDate(new Date(), true);              // "Today"
formatDate(yesterday, true);               // "Yesterday"
formatDate(olderDate, true);               // "Wed Jan 10" (falls back to formatted)

// Custom relative logic (if needed)
const isToday = date.toDateString() === new Date().toDateString();
const displayDate = isToday ? 'Today' : formatDate(date);
```

### Internationalization Considerations

**Language and Locale Support**
```typescript
// Currency formatting supports language parameter
const { formatCurrency } = useFormatters();
formatCurrency(123.45, 'USD', 'en-US');   // "$123.45"
formatCurrency(123.45, 'USD', 'pt-BR');   // "US$ 123,45" (if Portuguese support added)

// Number formatting also supports locales
const { formatNumber } = useFormatters();
formatNumber(1234.56, 2, 'en-US');        // "1,234.56"
formatNumber(1234.56, 2, 'de-DE');        // "1.234,56" (if German support added)
```

**Future Internationalization**
```typescript
// When adding new locales, ensure currency and date formatting
// Uses the i18next locale for consistency
import { useTranslation } from 'react-i18next';

const { i18n } = useTranslation();
const locale = i18n.language || 'en-US';

const { formatCurrency, formatDate } = useFormatters();
formatCurrency(amount, currency, locale);
```

### Best Practices Summary

**Currency Formatting**
1. Always use `useFormatters().formatCurrency()` for display
2. Use `Currency` domain class for type safety and available currencies
3. Use `ProminentAmountInput` for currency input fields
4. **Fetch currency from `account?.currency` via `useSpendingAccount()` hook, default to 'USD'**
5. Never hardcode currency symbols or decimal formatting

**Date Formatting**
1. Use `useFormatters().formatDate()` for consistent formatting
2. Use `date-fns` functions for date manipulation and calculations
3. Enable relative formatting (`useRelative: true`) for recent dates
4. Use ISO date strings (`yyyy-MM-dd`) for form inputs
5. Leverage predefined `DateFormatString` constants for consistency

**Testing Considerations**
```typescript
// Mock formatters in tests for consistent behavior
vi.mock('@/hooks/ui/useFormatters', () => ({
  default: () => ({
    formatCurrency: (amount: number, currency?: string) => `$${amount.toFixed(2)}`,
    formatDate: (date: Date, relative?: boolean) =>
      relative && isToday(date) ? 'Today' : '01/15/2024',
    formatDaysUntil: (date: Date) => '5',
    formatNumber: (value: number, decimals?: number) => value.toFixed(decimals || 0),
  }),
}));
```

### Code Review Checklist
Use the provided pull request template to ensure:
- Style guide compliance
- Architecture patterns followed
- Test coverage adequate
- Documentation complete
- Performance considerations addressed
- **Currency formatting uses useFormatters hook consistently**
- **Date formatting leverages date-fns and useFormatters**
- **No hardcoded currency symbols or date formats**
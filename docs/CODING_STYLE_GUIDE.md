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

### Code Review Checklist
Use the provided pull request template to ensure:
- Style guide compliance
- Architecture patterns followed
- Test coverage adequate
- Documentation complete
- Performance considerations addressed
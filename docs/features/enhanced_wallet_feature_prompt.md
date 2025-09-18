# Simplified Wallet List Feature Prompt

## Task
Create a React component that displays a list of wallets for the PeriodDashboard. Each wallet should show in a card format with name, spent amount, and remaining balance.

## Layout
```
===================================
Wallets
 --------------------------------
 (icon) Wallet Name				>
        Spent:              $1000
        Remaining:           $500

 --------------------------------
 (icon) Wallet Name				>
        Spent:              $1000
        Remaining:           $500

 --------------------------------
===================================
```

## Requirements
- Create a `WalletList` component that uses the existing `GlassCard` component
- Each wallet row should be clickable (onClick handler for future navigation)
- Include wallet icon, name, spent amount, and remaining balance
- Format currency values using the establish patterns (e.g. see spending transactions)
- Use the WalletProvider to obtain the list of wallets for the current period

## Sample Data Structure
```typescript
interface Wallet {
  id: string;
  name: string;
  spent: number;
  remaining: number;
  icon?: string;
}
```

## Deliverables
1. `WalletList` component
2. Integration example for PeriodDashboard
3. Basic styling to match the layout above
4. Accessibility

Keep it simple and focused on the core functionality.

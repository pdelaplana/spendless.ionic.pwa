# Product Requirements Document: Wallets Feature

## Executive Summary

The Wallets feature enhances the Spendless application by introducing virtual spending compartments within periods, enabling users to organize their spending into categorized budgets with individual spending limits and transaction tracking.

## Problem Statement

Currently, users can only track spending at the period level without granular budget organization. Users need the ability to:
- Separate spending into different categories or purposes within a single period
- Set individual spending limits for different areas of their budget at the start of a period
- Focus on specific wallet spending when reviewing transactions

## Solution Overview

Implement a Wallets system that allows users to create multiple virtual wallets during period setup, each with its own name, spending limit, and transaction history. Users can switch between wallets to view filtered spending data.

## Target Users

- Primary: Existing Spendless users who want better budget organization
- Secondary: New users who prefer compartmentalized budget management
- User persona: Budget-conscious individuals who manage multiple spending categories

## User Stories

### Core User Stories

**As a user, I want to:**

1. **Create Multiple Wallets**
   - Create more than one wallet within a single period
   - Assign each wallet a descriptive name
   - Set a spending limit for each wallet
   - View all my wallets in a list or grid format

2. **Manage Wallet Transactions**
   - Create spending transactions that belong to a specific wallet
   - View spending transactions filtered by wallet
   - See wallet balance and remaining budget

3. **Switch Between Wallets**
   - Select a specific wallet to view
   - See only spending transactions for the selected wallet
   - View wallet-specific analytics and summaries
   - Maintain wallet context during app navigation

4. **Period Wallet Setup**
   - Set up multiple wallets when creating a new period
   - Define wallet names and spending limits during period creation
   - System automatically creates wallets when period begins
   - Modify wallet limits during the period if needed

### Advanced User Stories

**As a user, I want to:**

5. **Wallet Analytics**
   - View spending analytics per wallet
   - Compare spending across wallets
   - Track wallet performance against limits
   - Export wallet-specific data

6. **Wallet Management**
   - Edit wallet names and spending limits
   - Archive or delete empty wallets
   - Reorder wallets by preference
   - Set default wallet for new transactions

## Technical Requirements

### Data Models

#### New Entity: Wallet
```typescript
interface IWallet {
  readonly id?: string;
  readonly accountId: string;
  readonly periodId: string;
  readonly name: string;
  readonly spendingLimit: number;
  readonly currentBalance: number;
  readonly isDefault: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
```

#### Updated Entity: Spend
```typescript
interface ISpend {
  // ... existing fields
  readonly walletId: string; // NEW FIELD
  // ... rest of fields
}
```

#### Updated Entity: Period
```typescript
interface IPeriod {
  // ... existing fields
  readonly walletSetup?: IWalletSetup[]; // NEW FIELD - wallet definitions for period
  // ... rest of fields
}

interface IWalletSetup {
  readonly name: string;
  readonly spendingLimit: number;
  readonly isDefault: boolean;
}
```


### API Requirements

#### Wallet Management APIs
- `useFetchWalletsByPeriod` - Get all wallets for a period
- `useUpdateWallet` - Update wallet name/limit during active period
- `useDeleteWallet` - Delete wallet (only if empty)

#### Period Management APIs (Updated)
- `useCreatePeriod` - Updated to include wallet setup during creation
- `useUpdatePeriod` - Updated to modify wallet configurations

#### Wallet Transaction APIs
- `useFetchSpendingByWallet` - Get spending filtered by wallet

#### Wallet Analytics APIs
- `useFetchWalletBalance` - Get current wallet balance
- `useFetchWalletSummary` - Get wallet spending summary
- `useFetchWalletAnalytics` - Get wallet performance data

### Database Schema Changes

#### Firestore Collections

**New Collection: `wallets`**
```
/accounts/{accountId}/periods/{periodId}/wallets/{walletId}
```

**Updated Collection: `spending`**
- Add `walletId` field to existing documents
- Migrate existing spending to default wallet

### UI/UX Requirements

#### Period Creation Interface (Updated)
- Wallet setup section in period creation modal
- Add/remove wallet functionality during period setup
- Wallet name and spending limit input fields
- Default wallet indicator and validation

#### Wallet Management Interface
- Wallet list view with balance and remaining budget
- Wallet editing interface (for active periods)
- Wallet deletion confirmation

#### Wallet Selection Interface
- Wallet switcher component (dropdown/tabs)
- Current wallet indicator in header
- Wallet context preservation across navigation

#### Transaction Interface
- Wallet selection in spend creation modal
- Wallet-filtered transaction lists

#### Analytics Interface
- Wallet-specific spending charts
- Wallet comparison views
- Wallet performance indicators

## Wallet Setup Workflow

### Period Creation with Wallets

When users create a new period, they will follow this enhanced workflow:

1. **Basic Period Information**
   - Period name, goals, target spend/savings, dates (existing functionality)

2. **Wallet Setup (New Step)**
   - Default wallet automatically created with period target spend as limit
   - User can add additional wallets with custom names and limits
   - User can modify default wallet name and limit
   - Wallet limits should sum up to total period target spend (recommended, not enforced)

3. **Period Activation**
   - System creates actual wallet entities based on setup configuration
   - All wallets become available for spending assignment
   - Default wallet is pre-selected for first transactions

### Wallet Setup Rules

- **Minimum Configuration**: Every period must have at least one wallet (default)
- **Default Wallet**: One wallet must be marked as default for new transactions
- **Wallet Limits**: Individual wallet limits are independent (can exceed period total)
- **Name Uniqueness**: Wallet names must be unique within the same period
- **Setup Timing**: Wallets are defined during period creation, not added later

## Business Rules

### Wallet Creation
- Minimum 1 wallet per period (default wallet)
- Maximum 10 wallets per period
- Wallet names must be unique within a period
- Spending limits must be positive numbers

### Wallet Transactions
- All spending transactions must belong to a wallet
- Deleted wallets cannot have transactions

### Wallet Balance Calculation
- Balance = Sum of all spending transactions for wallet
- Available = Spending limit - Balance

## Migration Strategy

### Phase 1: Data Model Implementation
1. Create new Wallet and WalletTransfer domain entities
2. Update Spend entity to include walletId
3. Implement wallet validation rules

### Phase 2: API Implementation
1. Implement wallet management hooks
2. Update existing spend hooks to handle walletId
3. Update period creation to include wallet setup

### Phase 3: UI Implementation
1. Create wallet management components
2. Update period creation to include wallet setup
3. Update spend creation to include wallet selection
4. Implement wallet switching functionality

### Phase 4: Data Migration
1. Create default wallet setup for existing periods
2. Generate wallets from existing period configurations
3. Migrate existing spending to default wallets
4. Update database security rules

## Acceptance Criteria

### Period Wallet Setup
- [ ] User can define multiple wallets during period creation
- [ ] User can set name and spending limit for each wallet
- [ ] Wallet names must be unique within period setup
- [ ] System requires at least one default wallet per period
- [ ] Period creation automatically generates wallets when period begins

### Wallet Management
- [ ] User can edit wallet name and spending limit
- [ ] User can delete empty wallets
- [ ] User cannot delete wallet with transactions
- [ ] User can set one wallet as default

### Transaction Assignment
- [ ] All new spending transactions are assigned to a wallet
- [ ] User can select wallet when creating spending
- [ ] Existing spending is migrated to default wallet

### Wallet Switching
- [ ] User can switch between wallets
- [ ] Selected wallet context is preserved during navigation
- [ ] Spending list shows only transactions for selected wallet


### Wallet Analytics
- [ ] User can view wallet-specific spending summaries
- [ ] Wallet balance and remaining budget are calculated correctly
- [ ] Analytics respect wallet filtering

## Technical Considerations

### Performance
- Efficient querying of wallet-filtered spending data
- Optimized wallet balance calculations
- Minimal impact on existing spend operations

### Data Integrity
- Referential integrity between wallets and spending
- Consistent wallet balance calculations
- Proper handling of wallet deletion constraints

### Security
- Wallet data isolated by account and period
- Proper authorization for wallet operations
- Secure handling of wallet transfers

## Success Metrics

### User Engagement
- Percentage of users who create multiple wallets
- Average number of wallets per period
- Frequency of wallet switching actions

### Feature Adoption
- Percentage of spending assigned to non-default wallets
- Average number of wallets created per period
- Retention rate for wallet users

### User Experience
- Reduced time to find specific spending transactions
- Improved budget organization satisfaction scores
- Decreased support requests about budget management

## Dependencies

### Internal Dependencies
- Period management system
- Spending transaction system
- Authentication and authorization
- Analytics and reporting system

### External Dependencies
- Firebase Firestore for data storage
- React Query for state management
- Ionic components for UI
- React Hook Form for form handling

## Risks and Mitigation

### Technical Risks
- **Risk**: Complex data migration for existing spending
- **Mitigation**: Implement gradual migration with rollback capability

- **Risk**: Performance impact of wallet-filtered queries
- **Mitigation**: Implement proper database indexing and query optimization

### User Experience Risks
- **Risk**: Feature complexity overwhelming users
- **Mitigation**: Implement progressive disclosure and intuitive defaults

- **Risk**: Confusion about wallet vs period concepts
- **Mitigation**: Clear onboarding and contextual help

## Timeline

### Sprint 1 (1 week): Foundation
- Implement Wallet and WalletTransfer domain entities
- Create wallet validation rules
- Update Spend entity with walletId

### Sprint 2 (1 week): API Layer
- Implement wallet management hooks
- Update spend hooks for wallet integration
- Update period creation hooks for wallet setup

### Sprint 3 (1 week): Core UI
- Create wallet management components
- Update period creation UI to include wallet setup
- Implement wallet selection in spend creation
- Add wallet switching functionality

### Sprint 4 (1 week): Advanced Features
- Implement wallet analytics
- Create wallet management settings
- Add wallet limit modification during active periods

### Sprint 5 (1 week): Migration & Polish
- Implement data migration for existing users
- Polish UI/UX based on testing
- Update documentation and help content

## Future Enhancements

### Version 2 Features
- Wallet sharing between users
- Wallet templates and presets
- Advanced wallet budgeting rules
- Wallet-based notifications and alerts

### Integration Opportunities
- Export wallet data to external budgeting tools
- Import wallet structures from bank categories
- Integration with financial planning applications
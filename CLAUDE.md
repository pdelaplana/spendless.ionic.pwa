# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workspace Setup

This workspace contains the complete Spendless PWA project with all source code, configuration files, and dependencies. The project is located at `D:\Repos\spendless\spendless.ionic.pwa`.

## Project Overview

Spendless is a Progressive Web App (PWA) built with Ionic and React for mindful spending tracking. It's a full-stack application with Firebase backend integration, featuring offline capabilities, multi-currency support, and emotional awareness features for financial tracking.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server (Vite at http://localhost:5173)
- `npm run build` - TypeScript compile + production build
- `npm run build:pwa` - Build with PWA optimizations (includes PowerShell script)
- `npm run preview` - Preview production build locally

### Testing
- `npm run test.unit` - Run unit tests (Vitest)
- `npm run test.e2e` - Run E2E tests (Cypress, requires dev server running)

### Code Quality
- `npm run lint` - Lint with Biome
- `npm run format` - Format code with Biome
- `npm run check` - Lint and format with auto-fix

### PWA Assets
- `npm run generate-pwa-assets` - Generate PWA icons and splash screens from favicon.png

### Context7 MCP Server
- `npm run test-context7` - Test Context7 MCP server connection
- Configuration file: `.context7-mcp.json` 
- Usage: Include "use context7" in prompts for up-to-date documentation
- See `docs/CONTEXT7_SETUP.md` for detailed setup instructions

### Firebase
- `npm run fetch-indexes` - Fetch Firestore indexes (PowerShell script)
- Firebase emulators configured in firebase.json (Firestore: 8080, Hosting: 5000, Storage: 9199)

## Architecture Overview

### Core Stack
- **Frontend**: React 19 + TypeScript + Ionic Framework
- **Build Tool**: Vite with PWA plugin
- **State Management**: TanStack Query (React Query) for server state
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **Styling**: Emotion + Styled Components + Ionic CSS variables
- **Forms**: React Hook Form with validation
- **Internationalization**: i18next (English/Portuguese)
- **Testing**: Vitest (unit) + Cypress (E2E) + Testing Library
- **Monitoring**: Sentry for error tracking
- **Documentation**: Context7 MCP server for up-to-date library documentation

### Project Structure
```
src/
├── components/        # Reusable UI components
│   ├── forms/        # Form components with validation
│   ├── layouts/      # Page layout components
│   ├── shared/       # Common shared components
│   └── ui/           # Base UI components
├── domain/           # Business logic and entities
├── hooks/            # Custom React hooks
│   ├── api/         # API-specific hooks (account, period, spend)
│   ├── device/      # Device-specific hooks (camera, etc.)
│   └── ui/          # UI-related hooks
├── infrastructure/   # External service integrations (Firebase)
├── i18n/            # Internationalization setup
├── pages/           # Route components
├── providers/       # React context providers
├── routes/          # Routing configuration
└── theme/           # Styling and theme configuration
```

### Key Architectural Patterns

#### Domain-Driven Design
- Domain entities in `src/domain/` (Account, Spend, Period, etc.)
- Business logic separated from UI concerns
- Validation rules defined per domain entity

#### Hook-Based API Layer
- API hooks follow pattern: `use[Action][Entity]` (e.g., `useCreateAccount`)
- Consistent error handling and loading states
- React Query for caching and synchronization
- Sentry integration for error tracking

#### Firebase Integration
- Firestore collections: accounts, spending, periods, userProfileExtensions
- Authentication with custom profile extensions
- Offline-first with memory cache configuration
- Security rules for data access control

#### Provider Pattern
- `AuthProvider` - Authentication state and methods
- `SpendingAccountProvider` - Account-specific state management  
- `NetworkStatusProvider` - Online/offline status tracking

#### Route Structure
- Protected routes requiring authentication
- Nested route components for logical grouping
- Route-based code splitting with providers

## Development Guidelines

### Code Style
- Uses Biome for linting and formatting (not ESLint/Prettier)
- 2-space indentation, single quotes, always semicolons
- Line width: 100 characters
- TypeScript strict mode enabled

### Import Aliases
```typescript
'@/*' -> 'src/*'
'@components/*' -> 'src/components/*'
'@pages/*' -> 'src/pages/*'
'@hooks/*' -> 'src/hooks/*'
'@providers/*' -> 'src/providers/*'
'@infrastructure/*' -> 'src/infrastructure/*'
'@theme/*' -> 'src/theme/*'
'@i18n/*' -> 'src/i18n/*'
```

### Testing Approach
- Unit tests use Vitest with jsdom environment
- Firebase services mocked in test setup
- React Testing Library for component testing
- Cypress for E2E testing with base URL localhost:5173

### Firebase Development
- Local development uses Firebase emulators
- Environment variables for Firebase configuration (VITE_FIREBASE_*)
- Firestore security rules and indexes version controlled
- CI/CD deploys to Firebase Hosting with preview deployments for PRs

### PWA Considerations
- Icons generated from public/favicon.png
- Service worker auto-update enabled
- Offline-first Firestore configuration
- Capacitor integration for native device features

### Form Validation
- React Hook Form with domain-specific validation rules
- Validation schemas in `src/domain/validation/`
- Consistent error messaging and UX patterns

### Internationalization
- i18next configuration with English/Portuguese support
- Translation files in `src/i18n/locales/`
- Date and currency formatting per locale

### Context7 Integration
- MCP server providing up-to-date documentation for all project libraries
- Use "use context7" in AI prompts to fetch current documentation
- Particularly useful for React 19, Ionic, Firebase, and TanStack Query
- Configuration in `.context7-mcp.json`
- Test connection with `npm run test-context7`
- Full setup guide available at `docs/CONTEXT7_SETUP.md`

## Firebase Environment Variables Required

Development requires these environment variables:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_SENTRY_DSN` (optional, for error tracking)

## CI/CD Pipeline

GitHub Actions workflows:
- **Pull Requests**: Build and deploy preview to Firebase Hosting
- **Main Branch**: Run tests, build, and deploy to production
- Unit tests must pass before deployment
- Firebase service account required for deployments
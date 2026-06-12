# Specification: Monorepo Reorganization

## Overview
This track involves transitioning the Spendless ecosystem from multiple isolated repositories into a single monorepo. This will streamline development, sharing of code (especially types), and deployment processes.

## Functional Requirements
1. **Monorepo Scaffolding**: Implement a workspace-aware root structure using `npm` or `pnpm` workspaces.
2. **Standardized Structure**: Organize projects into `apps/` and `packages/`.
    - `apps/mobile-pwa` (formerly `spendless.ionic.pwa`)
    - `apps/cloud-functions` (formerly `spendless.cloud.functions`)
    - `apps/website` (formerly `spendless.website`)
    - `packages/shared` (for shared types and utilities)
3. **Unified Tooling**:
    - Centralized linting and formatting (using Biome as per tech stack).
    - Unified build and test commands from the root.
4. **Migration**: Move the existing `spendless.ionic.pwa` code into `apps/mobile-pwa`.
5. **Single Deploy Command**: Implement a root-level command to deploy the entire stack to Firebase.

## Non-Functional Requirements
1. **Developer Experience**: Simplify setup (single `npm install` at root).
2. **Type Safety**: Enable shared types between frontend and backend.

## Acceptance Criteria
- [ ] Root `package.json` defines workspaces for `apps/*` and `packages/*`.
- [ ] Existing PWA code successfully moved to `apps/mobile-pwa` and builds correctly.
- [ ] Root-level `npm run lint` and `npm run build` work across all workspaces.
- [ ] Root-level `npm run deploy` triggers Firebase deployment.

## Out of Scope
- Implementing new features within individual apps.
- Preserving full git history of external repos (assuming fresh migration).
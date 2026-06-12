# Implementation Plan: Monorepo Reorganization

## Phase 1: Foundation & Scaffolding
- [ ] Task: Initialize Root Workspace
    - [ ] Create root `package.json` with `workspaces` field (`apps/*`, `packages/*`).
    - [ ] Set up root `.gitignore` to handle monorepo structure.
- [ ] Task: Centralize Tooling
    - [ ] Move `biome.json` to root and configure for workspace-wide linting.
    - [ ] Set up base `tsconfig.json` at root for shared TypeScript settings.
- [ ] Task: Conductor - User Manual Verification 'Foundation & Scaffolding' (Protocol in workflow.md)

## Phase 2: Migration of Existing Repos
- [ ] Task: Move Current PWA to `apps/mobile-pwa`
    - [ ] Relocate current root files into `apps/mobile-pwa`.
- [ ] Task: Move Sibling `spendless.cloud.functions` to `apps/cloud-functions`
    - [ ] Relocate sibling repo files into `apps/cloud-functions`.
- [ ] Task: Move Sibling `spendless.website` to `apps/website`
    - [ ] Relocate sibling repo files into `apps/website`.
- [ ] Task: Conductor - User Manual Verification 'Migration of Existing Repos' (Protocol in workflow.md)

## Phase 3: Integration & Project Fixes
- [ ] Task: Update Project Configurations
    - [ ] Update `package.json` names and relative paths in `apps/`.
    - [ ] Fix PWA configs (`vite.config.ts`, `ionic.config.json`).
    - [ ] Update `firebase.json` for new directory structure.
- [ ] Task: Conductor - User Manual Verification 'Integration & Project Fixes' (Protocol in workflow.md)

## Phase 4: Shared Packages & Unified Workflow
- [ ] Task: Initialize `packages/shared`
    - [ ] Create shared package for domain types and common utilities.
    - [ ] Migrate common types from PWA to `shared`.
- [ ] Task: Implement Root-Level Tooling
    - [ ] Add `build`, `lint`, `test`, and `deploy` scripts to root `package.json`.
- [ ] Task: Conductor - User Manual Verification 'Shared Packages & Unified Workflow' (Protocol in workflow.md)
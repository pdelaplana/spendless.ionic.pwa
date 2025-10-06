# CI/CD Pipeline Implementation Plan

## Overview
Implement a dual-environment CI/CD pipeline with automatic versioning, changelog generation, and semantic releases.

## Branching Strategy

### Branches
- **`development`** - Integration branch for development work (deploys to dev environment)
- **`main`** - Production-ready code only (deploys to prod environment)

### Workflow
1. Feature development → PR to `development` → Preview deployment
2. Merge to `development` → Auto-deploy to dev + create dev version tag
3. `development` → PR to `main` → Preview deployment
4. Merge to `main` → Auto-deploy to prod + create release version + changelog

## Firebase Environments

- **Dev Environment**: `spendless-dev-15971` (existing)
- **Prod Environment**: To be created by user

## GitHub Environments

GitHub Environments provide centralized secret management and deployment protection rules.

### Development Environment
- **Name**: `development`
- **Protection Rules**: None (fast iteration)
- **Secrets**: Dev Firebase configuration
- **Deployment Branches**: Only `development` branch

### Production Environment
- **Name**: `production`
- **Protection Rules**:
  - Optional: Require manual approval before deployment
  - Wait timer: Optional 5-minute delay
- **Secrets**: Production Firebase configuration
- **Deployment Branches**: Only `main` branch

## Versioning Strategy

### Semantic Versioning
- Format: `MAJOR.MINOR.PATCH`
- Starting version: **`0.1.0`**
- Development tags: `v{version}-dev.{build}` (e.g., `v0.1.0-dev.1`)
- Production tags: `v{version}` (e.g., `v0.1.0`)

### Automatic Versioning
- Use **semantic-release** for automatic version bumping
- Version increments based on commit message conventions (Conventional Commits)
- User can seed/override version when needed
- Updates `package.json` version automatically on production releases

### Commit Message Convention
```
feat: description       # MINOR version bump (0.1.0 → 0.2.0)
fix: description        # PATCH version bump (0.1.0 → 0.1.1)
feat!: description      # MAJOR version bump (0.1.0 → 1.0.0)
chore: description      # No version bump
docs: description       # No version bump
```

## Workflow Definitions

### 1. Deploy to Development (`deploy-development.yml`)

**Trigger**: Push to `development` branch

**GitHub Environment**: `development`

**Steps**:
1. Checkout code
2. Setup Node.js 20 with npm cache
3. Install dependencies (`npm ci`)
4. Run unit tests (`npm run test.unit`)
5. Build with dev Firebase config (from environment secrets)
6. Deploy to Firebase dev environment
7. Create dev version tag (e.g., `v0.1.0-dev.5`)
8. Push tag to repository

**Environment Variables**: Uses secrets from `development` environment

### 2. Deploy to Production (`deploy-production.yml`)

**Trigger**: Push to `main` branch

**GitHub Environment**: `production`

**Steps**:
1. Checkout code with full history
2. Setup Node.js 20 with npm cache
3. Install dependencies (`npm ci`)
4. Run unit tests (`npm run test.unit`)
5. Run semantic-release to determine version
6. Update `package.json` with new version
7. Build with prod Firebase config (from environment secrets)
8. Deploy to Firebase prod environment
9. Create release tag (e.g., `v0.1.0`)
10. Generate changelog from commits
11. Create GitHub release with changelog
12. Commit updated `package.json` back to main

**Environment Variables**: Uses secrets from `production` environment

**Protection**: Optional manual approval or wait timer before deployment

### 3. PR Preview Deployments (`firebase-hosting-pull-request.yml`)

**Trigger**: Pull requests to `development` or `main`

**GitHub Environment**:
- `development` (for PRs to `development` branch)
- `production` (for PRs to `main` branch)

**Steps**:
1. Checkout code
2. Setup Node.js and install dependencies
3. Run unit tests
4. Determine target environment based on base branch
5. Build with appropriate Firebase config (from target environment secrets)
6. Deploy preview to Firebase hosting
7. Comment on PR with preview URL

**Permissions**:
- checks: write
- contents: read
- pull-requests: write

## GitHub Secrets Configuration

Secrets are organized using **GitHub Environments** for better isolation and management.

### Environment: `development`
Store these secrets in the `development` environment:
- `FIREBASE_SERVICE_ACCOUNT` → Use existing `FIREBASE_SERVICE_ACCOUNT_SPENDLESS_DEV_15971`
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `SENTRY_DSN` (optional)

### Environment: `production`
Store these secrets in the `production` environment:
- `FIREBASE_SERVICE_ACCOUNT` → Production service account JSON
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `SENTRY_DSN` (optional - separate Sentry project recommended)

### Repository Secrets (Shared)
These secrets are used across all workflows:
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions
- Optional: `GH_TOKEN` - Personal Access Token for semantic-release (if GITHUB_TOKEN permissions insufficient)

## Branch Protection Rules

### `main` branch
- Require pull request before merging
- Require status checks to pass:
  - Unit tests
  - Build success
- Require branches to be up to date before merging
- Allow user to bypass (sole developer)

### `development` branch
- Optional: Require status checks to pass
- Allow direct pushes (for rapid development)

## Dependencies to Add

```json
{
  "devDependencies": {
    "@semantic-release/changelog": "^6.0.3",
    "@semantic-release/git": "^10.0.1",
    "semantic-release": "^24.0.0"
  }
}
```

## Configuration Files

### `.releaserc.json` (Semantic Release Config)
```json
{
  "branches": [
    "main",
    {
      "name": "development",
      "prerelease": "dev"
    }
  ],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/github",
    [
      "@semantic-release/git",
      {
        "assets": ["package.json", "CHANGELOG.md"],
        "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ]
  ]
}
```

## Workflow Files to Create/Modify

### Files to Rename
- `firebase-hosting-merge.yml` → `deploy-development.yml`

### Files to Create
- `deploy-production.yml` (new)

### Files to Modify
- `firebase-hosting-pull-request.yml` (update to handle both dev and main PRs)

## Implementation Steps

### Phase 1: User Setup (Prerequisites)
- [ ] Create production Firebase project
- [ ] Generate Firebase service account for production
- [ ] Create GitHub Environments in repository settings:
  - [ ] Create `development` environment
  - [ ] Create `production` environment
  - [ ] Configure production environment protection rules (optional approval/wait timer)
  - [ ] Set deployment branch restrictions
- [ ] Add Firebase secrets to GitHub Environments:
  - [ ] Add all dev Firebase secrets to `development` environment
  - [ ] Add all prod Firebase secrets to `production` environment
- [ ] Create `development` branch from `main`
- [ ] Push `development` branch to remote

### Phase 2: Package Configuration
- [ ] Install semantic-release dependencies
- [ ] Create `.releaserc.json` configuration
- [ ] Update `package.json` version to `0.1.0`

### Phase 3: Workflow Implementation
- [ ] Rename and update `deploy-development.yml`
- [ ] Create `deploy-production.yml`
- [ ] Update `firebase-hosting-pull-request.yml`
- [ ] Test workflows with sample commits

### Phase 4: Branch Protection
- [ ] Enable branch protection on `main`
- [ ] Configure required status checks
- [ ] Configure bypass permissions for user

### Phase 5: Documentation
- [ ] Update `CLAUDE.md` with new CI/CD process
- [ ] Update README with branching strategy
- [ ] Document version seeding process

## Version Seeding Process

To manually seed a version:

1. **Update package.json**:
   ```bash
   npm version 1.0.0 --no-git-tag-version
   ```

2. **Commit and push**:
   ```bash
   git add package.json
   git commit -m "chore: seed version to 1.0.0"
   git push
   ```

3. **Semantic release will use this as base** for future increments

## Testing Strategy

### Pre-deployment Testing
1. Create test branch from `development`
2. Make commit with `feat:` prefix
3. Open PR to `development`
4. Verify preview deployment
5. Merge and verify dev deployment + version tag
6. Open PR from `development` to `main`
7. Verify preview deployment
8. Merge and verify prod deployment + release creation

## Rollback Strategy

### Development Rollback
- Revert commit in `development` branch
- Redeploy automatically on push

### Production Rollback
- Option 1: Revert merge commit in `main` and push (triggers new deployment)
- Option 2: Manual Firebase rollback to previous deployment
- Option 3: Cherry-pick fix to `development`, fast-track to `main`

## Changelog Generation

- Automatically generated from commit messages using Conventional Commits
- Saved to `CHANGELOG.md` in repository root
- Included in GitHub release notes
- Categorized by type (Features, Bug Fixes, Breaking Changes)

## Success Criteria

- ✅ Merges to `development` auto-deploy to dev environment
- ✅ Merges to `main` auto-deploy to prod environment
- ✅ Development builds tagged with `-dev` suffix
- ✅ Production releases tagged with semantic version
- ✅ Changelog auto-generated and published
- ✅ `package.json` version auto-updated on prod releases
- ✅ PR previews work for both branches with correct environment configs
- ✅ User can seed/override versions when needed
- ✅ GitHub Environments properly isolate dev and prod secrets
- ✅ Optional: Production deployments require manual approval

## GitHub Environment Setup Guide

### Creating Environments

1. **Navigate to Repository Settings**:
   - Go to your GitHub repository
   - Click **Settings** → **Environments**

2. **Create Development Environment**:
   - Click **New environment**
   - Name: `development`
   - Protection rules: None (for fast iteration)
   - Deployment branches: Select "Selected branches" → Add `development`
   - Add secrets (see GitHub Secrets Configuration section)

3. **Create Production Environment**:
   - Click **New environment**
   - Name: `production`
   - Protection rules (optional):
     - ✅ Required reviewers: Add yourself (for manual approval)
     - ✅ Wait timer: 5 minutes (to allow last-minute cancellations)
   - Deployment branches: Select "Selected branches" → Add `main`
   - Add secrets (see GitHub Secrets Configuration section)

### Using Environments in Workflows

Workflows reference environments using the `environment` key:

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # References the "production" environment
    steps:
      - name: Deploy
        env:
          FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}  # From production environment
```

This provides:
- ✅ Scoped secrets per environment
- ✅ Deployment protection rules
- ✅ Deployment history per environment
- ✅ Environment-specific approvals and wait timers
# CI/CD Pipeline Documentation

## Overview

The Spendless Cloud Functions project uses GitHub Actions for continuous integration and deployment to Firebase. The pipeline automatically tests, builds, and deploys functions to Firebase Cloud Functions when changes are pushed to specific branches.

## Pipeline Configuration

**Location**: [.github/workflows/deploy-functions.yml](../.github/workflows/deploy-functions.yml)

## Trigger Conditions

### Automatic Triggers

The pipeline runs automatically when:

1. **Push to `main` branch** → Deploys to **production** environment
2. **Push to `development` branch** → Deploys to **dev** environment

**Path Filter**: Only triggers when files in `functions/**` directory are modified.

### Manual Trigger

The pipeline can be triggered manually via `workflow_dispatch` with options:
- **Environment**: Choose `dev` or `prod`
- **Debug Mode**: Enable/disable debug mode (boolean)

## Pipeline Stages

### Stage 1: Test & Quality Checks

**Job Name**: `test`
**Runner**: `ubuntu-latest`

#### Steps

1. **Checkout code** - Uses `actions/checkout@v4`
2. **Setup Node.js 22** - Uses `actions/setup-node@v4` with npm cache
3. **Install dependencies** - Runs `npm ci` in `functions/` directory
4. **Biome lint & format check** - Runs `npm run biome:check`
5. **Unit tests** - Runs `npm test`
6. **Coverage report** - Runs `npm run test:coverage`
7. **Archive coverage** - Uploads coverage report artifact (14-day retention)

**Quality Gates**: All steps must pass before deployment proceeds.

### Stage 2: Deploy Firebase Functions

**Job Name**: `deploy`
**Runner**: `ubuntu-latest`
**Dependencies**: Requires `test` job to pass
**Conditions**: Only runs on `main`, `development` branches or manual trigger

#### Environment Selection Logic

```yaml
environment: ${{ github.ref == 'refs/heads/main' && 'prod' || github.event.inputs.environment || 'dev' }}
```

- `main` branch → `prod` environment
- `development` branch → `dev` environment
- Manual trigger → User-selected environment

#### Environment Variables

Set from GitHub repository variables:
- `ENVIRONMENT` - Application environment (prod/dev)
- `DATABASE_ID` - Firestore database ID
- `STORAGE_BUCKET` - Firebase Storage bucket name
- `FIREBASE_PROJECT_ID` - Firebase project identifier

#### Steps

1. **Checkout code**
2. **Setup Node.js 22** with npm cache
3. **Install dependencies** - `npm ci`
4. **Install Firebase CLI** - `npm install --no-save firebase-tools`
5. **Authenticate to Google Cloud** - Uses `google-github-actions/auth@v2` with service account credentials
6. **Create service account file** - Writes `FIREBASE_SERVICE_ACCOUNT` secret to `spendless-firebase-adminsdk.json`
7. **Create `.env` file** with secrets:
   - `SENTRY_DSN`
   - `ENVIRONMENT`
   - `DEBUG_MODE`
   - `MAILGUN_API_KEY`
   - `MAILGUN_DOMAIN`
   - `DATABASE_ID`
   - `STORAGE_BUCKET`
   - `PROJECT_ID`
8. **Build functions** - Runs `npm run build`
9. **Deploy to Firebase** - Runs `firebase deploy --only functions --force`

## Required Secrets

Configure these in GitHub repository settings:

### Repository Secrets

- `FIREBASE_SERVICE_ACCOUNT` - Firebase Admin SDK service account JSON
- `SENTRY_DSN` - Sentry error tracking DSN
- `MAILGUN_API_KEY` - Mailgun API key for email sending
- `MAILGUN_DOMAIN` - Mailgun verified domain

### Repository Variables (per environment)

- `DATABASE_ID` - Firestore database ID
- `STORAGE_BUCKET` - Firebase Storage bucket name
- `FIREBASE_PROJECT_ID` - Firebase project ID

## Firebase Configuration

### firebase.json

```json
{
  "functions": [{
    "source": "functions",
    "codebase": "default",
    "runtime": "nodejs22",
    "ignore": [
      "node_modules", ".git", "firebase-debug.log",
      "*.local", "src", "scripts", "**/__tests__",
      "*.spec.ts", "*.spec.js", ".gitignore"
    ],
    "predeploy": ["npm --prefix \"$RESOURCE_DIR\" run build"]
  }]
}
```

**Key Settings**:
- **Runtime**: Node.js 22
- **Source**: `functions/` directory
- **Predeploy Hook**: Automatically runs `npm run build` before deployment
- **Ignored Files**: Source files, tests, and development artifacts are excluded from deployment

### .firebaserc

```json
{
  "projects": {
    "default": "spendless-dev-15971"
  }
}
```

The default project is overridden during deployment via `firebase use $FIREBASE_PROJECT_ID`.

## Build Process

The build process compiles TypeScript and copies email templates:

```bash
npm run build  # tsc only (templates copied via firebase predeploy hook if needed)
```

**Build Outputs**:
- TypeScript compiled to `lib/` directory
- Email templates copied from `src/templates/` to `lib/templates/`

## Deployment Strategy

### Branch-Based Deployment

| Branch | Environment | Firebase Project | Auto Deploy |
|--------|-------------|------------------|-------------|
| `main` | Production | Set via `FIREBASE_PROJECT_ID` | Yes |
| `development` | Development | Set via `FIREBASE_PROJECT_ID` | Yes |
| Other branches | - | - | No |

### Deployment Command

```bash
firebase deploy --only functions --force
```

**Flags**:
- `--only functions` - Deploys only Cloud Functions (not Firestore rules, hosting, etc.)
- `--force` - Forces deployment without confirmation prompts

## Testing Strategy

### Automated Tests (CI Pipeline)

1. **Linting**: Biome checks for code quality and formatting issues
2. **Unit Tests**: Jest test suite with coverage reporting
3. **Coverage Threshold**: Currently no minimum threshold enforced

### Local Testing

Before pushing code, developers should run:

```bash
cd functions
npm run biome:check  # Lint & format check
npm test             # Unit tests
npm run test:coverage # Coverage report
```

## Deployment Verification

After deployment, verify:

1. **Firebase Console**: Check function deployment status
2. **Logs**: Monitor for deployment errors via `npm run logs`
3. **Health Check**: Hit `/healthcheck` endpoint to verify functions are running
4. **Sentry**: Verify error tracking is working

## Rollback Procedure

If a deployment fails or introduces bugs:

1. **Revert commit** on the deployed branch
2. **Push revert** to trigger automatic redeployment
3. **Alternative**: Manually deploy previous version:
   ```bash
   git checkout <previous-commit>
   cd functions
   npm run build
   npm run deploy
   ```

## Pipeline Monitoring

### GitHub Actions Dashboard

View pipeline runs at: `https://github.com/<org>/spendless.cloud.functions/actions`

### Artifacts

- **Coverage Report**: Available for 14 days after each run
- **Download**: From Actions run page → Artifacts section

### Notifications

Pipeline status notifications are sent via:
- GitHub UI notifications
- Email (if configured in GitHub settings)
- Status checks on pull requests

## Best Practices

1. **Always test locally** before pushing to `development` or `main`
2. **Use pull requests** for code review before merging to `main`
3. **Monitor deployments** via Firebase Console after automatic deployments
4. **Check Sentry** for errors after production deployments
5. **Use manual trigger** sparingly and only when necessary
6. **Keep secrets up to date** in GitHub repository settings
7. **Review coverage reports** to maintain test quality

## Troubleshooting

### Common Issues

**Build Fails**:
- Check TypeScript compilation errors
- Verify all dependencies are in `package.json`
- Ensure Node.js version 22 is specified

**Deployment Fails**:
- Verify `FIREBASE_SERVICE_ACCOUNT` secret is valid
- Check Firebase project permissions
- Ensure environment variables are set correctly

**Tests Fail**:
- Run tests locally: `npm test`
- Check for environmental differences (Node version, dependencies)
- Review test logs in GitHub Actions output

**Authentication Errors**:
- Verify Google Cloud authentication step succeeded
- Check service account has necessary permissions
- Ensure `FIREBASE_SERVICE_ACCOUNT` secret is properly formatted JSON

## Future Improvements

Potential enhancements to the CI/CD pipeline:

- [ ] Add staging environment between dev and prod
- [ ] Implement deployment approvals for production
- [ ] Add smoke tests after deployment
- [ ] Implement blue-green or canary deployments
- [ ] Add Slack/Discord notifications for deployment status
- [ ] Implement automatic rollback on error spike detection
- [ ] Add performance regression testing
- [ ] Implement version tagging on successful production deploys

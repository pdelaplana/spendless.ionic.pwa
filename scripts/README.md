# Firebase Configuration Scripts

This directory contains PowerShell scripts for managing Firebase configuration across environments.

## Scripts Overview

### 1. `deploy-to-prod.ps1`
Deploy Firestore indexes, rules, and storage rules to production environment from the `config/` directory.

**Usage:**
```powershell
# Interactive mode (prompts for project ID)
.\scripts\deploy-to-prod.ps1

# With project ID specified
.\scripts\deploy-to-prod.ps1 -ProductionProjectId "spendless-prod"

# Dry run (preview without deploying)
.\scripts\deploy-to-prod.ps1 -ProductionProjectId "spendless-prod" -DryRun
```

**What it does:**
- Validates Firebase CLI installation
- Copies config files from `config/` to root directory
- Displays current configuration files
- Prompts for confirmation before deploying
- Deploys Firestore indexes, Firestore rules, and Storage rules
- Switches back to dev project after completion

### 2. `fetchFirestoreIndexes.ps1`
Fetch Firestore indexes from Firebase and save to `config/` directory.

**Usage:**
```powershell
# Fetch from dev (default)
.\scripts\fetchFirestoreIndexes.ps1

# Fetch from production
.\scripts\fetchFirestoreIndexes.ps1 -ProjectId "spendless-prod"

# Fetch to custom directory
.\scripts\fetchFirestoreIndexes.ps1 -ProjectId "spendless-prod" -OutputPath "backup"
```

**What it does:**
- Downloads Firestore indexes from Firebase
- Saves to `config/firestore.indexes.json` by default
- Switches back to dev project after completion

**Note:** This script ONLY fetches indexes. Firestore rules and Storage rules cannot be downloaded from Firebase and must be maintained locally in the `config/` directory.

### 3. `optimize-pwa.ps1`
Optimize PWA build for production.

**Usage:**
```powershell
npm run build:pwa
```

## Configuration Structure

All production-ready configuration files are stored in the `config/` directory:

```
config/
├── firestore.indexes.json   # Firestore composite indexes
├── firestore.rules          # Firestore security rules
├── storage.rules            # Cloud Storage security rules
└── README.md               # Configuration documentation
```

**Important:** Rules files (`firestore.rules`, `storage.rules`) are version controlled and cannot be downloaded from Firebase. They are the source of truth.

## Common Workflows

### Initial Production Setup
1. Create production Firebase project
2. Deploy configuration to production:
   ```powershell
   .\scripts\deploy-to-prod.ps1 -ProductionProjectId "spendless-prod"
   ```

### Update Production with Dev Changes
```powershell
# 1. Fetch latest indexes from dev
.\scripts\fetchFirestoreIndexes.ps1

# 2. Update rules in config/ directory (manually edit)

# 3. Deploy to production
.\scripts\deploy-to-prod.ps1 -ProductionProjectId "spendless-prod"
```

### Backup Production Indexes
```powershell
.\scripts\fetchFirestoreIndexes.ps1 -ProjectId "spendless-prod" -OutputPath "backup"
```

### Update Local Indexes from Dev
```powershell
# Fetch latest indexes and save to config directory
.\scripts\fetchFirestoreIndexes.ps1
```

## Configuration Files

### Firestore Indexes (`config/firestore.indexes.json`)
- Can be downloaded from Firebase using `fetchFirestoreIndexes.ps1`
- Defines composite indexes for complex queries
- Auto-generated from Firebase console or cloud functions

### Firestore Rules (`config/firestore.rules`)
- **Cannot be downloaded from Firebase**
- Must be maintained locally in version control
- Source of truth for security rules
- Deploy with `deploy-to-prod.ps1`

### Storage Rules (`config/storage.rules`)
- **Cannot be downloaded from Firebase**
- Must be maintained locally in version control
- Source of truth for storage security rules
- Deploy with `deploy-to-prod.ps1`

## Prerequisites

- PowerShell 5.1 or later
- Node.js and npm installed
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase authentication (`firebase login`)

## Notes

- Scripts automatically install Firebase CLI if not present
- Configuration files in `config/` directory are version controlled
- Root-level config files are temporary (copied during deployment)
- Scripts always switch back to dev project after completion
- Supports dry-run mode for testing without deploying

## Firebase CLI Limitations

The Firebase CLI **cannot download** security rules from Firebase. Available commands:
- ✅ `firebase firestore:indexes` - Download indexes
- ✅ `firebase deploy --only firestore:rules` - Deploy rules
- ❌ No command to download rules from Firebase

This is why rules are maintained locally in the `config/` directory as the source of truth.

## Troubleshooting

### Firebase CLI not found
The scripts will automatically install Firebase CLI. If issues persist:
```powershell
npm install -g firebase-tools
```

### Authentication errors
Ensure you're logged in:
```powershell
firebase login
```

### Project not found
List available projects:
```powershell
firebase projects:list
```

### Permission denied
Ensure your Firebase account has owner/editor role on both projects.

### Config files not found
Ensure you're running scripts from the repository root:
```powershell
cd d:\Repos\spendless\spendless.ionic.pwa
.\scripts\deploy-to-prod.ps1
```

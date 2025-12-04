# Firestore Indexes Deployment Guide

This guide explains how to manage and deploy Firestore indexes across development and production environments.

## Overview

Firestore composite indexes are required when:
- Combining `where()` filters with `orderBy()` on different fields
- Using multiple `where()` filters on different fields
- Combining array-contains filters with other filters

## Current Indexes

All Firestore indexes are defined in `config/firestore.indexes.json`:

1. **periods** - `closedAt` (ASC) + `startAt` (DESC)
2. **spending** - `periodId` (ASC) + `amount` (ASC)
3. **spending** - `periodId` (ASC) + `date` (DESC)
4. **wallets** - `isDefault` (DESC) + `name` (ASC)
5. **aiInsights** - `analysisType` (ASC) + `generatedAt` (DESC)

## Deploying to Development

Indexes are automatically deployed when you use:

```powershell
firebase deploy --only firestore:indexes
```

Or deploy all Firestore config:

```powershell
firebase deploy --only firestore
```

## Deploying to Production

### Option 1: Using the npm script (Recommended)

```bash
npm run deploy:firebase-prod
```

This script will:
1. Check Firebase authentication
2. List available projects
3. Prompt for production project ID
4. Show current configuration
5. Ask for confirmation
6. Deploy indexes, rules, and storage rules
7. Switch back to dev project

### Option 2: Manual deployment

```powershell
# Switch to production project
firebase use <production-project-id>

# Deploy indexes
firebase deploy --only firestore:indexes

# Switch back to dev
firebase use spendless-dev-15971
```

### Option 3: Dry run (preview only)

```powershell
powershell -File scripts/deploy-to-prod.ps1 -DryRun
```

## Adding New Indexes

When you add queries that require new indexes:

1. **Update the index file**: `config/firestore.indexes.json`

   ```json
   {
     "collectionGroup": "yourCollection",
     "queryScope": "COLLECTION",
     "fields": [
       {
         "fieldPath": "field1",
         "order": "ASCENDING"  // or "DESCENDING"
       },
       {
         "fieldPath": "field2",
         "order": "DESCENDING"
       }
     ]
   }
   ```

2. **Deploy to development**:
   ```bash
   firebase deploy --only firestore:indexes
   ```

3. **Test the query** to ensure it works

4. **Deploy to production**:
   ```bash
   npm run deploy:firebase-prod
   ```

## Troubleshooting

### Query fails with "index required" error

**Symptom**: Query hangs or fails with console error about missing index

**Solution**:
1. Check the error message for the required index fields
2. Add the index to `config/firestore.indexes.json`
3. Deploy the index
4. Wait 1-2 minutes for index to build (check Firebase Console)

### Index deployment fails

**Symptom**: `firebase deploy --only firestore:indexes` fails

**Common causes**:
- Not authenticated: Run `firebase login`
- Wrong project: Run `firebase use <project-id>`
- Invalid JSON: Validate `config/firestore.indexes.json`
- Permissions: Ensure you have Editor/Owner role on the Firebase project

### Index not working after deployment

**Wait time**: Indexes can take 1-2 minutes to build, especially for large collections

**Check status**:
- Go to Firebase Console → Firestore → Indexes
- Look for "Building" or "Enabled" status

## Firebase.json Configuration

The `firebase.json` file is configured to read from the `config/` directory:

```json
{
  "firestore": {
    "rules": "config/firestore.rules",
    "indexes": "config/firestore.indexes.json"
  }
}
```

This keeps all Firebase configuration in one place.

## Best Practices

1. **Test in development first**: Always test new indexes in dev before deploying to production
2. **Document queries**: Add comments in code explaining why specific indexes are needed
3. **Monitor performance**: Use Firebase Console to monitor index usage and performance
4. **Version control**: All index changes should be committed to git
5. **Coordinate deploys**: Announce index deployments to team to avoid conflicts

## Related Scripts

- `scripts/deploy-to-prod.ps1` - Deploy all Firestore config to production
- `scripts/fetchFirestoreIndexes.ps1` - Fetch current indexes from Firebase
- `firebase.json` - Firebase configuration file

## Support

For questions or issues, check:
- [Firebase Indexes Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- Project README.md
- CLAUDE.md (project-specific instructions)

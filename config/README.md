# Firebase Security Rules

This directory contains production-ready security rules for Firebase services.

## Files

### `firestore.rules`
Security rules for Firestore database ensuring:
- User data isolation (users can only access their own data)
- Required field validation on document creation
- Proper access control for nested collections (periods)
- Prevention of user profile deletion

**Collections Secured:**
- `/userProfileExtensions/{userId}` - User profile data
- `/accounts/{accountId}` - Spending accounts
- `/accounts/{accountId}/periods/{periodId}` - Budget periods
- `/spending/{spendId}` - Spending entries

### `storage.rules`
Security rules for Cloud Storage ensuring:
- User-specific file access
- File type validation (images only for profiles)
- File size limits (5MB for profiles, 10MB for receipts, 20MB for temp files)
- Path-based access control

**Paths Secured:**
- `/users/{userId}/profile/{fileName}` - Profile images (public read, owner write)
- `/spending/{userId}/receipts/{fileName}` - Receipt images (owner only)
- `/accounts/{accountId}/documents/{fileName}` - Account documents
- `/temp/{userId}/{fileName}` - Temporary uploads

## Usage

### Deploy to Development
```powershell
# Copy to root and deploy
Copy-Item config\firestore.rules firestore.rules -Force
Copy-Item config\storage.rules storage.rules -Force

firebase use spendless-dev-15971
firebase deploy --only firestore:rules,storage
```

### Deploy to Production
```powershell
# Use deployment script
.\scripts\deploy-to-prod.ps1 -ProductionProjectId "spendless-prod"
```

### Testing Rules Locally
```powershell
# Start emulators with rules
firebase emulators:start

# Rules are loaded from root-level files:
# - firestore.rules
# - storage.rules
```

## Rule Structure

### Firestore Rules Pattern
```javascript
match /collection/{docId} {
  allow read: if isAuthenticated() && isOwner(resource.data.userId);
  allow create: if isAuthenticated()
                && isOwner(request.resource.data.userId)
                && hasRequiredFields(['field1', 'field2']);
  allow update: if isAuthenticated() && isOwner(resource.data.userId);
  allow delete: if isAuthenticated() && isOwner(resource.data.userId);
}
```

### Storage Rules Pattern
```javascript
match /path/{userId}/{fileName} {
  allow read: if isAuthenticated() && isOwner(userId);
  allow write: if isAuthenticated()
               && isOwner(userId)
               && isValidFileType()
               && isUnderSizeLimit(10);
  allow delete: if isAuthenticated() && isOwner(userId);
}
```

## Helper Functions

### Firestore
- `isAuthenticated()` - Checks if user is logged in
- `isOwner(userId)` - Checks if user owns the resource
- `hasRequiredFields(fields)` - Validates required fields exist

### Storage
- `isAuthenticated()` - Checks if user is logged in
- `isOwner(userId)` - Checks if user owns the resource
- `isValidImage()` - Validates image content type
- `isUnderSizeLimit(sizeMB)` - Validates file size

## Security Checklist

- [x] All collections require authentication
- [x] Users can only access their own data
- [x] Required fields validated on creation
- [x] File type validation for uploads
- [x] File size limits enforced
- [x] Default deny rules for unmatched paths
- [x] User profile deletion prevented
- [x] Cross-user data access blocked

## Maintenance

When adding new collections or storage paths:
1. Add rules to appropriate file in `/config` directory
2. Add helper functions if needed
3. Test locally with Firebase emulator
4. Deploy to dev environment first
5. Validate with real data
6. Deploy to production

## Migration from Current Rules

Current root-level files have temporary rules with expiration dates. These production rules in `/config` should replace them:

1. Review and customize rules for your data model
2. Test thoroughly in development
3. Deploy to production
4. Remove expiration-based rules

## References

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Security Rules Documentation](https://firebase.google.com/docs/storage/security/start)
- [Rules Playground](https://firebase.google.com/docs/rules/simulator)
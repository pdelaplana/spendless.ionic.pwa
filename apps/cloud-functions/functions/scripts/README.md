# Scripts Directory

This directory contains utility scripts for managing the Spendless Cloud Functions project.

## configure-stripe.ps1

PowerShell script to configure Stripe settings for Firebase Functions environments.

### Prerequisites

- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase CLI authenticated (`firebase login`)
- Stripe API keys and Price IDs ready

### Usage

**Configure both dev and prod environments:**
```powershell
.\configure-stripe.ps1
# or
.\configure-stripe.ps1 -Environment both
```

**Configure only development:**
```powershell
.\configure-stripe.ps1 -Environment dev
```

**Configure only production:**
```powershell
.\configure-stripe.ps1 -Environment prod
```

### What You'll Need

For each environment, prepare the following from your Stripe Dashboard:

#### Development Environment (Test Mode)
- **Secret Key**: `sk_test_...` (from Developers > API keys)
- **Webhook Secret**: `whsec_...` (from Developers > Webhooks > Add endpoint)
- **Monthly Price ID**: `price_...` (from Products > Your monthly subscription product)
- **Annual Price ID**: `price_...` (from Products > Your annual subscription product)

#### Production Environment (Live Mode)
- **Secret Key**: `sk_live_...` (from Developers > API keys)
- **Webhook Secret**: `whsec_...` (from Developers > Webhooks > Add endpoint)
- **Monthly Price ID**: `price_...` (from Products > Your monthly subscription product)
- **Annual Price ID**: `price_...` (from Products > Your annual subscription product)

### What the Script Does

1. Prompts for Stripe credentials for the selected environment(s)
2. Switches to the correct Firebase project
3. Sets Firebase Functions config using `firebase functions:config:set`
4. Verifies the configuration
5. Provides next steps for webhook configuration and deployment

### Firebase Projects

The script uses these Firebase project IDs:
- **Development**: `spendless-dev-15971`
- **Production**: `spendless-c506b`

### After Running the Script

1. **Configure Stripe Webhook Endpoints** in the Stripe Dashboard:
   - **Dev**: `https://us-central1-spendless-dev-15971.cloudfunctions.net/handleStripeWebhook`
   - **Prod**: `https://us-central1-spendless-c506b.cloudfunctions.net/handleStripeWebhook`

2. **Select these webhook events**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

3. **Copy the webhook signing secret** and save it (you already entered it in the script)

4. **Deploy the functions**:
   ```bash
   # For development
   firebase use dev
   npm run deploy

   # For production
   firebase use prod
   npm run deploy
   ```

### Troubleshooting

**Error: Firebase CLI not found**
```powershell
npm install -g firebase-tools
```

**Error: Not authenticated**
```bash
firebase login
```

**Error: Failed to set Firebase project**
- Verify you have access to the Firebase projects
- Check that the project IDs are correct

**Configuration not taking effect**
- Remember to redeploy functions after changing config
- The functions must be redeployed for config changes to be picked up

### Security Notes

- Never commit Stripe keys to version control
- Use test mode keys for development
- Use live mode keys only for production
- Webhook secrets are different for each endpoint
- Rotate keys regularly and update config when you do

## copy-templates.js

Node.js script that copies email templates from `src/templates/` to `lib/templates/` during the build process.

This ensures email templates are available in the deployed functions environment.

### Usage

This script is automatically run as part of the build process:
```bash
npm run build:templates
```

It's included in the `build:templates` and deployment workflows.

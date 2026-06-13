<#
.SYNOPSIS
    Migration script for Firebase Functions v2 Secrets
.DESCRIPTION
    This script migrates Stripe configuration from deprecated functions.config() to Cloud Secret Manager
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('dev', 'prod', 'both')]
    [string]$Environment = 'both'
)

$separator = '=' * 64

Write-Host $separator -ForegroundColor Cyan
Write-Host '  Firebase Functions v2 Secret Migration for Stripe' -ForegroundColor Cyan
Write-Host $separator -ForegroundColor Cyan
Write-Host

function Set-Secrets {
    param(
        [string]$ProjectId,
        [string]$EnvName
    )

    Write-Host "Switching to Firebase project: $ProjectId" -ForegroundColor Yellow
    firebase use $ProjectId

    Write-Host
    Write-Host "Setting up secrets for $EnvName environment..." -ForegroundColor Green
    Write-Host

    # Get current values from functions:config
    Write-Host 'Retrieving current configuration...' -ForegroundColor Cyan
    $configJson = firebase functions:config:get stripe --project $ProjectId 2>$null
    if ($LASTEXITCODE -eq 0 -and $configJson) {
        $config = $configJson | ConvertFrom-Json
    } else {
        $config = $null
    }

    if ($config) {
        Write-Host 'Found existing configuration. Migrating to secrets...' -ForegroundColor Green

        # Set secrets using the values from functions:config
        if ($config.secret_key) {
            Write-Host 'Setting STRIPE_SECRET_KEY...' -ForegroundColor Yellow
            $config.secret_key | firebase functions:secrets:set STRIPE_SECRET_KEY --project $ProjectId
        }

        if ($config.webhook_secret) {
            Write-Host 'Setting STRIPE_WEBHOOK_SECRET...' -ForegroundColor Yellow
            $config.webhook_secret | firebase functions:secrets:set STRIPE_WEBHOOK_SECRET --project $ProjectId
        }

        # Price IDs are not sensitive, so we set them as environment variables instead
        Write-Host
        Write-Host 'Note: Price IDs should be set as environment variables in firebase.json' -ForegroundColor Cyan
        Write-Host "  STRIPE_PRICE_ID_MONTHLY: $($config.price_id_monthly)" -ForegroundColor White
        Write-Host "  STRIPE_PRICE_ID_ANNUAL: $($config.price_id_annual)" -ForegroundColor White

    } else {
        Write-Host 'No existing configuration found. Please enter values manually...' -ForegroundColor Yellow
        Write-Host

        $secretKey = Read-Host "Enter Stripe Secret Key for $EnvName"
        $webhookSecret = Read-Host "Enter Stripe Webhook Secret for $EnvName"
        $monthlyPriceId = Read-Host "Enter Monthly Price ID for $EnvName"
        $annualPriceId = Read-Host "Enter Annual Price ID for $EnvName"

        Write-Host
        Write-Host 'Setting secrets...' -ForegroundColor Green

        $secretKey | firebase functions:secrets:set STRIPE_SECRET_KEY --project $ProjectId
        $webhookSecret | firebase functions:secrets:set STRIPE_WEBHOOK_SECRET --project $ProjectId

        Write-Host
        Write-Host 'Price IDs (add these to firebase.json):' -ForegroundColor Cyan
        Write-Host "  STRIPE_PRICE_ID_MONTHLY: $monthlyPriceId" -ForegroundColor White
        Write-Host "  STRIPE_PRICE_ID_ANNUAL: $annualPriceId" -ForegroundColor White
    }

    Write-Host
    Write-Host "Secrets configured for $EnvName" -ForegroundColor Green
    Write-Host
}

# Execute based on environment parameter
if ($Environment -eq 'dev' -or $Environment -eq 'both') {
    Set-Secrets -ProjectId 'spendless-dev-15971' -EnvName 'Development'
}

if ($Environment -eq 'prod' -or $Environment -eq 'both') {
    Write-Host
    $prodProjectId = Read-Host 'Enter production Firebase project ID'
    Set-Secrets -ProjectId $prodProjectId -EnvName 'Production'
}

Write-Host
Write-Host $separator -ForegroundColor Cyan
Write-Host '  Migration Complete!' -ForegroundColor Green
Write-Host $separator -ForegroundColor Cyan
Write-Host
Write-Host 'Next steps:' -ForegroundColor Yellow
Write-Host '1. Update firebase.json to include environment variables for price IDs' -ForegroundColor White
Write-Host '2. Redeploy your functions with: npm run deploy' -ForegroundColor White
Write-Host '3. Verify the webhook endpoint URL in Stripe Dashboard' -ForegroundColor White
Write-Host '4. After successful deployment, remove old config with:' -ForegroundColor White
Write-Host '   firebase functions:config:unset stripe' -ForegroundColor Cyan
Write-Host

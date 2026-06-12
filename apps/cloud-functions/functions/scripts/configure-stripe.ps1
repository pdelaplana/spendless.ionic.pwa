<#
.SYNOPSIS
    Configure Stripe settings for Firebase Functions
.DESCRIPTION
    This script sets up Stripe API keys and configuration for dev and prod environments
.PARAMETER Environment
    The environment to configure: dev, prod, or both
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("dev", "prod", "both")]
    [string]$Environment = "both"
)

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Stripe Configuration Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

function Set-StripeConfig {
    <#
    .SYNOPSIS
        Configure Stripe for a specific environment
    .PARAMETER EnvName
        Environment name (dev or prod)
    .PARAMETER Project
        Firebase project ID
    #>
    param(
        [Parameter(Mandatory=$true)]
        [string]$EnvName,

        [Parameter(Mandatory=$true)]
        [string]$Project
    )

    Write-Host "Configuring Stripe for $EnvName environment (Project: $Project)..." -ForegroundColor Yellow
    Write-Host ""

    # Prompt for Stripe credentials
    $keyPrefix = "sk_$EnvName`_"
    Write-Host "Enter Stripe Secret Key for $EnvName (starts with $keyPrefix...):" -ForegroundColor Green
    $secretKey = Read-Host

    Write-Host "Enter Stripe Webhook Secret for $EnvName (starts with whsec_...):" -ForegroundColor Green
    $webhookSecret = Read-Host

    Write-Host "Enter Stripe Monthly Price ID for $EnvName (starts with price_...):" -ForegroundColor Green
    $monthlyPriceId = Read-Host

    Write-Host "Enter Stripe Annual Price ID for $EnvName (starts with price_...):" -ForegroundColor Green
    $annualPriceId = Read-Host

    Write-Host ""
    Write-Host "Setting Firebase Functions config for project: $Project..." -ForegroundColor Cyan

    # Set the Firebase project
    $setProjectResult = firebase use $Project 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to set Firebase project to $Project" -ForegroundColor Red
        Write-Host $setProjectResult -ForegroundColor Red
        return $false
    }

    Write-Host "Success: Switched to project $Project" -ForegroundColor Green

    # Set Stripe configuration
    $configCommand = "firebase functions:config:set stripe.secret_key=`"$secretKey`" stripe.webhook_secret=`"$webhookSecret`" stripe.price_id_monthly=`"$monthlyPriceId`" stripe.price_id_annual=`"$annualPriceId`""

    Write-Host "Executing configuration command..." -ForegroundColor Cyan
    $configResult = Invoke-Expression $configCommand 2>&1

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to set configuration" -ForegroundColor Red
        Write-Host $configResult -ForegroundColor Red
        return $false
    }

    Write-Host "Success: Configuration set!" -ForegroundColor Green
    Write-Host ""

    # Display current configuration
    Write-Host "Verifying configuration..." -ForegroundColor Cyan
    $getConfigResult = firebase functions:config:get 2>&1
    Write-Host $getConfigResult -ForegroundColor Gray
    Write-Host ""

    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "Success: $EnvName environment configured!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: You must redeploy functions for changes to take effect:" -ForegroundColor Yellow
    Write-Host "  npm run deploy" -ForegroundColor Cyan
    Write-Host ""

    return $true
}

# Check if Firebase CLI is installed
try {
    $firebaseVersion = firebase --version 2>&1
    Write-Host "Firebase CLI version: $firebaseVersion" -ForegroundColor Gray
    Write-Host ""
}
catch {
    Write-Host "Error: Firebase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "  npm install -g firebase-tools" -ForegroundColor Cyan
    exit 1
}

# Configure based on selected environment
switch ($Environment) {
    "dev" {
        Write-Host "Configuring DEVELOPMENT environment only" -ForegroundColor Yellow
        Write-Host ""
        $success = Set-StripeConfig -EnvName "dev" -Project "spendless-dev-15971"
        if (-not $success) {
            exit 1
        }
    }
    "prod" {
        Write-Host "Configuring PRODUCTION environment only" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "WARNING: You are configuring PRODUCTION!" -ForegroundColor Red
        Write-Host "Make sure you have the correct Stripe LIVE keys ready." -ForegroundColor Red
        Write-Host ""
        $confirm = Read-Host "Type 'YES' to continue"
        if ($confirm -ne "YES") {
            Write-Host "Configuration cancelled." -ForegroundColor Yellow
            exit 0
        }
        Write-Host ""
        $success = Set-StripeConfig -EnvName "prod" -Project "spendless-c506b"
        if (-not $success) {
            exit 1
        }
    }
    "both" {
        Write-Host "Configuring BOTH environments" -ForegroundColor Yellow
        Write-Host ""

        # Configure dev first
        Write-Host "Step 1/2: Development Environment" -ForegroundColor Magenta
        Write-Host ""
        $devSuccess = Set-StripeConfig -EnvName "dev" -Project "spendless-dev-15971"
        if (-not $devSuccess) {
            Write-Host "Development configuration failed. Aborting." -ForegroundColor Red
            exit 1
        }

        Write-Host "Press any key to continue to production configuration..." -ForegroundColor Yellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        Write-Host ""

        # Configure prod
        Write-Host "Step 2/2: Production Environment" -ForegroundColor Magenta
        Write-Host ""
        Write-Host "WARNING: You are about to configure PRODUCTION!" -ForegroundColor Red
        Write-Host "Make sure you have the correct Stripe LIVE keys ready." -ForegroundColor Red
        Write-Host ""
        $confirm = Read-Host "Type 'YES' to continue"
        if ($confirm -ne "YES") {
            Write-Host "Production configuration cancelled." -ForegroundColor Yellow
            Write-Host "Development environment was configured successfully." -ForegroundColor Green
            exit 0
        }
        Write-Host ""
        $prodSuccess = Set-StripeConfig -EnvName "prod" -Project "spendless-c506b"
        if (-not $prodSuccess) {
            Write-Host "Production configuration failed." -ForegroundColor Red
            Write-Host "Development environment was configured successfully." -ForegroundColor Green
            exit 1
        }
    }
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "Success: All configurations complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Configure Stripe webhook endpoints in Stripe Dashboard:" -ForegroundColor White
Write-Host "   Dev: https://us-central1-spendless-dev-15971.cloudfunctions.net/handleStripeWebhook" -ForegroundColor Cyan
Write-Host "   Prod: https://us-central1-spendless-c506b.cloudfunctions.net/handleStripeWebhook" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Select webhook events in Stripe Dashboard:" -ForegroundColor White
Write-Host "   - customer.subscription.created" -ForegroundColor Cyan
Write-Host "   - customer.subscription.updated" -ForegroundColor Cyan
Write-Host "   - customer.subscription.deleted" -ForegroundColor Cyan
Write-Host "   - invoice.payment_succeeded" -ForegroundColor Cyan
Write-Host "   - invoice.payment_failed" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Deploy functions:" -ForegroundColor White
Write-Host "   firebase use dev && npm run deploy" -ForegroundColor Cyan
Write-Host "   firebase use prod && npm run deploy" -ForegroundColor Cyan
Write-Host ""

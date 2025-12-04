# Deploy Firestore Indexes, Rules, and Storage Rules to Production
# This script deploys all Firebase configuration to the production environment

param(
    [Parameter(Mandatory=$false)]
    [string]$ProductionProjectId = "",

    [Parameter(Mandatory=$false)]
    [switch]$DryRun = $false
)

# Color output functions
function Write-Success {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Cyan
}

function Write-Warning {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Red
}

# Check if Firebase CLI is installed
if (-not (Get-Command firebase -ErrorAction SilentlyContinue)) {
    Write-Error "Firebase CLI is not installed. Installing..."
    npm install -g firebase-tools
}

# Check if user is logged in
Write-Info "Checking Firebase authentication..."
$loginCheck = firebase login:list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Info "Logging in to Firebase..."
    firebase login
}

# Get production project ID if not provided
if ([string]::IsNullOrWhiteSpace($ProductionProjectId)) {
    Write-Info "Available Firebase projects:"
    firebase projects:list

    $ProductionProjectId = Read-Host "`nEnter production project ID (e.g., spendless-prod)"

    if ([string]::IsNullOrWhiteSpace($ProductionProjectId)) {
        Write-Error "Production project ID is required. Exiting."
        exit 1
    }
}

# Confirm deployment
Write-Warning "`n===================================="
Write-Warning "DEPLOYMENT CONFIRMATION"
Write-Warning "===================================="
Write-Info "Source files:"
Write-Host "  - config/firestore.indexes.json"
Write-Host "  - config/firestore.rules"
Write-Host "  - config/storage.rules"
Write-Host ""
Write-Info "Target project: $ProductionProjectId"
Write-Host ""

if ($DryRun) {
    Write-Info "DRY RUN MODE - No changes will be made"
} else {
    $confirmation = Read-Host "Deploy to production? (yes/no)"
    if ($confirmation -ne "yes") {
        Write-Info "Deployment cancelled."
        exit 0
    }
}

# Set Firebase project to production
Write-Info "`nSetting Firebase project to: $ProductionProjectId"
firebase use $ProductionProjectId

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to set Firebase project. Exiting."
    exit 1
}

# Display current configuration
Write-Info "`nCurrent configuration to deploy:"
Write-Host ""
Write-Info "Firestore Indexes:"
Get-Content config\firestore.indexes.json | Write-Host
Write-Host ""
Write-Info "Firestore Rules:"
Get-Content config\firestore.rules | Write-Host
Write-Host ""
Write-Info "Storage Rules:"
Get-Content config\storage.rules | Write-Host
Write-Host ""

if ($DryRun) {
    Write-Success "`nDRY RUN COMPLETE - No changes were made"
    exit 0
}

# Deploy Firestore indexes
Write-Info "`nDeploying Firestore indexes..."
firebase deploy --only firestore:indexes

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to deploy Firestore indexes. Continuing..."
} else {
    Write-Success "Firestore indexes deployed successfully"
}

# Deploy Firestore rules
Write-Info "`nDeploying Firestore rules..."
firebase deploy --only firestore:rules

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to deploy Firestore rules. Continuing..."
} else {
    Write-Success "Firestore rules deployed successfully"
}

# Deploy Storage rules
Write-Info "`nDeploying Storage rules..."
firebase deploy --only storage

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to deploy Storage rules. Continuing..."
} else {
    Write-Success "Storage rules deployed successfully"
}

Write-Success "`n===================================="
Write-Success "DEPLOYMENT COMPLETE"
Write-Success "===================================="
Write-Info "Project: $ProductionProjectId"
Write-Info "Deployed: Firestore indexes, Firestore rules, Storage rules"
Write-Host ""

# Switch back to dev project
Write-Info "Switching back to dev project..."
firebase use spendless-dev-15971

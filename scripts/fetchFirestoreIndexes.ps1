# Fetch Firestore Indexes from Firebase
# Downloads indexes from Firebase and saves to config directory

param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectId = "spendless-dev-15971",

    [Parameter(Mandatory=$false)]
    [string]$OutputPath = "config"
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

# Check if Firebase CLI is installed
if (-not (Get-Command firebase -ErrorAction SilentlyContinue)) {
    Write-Info "Installing Firebase CLI..."
    npm install -g firebase-tools
}

# Check if user is logged in
Write-Info "Checking Firebase authentication..."
$loginCheck = firebase login:list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Info "Logging in to Firebase..."
    firebase login
}

# Set the Firebase project
Write-Info "Setting Firebase project to: $ProjectId"
firebase use $ProjectId

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to set Firebase project. Exiting."
    exit 1
}

# Create output directory if it doesn't exist
if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

# Export Firestore indexes
Write-Info "Fetching Firestore indexes from $ProjectId..."
$indexesOutput = firebase firestore:indexes

# Save to config directory
$outputFile = Join-Path $OutputPath "firestore.indexes.json"
$indexesOutput | Out-File -FilePath $outputFile -Encoding utf8

Write-Success "`n✓ Indexes exported successfully!"
Write-Info "Saved to: $outputFile"

# Switch back to dev project
if ($ProjectId -ne "spendless-dev-15971") {
    Write-Info "`nSwitching back to dev project..."
    firebase use spendless-dev-15971
}

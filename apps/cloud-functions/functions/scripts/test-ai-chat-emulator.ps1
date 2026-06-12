# Test AI Chat with Firebase Emulator
# This script starts the emulator and runs all AI Chat tests

param(
    [Parameter(Mandatory=$false)]
    [string]$UserId = "test-user-123",

    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild = $false,

    [Parameter(Mandatory=$false)]
    [switch]$KeepEmulatorRunning = $false
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AI Chat Emulator Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$functionsDir = Split-Path -Parent $scriptDir

# Check if Firebase CLI is installed
try {
    $firebaseVersion = firebase --version
    Write-Host "✓ Firebase CLI installed: $firebaseVersion" -ForegroundColor Green
}
catch {
    Write-Host "✗ Firebase CLI not installed" -ForegroundColor Red
    Write-Host "Please install Firebase CLI: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Build the functions
if (-not $SkipBuild) {
    Write-Host "Building functions..." -ForegroundColor Cyan
    Push-Location $functionsDir
    try {
        npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-Host "✗ Build failed" -ForegroundColor Red
            exit 1
        }
        Write-Host "✓ Build successful" -ForegroundColor Green
    }
    finally {
        Pop-Location
    }
    Write-Host ""
} else {
    Write-Host "Skipping build (--SkipBuild flag set)" -ForegroundColor Yellow
    Write-Host ""
}

# Start emulator in background
Write-Host "Starting Firebase Emulator..." -ForegroundColor Cyan
Write-Host "This may take a few seconds..." -ForegroundColor Gray
Write-Host ""

$emulatorJob = Start-Job -ScriptBlock {
    param($functionsDir)
    Set-Location $functionsDir
    firebase emulators:start --only functions,firestore,auth
} -ArgumentList (Split-Path -Parent $scriptDir)

# Wait for emulator to start
Write-Host "Waiting for emulator to start..." -ForegroundColor Cyan
$maxWait = 30
$waited = 0
$emulatorReady = $false

while ($waited -lt $maxWait -and -not $emulatorReady) {
    Start-Sleep -Seconds 1
    $waited++

    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:5001" -TimeoutSec 1 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $emulatorReady = $true
        }
    }
    catch {
        # Emulator not ready yet
    }

    Write-Host "." -NoNewline -ForegroundColor Gray
}

Write-Host ""

if ($emulatorReady) {
    Write-Host "✓ Emulator started successfully" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "✗ Emulator failed to start within $maxWait seconds" -ForegroundColor Red
    Stop-Job $emulatorJob
    Remove-Job $emulatorJob
    exit 1
}

# Run tests
try {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Running AI Chat Tests" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    # Test 1: AI Chat function
    Write-Host "Test Suite 1: AI Chat Function" -ForegroundColor Yellow
    Write-Host ""
    & "$scriptDir\test-ai-chat.ps1" -Environment emulator -UserId $UserId
    Write-Host ""

    # Test 2: AI Chat Notifications
    Write-Host "Test Suite 2: AI Chat Notifications" -ForegroundColor Yellow
    Write-Host ""
    & "$scriptDir\test-ai-chat-notifications.ps1" -Environment emulator -UserId $UserId
    Write-Host ""

    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "All Tests Completed" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
}
finally {
    # Stop emulator
    if (-not $KeepEmulatorRunning) {
        Write-Host "Stopping Firebase Emulator..." -ForegroundColor Cyan
        Stop-Job $emulatorJob
        Remove-Job $emulatorJob
        Write-Host "✓ Emulator stopped" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "Emulator still running (--KeepEmulatorRunning flag set)" -ForegroundColor Yellow
        Write-Host "To stop: Stop-Job and Remove-Job on job ID: $($emulatorJob.Id)" -ForegroundColor Yellow
        Write-Host ""
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test suite completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Important Notes:" -ForegroundColor Yellow
Write-Host "  • These tests call the functions but may fail authentication" -ForegroundColor Yellow
Write-Host "  • You need to set up test data in Firestore emulator" -ForegroundColor Yellow
Write-Host "  • Run create-test-data.ps1 first to prepare test data" -ForegroundColor Yellow
Write-Host "  • For authenticated tests, use Firebase Auth emulator" -ForegroundColor Yellow
Write-Host ""

# Run All AI Chat Tests
# Comprehensive test suite for AI Chat feature

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("emulator", "dev", "prod")]
    [string]$Environment = "emulator",

    [Parameter(Mandatory=$false)]
    [string]$UserId = "test-user-123",

    [Parameter(Mandatory=$false)]
    [switch]$Interactive = $false
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║            AI Chat Feature - Comprehensive Test Suite          ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Environment: $Environment" -ForegroundColor White
Write-Host "  User ID: $UserId" -ForegroundColor White
Write-Host "  Interactive Mode: $Interactive" -ForegroundColor White
Write-Host ""

# Test results tracking
$testResults = @{
    Passed = 0
    Failed = 0
    Skipped = 0
}

function Write-TestHeader {
    param([string]$Title)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host " $Title" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

function Confirm-Continue {
    param([string]$Message)
    if ($Interactive) {
        Write-Host ""
        $continue = Read-Host "$Message (Y/n)"
        return ($continue -eq "" -or $continue -eq "Y" -or $continue -eq "y")
    }
    return $true
}

# Pre-flight checks
Write-TestHeader "Pre-Flight Checks"

Write-Host "Checking prerequisites..." -ForegroundColor Cyan
Write-Host ""

# Check Firebase CLI
try {
    $firebaseVersion = firebase --version
    Write-Host "✓ Firebase CLI: $firebaseVersion" -ForegroundColor Green
    $testResults.Passed++
}
catch {
    Write-Host "✗ Firebase CLI not found" -ForegroundColor Red
    Write-Host "  Install: npm install -g firebase-tools" -ForegroundColor Yellow
    $testResults.Failed++
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
    $testResults.Passed++
}
catch {
    Write-Host "✗ Node.js not found" -ForegroundColor Red
    $testResults.Failed++
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✓ npm: $npmVersion" -ForegroundColor Green
    $testResults.Passed++
}
catch {
    Write-Host "✗ npm not found" -ForegroundColor Red
    $testResults.Failed++
    exit 1
}

Write-Host ""

if (-not (Confirm-Continue "Continue with test suite?")) {
    Write-Host "Test suite cancelled by user." -ForegroundColor Yellow
    exit 0
}

# Test 1: Build Check
Write-TestHeader "Test 1: Build Verification"

Write-Host "Building TypeScript functions..." -ForegroundColor Cyan
$functionsDir = Split-Path -Parent $scriptDir
Push-Location $functionsDir

try {
    npm run build 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Build successful" -ForegroundColor Green
        $testResults.Passed++
    } else {
        Write-Host "✗ Build failed" -ForegroundColor Red
        $testResults.Failed++
    }
}
catch {
    Write-Host "✗ Build error: $($_.Exception.Message)" -ForegroundColor Red
    $testResults.Failed++
}
finally {
    Pop-Location
}

if (-not (Confirm-Continue "Continue to linting?")) {
    Write-Host "Test suite cancelled by user." -ForegroundColor Yellow
    exit 0
}

# Test 2: Linting
Write-TestHeader "Test 2: Code Quality (Linting)"

Write-Host "Running linter..." -ForegroundColor Cyan
Push-Location $functionsDir

try {
    npm run lint 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Linting passed" -ForegroundColor Green
        $testResults.Passed++
    } else {
        Write-Host "✗ Linting failed" -ForegroundColor Red
        Write-Host "  Run 'npm run lint:fix' to auto-fix issues" -ForegroundColor Yellow
        $testResults.Failed++
    }
}
catch {
    Write-Host "✗ Linting error: $($_.Exception.Message)" -ForegroundColor Red
    $testResults.Failed++
}
finally {
    Pop-Location
}

if (-not (Confirm-Continue "Continue to unit tests?")) {
    Write-Host "Test suite cancelled by user." -ForegroundColor Yellow
    exit 0
}

# Test 3: Unit Tests
Write-TestHeader "Test 3: Unit Tests"

Write-Host "Running Jest unit tests for AI Chat..." -ForegroundColor Cyan
Push-Location $functionsDir

try {
    $testOutput = npm test -- --testPathPattern="(aiChat|getAiChatNotifications|aiCoachScheduledChecks)" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ All unit tests passed" -ForegroundColor Green
        $testResults.Passed++
    } else {
        Write-Host "✗ Some unit tests failed" -ForegroundColor Red
        Write-Host $testOutput -ForegroundColor Gray
        $testResults.Failed++
    }
}
catch {
    Write-Host "✗ Unit test error: $($_.Exception.Message)" -ForegroundColor Red
    $testResults.Failed++
}
finally {
    Pop-Location
}

if ($Environment -eq "emulator") {
    if (-not (Confirm-Continue "Continue to integration tests?")) {
        Write-Host "Test suite cancelled by user." -ForegroundColor Yellow
        exit 0
    }

    # Test 4: Integration Tests (Emulator)
    Write-TestHeader "Test 4: Integration Tests (Emulator)"

    Write-Host "Note: Integration tests require test data to be set up in Firestore emulator" -ForegroundColor Yellow
    Write-Host "Run create-test-data.ps1 first if you haven't already" -ForegroundColor Yellow
    Write-Host ""

    if (Confirm-Continue "Run integration tests?") {
        # AI Chat function tests
        Write-Host "Testing aiChat function..." -ForegroundColor Cyan
        try {
            & "$scriptDir\test-ai-chat.ps1" -Environment $Environment -UserId $UserId
            Write-Host "✓ aiChat tests completed" -ForegroundColor Green
            $testResults.Passed++
        }
        catch {
            Write-Host "✗ aiChat tests failed: $($_.Exception.Message)" -ForegroundColor Red
            $testResults.Failed++
        }

        # AI Chat Notifications tests
        Write-Host "Testing getAiChatNotifications function..." -ForegroundColor Cyan
        try {
            & "$scriptDir\test-ai-chat-notifications.ps1" -Environment $Environment -UserId $UserId
            Write-Host "✓ getAiChatNotifications tests completed" -ForegroundColor Green
            $testResults.Passed++
        }
        catch {
            Write-Host "✗ getAiChatNotifications tests failed: $($_.Exception.Message)" -ForegroundColor Red
            $testResults.Failed++
        }
    } else {
        Write-Host "⊘ Integration tests skipped" -ForegroundColor Yellow
        $testResults.Skipped += 2
    }
}

# Final Summary
Write-TestHeader "Test Suite Summary"

$total = $testResults.Passed + $testResults.Failed + $testResults.Skipped
$passRate = if ($total -gt 0) { [math]::Round(($testResults.Passed / $total) * 100, 1) } else { 0 }

Write-Host "Results:" -ForegroundColor Cyan
Write-Host "  ✓ Passed:  $($testResults.Passed)" -ForegroundColor Green
Write-Host "  ✗ Failed:  $($testResults.Failed)" -ForegroundColor Red
Write-Host "  ⊘ Skipped: $($testResults.Skipped)" -ForegroundColor Yellow
Write-Host "  ═ Total:   $total" -ForegroundColor White
Write-Host ""
Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 80) { "Green" } elseif ($passRate -ge 50) { "Yellow" } else { "Red" })
Write-Host ""

if ($testResults.Failed -eq 0) {
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                                                                ║" -ForegroundColor Green
    Write-Host "║                  ✓ ALL TESTS PASSED! ✓                        ║" -ForegroundColor Green
    Write-Host "║                                                                ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "The AI Chat feature is ready for deployment!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║                                                                ║" -ForegroundColor Red
    Write-Host "║                  ✗ SOME TESTS FAILED ✗                        ║" -ForegroundColor Red
    Write-Host "║                                                                ║" -ForegroundColor Red
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please review and fix the failed tests before deployment." -ForegroundColor Yellow
    exit 1
}

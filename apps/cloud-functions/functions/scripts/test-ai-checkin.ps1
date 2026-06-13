# Test AI Checkin Function
# This script signs in with an existing user and triggers the AI Checkin function

param(
    [string]$ProjectId = "",
    [string]$Email = "",
    [string]$AnalysisType = "",
    [string]$PeriodId = "",
    [string]$Date = ""
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test AI Checkin Function" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get project ID if not provided
if (-not $ProjectId) {
    # Try to get from .firebaserc
    if (Test-Path "../.firebaserc") {
        $firebaserc = Get-Content "../.firebaserc" | ConvertFrom-Json
        if ($firebaserc.projects.default) {
            $ProjectId = $firebaserc.projects.default
        }
    }

    if (-not $ProjectId) {
        $ProjectId = Read-Host "Enter your Firebase Project ID"
    }
}

Write-Host "Project ID: $ProjectId" -ForegroundColor Green
Write-Host ""

# Get Web API Key
Write-Host "Getting Web API Key..." -ForegroundColor Yellow

# Try to read from environment or prompt
$webApiKey = $env:FIREBASE_WEB_API_KEY

if (-not $webApiKey) {
    Write-Host ""
    Write-Host "Get your Web API Key from Firebase Console:" -ForegroundColor Cyan
    Write-Host "  https://console.firebase.google.com/project/$ProjectId/settings/general" -ForegroundColor Gray
    Write-Host "  -> Scroll to 'Your apps' -> Copy 'Web API Key'" -ForegroundColor Gray
    Write-Host ""
    $webApiKey = Read-Host "Enter your Web API Key (starts with AIza...)"
}

if (-not $webApiKey) {
    Write-Host "Error: Web API Key is required" -ForegroundColor Red
    exit 1
}

Write-Host "Web API Key configured" -ForegroundColor Green
Write-Host ""

# Get user credentials
if (-not $Email) {
    $Email = Read-Host "Enter user email"
}

Write-Host "Email: $Email" -ForegroundColor White

$securePassword = Read-Host "Enter password" -AsSecureString
$password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))

Write-Host ""

# Get analysis type
if (-not $AnalysisType) {
    Write-Host "Analysis Type Options:" -ForegroundColor Cyan
    Write-Host "  1. weekly (default)" -ForegroundColor Gray
    Write-Host "  2. period-end" -ForegroundColor Gray
    Write-Host ""
    $analysisInput = Read-Host "Enter analysis type (press Enter for 'weekly')"
    if ($analysisInput) {
        $AnalysisType = $analysisInput
    } else {
        $AnalysisType = "weekly"
    }
}

# Validate analysis type
if ($AnalysisType -ne "weekly" -and $AnalysisType -ne "period-end") {
    Write-Host "Warning: Invalid analysis type '$AnalysisType'. Using 'weekly'." -ForegroundColor Yellow
    $AnalysisType = "weekly"
}

Write-Host "Analysis Type: $AnalysisType" -ForegroundColor White

# Get date or period ID based on analysis type
if ($AnalysisType -eq "weekly") {
    # For weekly analysis, prompt for date (optional)
    if (-not $Date) {
        Write-Host ""
        Write-Host "Analysis Date (optional):" -ForegroundColor Cyan
        Write-Host "  Leave blank to analyze the previous week from today" -ForegroundColor Gray
        Write-Host "  Or enter an ISO date (YYYY-MM-DD) to analyze the week ending on that date" -ForegroundColor Gray
        Write-Host ""
        $dateInput = Read-Host "Enter date (press Enter for today)"
        if ($dateInput) {
            $Date = $dateInput
        }
    }

    if ($Date) {
        Write-Host "Analysis Date: $Date" -ForegroundColor White
        Write-Host "  (Will analyze 7 days before this date)" -ForegroundColor Gray
    } else {
        Write-Host "Analysis Date: Today" -ForegroundColor White
        Write-Host "  (Will analyze the previous 7 days)" -ForegroundColor Gray
    }
} elseif ($AnalysisType -eq "period-end") {
    # For period-end analysis, prompt for period ID (required)
    if (-not $PeriodId) {
        Write-Host ""
        Write-Host "Period ID (required for period-end analysis):" -ForegroundColor Cyan
        Write-Host "  Enter the specific period ID to analyze" -ForegroundColor Gray
        Write-Host ""
        $periodInput = Read-Host "Enter period ID"
        if ($periodInput) {
            $PeriodId = $periodInput
        } else {
            Write-Host "Error: Period ID is required for period-end analysis" -ForegroundColor Red
            exit 1
        }
    }

    Write-Host "Period ID: $PeriodId" -ForegroundColor White
}

Write-Host ""

# Sign in to get ID token
Write-Host "Signing in..." -ForegroundColor Yellow

$signInUrl = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$webApiKey"
$signInBody = @{
    email = $Email
    password = $password
    returnSecureToken = $true
} | ConvertTo-Json

try {
    $signInResponse = Invoke-RestMethod -Uri $signInUrl -Method Post -Body $signInBody -ContentType "application/json"
    $userId = $signInResponse.localId
    $idToken = $signInResponse.idToken
    $expiresIn = $signInResponse.expiresIn

    Write-Host "Signed in successfully" -ForegroundColor Green
    Write-Host "  User ID: $userId" -ForegroundColor Gray
    Write-Host "  Token expires in: $expiresIn seconds" -ForegroundColor Gray
    Write-Host ""
} catch {
    $errorMessage = $_.Exception.Message
    Write-Host "Sign in failed" -ForegroundColor Red

    if ($errorMessage -match "INVALID_PASSWORD") {
        Write-Host "  Error: Invalid password" -ForegroundColor Yellow
    } elseif ($errorMessage -match "EMAIL_NOT_FOUND") {
        Write-Host "  Error: User not found" -ForegroundColor Yellow
    } elseif ($errorMessage -match "USER_DISABLED") {
        Write-Host "  Error: User account is disabled" -ForegroundColor Yellow
    } else {
        Write-Host "  Error: $errorMessage" -ForegroundColor Yellow
    }

    exit 1
}

# Call triggerAiCheckin function
Write-Host "Calling triggerAiCheckin function..." -ForegroundColor Yellow
Write-Host "  Analysis Type: $AnalysisType" -ForegroundColor Gray
if ($PeriodId) {
    Write-Host "  Period ID: $PeriodId" -ForegroundColor Gray
}
Write-Host ""

$functionUrl = "https://us-central1-$ProjectId.cloudfunctions.net/triggerAiCheckin"
$requestData = @{
    analysisType = $AnalysisType
}

# Add periodId if provided
if ($PeriodId) {
    $requestData.periodId = $PeriodId
}

# Add date if provided
if ($Date) {
    $requestData.date = $Date
}

$requestBody = @{
    data = $requestData
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri $functionUrl -Method Post -Body $requestBody -ContentType "application/json" -Headers @{
        "Authorization" = "Bearer $idToken"
    }

    Write-Host "Function executed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Response" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    if ($response.result) {
        $result = $response.result

        if ($result.success) {
            Write-Host "Status:  " -NoNewline -ForegroundColor Yellow
            Write-Host "Success" -ForegroundColor Green
            Write-Host "Message: " -NoNewline -ForegroundColor Yellow
            Write-Host $result.message -ForegroundColor White

            if ($result.jobId) {
                Write-Host "Job ID:  " -NoNewline -ForegroundColor Yellow
                Write-Host $result.jobId -ForegroundColor Cyan
            }
        } else {
            Write-Host "Status:  " -NoNewline -ForegroundColor Yellow
            Write-Host "Failed" -ForegroundColor Red
            Write-Host "Message: " -NoNewline -ForegroundColor Yellow
            Write-Host $result.message -ForegroundColor White
        }
    } else {
        Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
    }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    if ($response.result.jobId) {
        Write-Host "Next Steps:" -ForegroundColor Yellow
        Write-Host "  1. Monitor job: jobs/$($response.result.jobId)" -ForegroundColor Gray
        Write-Host "  2. Check insights: accounts/$userId/aiInsights" -ForegroundColor Gray
        Write-Host "  3. View logs: firebase functions:log --only generateAiCheckin" -ForegroundColor Gray
        Write-Host "  4. Check email inbox for AI insights" -ForegroundColor Gray
        Write-Host ""
    }

} catch {
    Write-Host "Function call failed" -ForegroundColor Red
    Write-Host ""

    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorMessage = $_.Exception.Message

    Write-Host "Error Details:" -ForegroundColor Yellow

    if ($statusCode) {
        Write-Host "  Status Code: $statusCode" -ForegroundColor Gray
    }

    # Try to parse error response
    try {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd() | ConvertFrom-Json

        if ($errorBody.error.message) {
            Write-Host "  Message: $($errorBody.error.message)" -ForegroundColor Gray
        }

        if ($errorBody.error.status) {
            Write-Host "  Status: $($errorBody.error.status)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  Message: $errorMessage" -ForegroundColor Gray
    }

    Write-Host ""
    Write-Host "Common Issues:" -ForegroundColor Yellow
    Write-Host "  - User must have premium subscription" -ForegroundColor Gray
    Write-Host "  - AI Checkin must be enabled for the account" -ForegroundColor Gray
    Write-Host "  - User must have spending data in a period" -ForegroundColor Gray
    Write-Host "  - Function must be deployed" -ForegroundColor Gray
    Write-Host ""

    exit 1
}

Write-Host "Done!" -ForegroundColor Green
Write-Host ""

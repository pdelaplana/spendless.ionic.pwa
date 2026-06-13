# Interactive AI Chat Tester
# This script signs in with an existing user and provides an interactive chat session

param(
    [string]$ProjectId = "",
    [string]$Email = "",
    [string]$PeriodId = ""
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Interactive AI Chat Tester" -ForegroundColor Cyan
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

# Get period ID (optional)
if (-not $PeriodId) {
    Write-Host "Period ID (optional):" -ForegroundColor Cyan
    Write-Host "  Leave blank to use the current active period" -ForegroundColor Gray
    Write-Host "  Or enter a specific period ID to chat about that period" -ForegroundColor Gray
    Write-Host ""
    $periodInput = Read-Host "Enter period ID (press Enter to skip)"
    if ($periodInput) {
        $PeriodId = $periodInput
    }
}

if ($PeriodId) {
    Write-Host "Period ID: $PeriodId" -ForegroundColor White
} else {
    Write-Host "Period ID: Using active period" -ForegroundColor White
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

# Session state
$sessionHistory = @()
$totalTokensUsed = 0
$messageCount = 0

# Function URL
$functionUrl = "https://us-central1-$ProjectId.cloudfunctions.net/aiChat"

# Clear screen and show header
Clear-Host
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI Chat Session" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Signed in as: $Email" -ForegroundColor Green
Write-Host "User ID: $userId" -ForegroundColor Gray
if ($PeriodId) {
    Write-Host "Period: $PeriodId" -ForegroundColor Gray
}
Write-Host ""
Write-Host "Commands:" -ForegroundColor Gray
Write-Host "  /exit or /quit - Exit the chat" -ForegroundColor Gray
Write-Host "  /clear - Clear conversation history" -ForegroundColor Gray
Write-Host "  /history - Show conversation history" -ForegroundColor Gray
Write-Host "  /stats - Show session statistics" -ForegroundColor Gray
Write-Host ""
Write-Host "Start chatting! Type your message and press Enter." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to call AI Chat
function Invoke-AiChat {
    param(
        [string]$Message,
        [array]$History
    )

    $requestData = @{
        message = $Message
        sessionHistory = $History
    }

    if ($PeriodId) {
        $requestData.periodId = $PeriodId
    }

    $requestBody = @{
        data = $requestData
    } | ConvertTo-Json -Depth 10

    try {
        $response = Invoke-RestMethod -Uri $functionUrl -Method Post -Body $requestBody -ContentType "application/json" -Headers @{
            "Authorization" = "Bearer $idToken"
        }
        return $response
    }
    catch {
        Write-Host ""
        Write-Host "Error calling AI Chat:" -ForegroundColor Red

        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorMessage = $_.Exception.Message

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
        return $null
    }
}

# Main chat loop
while ($true) {
    # Prompt for user input
    Write-Host "You: " -ForegroundColor Green -NoNewline
    $userMessage = Read-Host

    # Check for commands
    if ($userMessage -eq "/exit" -or $userMessage -eq "/quit") {
        Write-Host ""
        Write-Host "Goodbye! Session ended." -ForegroundColor Cyan
        Write-Host "Total messages: $messageCount" -ForegroundColor Gray
        Write-Host "Total tokens used: $totalTokensUsed" -ForegroundColor Gray
        Write-Host ""
        break
    }

    if ($userMessage -eq "/clear") {
        $sessionHistory = @()
        $totalTokensUsed = 0
        $messageCount = 0
        Clear-Host
        Write-Host "Conversation history cleared." -ForegroundColor Yellow
        Write-Host ""
        continue
    }

    if ($userMessage -eq "/history") {
        Write-Host ""
        Write-Host "=== Conversation History ===" -ForegroundColor Cyan
        if ($sessionHistory.Count -eq 0) {
            Write-Host "No messages yet." -ForegroundColor Gray
        } else {
            for ($i = 0; $i -lt $sessionHistory.Count; $i++) {
                $msg = $sessionHistory[$i]
                $role = $msg.role
                $content = $msg.content
                if ($role -eq "user") {
                    Write-Host "[$i] You: $content" -ForegroundColor Green
                } else {
                    Write-Host "[$i] AI: $content" -ForegroundColor Cyan
                }
            }
        }
        Write-Host "===========================" -ForegroundColor Cyan
        Write-Host ""
        continue
    }

    if ($userMessage -eq "/stats") {
        Write-Host ""
        Write-Host "=== Session Statistics ===" -ForegroundColor Cyan
        Write-Host "Messages sent: $messageCount" -ForegroundColor White
        Write-Host "Total tokens used: $totalTokensUsed" -ForegroundColor White
        Write-Host "History size: $($sessionHistory.Count) messages" -ForegroundColor White
        if ($messageCount -gt 0) {
            $avgTokens = [math]::Round($totalTokensUsed / $messageCount, 2)
            Write-Host "Average tokens per message: $avgTokens" -ForegroundColor White
        }
        Write-Host "==========================" -ForegroundColor Cyan
        Write-Host ""
        continue
    }

    # Skip empty messages
    if ([string]::IsNullOrWhiteSpace($userMessage)) {
        continue
    }

    # Call AI Chat
    Write-Host ""
    Write-Host "AI: " -ForegroundColor Cyan -NoNewline
    Write-Host "Thinking..." -ForegroundColor Gray

    $result = Invoke-AiChat -Message $userMessage -History $sessionHistory

    if ($result -and $result.result) {
        $aiResponse = $result.result.response
        $tokensUsed = $result.result.tokensUsed

        # Clear the "Thinking..." line and show response
        Write-Host "`r" -NoNewline
        Write-Host "AI: " -ForegroundColor Cyan -NoNewline
        Write-Host $aiResponse -ForegroundColor White

        # Update session history
        $sessionHistory += @{
            role = "user"
            content = $userMessage
        }
        $sessionHistory += @{
            role = "assistant"
            content = $aiResponse
        }

        # Update stats
        $totalTokensUsed += $tokensUsed
        $messageCount++

        # Show token usage
        Write-Host ""
        Write-Host "Tokens used: $tokensUsed | Total: $totalTokensUsed" -ForegroundColor Gray
    }

    Write-Host ""
}

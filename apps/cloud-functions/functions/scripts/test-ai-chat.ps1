# Test AI Chat Feature
# This script tests the aiChat function with various scenarios

param(
    [Parameter(Mandatory=$false)]
    [string]$Environment = "emulator",  # emulator, dev, or prod

    [Parameter(Mandatory=$false)]
    [string]$UserId = "test-user-123",

    [Parameter(Mandatory=$false)]
    [string]$Message = "How much have I spent this month?",

    [Parameter(Mandatory=$false)]
    [string]$PeriodId = ""
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AI Chat Function Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Determine the base URL based on environment
$baseUrl = switch ($Environment) {
    "emulator" { "http://127.0.0.1:5001/spendless-dev/us-central1" }
    "dev" { "https://us-central1-spendless-dev.cloudfunctions.net" }
    "prod" { "https://us-central1-spendless-prod.cloudfunctions.net" }
    default { "http://127.0.0.1:5001/spendless-dev/us-central1" }
}

Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Base URL: $baseUrl" -ForegroundColor Yellow
Write-Host "User ID: $UserId" -ForegroundColor Yellow
Write-Host ""

# Function to call Firebase callable function
function Invoke-FirebaseFunction {
    param(
        [string]$FunctionName,
        [hashtable]$Data,
        [string]$AuthToken = ""
    )

    $url = "$baseUrl/$FunctionName"
    $headers = @{
        "Content-Type" = "application/json"
    }

    if ($AuthToken) {
        $headers["Authorization"] = "Bearer $AuthToken"
    }

    $body = @{
        data = $Data
    } | ConvertTo-Json -Depth 10

    try {
        Write-Host "Calling function: $FunctionName" -ForegroundColor Cyan
        Write-Host "Request body:" -ForegroundColor Gray
        Write-Host $body -ForegroundColor Gray
        Write-Host ""

        $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body

        Write-Host "Response:" -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
        Write-Host ""

        return $response
    }
    catch {
        Write-Host "Error calling function:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        if ($_.ErrorDetails) {
            Write-Host $_.ErrorDetails.Message -ForegroundColor Red
        }
        Write-Host ""
        return $null
    }
}

# Test 1: Basic chat message
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test 1: Basic Chat Message" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$data = @{
    message = $Message
    sessionHistory = @()
}

if ($PeriodId) {
    $data.periodId = $PeriodId
}

$result = Invoke-FirebaseFunction -FunctionName "aiChat" -Data $data
if ($result) {
    Write-Host "✓ Test 1 Passed: Received response" -ForegroundColor Green
    Write-Host "Response: $($result.result.response)" -ForegroundColor White
    Write-Host "Tokens Used: $($result.result.tokensUsed)" -ForegroundColor White
} else {
    Write-Host "✗ Test 1 Failed" -ForegroundColor Red
}
Write-Host ""

# Test 2: Chat with session history
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test 2: Chat with Session History" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$data2 = @{
    message = "What about last week?"
    sessionHistory = @(
        @{
            role = "user"
            content = "How much have I spent this month?"
        },
        @{
            role = "assistant"
            content = 'You have spent $450 this month across 23 transactions.'
        }
    )
}

if ($PeriodId) {
    $data2.periodId = $PeriodId
}

$result2 = Invoke-FirebaseFunction -FunctionName "aiChat" -Data $data2
if ($result2) {
    Write-Host "✓ Test 2 Passed: Chat with history successful" -ForegroundColor Green
    Write-Host "Response: $($result2.result.response)" -ForegroundColor White
} else {
    Write-Host "✗ Test 2 Failed" -ForegroundColor Red
}
Write-Host ""

# Test 3: Category-specific question
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test 3: Category-Specific Question" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$data3 = @{
    message = "How much have I spent on essentials this month?"
    sessionHistory = @()
}

if ($PeriodId) {
    $data3.periodId = $PeriodId
}

$result3 = Invoke-FirebaseFunction -FunctionName "aiChat" -Data $data3
if ($result3) {
    Write-Host "✓ Test 3 Passed: Category question answered" -ForegroundColor Green
    Write-Host "Response: $($result3.result.response)" -ForegroundColor White
} else {
    Write-Host "✗ Test 3 Failed" -ForegroundColor Red
}
Write-Host ""

# Test 4: Error handling - empty message
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test 4: Error Handling - Empty Message" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$data4 = @{
    message = ""
    sessionHistory = @()
}

$result4 = Invoke-FirebaseFunction -FunctionName "aiChat" -Data $data4
if ($null -eq $result4) {
    Write-Host "✓ Test 4 Passed: Empty message rejected as expected" -ForegroundColor Green
} else {
    Write-Host "✗ Test 4 Failed: Empty message should have been rejected" -ForegroundColor Red
}
Write-Host ""

# Test 5: Error handling - message too long
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test 5: Error Handling - Message Too Long" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$longMessage = "x" * 1001
$data5 = @{
    message = $longMessage
    sessionHistory = @()
}

$result5 = Invoke-FirebaseFunction -FunctionName "aiChat" -Data $data5
if ($null -eq $result5) {
    Write-Host "✓ Test 5 Passed: Long message rejected as expected" -ForegroundColor Green
} else {
    Write-Host "✗ Test 5 Failed: Long message should have been rejected" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "All tests completed. Check results above for details." -ForegroundColor Yellow
Write-Host ""
Write-Host "Note: Tests require:" -ForegroundColor Yellow
Write-Host "  1. Active Firebase emulator or deployed functions" -ForegroundColor Yellow
Write-Host "  2. User authentication (not implemented in this test script)" -ForegroundColor Yellow
Write-Host "  3. Premium subscription for the test user" -ForegroundColor Yellow
Write-Host "  4. AI Chat enabled in account settings (aiChatEnabled: true)" -ForegroundColor Yellow
Write-Host "  5. Active spending period" -ForegroundColor Yellow
Write-Host ""

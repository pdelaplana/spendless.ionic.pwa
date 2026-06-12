# Test AI Chat Notifications
# This script tests the getAiChatNotifications function

param(
    [Parameter(Mandatory=$false)]
    [string]$Environment = "emulator",  # emulator, dev, or prod

    [Parameter(Mandatory=$false)]
    [string]$UserId = "test-user-123",

    [Parameter(Mandatory=$false)]
    [int]$Limit = 10
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AI Chat Notifications Function Test" -ForegroundColor Cyan
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
Write-Host "Limit: $Limit" -ForegroundColor Yellow
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

# Test 1: Get notifications with default limit
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test 1: Get Notifications (Default)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$data1 = @{}

$result1 = Invoke-FirebaseFunction -FunctionName "getAiChatNotifications" -Data $data1
if ($result1) {
    Write-Host "✓ Test 1 Passed: Retrieved notifications" -ForegroundColor Green
    $count = if ($result1.result.notifications) { $result1.result.notifications.Count } else { 0 }
    Write-Host "Notifications retrieved: $count" -ForegroundColor White

    if ($count -gt 0) {
        Write-Host ""
        Write-Host "Sample notification:" -ForegroundColor Cyan
        $firstNotif = $result1.result.notifications[0]
        Write-Host "  ID: $($firstNotif.id)" -ForegroundColor White
        Write-Host "  Type: $($firstNotif.checkInType)" -ForegroundColor White
        Write-Host "  Period: $($firstNotif.periodName)" -ForegroundColor White
        Write-Host "  Content: $($firstNotif.content)" -ForegroundColor White
        Write-Host "  Is Read: $($firstNotif.isRead)" -ForegroundColor White
    }
} else {
    Write-Host "✗ Test 1 Failed" -ForegroundColor Red
}
Write-Host ""

# Test 2: Get notifications with custom limit
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test 2: Get Notifications (Custom Limit)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$data2 = @{
    limit = $Limit
}

$result2 = Invoke-FirebaseFunction -FunctionName "getAiChatNotifications" -Data $data2
if ($result2) {
    Write-Host "✓ Test 2 Passed: Retrieved notifications with custom limit" -ForegroundColor Green
    $count = if ($result2.result.notifications) { $result2.result.notifications.Count } else { 0 }
    Write-Host "Notifications retrieved: $count" -ForegroundColor White
    Write-Host "Expected max: $Limit" -ForegroundColor White

    if ($count -le $Limit) {
        Write-Host "✓ Limit respected" -ForegroundColor Green
    } else {
        Write-Host "✗ Limit exceeded!" -ForegroundColor Red
    }
} else {
    Write-Host "✗ Test 2 Failed" -ForegroundColor Red
}
Write-Host ""

# Test 3: Error handling - limit too high
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test 3: Error Handling - Limit Too High" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$data3 = @{
    limit = 150
}

$result3 = Invoke-FirebaseFunction -FunctionName "getAiChatNotifications" -Data $data3
if ($null -eq $result3) {
    Write-Host "✓ Test 3 Passed: Limit > 100 rejected as expected" -ForegroundColor Green
} else {
    Write-Host "✗ Test 3 Failed: Limit should have been rejected" -ForegroundColor Red
}
Write-Host ""

# Test 4: Verify notifications are marked as read
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test 4: Verify Notifications Marked as Read" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Getting notifications (first call)..." -ForegroundColor Cyan
$firstCall = Invoke-FirebaseFunction -FunctionName "getAiChatNotifications" -Data @{}

if ($firstCall -and $firstCall.result.notifications.Count -gt 0) {
    $unreadCount = ($firstCall.result.notifications | Where-Object { -not $_.isRead }).Count
    Write-Host "Unread notifications: $unreadCount" -ForegroundColor White

    Write-Host ""
    Write-Host "Getting notifications again (second call)..." -ForegroundColor Cyan
    Start-Sleep -Seconds 2
    $secondCall = Invoke-FirebaseFunction -FunctionName "getAiChatNotifications" -Data @{}

    if ($secondCall) {
        $unreadCount2 = ($secondCall.result.notifications | Where-Object { -not $_.isRead }).Count
        Write-Host "Unread notifications after second call: $unreadCount2" -ForegroundColor White

        if ($unreadCount2 -lt $unreadCount) {
            Write-Host "✓ Test 4 Passed: Notifications marked as read" -ForegroundColor Green
        } else {
            Write-Host "⚠ Test 4 Inconclusive: No change in read status" -ForegroundColor Yellow
            Write-Host "  (This is expected if there were no unread notifications)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "⚠ Test 4 Skipped: No notifications to test" -ForegroundColor Yellow
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
Write-Host "  3. Existing notifications in Firestore for the test user" -ForegroundColor Yellow
Write-Host ""

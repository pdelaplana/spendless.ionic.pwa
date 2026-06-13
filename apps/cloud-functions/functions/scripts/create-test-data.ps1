# Create Test Data for AI Chat Feature
# This script creates test data in Firestore for testing the AI Chat feature

param(
    [Parameter(Mandatory=$false)]
    [string]$Environment = "emulator",  # emulator or dev

    [Parameter(Mandatory=$false)]
    [string]$UserId = "test-user-123"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Create AI Chat Test Data" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "User ID: $UserId" -ForegroundColor Yellow
Write-Host ""

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

# Set project based on environment
$project = if ($Environment -eq "emulator") { "demo-test" } else { "spendless-dev" }

Write-Host "Creating test data for project: $project" -ForegroundColor Cyan
Write-Host ""

# Create test account document
Write-Host "Creating test account..." -ForegroundColor Cyan

$accountData = @{
    userId = $UserId
    name = "Test User"
    email = "test@example.com"
    currency = "USD"
    subscriptionTier = "premium"
    aiChatEnabled = $true
    aiCheckinEnabled = $true
    createdAt = [DateTime]::UtcNow.ToString("o")
    updatedAt = [DateTime]::UtcNow.ToString("o")
} | ConvertTo-Json

Write-Host "Account data:" -ForegroundColor Gray
Write-Host $accountData -ForegroundColor Gray
Write-Host ""

# Create test period
Write-Host "Creating test period..." -ForegroundColor Cyan

$periodStart = [DateTime]::UtcNow.AddDays(-15)
$periodEnd = [DateTime]::UtcNow.AddDays(15)

$periodData = @{
    name = "January 2025"
    startAt = $periodStart.ToString("o")
    endAt = $periodEnd.ToString("o")
    targetSpend = 1000
    targetSavings = 500
    goals = "Save for vacation"
    createdAt = [DateTime]::UtcNow.ToString("o")
} | ConvertTo-Json

Write-Host "Period data:" -ForegroundColor Gray
Write-Host $periodData -ForegroundColor Gray
Write-Host ""

# Create test spending transactions
Write-Host "Creating test spending transactions..." -ForegroundColor Cyan

$spendingTransactions = @(
    @{
        date = [DateTime]::UtcNow.AddDays(-10).ToString("o")
        amount = 50.00
        description = "Grocery shopping"
        category = "essentials"
        notes = "Weekly groceries"
        tags = @("food", "weekly")
        recurring = $false
    },
    @{
        date = [DateTime]::UtcNow.AddDays(-8).ToString("o")
        amount = 15.50
        description = "Coffee shop"
        category = "rewards"
        notes = "Morning coffee"
        tags = @("coffee", "treats")
        recurring = $false
    },
    @{
        date = [DateTime]::UtcNow.AddDays(-5).ToString("o")
        amount = 120.00
        description = "Gym membership"
        category = "growth"
        notes = "Monthly gym"
        tags = @("fitness", "health")
        recurring = $true
    },
    @{
        date = [DateTime]::UtcNow.AddDays(-3).ToString("o")
        amount = 45.00
        description = "Dinner with friends"
        category = "connections"
        notes = "Birthday celebration"
        tags = @("social", "dining")
        recurring = $false
    },
    @{
        date = [DateTime]::UtcNow.AddDays(-2).ToString("o")
        amount = 85.00
        description = "Gas station"
        category = "essentials"
        notes = "Fuel for car"
        tags = @("transportation")
        recurring = $false
    },
    @{
        date = [DateTime]::UtcNow.AddDays(-1).ToString("o")
        amount = 200.00
        description = "Car repair"
        category = "unexpected"
        notes = "Brake pads replacement"
        tags = @("car", "maintenance")
        recurring = $false
    }
)

$totalSpending = ($spendingTransactions | ForEach-Object { $_.amount } | Measure-Object -Sum).Sum
Write-Host "Total spending: $totalSpending" -ForegroundColor White
Write-Host "Transactions: $($spendingTransactions.Count)" -ForegroundColor White
Write-Host ""

# Create test notification
Write-Host "Creating test notification..." -ForegroundColor Cyan

$notificationData = @{
    userId = $UserId
    accountId = $UserId
    periodId = "test-period-123"
    periodName = "January 2025"
    content = "Hey! You're halfway through your period. You've spent `$515.50 out of your `$1000 budget. Great job staying on track!"
    checkInType = "milestone"
    createdAt = [DateTime]::UtcNow.ToString("o")
    isRead = $false
    tokensUsed = 150
    aiModel = "gemini-2.5-flash"
} | ConvertTo-Json

Write-Host "Notification data:" -ForegroundColor Gray
Write-Host $notificationData -ForegroundColor Gray
Write-Host ""

# Instructions for manual setup
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Manual Setup Instructions" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To complete test data setup, use the Firebase Console or Admin SDK to create:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Account Document:" -ForegroundColor Cyan
Write-Host "   Path: accounts/$UserId" -ForegroundColor White
Write-Host "   Data: (See above)" -ForegroundColor White
Write-Host ""
Write-Host "2. Period Document:" -ForegroundColor Cyan
Write-Host "   Path: accounts/$UserId/periods/test-period-123" -ForegroundColor White
Write-Host "   Data: (See above)" -ForegroundColor White
Write-Host ""
Write-Host "3. Spending Documents:" -ForegroundColor Cyan
Write-Host "   Path: accounts/$UserId/spending/{auto-id}" -ForegroundColor White
Write-Host "   Count: $($spendingTransactions.Count) transactions" -ForegroundColor White
Write-Host "   Add periodId: 'test-period-123' to each transaction" -ForegroundColor White
Write-Host ""
Write-Host "4. Notification Document:" -ForegroundColor Cyan
Write-Host "   Path: accounts/$UserId/aiChatNotifications/{auto-id}" -ForegroundColor White
Write-Host "   Data: (See above)" -ForegroundColor White
Write-Host ""

# Alternative: Using Firebase Admin SDK script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Alternative: Node.js Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can also create a Node.js script using Firebase Admin SDK:" -ForegroundColor Yellow
Write-Host ""
Write-Host @"
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();
const userId = '$UserId';

async function createTestData() {
  // Create account
  await db.collection('accounts').doc(userId).set({
    userId: userId,
    name: 'Test User',
    email: 'test@example.com',
    currency: 'USD',
    subscriptionTier: 'premium',
    aiChatEnabled: true,
    aiCheckinEnabled: true,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  });

  // Create period
  const periodRef = await db.collection('accounts').doc(userId)
    .collection('periods').add({
    name: 'January 2025',
    startAt: admin.firestore.Timestamp.fromDate(new Date('2025-01-01')),
    endAt: admin.firestore.Timestamp.fromDate(new Date('2025-01-31')),
    targetSpend: 1000,
    targetSavings: 500,
    goals: 'Save for vacation',
    createdAt: admin.firestore.Timestamp.now()
  });

  // Create spending transactions
  const batch = db.batch();
  const spendingRef = db.collection('accounts').doc(userId).collection('spending');

  // Add transactions here...

  await batch.commit();

  console.log('Test data created successfully!');
}

createTestData();
"@ -ForegroundColor Gray

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test data specification created for user: $UserId" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Set up Firestore data using Firebase Console or Admin SDK" -ForegroundColor Yellow
Write-Host "  2. Run test-ai-chat.ps1 to test the aiChat function" -ForegroundColor Yellow
Write-Host "  3. Run test-ai-chat-notifications.ps1 to test notifications" -ForegroundColor Yellow
Write-Host ""

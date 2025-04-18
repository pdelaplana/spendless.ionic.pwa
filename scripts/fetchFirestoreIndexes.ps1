# Install Firebase CLI globally if not already installed
# Note: This requires npm to be installed on your system

if (-not (Get-Command firebase -ErrorAction SilentlyContinue)) {
    Write-Output "Installing Firebase CLI..."
    npm install -g firebase-tools
}

# Login to Firebase (this will open a browser for authentication)
Write-Output "Logging in to Firebase..."
firebase login

# Set the Firebase project
Write-Host "Setting Firebase project..."
firebase use spendless-dev-15971

# Navigate to your project directory if needed
# Uncomment and modify the path as needed
Set-Location -Path "D:\Repos\spendless\spendless.ionic.pwa"

# Export Firestore indexes to a JSON file
Write-Output "Exporting Firestore indexes..."
$indexesOutput = firebase firestore:indexes
$indexesOutput | Out-File -FilePath "firestore.indexes.json" -Encoding utf8

Write-Output "Export complete. Indexes saved to firestore.indexes.json"

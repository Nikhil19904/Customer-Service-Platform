# Simple PowerShell script to test Google OAuth configuration

Write-Host "Checking Google OAuth Configuration..." -ForegroundColor Cyan
Write-Host "====================================="
Write-Host ""

# Check the config using the Node.js script
Write-Host "Running Google OAuth check..." -ForegroundColor Yellow
node .\test-google-auth.js

Write-Host ""
Write-Host "Press Enter to exit..." 
Read-Host 
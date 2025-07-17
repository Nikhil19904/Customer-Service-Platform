# PowerShell script to start both frontend and backend servers
Write-Host "Starting Customer Service Platform..." -ForegroundColor Cyan

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed or not in PATH. Please install Node.js and try again." -ForegroundColor Red
    exit 1
}

# First run the cleanup script to ensure no conflicting processes
Write-Host "`nRunning cleanup script to kill any conflicting processes..." -ForegroundColor Yellow
try {
    & "$PSScriptRoot\cleanup.ps1"
} catch {
    Write-Host "Warning: Failed to run cleanup script: $_" -ForegroundColor Yellow
}

# Start backend server
$backendPath = Join-Path $PSScriptRoot "backend"
if (Test-Path $backendPath) {
    Write-Host "`nStarting backend server..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm start" -WindowStyle Normal
    Write-Host "✅ Backend server starting on port 5000" -ForegroundColor Green
} else {
    Write-Host "❌ Backend directory not found at: $backendPath" -ForegroundColor Red
}

# Start frontend server
$frontendPath = Join-Path $PSScriptRoot "frontend"
if (Test-Path $frontendPath) {
    Write-Host "`nStarting frontend server..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm start" -WindowStyle Normal
    Write-Host "✅ Frontend server starting on port 3002" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend directory not found at: $frontendPath" -ForegroundColor Red
}

Write-Host "`n✨ Customer Service Platform is starting up!" -ForegroundColor Green
Write-Host "- Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "- Frontend: http://localhost:3002" -ForegroundColor Cyan
Write-Host "`nNote: It may take a moment for the servers to fully start." -ForegroundColor Yellow 
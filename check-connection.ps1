# PowerShell script to verify connections between frontend and backend

Write-Host "Checking server connections..." -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

# Check if backend is running
Write-Host "`nChecking backend server (http://localhost:5000)..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-RestMethod -Uri "http://localhost:5000" -Method Get -ErrorAction Stop
    Write-Host "✅ Backend server is running!" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend server is NOT running or not accessible" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

# Check MongoDB connection
Write-Host "`nChecking MongoDB connection..." -ForegroundColor Yellow
try {
    $dbResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/db-status" -Method Get -ErrorAction Stop
    
    if ($dbResponse.connected -eq $true) {
        Write-Host "✅ MongoDB is connected!" -ForegroundColor Green
        Write-Host "  Status: $($dbResponse.status)" -ForegroundColor Green
        Write-Host "  Message: $($dbResponse.message)" -ForegroundColor Green
    } else {
        Write-Host "❌ MongoDB is NOT connected" -ForegroundColor Red
        Write-Host "  Status: $($dbResponse.status)" -ForegroundColor Red
        Write-Host "  Message: $($dbResponse.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Could not check MongoDB connection" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

# Check if frontend is running (assuming port 3002)
$frontendPort = 3002
Write-Host "`nChecking frontend server (http://localhost:$frontendPort)..." -ForegroundColor Yellow

# Check if the port is in use (as a simple check if something is running there)
$portInUse = $false
try {
    $connections = Get-NetTCPConnection -LocalPort $frontendPort -ErrorAction SilentlyContinue
    $portInUse = $connections.Count -gt 0
} catch {
    # Continue even if this fails
}

if ($portInUse) {
    Write-Host "✅ Frontend server appears to be running (port $frontendPort is in use)" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend server might NOT be running (port $frontendPort is not in use)" -ForegroundColor Red
}

# Check environment variables in .env files
Write-Host "`nChecking environment variables..." -ForegroundColor Yellow

# Check backend .env
$backendEnvPath = "$PSScriptRoot\backend\.env"
if (Test-Path $backendEnvPath) {
    $backendEnv = Get-Content $backendEnvPath
    Write-Host "Backend .env file found" -ForegroundColor Green
    
    # Check important variables
    $frontendUrl = ($backendEnv | Select-String -Pattern "FRONTEND_URL=").ToString() -replace "FRONTEND_URL=", ""
    if ($frontendUrl) {
        Write-Host "  FRONTEND_URL = $frontendUrl" -ForegroundColor Green
    } else {
        Write-Host "  ❌ FRONTEND_URL is missing in backend .env" -ForegroundColor Red
    }
    
    $mongoUri = ($backendEnv | Select-String -Pattern "MONGODB_URI=").ToString() -replace "MONGODB_URI=", ""
    if ($mongoUri) {
        Write-Host "  MONGODB_URI = $mongoUri" -ForegroundColor Green
    } else {
        Write-Host "  ❌ MONGODB_URI is missing in backend .env" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Backend .env file not found" -ForegroundColor Red
}

# Check frontend .env
$frontendEnvPath = "$PSScriptRoot\frontend\.env"
if (Test-Path $frontendEnvPath) {
    $frontendEnv = Get-Content $frontendEnvPath
    Write-Host "Frontend .env file found" -ForegroundColor Green
    
    # Check important variables
    $apiUrl = ($frontendEnv | Select-String -Pattern "REACT_APP_API_URL=").ToString() -replace "REACT_APP_API_URL=", ""
    if ($apiUrl) {
        Write-Host "  REACT_APP_API_URL = $apiUrl" -ForegroundColor Green
    } else {
        Write-Host "  ❌ REACT_APP_API_URL is missing in frontend .env" -ForegroundColor Red
    }
    
    $socketUrl = ($frontendEnv | Select-String -Pattern "REACT_APP_SOCKET_URL=").ToString() -replace "REACT_APP_SOCKET_URL=", ""
    if ($socketUrl) {
        Write-Host "  REACT_APP_SOCKET_URL = $socketUrl" -ForegroundColor Green
    } else {
        Write-Host "  ❌ REACT_APP_SOCKET_URL is missing in frontend .env" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Frontend .env file not found" -ForegroundColor Red
}

Write-Host "`nConnection check completed." -ForegroundColor Cyan
Write-Host "Press Enter to exit..." -ForegroundColor Cyan
Read-Host 
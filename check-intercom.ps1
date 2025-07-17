# PowerShell script to test Intercom connection

Write-Host "Checking Intercom Connection..." -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

# Check if backend .env file exists and has Intercom token
$backendEnvPath = "$PSScriptRoot\backend\.env"
if (-not (Test-Path $backendEnvPath)) {
    Write-Host "❌ Backend .env file not found at $backendEnvPath" -ForegroundColor Red
    exit 1
}

# Read the .env file
$envContent = Get-Content $backendEnvPath -Raw

# Check for Intercom token
$intercomTokenMatch = [regex]::Match($envContent, 'INTERCOM_ACCESS_TOKEN=([^\r\n]+)')
if (-not $intercomTokenMatch.Success) {
    Write-Host "❌ INTERCOM_ACCESS_TOKEN not found in .env file" -ForegroundColor Red
    exit 1
}

$intercomToken = $intercomTokenMatch.Groups[1].Value.Trim()

# Check if token is default placeholder
if ($intercomToken -eq "your_intercom_access_token") {
    Write-Host "❌ INTERCOM_ACCESS_TOKEN is set to the default placeholder value" -ForegroundColor Red
    exit 1
}

# Check if token appears valid
if ($intercomToken.Length -lt 10) {
    Write-Host "❌ INTERCOM_ACCESS_TOKEN seems too short to be valid" -ForegroundColor Red
    exit 1
}

# Mask token for display
$maskedToken = $intercomToken.Substring(0, 4) + "..." + $intercomToken.Substring($intercomToken.Length - 4)
Write-Host "Found Intercom token: $maskedToken" -ForegroundColor Cyan

# Update backend config to use the right Intercom client format
$intercomConfigPath = "$PSScriptRoot\backend\src\config\intercom.js"
if (Test-Path $intercomConfigPath) {
    Write-Host "`nEnsuring Intercom client configuration is correct..." -ForegroundColor Yellow
    $intercomConfig = Get-Content $intercomConfigPath -Raw
    $updatedConfig = $intercomConfig -replace 'const \{ Intercom \}', 'const { Client }'
    $updatedConfig = $updatedConfig -replace 'intercomClient = new Intercom\(\{\s+token:', 'intercomClient = new Client({
      tokenAuth: { token:'
    Set-Content -Path $intercomConfigPath -Value $updatedConfig
    Write-Host "Updated Intercom configuration" -ForegroundColor Green
}

# Run the Node.js script to test the connection
Write-Host "`nTesting connection to Intercom API..." -ForegroundColor Yellow
Write-Host "This may take a few seconds...`n" -ForegroundColor Yellow

try {
    # Check if Node.js is installed
    $nodeVersion = node --version
    Write-Host "Using Node.js $nodeVersion" -ForegroundColor Gray
    
    # Run the test script
    $result = node "$PSScriptRoot\test-intercom.js"
    
    # Display the result
    $result | ForEach-Object { Write-Host $_ }
    
    # Check for success message
    if ($result -match "Successfully connected") {
        Write-Host "`n✅ Intercom is correctly configured and connected!" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Intercom connection test failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error running Intercom test: $_" -ForegroundColor Red
}

Write-Host "`nPress Enter to exit..." -ForegroundColor Cyan
Read-Host 
# PowerShell script to test Google OAuth configuration

Write-Host "Checking Google OAuth Configuration..." -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Check if backend .env file exists
$backendEnvPath = "$PSScriptRoot\backend\.env"
if (-not (Test-Path $backendEnvPath)) {
    Write-Host "❌ Backend .env file not found at $backendEnvPath" -ForegroundColor Red
    exit 1
}

# Read the .env file
$envContent = Get-Content $backendEnvPath -Raw

# Check for Google OAuth credentials
$clientIdMatch = [regex]::Match($envContent, 'GOOGLE_CLIENT_ID=([^\r\n]+)')
$clientSecretMatch = [regex]::Match($envContent, 'GOOGLE_CLIENT_SECRET=([^\r\n]+)')
$callbackUrlMatch = [regex]::Match($envContent, 'GOOGLE_CALLBACK_URL=([^\r\n]+)')

# Mask sensitive values for display
function Mask-Value {
    param($value)
    
    if (-not $value) { return "not set" }
    if ($value -eq "dummy_client_id" -or $value -eq "dummy_client_secret") {
        return "$value (development mode)"
    }
    if ($value.Length -lt 10) { return $value }
    
    return $value.Substring(0, 4) + "..." + $value.Substring($value.Length - 4)
}

# Extract and validate Google Client ID
$clientId = $null
if ($clientIdMatch.Success) {
    $clientId = $clientIdMatch.Groups[1].Value.Trim()
}

Write-Host "`nClient ID:" -ForegroundColor Yellow
if (-not $clientId) {
    Write-Host "❌ GOOGLE_CLIENT_ID is not set in .env file" -ForegroundColor Red
} elseif ($clientId -eq "dummy_client_id") {
    Write-Host "ℹ️ GOOGLE_CLIENT_ID: $(Mask-Value $clientId)" -ForegroundColor Gray
    Write-Host "  Development mode is active - mock authentication will be used" -ForegroundColor Gray
} elseif ($clientId.Length -lt 20) {
    Write-Host "❌ GOOGLE_CLIENT_ID: $(Mask-Value $clientId) (looks invalid - too short)" -ForegroundColor Red
} else {
    Write-Host "✅ GOOGLE_CLIENT_ID: $(Mask-Value $clientId)" -ForegroundColor Green
}

# Extract and validate Google Client Secret
$clientSecret = $null
if ($clientSecretMatch.Success) {
    $clientSecret = $clientSecretMatch.Groups[1].Value.Trim()
}

Write-Host "`nClient Secret:" -ForegroundColor Yellow
if (-not $clientSecret) {
    Write-Host "❌ GOOGLE_CLIENT_SECRET is not set in .env file" -ForegroundColor Red
} elseif ($clientSecret -eq "dummy_client_secret") {
    Write-Host "ℹ️ GOOGLE_CLIENT_SECRET: $(Mask-Value $clientSecret)" -ForegroundColor Gray
} elseif ($clientSecret.Length -lt 10) {
    Write-Host "❌ GOOGLE_CLIENT_SECRET: $(Mask-Value $clientSecret) (looks invalid - too short)" -ForegroundColor Red
} else {
    Write-Host "✅ GOOGLE_CLIENT_SECRET: $(Mask-Value $clientSecret)" -ForegroundColor Green
}

# Extract and validate Google Callback URL
$callbackUrl = $null
if ($callbackUrlMatch.Success) {
    $callbackUrl = $callbackUrlMatch.Groups[1].Value.Trim()
}

Write-Host "`nCallback URL:" -ForegroundColor Yellow
if (-not $callbackUrl) {
    Write-Host "❌ GOOGLE_CALLBACK_URL is not set in .env file" -ForegroundColor Red
} else {
    Write-Host "✅ GOOGLE_CALLBACK_URL: $callbackUrl" -ForegroundColor Green
    
    # Validate callback URL format
    try {
        $uri = [System.Uri]$callbackUrl
        if (-not $uri.AbsolutePath.Contains("/google/callback")) {
            Write-Host "⚠️ Warning: Callback URL may not be correctly formatted. Should contain '/google/callback'" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Error: Callback URL is not a valid URL" -ForegroundColor Red
    }
}

# Run the Node.js script for additional testing
Write-Host "`nRunning detailed Google OAuth connectivity test..." -ForegroundColor Yellow
Write-Host "This may take a few seconds...`n" -ForegroundColor Yellow

try {
    # Check if Node.js is installed
    $nodeVersion = node --version
    Write-Host "Using Node.js $nodeVersion" -ForegroundColor Gray
    
    # Run the test script
    $result = node "$PSScriptRoot\test-google-auth.js"
    
    # Display the result
    $result | ForEach-Object { Write-Host $_ }
} catch {
    Write-Host "❌ Error running Google OAuth test: $_" -ForegroundColor Red
}

# Determine if we're in development mode
$isDevelopmentMode = $clientId -eq "dummy_client_id"

# Final summary
Write-Host "`nSummary:" -ForegroundColor Cyan
if ($isDevelopmentMode) {
    Write-Host "🔹 Application is running in DEVELOPMENT mode" -ForegroundColor Cyan
    Write-Host "🔹 Mock authentication is being used - no actual Google authentication will occur" -ForegroundColor Cyan
    Write-Host "🔹 This configuration is suitable for development but not for production" -ForegroundColor Cyan
} elseif ($clientId -and $clientSecret -and $callbackUrl -and $clientId.Length -ge 20 -and $clientSecret.Length -ge 10) {
    Write-Host "✅ Google OAuth appears to be correctly configured!" -ForegroundColor Green
    Write-Host "✅ Your application should be able to authenticate with Google" -ForegroundColor Green
} else {
    Write-Host "❌ Google OAuth configuration is incomplete or invalid" -ForegroundColor Red
    Write-Host "❌ Authentication with Google will not work until issues are resolved" -ForegroundColor Red
    Write-Host "`nSuggested actions:" -ForegroundColor Yellow
    Write-Host "1. Ensure all Google OAuth variables are set in backend/.env" -ForegroundColor Yellow
    Write-Host "2. Get valid credentials from Google Cloud Console: https://console.cloud.google.com/" -ForegroundColor Yellow
    Write-Host "3. Set environment variables with correct values" -ForegroundColor Yellow
}

Write-Host "`nPress Enter to exit..." -ForegroundColor Cyan
Read-Host 
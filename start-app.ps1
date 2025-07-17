# PowerShell script to start both frontend and backend servers

# Function to check if a port is in use
function Test-PortInUse {
    param($port)
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    return $connections.Count -gt 0
}

# Check and free port 5000 (backend)
if (Test-PortInUse 5000) {
    Write-Host "Port 5000 is in use. Attempting to free it..." -ForegroundColor Yellow
    $processId = (Get-NetTCPConnection -LocalPort 5000).OwningProcess
    if ($processId) {
        try {
            Stop-Process -Id $processId -Force
            Write-Host "Successfully killed process using port 5000" -ForegroundColor Green
        } catch {
            Write-Host "Failed to kill process. Please manually stop it and try again." -ForegroundColor Red
            exit
        }
    }
}

# Start backend server in a new window
Write-Host "Starting backend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-Command", "Set-Location '$PSScriptRoot\backend'; npm start; Read-Host 'Press Enter to exit'"

# Wait for backend to start
Write-Host "Waiting for backend server to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Start frontend server in a new window
Write-Host "Starting frontend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-Command", "Set-Location '$PSScriptRoot\frontend'; npm start; Read-Host 'Press Enter to exit'"

Write-Host "`nBoth servers should now be running in separate windows." -ForegroundColor Green
Write-Host "Backend URL: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend URL: http://localhost:3002" -ForegroundColor Cyan
Write-Host "You can close this window now." -ForegroundColor Cyan 
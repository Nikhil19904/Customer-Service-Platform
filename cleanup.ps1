# PowerShell script to kill processes using our ports
Write-Host "Cleaning up processes..." -ForegroundColor Cyan

# Function to kill process using a specific port
function Kill-ProcessByPort {
    param($port)
    
    $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | 
                 Select-Object -ExpandProperty OwningProcess -Unique
    
    foreach ($process in $processes) {
        try {
            $processName = (Get-Process -Id $process -ErrorAction SilentlyContinue).ProcessName
            Write-Host "Killing process $processName (PID: $process) on port $port" -ForegroundColor Yellow
            Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
            Write-Host "✅ Process terminated" -ForegroundColor Green
        } catch {
            Write-Host "Failed to kill process on port $port" -ForegroundColor Red
        }
    }
    
    if (-not $processes) {
        Write-Host "No process found using port $port" -ForegroundColor Gray
    }
}

# Kill processes on all our ports
Write-Host "`nChecking port 5000 (Backend):" -ForegroundColor Cyan
Kill-ProcessByPort -port 5000

Write-Host "`nChecking port 3000 (React default):" -ForegroundColor Cyan
Kill-ProcessByPort -port 3000

Write-Host "`nChecking port 3001 (React fallback):" -ForegroundColor Cyan
Kill-ProcessByPort -port 3001

Write-Host "`nChecking port 3002 (Our frontend):" -ForegroundColor Cyan
Kill-ProcessByPort -port 3002

Write-Host "`nAll processes have been cleaned up." -ForegroundColor Cyan
Write-Host "You can now restart your servers." -ForegroundColor Green 
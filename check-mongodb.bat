@echo off
echo Checking MongoDB connection status...

REM Get connection status from API endpoint
curl -s http://localhost:5000/api/auth/db-status > temp.json 2>nul

REM Check if curl succeeded
if %ERRORLEVEL% NEQ 0 (
  echo Server is not running. Please start the backend server first.
  goto cleanup
)

REM Parse JSON to extract connection status (basic approach)
findstr "connected" temp.json > nul
if %ERRORLEVEL% NEQ 0 (
  echo Could not parse MongoDB connection status.
  goto cleanup
)

findstr "true" temp.json > nul
if %ERRORLEVEL% EQU 0 (
  echo MongoDB is connected and running properly.
) else (
  echo MongoDB is NOT connected. Please check your MongoDB service.
  echo Make sure MongoDB is running with: mongod --dbpath=^<your-db-path^>
)

:cleanup
REM Clean up temporary file
if exist temp.json del temp.json

echo.
echo Press any key to exit...
pause > nul 
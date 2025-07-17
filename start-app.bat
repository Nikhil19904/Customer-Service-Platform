@echo off
echo Starting Customer Service Platform...

REM Open new terminal for backend
start cmd /k "cd %~dp0backend && npm start"

REM Wait a moment for backend to initialize
timeout /t 3 /nobreak > nul

REM Open new terminal for frontend
start cmd /k "cd %~dp0frontend && npm start"

echo Application startup initiated. Check the new terminal windows. 
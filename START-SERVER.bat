@echo off
echo ========================================
echo    Library Management System Server
echo ========================================
echo.
echo Starting server on http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

cd /d "%~dp0"
npm start

pause
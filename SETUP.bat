@echo off
echo ========================================
echo    Library System - First Time Setup
echo ========================================
echo.
echo This will install all required dependencies...
echo.
pause

cd /d "%~dp0"

echo Installing Node.js dependencies...
npm install

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Run the SQL migration scripts in your MySQL database
echo 2. Update server/db.ts with your database credentials
echo 3. Double-click START-SERVER.bat to launch
echo.
echo See DEPLOYMENT-GUIDE.md for detailed instructions
echo.
pause
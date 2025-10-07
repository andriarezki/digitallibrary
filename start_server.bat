@echo off
echo ============================================
echo LIBRARY SYSTEM - OFFLINE DEPLOYMENT HELPER
echo ============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js first, then run this script again.
    pause
    exit /b 1
)

echo Node.js is installed: 
node --version

echo.
echo Checking if dependencies are already installed...

if exist "node_modules" (
    echo Dependencies already exist!
    echo Starting the application...
    goto :start_app
) else (
    echo Dependencies not found.
    echo.
    echo IMPORTANT: This requires internet connection for first-time setup.
    echo If you don't have internet, copy the 'node_modules' folder 
    echo from your development machine to this directory.
    echo.
    set /p choice="Do you want to install dependencies now? (y/n): "
    if /i "%choice%"=="y" (
        echo Installing dependencies...
        npm install
        if %errorlevel% neq 0 (
            echo ERROR: Failed to install dependencies!
            echo Please copy 'node_modules' folder manually.
            pause
            exit /b 1
        )
    ) else (
        echo Please copy 'node_modules' folder manually and run this script again.
        pause
        exit /b 1
    )
)

:start_app
echo.
echo ============================================
echo STARTING LIBRARY SYSTEM...
echo ============================================
echo.
echo Make sure XAMPP MySQL is running!
echo Application will be available at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev

pause
@echo off
REM Local MySQL setup and test script for Windows

echo ===== Setting up local MySQL for Vijaya Renaissance Hub =====

REM Check if MySQL is installed and in PATH
where mysql >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo X MySQL is not installed or not in PATH
    echo Please install MySQL first. You can install XAMPP or MySQL Community Edition.
    pause
    exit /b 1
)

REM Prompt for MySQL root password
set /p "MYSQL_ROOT_PASSWORD=Enter your MySQL root password (or press Enter if no password): "

REM Set password argument based on input
set PASS_ARG="1001"
if not "%MYSQL_ROOT_PASSWORD%" == "" (
    set PASS_ARG=-p%MYSQL_ROOT_PASSWORD%
)

REM Run the SQL setup script
echo Creating database and tables...
mysql -u root %PASS_ARG% < setup-local-mysql.sql
if %ERRORLEVEL% neq 0 (
    echo X Database setup failed! Check your MySQL root password and try again.
    pause
    exit /b 1
) else (
    echo √ Database setup completed successfully!
)

REM Check if necessary Node packages are installed
echo Checking for required Node.js packages...
call npm list mysql2 >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Installing mysql2 package...
    cd ..
    call npm install mysql2
    cd server
)

REM Run the Node.js test script
echo Running test script...
node test-local-mysql.js

echo ===== All done! =====
echo If there were no errors, your local MySQL setup is working correctly.
echo You can now test the waitlist form with your local database.
pause

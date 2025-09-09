@echo off
REM Script to update MySQL password in your local development environment

echo === MySQL Password Update for Development ===
echo.

REM Get the new password
set /p NEW_PASSWORD="Enter the new MySQL password: "

echo.
echo Updating MySQL password...

REM Update the MySQL user password
echo Enter your MySQL root password when prompted
mysql -u root -p -e "ALTER USER 'vvf_user'@'localhost' IDENTIFIED BY '%NEW_PASSWORD%'; FLUSH PRIVILEGES;"

if %ERRORLEVEL% neq 0 (
    echo Error: Failed to update MySQL password. Please check your root password and try again.
    goto :end
)

echo MySQL user password updated successfully!
echo.

REM Update server-mysql.js
echo Updating server-mysql.js...
powershell -Command "(Get-Content server-mysql.js) -replace \"password: '.*',\", \"password: '%NEW_PASSWORD%', // Updated on %date%\" | Set-Content server-mysql.js"

if %ERRORLEVEL% neq 0 (
    echo Error: Failed to update server-mysql.js
) else (
    echo Updated server-mysql.js successfully!
)

REM Update setup-local-mysql.sql
echo Updating setup-local-mysql.sql...
powershell -Command "(Get-Content setup-local-mysql.sql) -replace \"CREATE USER IF NOT EXISTS 'vvf_user'@'localhost' IDENTIFIED BY '.*';\", \"CREATE USER IF NOT EXISTS 'vvf_user'@'localhost' IDENTIFIED BY '%NEW_PASSWORD%';\" | Set-Content setup-local-mysql.sql"

if %ERRORLEVEL% neq 0 (
    echo Error: Failed to update setup-local-mysql.sql
) else (
    echo Updated setup-local-mysql.sql successfully!
)

echo.
echo Password update complete!
echo New password for vvf_user: %NEW_PASSWORD%
echo.
echo Remember to restart your server for changes to take effect.

:end
echo.
pause

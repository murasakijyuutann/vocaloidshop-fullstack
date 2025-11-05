@echo off
REM Docker Build and Run Script for Windows
REM VocaloCart Backend

echo ========================================
echo VocaloCart Backend - Docker Setup
echo ========================================
echo.

:menu
echo Choose an option:
echo 1. Build Docker image
echo 2. Run with docker-compose (Production)
echo 3. Run with docker-compose (Dev with MySQL)
echo 4. View logs
echo 5. Stop containers
echo 6. Rebuild and restart
echo 7. Clean up (remove containers)
echo 8. Exit
echo.

set /p choice="Enter your choice (1-8): "

if "%choice%"=="1" goto build
if "%choice%"=="2" goto run_prod
if "%choice%"=="3" goto run_dev
if "%choice%"=="4" goto logs
if "%choice%"=="5" goto stop
if "%choice%"=="6" goto rebuild
if "%choice%"=="7" goto cleanup
if "%choice%"=="8" goto end

echo Invalid choice!
goto menu

:build
echo.
echo Building Docker image...
docker build -t vocalocart-backend:latest .
echo.
echo Build complete!
pause
goto menu

:run_prod
echo.
echo Starting backend (Production mode with AWS RDS)...
docker-compose -f docker-compose.prod.yml up -d
echo.
echo Backend started! Check logs with option 4
echo Health check: http://localhost:8081/actuator/health
pause
goto menu

:run_dev
echo.
echo Starting backend + MySQL (Development mode)...
docker-compose up -d
echo.
echo Services started! Check logs with option 4
pause
goto menu

:logs
echo.
echo Showing logs (Ctrl+C to exit)...
docker-compose -f docker-compose.prod.yml logs -f backend
goto menu

:stop
echo.
echo Stopping containers...
docker-compose -f docker-compose.prod.yml down
docker-compose down
echo.
echo Containers stopped!
pause
goto menu

:rebuild
echo.
echo Rebuilding and restarting...
docker-compose -f docker-compose.prod.yml up -d --build
echo.
echo Rebuild complete!
pause
goto menu

:cleanup
echo.
echo WARNING: This will remove all containers and images!
set /p confirm="Are you sure? (y/n): "
if /i "%confirm%"=="y" (
    docker-compose -f docker-compose.prod.yml down -v
    docker-compose down -v
    docker rmi vocalocart-backend:latest
    echo Cleanup complete!
) else (
    echo Cleanup cancelled.
)
pause
goto menu

:end
echo.
echo Goodbye!
exit /b 0

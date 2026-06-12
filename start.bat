@echo off
title Sycamore Dev

echo Running migrations...
cd /d c:\laragon\www\lms\lms
C:\laragon\bin\php\php-8.3.26-Win32-vs16-x64\php.exe artisan migrate --force

echo Starting Sycamore...

start "Sycamore API" cmd /k "cd /d c:\laragon\www\lms\lms && C:\laragon\bin\php\php-8.3.26-Win32-vs16-x64\php.exe artisan serve --port=8000"

timeout /t 2 /nobreak >nul

start "Sycamore Frontend" cmd /k "cd /d c:\laragon\www\lms\frontend && npm run dev"

timeout /t 2 /nobreak >nul

start "Sycamore Website" cmd /k "cd /d c:\laragon\www\lms\website && npm run dev"

echo.
echo API:      http://localhost:8000
echo Frontend: http://localhost:5173
echo Website:  http://localhost:5174
echo.

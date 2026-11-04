@echo off
title Install Node.js Scheduled Task - Cipta Group Sync
cd /d "%~dp0"
echo ===================================================================
echo   Pemasangan Jadwal Otomatis Sinkronisasi Node.js (Setiap 6 Jam)
echo ===================================================================
echo.

set SCRIPT_PATH=%~dp0sync.js
set NODE_EXE=node.exe

where %NODE_EXE% >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Node.js tidak ditemukan di PATH sistem.
    pause
    exit /b 1
)

echo Mendaftarkan tugas terjadwal ke Windows Task Scheduler...
schtasks /create /tn "CiptaGroupLinktreeNodeSync" /tr "node.exe \"%SCRIPT_PATH%\"" /sc hourly /mo 6 /f

if %errorlevel% equ 0 (
    echo.
    echo [V] BERHASIL! Tugas 'CiptaGroupLinktreeNodeSync' telah didaftarkan.
    echo     Data dari https://linktr.ee/ciptagroupofficial akan otomatis disinkronkan oleh Node.js setiap 6 jam.
) else (
    echo.
    echo [!] Gagal mendaftarkan tugas. Coba 'Run as Administrator' file ini.
)

echo.
pause

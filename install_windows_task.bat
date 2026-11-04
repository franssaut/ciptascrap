@echo off
title Install Windows Task Scheduler - Cipta Group Sync
cd /d "%~dp0"
echo ===================================================================
echo   Pemasangan Jadwal Otomatis Sinkronisasi Cipta Group (Setiap 6 Jam)
echo ===================================================================
echo.

set SCRIPT_PATH=%~dp0sync_engine.py
set PYTHON_EXE=python.exe

where %PYTHON_EXE% >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Python tidak ditemukan di PATH sistem.
    pause
    exit /b 1
)

echo Mendaftarkan tugas terjadwal ke Windows Task Scheduler...
schtasks /create /tn "CiptaGroupLinktreeAutoSync" /tr "python.exe \"%SCRIPT_PATH%\"" /sc hourly /mo 6 /f

if %errorlevel% equ 0 (
    echo.
    echo [V] BERHASIL! Tugas 'CiptaGroupLinktreeAutoSync' telah didaftarkan.
    echo     Data dari https://linktr.ee/ciptagroupofficial akan otomatis disinkronkan setiap 6 jam.
) else (
    echo.
    echo [!] Gagal mendaftarkan tugas. Coba 'Run as Administrator' file ini.
)

echo.
pause

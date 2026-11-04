@echo off
title Cipta Group - Auto Sync Linktree
cd /d "%~dp0"
echo ========================================================
echo   CIPTA GROUP BATAM - AUTO SYNC DATA LINKTREE
echo   Target: https://linktr.ee/ciptagroupofficial
echo ========================================================
echo.
python sync_engine.py
echo.
echo Selesai. Data terbaru telah diperbarui ke website.
pause

@echo off
title Install TechNotes on Laptop
cd /d "%~dp0"
echo =========================================================================
echo  Installing TechNotes Shortcuts to Desktop and Start Menu...
echo =========================================================================
powershell -ExecutionPolicy Bypass -File "%~dp0install-shortcut.ps1"
echo =========================================================================
pause

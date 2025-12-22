@echo off
REM Document Iteration Skill - Cleanup (Windows)
REM Drag and drop a .md file onto this script to clean it
REM Or run from command line: cleanup.bat path\to\file.md

if "%~1"=="" (
    echo Document Iteration Skill - Cleanup
    echo.
    echo Usage: Drag a .md file onto this script
    echo    or: cleanup.bat path\to\file.md
    echo    or: cleanup.bat --check path\to\file.md
    echo    or: cleanup.bat --recursive path\to\folder
    echo.
    pause
    exit /b 1
)

powershell -ExecutionPolicy Bypass -File "%~dp0cleanup.ps1" %*
pause

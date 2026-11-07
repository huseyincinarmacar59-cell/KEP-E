@echo off
chcp 65001 >nul
title Kepce Sunucusu
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js bulunamadi! Once nodejs.org adresinden Node.js LTS kur.
  pause
  exit /b
)
node server.js
pause

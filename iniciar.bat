@echo off
cd /d "%~dp0"
title Gestor de Inventario TI

if exist "node_modules\electron\dist\electron.exe" (
    start "" "node_modules\electron\dist\electron.exe" .
    exit /b
)

if exist "Gestor-Inventario.exe" (
    start "" "Gestor-Inventario.exe"
    exit /b
)

echo A iniciar Gestor de Inventario...
node launcher.js

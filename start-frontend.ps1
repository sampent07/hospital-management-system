# ===================================================
# Script khởi động Frontend - Hospital Management System  
# Chạy: powershell -ExecutionPolicy Bypass -File start-frontend.ps1
# ===================================================
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendDir = "$root\frontend\patient-app"

Write-Host "=== FRONTEND: Patient App ===" -ForegroundColor Cyan
Write-Host "Dir: $frontendDir" -ForegroundColor Gray
Write-Host ""

Set-Location $frontendDir

Write-Host "Khoi dong Vite dev server tren port 5174..." -ForegroundColor Yellow
Write-Host "App: http://localhost:5174" -ForegroundColor Green
Write-Host ""

npm run dev

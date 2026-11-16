# ===================================================
# Script khởi động Backend - Hospital Management System
# Chạy: powershell -ExecutionPolicy Bypass -File start-backend.ps1
# ===================================================
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$python = "$root\.venv\Scripts\python.exe"
$backendDir = "$root\backend"

Write-Host "=== BACKEND: Hospital Management System ===" -ForegroundColor Cyan
Write-Host "Python: $python" -ForegroundColor Gray
Write-Host "Backend dir: $backendDir" -ForegroundColor Gray
Write-Host ""

Set-Location $backendDir

Write-Host "Khoi dong Uvicorn tren port 8000..." -ForegroundColor Yellow
Write-Host "Docs: http://localhost:8000/api/v1/docs" -ForegroundColor Green
Write-Host ""

& $python -m uvicorn app.main:app --reload --port 8000

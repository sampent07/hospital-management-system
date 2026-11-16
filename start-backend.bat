@echo off
echo === Khoi dong Backend - Hospital Management System ===
echo.

REM Di chuyen vao thu muc backend
cd /d "D:\DoAn_TN\hospital-management-system\backend"
echo Thu muc hien tai: %CD%
echo.

REM Kiem tra python
"D:\DoAn_TN\hospital-management-system\.venv\Scripts\python.exe" --version
if errorlevel 1 (
    echo LOI: Khong tim thay Python venv!
    pause
    exit /b 1
)

echo.
echo Khoi dong backend tai: http://localhost:8000
echo Swagger docs: http://localhost:8000/api/v1/docs
echo.
echo Nhan Ctrl+C de dung backend
echo.

"D:\DoAn_TN\hospital-management-system\.venv\Scripts\python.exe" -m uvicorn app.main:app --reload --port 8000

pause

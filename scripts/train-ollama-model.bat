@echo off
setlocal
cd /d "%~dp0\.."
if exist venv\Scripts\python.exe (
    venv\Scripts\python.exe scripts\train_ollama_model.py
) else (
    python scripts\train_ollama_model.py
)
pause

# scripts\train-ollama-model.ps1 - Train / Create P21 Advisor Model in Ollama
[CmdletBinding()]
param()

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $ProjectRoot

$venvPython = Join-Path $ProjectRoot "venv\Scripts\python.exe"
if (-not (Test-Path $venvPython)) {
    $venvPython = "python"
}

& $venvPython (Join-Path $ProjectRoot "scripts\train_ollama_model.py")

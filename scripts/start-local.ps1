# scripts\start-local.ps1 - Hosted Mode Single-Command Launcher
# Builds the React frontend and runs everything from http://localhost:8000 via FastAPI.

[CmdletBinding()]
param(
    [switch]$LanMode,
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  P21: Starting in Hosted Mode (Single-Process)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Build Frontend
Write-Host "`n[1/2] Building Frontend Production Bundle..." -ForegroundColor Yellow
Push-Location "frontend"
try {
    npm run build
    Write-Host "  [OK] Production assets built into frontend\dist." -ForegroundColor Green
} finally {
    Pop-Location
}

# 2. Determine Host Bind Address
$bindHost = "127.0.0.1"
if ($LanMode) {
    $bindHost = "0.0.0.0"
    $localIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254.*" } | Select-Object -First 1).IPAddress
    Write-Host "`n  [!] LAN MODE ENABLED:" -ForegroundColor Yellow
    Write-Host "  Binding to 0.0.0.0 (Accessible across local Wi-Fi at http://$($localIp):8000)." -ForegroundColor Yellow
    Write-Host "  Notice: Ensure Windows Firewall allows inbound connections on port 8000." -ForegroundColor DarkGray
}

# 3. Start FastAPI Server
Write-Host "`n[2/2] Launching P21 Server on http://$($bindHost):8000..." -ForegroundColor Yellow
$serverProcess = Start-Process -FilePath ".\venv\Scripts\python.exe" `
    -ArgumentList "-m uvicorn backend.main:app --host $bindHost --port 8000" `
    -PassThru -NoNewWindow

$pids = @{
    BackendPid = $serverProcess.Id
    Mode = "hosted"
    Port = 8000
    Host = $bindHost
}
$pids | ConvertTo-Json | Set-Content -Path ".running-services.json" -Encoding UTF8

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  P21 is live at: http://localhost:8000" -ForegroundColor Green
Write-Host "  - OpenAPI Documentation: http://localhost:8000/docs" -ForegroundColor White
Write-Host "  - Health Check: http://localhost:8000/api/health" -ForegroundColor White
Write-Host "  Run .\scripts\stop.ps1 to stop server." -ForegroundColor DarkGray
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not $NoBrowser) {
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:8000"
}

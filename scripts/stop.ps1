# scripts\stop.ps1 - Service Termination Script
# Stops running backend and frontend processes started by start-local.ps1 or start-dev.ps1.

[CmdletBinding()]
param()

$ErrorActionPreference = "Continue"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  P21: Stopping Running Services" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

if (Test-Path ".running-services.json") {
    $info = Get-Content -Path ".running-services.json" -Raw | ConvertFrom-Json

    if ($info.BackendPid) {
        try {
            Stop-Process -Id $info.BackendPid -Force -ErrorAction SilentlyContinue
            Write-Host "  [OK] Terminated backend process (PID $($info.BackendPid))." -ForegroundColor Green
        } catch {
            Write-Host "  [INFO] Backend process was not running." -ForegroundColor DarkGray
        }
    }

    if ($info.FrontendPid) {
        try {
            Stop-Process -Id $info.FrontendPid -Force -ErrorAction SilentlyContinue
            Write-Host "  [OK] Terminated frontend dev process (PID $($info.FrontendPid))." -ForegroundColor Green
        } catch {
            Write-Host "  [INFO] Frontend dev process was not running." -ForegroundColor DarkGray
        }
    }

    Remove-Item ".running-services.json" -Force -ErrorAction SilentlyContinue
} else {
    Write-Host "  No .running-services.json record found. Checking active ports..." -ForegroundColor DarkGray
}

# Cleanup port 8000 and 5173 if still bound
$ports = @(8000, 5173)
foreach ($p in $ports) {
    $conns = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
    foreach ($c in $conns) {
        try {
            Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
            Write-Host "  [OK] Released port $p (Process ID $($c.OwningProcess))." -ForegroundColor Green
        } catch {}
    }
}

Write-Host "`nAll P21 application services have been stopped." -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

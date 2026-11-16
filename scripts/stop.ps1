# scripts\stop.ps1 - Service Termination Script
# Stops running backend and frontend processes started by start-local.ps1 or start-dev.ps1.

[CmdletBinding()]
param()

$ErrorActionPreference = "Continue"

# Ensure script runs with working directory at project root
$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $ProjectRoot

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  P21: Stopping Running Services" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$runningFile = Join-Path $ProjectRoot ".running-services.json"

if (Test-Path $runningFile) {
    try {
        $info = Get-Content -Path $runningFile -Raw | ConvertFrom-Json

        if ($info.BackendPid) {
            cmd.exe /c "taskkill /PID $($info.BackendPid) /T /F" 2>$null
            Write-Host "  [OK] Terminated backend process (PID $($info.BackendPid))." -ForegroundColor Green
        }

        if ($info.FrontendPid) {
            cmd.exe /c "taskkill /PID $($info.FrontendPid) /T /F" 2>$null
            Write-Host "  [OK] Terminated frontend dev process (PID $($info.FrontendPid))." -ForegroundColor Green
        }
    } catch {
        Write-Host "  [INFO] Error reading process records: $_" -ForegroundColor DarkGray
    }

    Remove-Item $runningFile -Force -ErrorAction SilentlyContinue
} else {
    Write-Host "  No .running-services.json record found. Checking active ports..." -ForegroundColor DarkGray
}

# Cleanup port 8000 and 5173 if still bound
$ports = @(8000, 5173)
foreach ($p in $ports) {
    $conns = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
    foreach ($c in $conns) {
        try {
            cmd.exe /c "taskkill /PID $($c.OwningProcess) /T /F" 2>$null
            Write-Host "  [OK] Released port $p (Process ID $($c.OwningProcess))." -ForegroundColor Green
        } catch {}
    }
}

Write-Host "`nAll P21 application services have been stopped." -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

# scripts\start-local.ps1 - Hosted Mode Single-Command Launcher
# Builds the React frontend and runs everything from http://localhost:8000 via FastAPI.

[CmdletBinding()]
param(
    [switch]$LanMode,
    [switch]$NoBrowser,
    [switch]$Foreground,
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

# Ensure script runs with working directory at project root
$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $ProjectRoot

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  P21: Starting in Hosted Mode (Single-Process)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$venvPython = Join-Path $ProjectRoot "venv\Scripts\python.exe"
$venvPythonw = Join-Path $ProjectRoot "venv\Scripts\pythonw.exe"
if (-not (Test-Path $venvPython)) {
    Write-Error "Virtual environment not found at '$venvPython'. Please run .\scripts\setup.ps1 first."
    exit 1
}

# 1. Clean up any stale process holding port 8000
$existing = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "`n[*] Port 8000 is already in use. Terminating stale process..." -ForegroundColor Yellow
    foreach ($conn in $existing) {
        try {
            cmd.exe /c "taskkill /PID $($conn.OwningProcess) /T /F" 2>$null
            Write-Host "  [OK] Released port 8000 (Process ID $($conn.OwningProcess))." -ForegroundColor Green
        } catch {}
    }
    Start-Sleep -Milliseconds 800
}

# 2. Build Frontend (unless -SkipBuild specified)
if (-not $SkipBuild) {
    Write-Host "`n[1/2] Building Frontend Production Bundle..." -ForegroundColor Yellow
    Push-Location (Join-Path $ProjectRoot "frontend")
    try {
        cmd.exe /c "npm run build"
        if ($LASTEXITCODE -ne 0) {
            throw "Frontend build failed with exit code $LASTEXITCODE."
        }
        Write-Host "  [OK] Production assets built into frontend\dist." -ForegroundColor Green
    } finally {
        Pop-Location
    }
} else {
    Write-Host "`n[1/2] Skipping Frontend Build (-SkipBuild active)..." -ForegroundColor DarkGray
}

# 3. Determine Host Bind Address
$bindHost = "127.0.0.1"
$displayHost = "localhost"
if ($LanMode) {
    $bindHost = "0.0.0.0"
    $localIp = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254.*" } | Select-Object -First 1).IPAddress
    if ($localIp) {
        $displayHost = $localIp
    }
    Write-Host "`n  [!] LAN MODE ENABLED:" -ForegroundColor Yellow
    Write-Host "  Binding to 0.0.0.0 (Accessible across local Wi-Fi at http://$($displayHost):8000)." -ForegroundColor Yellow
    Write-Host "  Notice: Ensure Windows Firewall allows inbound connections on port 8000." -ForegroundColor DarkGray
}

$appUrl = "http://${displayHost}:8000"

# 4. Start FastAPI Server
if ($Foreground) {
    Write-Host "`n[2/2] Running P21 Server in Foreground on http://$($bindHost):8000..." -ForegroundColor Yellow
    Write-Host "  Press Ctrl+C to stop server.`n" -ForegroundColor DarkGray
    if (-not $NoBrowser) {
        Start-Process $appUrl
    }
    & $venvPython -m uvicorn backend.main:app --host $bindHost --port 8000
} else {
    Write-Host "`n[2/2] Launching P21 Server on http://$($bindHost):8000..." -ForegroundColor Yellow

    # Ensure logs folder exists
    $logsDir = Join-Path $ProjectRoot "logs"
    if (-not (Test-Path $logsDir)) {
        New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
    }
    $stdoutLog = Join-Path $logsDir "server.log"
    $stderrLog = Join-Path $logsDir "server_error.log"

    # Prefer pythonw.exe with redirected logs so the server is fully detached and never killed on console exit
    $launcherExe = if (Test-Path $venvPythonw) { $venvPythonw } else { $venvPython }

    $serverProcess = Start-Process -FilePath $launcherExe `
        -ArgumentList "-m uvicorn backend.main:app --host $bindHost --port 8000" `
        -WorkingDirectory $ProjectRoot `
        -RedirectStandardOutput $stdoutLog `
        -RedirectStandardError $stderrLog `
        -PassThru

    $pids = @{
        BackendPid = $serverProcess.Id
        Mode = "hosted"
        Port = 8000
        Host = $bindHost
    }
    $pids | ConvertTo-Json | Set-Content -Path (Join-Path $ProjectRoot ".running-services.json") -Encoding UTF8

    # Active health verification probe
    Write-Host "  Verifying server startup..." -ForegroundColor Yellow
    $isHealthy = $false
    for ($i = 0; $i -lt 15; $i++) {
        Start-Sleep -Milliseconds 800
        if ($serverProcess.HasExited) {
            $errContent = if (Test-Path $stderrLog) { Get-Content $stderrLog -Raw } else { "" }
            Write-Error "Backend server failed to start (Process exited with code $($serverProcess.ExitCode)).`n$errContent"
            exit 1
        }
        $conn = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
        if ($conn) {
            $isHealthy = $true
            break
        }
    }

    if ($isHealthy) {
        Write-Host "  [OK] Server verified healthy and listening on port 8000." -ForegroundColor Green
    } else {
        Write-Host "  [!] Server process is active (PID $($serverProcess.Id)), waiting for initial request." -ForegroundColor Yellow
    }

    Write-Host "`n==========================================================" -ForegroundColor Cyan
    Write-Host "  P21 is live at: $appUrl" -ForegroundColor Green
    Write-Host "  - OpenAPI Documentation: $appUrl/docs" -ForegroundColor White
    Write-Host "  - Health Check: $appUrl/api/health" -ForegroundColor White
    Write-Host "  - Server Logs: logs\server.log" -ForegroundColor White
    Write-Host "  Run .\scripts\stop.ps1 (or .\stop.bat) to stop server." -ForegroundColor DarkGray
    Write-Host "==========================================================" -ForegroundColor Cyan

    if (-not $NoBrowser) {
        Start-Process $appUrl
    }
}

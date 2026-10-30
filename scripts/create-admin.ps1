# scripts\create-admin.ps1 - Administrator Provisioning Script
# Securely provisions or elevates an administrator account.

[CmdletBinding()]
param(
    [string]$Email,
    [string]$FullName = "System Administrator",
    [string]$Password
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  P21: Administrator Account Provisioning" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Interactive prompt if parameters omitted
if (-not $Email) {
    $Email = Read-Host "Enter Administrator Email (e.g. admin@p21.gov.in)"
}

if (-not $Password) {
    $securePw = Read-Host -AsSecureString "Enter Secure Administrator Password (min 8 chars)"
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePw)
    $Password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

if ($Password.Length -lt 8) {
    Write-Error "Password must be at least 8 characters long."
}

$pythonPath = ".\venv\Scripts\python.exe"

& $pythonPath -m backend.scripts.bootstrap_admin $Email $FullName $Password

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nAdministrator account successfully created." -ForegroundColor Green
    Write-Host "You may now sign in via the Admin Portal at /auth/admin-login." -ForegroundColor Cyan
} else {
    Write-Error "Failed to provision administrator account."
}

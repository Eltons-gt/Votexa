<#
.SYNOPSIS
  Votexa Production Database Restoration Script for Windows environments.
.DESCRIPTION
  Validates SHA-256 hash and restores PostgreSQL database using pg_restore.
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $true)]
    [string]$BackupFile,

    [string]$TargetDatabaseUrl = $env:DATABASE_URL
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupFile)) {
    Write-Error "Backup file does not exist: $BackupFile"
    exit 1
}

if ([string]::IsNullOrWhiteSpace($TargetDatabaseUrl)) {
    Write-Error "Target database URL not provided and DATABASE_URL environment variable is not defined."
    exit 1
}

$ChecksumFile = "$BackupFile.sha256"
if (Test-Path $ChecksumFile) {
    Write-Host "[+] Verifying SHA-256 integrity..." -ForegroundColor Yellow
    $expectedHash = (Get-Content $ChecksumFile).Split(" ")[0].Trim()
    $actualHash = (Get-FileHash -Path $BackupFile -Algorithm SHA256).Hash
    if ($expectedHash -ne $actualHash) {
        Write-Error "Checksum mismatch! Expected: $expectedHash, Found: $actualHash"
        exit 1
    }
    Write-Host "[+] SHA-256 verified successfully." -ForegroundColor Green
}

Write-Host "[+] Restoring database via pg_restore..." -ForegroundColor Yellow
& pg_restore --clean --if-exists --no-owner --no-privileges -d $TargetDatabaseUrl $BackupFile
if ($LASTEXITCODE -ne 0) {
    Write-Error "pg_restore finished with error code $LASTEXITCODE"
    exit $LASTEXITCODE
}

Write-Host "[+] Database restoration successfully completed." -ForegroundColor Green


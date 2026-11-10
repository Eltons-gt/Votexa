<#
.SYNOPSIS
  Votexa Production Database Backup Script for Windows environments.
.DESCRIPTION
  Performs full PostgreSQL database dump using pg_dump, generates SHA-256 hash, and enforces backup retention.
#>

[CmdletBinding()]
param (
    [string]$BackupDir = "C:\backups\votexa",
    [int]$RetentionDays = 30
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = Join-Path $BackupDir "votexa_backup_$Timestamp.dump"
$ChecksumFile = "$BackupFile.sha256"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Starting Votexa Production Database Backup" -ForegroundColor Green
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')" -ForegroundColor Gray
Write-Host "Target: $BackupFile" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

$dbUrl = $env:DATABASE_URL
if ([string]::IsNullOrWhiteSpace($dbUrl)) {
    Write-Error "DATABASE_URL environment variable is not defined."
    exit 1
}

# Run pg_dump
Write-Host "[+] Executing pg_dump..." -ForegroundColor Yellow
& pg_dump --format=custom --blobs --no-owner --no-privileges -f $BackupFile $dbUrl
if ($LASTEXITCODE -ne 0) {
    Write-Error "pg_dump failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

# Generate SHA256 checksum
Write-Host "[+] Generating SHA-256 checksum..." -ForegroundColor Yellow
$hash = (Get-FileHash -Path $BackupFile -Algorithm SHA256).Hash
Set-Content -Path $ChecksumFile -Value "$hash  $(Split-Path $BackupFile -Leaf)"

$size = (Get-Item $BackupFile).Length / 1MB
Write-Host "[+] Backup completed! Size: $($size.ToString('F2')) MB" -ForegroundColor Green
Write-Host "[+] SHA-256: $hash" -ForegroundColor Green

# Retention cleanup
Write-Host "[+] Cleaning up backups older than $RetentionDays days..." -ForegroundColor Gray
$threshold = (Get-Date).AddDays(-$RetentionDays)
Get-ChildItem -Path $BackupDir -Filter "votexa_backup_*" | Where-Object { $_.CreationTime -lt $threshold } | Remove-Item -Force

Write-Host "[+] Database backup procedure finished successfully." -ForegroundColor Green


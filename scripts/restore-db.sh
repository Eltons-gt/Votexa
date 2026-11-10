#!/usr/bin/env bash
# ==============================================================================
# Votexa Production Database Restoration Script (PostgreSQL 16)
# Verifies SHA-256 integrity and performs safe restore using pg_restore
# ==============================================================================

set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <path_to_backup_file> [target_database_url]"
  echo "Example: $0 /var/backups/votexa/votexa_backup_20261110_120000.dump.gz"
  exit 1
fi

BACKUP_FILE="$1"
RESTORE_TARGET="${2:-${DATABASE_URL:-}}"
CHECKSUM_FILE="${BACKUP_FILE}.sha256"

if [ -z "${RESTORE_TARGET}" ]; then
  echo "[-] Error: Target database URL not provided and DATABASE_URL is unset." >&2
  exit 1
fi

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "[-] Error: Backup file not found: ${BACKUP_FILE}" >&2
  exit 1
fi

echo "=========================================================="
echo "Starting Votexa Production Database Restoration"
echo "Backup File: ${BACKUP_FILE}"
echo "=========================================================="

# Check and verify SHA256 checksum if exists
if [ -f "${CHECKSUM_FILE}" ]; then
  echo "[+] Verifying SHA-256 checksum integrity..."
  sha256sum -c "${CHECKSUM_FILE}"
  echo "[+] Checksum matches! Integrity verified."
else
  echo "[!] Warning: No .sha256 file found for backup. Proceeding with caution..."
fi

# Determine if file is gzipped
if [[ "${BACKUP_FILE}" == *.gz ]]; then
  echo "[+] Decompressing and executing pg_restore..."
  gunzip -c "${BACKUP_FILE}" | pg_restore --clean --if-exists --no-owner --no-privileges -d "${RESTORE_TARGET}"
else
  echo "[+] Executing pg_restore directly..."
  pg_restore --clean --if-exists --no-owner --no-privileges -d "${RESTORE_TARGET}" "${BACKUP_FILE}"
fi

echo "[+] Database restore completed successfully."
exit 0

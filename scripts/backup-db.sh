#!/usr/bin/env bash
# ==============================================================================
# Votexa Production Database Backup Script (PostgreSQL 16)
# Performs consistent snapshot dump with gzip compression and SHA-256 checksum
# ==============================================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/votexa}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILENAME="votexa_backup_${TIMESTAMP}.dump.gz"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILENAME}"
CHECKSUM_PATH="${BACKUP_PATH}.sha256"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

mkdir -p "${BACKUP_DIR}"

echo "=========================================================="
echo "Starting Votexa Production Database Backup"
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "Target: ${BACKUP_PATH}"
echo "=========================================================="

# Check pg_dump availability
if ! command -v pg_dump >/dev/null 2>&1; then
  echo "[-] Error: pg_dump utility is not installed or not in PATH." >&2
  exit 1
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[-] Error: DATABASE_URL environment variable is not set." >&2
  exit 1
fi

# Execute pg_dump with custom format compressed with gzip
echo "[+] Streaming pg_dump and compressing..."
pg_dump --format=custom --blobs --no-owner --no-privileges "${DATABASE_URL}" | gzip -c > "${BACKUP_PATH}"

# Generate cryptographic checksum for tamper-evidence
echo "[+] Generating SHA-256 checksum..."
sha256sum "${BACKUP_PATH}" > "${CHECKSUM_PATH}"

BACKUP_SIZE=$(du -h "${BACKUP_PATH}" | cut -f1)
echo "[+] Backup successfully completed! Size: ${BACKUP_SIZE}"
echo "[+] SHA-256 Checksum: $(cat "${CHECKSUM_PATH}")"

# Retention Policy Cleanup
echo "[+] Enforcing retention policy: deleting backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "votexa_backup_*.dump.gz*" -type f -mtime +"${RETENTION_DAYS}" -exec rm -f {} +

echo "[+] Done."
exit 0

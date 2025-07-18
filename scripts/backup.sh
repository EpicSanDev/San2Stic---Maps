#!/bin/bash


set -e

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="san2stic_backup_${TIMESTAMP}"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

mkdir -p "$BACKUP_DIR"

print_status "Starting San2Stic backup..."

print_status "Backing up PostgreSQL database..."
docker-compose exec -T db pg_dump -U san2stic san2stic | gzip > "$BACKUP_DIR/${BACKUP_NAME}_database.sql.gz"

print_status "Backing up IPFS data..."
docker-compose exec -T ipfs tar czf - /data/ipfs > "$BACKUP_DIR/${BACKUP_NAME}_ipfs.tar.gz"

print_status "Backing up Tor hidden service keys..."
docker-compose exec -T tor tar czf - /var/lib/tor/hidden_service > "$BACKUP_DIR/${BACKUP_NAME}_tor_keys.tar.gz"

print_status "Backing up configuration files..."
tar czf "$BACKUP_DIR/${BACKUP_NAME}_config.tar.gz" .env docker-compose.yml

cat > "$BACKUP_DIR/${BACKUP_NAME}_manifest.txt" << EOF
San2Stic Backup Manifest
========================
Backup Date: $(date)
Backup Name: $BACKUP_NAME

Files:
- ${BACKUP_NAME}_database.sql.gz (PostgreSQL database dump)
- ${BACKUP_NAME}_ipfs.tar.gz (IPFS node data)
- ${BACKUP_NAME}_tor_keys.tar.gz (Tor hidden service keys)
- ${BACKUP_NAME}_config.tar.gz (Configuration files)

Restore Instructions:
1. Stop services: docker-compose down
2. Restore database: gunzip -c ${BACKUP_NAME}_database.sql.gz | docker-compose exec -T db psql -U san2stic san2stic
3. Restore IPFS: docker-compose exec -T ipfs tar xzf - -C / < ${BACKUP_NAME}_ipfs.tar.gz
4. Restore Tor keys: docker-compose exec -T tor tar xzf - -C / < ${BACKUP_NAME}_tor_keys.tar.gz
5. Restore config: tar xzf ${BACKUP_NAME}_config.tar.gz
6. Start services: docker-compose up -d
EOF

print_success "Backup completed: $BACKUP_DIR/$BACKUP_NAME"
print_status "Backup size: $(du -sh $BACKUP_DIR/${BACKUP_NAME}* | awk '{sum+=$1} END {print sum "B"}')"

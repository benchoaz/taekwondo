#!/bin/bash
# ============================================================
# VPS MAINTENANCE SCRIPT — White Tiger Taekwondo
# Dijalankan otomatis via cron job di VPS
# ============================================================

LOG_FILE="/home/ubuntu/maintenance.log"
STORAGE_PATH="/home/ubuntu/taekwondo_storage"
BACKUP_DIR="/home/ubuntu/backups"
DB_NAME="taekwondo_academy"
DB_USER="taekwondo_user"
DB_PASS="taekwondo_password"
DISK_WARN_THRESHOLD=85  # Persen — kirim alert jika disk > 85%
MAX_LOG_LINES=5000       # Batasi ukuran log maintenance

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# ============================================================
# 1. ROTATE LOG (agar file log tidak membengkak)
# ============================================================
rotate_logs() {
  log "=== [1/7] ROTATE LOGS ==="
  if [ -f "$LOG_FILE" ]; then
    LINE_COUNT=$(wc -l < "$LOG_FILE")
    if [ "$LINE_COUNT" -gt "$MAX_LOG_LINES" ]; then
      tail -n 1000 "$LOG_FILE" > "${LOG_FILE}.tmp"
      mv "${LOG_FILE}.tmp" "$LOG_FILE"
      log "Log dirotasi (dipangkas dari $LINE_COUNT ke 1000 baris)"
    fi
  fi

  # Hapus log podman lama (lebih dari 7 hari)
  sudo podman logs --until 168h taekwondo_web > /dev/null 2>&1 || true
  log "Rotasi log selesai."
}

# ============================================================
# 2. HEALTH CHECK CONTAINER (auto-restart jika mati)
# ============================================================
check_containers() {
  log "=== [2/7] HEALTH CHECK CONTAINERS ==="
  
  for SERVICE in taekwondo_db taekwondo_waha taekwondo_web; do
    STATUS=$(sudo podman inspect --format='{{.State.Status}}' "$SERVICE" 2>/dev/null || echo "not_found")
    
    if [ "$STATUS" = "running" ]; then
      log "✅ $SERVICE: running"
    elif [ "$STATUS" = "not_found" ]; then
      log "⚠️  $SERVICE: tidak ditemukan — mencoba podman-compose up..."
      cd /home/ubuntu && sudo podman-compose up -d "$SERVICE" 2>&1 | tee -a "$LOG_FILE"
    else
      log "🔴 $SERVICE: STATUS=$STATUS — merestart..."
      sudo podman start "$SERVICE" 2>&1 | tee -a "$LOG_FILE"
      sleep 5
      NEW_STATUS=$(sudo podman inspect --format='{{.State.Status}}' "$SERVICE" 2>/dev/null || echo "gagal")
      log "   Status setelah restart: $NEW_STATUS"
    fi
  done
  
  # Cek HTTP web server
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3030/ --max-time 10 2>/dev/null || echo "000")
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ] || [ "$HTTP_CODE" = "302" ]; then
    log "✅ Web server HTTP: $HTTP_CODE OK"
  else
    log "🔴 Web server tidak merespons (HTTP: $HTTP_CODE) — restart taekwondo_web..."
    sudo podman restart taekwondo_web 2>&1 | tee -a "$LOG_FILE"
  fi
}

# ============================================================
# 3. MONITOR DISK & HAPUS FILE LAMA
# ============================================================
cleanup_storage() {
  log "=== [3/7] MONITOR & CLEANUP DISK ==="
  
  DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | tr -d '%')
  DISK_AVAIL=$(df -h / | tail -1 | awk '{print $4}')
  log "Disk usage: ${DISK_USAGE}% (sisa: $DISK_AVAIL)"
  
  # Hapus file video lokal lebih dari 30 hari (video quest sudah migrasi ke Cloudinary)
  if [ -d "$STORAGE_PATH/videos" ]; then
    OLD_VIDEOS=$(find "$STORAGE_PATH/videos" -name "*.mp4" -o -name "*.webm" -o -name "*.mov" | xargs -I{} find {} -mtime +30 2>/dev/null | wc -l)
    if [ "$OLD_VIDEOS" -gt "0" ]; then
      find "$STORAGE_PATH/videos" \( -name "*.mp4" -o -name "*.webm" -o -name "*.mov" \) -mtime +30 -delete
      log "🗑️  Hapus $OLD_VIDEOS video lokal lama (>30 hari)"
    fi
  fi
  
  # Hapus file temp/misc lama (>7 hari)
  if [ -d "$STORAGE_PATH/misc" ]; then
    find "$STORAGE_PATH/misc" -type f -mtime +7 -delete 2>/dev/null
    log "🗑️  Hapus file temp di /misc (>7 hari)"
  fi
  
  # Hapus image Docker/Podman yang tidak terpakai (dangling)
  REMOVED=$(sudo podman image prune -f 2>&1 | grep -c "deleted" || echo "0")
  log "🗑️  Hapus $REMOVED image podman tidak terpakai"
  
  # Peringatan disk kritis
  if [ "$DISK_USAGE" -gt "$DISK_WARN_THRESHOLD" ]; then
    log "🚨 PERINGATAN: Disk ${DISK_USAGE}% — melebihi batas ${DISK_WARN_THRESHOLD}%!"
    # Hapus deployment archive lama
    find /home/ubuntu -name "taekwondo_deploy.tar.gz" -mtime +1 -delete 2>/dev/null
    log "🗑️  Hapus deployment archive lama"
  fi
}

# ============================================================
# 4. BACKUP DATABASE (simpan 7 hari terakhir)
# ============================================================
backup_database() {
  log "=== [4/7] BACKUP DATABASE ==="
  
  mkdir -p "$BACKUP_DIR"
  
  BACKUP_FILE="$BACKUP_DIR/db_backup_$(date '+%Y%m%d_%H%M%S').sql.gz"
  
  sudo podman exec taekwondo_db pg_dump -U "$DB_USER" "$DB_NAME" 2>/dev/null | gzip > "$BACKUP_FILE"
  
  if [ -s "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
    log "✅ Backup berhasil: $BACKUP_FILE ($BACKUP_SIZE)"
  else
    log "❌ Backup gagal — file kosong"
    rm -f "$BACKUP_FILE"
  fi
  
  # Hapus backup lebih dari 7 hari
  DELETED_BACKUPS=$(find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +7 | wc -l)
  find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +7 -delete
  log "🗑️  Hapus $DELETED_BACKUPS backup lama (>7 hari)"
  
  # Info total backup
  TOTAL_BACKUP=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
  log "💾 Total storage backup: $TOTAL_BACKUP"
}

# ============================================================
# 5. HAPUS PODMAN CONTAINER STOPPED LAMA
# ============================================================
cleanup_containers() {
  log "=== [5/7] CLEANUP CONTAINER STOPPED ==="
  
  STOPPED=$(sudo podman ps -a --filter "status=exited" --format "{{.Names}}" | grep -v "taekwondo_" | wc -l)
  if [ "$STOPPED" -gt "0" ]; then
    sudo podman container prune -f 2>&1 | tee -a "$LOG_FILE"
    log "🗑️  Hapus $STOPPED container yang sudah berhenti"
  else
    log "✅ Tidak ada container stopped yang perlu dibersihkan"
  fi
}

# ============================================================
# 6. CEK KONEKSI DATABASE
# ============================================================
check_database() {
  log "=== [6/7] CEK DATABASE ==="
  
  DB_STATUS=$(sudo podman exec taekwondo_db pg_isready -U "$DB_USER" -d "$DB_NAME" 2>&1)
  if echo "$DB_STATUS" | grep -q "accepting connections"; then
    log "✅ Database PostgreSQL: OK"
  else
    log "🔴 Database tidak responsif: $DB_STATUS"
    sudo podman restart taekwondo_db
    sleep 10
    log "   Database direstart."
  fi
}

# ============================================================
# 7. LAPORAN RINGKASAN
# ============================================================
summary_report() {
  log "=== [7/7] LAPORAN AKHIR ==="
  
  DISK_USAGE=$(df / | tail -1 | awk '{print $5}')
  DISK_AVAIL=$(df -h / | tail -1 | awk '{print $4}')
  STORAGE_SIZE=$(du -sh "$STORAGE_PATH" 2>/dev/null | cut -f1 || echo "N/A")
  BACKUP_COUNT=$(ls "$BACKUP_DIR"/db_backup_*.sql.gz 2>/dev/null | wc -l)
  UPTIME=$(uptime -p 2>/dev/null || uptime)
  
  log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log "📊 Disk: $DISK_USAGE terpakai, sisa $DISK_AVAIL"
  log "📁 Storage media: $STORAGE_SIZE"
  log "💾 Jumlah backup DB: $BACKUP_COUNT file"
  log "⏱️  Uptime server: $UPTIME"
  log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log "✅ Maintenance selesai."
}

# ============================================================
# JALANKAN SEMUA
# ============================================================
log "════════════════════════════════════════════"
log "🔧 MULAI MAINTENANCE OTOMATIS — White Tiger"
log "════════════════════════════════════════════"

rotate_logs
check_containers
cleanup_storage
backup_database
cleanup_containers
check_database
summary_report

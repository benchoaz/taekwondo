#!/bin/bash
# Script Deployment ke VPS
PASS='river-22#-river'
HOST="ubuntu@43.133.143.39"
SSH_OPTS="-o StrictHostKeyChecking=no"

echo "1. Mempersiapkan archive project..."
cd /home/beni/taekwondo
tar --exclude='taekwondo-app/node_modules' --exclude='taekwondo-app/.next' --exclude='.git' -czf taekwondo_deploy.tar.gz taekwondo-app/ docker-compose.yml

echo "2. Mengirim file ke VPS..."
sshpass -p "$PASS" scp $SSH_OPTS taekwondo_deploy.tar.gz $HOST:/home/ubuntu/

# Kirim file secrets (tidak masuk git) ke VPS
if [ -f "taekwondo-app/.env.secrets" ]; then
  echo "2b. Mengirim .env.secrets ke VPS..."
  sshpass -p "$PASS" scp $SSH_OPTS taekwondo-app/.env.secrets $HOST:/home/ubuntu/taekwondo-app/.env.secrets
fi

echo "3. Mengeksekusi command di VPS..."
sshpass -p "$PASS" ssh $SSH_OPTS $HOST "
  cd /home/ubuntu
  
  # Buat folder storage untuk volume docker jika belum ada
  mkdir -p /home/ubuntu/taekwondo_storage
  
  # Ekstrak file
  tar -xzf taekwondo_deploy.tar.gz
  
  # Lakukan Backup Database sebelum mengubah apapun!
  echo 'Melakukan backup database otomatis...'
  echo '$PASS' | sudo -S podman exec taekwondo_db pg_dump -U taekwondo_user -d taekwondo_academy > /home/ubuntu/taekwondo_storage/backup_\$(date +%Y%m%d_%H%M%S).sql || true

  # Hentikan dan hapus kontainer & image lama untuk memaksakan build baru
  echo '$PASS' | sudo -S podman stop taekwondo_web taekwondo_web_v3 || true
  echo '$PASS' | sudo -S podman rm -f taekwondo_web taekwondo_web_v3 || true
  echo '$PASS' | sudo -S podman rmi -f localhost/ubuntu_web:latest ubuntu_web:latest || true
  echo '$PASS' | sudo -S podman-compose down || true

  # Jalankan podman compose (build ulang) dengan sudo
  echo '$PASS' | sudo -S podman-compose up -d --build
  
  echo 'Menunggu container web siap (10 detik)...'
  sleep 10
  
  # Eksekusi migrasi database di dalam container dengan sudo
  WEB_CONTAINER=\$(echo '$PASS' | sudo -S podman ps --filter 'name=web' --format '{{.ID}}' | head -n 1)
  if [ -n \"\$WEB_CONTAINER\" ]; then
    echo '$PASS' | sudo -S podman exec \$WEB_CONTAINER npx prisma migrate deploy
  fi
"
echo "Deployment Selesai!"

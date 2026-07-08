#!/bin/bash
# Script Deployment ke VPS
export SSHPASS='river-22#-river'
HOST="ubuntu@43.133.143.39"
SSH_OPTS="-o StrictHostKeyChecking=no"

echo "1. Mempersiapkan archive project..."
cd /home/beni/taekwondo
tar --exclude='taekwondo-app/node_modules' --exclude='taekwondo-app/.next' --exclude='.git' -czf taekwondo_deploy.tar.gz taekwondo-app/ docker-compose.yml

echo "2. Mengirim file ke VPS..."
sshpass -e scp $SSH_OPTS taekwondo_deploy.tar.gz $HOST:/home/ubuntu/

echo "3. Mengeksekusi command di VPS..."
sshpass -e ssh $SSH_OPTS $HOST "
  cd /home/ubuntu
  
  # Buat folder storage untuk volume docker jika belum ada
  mkdir -p /home/ubuntu/taekwondo_storage
  
  # Ekstrak file
  tar -xzf taekwondo_deploy.tar.gz
  
  # Jalankan podman compose (build ulang) dengan sudo
  sudo podman-compose up -d --build
  
  echo 'Menunggu container web siap (10 detik)...'
  sleep 10
  
  # Eksekusi migrasi database di dalam container dengan sudo
  sudo podman exec taekwondo_web npx prisma migrate deploy
  
  # Eksekusi migrasi data fisik yang baru kita buat
"
echo "Deployment Selesai!"

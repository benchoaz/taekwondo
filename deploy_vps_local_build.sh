#!/bin/bash
export SSHPASS='river-22#-river'
HOST="ubuntu@43.133.143.39"
SSH_OPTS="-o StrictHostKeyChecking=no"

echo "1. Membangun container image secara lokal..."
cd /home/beni/taekwondo/taekwondo-app
podman build -f Containerfile -t taekwondo_web_local:latest .

echo "2. Menyimpan image ke file tar..."
cd /home/beni/taekwondo
rm -f taekwondo_web.tar && podman save taekwondo_web_local:latest -o taekwondo_web.tar

echo "3. Mengirim image tar dan konfigurasi ke VPS..."
sshpass -e scp $SSH_OPTS taekwondo_web.tar docker-compose.yml $HOST:/home/ubuntu/

echo "4. Mengeksekusi command di VPS..."
sshpass -e ssh $SSH_OPTS $HOST "
  cd /home/ubuntu
  
  # Load image yang sudah di-build dari lokal
  echo 'Memuat image ke dalam podman VPS...'
  podman load -i taekwondo_web.tar
  
  # Edit docker-compose.yml untuk menggunakan image lokal (menghapus blok build)
  sed -i '/build:/d' docker-compose.yml
  sed -i '/context:/d' docker-compose.yml
  sed -i '/dockerfile:/d' docker-compose.yml
  sed -i 's/container_name: taekwondo_web/image: taekwondo_web_local:latest\\n    container_name: taekwondo_web/g' docker-compose.yml
  
  # Jalankan podman compose tanpa build
  echo 'Menjalankan ulang layanan web...'
  podman-compose down && podman-compose up -d
  
  echo 'Menunggu container siap (10 detik)...'
  sleep 10
  
  # Eksekusi migrasi
  podman exec taekwondo_web npx prisma migrate deploy
"
echo "Deployment Selesai!"

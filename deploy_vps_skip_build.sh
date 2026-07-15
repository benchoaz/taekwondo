#!/bin/bash
export SSHPASS='river-22#-river'
HOST="ubuntu@43.133.143.39"
SSH_OPTS="-o StrictHostKeyChecking=no"

echo "2. Menyimpan image ke file tar..."
cd /home/beni/taekwondo
podman save taekwondo_web_local:latest -o taekwondo_web.tar

echo "3. Mengirim image tar dan konfigurasi ke VPS..."
sshpass -e scp $SSH_OPTS taekwondo_web.tar docker-compose.yml $HOST:/home/ubuntu/

echo "4. Mengeksekusi command di VPS..."
sshpass -e ssh $SSH_OPTS $HOST "
  cd /home/ubuntu
  
  echo 'Memuat image ke dalam podman VPS...'
  podman load -i taekwondo_web.tar
  
  sed -i '/build:/d' docker-compose.yml
  sed -i '/context:/d' docker-compose.yml
  sed -i '/dockerfile:/d' docker-compose.yml
  sed -i 's/container_name: taekwondo_web_v3/image: taekwondo_web_local:latest\\n    container_name: taekwondo_web_v3/g' docker-compose.yml
  
  echo 'Menjalankan ulang layanan web...'
  podman-compose up -d
  
  echo 'Menunggu container siap (10 detik)...'
  sleep 10
  
  podman exec taekwondo_web_v3 npx prisma migrate deploy
  podman exec taekwondo_web_v3 npx tsx scripts/migrate_physical_data.ts
"
echo "Deployment Selesai!"

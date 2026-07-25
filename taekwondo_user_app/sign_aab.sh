#!/bin/bash
# Script untuk menandatangani berkas AAB yang sudah ada menggunakan jarsigner

AAB_PATH=$1

if [ -z "$AAB_PATH" ]; then
  echo "Penggunaan: ./sign_aab.sh <path_ke_file_aab>"
  exit 1
fi

if [ ! -f "$AAB_PATH" ]; then
  echo "Error: Berkas $AAB_PATH tidak ditemukan."
  exit 1
fi

echo "1. Menghapus tanda tangan lama (Unsigning AAB)..."
python3 unsign.py "$AAB_PATH"

echo "2. Menandatangani AAB menggunakan jarsigner..."
jarsigner -verbose \
  -sigalg SHA256withRSA \
  -digestalg SHA-256 \
  -keystore android/app/key.jks \
  -storepass whitetigerkraksaan321 \
  -keypass whitetigerkraksaan321 \
  "$AAB_PATH" \
  key

echo "3. Memverifikasi tanda tangan..."
jarsigner -verify "$AAB_PATH"

echo "Selesai! Berkas AAB Anda telah ditandatangani dan siap diunggah ke Play Store: $AAB_PATH"

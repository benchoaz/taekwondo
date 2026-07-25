#!/bin/bash
set -e
echo "Starting NDK setup..."
rm -f /home/beni/ndk.zip
rm -rf /home/beni/development/ndk/27.0.12077973
rm -rf /home/beni/development/ndk/android-ndk-r27d

echo "Downloading NDK r27d..."
wget -q --show-progress=off https://dl.google.com/android/repository/android-ndk-r27d-linux.zip -O /home/beni/ndk.zip

echo "Extracting NDK..."
unzip -q /home/beni/ndk.zip -d /home/beni/development/ndk/

echo "Renaming folder to 27.0.12077973..."
mv /home/beni/development/ndk/android-ndk-r27d /home/beni/development/ndk/27.0.12077973

echo "Cleaning up zip..."
rm -f /home/beni/ndk.zip
echo "NDK Setup Completed successfully!"

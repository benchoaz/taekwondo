import sys
import zipfile
import os

def unsign(aab_path):
    temp_path = aab_path + ".temp"
    print(f"Membuka berkas {aab_path}...")
    with zipfile.ZipFile(aab_path, 'r') as yin:
        with zipfile.ZipFile(temp_path, 'w', zipfile.ZIP_DEFLATED) as yout:
            for item in yin.infolist():
                name = item.filename
                # Skip signature files
                if name.startswith("META-INF/") and (
                    name.endswith(".SF") or 
                    name.endswith(".RSA") or 
                    name.endswith(".DSA") or 
                    name.endswith(".EC")
                ):
                    print(f"Menghapus berkas tanda tangan: {name}")
                    continue
                yout.writestr(item, yin.read(name))
    os.replace(temp_path, aab_path)
    print("Selesai menghapus tanda tangan lama!")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 unsign.py <path_to_aab>")
        sys.exit(1)
    unsign(sys.argv[1])

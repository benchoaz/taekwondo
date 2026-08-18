# Checklist Audit & Perbaikan Rilis Google Play Store (taekwondo_user_app)

Dokumen ini berisi rangkuman audit, perbaikan otomatis yang telah dilakukan, serta langkah manual yang perlu dilakukan untuk rilis aplikasi **White Tiger Kraksaan** di Google Play Store.

---

## 1. Summary Audit & Perbaikan Otomatis

### A. Perbaikan Analisis & Kode Dart (`lib/`)
- [x] **Flutter Analyze Clean**: Berhasil memperbaiki 17 peringatan/error hingga **0 issues found** (`flutter analyze` 100% clean).
- [x] **Geolocator API Deprecated**: Memperbarui `desiredAccuracy: LocationAccuracy.high` ke `locationSettings: const LocationSettings(accuracy: LocationAccuracy.high)` pada `member_attendance_service.dart`.
- [x] **Async Context & State Mounted Checks**: Menambahkan pemeriksaan `if (context.mounted)` dan `if (!mounted) return;` sebelum memanggil `ScaffoldMessenger` pada `member_dashboard_screen.dart` & `profile_screen.dart` untuk mencegah *crash/memory leak* saat navigasi berpindah.
- [x] **Flow Control Format**: Menambahkan *curly braces* `{}` pada struktur kontrol alur di `profile_service.dart`.
- [x] **Web Libraries Protection**: Menambahkan anotasi `ignore_for_file` yang aman untuk pengolahan iframe video di `web_iframe_web.dart`.
- [x] **Test Cleanliness**: Memperbarui `test/dashboard_test.dart` agar terbebas dari *lint warnings*.

### B. Konfigurasi Android & Play Store (`android/`)
- [x] **App Name / Label**: Diubah dari `WTK V1` menjadi nama resmi **`White Tiger Kraksaan`** pada `AndroidManifest.xml`.
- [x] **NDK Version Alignment**: Disesuaikan dari `28.2.13676358` menjadi `27.0.12077973` pada `android/app/build.gradle.kts` agar cocok dengan NDK lokal & lingkungan CI/CD GitHub Actions.
- [x] **Signing Config Keystore**: Konfigurasi `key.properties` & `key.jks` terintegrasi dengan aman pada `build.gradle.kts` untuk menghasilkan build terenkripsi siap rilis.
- [x] **Application ID**: Berhasil dipastikan unik `com.whitetigerkraksaan.member`.
- [x] **SDK & Compatibility**: Target Android SDK (API 34+) memenuhi standar kelayakan rilis Google Play Store terbaru.

---

## 2. Langkah Manual yang Perlu Dilakukan di Play Console

1. **Commit & Push ke GitHub**:
   - Commit seluruh perubahan terbaru ke branch `main`:
     ```bash
     git add .
     git commit -m "fix: audit codebase & preparation for Play Store release"
     git push origin main
     ```
2. **Download File Artifact `.aab` dari GitHub Actions**:
   - Buka halaman **GitHub Actions** repositori (`Build Flutter AAB`).
   - Setelah workflow `Build AAB` selesai (Status Green Check), unduh file artifact `taekwondo-release-aab` yang berisi `app-release.aab`.
3. **Persiapan Google Play Console**:
   - Buka [Google Play Console](https://play.google.com/console).
   - Buat Aplikasi Baru: **White Tiger Kraksaan**.
   - Isi Data Aplikasi (Deskripsi, Kategori, Logo 512x512, Feature Graphic 1024x500, Screenshot HP minimal 2).
   - Upload file `app-release.aab` pada menu **Internal Testing** atau **Production**.
   - Isi kuesioner **Content Rating**, **Privacy Policy**, dan **Target Audience**.

---

## 3. Hasil Akhir Status Build

- **Status Code Analysis**: 🟢 **PASSED (0 Issues)**
- **Metode Build**: GitHub Actions Workflow (`.github/workflows/build-aab.yml`)
- **Lokasi File Bundle (.aab)**: Artifact GitHub Actions (`taekwondo-release-aab`) / `build/app/outputs/bundle/release/app-release.aab`

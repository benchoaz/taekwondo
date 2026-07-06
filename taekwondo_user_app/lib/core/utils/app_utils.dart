import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

/// Format angka ke format mata uang Rupiah.
/// Contoh: 150000 → 'Rp 150.000'
String formatRupiah(num amount) {
  final formatter = NumberFormat.currency(
    locale: 'id_ID',
    symbol: 'Rp ',
    decimalDigits: 0,
  );
  return formatter.format(amount);
}

/// Format [DateTime] ke string tanggal bahasa Indonesia.
/// Contoh: DateTime(2026,7,6) → '6 Juli 2026'
String formatDate(DateTime date) {
  return DateFormat('d MMMM yyyy', 'id_ID').format(date);
}

/// Format [DateTime] ke string tanggal pendek.
/// Contoh: DateTime(2026,7,6) → '6 Jul 2026'
String formatDateShort(DateTime date) {
  return DateFormat('d MMM yyyy', 'id_ID').format(date);
}

/// Format [DateTime] ke label bulan + tahun.
/// Contoh: DateTime(2026,7,1) → 'Juli 2026'
String formatMonthYear(int month, int year) {
  final date = DateTime(year, month);
  return DateFormat('MMMM yyyy', 'id_ID').format(date);
}

/// Mendapatkan warna berdasarkan nama sabuk Taekwondo.
Color getBeltColor(String? belt) {
  final b = (belt ?? '').toLowerCase();
  if (b.contains('hitam') || b.contains('black')) return const Color(0xFF0F172A);
  if (b.contains('merah') || b.contains('red')) return const Color(0xFFE10600);
  if (b.contains('biru') || b.contains('blue')) return const Color(0xFF3B82F6);
  if (b.contains('hijau') || b.contains('green')) return const Color(0xFF22C55E);
  if (b.contains('kuning') || b.contains('yellow')) return const Color(0xFFFFD700);
  if (b.contains('putih') || b.contains('white')) return const Color(0xFFF8FAFC);
  return const Color(0xFF64748B); // Abu-abu default
}

/// Mendapatkan nama singkat bulan dalam bahasa Indonesia.
/// [month] adalah angka 1–12.
String getMonthName(int month) {
  const names = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  if (month < 1 || month > 12) return '-';
  return names[month - 1];
}

/// Hitung umur dari [dateOfBirth] ke saat ini.
int calculateAge(DateTime dateOfBirth) {
  final now = DateTime.now();
  int age = now.year - dateOfBirth.year;
  if (now.month < dateOfBirth.month ||
      (now.month == dateOfBirth.month && now.day < dateOfBirth.day)) {
    age--;
  }
  return age;
}

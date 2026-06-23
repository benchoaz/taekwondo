import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.lightBg,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: AppTheme.primaryRed, width: 2),
                image: const DecorationImage(
                  image: NetworkImage(
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuCpkSBVjy4FmHK14ytpPJR4_Wre-HaVv-QBoz9cI3y7tHYX900QzveSpjz1fjzNBGTW89g11rVsouS3IVeJzlwZAFpOYa4jh5-MTaQNV7UBer9t9qC1QWtAAs3fYF5H_NXxOHXrrfVghUIMAqHMUK5UwI4dc-bFDL9JlG9_textTZLTylaIkfV-qqqbvPUpkKKdsNWVEBXVrgfLD0O2d6g51VG0mQofkh4-ZWDPBXm3ojK_hMiGtncJvbJiCF7PVcFa9CU8DsAemJ4'
                  ),
                  fit: BoxFit.cover,
                ),
              ),
            ),
            const SizedBox(width: 12),
            const Text(
              'DOJO MASTER',
              style: TextStyle(
                color: AppTheme.darkBg,
                fontWeight: FontWeight.w900,
                fontSize: 18,
                letterSpacing: -0.5,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: AppTheme.darkBg),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Balance Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF001b44), // Primary Dark Blue from Stitch
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'TOTAL TAGIHAN AKTIF',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.5,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Rp 150.000',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 36,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      ElevatedButton(
                        onPressed: () {},
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFb80e21), // Secondary Red
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: const Text('BAYAR SEKARANG'),
                      ),
                      const SizedBox(width: 12),
                      OutlinedButton(
                        onPressed: () {},
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white,
                          side: const BorderSide(color: Colors.white),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: const Text('LIHAT RIWAYAT'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Member Status Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Status Anggota',
                    style: TextStyle(
                      color: AppTheme.darkBg,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Aktif • Sabuk Hitam (Dan 1)',
                    style: TextStyle(
                      color: Colors.grey.shade600,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Belt Indicator Mockup
                  Container(
                    height: 24,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.grey.shade300),
                    ),
                    child: Row(
                      children: [
                        Expanded(child: Container(decoration: const BoxDecoration(color: Colors.black, borderRadius: BorderRadius.horizontal(left: Radius.circular(12))))),
                        Expanded(child: Container(color: const Color(0xFFb80e21))),
                        Expanded(child: Container(color: const Color(0xFF001b44))),
                        Expanded(
                          child: Container(
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.horizontal(right: Radius.circular(12)),
                            ),
                            alignment: Alignment.center,
                            child: const Text(
                              'ELIT',
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF001b44)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Financial Categories
            Row(
              children: [
                const Icon(Icons.payments, color: Color(0xFF001b44)),
                const SizedBox(width: 8),
                const Text(
                  'Riwayat SPP',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.darkBg,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        selectedItemColor: AppTheme.primaryRed,
        unselectedItemColor: Colors.grey,
        showUnselectedLabels: true,
        selectedFontSize: 10,
        unselectedFontSize: 10,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'Dasbor'),
          BottomNavigationBarItem(icon: Icon(Icons.account_balance_wallet), label: 'Keuangan'),
          BottomNavigationBarItem(icon: Icon(Icons.calendar_today), label: 'Jadwal'),
          BottomNavigationBarItem(icon: Icon(Icons.qr_code_scanner), label: 'Absensi'),
          BottomNavigationBarItem(icon: Icon(Icons.campaign), label: 'Berita'),
        ],
      ),
    );
  }
}

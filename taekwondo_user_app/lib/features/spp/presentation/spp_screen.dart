import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

import 'package:go_router/go_router.dart';

import '../../auth/domain/user_model.dart';
import '../../auth/data/auth_provider.dart';

// Neo-Brutalism Theme Colors
const Color m3OnPrimaryFixedVariant = Color(0xFF003DAA);
const Color nbSurface = Color(0xFFF8F9FA);
const Color nbSurfaceVariant = Color(0xFFE1E3E4);
const Color nbBlack = Color(0xFF191C1D); // on-surface
const Color nbOutline = Color(0xFF737687);
const Color nbPrimary = Color(0xFF0052DC);
const Color nbSecondary = Color(0xFFBC000A);
const Color nbTertiaryFixed = Color(0xFFFFE08B);
const Color nbOnTertiaryFixed = Color(0xFF241A00);
const Color nbPrimaryFixed = Color(0xFFDBE1FF);

class SppScreen extends ConsumerStatefulWidget {
  final UserModel user;
  const SppScreen({super.key, required this.user});

  @override
  ConsumerState<SppScreen> createState() => _SppScreenState();
}

class _SppScreenState extends ConsumerState<SppScreen> {
  int _selectedMethodIndex = 1; // Default GOPAY/OVO

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: nbSurface,
      body: Stack(
        children: [
          // Background Pattern
          Positioned.fill(
            child: CustomPaint(painter: DottedBackgroundPainter()),
          ),
          
          Column(
            children: [
              _buildTopAppBar(),
              Expanded(
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildHeader(),
                      const SizedBox(height: 24),
                      _buildNeoBrutalCard(),
                      const SizedBox(height: 24),
                      _buildPaymentMethods(),
                      const SizedBox(height: 24),
                      _buildHistory(),
                      const SizedBox(height: 24),
                      _buildInfoTooltip(),
                      const SizedBox(height: 100), // padding for bottom nav
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Floating Bottom Nav Bar
          Positioned(
            bottom: 0, left: 0, right: 0,
            child: _buildBottomNavBar(),
          ),
        ],
      ),
    );
  }

  Widget _buildTopAppBar() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12).copyWith(top: 56),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4, offset: const Offset(0, 2)),
          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 24, offset: const Offset(0, 12)),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 40, height: 40,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: nbPrimary, width: 2),
                  image: DecorationImage(
                    fit: BoxFit.cover,
                    image: NetworkImage('https://ui-avatars.com/api/?name=${widget.user.name}&background=0052dc&color=fff'),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Text(
                'MASTER DASHBOARD',
                style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.5, color: nbPrimary),
              ),
            ],
          ),
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.notifications_outlined, color: nbPrimary),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          'Iuran SPP',
          style: GoogleFonts.hankenGrotesk(fontSize: 24, fontWeight: FontWeight.w900, color: nbBlack),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: nbTertiaryFixed,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: nbOnTertiaryFixed, width: 2),
          ),
          child: Text(
            'LEVEL 12: BLUE BELT',
            style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.bold, color: nbOnTertiaryFixed),
          ),
        ),
      ],
    );
  }

  Widget _buildNeoBrutalCard() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: nbBlack, width: 2),
        boxShadow: const [BoxShadow(color: nbSecondary, offset: Offset(4, 4))],
      ),
      child: Stack(
        children: [
          // Banner BELUM BAYAR
          Positioned(
            top: 0, right: 0,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: const BoxDecoration(
                color: nbSecondary,
                borderRadius: BorderRadius.only(topRight: Radius.circular(10), bottomLeft: Radius.circular(10)),
                border: Border(left: BorderSide(color: nbBlack, width: 2), bottom: BorderSide(color: nbBlack, width: 2)),
              ),
              child: Text(
                'BELUM BAYAR',
                style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 1.5),
              ),
            ),
          ),
          
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('TAGIHAN NOVEMBER 2023', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFF424655), letterSpacing: 1.5)),
                const SizedBox(height: 4),
                Text('Rp 250.000', style: GoogleFonts.hankenGrotesk(fontSize: 36, fontWeight: FontWeight.w900, color: nbBlack)),
                const SizedBox(height: 24),
                Container(
                  padding: const EdgeInsets.only(top: 16, bottom: 16),
                  decoration: const BoxDecoration(
                    border: Border(top: BorderSide(color: nbSurfaceVariant, width: 2)),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Iuran Bulanan (SPP)', style: GoogleFonts.hankenGrotesk(fontSize: 14, color: const Color(0xFF424655))),
                          Text('Rp 200.000', style: GoogleFonts.hankenGrotesk(fontSize: 20, fontWeight: FontWeight.bold, color: nbBlack)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Biaya Perlengkapan', style: GoogleFonts.hankenGrotesk(fontSize: 14, color: const Color(0xFF424655))),
                          Text('Rp 50.000', style: GoogleFonts.hankenGrotesk(fontSize: 20, fontWeight: FontWeight.bold, color: nbBlack)),
                        ],
                      ),
                    ],
                  ),
                ),
                GestureDetector(
                  onTap: () async {
                    // Navigate to midtrans/xendit logic
                    final url = Uri.parse('https://app.sandbox.midtrans.com/snap/v2/vtweb/mock');
                    if (await canLaunchUrl(url)) {
                      await launchUrl(url);
                    }
                  },
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    decoration: BoxDecoration(
                      color: nbPrimary,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: nbBlack, width: 2),
                      boxShadow: const [BoxShadow(color: nbPrimary, offset: Offset(4, 4))], // neo-brutal-shadow-blue
                    ),
                    alignment: Alignment.center,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.payments, color: Colors.white),
                        const SizedBox(width: 12),
                        Text('BAYAR SEKARANG', style: GoogleFonts.spaceGrotesk(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 1.5)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentMethods() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4),
          child: Text('METODE PEMBAYARAN', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFF424655), letterSpacing: 1.5)),
        ),
        const SizedBox(height: 12),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          child: Row(
            children: [
              _buildMethodCard(0, 'TRANSFER BANK', Icons.account_balance),
              const SizedBox(width: 12),
              _buildMethodCard(1, 'GOPAY / OVO', Icons.account_balance_wallet),
              const SizedBox(width: 12),
              _buildMethodCard(2, 'QRIS PAY', Icons.qr_code_2),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMethodCard(int index, String title, IconData icon) {
    final isSelected = _selectedMethodIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedMethodIndex = index),
      child: Container(
        width: 120,
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: isSelected ? nbPrimaryFixed : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: isSelected ? nbPrimary : nbBlack, width: 2),
        ),
        child: Column(
          children: [
            Icon(icon, size: 32, color: isSelected ? nbPrimary : nbBlack.withOpacity(0.6)),
            const SizedBox(height: 8),
            Text(title, style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.bold, color: nbBlack)),
          ],
        ),
      ),
    );
  }

  Widget _buildHistory() {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('RIWAYAT PEMBAYARAN', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFF424655), letterSpacing: 1.5)),
            Text('LIHAT SEMUA', style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.bold, color: nbPrimary, letterSpacing: 1.5)),
          ],
        ),
        const SizedBox(height: 12),
        _buildHistoryItem('Oktober 2023', '05 Okt 2023'),
        const SizedBox(height: 8),
        _buildHistoryItem('September 2023', '02 Sep 2023'),
        const SizedBox(height: 8),
        _buildHistoryItem('Agustus 2023', '07 Agu 2023'),
      ],
    );
  }

  Widget _buildHistoryItem(String month, String date) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: nbBlack, width: 2),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 48, height: 48,
                decoration: BoxDecoration(
                  color: const Color(0xFF003DAA),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: nbBlack, width: 2),
                ),
                child: const Icon(Icons.calendar_today, color: nbPrimary),
              ),
              const SizedBox(height: 16),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(month, style: GoogleFonts.hankenGrotesk(fontSize: 20, fontWeight: FontWeight.bold, color: nbBlack)),
                  Text('Lunas • $date', style: GoogleFonts.hankenGrotesk(fontSize: 14, color: const Color(0xFF424655))),
                ],
              ),
            ],
          ),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.green.shade100,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: Colors.green.shade300),
                ),
                child: Text('PAID', style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.green.shade700)),
              ),
              const SizedBox(width: 12),
              const Icon(Icons.download, color: Color(0xFF424655)),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildInfoTooltip() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFB4C5FF).withOpacity(0.2), // primary-fixed-dim/20
        border: Border.all(color: const Color(0xFF2B6BFF), width: 2), // primary-container
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.info, color: nbPrimary),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              'Pembayaran dilakukan paling lambat tanggal 10 setiap bulannya untuk menghindari denda administrasi.',
              style: GoogleFonts.hankenGrotesk(fontSize: 14, color: m3OnPrimaryFixedVariant),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomNavBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.8),
        border: const Border(top: BorderSide(color: Colors.white30)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 12, offset: const Offset(0, -4))],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          GestureDetector(
            onTap: () => context.go('/'),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.home_outlined, color: nbSecondary),
                Text('Home', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold, color: nbSecondary)),
              ],
            ),
          ),
          GestureDetector(
            onTap: () => context.go('/quest'),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.transparent,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Image.asset('assets/images/daily_quest.png', width: 20, height: 20, color: nbOutline, errorBuilder: (_,__,___) => const Icon(Icons.stars, color: nbOutline, size: 20)),
                      const SizedBox(width: 4),
                      Text('Daily Quest', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold, color: nbOutline)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.person_outline, color: nbSecondary),
              Text('Profile', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold, color: nbSecondary)),
            ],
          ),
        ],
      ),
    );
  }
}

class DottedBackgroundPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = const Color(0xFFE1E3E4); // nbSurfaceVariant
    const double spacing = 20.0;
    const double radius = 1.0;

    for (double y = 0; y < size.height; y += spacing) {
      for (double x = 0; x < size.width; x += spacing) {
        canvas.drawCircle(Offset(x, y), radius, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

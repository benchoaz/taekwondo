import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../auth/domain/user_model.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_constants.dart';

// M3 Palette Extracted from HTML
const Color m3Background = Color(0xFFF8F9FA);
const Color m3Surface = Color(0xFFF8F9FA);
const Color m3OnSurface = Color(0xFF191C1D);
const Color m3OnSurfaceVariant = Color(0xFF424655);
const Color m3Primary = Color(0xFF0052DC);
const Color m3PrimaryFixed = Color(0xFFDBE1FF);
const Color m3PrimaryContainer = Color(0xFF2B6BFF);
const Color m3Secondary = Color(0xFFBC000A);
const Color m3TertiaryFixed = Color(0xFFFFE08B);
const Color m3OnTertiaryFixed = Color(0xFF241A00);
const Color m3OutlineVariant = Color(0xFFC3C6D8);

class SppScreen extends ConsumerStatefulWidget {
  final UserModel user;
  const SppScreen({super.key, required this.user});

  @override
  ConsumerState<SppScreen> createState() => _SppScreenState();
}

class _SppScreenState extends ConsumerState<SppScreen> {
  bool _isLoading = true;
  List<dynamic> _invoices = [];
  String? _error;
  int _selectedMethodIndex = 0;

  @override
  void initState() {
    super.initState();
    _fetchInvoices();
  }

  Future<void> _fetchInvoices() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final dio = ref.read(dioProvider);
      final response = await dio.get('/spp', queryParameters: {'userId': widget.user.id});

      if (response.statusCode == 200) {
        setState(() {
          _invoices = response.data;
          _isLoading = false;
        });
      } else {
        setState(() {
          _error = 'Gagal memuat data SPP';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Terjadi kesalahan koneksi';
        _isLoading = false;
      });
    }
  }

  Future<void> _launchPaymentUrl(String? paymentId) async {
    if (paymentId == null) return;
    final uri = Uri.parse('${ApiConstants.baseUrl.replaceAll("/api", "")}/payment/$paymentId');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Tidak dapat membuka link pembayaran')));
      }
    }
  }

  String _getMonthName(int month) {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return month >= 1 && month <= 12 ? months[month - 1] : '';
  }

  @override
  Widget build(BuildContext context) {
    final unpaidInvoices = _invoices.where((inv) => inv['status'] != 'PAID').toList();
    final paidInvoices = _invoices.where((inv) => inv['status'] == 'PAID').toList();
    final activeInvoice = unpaidInvoices.isNotEmpty ? unpaidInvoices.first : null;

    return Scaffold(
      backgroundColor: m3Background,
      body: Stack(
        children: [
          // Background Pattern (dots)
          Positioned.fill(
            child: Opacity(
              opacity: 0.5,
              child: CustomPaint(painter: GridPatternPainter()),
            ),
          ),
          
          // Main Scrollable Content
          RefreshIndicator(
            onRefresh: _fetchInvoices,
            color: m3Primary,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.only(left: 20, right: 20, top: 112, bottom: 120),
              child: _isLoading 
                ? const Center(child: Padding(padding: EdgeInsets.only(top: 100), child: CircularProgressIndicator(color: m3Primary)))
                : _error != null 
                  ? _buildErrorState()
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildHeaderSection(),
                        const SizedBox(height: 24),
                        if (activeInvoice != null)
                          _buildCurrentStatusCard(activeInvoice)
                        else
                          _buildAllPaidCard(),
                        
                        const SizedBox(height: 24),
                        _buildPaymentMethods(),
                        
                        const SizedBox(height: 24),
                        _buildHistorySection(paidInvoices),
                        
                        const SizedBox(height: 24),
                        _buildInfoTooltip(),
                      ],
                    ),
            ),
          ),

          // Fixed Top App Bar
          Positioned(
            top: 0, left: 0, right: 0,
            child: _buildTopAppBar(),
          ),

          // Back Button override in AppBar
          Positioned(
            top: 52, left: 8,
            child: IconButton(
              icon: const Icon(Icons.arrow_back, color: m3OnSurface),
              onPressed: () => Navigator.pop(context),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildTopAppBar() {
    return ClipRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 12.0, sigmaY: 12.0),
        child: Container(
          color: m3Surface.withOpacity(0.8),
          padding: const EdgeInsets.only(left: 56, right: 20, top: 56, bottom: 16),
          decoration: BoxDecoration(
            border: const Border(bottom: BorderSide(color: Color(0x4DC3C6D8))),
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 12, offset: const Offset(0, 4))
            ]
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
                      border: Border.all(color: m3Primary, width: 2),
                      image: DecorationImage(
                        fit: BoxFit.cover,
                        image: NetworkImage(widget.user.photoUrl ?? 'https://ui-avatars.com/api/?name=${widget.user.name}&background=0052dc&color=fff'),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    'MASTER DASHBOARD',
                    style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.5, color: m3Primary),
                  ),
                ],
              ),
              const Icon(Icons.notifications_outlined, color: m3Primary),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeaderSection() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(
          'Iuran SPP',
          style: GoogleFonts.hankenGrotesk(fontSize: 24, fontWeight: FontWeight.w900, color: m3OnSurface),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: m3TertiaryFixed,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: m3OnTertiaryFixed, width: 2),
          ),
          child: Text(
            (widget.user.currentBelt ?? 'SABUK MERAH').toUpperCase(),
            style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.bold, color: m3OnTertiaryFixed),
          ),
        )
      ],
    );
  }

  Widget _buildCurrentStatusCard(dynamic invoice) {
    final isOverdue = invoice['status'] == 'OVERDUE';
    final formatter = RegExp(r'\B(?=(\d{3})+(?!\d))');
    final amountStr = invoice['amount'].toString().replaceAllMapped(formatter, (match) => '.');

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: m3OnSurface, width: 2),
        boxShadow: [
          BoxShadow(color: m3Secondary, offset: const Offset(4, 4))
        ]
      ),
      child: Stack(
        children: [
          Positioned(
            top: 0, right: 0,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: isOverdue ? Colors.orange.shade700 : m3Secondary,
                border: const Border(left: BorderSide(color: m3OnSurface, width: 2), bottom: BorderSide(color: m3OnSurface, width: 2)),
                borderRadius: const BorderRadius.only(bottomLeft: Radius.circular(12), topRight: Radius.circular(14)),
              ),
              child: Text(
                isOverdue ? 'MENUNGGAK' : 'BELUM BAYAR',
                style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'TAGIHAN ${_getMonthName(invoice['month']).toUpperCase()} ${invoice['year']}',
                  style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold, color: m3OnSurfaceVariant),
                ),
                const SizedBox(height: 4),
                Text(
                  'Rp $amountStr',
                  style: GoogleFonts.hankenGrotesk(fontSize: 36, fontWeight: FontWeight.w900, color: m3OnSurface, letterSpacing: -1),
                ),
                const SizedBox(height: 24),
                Container(
                  padding: const EdgeInsets.only(top: 16),
                  decoration: const BoxDecoration(border: Border(top: BorderSide(color: Color(0xFFE1E3E4), width: 2))),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Iuran Bulanan (SPP)', style: GoogleFonts.hankenGrotesk(fontSize: 14, color: m3OnSurfaceVariant)),
                          Text('Rp $amountStr', style: GoogleFonts.hankenGrotesk(fontSize: 16, fontWeight: FontWeight.bold, color: m3OnSurface)),
                        ],
                      ),
                      // Hardcoded additional fee mapping based on HTML reference
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Biaya Perlengkapan', style: GoogleFonts.hankenGrotesk(fontSize: 14, color: m3OnSurfaceVariant)),
                          Text('Rp 0', style: GoogleFonts.hankenGrotesk(fontSize: 16, fontWeight: FontWeight.bold, color: m3OnSurface)),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                GestureDetector(
                  onTap: () => _launchPaymentUrl(invoice['paymentId']),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    decoration: BoxDecoration(
                      color: m3Primary,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: m3OnSurface, width: 2),
                      boxShadow: const [BoxShadow(color: m3Primary, offset: Offset(4, 4))]
                    ),
                    alignment: Alignment.center,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.payments, color: Colors.white),
                        const SizedBox(width: 12),
                        Text('BAYAR SEKARANG', style: GoogleFonts.spaceGrotesk(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
                      ],
                    ),
                  ),
                )
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildAllPaidCard() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: m3OnSurface, width: 2),
        boxShadow: [
          BoxShadow(color: Colors.green.shade600, offset: const Offset(4, 4))
        ]
      ),
      padding: const EdgeInsets.all(24),
      child: Center(
        child: Column(
          children: [
            Icon(Icons.check_circle, color: Colors.green.shade600, size: 64),
            const SizedBox(height: 16),
            Text('Semua Lunas!', style: GoogleFonts.hankenGrotesk(fontSize: 24, fontWeight: FontWeight.w900, color: m3OnSurface)),
            Text('Tidak ada tagihan bulan ini.', style: GoogleFonts.hankenGrotesk(fontSize: 14, color: m3OnSurfaceVariant)),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentMethods() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4),
          child: Text('METODE PEMBAYARAN', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold, color: m3OnSurfaceVariant)),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            _buildMethodItem(0, Icons.account_balance, 'TRANSFER BANK'),
            const SizedBox(width: 12),
            _buildMethodItem(1, Icons.account_balance_wallet, 'E-WALLET'),
            const SizedBox(width: 12),
            _buildMethodItem(2, Icons.qr_code_2, 'QRIS PAY'),
          ],
        )
      ],
    );
  }

  Widget _buildMethodItem(int index, IconData icon, String label) {
    final isSelected = _selectedMethodIndex == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedMethodIndex = index),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: isSelected ? m3PrimaryFixed : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: isSelected ? m3Primary : m3OnSurface, width: 2),
          ),
          child: Column(
            children: [
              Icon(icon, color: isSelected ? m3Primary : m3OnSurfaceVariant, size: 32),
              const SizedBox(height: 8),
              Text(
                label,
                textAlign: TextAlign.center,
                style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.bold, color: isSelected ? m3Primary : m3OnSurface),
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHistorySection(List<dynamic> paidInvoices) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Padding(
              padding: const EdgeInsets.only(left: 4),
              child: Text('RIWAYAT PEMBAYARAN', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold, color: m3OnSurfaceVariant)),
            ),
            Text('LIHAT SEMUA', style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.bold, color: m3Primary)),
          ],
        ),
        const SizedBox(height: 12),
        if (paidInvoices.isEmpty)
          Center(child: Padding(padding: const EdgeInsets.all(24), child: Text('Belum ada riwayat.', style: GoogleFonts.hankenGrotesk(color: m3OnSurfaceVariant))))
        else
          Column(
            children: paidInvoices.map((inv) {
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: m3OnSurface, width: 2),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 48, height: 48,
                          decoration: BoxDecoration(color: m3PrimaryFixed, borderRadius: BorderRadius.circular(8), border: Border.all(color: m3OnSurface, width: 2)),
                          child: const Icon(Icons.calendar_today, color: m3Primary),
                        ),
                        const SizedBox(width: 16),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('${_getMonthName(inv['month'])} ${inv['year']}', style: GoogleFonts.hankenGrotesk(fontSize: 16, fontWeight: FontWeight.bold, color: m3OnSurface)),
                            Text('Lunas', style: GoogleFonts.hankenGrotesk(fontSize: 14, color: m3OnSurfaceVariant)),
                          ],
                        )
                      ],
                    ),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(color: Colors.green.shade100, border: Border.all(color: Colors.green.shade300), borderRadius: BorderRadius.circular(4)),
                          child: Text('PAID', style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.green.shade700)),
                        ),
                        const SizedBox(width: 8),
                        const Icon(Icons.download, color: m3OnSurfaceVariant),
                      ],
                    )
                  ],
                ),
              );
            }).toList(),
          )
      ],
    );
  }

  Widget _buildInfoTooltip() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: m3PrimaryFixed.withOpacity(0.5),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: m3PrimaryContainer, width: 2),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.info, color: m3Primary),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'Pembayaran dilakukan paling lambat tanggal 10 setiap bulannya untuk menghindari denda administrasi.',
              style: GoogleFonts.hankenGrotesk(fontSize: 14, color: const Color(0xFF003DAA)),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.only(top: 100),
        child: Column(
          children: [
            Icon(Icons.error_outline, color: Colors.red.shade300, size: 48),
            const SizedBox(height: 16),
            Text(_error!, style: GoogleFonts.hankenGrotesk(color: m3OnSurfaceVariant)),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: _fetchInvoices, child: const Text('Coba Lagi'))
          ],
        ),
      ),
    );
  }
}

// Background Dots Painter
class GridPatternPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFFE1E3E4)
      ..strokeWidth = 1.0;
    for (double i = 0; i < size.width; i += 20) {
      for (double j = 0; j < size.height; j += 20) {
        canvas.drawCircle(Offset(i, j), 1.5, paint);
      }
    }
  }
  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../auth/domain/user_model.dart';
import '../../dashboard/data/spp_service.dart';

class SppScreen extends ConsumerStatefulWidget {
  final UserModel user;
  const SppScreen({super.key, required this.user});

  @override
  ConsumerState<SppScreen> createState() => _SppScreenState();
}

class _SppScreenState extends ConsumerState<SppScreen> {
  int? _expandedMonthIndex;

  final List<String> _months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  // Colors aligned with the dashboard theme
  static const Color darkBg = Color(0xFF0B1326);
  static const Color cardBg = Color(0xFF1E293B);
  static const Color textWhite = Colors.white;
  static const Color textGray = Color(0xFF94A3B8);
  static const Color brandRed = Color(0xFFE10600);
  static const Color goldAccent = Color(0xFFFACC15);

  @override
  Widget build(BuildContext context) {
    final sppListAsync = ref.watch(sppListProvider);
    final currentYear = DateTime.now().year;

    return Scaffold(
      backgroundColor: darkBg,
      body: sppListAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: brandRed)),
        error: (err, stack) => Center(child: Text('Gagal memuat SPP: $err', style: const TextStyle(color: Colors.white))),
        data: (invoices) {
          // Calculate unpaid invoices
          final currentYearUnpaid = invoices.where(
            (i) => i.year == currentYear && (i.status == 'UNPAID' || i.status == 'OVERDUE' || i.status == 'PENDING')
          ).toList();
          final totalUnpaid = currentYearUnpaid.fold<double>(0, (sum, item) => sum + item.amount);

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(sppListProvider);
            },
            color: brandRed,
            backgroundColor: cardBg,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
              padding: const EdgeInsets.fromLTRB(16, 20, 16, 120),
              child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Laporan SPP
                Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: Colors.green.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.green.withValues(alpha: 0.2)),
                      ),
                      child: const Icon(Icons.credit_card, color: Colors.green, size: 22),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'LAPORAN SPP $currentYear',
                            style: GoogleFonts.spaceGrotesk(
                              fontSize: 16,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                              letterSpacing: 0.5,
                            ),
                          ),
                          Text(
                            'Status iuran bulanan dari Januari s.d Desember',
                            style: GoogleFonts.hankenGrotesk(
                              fontSize: 11,
                              color: textGray,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Total Tunggakan
                if (currentYearUnpaid.isNotEmpty) ...[
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: cardBg,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: brandRed.withValues(alpha: 0.4), width: 1.5),
                      boxShadow: [
                        BoxShadow(
                          color: brandRed.withValues(alpha: 0.08),
                          blurRadius: 16,
                          offset: const Offset(0, 8),
                        )
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'TUNGGAKAN TAHUN $currentYear',
                                style: GoogleFonts.spaceGrotesk(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w900,
                                  color: brandRed,
                                  letterSpacing: 0.5,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Rp. ${totalUnpaid.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}',
                                style: GoogleFonts.spaceGrotesk(
                                  fontSize: 24,
                                  fontWeight: FontWeight.w900,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'SEGERA LUNASI IURAN YANG TERTUNDA',
                                style: GoogleFonts.hankenGrotesk(
                                  fontSize: 9,
                                  color: textGray,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: brandRed.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: brandRed.withValues(alpha: 0.2)),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            '${currentYearUnpaid.length}x',
                            style: GoogleFonts.spaceGrotesk(
                              fontWeight: FontWeight.w900,
                              color: brandRed,
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                ],

                Text(
                  'DAFTAR BULAN (JANUARI - DESEMBER)',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    color: textGray,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 12),

                // Month List
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _months.length,
                  itemBuilder: (context, index) {
                    final monthName = _months[index];
                    final SppInvoice inv = invoices.firstWhere(
                      (i) => i.month == (index + 1) && i.year == currentYear,
                      orElse: () => SppInvoice(id: '', month: index + 1, year: currentYear, amount: 0, status: 'NOT_BILLED'),
                    );
                    final isExpanded = _expandedMonthIndex == index;

                    Color cardBorderColor = Colors.white.withValues(alpha: 0.04);
                    Color iconColor = Colors.white24;
                    Color iconBgColor = Colors.white.withValues(alpha: 0.03);
                    Widget statusBadge = Container();
                    String amountText = '-';

                    if (inv != null && inv.status != 'NOT_BILLED') {
                      amountText = 'Rp. ${inv.amount.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}';
                      if (inv.status == 'PAID') {
                        cardBorderColor = Colors.white.withValues(alpha: 0.08);
                        iconColor = Colors.green;
                        iconBgColor = Colors.green.withValues(alpha: 0.08);
                        statusBadge = Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.green.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: Colors.green.withValues(alpha: 0.2)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.check_circle, color: Colors.green, size: 10),
                              const SizedBox(width: 4),
                              Text(
                                'LUNAS',
                                style: GoogleFonts.spaceGrotesk(
                                  fontSize: 8,
                                  fontWeight: FontWeight.w900,
                                  color: Colors.green,
                                ),
                              ),
                            ],
                          ),
                        );
                      } else {
                        cardBorderColor = brandRed.withValues(alpha: 0.2);
                        iconColor = brandRed;
                        iconBgColor = brandRed.withValues(alpha: 0.08);
                        statusBadge = Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: brandRed.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: brandRed.withValues(alpha: 0.2)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.error, color: brandRed, size: 10),
                              const SizedBox(width: 4),
                              Text(
                                'BELUM BAYAR',
                                style: GoogleFonts.spaceGrotesk(
                                  fontSize: 8,
                                  fontWeight: FontWeight.w900,
                                  color: brandRed,
                                ),
                              ),
                            ],
                          ),
                        );
                      }
                    } else {
                      statusBadge = Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.04),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
                        ),
                        child: Text(
                          'BELUM DITAGIH',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 8,
                            fontWeight: FontWeight.w900,
                            color: textGray,
                          ),
                        ),
                      );
                    }

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Column(
                        children: [
                          GestureDetector(
                            onTap: () {
                              setState(() {
                                _expandedMonthIndex = isExpanded ? null : index;
                              });
                            },
                            child: Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: cardBg,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: isExpanded ? brandRed : cardBorderColor, width: 1.5),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        width: 36,
                                        height: 36,
                                        decoration: BoxDecoration(
                                          color: iconBgColor,
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: Icon(Icons.attach_money, color: iconColor, size: 20),
                                      ),
                                      const SizedBox(width: 14),
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            monthName.toUpperCase(),
                                            style: GoogleFonts.spaceGrotesk(
                                              fontSize: 12,
                                              fontWeight: FontWeight.w900,
                                              color: Colors.white,
                                              letterSpacing: 0.5,
                                            ),
                                          ),
                                          const SizedBox(height: 2),
                                          Text(
                                            amountText,
                                            style: GoogleFonts.hankenGrotesk(
                                              fontSize: 12,
                                              fontWeight: FontWeight.bold,
                                              color: textGray,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                  statusBadge,
                                ],
                              ),
                            ),
                          ),
                          if (isExpanded) ...[
                            Container(
                              margin: const EdgeInsets.only(top: 2),
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: const Color(0xFF0F172A),
                                borderRadius: const BorderRadius.only(
                                  bottomLeft: Radius.circular(16),
                                  bottomRight: Radius.circular(16),
                                ),
                                border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  if (inv == null || inv.status == 'NOT_BILLED') ...[
                                    Center(
                                      child: Padding(
                                        padding: const EdgeInsets.symmetric(vertical: 12),
                                        child: Column(
                                          children: [
                                            const Icon(Icons.info_outline, color: textGray, size: 28),
                                            const SizedBox(height: 8),
                                            Text(
                                              'BELUM ADA TAGIHAN',
                                              style: GoogleFonts.spaceGrotesk(
                                                fontSize: 10,
                                                fontWeight: FontWeight.w900,
                                                color: Colors.white,
                                              ),
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              'Tagihan SPP bulan ini belum diterbitkan oleh pihak Dojang/Admin.',
                                              textAlign: TextAlign.center,
                                              style: GoogleFonts.hankenGrotesk(
                                                fontSize: 11,
                                                color: textGray,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    )
                                  ] else ...[
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          'METODE PEMBAYARAN',
                                          style: GoogleFonts.spaceGrotesk(
                                            fontSize: 9,
                                            fontWeight: FontWeight.w900,
                                            color: textGray,
                                          ),
                                        ),
                                        Text(
                                          inv.status == 'PAID' ? (inv.paymentMethod ?? 'MANUAL/TUNAI') : '-',
                                          style: GoogleFonts.spaceGrotesk(
                                            fontSize: 9,
                                            fontWeight: FontWeight.w900,
                                            color: Colors.white,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          'VALIDASI OLEH',
                                          style: GoogleFonts.spaceGrotesk(
                                            fontSize: 9,
                                            fontWeight: FontWeight.w900,
                                            color: textGray,
                                          ),
                                        ),
                                        Text(
                                          inv.status == 'PAID' ? (inv.validatedBy ?? 'Sistem / Admin') : '-',
                                          style: GoogleFonts.spaceGrotesk(
                                            fontSize: 9,
                                            fontWeight: FontWeight.w900,
                                            color: Colors.white,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          'STATUS VALIDASI',
                                          style: GoogleFonts.spaceGrotesk(
                                            fontSize: 9,
                                            fontWeight: FontWeight.w900,
                                            color: textGray,
                                          ),
                                        ),
                                        Text(
                                          inv.status == 'PAID' ? 'VALID / LUNAS' : 'MENUNGGU PEMBAYARAN',
                                          style: GoogleFonts.spaceGrotesk(
                                            fontSize: 9,
                                            fontWeight: FontWeight.w900,
                                            color: inv.status == 'PAID' ? Colors.green : brandRed,
                                          ),
                                        ),
                                      ],
                                    ),
                                    if (inv.status != 'PAID') ...[
                                      const SizedBox(height: 16),
                                      GestureDetector(
                                        onTap: () async {
                                          final url = Uri.parse('https://app.sandbox.midtrans.com/snap/v2/vtweb/mock');
                                          if (await canLaunchUrl(url)) {
                                            await launchUrl(url);
                                          }
                                        },
                                        child: Container(
                                          width: double.infinity,
                                          padding: const EdgeInsets.symmetric(vertical: 12),
                                          decoration: BoxDecoration(
                                            color: brandRed,
                                            borderRadius: BorderRadius.circular(10),
                                            boxShadow: [
                                              BoxShadow(
                                                color: brandRed.withValues(alpha: 0.2),
                                                blurRadius: 8,
                                                offset: const Offset(0, 4),
                                              ),
                                            ],
                                          ),
                                          alignment: Alignment.center,
                                          child: Row(
                                            mainAxisAlignment: MainAxisAlignment.center,
                                            children: [
                                              const Icon(Icons.payments, color: Colors.white, size: 16),
                                              const SizedBox(width: 8),
                                              Text(
                                                'BAYAR SEKARANG',
                                                style: GoogleFonts.spaceGrotesk(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.w900,
                                                  color: Colors.white,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ],
                                  ],
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        );
      },
      ),
    );
  }
}

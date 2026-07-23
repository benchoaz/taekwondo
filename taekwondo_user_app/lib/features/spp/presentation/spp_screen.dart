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
  int _activeTab = 0; // 0 = SPP Rutin, 1 = Tagihan Insidentil
  int? _expandedMonthIndex;

  final List<String> _months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  // Colors aligned with the dashboard theme
  static const Color darkBg = Color(0xFF0B1326);
  static const Color cardBg = Color(0xFF1E293B);
  static const Color textGray = Color(0xFF94A3B8);
  static const Color brandRed = Color(0xFFE10600);
  static const Color purpleAccent = Color(0xFF9333EA);

  @override
  Widget build(BuildContext context) {
    final sppListAsync = ref.watch(sppListProvider);
    final incidentalAsync = ref.watch(incidentalPaymentsProvider);
    final currentYear = DateTime.now().year;

    return Scaffold(
      backgroundColor: darkBg,
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(sppListProvider);
          ref.invalidate(incidentalPaymentsProvider);
        },
        color: brandRed,
        backgroundColor: cardBg,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 120),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Laporan Keuangan
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
                          'PUSAT TAGIHAN & KEUANGAN',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                            letterSpacing: 0.5,
                          ),
                        ),
                        Text(
                          'Kelola iuran SPP rutin dan tagihan khusus perorangan',
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

              // Tab Selector (SPP Rutin vs Tagihan Insidentil)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _activeTab = 0),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(vertical: 11),
                          decoration: BoxDecoration(
                            color: _activeTab == 0 ? brandRed : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: _activeTab == 0 ? [
                              BoxShadow(
                                color: brandRed.withValues(alpha: 0.3),
                                blurRadius: 8,
                                offset: const Offset(0, 4),
                              )
                            ] : [],
                          ),
                          alignment: Alignment.center,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.calendar_month, size: 15, color: _activeTab == 0 ? Colors.white : textGray),
                              const SizedBox(width: 6),
                              Text(
                                'SPP RUTIN',
                                style: GoogleFonts.spaceGrotesk(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w900,
                                  color: _activeTab == 0 ? Colors.white : textGray,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _activeTab = 1),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(vertical: 11),
                          decoration: BoxDecoration(
                            color: _activeTab == 1 ? purpleAccent : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: _activeTab == 1 ? [
                              BoxShadow(
                                color: purpleAccent.withValues(alpha: 0.3),
                                blurRadius: 8,
                                offset: const Offset(0, 4),
                              )
                            ] : [],
                          ),
                          alignment: Alignment.center,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.receipt_long, size: 15, color: _activeTab == 1 ? Colors.white : textGray),
                              const SizedBox(width: 6),
                              Text(
                                'TAGIHAN LAINNYA',
                                style: GoogleFonts.spaceGrotesk(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w900,
                                  color: _activeTab == 1 ? Colors.white : textGray,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // VIEW TAB 0: SPP RUTIN (12 BULAN)
              if (_activeTab == 0) ...[
                sppListAsync.when(
                  loading: () => const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator(color: brandRed))),
                  error: (err, stack) => Center(child: Text('Gagal memuat SPP: $err', style: const TextStyle(color: Colors.white))),
                  data: (invoices) {
                    final currentYearUnpaid = invoices.where(
                      (i) => i.year == currentYear && (i.status == 'UNPAID' || i.status == 'OVERDUE' || i.status == 'PENDING')
                    ).toList();
                    final totalUnpaid = currentYearUnpaid.fold<double>(0, (sum, item) => sum + item.amount);

                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Total Tunggakan Card
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
                                        'TUNGGAKAN SPP TAHUN $currentYear',
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

                            if (inv.status != 'NOT_BILLED') {
                              amountText = 'Rp. ${inv.amount.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}';
                              if (inv.status == 'PAID') {
                                cardBorderColor = Colors.white.withValues(alpha: 0.08);
                                iconColor = Colors.green;
                                iconBgColor = Colors.green.withValues(alpha: 0.08);
                                statusBadge = Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.green.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: Colors.green.withValues(alpha: 0.2)),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.check_circle, size: 12, color: Colors.green),
                                      const SizedBox(width: 4),
                                      Text(
                                        'LUNAS',
                                        style: GoogleFonts.spaceGrotesk(
                                          fontSize: 10,
                                          fontWeight: FontWeight.w900,
                                          color: Colors.green,
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              } else {
                                cardBorderColor = brandRed.withValues(alpha: 0.3);
                                iconColor = brandRed;
                                iconBgColor = brandRed.withValues(alpha: 0.1);
                                statusBadge = Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: brandRed.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: brandRed.withValues(alpha: 0.2)),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.warning_amber_rounded, size: 12, color: brandRed),
                                      const SizedBox(width: 4),
                                      Text(
                                        inv.status == 'OVERDUE' ? 'MENUNGGAK' : 'BELUM BAYAR',
                                        style: GoogleFonts.spaceGrotesk(
                                          fontSize: 10,
                                          fontWeight: FontWeight.w900,
                                          color: brandRed,
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              }
                            }

                            return Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              decoration: BoxDecoration(
                                color: cardBg,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: cardBorderColor),
                              ),
                              child: Column(
                                children: [
                                  InkWell(
                                    onTap: () {
                                      setState(() {
                                        _expandedMonthIndex = isExpanded ? null : index;
                                      });
                                    },
                                    borderRadius: BorderRadius.circular(16),
                                    child: Padding(
                                      padding: const EdgeInsets.all(16),
                                      child: Row(
                                        children: [
                                          Container(
                                            width: 40,
                                            height: 40,
                                            decoration: BoxDecoration(
                                              color: iconBgColor,
                                              borderRadius: BorderRadius.circular(10),
                                            ),
                                            child: Icon(Icons.calendar_today, color: iconColor, size: 18),
                                          ),
                                          const SizedBox(width: 14),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  monthName.toUpperCase(),
                                                  style: GoogleFonts.spaceGrotesk(
                                                    fontSize: 14,
                                                    fontWeight: FontWeight.w900,
                                                    color: Colors.white,
                                                  ),
                                                ),
                                                Text(
                                                  amountText,
                                                  style: GoogleFonts.hankenGrotesk(
                                                    fontSize: 12,
                                                    color: textGray,
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                          if (inv.status != 'NOT_BILLED') statusBadge,
                                          const SizedBox(width: 8),
                                          Icon(
                                            isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                                            color: textGray,
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  if (isExpanded) ...[
                                    Container(
                                      padding: const EdgeInsets.all(16),
                                      decoration: BoxDecoration(
                                        color: Colors.black.withValues(alpha: 0.2),
                                        borderRadius: const BorderRadius.only(
                                          bottomLeft: Radius.circular(16),
                                          bottomRight: Radius.circular(16),
                                        ),
                                      ),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          if (inv.status == 'NOT_BILLED') ...[
                                            Text(
                                              'Tagihan SPP untuk bulan ini belum diterbitkan oleh pengurus.',
                                              style: GoogleFonts.hankenGrotesk(
                                                fontSize: 12,
                                                color: textGray,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ] else ...[
                                            Row(
                                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                              children: [
                                                Text('Metode Pembayaran', style: GoogleFonts.hankenGrotesk(fontSize: 12, color: textGray, fontWeight: FontWeight.bold)),
                                                Text(inv.paymentMethod ?? 'Tunai / Transfer', style: GoogleFonts.spaceGrotesk(fontSize: 12, color: Colors.white, fontWeight: FontWeight.bold)),
                                              ],
                                            ),
                                            const SizedBox(height: 8),
                                            Row(
                                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                              children: [
                                                Text('Divalidasi Oleh', style: GoogleFonts.hankenGrotesk(fontSize: 12, color: textGray, fontWeight: FontWeight.bold)),
                                                Text(inv.validatedBy ?? 'Pelatih / Admin', style: GoogleFonts.spaceGrotesk(fontSize: 12, color: Colors.white, fontWeight: FontWeight.bold)),
                                              ],
                                            ),
                                            const SizedBox(height: 8),
                                            Row(
                                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                              children: [
                                                Text('Status Transaksi', style: GoogleFonts.hankenGrotesk(fontSize: 12, color: textGray, fontWeight: FontWeight.bold)),
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
                    );
                  },
                ),
              ],

              // VIEW TAB 1: TAGIHAN INSIDENTIL (DOBOK, PRIVATE, EVENT, UKT)
              if (_activeTab == 1) ...[
                incidentalAsync.when(
                  loading: () => const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator(color: purpleAccent))),
                  error: (err, stack) => Center(child: Text('Gagal memuat tagihan: $err', style: const TextStyle(color: Colors.white))),
                  data: (items) {
                    if (items.isEmpty) {
                      return Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(32),
                        decoration: BoxDecoration(
                          color: cardBg,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
                        ),
                        child: Column(
                          children: [
                            Container(
                              width: 60,
                              height: 60,
                              decoration: BoxDecoration(
                                color: purpleAccent.withValues(alpha: 0.1),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.verified, color: purpleAccent, size: 30),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'TIDAK ADA TAGIHAN INSIDENTIL',
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 14,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Anda tidak memiliki tagihan khusus (Dobok, Private Class, atau Event) yang belum diselesaikan.',
                              textAlign: TextAlign.center,
                              style: GoogleFonts.hankenGrotesk(
                                fontSize: 11,
                                color: textGray,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      );
                    }

                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'DAFTAR TAGIHAN KHUSUS & INSIDENTIL',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                            color: textGray,
                            letterSpacing: 0.5,
                          ),
                        ),
                        const SizedBox(height: 12),

                        ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: items.length,
                          itemBuilder: (context, index) {
                            final item = items[index];
                            final isPaid = item.status == 'COMPLETED' || item.status == 'PAID';
                            final isOverdue = item.status == 'OVERDUE';

                            Color borderClr = isPaid 
                                ? Colors.green.withValues(alpha: 0.3) 
                                : (isOverdue ? brandRed.withValues(alpha: 0.4) : purpleAccent.withValues(alpha: 0.3));

                            return Container(
                              margin: const EdgeInsets.only(bottom: 14),
                              padding: const EdgeInsets.all(18),
                              decoration: BoxDecoration(
                                color: cardBg,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: borderClr, width: 1.5),
                                boxShadow: [
                                  BoxShadow(
                                    color: (isPaid ? Colors.green : purpleAccent).withValues(alpha: 0.05),
                                    blurRadius: 12,
                                    offset: const Offset(0, 4),
                                  )
                                ],
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          item.purpose.toUpperCase(),
                                          style: GoogleFonts.spaceGrotesk(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w900,
                                            color: Colors.white,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: isPaid 
                                              ? Colors.green.withValues(alpha: 0.1) 
                                              : (isOverdue ? brandRed.withValues(alpha: 0.1) : Colors.orange.withValues(alpha: 0.1)),
                                          borderRadius: BorderRadius.circular(8),
                                          border: Border.all(
                                            color: isPaid 
                                                ? Colors.green.withValues(alpha: 0.3) 
                                                : (isOverdue ? brandRed.withValues(alpha: 0.3) : Colors.orange.withValues(alpha: 0.3)),
                                          ),
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Icon(
                                              isPaid ? Icons.check_circle : (isOverdue ? Icons.warning_amber_rounded : Icons.access_time),
                                              size: 12,
                                              color: isPaid ? Colors.green : (isOverdue ? brandRed : Colors.orange),
                                            ),
                                            const SizedBox(width: 4),
                                            Text(
                                              isPaid ? 'LUNAS' : (isOverdue ? 'MENUNGGAK' : 'BELUM BAYAR'),
                                              style: GoogleFonts.spaceGrotesk(
                                                fontSize: 10,
                                                fontWeight: FontWeight.w900,
                                                color: isPaid ? Colors.green : (isOverdue ? brandRed : Colors.orange),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 10),

                                  // Nominal
                                  Text(
                                    'Rp. ${item.amount.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}',
                                    style: GoogleFonts.spaceGrotesk(
                                      fontSize: 22,
                                      fontWeight: FontWeight.w900,
                                      color: isPaid ? Colors.green : Colors.white,
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  const Divider(color: Colors.white10),
                                  const SizedBox(height: 8),

                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text('Jatuh Tempo', style: GoogleFonts.hankenGrotesk(fontSize: 11, color: textGray, fontWeight: FontWeight.bold)),
                                      Text(
                                        item.dueDate != null 
                                            ? '${item.dueDate!.day} ${_months[item.dueDate!.month - 1]} ${item.dueDate!.year}'
                                            : 'Seketika / Bebas',
                                        style: GoogleFonts.spaceGrotesk(fontSize: 11, color: Colors.white, fontWeight: FontWeight.bold),
                                      ),
                                    ],
                                  ),
                                  if (item.validatedBy != null) ...[
                                    const SizedBox(height: 4),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text('Divalidasi Oleh', style: GoogleFonts.hankenGrotesk(fontSize: 11, color: textGray, fontWeight: FontWeight.bold)),
                                        Text(item.validatedBy!, style: GoogleFonts.spaceGrotesk(fontSize: 11, color: Colors.white, fontWeight: FontWeight.bold)),
                                      ],
                                    ),
                                  ],

                                  if (!isPaid) ...[
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
                                          color: purpleAccent,
                                          borderRadius: BorderRadius.circular(12),
                                          boxShadow: [
                                            BoxShadow(
                                              color: purpleAccent.withValues(alpha: 0.3),
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
                                              'BAYAR TAGIHAN SEKARANG',
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
                              ),
                            );
                          },
                        ),
                      ],
                    );
                  },
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

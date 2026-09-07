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

  // Colors aligned with the clean white athletic theme
  static const Color cardBg = Colors.white;
  static const Color textDark = Color(0xFF0F172A);
  static const Color textGray = Color(0xFF64748B);
  static const Color borderSlate = Color(0xFFE2E8F0);
  static const Color brandRed = Color(0xFFDC2626);
  static const Color purpleAccent = Color(0xFF7C3AED);

  @override
  Widget build(BuildContext context) {
    final sppListAsync = ref.watch(sppListProvider);
    final incidentalAsync = ref.watch(incidentalPaymentsProvider);
    final currentYear = DateTime.now().year;

    return Scaffold(
      backgroundColor: Colors.transparent,
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
                      color: const Color(0xFFECFDF5),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFA7F3D0)),
                    ),
                    child: const Icon(Icons.credit_card, color: Color(0xFF059669), size: 22),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Pusat Tagihan & Keuangan',
                          style: GoogleFonts.inter(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: textDark,
                            letterSpacing: -0.3,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Kelola iuran SPP rutin dan tagihan khusus anggota',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: textGray,
                            fontWeight: FontWeight.w400,
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
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: borderSlate),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _activeTab = 0),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: _activeTab == 0 ? brandRed : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: _activeTab == 0 ? [
                              BoxShadow(
                                color: brandRed.withValues(alpha: 0.25),
                                blurRadius: 6,
                                offset: const Offset(0, 2),
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
                                'SPP Rutin',
                                style: GoogleFonts.inter(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: _activeTab == 0 ? Colors.white : textGray,
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
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: _activeTab == 1 ? purpleAccent : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: _activeTab == 1 ? [
                              BoxShadow(
                                color: purpleAccent.withValues(alpha: 0.25),
                                blurRadius: 6,
                                offset: const Offset(0, 2),
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
                                'Tagihan Lainnya',
                                style: GoogleFonts.inter(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: _activeTab == 1 ? Colors.white : textGray,
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
                  error: (err, stack) => Center(child: Text('Gagal memuat SPP: $err', style: const TextStyle(color: textDark))),
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
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: cardBg,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: const Color(0xFFFECACA), width: 1.2),
                              boxShadow: const [
                                BoxShadow(
                                  color: Color(0x04000000),
                                  blurRadius: 10,
                                  offset: Offset(0, 2),
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
                                        'TUNGGAKAN SPP $currentYear',
                                        style: GoogleFonts.inter(
                                          fontSize: 10.5,
                                          fontWeight: FontWeight.w700,
                                          color: brandRed,
                                          letterSpacing: 0.5,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Rp ${totalUnpaid.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}',
                                        style: GoogleFonts.inter(
                                          fontSize: 18,
                                          fontWeight: FontWeight.w800,
                                          color: textDark,
                                          letterSpacing: -0.3,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        'Mohon selesaikan iuran yang masih tertunda',
                                        style: GoogleFonts.inter(
                                          fontSize: 11.5,
                                          color: textGray,
                                          fontWeight: FontWeight.w400,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Container(
                                  width: 36,
                                  height: 36,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFEF2F2),
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: const Color(0xFFFECACA)),
                                  ),
                                  alignment: Alignment.center,
                                  child: Text(
                                    '${currentYearUnpaid.length}x',
                                    style: GoogleFonts.inter(
                                      fontWeight: FontWeight.w700,
                                      color: brandRed,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 20),
                        ],

                        Text(
                          'Daftar Iuran Bulanan ($currentYear)',
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: textDark,
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

                            Color cardBorderColor = borderSlate;
                            Color iconColor = textGray;
                            Color iconBgColor = const Color(0xFFF1F5F9);
                            Widget statusBadge = Container();
                            String amountText = '-';

                            if (inv.status != 'NOT_BILLED') {
                              amountText = 'Rp ${inv.amount.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}';
                              if (inv.status == 'PAID') {
                                cardBorderColor = const Color(0xFFA7F3D0);
                                iconColor = const Color(0xFF059669);
                                iconBgColor = const Color(0xFFECFDF5);
                                statusBadge = Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFECFDF5),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: const Color(0xFFA7F3D0)),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.check_circle, size: 12, color: Color(0xFF059669)),
                                      const SizedBox(width: 4),
                                      Text(
                                        'Lunas',
                                        style: GoogleFonts.inter(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w600,
                                          color: const Color(0xFF059669),
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              } else {
                                cardBorderColor = const Color(0xFFFECACA);
                                iconColor = brandRed;
                                iconBgColor = const Color(0xFFFEF2F2);
                                statusBadge = Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFEF2F2),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: const Color(0xFFFECACA)),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.warning_amber_rounded, size: 12, color: brandRed),
                                      const SizedBox(width: 4),
                                      Text(
                                        inv.status == 'OVERDUE' ? 'Menunggak' : 'Belum Bayar',
                                        style: GoogleFonts.inter(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w600,
                                          color: brandRed,
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              }
                            }

                            return Container(
                              margin: const EdgeInsets.only(bottom: 8),
                              decoration: BoxDecoration(
                                color: cardBg,
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(color: cardBorderColor),
                                boxShadow: const [
                                  BoxShadow(
                                    color: Color(0x04000000),
                                    blurRadius: 6,
                                    offset: Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Column(
                                children: [
                                  InkWell(
                                    onTap: () {
                                      setState(() {
                                        _expandedMonthIndex = isExpanded ? null : index;
                                      });
                                    },
                                    borderRadius: BorderRadius.circular(14),
                                    child: Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                      child: Row(
                                        children: [
                                          Container(
                                            width: 36,
                                            height: 36,
                                            decoration: BoxDecoration(
                                              color: iconBgColor,
                                              borderRadius: BorderRadius.circular(8),
                                            ),
                                            child: Icon(Icons.calendar_today, color: iconColor, size: 16),
                                          ),
                                          const SizedBox(width: 12),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  monthName,
                                                  style: GoogleFonts.inter(
                                                    fontSize: 14,
                                                    fontWeight: FontWeight.w600,
                                                    color: textDark,
                                                  ),
                                                ),
                                                const SizedBox(height: 2),
                                                Text(
                                                  amountText,
                                                  style: GoogleFonts.inter(
                                                    fontSize: 11.5,
                                                    color: textGray,
                                                    fontWeight: FontWeight.w500,
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
                                            size: 20,
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  if (isExpanded) ...[
                                    Container(
                                      padding: const EdgeInsets.all(16),
                                      decoration: const BoxDecoration(
                                        color: Color(0xFFF8FAFC),
                                        border: Border(top: BorderSide(color: borderSlate)),
                                        borderRadius: BorderRadius.only(
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
                                              style: GoogleFonts.inter(
                                                fontSize: 12,
                                                color: textGray,
                                                fontWeight: FontWeight.w500,
                                              ),
                                            ),
                                          ] else ...[
                                            Row(
                                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                              children: [
                                                Text('Metode Pembayaran', style: GoogleFonts.inter(fontSize: 12, color: textGray, fontWeight: FontWeight.w500)),
                                                Text(inv.paymentMethod ?? 'Tunai / Transfer', style: GoogleFonts.inter(fontSize: 12, color: textDark, fontWeight: FontWeight.w600)),
                                              ],
                                            ),
                                            const SizedBox(height: 8),
                                            Row(
                                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                              children: [
                                                Text('Divalidasi Oleh', style: GoogleFonts.inter(fontSize: 12, color: textGray, fontWeight: FontWeight.w500)),
                                                Text(inv.validatedBy ?? 'Pelatih / Admin', style: GoogleFonts.inter(fontSize: 12, color: textDark, fontWeight: FontWeight.w600)),
                                              ],
                                            ),
                                            const SizedBox(height: 8),
                                            Row(
                                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                              children: [
                                                Text('Status Transaksi', style: GoogleFonts.inter(fontSize: 12, color: textGray, fontWeight: FontWeight.w500)),
                                                Text(
                                                  inv.status == 'PAID' ? 'LUNAS / TERVALIDASI' : 'MENUNGGU PEMBAYARAN',
                                                  style: GoogleFonts.inter(
                                                    fontSize: 11,
                                                    fontWeight: FontWeight.w700,
                                                    color: inv.status == 'PAID' ? const Color(0xFF059669) : brandRed,
                                                  ),
                                                ),
                                              ],
                                            ),
                                            if (inv.status != 'PAID') ...[
                                              const SizedBox(height: 14),
                                              SizedBox(
                                                width: double.infinity,
                                                height: 38,
                                                child: ElevatedButton.icon(
                                                  style: ElevatedButton.styleFrom(
                                                    backgroundColor: brandRed,
                                                    foregroundColor: Colors.white,
                                                    elevation: 0,
                                                    shape: RoundedRectangleBorder(
                                                      borderRadius: BorderRadius.circular(8),
                                                    ),
                                                  ),
                                                  onPressed: () async {
                                                    final url = Uri.parse('https://app.sandbox.midtrans.com/snap/v2/vtweb/mock');
                                                    if (await canLaunchUrl(url)) {
                                                      await launchUrl(url);
                                                    }
                                                  },
                                                  icon: const Icon(Icons.payments_rounded, color: Colors.white, size: 16),
                                                  label: Text(
                                                    'Bayar Sekarang',
                                                    style: GoogleFonts.inter(
                                                      fontSize: 12.5,
                                                      fontWeight: FontWeight.w600,
                                                      color: Colors.white,
                                                    ),
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
                  error: (err, stack) => Center(child: Text('Gagal memuat tagihan: $err', style: const TextStyle(color: textDark))),
                  data: (items) {
                    if (items.isEmpty) {
                      return Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(32),
                        decoration: BoxDecoration(
                          color: cardBg,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: borderSlate),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x04000000),
                              blurRadius: 10,
                              offset: Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            Container(
                              width: 56,
                              height: 56,
                              decoration: BoxDecoration(
                                color: const Color(0xFFF3E8FF),
                                shape: BoxShape.circle,
                                border: Border.all(color: const Color(0xFFE9D5FF)),
                              ),
                              child: const Icon(Icons.verified_outlined, color: purpleAccent, size: 28),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Tidak Ada Tagihan Insidentil',
                              style: GoogleFonts.inter(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: textDark,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Anda tidak memiliki tagihan khusus (Dobok, Kelas Privat, atau Event) yang belum diselesaikan.',
                              textAlign: TextAlign.center,
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                color: textGray,
                                fontWeight: FontWeight.w400,
                                height: 1.4,
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
                          'Daftar Tagihan Khusus & Insidentil',
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: textDark,
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
                                ? const Color(0xFFA7F3D0) 
                                : (isOverdue ? const Color(0xFFFECACA) : const Color(0xFFDDD6FE));

                            return Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              padding: const EdgeInsets.all(18),
                              decoration: BoxDecoration(
                                color: cardBg,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: borderClr, width: 1.2),
                                boxShadow: const [
                                  BoxShadow(
                                    color: Color(0x04000000),
                                    blurRadius: 10,
                                    offset: Offset(0, 2),
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
                                          item.purpose,
                                          style: GoogleFonts.inter(
                                            fontSize: 15,
                                            fontWeight: FontWeight.w600,
                                            color: textDark,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: isPaid 
                                              ? const Color(0xFFECFDF5) 
                                              : (isOverdue ? const Color(0xFFFEF2F2) : const Color(0xFFFFFBEB)),
                                          borderRadius: BorderRadius.circular(8),
                                          border: Border.all(
                                            color: isPaid 
                                                ? const Color(0xFFA7F3D0) 
                                                : (isOverdue ? const Color(0xFFFECACA) : const Color(0xFFFDE68A)),
                                          ),
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Icon(
                                              isPaid ? Icons.check_circle : (isOverdue ? Icons.warning_amber_rounded : Icons.access_time),
                                              size: 12,
                                              color: isPaid ? const Color(0xFF059669) : (isOverdue ? brandRed : const Color(0xFFD97706)),
                                            ),
                                            const SizedBox(width: 4),
                                            Text(
                                              isPaid ? 'Lunas' : (isOverdue ? 'Menunggak' : 'Belum Bayar'),
                                              style: GoogleFonts.inter(
                                                fontSize: 11,
                                                fontWeight: FontWeight.w600,
                                                color: isPaid ? const Color(0xFF059669) : (isOverdue ? brandRed : const Color(0xFFD97706)),
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
                                    'Rp ${item.amount.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}',
                                    style: GoogleFonts.inter(
                                      fontSize: 20,
                                      fontWeight: FontWeight.w800,
                                      color: isPaid ? const Color(0xFF059669) : textDark,
                                      letterSpacing: -0.5,
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  const Divider(color: borderSlate, height: 1),
                                  const SizedBox(height: 10),

                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text('Jatuh Tempo', style: GoogleFonts.inter(fontSize: 12, color: textGray, fontWeight: FontWeight.w500)),
                                      Text(
                                        item.dueDate != null 
                                            ? '${item.dueDate!.day} ${_months[item.dueDate!.month - 1]} ${item.dueDate!.year}'
                                            : 'Seketika / Bebas',
                                        style: GoogleFonts.inter(fontSize: 12, color: textDark, fontWeight: FontWeight.w600),
                                      ),
                                    ],
                                  ),
                                  if (item.validatedBy != null) ...[
                                    const SizedBox(height: 6),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text('Divalidasi Oleh', style: GoogleFonts.inter(fontSize: 12, color: textGray, fontWeight: FontWeight.w500)),
                                        Text(item.validatedBy!, style: GoogleFonts.inter(fontSize: 12, color: textDark, fontWeight: FontWeight.w600)),
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
                                          borderRadius: BorderRadius.circular(10),
                                          boxShadow: [
                                            BoxShadow(
                                              color: purpleAccent.withValues(alpha: 0.25),
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
                                              'Bayar Tagihan Sekarang',
                                              style: GoogleFonts.inter(
                                                fontSize: 13,
                                                fontWeight: FontWeight.w600,
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

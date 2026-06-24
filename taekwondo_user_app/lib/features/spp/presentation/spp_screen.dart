import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../auth/domain/user_model.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/constants/api_constants.dart';

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
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Tidak dapat membuka link pembayaran')),
        );
      }
    }
  }

  String _getMonthName(int month) {
    const months = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember'
    ];
    return month >= 1 && month <= 12 ? months[month - 1] : '';
  }

  @override
  Widget build(BuildContext context) {
    const bgColor = Color(0xFFF8FAFC);

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          'Tagihan SPP & UKT 💰',
          style: GoogleFonts.outfit(
            color: const Color(0xFF0F172A),
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF0F172A)),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF0F172A)))
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.error_outline, color: Colors.red.shade300, size: 48),
                        const SizedBox(height: 16),
                        Text(
                          _error!,
                          textAlign: TextAlign.center,
                          style: GoogleFonts.inter(color: const Color(0xFF64748B)),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: _fetchInvoices,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF0F172A),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: Text('Coba Lagi', style: GoogleFonts.inter(color: Colors.white)),
                        )
                      ],
                    ),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _fetchInvoices,
                  color: const Color(0xFF0F172A),
                  child: _invoices.isEmpty
                      ? ListView(
                          children: [
                            SizedBox(
                              height: MediaQuery.of(context).size.height * 0.7,
                              child: Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.receipt_long, color: const Color(0xFF94A3B8).withOpacity(0.3), size: 64),
                                    const SizedBox(height: 16),
                                    Text(
                                      'Belum ada tagihan aktif',
                                      style: GoogleFonts.inter(color: const Color(0xFF64748B), fontWeight: FontWeight.w600),
                                    ),
                                  ],
                                ),
                              ),
                            )
                          ],
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(24),
                          itemCount: _invoices.length,
                          itemBuilder: (context, index) {
                            final invoice = _invoices[index];
                            final isPaid = invoice['status'] == 'PAID';
                            final isOverdue = invoice['status'] == 'OVERDUE';

                            Color statusColor = Colors.orange;
                            String statusText = 'BELUM BAYAR';
                            if (isPaid) {
                              statusColor = Colors.green;
                              statusText = 'LUNAS';
                            } else if (isOverdue) {
                              statusColor = Colors.red;
                              statusText = 'MENUNGGAK';
                            }

                            return Container(
                              margin: const EdgeInsets.only(bottom: 16),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(20),
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(0xFF0F172A).withOpacity(0.02),
                                    blurRadius: 10,
                                    offset: const Offset(0, 4),
                                  )
                                ],
                                border: Border.all(
                                  color: isPaid
                                      ? Colors.green.withOpacity(0.15)
                                      : isOverdue
                                          ? Colors.red.withOpacity(0.15)
                                          : const Color(0xFF0F172A).withOpacity(0.04),
                                  width: 1.5,
                                ),
                              ),
                              child: Padding(
                                padding: const EdgeInsets.all(20),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          'SPP ${_getMonthName(invoice['month'])} ${invoice['year']}',
                                          style: GoogleFonts.outfit(
                                            color: const Color(0xFF0F172A),
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: statusColor.withOpacity(0.1),
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          child: Text(
                                            statusText,
                                            style: GoogleFonts.inter(
                                              color: statusColor,
                                              fontSize: 10,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 20),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              'Total Tagihan',
                                              style: GoogleFonts.inter(
                                                color: const Color(0xFF64748B),
                                                fontSize: 12,
                                              ),
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              'Rp ${invoice['amount'].toString().replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (match) => '.')}',
                                              style: GoogleFonts.outfit(
                                                color: const Color(0xFF0F172A),
                                                fontSize: 18,
                                                fontWeight: FontWeight.w900,
                                              ),
                                            ),
                                          ],
                                        ),
                                        if (!isPaid)
                                          ElevatedButton(
                                            onPressed: () => _launchPaymentUrl(invoice['paymentId']),
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: const Color(0xFF0F172A),
                                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                              shape: RoundedRectangleBorder(
                                                borderRadius: BorderRadius.circular(12),
                                              ),
                                              elevation: 0,
                                            ),
                                            child: Text(
                                              'Bayar',
                                              style: GoogleFonts.inter(
                                                color: Colors.white,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 12,
                                              ),
                                            ),
                                          ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                ),
    );
  }
}

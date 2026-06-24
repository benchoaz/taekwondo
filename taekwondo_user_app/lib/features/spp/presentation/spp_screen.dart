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
      final response = await dio.get('/spp', queryParameters: {
        'userId': widget.user.id
      });
      
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
    
    // In emulator 10.0.2.2 is localhost. We need to open it in browser but browser
    // doesn't resolve 10.0.2.2 as emulator localhost correctly if redirected. 
    // Usually it's better to launch the Web App's URL. For now we use the API baseUrl's host.
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
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return month >= 1 && month <= 12 ? months[month - 1] : '';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        title: Text(
          'Tagihan SPP',
          style: GoogleFonts.inter(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: Colors.red))
        : _error != null
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.error_outline, color: Colors.red.shade300, size: 48),
                  const SizedBox(height: 16),
                  Text(
                    _error!,
                    style: GoogleFonts.inter(color: Colors.white),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _fetchInvoices,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFE50914),
                    ),
                    child: Text('Coba Lagi', style: GoogleFonts.inter(color: Colors.white)),
                  )
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: _fetchInvoices,
              color: const Color(0xFFE50914),
              child: _invoices.isEmpty 
                ? ListView(
                    children: [
                      SizedBox(
                        height: MediaQuery.of(context).size.height * 0.7,
                        child: Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.receipt_long, color: Colors.white.withOpacity(0.2), size: 64),
                              const SizedBox(height: 16),
                              Text(
                                'Belum ada tagihan SPP',
                                style: GoogleFonts.inter(color: Colors.white54),
                              ),
                            ],
                          ),
                        ),
                      )
                    ],
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _invoices.length,
                    itemBuilder: (context, index) {
                      final invoice = _invoices[index];
                      final isPaid = invoice['status'] == 'PAID';
                      final isOverdue = invoice['status'] == 'OVERDUE';
                      
                      return Container(
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isPaid ? Colors.green.withOpacity(0.3) 
                                 : isOverdue ? Colors.red.withOpacity(0.3) 
                                 : Colors.white.withOpacity(0.05),
                          ),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'SPP ${_getMonthName(invoice['month'])} ${invoice['year']}',
                                    style: GoogleFonts.inter(
                                      color: Colors.white,
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: isPaid ? Colors.green.withOpacity(0.1) 
                                           : isOverdue ? Colors.red.withOpacity(0.1) 
                                           : Colors.orange.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      isPaid ? 'LUNAS' : isOverdue ? 'MENUNGGAK' : 'BELUM BAYAR',
                                      style: GoogleFonts.inter(
                                        color: isPaid ? Colors.green : isOverdue ? Colors.red : Colors.orange,
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Total Tagihan',
                                        style: GoogleFonts.inter(
                                          color: Colors.white54,
                                          fontSize: 12,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Rp ${invoice['amount'].toString().replaceAllMapped(RegExp(r'\\B(?=(\\d{3})+(?!\\d))'), (match) => '.')}',
                                        style: GoogleFonts.inter(
                                          color: Colors.white,
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
                                        backgroundColor: const Color(0xFFE50914),
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                      ),
                                      child: Text(
                                        'Bayar Sekarang',
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

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../core/network/dio_client.dart';
import '../domain/attendance_model.dart';

// Provider untuk mengambil semua member
final membersProvider = FutureProvider<List<dynamic>>((ref) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/users');
  if (response.statusCode == 200) {
    final allUsers = response.data as List;
    return allUsers.where((u) => u['role'] == 'MEMBER').toList();
  }
  throw Exception('Gagal memuat member');
});

// Provider untuk absensi pada tanggal tertentu
final attendancesProvider = FutureProvider.family<List<AttendanceModel>, DateTime>((ref, date) async {
  final dio = ref.watch(dioProvider);
  final dateStr = DateFormat('yyyy-MM-dd').format(date);
  final response = await dio.get('/attendances?date=$dateStr');
  
  if (response.statusCode == 200) {
    return (response.data as List).map((j) => AttendanceModel.fromJson(j)).toList();
  }
  return [];
});

class CoachAttendanceScreen extends ConsumerStatefulWidget {
  const CoachAttendanceScreen({super.key});

  @override
  ConsumerState<CoachAttendanceScreen> createState() => _CoachAttendanceScreenState();
}

class _CoachAttendanceScreenState extends ConsumerState<CoachAttendanceScreen> {
  DateTime selectedDate = DateTime.now();
  Map<String, bool> attendanceState = {}; // memberId -> isPresent
  bool isSaving = false;

  @override
  Widget build(BuildContext context) {
    final membersAsync = ref.watch(membersProvider);
    final attendancesAsync = ref.watch(attendancesProvider(selectedDate));

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text('Absensi Latihan', style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: const Color(0xFF0F172A), fontSize: 16)),
        backgroundColor: Colors.white,
        iconTheme: const IconThemeData(color: Color(0xFF0F172A)),
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: const Color(0xFFE2E8F0), height: 1),
        ),
      ),
      body: Column(
        children: [
          // Date Selector
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Tanggal Latihan', style: GoogleFonts.inter(color: const Color(0xFF64748B), fontSize: 12)),
                    const SizedBox(height: 2),
                    Text(
                      DateFormat('EEEE, d MMMM yyyy', 'id_ID').format(selectedDate),
                      style: GoogleFonts.inter(color: const Color(0xFF0F172A), fontSize: 15, fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
                TextButton.icon(
                  onPressed: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: selectedDate,
                      firstDate: DateTime.now().subtract(const Duration(days: 30)),
                      lastDate: DateTime.now(),
                      builder: (context, child) {
                        return Theme(
                          data: ThemeData.light().copyWith(
                            colorScheme: const ColorScheme.light(
                              primary: Color(0xFFDC2626),
                              onPrimary: Colors.white,
                              surface: Colors.white,
                              onSurface: Color(0xFF0F172A),
                            ),
                          ),
                          child: child!,
                        );
                      },
                    );
                    if (picked != null) {
                      setState(() {
                        selectedDate = picked;
                        attendanceState.clear();
                      });
                    }
                  },
                  icon: const Icon(Icons.calendar_today, size: 14, color: Color(0xFF475569)),
                  label: Text('Ubah', style: GoogleFonts.inter(color: const Color(0xFF475569), fontWeight: FontWeight.w600, fontSize: 12)),
                  style: TextButton.styleFrom(
                    backgroundColor: const Color(0xFFF1F5F9),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ],
            ),
          ),
          
          Expanded(
            child: membersAsync.when(
              data: (members) {
                return attendancesAsync.when(
                  data: (attendances) {
                    // Initialize state if empty
                    if (attendanceState.isEmpty && members.isNotEmpty) {
                      for (var m in members) {
                        final memberId = m['memberId'] ?? m['id']; // fallbacks
                        final existing = attendances.firstWhere(
                          (a) => a.memberId == memberId, 
                          orElse: () => AttendanceModel(memberId: memberId, date: selectedDate, present: true)
                        );
                        attendanceState[memberId] = existing.present;
                      }
                      // Defer setState to avoid build errors
                      WidgetsBinding.instance.addPostFrameCallback((_) {
                        if (mounted) setState(() {});
                      });
                    }

                    if (members.isEmpty) {
                      return Center(
                        child: Text('Belum ada member aktif.', style: GoogleFonts.inter(color: const Color(0xFF64748B))),
                      );
                    }

                    return ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: members.length,
                      itemBuilder: (context, index) {
                        final m = members[index];
                        final memberId = m['memberId'] ?? m['id'];
                        final isPresent = attendanceState[memberId] ?? true;

                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: isPresent ? const Color(0xFFA7F3D0) : const Color(0xFFFECACA),
                            ),
                            boxShadow: const [
                              BoxShadow(
                                color: Color(0x04000000),
                                blurRadius: 6,
                                offset: Offset(0, 2),
                              ),
                            ],
                          ),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: isPresent ? const Color(0xFFECFDF5) : const Color(0xFFFEF2F2),
                              child: Icon(
                                isPresent ? Icons.check : Icons.close,
                                color: isPresent ? const Color(0xFF059669) : const Color(0xFFDC2626),
                                size: 18,
                              ),
                            ),
                            title: Text(
                              m['name'] ?? 'Unknown',
                              style: GoogleFonts.inter(color: const Color(0xFF0F172A), fontWeight: FontWeight.w600, fontSize: 14),
                            ),
                            subtitle: Text(
                              m['currentBelt'] ?? 'Sabuk Putih',
                              style: GoogleFonts.inter(color: const Color(0xFF64748B), fontSize: 12),
                            ),
                            trailing: Switch(
                              value: isPresent,
                              activeThumbColor: const Color(0xFF059669),
                              inactiveTrackColor: const Color(0xFFFEE2E2),
                              inactiveThumbColor: const Color(0xFFDC2626),
                              onChanged: (val) {
                                setState(() {
                                  attendanceState[memberId] = val;
                                });
                              },
                            ),
                          ),
                        );
                      },
                    );
                  },
                  loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFFDC2626))),
                  error: (e, s) => Center(child: Text('Error: $e', style: const TextStyle(color: Color(0xFF0F172A)))),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFFDC2626))),
              error: (e, s) => Center(child: Text('Error: $e', style: const TextStyle(color: Color(0xFF0F172A)))),
            ),
          ),

          // Save Button
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
            ),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: isSaving ? null : _saveAttendance,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFDC2626),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 0,
                ),
                child: isSaving 
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : Text('Simpan Absensi', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _saveAttendance() async {
    setState(() => isSaving = true);
    try {
      final dio = ref.read(dioProvider);
      final dateStr = DateFormat('yyyy-MM-dd').format(selectedDate);
      
      final records = attendanceState.entries.map((e) => {
        'memberId': e.key,
        'present': e.value,
      }).toList();

      final response = await dio.post('/attendances', data: {
        'date': dateStr,
        'records': records,
      });

      if (response.statusCode == 200 && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Absensi berhasil disimpan!'), backgroundColor: Colors.green),
        );
        // Refresh
        ref.invalidate(attendancesProvider(selectedDate));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal menyimpan: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => isSaving = false);
    }
  }
}

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
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: Text('Absensi Latihan', style: GoogleFonts.inter(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: const Color(0xFF0F172A),
        iconTheme: const IconThemeData(color: Colors.white),
        elevation: 0,
      ),
      body: Column(
        children: [
          // Date Selector
          Container(
            color: const Color(0xFF1E293B),
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Tanggal Latihan', style: GoogleFonts.inter(color: Colors.white54, fontSize: 12)),
                    const SizedBox(height: 4),
                    Text(
                      DateFormat('EEEE, d MMMM yyyy', 'id_ID').format(selectedDate),
                      style: GoogleFonts.inter(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: selectedDate,
                      firstDate: DateTime.now().subtract(const Duration(days: 30)),
                      lastDate: DateTime.now(),
                      builder: (context, child) {
                        return Theme(
                          data: ThemeData.dark().copyWith(
                            colorScheme: const ColorScheme.dark(
                              primary: Colors.blue,
                              onPrimary: Colors.white,
                              surface: Color(0xFF1E293B),
                              onSurface: Colors.white,
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
                  icon: const Icon(Icons.calendar_today, size: 16),
                  label: const Text('Ubah'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue.withValues(alpha: 0.2),
                    foregroundColor: Colors.blue,
                    elevation: 0,
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
                        child: Text('Belum ada member aktif.', style: GoogleFonts.inter(color: Colors.white)),
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
                            color: const Color(0xFF1E293B),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isPresent ? Colors.green.withValues(alpha: 0.3) : Colors.red.withValues(alpha: 0.3),
                            ),
                          ),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: isPresent ? Colors.green.withValues(alpha: 0.2) : Colors.red.withValues(alpha: 0.2),
                              child: Icon(
                                isPresent ? Icons.check : Icons.close,
                                color: isPresent ? Colors.green : Colors.red,
                              ),
                            ),
                            title: Text(
                              m['name'] ?? 'Unknown',
                              style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.bold),
                            ),
                            subtitle: Text(
                              m['currentBelt'] ?? 'Sabuk Putih',
                              style: GoogleFonts.inter(color: Colors.white54, fontSize: 12),
                            ),
                            trailing: Switch(
                              value: isPresent,
                              activeColor: Colors.green,
                              inactiveTrackColor: Colors.red.withValues(alpha: 0.5),
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
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (e, s) => Center(child: Text('Error: $e', style: const TextStyle(color: Colors.white))),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, s) => Center(child: Text('Error: $e', style: const TextStyle(color: Colors.white))),
            ),
          ),

          // Save Button
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.5), blurRadius: 10, offset: const Offset(0, -5))
              ],
            ),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: isSaving ? null : _saveAttendance,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: isSaving 
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : Text('Simpan Absensi', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
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

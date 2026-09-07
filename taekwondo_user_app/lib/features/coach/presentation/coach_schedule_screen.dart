import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/network/dio_client.dart';
import '../../auth/domain/user_model.dart';
import '../domain/schedule_model.dart';

final coachSchedulesProvider = FutureProvider.family<List<ScheduleModel>, String>((ref, userId) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/schedules?userId=$userId');
  
  if (response.statusCode == 200) {
    return (response.data as List)
        .map((json) => ScheduleModel.fromJson(json))
        .toList();
  } else {
    throw Exception('Gagal memuat jadwal');
  }
});

class CoachScheduleScreen extends ConsumerWidget {
  final UserModel user;

  const CoachScheduleScreen({super.key, required this.user});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final schedulesAsync = ref.watch(coachSchedulesProvider(user.id));

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text('Jadwal Mengajar', style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: const Color(0xFF0F172A), fontSize: 16)),
        backgroundColor: Colors.white,
        iconTheme: const IconThemeData(color: Color(0xFF0F172A)),
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: const Color(0xFFE2E8F0), height: 1),
        ),
      ),
      body: schedulesAsync.when(
        data: (schedules) {
          if (schedules.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 70,
                    height: 70,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: const Icon(Icons.event_busy, color: Color(0xFF94A3B8), size: 32),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Belum Ada Jadwal Mengajar',
                    style: GoogleFonts.inter(color: const Color(0xFF0F172A), fontSize: 16, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Jadwal Anda belum ditambahkan oleh pengurus.',
                    style: GoogleFonts.inter(color: const Color(0xFF64748B), fontSize: 13),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: schedules.length,
            itemBuilder: (context, index) {
              final schedule = schedules[index];
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x04000000),
                      blurRadius: 8,
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Container(
                        width: 54,
                        height: 54,
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF2F2),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFFECACA)),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              schedule.dayOfWeek.substring(0, 3).toUpperCase(),
                              style: GoogleFonts.inter(
                                color: const Color(0xFFDC2626),
                                fontWeight: FontWeight.w700,
                                fontSize: 11,
                              ),
                            ),
                            const SizedBox(height: 2),
                            const Icon(Icons.calendar_today, color: Color(0xFFDC2626), size: 16),
                          ],
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              schedule.className,
                              style: GoogleFonts.inter(
                                color: const Color(0xFF0F172A),
                                fontWeight: FontWeight.w700,
                                fontSize: 15,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                const Icon(Icons.access_time, color: Color(0xFF64748B), size: 14),
                                const SizedBox(width: 4),
                                Text(
                                  '${schedule.startTime} - ${schedule.endTime}',
                                  style: GoogleFonts.inter(color: const Color(0xFF64748B), fontSize: 12),
                                ),
                              ],
                            ),
                            const SizedBox(height: 2),
                            Row(
                              children: [
                                const Icon(Icons.location_on, color: Color(0xFF64748B), size: 14),
                                const SizedBox(width: 4),
                                Text(
                                  schedule.location,
                                  style: GoogleFonts.inter(color: const Color(0xFF64748B), fontSize: 12),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFFDC2626))),
        error: (err, stack) => Center(
          child: Text('Terjadi kesalahan: $err', style: const TextStyle(color: Color(0xFF0F172A))),
        ),
      ),
    );
  }
}

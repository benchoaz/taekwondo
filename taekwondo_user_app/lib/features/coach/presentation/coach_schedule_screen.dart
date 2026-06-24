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
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: Text('Jadwal Mengajar', style: GoogleFonts.inter(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: const Color(0xFF0F172A),
        iconTheme: const IconThemeData(color: Colors.white),
        elevation: 0,
      ),
      body: schedulesAsync.when(
        data: (schedules) {
          if (schedules.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.event_busy, color: Colors.white.withValues(alpha: 0.2), size: 80),
                  const SizedBox(height: 16),
                  Text(
                    'Belum ada jadwal mengajar',
                    style: GoogleFonts.inter(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Jadwal Anda belum ditambahkan oleh Admin.',
                    style: GoogleFonts.inter(color: Colors.white54, fontSize: 14),
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
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: Colors.blue.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              schedule.dayOfWeek.substring(0, 3).toUpperCase(),
                              style: GoogleFonts.inter(
                                color: Colors.blue,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Icon(Icons.calendar_today, color: Colors.blue, size: 20),
                          ],
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              schedule.className,
                              style: GoogleFonts.inter(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                const Icon(Icons.access_time, color: Colors.white54, size: 14),
                                const SizedBox(width: 4),
                                Text(
                                  '${schedule.startTime} - ${schedule.endTime}',
                                  style: GoogleFonts.inter(color: Colors.white54, fontSize: 13),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                const Icon(Icons.location_on, color: Colors.white54, size: 14),
                                const SizedBox(width: 4),
                                Text(
                                  schedule.location,
                                  style: GoogleFonts.inter(color: Colors.white54, fontSize: 13),
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
        loading: () => const Center(child: CircularProgressIndicator(color: Colors.blue)),
        error: (err, stack) => Center(
          child: Text('Terjadi kesalahan: $err', style: const TextStyle(color: Colors.white)),
        ),
      ),
    );
  }
}

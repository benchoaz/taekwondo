import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../data/schedule_service.dart';
import '../domain/schedule_model.dart';

class ScheduleScreen extends ConsumerWidget {
  const ScheduleScreen({super.key});

  Map<String, List<ScheduleModel>> _groupSchedulesByDay(List<ScheduleModel> schedules) {
    final Map<String, List<ScheduleModel>> grouped = {
      'Senin': [],
      'Selasa': [],
      'Rabu': [],
      'Kamis': [],
      'Jumat': [],
      'Sabtu': [],
      'Minggu': [],
    };

    for (var s in schedules) {
      final day = s.dayOfWeek;
      if (grouped.containsKey(day)) {
        grouped[day]!.add(s);
      } else {
        grouped[day] = [s];
      }
    }

    grouped.removeWhere((key, value) => value.isEmpty);
    return grouped;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final scheduleAsync = ref.watch(scheduleProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          'Jadwal Latihan Dojang 🥋',
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
      body: scheduleAsync.when(
        data: (schedules) {
          if (schedules.isEmpty) {
            return Center(
              child: Text(
                'Belum ada jadwal latihan yang dikonfigurasi.',
                style: GoogleFonts.inter(color: const Color(0xFF64748B)),
              ),
            );
          }

          final grouped = _groupSchedulesByDay(schedules);

          return RefreshIndicator(
            onRefresh: () => ref.refresh(scheduleProvider.future),
            color: const Color(0xFF0F172A),
            child: ListView.builder(
              padding: const EdgeInsets.all(24),
              itemCount: grouped.length,
              itemBuilder: (context, index) {
                final day = grouped.keys.elementAt(index);
                final daySchedules = grouped[day]!;

                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12, top: 8),
                      child: Text(
                        day,
                        style: GoogleFonts.outfit(
                          color: const Color(0xFF0F172A),
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    ...daySchedules.map((schedule) {
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
                            color: const Color(0xFF0F172A).withOpacity(0.04),
                            width: 1.5,
                          ),
                        ),
                        child: IntrinsicHeight(
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              // Left Accent Bar
                              Container(
                                width: 6,
                                decoration: const BoxDecoration(
                                  color: Color(0xFF0F172A),
                                  borderRadius: BorderRadius.only(
                                    topLeft: Radius.circular(20),
                                    bottomLeft: Radius.circular(20),
                                  ),
                                ),
                              ),
                              // Content
                              Expanded(
                                child: Padding(
                                  padding: const EdgeInsets.all(20),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Expanded(
                                            child: Text(
                                              schedule.className,
                                              style: GoogleFonts.outfit(
                                                color: const Color(0xFF0F172A),
                                                fontSize: 16,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ),
                                          Row(
                                            children: [
                                              const Icon(Icons.access_time, color: Color(0xFF64748B), size: 14),
                                              const SizedBox(width: 4),
                                              Text(
                                                '${schedule.startTime} - ${schedule.endTime}',
                                                style: GoogleFonts.inter(
                                                  color: const Color(0xFF64748B),
                                                  fontWeight: FontWeight.w600,
                                                  fontSize: 12,
                                                ),
                                              ),
                                            ],
                                          )
                                        ],
                                      ),
                                      const SizedBox(height: 12),
                                      Row(
                                        children: [
                                          const Icon(Icons.location_on_outlined, color: Color(0xFF94A3B8), size: 16),
                                          const SizedBox(width: 6),
                                          Expanded(
                                            child: Text(
                                              schedule.location,
                                              style: GoogleFonts.inter(
                                                color: const Color(0xFF64748B),
                                                fontSize: 13,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                      if (schedule.coach != null) ...[
                                        const SizedBox(height: 8),
                                        Row(
                                          children: [
                                            const Icon(Icons.person_outline, color: Color(0xFF94A3B8), size: 16),
                                            const SizedBox(width: 6),
                                            Text(
                                              'Pelatih: ${schedule.coach!.fullName}',
                                              style: GoogleFonts.inter(
                                                color: const Color(0xFF475569),
                                                fontWeight: FontWeight.w600,
                                                fontSize: 13,
                                              ),
                                            ),
                                            if (schedule.coach!.danRank != null) ...[
                                              const SizedBox(width: 6),
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                decoration: BoxDecoration(
                                                  color: Colors.redAccent.withOpacity(0.1),
                                                  borderRadius: BorderRadius.circular(6),
                                                ),
                                                child: Text(
                                                  'DAN ${schedule.coach!.danRank}',
                                                  style: GoogleFonts.inter(
                                                    color: Colors.redAccent.shade700,
                                                    fontSize: 9,
                                                    fontWeight: FontWeight.w900,
                                                  ),
                                                ),
                                              )
                                            ]
                                          ],
                                        ),
                                      ]
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }),
                  ],
                );
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFF0F172A))),
        error: (err, stack) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text(
              'Gagal memuat jadwal: $err',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(color: Colors.red),
            ),
          ),
        ),
      ),
    );
  }
}

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
    const Color brandRed = Color(0xFFDC2626);
    const Color borderSlate = Color(0xFFE2E8F0);

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        shape: const Border(bottom: BorderSide(color: borderSlate, width: 1)),
        title: Text(
          'Jadwal Latihan Dojang',
          style: GoogleFonts.inter(
            color: const Color(0xFF0F172A),
            fontWeight: FontWeight.w700,
            fontSize: 16,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF0F172A), size: 18),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: scheduleAsync.when(
        data: (schedules) {
          if (schedules.isEmpty) {
            return Center(
              child: Text(
                'Belum ada jadwal latihan yang dikonfigurasi.',
                style: GoogleFonts.inter(color: const Color(0xFF64748B), fontSize: 13),
              ),
            );
          }

          final grouped = _groupSchedulesByDay(schedules);

          return RefreshIndicator(
            onRefresh: () => ref.refresh(scheduleProvider.future),
            color: brandRed,
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              itemCount: grouped.length,
              itemBuilder: (context, index) {
                final day = grouped.keys.elementAt(index);
                final daySchedules = grouped[day]!;

                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(bottom: 10, top: 8),
                      child: Row(
                        children: [
                          Container(
                            width: 3,
                            height: 14,
                            decoration: BoxDecoration(
                              color: brandRed,
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            day,
                            style: GoogleFonts.inter(
                              color: const Color(0xFF0F172A),
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                    ...daySchedules.map((schedule) {
                      return Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: borderSlate),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x04000000),
                              blurRadius: 6,
                              offset: Offset(0, 2),
                            )
                          ],
                        ),
                        child: IntrinsicHeight(
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              // Left Accent Bar
                              Container(
                                width: 4,
                                decoration: const BoxDecoration(
                                  color: brandRed,
                                  borderRadius: BorderRadius.only(
                                    topLeft: Radius.circular(14),
                                    bottomLeft: Radius.circular(14),
                                  ),
                                ),
                              ),
                              // Content
                              Expanded(
                                child: Padding(
                                  padding: const EdgeInsets.all(14),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Expanded(
                                            child: Text(
                                              schedule.className,
                                              style: GoogleFonts.inter(
                                                color: const Color(0xFF0F172A),
                                                fontSize: 14,
                                                fontWeight: FontWeight.w700,
                                              ),
                                            ),
                                          ),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFFF1F5F9),
                                              borderRadius: BorderRadius.circular(6),
                                            ),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                const Icon(Icons.access_time_rounded, color: Color(0xFF64748B), size: 12),
                                                const SizedBox(width: 4),
                                                Text(
                                                  '${schedule.startTime} - ${schedule.endTime}',
                                                  style: GoogleFonts.inter(
                                                    color: const Color(0xFF475569),
                                                    fontWeight: FontWeight.w600,
                                                    fontSize: 11,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          )
                                        ],
                                      ),
                                      const SizedBox(height: 10),
                                      Row(
                                        children: [
                                          const Icon(Icons.location_on_outlined, color: Color(0xFF94A3B8), size: 14),
                                          const SizedBox(width: 6),
                                          Expanded(
                                            child: Text(
                                              schedule.location,
                                              style: GoogleFonts.inter(
                                                color: const Color(0xFF64748B),
                                                fontSize: 12,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                      if (schedule.coach != null) ...[
                                        const SizedBox(height: 6),
                                        Row(
                                          children: [
                                            const Icon(Icons.person_outline_rounded, color: Color(0xFF94A3B8), size: 14),
                                            const SizedBox(width: 6),
                                            Text(
                                              'Pelatih: ${schedule.coach!.fullName}',
                                              style: GoogleFonts.inter(
                                                color: const Color(0xFF475569),
                                                fontWeight: FontWeight.w500,
                                                fontSize: 12,
                                              ),
                                            ),
                                            if (schedule.coach!.danRank != null) ...[
                                              const SizedBox(width: 6),
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                                decoration: BoxDecoration(
                                                  color: const Color(0xFFFEF2F2),
                                                  borderRadius: BorderRadius.circular(4),
                                                  border: Border.all(color: const Color(0xFFFECACA), width: 0.8),
                                                ),
                                                child: Text(
                                                  'DAN ${schedule.coach!.danRank}',
                                                  style: GoogleFonts.inter(
                                                    color: brandRed,
                                                    fontSize: 9,
                                                    fontWeight: FontWeight.w700,
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
        loading: () => const Center(child: CircularProgressIndicator(color: brandRed, strokeWidth: 2.5)),
        error: (err, stack) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text(
              'Gagal memuat jadwal: $err',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(color: brandRed, fontSize: 13),
            ),
          ),
        ),
      ),
    );
  }
}

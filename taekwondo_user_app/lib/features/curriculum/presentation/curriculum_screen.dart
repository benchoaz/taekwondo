import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../auth/domain/user_model.dart';
import '../data/curriculum_service.dart';
import '../domain/curriculum_model.dart';
import '../../ukt/presentation/ukt_screen.dart';

class CurriculumScreen extends ConsumerStatefulWidget {
  final UserModel user;

  const CurriculumScreen({super.key, required this.user});

  @override
  ConsumerState<CurriculumScreen> createState() => _CurriculumScreenState();
}

class _CurriculumScreenState extends ConsumerState<CurriculumScreen> {
  String? _selectedBeltId;

  Future<void> _launchVideo(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Tidak dapat membuka video tutorial.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final curriculumAsync = ref.watch(curriculumProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          'Kurikulum Sabuk 🥋',
          style: GoogleFonts.outfit(
            color: const Color(0xFF0F172A),
            fontWeight: FontWeight.bold,
            fontSize: 20,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF0F172A)),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: curriculumAsync.when(
        data: (belts) {
          if (belts.isEmpty) {
            return Center(
              child: Text(
                'Belum ada kurikulum yang dikonfigurasi.',
                style: GoogleFonts.inter(color: const Color(0xFF64748B)),
              ),
            );
          }

          // Inisialisasi sabuk terpilih jika belum diset
          if (_selectedBeltId == null) {
            final activeBelt = belts.firstWhere(
              (b) => b.name.toLowerCase().contains(widget.user.currentBelt?.toLowerCase() ?? 'putih'),
              orElse: () => belts.first,
            );
            _selectedBeltId = activeBelt.id;
          }

          final currentSelectedBelt = belts.firstWhere((b) => b.id == _selectedBeltId);

          return Column(
            children: [
              // Belt Selector Horizontal List
              Container(
                height: 70,
                color: Colors.white,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  itemCount: belts.length,
                  itemBuilder: (context, index) {
                    final belt = belts[index];
                    final isSelected = belt.id == _selectedBeltId;
                    final isUserBelt = belt.name.toLowerCase().contains(widget.user.currentBelt?.toLowerCase() ?? '');

                    return GestureDetector(
                      onTap: () {
                        setState(() {
                          _selectedBeltId = belt.id;
                        });
                      },
                      child: Container(
                        margin: const EdgeInsets.only(right: 10),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(20),
                          border: isUserBelt
                              ? Border.all(color: Colors.redAccent, width: 1.5)
                              : null,
                        ),
                        child: Row(
                          children: [
                            if (isUserBelt)
                              const Padding(
                                padding: EdgeInsets.only(right: 6),
                                child: Icon(Icons.star, color: Colors.amber, size: 14),
                              ),
                            Text(
                              belt.name,
                              style: GoogleFonts.inter(
                                color: isSelected ? Colors.white : const Color(0xFF475569),
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),

              // Curriculum Content
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(24),
                  children: [
                    // Belt Info Card
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            currentSelectedBelt.name,
                            style: GoogleFonts.outfit(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 12),
                          const Divider(color: Colors.white24, height: 1),
                          const SizedBox(height: 12),
                          Text(
                            'Persyaratan UKT untuk Sabuk Ini:',
                            style: GoogleFonts.inter(
                              color: Colors.white70,
                              fontWeight: FontWeight.w600,
                              fontSize: 12,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              _buildReqBadge(
                                  Icons.calendar_today, 'Hadir: ${currentSelectedBelt.minAttendance}%'),
                              _buildReqBadge(
                                  Icons.bolt, 'Teknik: ${currentSelectedBelt.minTechScore}'),
                              _buildReqBadge(
                                  Icons.fitness_center, 'Fisik: ${currentSelectedBelt.minPhysical}'),
                            ],
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton.icon(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => UktScreen(user: widget.user),
                                ),
                              );
                            },
                            icon: const Icon(Icons.assignment, size: 16, color: Colors.white),
                            label: Text(
                              'Lihat Jadwal & Daftar UKT',
                              style: GoogleFonts.inter(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.redAccent.shade400,
                              minimumSize: const Size.fromHeight(40),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              elevation: 0,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Categories List
                    if (currentSelectedBelt.categories.isEmpty)
                      Center(
                        child: Padding(
                          padding: const EdgeInsets.only(top: 40),
                          child: Text(
                            'Belum ada materi kurikulum untuk sabuk ini.',
                            style: GoogleFonts.inter(color: const Color(0xFF64748B)),
                          ),
                        ),
                      )
                    else
                      ...currentSelectedBelt.categories.map((category) {
                        return _buildCategorySection(category);
                      }),
                  ],
                ),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text(
              'Gagal memuat kurikulum: $err',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(color: Colors.red),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildReqBadge(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(icon, color: Colors.amber, size: 14),
          const SizedBox(width: 6),
          Text(
            label,
            style: GoogleFonts.inter(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildCategorySection(CurriculumCategory category) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F172A).withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Category Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
              ),
              border: Border(
                bottom: BorderSide(color: const Color(0xFF0F172A).withValues(alpha: 0.05)),
              ),
            ),
            child: Row(
              children: [
                const Icon(Icons.label_important_outline, color: Color(0xFF0F172A), size: 20),
                const SizedBox(width: 10),
                Text(
                  category.name,
                  style: GoogleFonts.outfit(
                    color: const Color(0xFF0F172A),
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),

          // Materials List
          if (category.materials.isEmpty)
            Padding(
              padding: const EdgeInsets.all(16),
              child: Text(
                'Tidak ada materi di kategori ini.',
                style: GoogleFonts.inter(color: const Color(0xFF94A3B8), fontSize: 13),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: category.materials.length,
              separatorBuilder: (context, index) => const Divider(height: 1, color: Color(0xFFF1F5F9)),
              itemBuilder: (context, index) {
                final material = category.materials[index];
                final hasVideo = material.videoUrl != null && material.videoUrl!.isNotEmpty;

                return ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  title: Text(
                    material.title,
                    style: GoogleFonts.inter(
                      color: const Color(0xFF1E293B),
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                  trailing: hasVideo
                      ? Container(
                          decoration: BoxDecoration(
                            color: Colors.red.shade50,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: IconButton(
                            icon: const Icon(Icons.play_circle_fill, color: Colors.red),
                            onPressed: () => _launchVideo(material.videoUrl!),
                            tooltip: 'Tonton Video Tutorial',
                          ),
                        )
                      : Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade100,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.menu_book, color: Colors.grey, size: 16),
                        ),
                );
              },
            ),
        ],
      ),
    );
  }
}

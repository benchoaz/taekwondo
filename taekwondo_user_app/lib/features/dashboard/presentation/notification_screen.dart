import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../data/notification_service.dart';

class NotificationScreen extends ConsumerWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notificationAsync = ref.watch(notificationProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A), // Premium Dark
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        title: Text(
          'Notifikasi',
          style: GoogleFonts.hankenGrotesk(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 20,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: notificationAsync.when(
        data: (notifications) {
          if (notifications.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.notifications_off_outlined, color: Colors.white.withOpacity(0.3), size: 64),
                  const SizedBox(height: 16),
                  Text(
                    'Belum ada notifikasi baru',
                    style: GoogleFonts.hankenGrotesk(color: Colors.white70, fontSize: 16),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => ref.refresh(notificationProvider.future),
            color: const Color(0xFFE10600), // brandRed
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: notifications.length,
              itemBuilder: (context, index) {
                final notif = notifications[index];
                
                // Determine icon and color based on title (heuristics)
                IconData iconData = Icons.notifications;
                Color iconColor = Colors.blueAccent;
                if (notif.title.toLowerCase().contains('spp') || notif.title.toLowerCase().contains('pembayaran')) {
                  iconData = Icons.receipt_long;
                  iconColor = Colors.orangeAccent;
                } else if (notif.title.toLowerCase().contains('event') || notif.title.toLowerCase().contains('turnamen')) {
                  iconData = Icons.emoji_events;
                  iconColor = Colors.amber;
                } else if (notif.title.toLowerCase().contains('pengumuman')) {
                  iconData = Icons.campaign;
                  iconColor = Colors.purpleAccent;
                }

                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white.withOpacity(notif.isRead ? 0.05 : 0.15)),
                    boxShadow: notif.isRead ? [] : [
                      BoxShadow(
                        color: iconColor.withOpacity(0.1),
                        blurRadius: 10,
                        spreadRadius: 1,
                      )
                    ]
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: iconColor.withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(iconData, color: iconColor, size: 24),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              notif.title,
                              style: GoogleFonts.hankenGrotesk(
                                color: Colors.white,
                                fontWeight: notif.isRead ? FontWeight.w600 : FontWeight.w900,
                                fontSize: 16,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              notif.message,
                              style: GoogleFonts.hankenGrotesk(
                                color: Colors.white70,
                                fontSize: 13,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              '${notif.createdAt.day}/${notif.createdAt.month}/${notif.createdAt.year} ${notif.createdAt.hour}:${notif.createdAt.minute.toString().padLeft(2, '0')}',
                              style: GoogleFonts.spaceGrotesk(
                                color: Colors.white54,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFFE10600))),
        error: (err, stack) => Center(
          child: Text('Gagal memuat notifikasi: $err', style: const TextStyle(color: Colors.red)),
        ),
      ),
    );
  }
}

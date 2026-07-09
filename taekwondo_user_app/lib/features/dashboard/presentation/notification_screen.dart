import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:timeago/timeago.dart' as timeago;
import 'package:go_router/go_router.dart';

import '../../auth/domain/user_model.dart';
import '../data/notification_service.dart';
import '../domain/notification_model.dart';
import '../../auth/data/auth_provider.dart';

// Neo-Brutalism Colors
const Color nbSurface = Color(0xFFF8F9FA);
const Color nbSurfaceContainerLowest = Color(0xFFFFFFFF);
const Color nbSurfaceContainer = Color(0xFFEDEEEF);
const Color nbBlack = Color(0xFF191C1D);
const Color nbOutline = Color(0xFF737687);
const Color nbPrimary = Color(0xFF2563EB);
const Color nbPrimaryFixed = Color(0xFFDBEAFE);
const Color nbPrimaryContainer = Color(0xFF3B82F6);
const Color nbOnPrimaryContainer = Color(0xFFEFF6FF);
const Color nbSecondary = Color(0xFF0F172A);
const Color nbSecondaryFixed = Color(0xFFF1F5F9);
const Color nbTertiary = Color(0xFF059669);
const Color nbTertiaryContainer = Color(0xFF10B981);
const Color nbOnTertiaryContainer = Color(0xFFECFDF5);
const Color nbError = Color(0xFFDC2626);
const Color nbErrorFixed = Color(0xFFFEE2E2);

class NotificationScreen extends ConsumerStatefulWidget {
  const NotificationScreen({super.key});

  @override
  ConsumerState<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends ConsumerState<NotificationScreen> {
  bool _isMarkingAsRead = false;

  @override
  void initState() {
    super.initState();
    timeago.setLocaleMessages('id', timeago.IdMessages());
  }

  Future<void> _handleRefresh() async {
    ref.invalidate(notificationProvider);
    await ref.read(notificationProvider.future);
  }

  Future<void> _markAllAsRead(UserModel user) async {
    if (_isMarkingAsRead) return;
    setState(() => _isMarkingAsRead = true);

    try {
      final service = ref.read(notificationServiceProvider);
      await service.markAsRead(user.id); // without notificationIds, marks all as read
      ref.invalidate(notificationProvider);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isMarkingAsRead = false);
      }
    }
  }
  
  Future<void> _markAsRead(UserModel user, String id) async {
    try {
      final service = ref.read(notificationServiceProvider);
      await service.markAsRead(user.id, notificationIds: [id]);
      ref.invalidate(notificationProvider);
    } catch (e) {
      debugPrint('Error marking as read: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final userState = ref.watch(authProvider);
    final user = userState.valueOrNull;

    if (user == null) {
      return const Scaffold(
        backgroundColor: nbSurface,
        body: Center(child: CircularProgressIndicator(color: nbPrimary)),
      );
    }

    final notificationsAsync = ref.watch(notificationProvider);

    return Scaffold(
      backgroundColor: nbSurface,
      appBar: AppBar(
        backgroundColor: nbSurface,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: nbBlack),
          onPressed: () => context.pop(),
        ),
        title: Text(
          'NOTIFIKASI',
          style: GoogleFonts.spaceGrotesk(
            fontSize: 20,
            fontWeight: FontWeight.w900,
            color: nbBlack,
            letterSpacing: -0.5,
          ),
        ),
        actions: [
          IconButton(
            icon: _isMarkingAsRead
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: nbPrimary, strokeWidth: 2))
                : const Icon(Icons.done_all, color: nbBlack),
            tooltip: 'Tandai semua dibaca',
            onPressed: () => _markAllAsRead(user),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: nbPrimary,
        backgroundColor: nbSurfaceContainerLowest,
        onRefresh: _handleRefresh,
        child: notificationsAsync.when(
          loading: () => const Center(child: CircularProgressIndicator(color: nbPrimary)),
          error: (err, stack) => Center(
            child: Text('Gagal memuat: $err', style: const TextStyle(color: nbError)),
          ),
          data: (notifications) {
            if (notifications.isEmpty) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  SizedBox(height: MediaQuery.of(context).size.height * 0.3),
                  const Icon(Icons.notifications_off_outlined, size: 64, color: nbOutline),
                  const SizedBox(height: 16),
                  Center(
                    child: Text(
                      'Belum ada notifikasi.',
                      style: GoogleFonts.hankenGrotesk(
                        fontSize: 16,
                        color: nbOutline,
                      ),
                    ),
                  ),
                ],
              );
            }

            return ListView.builder(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
              itemCount: notifications.length,
              itemBuilder: (context, index) {
                final notif = notifications[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _buildNotificationItem(notif, user),
                );
              },
            );
          },
        ),
      ),
    );
  }

  Widget _buildNotificationItem(NotificationModel notif, UserModel user) {
    IconData icon;
    Color bgColor;
    Color fgColor;

    final lowerTitle = notif.title.toLowerCase();
    if (lowerTitle.contains('spp') || lowerTitle.contains('tagihan') || lowerTitle.contains('bayar')) {
      icon = Icons.receipt_long;
      bgColor = nbErrorFixed;
      fgColor = nbError;
    } else if (lowerTitle.contains('latihan') || lowerTitle.contains('jadwal')) {
      icon = Icons.calendar_month;
      bgColor = nbPrimaryFixed;
      fgColor = nbPrimary;
    } else if (lowerTitle.contains('misi') || lowerTitle.contains('pencapaian') || lowerTitle.contains('selamat')) {
      icon = Icons.emoji_events;
      bgColor = const Color(0xFFFEF08A); // Yellow/Gold
      fgColor = const Color(0xFFCA8A04);
    } else if (lowerTitle.contains('ujian') || lowerTitle.contains('ukt')) {
      icon = Icons.sports_martial_arts;
      bgColor = nbTertiaryContainer;
      fgColor = nbTertiary;
    } else {
      icon = Icons.notifications;
      bgColor = nbSurfaceContainer;
      fgColor = nbOutline;
    }

    return GestureDetector(
      onTap: () {
        if (!notif.isRead) {
          _markAsRead(user, notif.id);
        }
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: notif.isRead ? nbSurfaceContainerLowest : nbSurfaceContainer,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: nbBlack, width: 2),
          boxShadow: notif.isRead ? null : const [BoxShadow(color: nbBlack, offset: Offset(4, 4))],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: bgColor,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: nbBlack, width: 2),
              ),
              child: Icon(icon, color: fgColor, size: 24),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          notif.title,
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: nbBlack,
                            height: 1.1,
                          ),
                        ),
                      ),
                      if (!notif.isRead)
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: nbPrimary,
                            shape: BoxShape.circle,
                          ),
                        )
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    notif.message,
                    style: GoogleFonts.hankenGrotesk(
                      fontSize: 14,
                      color: nbBlack.withValues(alpha: 0.8),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    timeago.format(notif.createdAt, locale: 'id'),
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: nbOutline,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

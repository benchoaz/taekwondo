import 'dart:math' as math;
import 'package:flutter/material.dart';

/// Latar belakang atletik dinamis bertema Taekwondo:
/// - Gambar aksi Taekwondo asli yang mencolok (bg_taekwondo.png)
/// - Animated dynamic gradient berputar (merah crimson & biru taegeuk khas taekwondo)
/// - Watermark geometris arena oktagonal dan tekstur matras
/// - Soft frost scrim untuk menjaga kartu putih & teks tetap kontras dan terbaca jelas
class DojangAmbientBackground extends StatefulWidget {
  final Widget child;
  final bool animateLight;

  const DojangAmbientBackground({
    super.key,
    required this.child,
    this.animateLight = true,
  });

  @override
  State<DojangAmbientBackground> createState() => _DojangAmbientBackgroundState();
}

class _DojangAmbientBackgroundState extends State<DojangAmbientBackground>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    );
    if (widget.animateLight) {
      _controller.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final t = _controller.value;
        final sinVal = math.sin(t * math.pi * 2);
        final cosVal = math.cos(t * math.pi * 2);

        final beginAlignment = Alignment(-1.0 + 0.35 * sinVal, -1.0 + 0.25 * cosVal);
        final endAlignment = Alignment(1.0 - 0.35 * sinVal, 1.0 - 0.25 * cosVal);

        return Stack(
          fit: StackFit.expand,
          children: [
            // 1. Gambar Aksi Taekwondo Asli yang Mencolok
            Positioned.fill(
              child: Image.asset(
                'assets/images/bg_taekwondo.png',
                fit: BoxFit.cover,
                alignment: Alignment.topCenter,
              ),
            ),

            // 2. Animated Gradient Overlay Mencolok (Merah Crimson & Biru Taegeuk)
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: beginAlignment,
                    end: endAlignment,
                    colors: [
                      // Crimson Red khas Taekwondo
                      Color.fromRGBO(220, 38, 38, 0.38 + 0.12 * math.sin(t * math.pi)),
                      // Aksen Amber Emas
                      Color.fromRGBO(217, 119, 6, 0.22 + 0.08 * math.cos(t * math.pi)),
                      // Royal Blue khas Taekwondo
                      Color.fromRGBO(29, 78, 216, 0.36 + 0.10 * math.sin((t + 0.5) * math.pi)),
                      // Slate netral
                      const Color.fromRGBO(15, 23, 42, 0.50),
                    ],
                    stops: const [0.0, 0.32, 0.68, 1.0],
                  ),
                ),
              ),
            ),

            // 3. Watermark Arena Geometris Lapangan Oktagonal
            Positioned.fill(
              child: CustomPaint(
                painter: _DojangPainter(pulseProgress: t),
              ),
            ),

            // 4. White Frost Scrim agar kartu putih dan teks tetap 100% kontras dan nyaman dibaca
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.white.withValues(alpha: 0.18),
                      Colors.white.withValues(alpha: 0.45),
                      const Color(0xFFF8FAFC).withValues(alpha: 0.72),
                    ],
                    stops: const [0.0, 0.35, 1.0],
                  ),
                ),
              ),
            ),

            // 5. Konten Aplikasi (Kartu, Tombol, Teks)
            child!,
          ],
        );
      },
      child: widget.child,
    );
  }
}

class _DojangPainter extends CustomPainter {
  final double pulseProgress;

  _DojangPainter({required this.pulseProgress});

  @override
  void paint(Canvas canvas, Size size) {
    // Watermark Geometris Lapangan Oktagonal Taekwondo
    final octagonCenter = Offset(size.width * 0.5, size.height * 0.20);
    final octagonRadius = size.width * 0.44;

    final octagonPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.12)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    _drawOctagon(canvas, octagonCenter, octagonRadius, octagonPaint);

    final innerCirclePaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.08)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;
    canvas.drawCircle(octagonCenter, octagonRadius * 0.68, innerCirclePaint);

    // Garis diagonal tatami matras
    final linePaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.06)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 0.8;

    const double step = 56.0;
    for (double x = -size.height; x < size.width + size.height; x += step) {
      canvas.drawLine(
        Offset(x, 0),
        Offset(x + size.height, size.height),
        linePaint,
      );
    }
  }

  void _drawOctagon(Canvas canvas, Offset center, double radius, Paint paint) {
    final path = Path();
    for (int i = 0; i < 8; i++) {
      final angle = (i * 45 - 22.5) * math.pi / 180.0;
      final x = center.dx + radius * math.cos(angle);
      final y = center.dy + radius * math.sin(angle);
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    path.close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _DojangPainter oldDelegate) {
    return oldDelegate.pulseProgress != pulseProgress;
  }
}

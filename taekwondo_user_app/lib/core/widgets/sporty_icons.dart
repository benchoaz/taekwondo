import 'package:flutter/material.dart';

enum SportyIconType {
  schedule,
  spp,
  ukt,
  certificate,
}

class SportyIcon extends StatelessWidget {
  final SportyIconType type;
  final Color color;
  final double size;

  const SportyIcon({
    super.key,
    required this.type,
    this.color = Colors.white,
    this.size = 32,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _getPainter(type, color),
      ),
    );
  }

  CustomPainter _getPainter(SportyIconType type, Color color) {
    switch (type) {
      case SportyIconType.schedule:
        return _ScheduleIconPainter(color);
      case SportyIconType.spp:
        return _SppIconPainter(color);
      case SportyIconType.ukt:
        return _UktIconPainter(color);
      case SportyIconType.certificate:
        return _CertificateIconPainter(color);
    }
  }
}

// 🥋 1. JADWAL LATIHAN: Kombinasi Jam & Siluet Tendangan Tinggi (High Kick)
class _ScheduleIconPainter extends CustomPainter {
  final Color color;
  _ScheduleIconPainter(this.color);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round;

    final fillPaint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    // Draw clock outer ring
    canvas.drawCircle(Offset(size.width * 0.5, size.height * 0.5), size.width * 0.45, paint);

    // Draw clock hands
    canvas.drawLine(
      Offset(size.width * 0.5, size.height * 0.5),
      Offset(size.width * 0.5, size.height * 0.25),
      paint..strokeWidth = 2.0,
    );
    canvas.drawLine(
      Offset(size.width * 0.5, size.height * 0.5),
      Offset(size.width * 0.7, size.height * 0.5),
      paint..strokeWidth = 1.5,
    );

    // Draw Kicking Fighter Silhouette (Ap Chagi / Dollyo Chagi)
    final path = Path();
    // Torso & Head
    path.addOval(Rect.fromCircle(center: Offset(size.width * 0.35, size.height * 0.4), radius: 3));
    // Standing leg
    path.moveTo(size.width * 0.35, size.height * 0.43);
    path.lineTo(size.width * 0.38, size.height * 0.75);
    // Kicking leg (high kick)
    path.moveTo(size.width * 0.35, size.height * 0.43);
    path.lineTo(size.width * 0.65, size.height * 0.25);
    // Guarding arm
    path.moveTo(size.width * 0.35, size.height * 0.43);
    path.quadraticBezierTo(size.width * 0.25, size.height * 0.5, size.width * 0.3, size.height * 0.6);

    canvas.drawPath(path, paint..strokeWidth = 3.0);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// 💰 2. SPP: Perisai Sporty dengan Lambang Transaksi Aman & Cepat
class _SppIconPainter extends CustomPainter {
  final Color color;
  _SppIconPainter(this.color);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    // Draw Sporty Shield Path
    final shieldPath = Path();
    shieldPath.moveTo(size.width * 0.1, size.height * 0.15);
    shieldPath.lineTo(size.width * 0.9, size.height * 0.15);
    shieldPath.lineTo(size.width * 0.9, size.height * 0.5);
    shieldPath.quadraticBezierTo(
      size.width * 0.9,
      size.height * 0.85,
      size.width * 0.5,
      size.height * 0.95,
    );
    shieldPath.quadraticBezierTo(
      size.width * 0.1,
      size.height * 0.85,
      size.width * 0.1,
      size.height * 0.5,
    );
    shieldPath.close();

    canvas.drawPath(shieldPath, paint);

    // Draw transaction double checkmark / lightning bolt inside shield
    final innerPath = Path();
    innerPath.moveTo(size.width * 0.35, size.height * 0.45);
    innerPath.lineTo(size.width * 0.48, size.height * 0.6);
    innerPath.lineTo(size.width * 0.65, size.height * 0.35);
    canvas.drawPath(innerPath, paint..strokeWidth = 3.0);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// 🥋 3. UKT & KURIKULUM: Sabuk Taekwondo (Belt) Melingkar di Atas Dokumen
class _UktIconPainter extends CustomPainter {
  final Color color;
  _UktIconPainter(this.color);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    // Draw folded belt center
    final beltPath = Path();
    // Belt Loop left loop
    beltPath.moveTo(size.width * 0.2, size.height * 0.4);
    beltPath.quadraticBezierTo(size.width * 0.1, size.height * 0.5, size.width * 0.25, size.height * 0.6);
    // Belt center node
    beltPath.lineTo(size.width * 0.75, size.height * 0.6);
    beltPath.quadraticBezierTo(size.width * 0.9, size.height * 0.5, size.width * 0.8, size.height * 0.4);
    beltPath.lineTo(size.width * 0.2, size.height * 0.4);

    // Belt hanging end 1
    beltPath.moveTo(size.width * 0.45, size.height * 0.6);
    beltPath.lineTo(size.width * 0.35, size.height * 0.9);
    
    // Belt hanging end 2
    beltPath.moveTo(size.width * 0.55, size.height * 0.6);
    beltPath.lineTo(size.width * 0.65, size.height * 0.85);

    canvas.drawPath(beltPath, paint);

    // Draw document scroll background lines
    final docPath = Path();
    docPath.moveTo(size.width * 0.3, size.height * 0.15);
    docPath.lineTo(size.width * 0.7, size.height * 0.15);
    docPath.moveTo(size.width * 0.3, size.height * 0.25);
    docPath.lineTo(size.width * 0.7, size.height * 0.25);
    
    canvas.drawPath(docPath, paint..strokeWidth = 1.5);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// 👑 4. SERTIFIKAT DIGITAL: Dokumen Piagam dengan Lencana Medali Emas Menggantung
class _CertificateIconPainter extends CustomPainter {
  final Color color;
  _CertificateIconPainter(this.color);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final fillPaint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    // Draw Certificate Outer border (slanted for sporty speed)
    final certPath = Path();
    certPath.moveTo(size.width * 0.2, size.height * 0.1);
    certPath.lineTo(size.width * 0.85, size.height * 0.1);
    certPath.lineTo(size.width * 0.8, size.height * 0.75);
    certPath.lineTo(size.width * 0.15, size.height * 0.75);
    certPath.close();

    canvas.drawPath(certPath, paint);

    // Draw mini lines inside certificate
    canvas.drawLine(Offset(size.width * 0.35, size.height * 0.3), Offset(size.width * 0.65, size.height * 0.3), paint..strokeWidth = 1.5);
    canvas.drawLine(Offset(size.width * 0.3, size.height * 0.45), Offset(size.width * 0.7, size.height * 0.45), paint..strokeWidth = 1.5);

    // Draw Hanging Medal in the corner (lower right)
    final medalX = size.width * 0.75;
    final medalY = size.height * 0.75;

    // Medal Ribbon
    final ribbonPath = Path();
    ribbonPath.moveTo(medalX - 6, medalY - 10);
    ribbonPath.lineTo(medalX, medalY);
    ribbonPath.lineTo(medalX + 6, medalY - 10);
    canvas.drawPath(ribbonPath, paint..strokeWidth = 2.0);

    // Medal Circle
    canvas.drawCircle(Offset(medalX, medalY + 4), 6, fillPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

import 'package:flutter/material.dart';

class NeoBrutalCard extends StatelessWidget {
  final Widget child;
  final Color backgroundColor;
  final Color shadowColor;
  final double shadowOffset;
  final double borderWidth;
  final BorderRadius? borderRadius;
  final EdgeInsetsGeometry? padding;
  final Clip clipBehavior;

  const NeoBrutalCard({
    super.key,
    required this.child,
    this.backgroundColor = Colors.white,
    this.shadowColor = const Color(0xFF191C1D),
    this.shadowOffset = 6.0,
    this.borderWidth = 2.0,
    this.borderRadius,
    this.padding,
    this.clipBehavior = Clip.none,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      clipBehavior: clipBehavior,
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: borderRadius ?? BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF191C1D), width: borderWidth),
        boxShadow: [
          BoxShadow(
            color: shadowColor,
            offset: Offset(shadowOffset, shadowOffset),
          ),
        ],
      ),
      child: child,
    );
  }
}

class NeoBrutalButton extends StatefulWidget {
  final Widget child;
  final VoidCallback onPressed;
  final Color backgroundColor;
  final Color shadowColor;
  final double borderWidth;
  final BorderRadius? borderRadius;

  const NeoBrutalButton({
    super.key,
    required this.child,
    required this.onPressed,
    this.backgroundColor = Colors.white,
    this.shadowColor = const Color(0xFF191C1D),
    this.borderWidth = 2.0,
    this.borderRadius,
  });

  @override
  State<NeoBrutalButton> createState() => _NeoBrutalButtonState();
}

class _NeoBrutalButtonState extends State<NeoBrutalButton> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) {
        setState(() => _isPressed = false);
        widget.onPressed();
      },
      onTapCancel: () => setState(() => _isPressed = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 100),
        curve: Curves.easeOut,
        transform: Matrix4.translationValues(
          _isPressed ? 4.0 : 0.0,
          _isPressed ? 4.0 : 0.0,
          0.0,
        ),
        decoration: BoxDecoration(
          color: widget.backgroundColor,
          borderRadius: widget.borderRadius ?? BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFF191C1D), width: widget.borderWidth),
          boxShadow: [
            BoxShadow(
              color: widget.shadowColor,
              offset: Offset(_isPressed ? 0 : 6.0, _isPressed ? 0 : 6.0),
            ),
          ],
        ),
        child: widget.child,
      ),
    );
  }
}

class BeltTexturePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.black.withOpacity(0.05)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;
      
    double step = 6.0;
    for (double i = -size.height; i < size.width; i += step) {
      canvas.drawLine(
        Offset(i, 0),
        Offset(i + size.height, size.height),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

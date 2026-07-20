import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:lottie/lottie.dart';

class DynamicAssetWidget extends StatelessWidget {
  final String url;
  final double? width;
  final double? height;
  final BoxFit fit;
  final Color? color;
  final Widget? placeholder;

  final BlendMode? blendMode;

  const DynamicAssetWidget({
    super.key,
    required this.url,
    this.width,
    this.height,
    this.fit = BoxFit.contain,
    this.color,
    this.placeholder,
    this.blendMode,
  });

  @override
  Widget build(BuildContext context) {
    if (url.isEmpty) {
      return placeholder ?? const SizedBox.shrink();
    }

    final lowUrl = url.toLowerCase();

    // 1. Lottie (JSON)
    if (lowUrl.endsWith('.json')) {
      return Lottie.network(
        url,
        width: width,
        height: height,
        fit: fit,
        errorBuilder: (context, error, stackTrace) =>
            placeholder ?? const Icon(Icons.error_outline, color: Colors.white24),
      );
    }

    // 2. SVG Vector
    if (lowUrl.endsWith('.svg')) {
      return SvgPicture.network(
        url,
        width: width,
        height: height,
        fit: fit,
        colorFilter: color != null ? ColorFilter.mode(color!, BlendMode.srcIn) : null,
        placeholderBuilder: (context) =>
            placeholder ?? const SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
      );
    }

    // 3. Raster Image (PNG, JPG, WEBP, GIF, dll)
    return Image.network(
      url,
      width: width,
      height: height,
      fit: fit,
      color: color,
      colorBlendMode: blendMode,
      errorBuilder: (context, error, stackTrace) =>
          placeholder ?? const Icon(Icons.broken_image, color: Colors.white24),
    );
  }
}

import 'dart:io';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';

class ImageAdjustDialog extends StatefulWidget {
  final XFile imageFile;
  final String? frameUrl;

  const ImageAdjustDialog({
    super.key,
    required this.imageFile,
    this.frameUrl,
  });

  @override
  State<ImageAdjustDialog> createState() => _ImageAdjustDialogState();
}

class _ImageAdjustDialogState extends State<ImageAdjustDialog> {
  final TransformationController _transformationController = TransformationController();
  int _rotationQuarter = 0; // 0, 1, 2, 3 (each is 90 degrees)
  bool _isProcessing = false;

  String _getAbsoluteUrl(String? path) {
    if (path == null || path.isEmpty) return '';
    if (path.startsWith('http')) return path;
    final cleanPath = path.startsWith('/') ? path : '/$path';
    return 'https://www.whitetigerkraksaan.com$cleanPath';
  }

  void _rotateImage() {
    setState(() {
      _rotationQuarter = (_rotationQuarter + 1) % 4;
      // Reset zoom/pan when rotated to avoid boundary issues
      _transformationController.value = Matrix4.identity();
    });
  }

  Future<void> _processAndSave() async {
    setState(() => _isProcessing = true);
    try {
      // 1. Load image info
      final bytes = await File(widget.imageFile.path).readAsBytes();
      final ui.Codec codec = await ui.instantiateImageCodec(bytes);
      final ui.FrameInfo frameInfo = await codec.getNextFrame();
      final ui.Image rawImage = frameInfo.image;

      // 2. Setup Canvas Recorder (Cropped Image size: 800x800)
      const double targetSize = 800.0;
      final recorder = ui.PictureRecorder();
      final canvas = Canvas(recorder, const Rect.fromLTWH(0, 0, targetSize, targetSize));

      // Clip as circle so background is transparent / clean circular crop
      final clipPath = Path()..addOval(const Rect.fromLTWH(0, 0, targetSize, targetSize));
      canvas.clipPath(clipPath);

      // Fill with solid dark background first (in case of blank spaces)
      canvas.drawRect(
        const Rect.fromLTWH(0, 0, targetSize, targetSize),
        Paint()..color = const Color(0xFF0F172A),
      );

      // Get interactive viewer matrix values
      final Matrix4 matrix = _transformationController.value;
      final double scale = matrix.getMaxScaleOnAxis();
      final double translationX = matrix.entry(0, 3);
      final double translationY = matrix.entry(1, 3);

      // Viewport size on screen is 280x280
      const double viewportSize = 280.0;
      const double ratio = targetSize / viewportSize;

      // Calculate base sizes
      double imgWidth = rawImage.width.toDouble();
      double imgHeight = rawImage.height.toDouble();

      // Check if image is landscape or portrait to fit
      double fitScale = 1.0;
      if (imgWidth > imgHeight) {
        fitScale = viewportSize / imgHeight;
      } else {
        fitScale = viewportSize / imgWidth;
      }

      // Draw transforming image
      canvas.save();
      
      // Apply user transformations
      canvas.translate(targetSize / 2, targetSize / 2);
      
      // Apply rotation (90 deg increments)
      canvas.rotate(_rotationQuarter * (3.141592653589793 * 2) / 4);
      
      // Scale and Translate
      canvas.scale(scale);
      canvas.translate(
        (translationX - (viewportSize - imgWidth * fitScale) / 2) * ratio / scale,
        (translationY - (viewportSize - imgHeight * fitScale) / 2) * ratio / scale,
      );

      // Draw raw image centered
      canvas.drawImageRect(
        rawImage,
        Rect.fromLTWH(0, 0, imgWidth, imgHeight),
        Rect.fromLTWH(-imgWidth * fitScale * ratio / 2, -imgHeight * fitScale * ratio / 2, imgWidth * fitScale * ratio, imgHeight * fitScale * ratio),
        Paint()..filterQuality = ui.FilterQuality.high,
      );

      canvas.restore();

      // 3. Render Canvas to bytes
      final picture = recorder.endRecording();
      final ui.Image croppedImage = await picture.toImage(targetSize.toInt(), targetSize.toInt());
      final byteData = await croppedImage.toByteData(format: ui.ImageByteFormat.png);
      
      if (byteData == null) throw Exception('Gagal memproses gambar');
      final croppedBytes = byteData.buffer.asUint8List();

      // 4. Save to temporary file in same folder
      final String originalPath = widget.imageFile.path;
      final String directoryPath = originalPath.substring(0, originalPath.lastIndexOf('/'));
      final String newPath = '$directoryPath/profile_cropped_${DateTime.now().millisecondsSinceEpoch}.png';
      
      final File croppedFile = File(newPath);
      await croppedFile.writeAsBytes(croppedBytes);

      if (mounted) {
        Navigator.of(context).pop(XFile(newPath));
      }
    } catch (e) {
      debugPrint('[ProcessImageError] $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal memproses penyesuaian foto: $e')),
        );
        Navigator.of(context).pop();
      }
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    Color themeColor = const Color(0xFFE2241F);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        foregroundColor: Colors.white,
        title: Text(
          'SESUAIKAN FOTO',
          style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold, letterSpacing: 1, fontSize: 16),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.rotate_right_rounded, color: Colors.white),
            onPressed: _rotateImage,
            tooltip: 'Putar Foto',
          )
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: Center(
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // Base Image with Interactive Viewer
                    Container(
                      width: 280,
                      height: 280,
                      decoration: const BoxDecoration(
                        color: Color(0xFF1E222D),
                        shape: BoxShape.circle,
                      ),
                      clipBehavior: Clip.antiAlias,
                      child: RotatedBox(
                        quarterTurns: _rotationQuarter,
                        child: InteractiveViewer(
                          transformationController: _transformationController,
                          minScale: 0.5,
                          maxScale: 4.0,
                          boundaryMargin: const EdgeInsets.all(100),
                          child: Center(
                            child: Image.file(
                              File(widget.imageFile.path),
                              fit: BoxFit.contain,
                            ),
                          ),
                        ),
                      ),
                    ),
                    
                    // Circular Crop Guide Mask
                    IgnorePointer(
                      child: Container(
                        width: 280,
                        height: 280,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white.withValues(alpha: 0.5), width: 2),
                        ),
                      ),
                    ),

                    // Gamification Frame Overlay (so they see exactly how it aligns with their frame!)
                    if (widget.frameUrl != null && widget.frameUrl!.isNotEmpty)
                      IgnorePointer(
                        child: SizedBox(
                          width: 320, // slightly larger to scale correctly with frame
                          height: 320,
                          child: Image.network(
                            _getAbsoluteUrl(widget.frameUrl),
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) => const SizedBox(),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
            
            // Bottom Controls
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
              decoration: const BoxDecoration(
                color: Color(0xFF1E222D),
                borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Gunakan cubitan untuk zoom & geser foto agar pas di dalam lingkaran dan bingkai.',
                    style: GoogleFonts.plusJakartaSans(
                      color: const Color(0xFF94A3B8),
                      fontSize: 12,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Expanded(
                        child: TextButton(
                          onPressed: _isProcessing ? null : () => Navigator.of(context).pop(),
                          style: TextButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            foregroundColor: Colors.white70,
                          ),
                          child: Text(
                            'BATAL',
                            style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _isProcessing ? null : _processAndSave,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: themeColor,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            elevation: 0,
                          ),
                          child: _isProcessing
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                )
                              : Text(
                                  'UNGGAH FOTO',
                                  style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold),
                                ),
                        ),
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
  }
}

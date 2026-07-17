import 'dart:ui';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';

class ShopItem {
  final String id;
  final String name;
  final String description;
  final int price;
  final String type; // FRAME, TITLE, THEME, EMBLEM
  final String? itemUrl;
  final bool owned;
  final bool equipped;
  final String? cssValue;

  ShopItem({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.type,
    this.itemUrl,
    required this.owned,
    required this.equipped,
    this.cssValue,
  });

  factory ShopItem.fromJson(Map<String, dynamic> json) {
    return ShopItem(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: json['price'] ?? 0,
      type: json['type'] ?? 'FRAME',
      itemUrl: json['imageUrl'] ?? json['itemUrl'],
      owned: json['owned'] ?? false,
      equipped: json['equipped'] ?? false,
      cssValue: json['cssValue']?.toString(),
    );
  }
}

class ShopData {
  final int wallet;
  final Map<String, String?> active;
  final List<ShopItem> items;

  ShopData({
    required this.wallet,
    required this.active,
    required this.items,
  });

  factory ShopData.fromJson(Map<String, dynamic> json) {
    final activeMap = json['active'] as Map<String, dynamic>? ?? {};
    return ShopData(
      wallet: json['wallet'] ?? 0,
      active: {
        'frameId': activeMap['frameId']?.toString(),
        'titleId': activeMap['titleId']?.toString(),
        'themeId': activeMap['themeId']?.toString(),
        'emblemId': activeMap['emblemId']?.toString(),
      },
      items: (json['items'] as List? ?? []).map((e) => ShopItem.fromJson(e)).toList(),
    );
  }
}

class ShopService {
  final Ref _ref;

  ShopService(this._ref);

  Future<ShopData> getShopData() async {
    final dio = _ref.read(dioProvider);
    final response = await dio.get('/shop');
    if (response.statusCode == 200 && response.data['success'] == true) {
      return ShopData.fromJson(response.data);
    } else {
      throw Exception('Gagal memuat toko item');
    }
  }

  Future<bool> buyItem(String itemId) async {
    final dio = _ref.read(dioProvider);
    final response = await dio.post('/shop/buy', data: {'itemId': itemId});
    return response.statusCode == 200 && response.data['success'] == true;
  }

  Future<bool> equipItem(String itemId) async {
    final dio = _ref.read(dioProvider);
    final response = await dio.post('/shop/equip', data: {'itemId': itemId});
    return response.statusCode == 200 && response.data['success'] == true;
  }

  Future<bool> unequipItem(String itemId) async {
    final dio = _ref.read(dioProvider);
    final response = await dio.post('/shop/unequip', data: {'itemId': itemId});
    return response.statusCode == 200 && response.data['success'] == true;
  }
}

final shopServiceProvider = Provider<ShopService>((ref) => ShopService(ref));

final shopDataProvider = FutureProvider.autoDispose<ShopData>((ref) async {
  final service = ref.watch(shopServiceProvider);
  return service.getShopData();
});

class CssValueParser {
  static Color? parseColor(String hexStr) {
    try {
      final cleanHex = hexStr.replaceAll('#', '').trim();
      if (cleanHex.length == 6) {
        return Color(int.parse('FF$cleanHex', radix: 16));
      } else if (cleanHex.length == 8) {
        return Color(int.parse(cleanHex, radix: 16));
      }
    } catch (_) {}
    return null;
  }

  /// Mem-parsing string CSS sederhana (contoh: "border: 3px solid #3b82f6; box-shadow: 0 0 10px #3b82f6;")
  /// untuk mengambil data warna border, tebal border, dan boxShadow efek glow.
  static Map<String, dynamic> parseCss(String? css) {
    Color? borderColor;
    double borderWidth = 2.0;
    Color? glowColor;
    double glowBlurRadius = 0.0;

    if (css == null || css.isEmpty) {
      return {};
    }

    try {
      final declarations = css.split(';');
      for (var decl in declarations) {
        if (!decl.contains(':')) continue;
        final parts = decl.split(':');
        final key = parts[0].trim().toLowerCase();
        final value = parts.sublist(1).join(':').trim().toLowerCase();

        // 1. Parsing border: e.g. "3px solid #3b82f6"
        if (key == 'border') {
          // Cari hex color (#3b82f6)
          final hexMatch = RegExp(r'#[a-f0-9]{6,8}').firstMatch(value);
          if (hexMatch != null) {
            borderColor = parseColor(hexMatch.group(0)!);
          }
          // Cari ketebalan border (e.g. 3px)
          final widthMatch = RegExp(r'(\d+)\s*px').firstMatch(value);
          if (widthMatch != null) {
            borderWidth = double.tryParse(widthMatch.group(1)!) ?? borderWidth;
          }
        }
        
        // 2. Parsing box-shadow: e.g. "0 0 10px #3b82f6" atau "0 0 15px rgba(59, 130, 246, 0.8)"
        else if (key == 'box-shadow') {
          // Cari hex color
          final hexMatch = RegExp(r'#[a-f0-9]{6,8}').firstMatch(value);
          if (hexMatch != null) {
            glowColor = parseColor(hexMatch.group(0)!);
          } else if (value.contains('rgba')) {
            // Parsing rgba(59, 130, 246, 0.8)
            final rgbaMatch = RegExp(r'rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d\.]+)\s*\)').firstMatch(value);
            if (rgbaMatch != null) {
              final r = int.parse(rgbaMatch.group(1)!);
              final g = int.parse(rgbaMatch.group(2)!);
              final b = int.parse(rgbaMatch.group(3)!);
              final a = double.parse(rgbaMatch.group(4)!);
              glowColor = Color.fromARGB((a * 255).round(), r, g, b);
            }
          }
          // Cari radius blur (e.g. 15px)
          // Biasanya berformat "X Y blurRadius color" -> ambil angka ketiga/terakhir px
          final blurMatches = RegExp(r'(\d+)\s*px').allMatches(value);
          if (blurMatches.length >= 3) {
            glowBlurRadius = double.tryParse(blurMatches.elementAt(2).group(1)!) ?? glowBlurRadius;
          } else if (blurMatches.isNotEmpty) {
            glowBlurRadius = double.tryParse(blurMatches.last.group(1)!) ?? glowBlurRadius;
          }
        }
      }
    } catch (_) {}

    return {
      'borderColor': borderColor,
      'borderWidth': borderWidth,
      'glowColor': glowColor,
      'glowBlurRadius': glowBlurRadius,
    };
  }
}

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

  ShopItem({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.type,
    this.itemUrl,
    required this.owned,
    required this.equipped,
  });

  factory ShopItem.fromJson(Map<String, dynamic> json) {
    return ShopItem(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: json['price'] ?? 0,
      type: json['type'] ?? 'FRAME',
      itemUrl: json['itemUrl'],
      owned: json['owned'] ?? false,
      equipped: json['equipped'] ?? false,
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
}

final shopServiceProvider = Provider<ShopService>((ref) => ShopService(ref));

final shopDataProvider = FutureProvider.autoDispose<ShopData>((ref) async {
  final service = ref.watch(shopServiceProvider);
  return service.getShopData();
});

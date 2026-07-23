import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../auth/data/auth_provider.dart';

class SppInvoice {
  final String id;
  final int month;
  final int year;
  final double amount;
  final String status;
  final String? paymentMethod;
  final String? validatedBy;

  SppInvoice({
    required this.id,
    required this.month,
    required this.year,
    required this.amount,
    required this.status,
    this.paymentMethod,
    this.validatedBy,
  });

  factory SppInvoice.fromJson(Map<String, dynamic> json) {
    final payment = json['payment'] as Map<String, dynamic>?;
    final receiver = payment?['receiver'] as Map<String, dynamic>?;

    return SppInvoice(
      id: json['id'] ?? '',
      month: json['month'] ?? 1,
      year: json['year'] ?? 2026,
      amount: (json['amount'] as num?)?.toDouble() ?? 0,
      status: json['status'] ?? 'UNPAID',
      paymentMethod: payment?['paymentMethod']?.toString(),
      validatedBy: receiver?['name']?.toString(),
    );
  }
}

/// Mengambil tagihan SPP terbaru milik member yang sedang login.
/// Menggunakan [dioProvider] — JWT token di-inject otomatis oleh interceptor.
final sppProvider = FutureProvider.autoDispose<SppInvoice?>((ref) async {
  final authState = ref.watch(authProvider);
  final user = authState.value;
  if (user == null) return null;

  final dio = ref.watch(dioProvider);

  try {
    final response = await dio.get('/spp');
    if (response.statusCode == 200) {
      final List data = response.data;
      if (data.isNotEmpty) {
        final unpaid = data.firstWhere(
          (s) => s['status'] == 'UNPAID' || s['status'] == 'OVERDUE' || s['status'] == 'PENDING',
          orElse: () => data.first,
        );
        return SppInvoice.fromJson(unpaid);
      }
    }
  } catch (e) {
    debugPrint('[SppService] Error fetching SPP: $e');
  }
  return null;
});

final sppListProvider = FutureProvider.autoDispose<List<SppInvoice>>((ref) async {
  final authState = ref.watch(authProvider);
  final user = authState.value;
  if (user == null) return [];

  final dio = ref.watch(dioProvider);

  try {
    final response = await dio.get('/spp');
    if (response.statusCode == 200) {
      final List data = response.data;
      return data.map((json) => SppInvoice.fromJson(json)).toList();
    }
  } catch (e) {
    debugPrint('[SppService] Error fetching SPP list: $e');
  }
  return [];
});

class IncidentalPayment {
  final String id;
  final String purpose;
  final double amount;
  final String status;
  final DateTime? dueDate;
  final DateTime? createdAt;
  final String? paymentMethod;
  final String? validatedBy;

  IncidentalPayment({
    required this.id,
    required this.purpose,
    required this.amount,
    required this.status,
    this.dueDate,
    this.createdAt,
    this.paymentMethod,
    this.validatedBy,
  });

  factory IncidentalPayment.fromJson(Map<String, dynamic> json) {
    final receiver = json['receiver'] as Map<String, dynamic>?;
    return IncidentalPayment(
      id: json['id'] ?? '',
      purpose: json['purpose'] ?? 'Tagihan Khusus',
      amount: (json['amount'] as num?)?.toDouble() ?? 0,
      status: json['status'] ?? 'PENDING',
      dueDate: json['dueDate'] != null ? DateTime.tryParse(json['dueDate']) : null,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
      paymentMethod: json['paymentMethod']?.toString(),
      validatedBy: receiver?['name']?.toString(),
    );
  }
}

final incidentalPaymentsProvider = FutureProvider.autoDispose<List<IncidentalPayment>>((ref) async {
  final authState = ref.watch(authProvider);
  final user = authState.value;
  if (user == null) return [];

  final dio = ref.watch(dioProvider);

  try {
    final response = await dio.get('/payments');
    if (response.statusCode == 200) {
      final List data = response.data;
      final List<IncidentalPayment> items = [];
      for (final json in data) {
        final purpose = (json['purpose'] ?? '').toString();
        // Skip routine monthly SPP records which are displayed in the SPP table
        if (!purpose.startsWith('SPP ') && !purpose.contains('SPP Bulanan')) {
          items.add(IncidentalPayment.fromJson(json));
        }
      }
      return items;
    }
  } catch (e) {
    debugPrint('[SppService] Error fetching incidental payments: $e');
  }
  return [];
});


class BadgeModel {
  final String id;
  final String name;
  final String iconUrl;
  final String? description;
  final String condition;
  final bool unlocked;
  final DateTime? earnedAt;

  BadgeModel({
    required this.id,
    required this.name,
    required this.iconUrl,
    this.description,
    required this.condition,
    required this.unlocked,
    this.earnedAt,
  });

  factory BadgeModel.fromJson(Map<String, dynamic> json) {
    return BadgeModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      iconUrl: json['iconUrl'] ?? json['icon_url'] ?? '🏅',
      description: json['description'],
      condition: json['condition'] ?? '',
      unlocked: json['unlocked'] ?? false,
      earnedAt: json['earnedAt'] != null ? DateTime.parse(json['earnedAt']) : null,
    );
  }
}

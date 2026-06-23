class SettingModel {
  final String dojangName;
  final String motto;
  final String? logoUrl;

  SettingModel({
    required this.dojangName,
    required this.motto,
    this.logoUrl,
  });

  factory SettingModel.fromJson(Map<String, dynamic> json) {
    return SettingModel(
      dojangName: json['dojangName'] ?? 'DOJO MASTER',
      motto: json['motto'] ?? 'PRECISION & DISCIPLINE',
      logoUrl: json['logoUrl'],
    );
  }
}

class UserModel {
  final String id;
  final String email;
  final String role;
  final String? token;
  final String? name;
  final String? memberNumber;
  final String? currentBelt;
  final int? progress;

  UserModel({
    required this.id,
    required this.email,
    required this.role,
    this.token,
    this.name,
    this.memberNumber,
    this.currentBelt,
    this.progress,
  });

  factory UserModel.fromJson(Map<String, dynamic> json, {String? token}) {
    return UserModel(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'MEMBER',
      token: token ?? json['token'],
      name: json['name'],
      memberNumber: json['memberNumber'],
      currentBelt: json['currentBelt'],
      progress: json['progress'] != null ? int.tryParse(json['progress'].toString()) : null,
    );
  }
}

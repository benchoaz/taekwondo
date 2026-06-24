class AttendanceModel {
  final String? id;
  final String memberId;
  final DateTime date;
  final bool present;
  final String? memberName;
  final String? memberNumber;

  AttendanceModel({
    this.id,
    required this.memberId,
    required this.date,
    required this.present,
    this.memberName,
    this.memberNumber,
  });

  factory AttendanceModel.fromJson(Map<String, dynamic> json) {
    return AttendanceModel(
      id: json['id'],
      memberId: json['memberId'],
      date: DateTime.parse(json['date']),
      present: json['present'] ?? false,
      memberName: json['member']?['fullName'],
      memberNumber: json['member']?['memberNumber'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'memberId': memberId,
      'date': date.toIso8601String(),
      'present': present,
    };
  }
}

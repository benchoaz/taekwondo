class ScheduleModel {
  final String id;
  final String dayOfWeek;
  final String startTime;
  final String endTime;
  final String className;
  final String location;
  final String coachId;
  final CoachInfo? coach;

  ScheduleModel({
    required this.id,
    required this.dayOfWeek,
    required this.startTime,
    required this.endTime,
    required this.className,
    required this.location,
    required this.coachId,
    this.coach,
  });

  factory ScheduleModel.fromJson(Map<String, dynamic> json) {
    return ScheduleModel(
      id: json['id'] ?? '',
      dayOfWeek: json['dayOfWeek'] ?? json['day_of_week'] ?? '',
      startTime: json['startTime'] ?? json['start_time'] ?? '',
      endTime: json['endTime'] ?? json['end_time'] ?? '',
      className: json['className'] ?? json['class_name'] ?? '',
      location: json['location'] ?? '',
      coachId: json['coachId'] ?? json['coach_id'] ?? '',
      coach: json['coach'] != null ? CoachInfo.fromJson(json['coach']) : null,
    );
  }
}

class CoachInfo {
  final String id;
  final String fullName;
  final int? danRank;

  CoachInfo({
    required this.id,
    required this.fullName,
    this.danRank,
  });

  factory CoachInfo.fromJson(Map<String, dynamic> json) {
    return CoachInfo(
      id: json['id'] ?? '',
      fullName: json['fullName'] ?? json['full_name'] ?? '',
      danRank: json['danRank'] != null
          ? int.tryParse(json['danRank'].toString())
          : (json['dan_rank'] != null ? int.tryParse(json['dan_rank'].toString()) : null),
    );
  }
}

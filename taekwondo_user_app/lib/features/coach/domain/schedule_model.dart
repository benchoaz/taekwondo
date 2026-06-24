class ScheduleModel {
  final String id;
  final String dayOfWeek;
  final String startTime;
  final String endTime;
  final String className;
  final String location;
  final String coachId;
  final String? coachName;

  ScheduleModel({
    required this.id,
    required this.dayOfWeek,
    required this.startTime,
    required this.endTime,
    required this.className,
    required this.location,
    required this.coachId,
    this.coachName,
  });

  factory ScheduleModel.fromJson(Map<String, dynamic> json) {
    return ScheduleModel(
      id: json['id'],
      dayOfWeek: json['dayOfWeek'],
      startTime: json['startTime'],
      endTime: json['endTime'],
      className: json['className'],
      location: json['location'],
      coachId: json['coachId'],
      coachName: json['coach']?['fullName'],
    );
  }
}

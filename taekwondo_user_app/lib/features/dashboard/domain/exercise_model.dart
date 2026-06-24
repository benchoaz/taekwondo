class TrainingProgram {
  final String id;
  final String title;
  final String? description;
  final bool isActive;
  final List<Exercise> exercises;

  TrainingProgram({
    required this.id,
    required this.title,
    this.description,
    required this.isActive,
    required this.exercises,
  });

  factory TrainingProgram.fromJson(Map<String, dynamic> json) {
    var list = json['exercises'] as List? ?? [];
    List<Exercise> parsedExercises = list.map((e) => Exercise.fromJson(e)).toList();

    return TrainingProgram(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      isActive: json['isActive'] ?? json['is_active'] ?? true,
      exercises: parsedExercises,
    );
  }
}

class Exercise {
  final String id;
  final String programId;
  final String name;
  final int? reps;
  final int? sets;
  final int order;

  Exercise({
    required this.id,
    required this.programId,
    required this.name,
    this.reps,
    this.sets,
    required this.order,
  });

  factory Exercise.fromJson(Map<String, dynamic> json) {
    return Exercise(
      id: json['id'] ?? '',
      programId: json['programId'] ?? json['program_id'] ?? '',
      name: json['name'] ?? '',
      reps: json['reps'],
      sets: json['sets'],
      order: json['order'] ?? 0,
    );
  }
}

class ExerciseLog {
  final String id;
  final String memberId;
  final String exerciseId;
  final DateTime completedAt;
  final String? notes;

  ExerciseLog({
    required this.id,
    required this.memberId,
    required this.exerciseId,
    required this.completedAt,
    this.notes,
  });

  factory ExerciseLog.fromJson(Map<String, dynamic> json) {
    return ExerciseLog(
      id: json['id'] ?? '',
      memberId: json['memberId'] ?? json['member_id'] ?? '',
      exerciseId: json['exerciseId'] ?? json['exercise_id'] ?? '',
      completedAt: DateTime.parse(json['completedAt'] ?? json['completed_at'] ?? DateTime.now().toIso8601String()),
      notes: json['notes'],
    );
  }
}

class DailyQuestResponse {
  final List<TrainingProgram> programs;
  final List<ExerciseLog> logs;

  DailyQuestResponse({required this.programs, required this.logs});

  factory DailyQuestResponse.fromJson(Map<String, dynamic> json) {
    var progList = json['programs'] as List? ?? [];
    List<TrainingProgram> parsedPrograms = progList.map((p) => TrainingProgram.fromJson(p)).toList();

    var logList = json['logs'] as List? ?? [];
    List<ExerciseLog> parsedLogs = logList.map((l) => ExerciseLog.fromJson(l)).toList();

    return DailyQuestResponse(
      programs: parsedPrograms,
      logs: parsedLogs,
    );
  }
}

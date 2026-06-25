class QuestLibrary {
  final String id;
  final String title;
  final String? description;
  final String category;
  final int baseXp;

  QuestLibrary({
    required this.id,
    required this.title,
    this.description,
    required this.category,
    required this.baseXp,
  });

  factory QuestLibrary.fromJson(Map<String, dynamic> json) {
    return QuestLibrary(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      category: json['category'] ?? '',
      baseXp: json['baseXp'] ?? json['base_xp'] ?? 0,
    );
  }
}

class DailyQuestLog {
  final String id;
  final String memberId;
  final String questId;
  final bool completed;
  final DateTime? completedAt;
  final QuestLibrary? quest;

  DailyQuestLog({
    required this.id,
    required this.memberId,
    required this.questId,
    required this.completed,
    this.completedAt,
    this.quest,
  });

  factory DailyQuestLog.fromJson(Map<String, dynamic> json) {
    return DailyQuestLog(
      id: json['id'] ?? '',
      memberId: json['memberId'] ?? json['member_id'] ?? '',
      questId: json['questId'] ?? json['quest_id'] ?? '',
      completed: json['completed'] ?? false,
      completedAt: json['completedAt'] != null || json['completed_at'] != null
          ? DateTime.parse(json['completedAt'] ?? json['completed_at'])
          : null,
      quest: json['quest'] != null ? QuestLibrary.fromJson(json['quest']) : null,
    );
  }
}

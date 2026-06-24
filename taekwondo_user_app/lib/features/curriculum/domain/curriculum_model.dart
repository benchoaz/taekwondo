class BeltCurriculum {
  final String id;
  final String name;
  final int level;
  final String? nextBeltId;
  final int minAttendance;
  final int minTechScore;
  final int minPoomsae;
  final int minPhysical;
  final List<CurriculumCategory> categories;

  BeltCurriculum({
    required this.id,
    required this.name,
    required this.level,
    this.nextBeltId,
    required this.minAttendance,
    required this.minTechScore,
    required this.minPoomsae,
    required this.minPhysical,
    required this.categories,
  });

  factory BeltCurriculum.fromJson(Map<String, dynamic> json) {
    var catList = json['categories'] as List? ?? [];
    List<CurriculumCategory> parsedCategories =
        catList.map((c) => CurriculumCategory.fromJson(c)).toList();

    return BeltCurriculum(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      level: json['level'] ?? 0,
      nextBeltId: json['next_belt_id'] ?? json['nextBeltId'],
      minAttendance: json['minAttendance'] ?? 80,
      minTechScore: json['minTechScore'] ?? 70,
      minPoomsae: json['minPoomsae'] ?? 70,
      minPhysical: json['minPhysical'] ?? 70,
      categories: parsedCategories,
    );
  }
}

class CurriculumCategory {
  final String id;
  final String beltId;
  final String name;
  final int order;
  final List<CurriculumMaterial> materials;

  CurriculumCategory({
    required this.id,
    required this.beltId,
    required this.name,
    required this.order,
    required this.materials,
  });

  factory CurriculumCategory.fromJson(Map<String, dynamic> json) {
    var matList = json['materials'] as List? ?? [];
    List<CurriculumMaterial> parsedMaterials =
        matList.map((m) => CurriculumMaterial.fromJson(m)).toList();

    return CurriculumCategory(
      id: json['id'] ?? '',
      beltId: json['beltId'] ?? json['belt_id'] ?? '',
      name: json['name'] ?? '',
      order: json['order'] ?? 0,
      materials: parsedMaterials,
    );
  }
}

class CurriculumMaterial {
  final String id;
  final String categoryId;
  final String title;
  final String? videoUrl;
  final int order;

  CurriculumMaterial({
    required this.id,
    required this.categoryId,
    required this.title,
    this.videoUrl,
    required this.order,
  });

  factory CurriculumMaterial.fromJson(Map<String, dynamic> json) {
    return CurriculumMaterial(
      id: json['id'] ?? '',
      categoryId: json['categoryId'] ?? json['category_id'] ?? '',
      title: json['title'] ?? '',
      videoUrl: json['videoUrl'] ?? json['video_url'],
      order: json['order'] ?? 0,
    );
  }
}

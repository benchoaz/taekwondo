class UktExam {
  final String id;
  final String title;
  final DateTime date;
  final String location;
  final String status;

  UktExam({
    required this.id,
    required this.title,
    required this.date,
    required this.location,
    required this.status,
  });

  factory UktExam.fromJson(Map<String, dynamic> json) {
    return UktExam(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      date: DateTime.parse(json['date'] ?? DateTime.now().toIso8601String()),
      location: json['location'] ?? '',
      status: json['status'] ?? 'UPCOMING',
    );
  }
}

class UktParticipant {
  final String id;
  final String uktExamId;
  final String memberId;
  final String targetBelt;
  final String status;
  final double poomsaeScore;
  final double kyorugiScore;
  final double basicTechScore;
  final double physicalScore;
  final double theoryScore;
  final double finalScore;

  UktParticipant({
    required this.id,
    required this.uktExamId,
    required this.memberId,
    required this.targetBelt,
    required this.status,
    required this.poomsaeScore,
    required this.kyorugiScore,
    required this.basicTechScore,
    required this.physicalScore,
    required this.theoryScore,
    required this.finalScore,
  });

  factory UktParticipant.fromJson(Map<String, dynamic> json) {
    return UktParticipant(
      id: json['id'] ?? '',
      uktExamId: json['uktExamId'] ?? json['ukt_exam_id'] ?? '',
      memberId: json['memberId'] ?? json['member_id'] ?? '',
      targetBelt: json['targetBelt'] ?? json['target_belt'] ?? '',
      status: json['status'] ?? 'PENDING',
      poomsaeScore: double.tryParse(json['poomsaeScore']?.toString() ?? json['poomsae_score']?.toString() ?? '0') ?? 0.0,
      kyorugiScore: double.tryParse(json['kyorugiScore']?.toString() ?? json['kyorugi_score']?.toString() ?? '0') ?? 0.0,
      basicTechScore: double.tryParse(json['basicTechScore']?.toString() ?? json['basic_tech_score']?.toString() ?? '0') ?? 0.0,
      physicalScore: double.tryParse(json['physicalScore']?.toString() ?? json['physical_score']?.toString() ?? '0') ?? 0.0,
      theoryScore: double.tryParse(json['theoryScore']?.toString() ?? json['theory_score']?.toString() ?? '0') ?? 0.0,
      finalScore: double.tryParse(json['finalScore']?.toString() ?? json['final_score']?.toString() ?? '0') ?? 0.0,
    );
  }
}

class UktStatusResponse {
  final UktExam? exam;
  final UktParticipant? registration;

  UktStatusResponse({this.exam, this.registration});

  factory UktStatusResponse.fromJson(Map<String, dynamic> json) {
    return UktStatusResponse(
      exam: json['exam'] != null ? UktExam.fromJson(json['exam']) : null,
      registration: json['registration'] != null ? UktParticipant.fromJson(json['registration']) : null,
    );
  }
}

class UktExam {
  final String id;
  final String title;
  final DateTime date;
  final String location;
  final String status;
  final int participantCount;

  UktExam({
    required this.id,
    required this.title,
    required this.date,
    required this.location,
    required this.status,
    this.participantCount = 0,
  });

  factory UktExam.fromJson(Map<String, dynamic> json) {
    return UktExam(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      date: DateTime.parse(json['date'] ?? DateTime.now().toIso8601String()),
      location: json['location'] ?? '',
      status: json['status'] ?? 'UPCOMING',
      participantCount: (json['participants'] as List?)?.length ?? 0,
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
  final Map<String, String> uploadedDocs; // dokumen syarat yang sudah diupload

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
    this.uploadedDocs = const {},
  });

  factory UktParticipant.fromJson(Map<String, dynamic> json) {
    // Parse uploadedDocs (bisa berupa Map atau null)
    Map<String, String> docs = {};
    if (json['uploadedDocs'] is Map) {
      (json['uploadedDocs'] as Map).forEach((k, v) {
        if (k != null && v != null) docs[k.toString()] = v.toString();
      });
    }
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
      uploadedDocs: docs,
    );
  }
}

/// Info kelayakan kehadiran dari API /api/ukt
class UktEligibility {
  final int totalHadir;
  final int totalSesiTerjadwal;
  final int persentaseKehadiran;
  final int periodMonths;
  final int minAttendancePercent;
  final int minAttendanceSessions;
  final bool eligible;
  final String sejak;

  UktEligibility({
    required this.totalHadir,
    required this.totalSesiTerjadwal,
    required this.persentaseKehadiran,
    required this.periodMonths,
    required this.minAttendancePercent,
    required this.minAttendanceSessions,
    required this.eligible,
    required this.sejak,
  });

  factory UktEligibility.fromJson(Map<String, dynamic> json) {
    return UktEligibility(
      totalHadir: json['totalHadir'] ?? 0,
      totalSesiTerjadwal: json['totalSesiTerjadwal'] ?? 0,
      persentaseKehadiran: json['persentaseKehadiran'] ?? 100,
      periodMonths: json['periodMonths'] ?? 3,
      minAttendancePercent: json['minAttendancePercent'] ?? 0,
      minAttendanceSessions: json['minAttendanceSessions'] ?? 0,
      eligible: json['eligible'] ?? true,
      sejak: json['sejak'] ?? '',
    );
  }
}

class UktStatusResponse {
  final UktExam? exam;
  final UktParticipant? registration;
  final UktEligibility? eligibility;

  UktStatusResponse({this.exam, this.registration, this.eligibility});

  factory UktStatusResponse.fromJson(Map<String, dynamic> json) {
    return UktStatusResponse(
      exam: json['exam'] != null ? UktExam.fromJson(json['exam']) : null,
      registration: json['registration'] != null ? UktParticipant.fromJson(json['registration']) : null,
      eligibility: json['eligibility'] != null ? UktEligibility.fromJson(json['eligibility']) : null,
    );
  }
}

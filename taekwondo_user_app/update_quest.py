import re

file_path = "/home/beni/taekwondo/taekwondo_user_app/lib/features/dashboard/presentation/daily_quest_screen.dart"

with open(file_path, "r") as f:
    content = f.read()

# Add imports
imports = """import 'package:file_picker/file_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import 'dart:typed_data';
"""
if "import 'package:url_launcher/url_launcher.dart';" not in content:
    content = content.replace("import 'package:go_router/go_router.dart';", imports + "import 'package:go_router/go_router.dart';")

# Add state variables
state_vars = """
  bool _isUploading = false;
  String? _uploadingQuestId;

  Future<void> _launchURL(String urlString) async {
    final Uri url = Uri.parse(urlString);
    if (!await launchUrl(url)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Gagal membuka link video')),
        );
      }
    }
  }

  Future<void> _uploadAndCompleteQuest(QuestLog qLog) async {
    if (_isUploading) return;
    
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.video,
      withData: true, // Needed for web
    );

    if (result != null && result.files.single.bytes != null) {
      setState(() {
        _isUploading = true;
        _uploadingQuestId = qLog.id;
      });

      try {
        final Uint8List fileBytes = result.files.single.bytes!;
        final String fileName = result.files.single.name;
        
        final questService = ref.read(questServiceProvider);
        
        // 1. Upload
        final videoUrl = await questService.uploadVideo(fileBytes, fileName);
        
        // 2. Complete quest
        await questService.completeQuest(qLog.id, videoUrl: videoUrl);
        
        // Refresh provider
        ref.invalidate(questProvider);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Misi berhasil diselesaikan!')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: $e')),
          );
        }
      } finally {
        if (mounted) {
          setState(() {
            _isUploading = false;
            _uploadingQuestId = null;
          });
        }
      }
    }
  }

  Future<void> _completeNormalQuest(QuestLog qLog) async {
    if (_isUploading) return;
    setState(() {
      _isUploading = true;
      _uploadingQuestId = qLog.id;
    });
    try {
      await ref.read(questServiceProvider).completeQuest(qLog.id);
      ref.invalidate(questProvider);
    } catch (e) {
       if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: $e')),
          );
       }
    } finally {
      if (mounted) {
        setState(() {
          _isUploading = false;
          _uploadingQuestId = null;
        });
      }
    }
  }
"""

if "bool _isUploading" not in content:
    content = content.replace("class _DailyQuestScreenState extends ConsumerState<DailyQuestScreen> {", "class _DailyQuestScreenState extends ConsumerState<DailyQuestScreen> {" + state_vars)

# Replace _buildQuestItem call inside map
old_call = """                  child: _buildQuestItem(
                    icon: icon,
                    iconBgColor: bgColor,
                    iconColor: fgColor,
                    title: q.quest.title,
                    desc: q.quest.description,
                    xp: '+${q.quest.baseXp} XP',
                    isCompleted: q.completed,
                  ),"""

new_call = """                  child: _buildQuestItem(
                    icon: icon,
                    iconBgColor: bgColor,
                    iconColor: fgColor,
                    questLog: q,
                  ),"""
content = content.replace(old_call, new_call)

# Replace _buildQuestItem definition
old_def = """  Widget _buildQuestItem({
    required IconData icon,
    required Color iconBgColor,
    required Color iconColor,
    required String title,
    required String desc,
    required String xp,
    required bool isCompleted,
  }) {"""

new_def = """  Widget _buildQuestItem({
    required IconData icon,
    required Color iconBgColor,
    required Color iconColor,
    required QuestLog questLog,
  }) {
    final title = questLog.quest.title;
    final desc = questLog.quest.description;
    final xp = '+${questLog.quest.baseXp} XP';
    final isCompleted = questLog.completed;
    final bool requireVideo = questLog.quest.requireVideo;
    final String? videoUrl = questLog.quest.videoUrl;
    final bool isThisUploading = _isUploading && _uploadingQuestId == questLog.id;
"""
content = content.replace(old_def, new_def)

# Replace buttons in _buildQuestItem
old_buttons = """                GestureDetector(
                  onTap: () {},
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: nbPrimary,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: nbBlack, width: 2),
                      boxShadow: const [BoxShadow(color: nbBlack, offset: Offset(2, 2))],
                    ),
                    child: Text('MULAI', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 1.0)),
                  ),
                )"""

new_buttons = """                if (videoUrl != null && videoUrl.isNotEmpty && !isCompleted) ...[
                  GestureDetector(
                    onTap: () => _launchURL(videoUrl),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: nbSecondary,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: nbBlack, width: 2),
                        boxShadow: const [BoxShadow(color: nbBlack, offset: Offset(2, 2))],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.play_circle_fill, color: Colors.white, size: 16),
                          const SizedBox(width: 4),
                          Text('TONTON', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 1.0)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                ],
                GestureDetector(
                  onTap: isThisUploading ? null : () {
                    if (requireVideo) {
                      _uploadAndCompleteQuest(questLog);
                    } else {
                      _completeNormalQuest(questLog);
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: isThisUploading ? nbOutline : nbPrimary,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: nbBlack, width: 2),
                      boxShadow: isThisUploading ? null : const [BoxShadow(color: nbBlack, offset: Offset(2, 2))],
                    ),
                    child: isThisUploading 
                      ? const SizedBox(width: 12, height: 12, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (requireVideo) const Icon(Icons.upload_file, color: Colors.white, size: 16),
                            if (requireVideo) const SizedBox(width: 4),
                            Text(requireVideo ? 'UPLOAD BUKTI' : 'MULAI', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 1.0)),
                          ],
                        ),
                  ),
                )"""
content = content.replace(old_buttons, new_buttons)


with open(file_path, "w") as f:
    f.write(content)

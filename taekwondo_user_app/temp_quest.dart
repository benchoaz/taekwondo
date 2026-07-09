          ),
          const SizedBox(height: 8),
          Text('Lakukan 3 misi lagi untuk bonus harian!', style: GoogleFonts.hankenGrotesk(fontSize: 14, color: nbOutline)),
        ],
      ),
    );
  }

  Widget _buildQuestList(AsyncValue<List<QuestLog>> questsAsync) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.ads_click, color: nbSecondary),
            const SizedBox(width: 4),
            Text('Misi Hari Ini', style: GoogleFonts.hankenGrotesk(fontSize: 20, fontWeight: FontWeight.bold, color: nbBlack)),
          ],
        ),
        const SizedBox(height: 12),
        questsAsync.when(
          loading: () => const Center(child: Padding(
            padding: EdgeInsets.all(24.0),
            child: CircularProgressIndicator(color: nbPrimary),
          )),
          error: (err, stack) => Center(child: Text('Gagal memuat misi: $err', style: const TextStyle(color: nbSecondary))),
          data: (quests) {
            final List<QuestLog> typedQuests = (quests as List).cast<QuestLog>();
            if (typedQuests.isEmpty) {
              return Text('Tidak ada misi untuk hari ini.', style: GoogleFonts.hankenGrotesk(fontSize: 16, color: nbOutline));
            }
            return Column(
              children: typedQuests.map<Widget>((QuestLog q) {
                // Tentukan Ikon dan Warna berdasarkan Kategori
                IconData icon;
                Color bgColor;
                Color fgColor;

                switch (q.quest.category) {
                  case 'FITNESS':
                    icon = Icons.fitness_center;
                    bgColor = nbPrimaryFixed;
                    fgColor = nbPrimary;
                    break;
                  case 'TECHNICAL':
                    icon = Icons.sports_martial_arts;
                    bgColor = nbSecondaryFixed;
                    fgColor = nbSecondary;
                    break;
                  case 'DISCIPLINE':
                    icon = Icons.self_improvement;
                    bgColor = nbSurfaceContainerHigh;
                    fgColor = nbOutline;
                    break;
                  default:
                    icon = Icons.directions_run;
                    bgColor = nbPrimaryFixed;
                    fgColor = nbPrimary;
                }

                return Padding(
                  padding: const EdgeInsets.only(bottom: 12.0),
                  child: _buildQuestItem(
                    icon: icon,
                    iconBgColor: bgColor,
                    iconColor: fgColor,
                    title: q.quest.title,
                    desc: q.quest.description,
                    xp: '+${q.quest.baseXp} XP',
                    isCompleted: q.completed,
                  ),
                );
              }).toList(),
            );
          }
        ),
      ],
    );
  }

  Widget _buildQuestItem({
    required IconData icon,
    required Color iconBgColor,
    required Color iconColor,
    required String title,
    required String desc,
    required String xp,
    required bool isCompleted,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isCompleted ? nbSurfaceContainer : nbSurfaceContainerLowest,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isCompleted ? nbOutlineVariant : nbBlack, width: 4),
        boxShadow: isCompleted ? null : const [BoxShadow(color: nbBlack, offset: Offset(4, 4))],
      ),
      child: Row(
        children: [
          Container(
            width: 56, height: 56,
            decoration: BoxDecoration(
              color: iconBgColor,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: isCompleted ? nbOutlineVariant : nbBlack, width: 2),
            ),
            child: Icon(icon, color: iconColor, size: 28),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: GoogleFonts.hankenGrotesk(fontSize: 20, fontWeight: FontWeight.bold, color: isCompleted ? nbOutline : nbBlack, height: 1.1)),
                const SizedBox(height: 4),
                Text(desc, style: GoogleFonts.hankenGrotesk(fontSize: 14, color: nbOutline)),
              ],
            ),
          ),
          if (isCompleted)
            const Icon(Icons.check_circle, color: nbTertiary, size: 36)
          else
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: nbTertiaryContainer,
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: nbBlack, width: 2),
                  ),
                  child: Text(xp, style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold, color: nbOnTertiaryContainer)),
                ),
                const SizedBox(height: 6),
                GestureDetector(
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
                )
              ],
            )
        ],
      ),
    );
  }

  Widget _buildBonusGrid() {

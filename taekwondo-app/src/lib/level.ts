export interface LevelInfo {
  level: number;
  title: string;
  currentXp: number;
  nextLevelXp: number;
  percentage: number;
}

export function getLevelInfo(totalXp: number): LevelInfo {
  let level = 1;
  let xpForNext = 100;
  let tempXp = totalXp;
  
  while (tempXp >= xpForNext) {
    tempXp -= xpForNext;
    level++;
    xpForNext = 100 + (level - 1) * 50;
  }
  
  let title = "Chukjae (Novice)";
  if (level >= 6 && level <= 10) title = "Suryeonsa (Challenger)";
  else if (level >= 11 && level <= 15) title = "Hwarang (Elite)";
  else if (level >= 16 && level <= 20) title = "Gosu (Expert)";
  else if (level >= 21) title = "Cheonji (Legend)";
  
  return {
    level,
    title,
    currentXp: tempXp,
    nextLevelXp: xpForNext,
    percentage: Math.min(Math.round((tempXp / xpForNext) * 100), 100),
  };
}

import { Session } from "./sessionService";
import { getEffectColor } from "./chartColors";

export interface DosingTrendData {
  date: string;
  thc: number;
  cbd: number;
}

export interface EffectData {
  name: string;
  value: number;
  color: string;
}

export interface UsagePatternData {
  day: string;
  sessions: number;
}

export function processDosingTrends(sessions: Session[]): DosingTrendData[] {
  // Group sessions by date and sum THC/CBD
  const dailyTotals = sessions.reduce((acc, session) => {
    const date = new Date(session.session_date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    if (!acc[date]) {
      acc[date] = { thc: 0, cbd: 0 };
    }

    acc[date].thc += session.total_thc_mg || 0;
    acc[date].cbd += session.total_cbd_mg || 0;

    return acc;
  }, {} as Record<string, { thc: number; cbd: number }>);

  // Convert to array and sort by date
  return Object.entries(dailyTotals)
    .map(([date, totals]) => ({
      date,
      thc: Math.round(totals.thc * 10) / 10, // Round to 1 decimal
      cbd: Math.round(totals.cbd * 10) / 10,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7); // Last 7 days
}

export function processEffectsData(sessions: Session[]): EffectData[] {
  // Count all effects across all sessions
  const effectCounts: Record<string, number> = {};

  sessions.forEach((session) => {
    session.effects?.forEach((effect) => {
      effectCounts[effect] = (effectCounts[effect] || 0) + 1;
    });
  });

  // Convert to array and sort by count
  return Object.entries(effectCounts)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace("-", " "),
      value,
      color: getEffectColor(name),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Top 8 effects
}

export function processUsagePattern(sessions: Session[]): UsagePatternData[] {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayCounts: Record<number, number> = {};

  // Initialize all days to 0
  for (let i = 0; i < 7; i++) {
    dayCounts[i] = 0;
  }

  // Count sessions by day of week
  sessions.forEach((session) => {
    const dayOfWeek = new Date(session.session_date).getDay();
    dayCounts[dayOfWeek]++;
  });

  // Convert to array with day names
  return dayNames.map((day, index) => ({
    day,
    sessions: dayCounts[index],
  }));
}

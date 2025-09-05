// Chart colors using Tailwind color system
// These match your existing doser color scheme

export const CHART_COLORS = {
  // Primary colors
  primary: "hsl(142, 76%, 36%)", // emerald-600 (doser-primary)
  primaryHover: "hsl(142, 76%, 30%)", // emerald-700 (doser-primary-hover)
  accent: "hsl(262, 83%, 58%)", // indigo-500 (doser-accent)

  // THC/CBD specific colors
  thc: "hsl(45, 93%, 47%)", // amber-500 (doser-thc)
  cbd: "hsl(217, 91%, 60%)", // blue-500 (doser-cbd)

  // Effects colors
  effects: {
    happy: "hsl(142, 76%, 36%)", // emerald-600
    creative: "hsl(262, 83%, 58%)", // violet-500
    relaxed: "hsl(217, 91%, 60%)", // blue-500
    energetic: "hsl(45, 93%, 47%)", // amber-500
    sleepy: "hsl(262, 83%, 58%)", // indigo-500
    anxious: "hsl(0, 84%, 60%)", // red-500
    dizzy: "hsl(25, 95%, 53%)", // orange-500
    "dry-mouth": "hsl(330, 81%, 60%)", // pink-500
    euphoric: "hsl(188, 94%, 43%)", // cyan-500
    focused: "hsl(84, 81%, 44%)", // lime-600
    giggly: "hsl(45, 93%, 47%)", // amber-500
    hungry: "hsl(25, 95%, 53%)", // orange-500
    paranoid: "hsl(0, 72%, 51%)", // red-600
    "body-high": "hsl(262, 83%, 58%)", // violet-500
    "head-high": "hsl(142, 76%, 36%)", // emerald-600
    pain: "hsl(0, 72%, 51%)", // red-600
    nausea: "hsl(20, 90%, 48%)", // orange-600
    stress: "hsl(330, 81%, 60%)", // pink-500
    depression: "hsl(217, 91%, 60%)", // blue-500
    insomnia: "hsl(215, 20%, 25%)", // gray-700
  },

  // Chart specific colors
  grid: "rgba(255, 255, 255, 0.1)",
  axis: "rgba(255, 255, 255, 0.6)",
  tooltip: {
    background: "#111111", // doser-surface
    border: "rgba(255, 255, 255, 0.1)",
    text: "#ffffff", // doser-text
  },
} as const;

// Helper function to get effect color with fallback
export function getEffectColor(effect: string): string {
  const normalizedEffect = effect.toLowerCase().replace(/\s+/g, "-");
  return (
    CHART_COLORS.effects[
      normalizedEffect as keyof typeof CHART_COLORS.effects
    ] || CHART_COLORS.accent
  );
}

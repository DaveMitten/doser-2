import { DashboardCharts } from "./DashboardCharts";
import {
  DosingTrendData,
  EffectData,
  UsagePatternData,
} from "@/lib/chartDataUtils";

// Sample data for the example
const sampleDosingTrends: DosingTrendData[] = [
  { date: "Aug 15", thc: 20, cbd: 15 },
  { date: "Aug 16", thc: 25, cbd: 18 },
  { date: "Aug 17", thc: 18, cbd: 12 },
  { date: "Aug 18", thc: 30, cbd: 22 },
  { date: "Aug 19", thc: 22, cbd: 16 },
  { date: "Aug 20", thc: 0, cbd: 22 },
  { date: "Aug 21", thc: 28, cbd: 20 },
];

const sampleEffects: EffectData[] = [
  { name: "Happy", value: 8, color: "#10b981" },
  { name: "Creative", value: 6, color: "#8b5cf6" },
  { name: "Relaxed", value: 5, color: "#3b82f6" },
  { name: "Energetic", value: 4, color: "#f59e0b" },
  { name: "Sleepy", value: 3, color: "#6366f1" },
];

const sampleUsagePattern: UsagePatternData[] = [
  { day: "Mon", sessions: 2 },
  { day: "Tue", sessions: 1 },
  { day: "Wed", sessions: 3 },
  { day: "Thu", sessions: 0 },
  { day: "Fri", sessions: 2 },
  { day: "Sat", sessions: 4 },
  { day: "Sun", sessions: 1 },
];

export function ChartsExample() {
  return (
    <div className="min-h-screen bg-doser-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-doser-text mb-8">
          Dashboard Charts Example
        </h1>
        <DashboardCharts
          dosingTrends={sampleDosingTrends}
          effects={sampleEffects}
          usagePattern={sampleUsagePattern}
        />
      </div>
    </div>
  );
}

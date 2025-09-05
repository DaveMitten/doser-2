import { Card, CardContent } from "@/components/ui/card";
import { DosingTrendsChart } from "./DosingTrendsChart";
import { EffectsChart } from "./EffectsChart";
import { UsagePatternChart } from "./UsagePatternChart";
import {
  DosingTrendData,
  EffectData,
  UsagePatternData,
} from "@/lib/chartDataUtils";

interface DashboardChartsProps {
  dosingTrends: DosingTrendData[];
  effects: EffectData[];
  usagePattern: UsagePatternData[];
}

export function DashboardCharts({
  dosingTrends,
  effects,
  usagePattern,
}: DashboardChartsProps) {
  return (
    <div className="space-y-6">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dosing Trends Chart */}
        <Card className="bg-doser-surface border-doser-border">
          <CardContent className="p-6">
            <DosingTrendsChart data={dosingTrends} />
          </CardContent>
        </Card>

        {/* Effects Chart */}
        <Card className="bg-doser-surface border-doser-border">
          <CardContent className="p-6">
            <EffectsChart data={effects} />
          </CardContent>
        </Card>
      </div>

      {/* Usage Pattern Chart - Full Width */}
      <Card className="bg-doser-surface border-doser-border">
        <CardContent className="p-6">
          <UsagePatternChart data={usagePattern} />
        </CardContent>
      </Card>
    </div>
  );
}

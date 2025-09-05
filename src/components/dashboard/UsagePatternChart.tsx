"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { UsagePatternData } from "@/lib/chartDataUtils";
import { CHART_COLORS } from "@/lib/chartColors";

interface UsagePatternChartProps {
  data: UsagePatternData[];
}

export function UsagePatternChart({ data }: UsagePatternChartProps) {
  return (
    <div className="w-full h-64">
      <h3 className="text-lg font-semibold text-doser-text mb-4">
        Weekly Usage Pattern
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
          <XAxis dataKey="day" stroke={CHART_COLORS.axis} fontSize={12} />
          <YAxis stroke={CHART_COLORS.axis} fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: CHART_COLORS.tooltip.background,
              border: `1px solid ${CHART_COLORS.tooltip.border}`,
              borderRadius: "8px",
              color: CHART_COLORS.tooltip.text,
            }}
            labelStyle={{
              color: CHART_COLORS.tooltip.text,
            }}
            itemStyle={{
              color: CHART_COLORS.tooltip.text,
            }}
          />
          <Bar
            dataKey="sessions"
            fill={CHART_COLORS.primary}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

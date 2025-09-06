"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DosingTrendData } from "@/lib/chartDataUtils";
import { CHART_COLORS } from "@/lib/chartColors";

interface DosingTrendsChartProps {
  data: DosingTrendData[];
}

export function DosingTrendsChart({ data }: DosingTrendsChartProps) {
  return (
    <div className="w-full h-64 sm:h-72 md:h-64">
      <h3 className="text-lg font-semibold text-doser-text mb-2">
        Dosing Trends (7 days)
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
          <XAxis dataKey="date" stroke={CHART_COLORS.axis} fontSize={12} />
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
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Line
            type="monotone"
            dataKey="thc"
            stroke={CHART_COLORS.thc}
            strokeWidth={2}
            name="THC (mg)"
            dot={{ fill: CHART_COLORS.thc, strokeWidth: 2, r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="cbd"
            stroke={CHART_COLORS.cbd}
            strokeWidth={2}
            name="CBD (mg)"
            dot={{ fill: CHART_COLORS.cbd, strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

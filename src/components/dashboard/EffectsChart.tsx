"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { EffectData } from "@/lib/chartDataUtils";
import { CHART_COLORS } from "@/lib/chartColors";

interface EffectsChartProps {
  data: EffectData[];
}

export function EffectsChart({ data }: EffectsChartProps) {
  return (
    <div className="w-full h-64 sm:h-72 md:h-64">
      <h3 className="text-lg font-semibold text-doser-text mb-2">
        Effects Experienced
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ percent }) =>
              percent && percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""
            }
            outerRadius={70}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
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
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
            formatter={(value, entry) => (
              <span style={{ color: entry.color }}>
                {value} (
                {(
                  (entry.payload?.value /
                    data.reduce((sum, item) => sum + item.value, 0)) *
                  100
                ).toFixed(0)}
                %)
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  value: string | number;
  label: string;
  sublabel?: string;
  className?: string;
}

export function StatsCard({
  value,
  label,
  sublabel,
  className,
}: StatsCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        "bg-doser-surface border-doser-border",
        "p-4 sm:p-6 md:p-8",
        "transition-all duration-300",
        "hover:border-doser-primary hover:-translate-y-0.5 hover:shadow-doser-md",
        "group",
        "flex flex-col",
        "h-[190px] sm:h-full w-full", // Fixed height on mobile for consistency
        className
      )}
    >
      {/* Top border highlight on hover */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-doser-primary to-doser-primary-hover opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content area - fills space above border, ensures consistent border position */}
      <div className="flex-1 flex flex-col">
        {/* Main value with gradient - fixed min-height for consistency */}
        <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 text-gradient-doser tracking-tight leading-[1.1] min-h-[3rem] sm:min-h-[3.5rem] md:min-h-[4rem] flex items-start">
          {value}
        </div>

        {/* Label - fills remaining space and centers content */}
        <div className="flex-1 flex items-center">
          <div className="text-xs sm:text-sm font-medium text-doser-text-disabled uppercase tracking-wider">
            {label}
          </div>
        </div>
      </div>
      {/* Sublabel - always reserve space, top-aligned, consistent border position */}
      <div className="text-[10px] sm:text-xs font-medium text-doser-primary pt-2 sm:pt-3 border-t border-doser-border min-h-[2.5rem] sm:min-h-[3rem] flex items-start lg:items-center">
        {sublabel || "\u00A0"}
      </div>
    </Card>
  );
}

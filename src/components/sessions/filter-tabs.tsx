"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const filters = ["All", "Today", "This Week", "This Month"] as const
type Filter = typeof filters[number]

interface FilterTabsProps {
  onFilterChange?: (filter: Filter) => void
}

export function FilterTabs({ onFilterChange }: FilterTabsProps) {
  const [active, setActive] = useState<Filter>("All")

  const handleClick = (filter: Filter) => {
    setActive(filter)
    onFilterChange?.(filter)
  }

  return (
    <div className="flex gap-2 w-fit p-1.5 rounded-xl bg-doser-bg-secondary border border-doser-border">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => handleClick(filter)}
          className={cn(
            "px-5 py-2.5 rounded-lg text-sm font-medium transition-all",
            active === filter
              ? "bg-doser-green text-white"
              : "text-doser-text-disabled hover:text-doser-text-primary hover:bg-white/5"
          )}
        >
          {filter}
        </button>
      ))}
    </div>
  )
}
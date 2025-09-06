import React from "react";
import { cn } from "../../lib/utils";

interface InnerCardProps {
  children: React.ReactNode;
  className?: string;
}

export function InnerCard({ children, className }: InnerCardProps) {
  return (
    <div
      className={cn(
        "space-y-3 p-3 bg-doser-surface-hover rounded-lg",
        className
      )}
    >
      {children}
    </div>
  );
}

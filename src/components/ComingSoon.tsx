import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ComingSoonProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "subtle" | "prominent";
}

const ComingSoon = ({
  children,
  className,
  variant = "default",
}: ComingSoonProps) => {
  const baseClasses = "relative overflow-hidden";

  const variantClasses = {
    default: "opacity-60 grayscale",
    subtle: "opacity-50 grayscale",
    prominent: "opacity-40 grayscale",
  };

  const overlayClasses =
    "absolute inset-0 bg-gradient-to-br from-doser-surface/80 to-doser-surface/60 backdrop-blur-[1px] flex items-center justify-center";

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)}>
      {children}
      <div className={overlayClasses}>
        <div className="text-center">
          <Badge variant="coming-soon">
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-r from-transparent via-doser-primary to-transparent animate-shine",
                variant === "default" ? "hidden" : ""
              )}
            />
            Coming Soon
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;

import React from "react";
import { Button } from "./button";

interface EmptyStateProps {
  title: string;
  description?: string;
  buttonText: string;
  onButtonClick: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  buttonText,
  onButtonClick,
  icon,
}: EmptyStateProps) {
  return (
    <div className="col-span-full text-center py-6 sm:py-8 lg:py-12 px-4">
      {icon && (
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-doser-primary/10 rounded-full flex items-center justify-center text-2xl text-doser-primary">
            {icon}
          </div>
        </div>
      )}
      <div className="text-doser-text-muted mb-4 text-sm sm:text-base">
        {title}
      </div>
      {description && (
        <div className="text-doser-text-muted mb-6 text-xs sm:text-sm max-w-md mx-auto">
          {description}
        </div>
      )}
      <Button
        onClick={onButtonClick}
        className="bg-doser-primary hover:bg-doser-primary-hover w-full sm:w-auto max-w-xs"
      >
        {buttonText}
      </Button>
    </div>
  );
}

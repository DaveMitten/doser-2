import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../../components/ui/card";

export default function SafetyGuidelines() {
  return (
    <Card className="bg-doser-surface border-doser-border">
      <CardHeader>
        <CardTitle className="text-doser-text">Safety Guidelines</CardTitle>
      </CardHeader>
      <CardContent noTopPadding className="space-y-3">
        <div className="flex items-start space-x-3">
          <svg
            className="w-5 h-5 text-doser-primary mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-doser-text text-sm">
            Start with half the recommended dose
          </span>
        </div>
        <div className="flex items-start space-x-3">
          <svg
            className="w-5 h-5 text-doser-primary mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-doser-text text-sm">
            Wait 15-30 minutes before consuming more
          </span>
        </div>
        <div className="flex items-start space-x-3">
          <svg
            className="w-5 h-5 text-doser-primary mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-doser-text text-sm">
            Consume in a safe, comfortable environment
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

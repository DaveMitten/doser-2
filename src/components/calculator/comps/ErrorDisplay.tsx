import React from "react";

type ErrorDisplayProps = {
  errors: string[];
};

const ErrorDisplay = ({ errors }: ErrorDisplayProps) => {
  if (errors.length === 0) return null;

  return (
    <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
      <h4 className="text-red-800 font-medium text-sm mb-1">
        Calculation Errors:
      </h4>
      <ul className="text-red-700 text-xs space-y-1">
        {errors.map((error, index) => (
          <li key={index}>• {error}</li>
        ))}
      </ul>
    </div>
  );
};

export default ErrorDisplay;

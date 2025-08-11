"use client";

import React from "react";

type SessionRatingProps = {
  rating: number;
  hoveredRating: number;
  handleRatingChange: (rating: number) => void;
  setHoveredRating: (rating: number) => void;
};

const SessionRating = ({
  rating,
  hoveredRating,
  handleRatingChange,
  setHoveredRating,
}: SessionRatingProps) => {
  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        className={`text-2xl transition-colors ${
          i < (hoveredRating || rating)
            ? "text-yellow-400"
            : "text-doser-text-muted/30"
        } hover:text-yellow-400`}
        onClick={() => handleRatingChange(i + 1)}
        onMouseEnter={() => setHoveredRating(i + 1)}
        onMouseLeave={() => setHoveredRating(0)}
        title={
          rating === i + 1
            ? "Click again to clear rating"
            : `Rate ${i + 1} stars`
        }
      >
        ★
      </button>
    ));
  };

  return (
    <div>
      <h3 className="text-doser-primary font-semibold mb-4">
        Session Rating (Optional)
      </h3>
      <div>
        <label className="block text-sm font-medium text-doser-text mb-2">
          Overall Experience
        </label>
        <div className="flex gap-1 mb-2">{renderStars()}</div>
        <p className="text-xs text-doser-text-muted">
          Rate your overall session experience. Click a star to rate, click
          again to clear.
        </p>
      </div>
    </div>
  );
};

export default SessionRating;

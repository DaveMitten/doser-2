"use client";

import React from "react";

type EffectsExperiencedProps = {
  selectedEffects: string[];
  handleEffectToggle: (effectValue: string) => void;
};

const effectOptions = [
  { value: "relaxed", label: "Relaxed", icon: "😌" },
  { value: "happy", label: "Happy", icon: "😊" },
  { value: "sleepy", label: "Sleepy", icon: "😴" },
  { value: "focused", label: "Focused", icon: "🧠" },
  { value: "creative", label: "Creative", icon: "🎨" },
  { value: "energetic", label: "Energetic", icon: "⚡" },
  { value: "hungry", label: "Hungry", icon: "🍕" },
  { value: "euphoric", label: "Euphoric", icon: "🌟" },
  { value: "anxious", label: "Anxious", icon: "😰" },
  { value: "dry-mouth", label: "Dry Mouth", icon: "👄" },
  { value: "dizzy", label: "Dizzy", icon: "😵" },
  { value: "pain-relief", label: "Pain Relief", icon: "💊" },
];

const EffectsExperienced = ({
  selectedEffects,
  handleEffectToggle,
}: EffectsExperiencedProps) => {
  return (
    <div>
      <h3 className="text-doser-primary font-semibold mb-4">
        Effects Experienced
      </h3>
      <p className="text-xs text-doser-text-muted mb-3">
        Select all effects you experienced during this session
      </p>
      <div className="grid grid-cols-3 gap-3">
        {effectOptions.map((effect) => (
          <button
            key={effect.value}
            type="button"
            className={`flex items-center justify-center gap-2 px-2 py-3 rounded-lg border transition-all text-center min-w-0 ${
              selectedEffects.includes(effect.value)
                ? "bg-doser-primary/10 border-doser-primary/30 text-doser-text"
                : "bg-doser-surface-hover border-doser-border text-doser-text-muted hover:text-doser-text hover:bg-doser-surface"
            }`}
            onClick={() => handleEffectToggle(effect.value)}
          >
            <span className="text-base flex-shrink-0">{effect.icon}</span>
            <span className="text-sm font-medium truncate">{effect.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EffectsExperienced;

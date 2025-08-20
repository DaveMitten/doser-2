import React from "react";
import { Session } from "./sessionService";

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const getTemperatureDisplay = (session: Session) => {
  if (session.temperature_celsius && session.temperature_fahrenheit) {
    return `${session.temperature_celsius}°C / ${session.temperature_fahrenheit}°F`;
  } else if (session.temperature_celsius) {
    return `${session.temperature_celsius}°C`;
  } else if (session.temperature_fahrenheit) {
    return `${session.temperature_fahrenheit}°F`;
  }
  return "N/A";
};

export const renderStars = (rating: number | null) => {
  if (!rating) return null;
  return Array.from({ length: 5 }, (_, i) => (
    <span
      key={i}
      className={`text-sm ${
        i < rating ? "text-yellow-400" : "text-doser-text-muted/30"
      }`}
    >
      ★
    </span>
  ));
};

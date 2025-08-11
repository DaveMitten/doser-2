"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NewSessionForm } from "@/components/new-session/new-session-form";
import { useState, useEffect } from "react";
import { sessionService, type Session } from "@/lib/sessionService";
import SessionsGrid from "./SessionsGrid";

const filters = [
  "All",
  "Today",
  "This Week",
  "This Month",
  "Vaporizer",
  "Edibles",
  "Joints",
];

export default function SessionsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  // const [loading, setLoading] = useState(true);

  // Fetch real sessions on component mount
  // useEffect(() => {
  //   const fetchSessions = async () => {
  //     try {
  //       const { data, error } = await sessionService.getUserSessions();
  //       if (error) {
  //         console.error("Error fetching sessions:", error);
  //       } else if (data) {
  //         setSessions(data);
  //       }
  //     } catch (error) {
  //       console.error("Error in fetchSessions:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchSessions();
  // }, []);

  const renderStars = (rating: number | null) => {
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

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    setIsSheetOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getTemperatureDisplay = (session: Session) => {
    if (session.temperature_celsius && session.temperature_fahrenheit) {
      return `${session.temperature_celsius}°C / ${session.temperature_fahrenheit}°F`;
    } else if (session.temperature_celsius) {
      return `${session.temperature_celsius}°C`;
    } else if (session.temperature_fahrenheit) {
      return `${session.temperature_fahrenheit}°F`;
    }
    return "N/A";
  };

  const getMaterialDisplay = (session: Session) => {
    if (session.material_type === "capsule") {
      return `${session.material_amount} capsule(s)`;
    } else {
      return `${session.material_capacity_grams}g`;
    }
  };

  const renderEnhancedCalculations = (session: Session) => {
    const enhanced = sessionService.parseEnhancedCalculations(session);

    if (!enhanced.hasEnhancedData) {
      return (
        <div className="text-sm text-doser-text-muted">
          <div className="font-medium">
            Total THC: {session.total_thc_mg.toFixed(1)}mg
          </div>
          <div className="font-medium">
            Total CBD: {session.total_cbd_mg.toFixed(1)}mg
          </div>
          <div className="text-xs text-doser-text-muted/70">
            Standard calculation
          </div>
        </div>
      );
    }

    return (
      <div className="text-sm">
        <div className="font-medium text-doser-primary mb-2">
          Enhanced Calculations
        </div>

        {/* Consumed Values (Primary Display) */}
        <div className="mb-2">
          <div className="font-medium">
            Consumed THC: {enhanced.consumedThc?.toFixed(1)}mg
          </div>
          <div className="font-medium">
            Consumed CBD: {enhanced.consumedCbd?.toFixed(1)}mg
          </div>
          <div className="text-xs text-doser-text-muted/70">
            Based on {Math.round((enhanced.consumptionRatio || 0) * 100)}%
            consumption
          </div>
        </div>

        {/* Original Values (Secondary Display) */}
        <div className="text-xs text-doser-text-muted/70 border-t pt-2">
          <div>Original THC: {enhanced.originalThc?.toFixed(1)}mg</div>
          <div>Original CBD: {enhanced.originalCbd?.toFixed(1)}mg</div>
          <div>Remaining: {enhanced.remainingMaterial?.toFixed(2)}g</div>
        </div>
      </div>
    );
  };

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-doser-text-muted">Loading sessions...</div>
  //     </div>
  //   );
  // }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-doser-primary mb-2">
            Session History
          </h1>
          <p className="text-doser-text-muted">
            Track your consumption patterns and effects
          </p>
        </div>
        <Button
          onClick={() => setIsNewSessionOpen(true)}
          className="bg-doser-primary hover:bg-doser-primary/90"
        >
          + New Session
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <Badge
            key={filter}
            variant={activeFilter === filter ? "default" : "outline"}
            className={`cursor-pointer ${
              activeFilter === filter
                ? "bg-doser-primary text-white"
                : "text-doser-text-muted border-doser-text-muted/30"
            }`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </Badge>
        ))}
      </div>

      <SessionsGrid
        sessions={sessions ?? []}
        setIsNewSessionOpen={setIsNewSessionOpen}
        handleSessionClick={handleSessionClick}
        formatDate={formatDate}
        formatTime={formatTime}
        getTemperatureDisplay={getTemperatureDisplay}
        getMaterialDisplay={getMaterialDisplay}
        renderEnhancedCalculations={renderEnhancedCalculations}
        renderStars={renderStars}
      />

      {/* Session Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-doser-primary">
              Session Details
            </SheetTitle>
          </SheetHeader>
          {selectedSession && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-doser-text-muted">
                    Date
                  </div>
                  <div className="text-doser-primary">
                    {formatDate(selectedSession.session_date)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-doser-text-muted">
                    Time
                  </div>
                  <div className="text-doser-primary">
                    {formatTime(selectedSession.session_time)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-doser-text-muted">
                    Device
                  </div>
                  <div className="text-doser-primary">
                    {selectedSession.device_name}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-doser-text-muted">
                    Temperature
                  </div>
                  <div className="text-doser-primary">
                    {getTemperatureDisplay(selectedSession)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-doser-text-muted">
                    Draws
                  </div>
                  <div className="text-doser-primary">
                    {selectedSession.draws_count}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-doser-text-muted">
                    Duration
                  </div>
                  <div className="text-doser-primary">
                    {selectedSession.duration_minutes} minutes
                  </div>
                </div>
              </div>

              {/* Enhanced Calculations in Detail View */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-doser-primary mb-4">
                  Consumption Analysis
                </h3>
                {renderEnhancedCalculations(selectedSession)}
              </div>

              {/* Effects */}
              {selectedSession.effects &&
                selectedSession.effects.length > 0 && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-doser-primary mb-4">
                      Effects
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSession.effects.map(
                        (effect: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border-doser-primary/30 text-doser-primary"
                          >
                            {effect}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Notes */}
              {selectedSession.notes && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-doser-primary mb-4">
                    Notes
                  </h3>
                  <div className="text-doser-text-muted">
                    {selectedSession.notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* New Session Form */}
      <NewSessionForm
        isOpen={isNewSessionOpen}
        onOpenChange={setIsNewSessionOpen}
      />
    </div>
  );
}

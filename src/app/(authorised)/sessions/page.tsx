"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NewSessionForm } from "@/components/new-session/new-session-form";
import { useState, useEffect, useCallback } from "react";
import { sessionService, type Session } from "@/lib/sessionService";
import SessionsGrid from "./SessionsGrid";
import {
  formatDate,
  formatTime,
  getTemperatureDisplay,
  renderStars,
} from "@/lib/sessionCardUtils";

const filters = ["All", "Today", "This Week", "This Month"];

export default function SessionsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);
  const [isEditSessionOpen, setIsEditSessionOpen] = useState(false); // New state for edit mode
  const [sessionToEdit, setSessionToEdit] = useState<Session | null>(null); // New state for session to edit
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

  // Fetch sessions function
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await sessionService.getUserSessions();
      if (error) {
        console.error("Error fetching sessions:", error);
      } else if (data) {
        setSessions(data);
      }
    } catch (error) {
      console.error("Error in fetchSessions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch real sessions on component mount
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Handle new session creation - refresh sessions list
  const handleNewSessionCreated = useCallback(() => {
    fetchSessions();
    setIsNewSessionOpen(false);
    setIsEditSessionOpen(false);
    setSessionToEdit(null);
  }, [fetchSessions]);

  // Handle session editing - refresh sessions list
  const handleSessionEdited = useCallback(() => {
    fetchSessions();
    setIsEditSessionOpen(false);
    setSessionToEdit(null);
  }, [fetchSessions]);

  // Filter sessions based on active filter
  const filteredSessions = useCallback(() => {
    if (activeFilter === "All") return sessions;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(
      today.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    return sessions.filter((session) => {
      const sessionDate = new Date(session.session_date);

      switch (activeFilter) {
        case "Today":
          return sessionDate >= today;
        case "This Week":
          return sessionDate >= weekAgo;
        case "This Month":
          return sessionDate >= monthAgo;
        default:
          return true;
      }
    });
  }, [sessions, activeFilter]);

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    setIsSheetOpen(true);
  };

  const handleEditSession = (session: Session) => {
    setSessionToEdit(session);
    setIsEditSessionOpen(true);
    setIsSheetOpen(false); // Close the detail sheet
  };

  // const renderEnhancedCalculations = (session: Session) => {
  //   const enhanced = sessionService.parseEnhancedCalculations(session);

  //   if (!enhanced.hasEnhancedData) {
  //     return (
  //       <div className="text-xs sm:text-sm text-doser-text-muted">
  //         <div className="font-medium text-doser-text">
  //           Total THC: {session.total_thc_mg.toFixed(1)}mg
  //         </div>
  //         <div className="font-medium text-doser-text">
  //           Total CBD: {session.total_cbd_mg.toFixed(1)}mg
  //         </div>
  //         <div className="text-xs text-doser-text-muted">
  //           Standard calculation
  //         </div>
  //       </div>
  //     );
  //   }
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-doser-text-muted">Loading sessions...</div>
      </div>
    );
  }
  //   return (
  //     <div className="text-xs sm:text-sm">
  //       <div className="font-medium text-doser-success mb-1 sm:mb-2">
  //         Enhanced Calculations
  //       </div>

  //       {/* Consumed Values (Primary Display) */}
  //       <div className="mb-1 sm:mb-2">
  //         <div className="font-medium text-doser-text">
  //           Consumed THC: {enhanced.consumedThc?.toFixed(1)}mg
  //         </div>
  //         <div className="font-medium text-doser-text">
  //           Consumed CBD: {enhanced.consumedCbd?.toFixed(1)}mg
  //         </div>
  //         <div className="text-xs text-doser-text-muted">
  //           Based on {Math.round((enhanced.consumptionRatio || 0) * 100)}%
  //           consumption
  //         </div>
  //       </div>

  //       {/* Original Values (Secondary Display) */}
  //       <div className="text-xs text-doser-text-muted border-t border-doser-border pt-1 sm:pt-2">
  //         <div>Original THC: {enhanced.originalThc?.toFixed(1)}mg</div>
  //         <div>Original CBD: {enhanced.originalCbd?.toFixed(1)}mg</div>
  //         <div>Remaining: {enhanced.remainingMaterial?.toFixed(2)}g</div>
  //       </div>
  //     </div>
  //   );
  // };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-doser-primary mb-2">
            Session History
          </h1>
          <p className="text-sm sm:text-base text-doser-text-muted">
            Track your consumption patterns and effects
          </p>
        </div>
        <Button
          onClick={() => setIsNewSessionOpen(true)}
          className="bg-doser-primary hover:bg-doser-primary-hover w-full sm:w-auto"
        >
          + New Session
        </Button>
      </div>

      {/* Responsive Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-doser min-w-0">
            {filters.map((filter) => (
              <Badge
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                className={`cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  activeFilter === filter
                    ? "bg-doser-primary text-white"
                    : "text-doser-text-muted border-doser-border"
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </Badge>
            ))}
          </div>

          {/* View Toggle */}
          <div className="hidden sm:flex gap-2 flex-shrink-0">
            <Badge
              variant={viewMode === "cards" ? "default" : "outline"}
              className={`cursor-pointer whitespace-nowrap ${
                viewMode === "cards"
                  ? "bg-doser-primary text-white"
                  : "text-doser-text-muted border-doser-border"
              }`}
              onClick={() => setViewMode("cards")}
            >
              Cards
            </Badge>
            <Badge
              variant={viewMode === "list" ? "default" : "outline"}
              className={`cursor-pointer whitespace-nowrap ${
                viewMode === "list"
                  ? "bg-doser-primary text-white"
                  : "text-doser-text-muted border-doser-border"
              }`}
              onClick={() => setViewMode("list")}
            >
              List
            </Badge>
          </div>
        </div>
      </div>

      <SessionsGrid
        sessions={filteredSessions()}
        setIsNewSessionOpen={setIsNewSessionOpen}
        handleSessionClick={handleSessionClick}
        viewMode={viewMode}
      />

      {/* Session Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl bg-doser-surface border-l border-doser-border overflow-y-auto p-0 scrollbar-doser">
          <SheetHeader className="border-b border-doser-border p-6">
            <SheetTitle className="text-doser-text text-xl font-semibold">
              Session Details
            </SheetTitle>
          </SheetHeader>
          {selectedSession && (
            <div className="p-6 space-y-6">
              {/* Session Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-doser-border">
                <div className="w-10 h-10 bg-gradient-to-br from-doser-primary to-doser-primary-hover rounded-lg flex items-center justify-center text-xl">
                  📈
                </div>
                <div>
                  <div className="text-lg font-semibold text-doser-text">
                    {formatDate(selectedSession.session_date)},{" "}
                    {formatTime(selectedSession.session_time)}
                  </div>
                  <div className="text-sm text-doser-text-muted">
                    {selectedSession.duration_minutes} minute session
                  </div>
                </div>
              </div>

              {/* Dosage Breakdown */}
              <div className="space-y-3">
                <div className="text-sm font-semibold text-doser-primary uppercase tracking-wide">
                  Dosage Breakdown
                </div>
                <div className="bg-doser-primary-light border border-doser-primary/20 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-doser-thc font-bold text-xl">
                        {selectedSession.total_thc_mg.toFixed(1)}mg
                      </div>
                      <div className="text-xs text-doser-text-muted">
                        Total THC
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-doser-cbd font-bold text-xl">
                        {selectedSession.total_cbd_mg.toFixed(1)}mg
                      </div>
                      <div className="text-xs text-doser-text-muted">
                        Total CBD
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Information */}
              <div className="space-y-3">
                <div className="text-sm font-semibold text-doser-primary uppercase tracking-wide">
                  Session Information
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-doser-text-muted">Method:</span>
                    <span className="font-semibold text-doser-text">
                      {selectedSession.unit_type === "capsule"
                        ? "Capsule"
                        : "Chamber"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-doser-text-muted">Temperature:</span>
                    <span className="font-semibold text-doser-text">
                      {getTemperatureDisplay(selectedSession)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-doser-text-muted">Draws taken:</span>
                    <span className="font-semibold text-doser-text">
                      {selectedSession.total_session_inhalations !== null
                        ? `${selectedSession.total_session_inhalations} draws`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-doser-text-muted">Device:</span>
                    <span className="font-semibold text-doser-text">
                      {selectedSession.device_name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-doser-text-muted">Duration:</span>
                    <span className="font-semibold text-doser-text">
                      {selectedSession.duration_minutes} minutes
                    </span>
                  </div>
                </div>
              </div>

              {/* Effects Experienced */}
              {selectedSession.effects &&
                selectedSession.effects.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-doser-primary uppercase tracking-wide">
                      Effects Experienced
                    </div>
                    <div className="bg-doser-effects/5 border border-doser-effects/20 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-2">
                        {selectedSession.effects.map(
                          (effect: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm"
                            >
                              <div className="w-4 h-4 bg-doser-success/20 text-doser-success rounded text-center text-xs flex items-center justify-center">
                                😌
                              </div>
                              <span className="text-doser-text">{effect}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}

              {/* Session Rating */}
              <div className="space-y-3">
                <div className="text-sm font-semibold text-doser-primary uppercase tracking-wide">
                  Session Rating
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-doser-text-muted">
                    Overall experience:
                  </span>
                  <div className="flex gap-1">
                    {renderStars(selectedSession.rating)}
                  </div>
                </div>
              </div>

              {/* Session Notes */}
              {selectedSession.notes && (
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-doser-primary uppercase tracking-wide">
                    Session Notes
                  </div>
                  <div className="bg-doser-notes/5 border border-doser-notes/20 rounded-lg p-4">
                    <div className="text-sm text-doser-text/80 leading-relaxed italic">
                      {selectedSession.notes}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                <Button className="bg-gradient-to-br from-doser-primary to-doser-primary-hover hover:from-doser-primary-hover hover:to-doser-primary text-white">
                  <span className="mr-2">🔄</span>
                  Repeat Session
                </Button>
                <Button
                  variant="outline"
                  className="bg-doser-surface-hover border-doser-border text-doser-text hover:bg-doser-surface-hover/80"
                  onClick={() => handleEditSession(selectedSession)}
                >
                  <span className="mr-2">✏️</span>
                  Edit Session
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* New Session Form */}
      <NewSessionForm
        isOpen={isNewSessionOpen}
        setSessionFormOpen={setIsNewSessionOpen}
        onSessionCreated={handleNewSessionCreated}
      />

      {/* Edit Session Form */}
      <NewSessionForm
        isOpen={isEditSessionOpen}
        setSessionFormOpen={setIsEditSessionOpen}
        onSessionCreated={handleSessionEdited}
        sessionToEdit={sessionToEdit}
      />
    </div>
  );
}

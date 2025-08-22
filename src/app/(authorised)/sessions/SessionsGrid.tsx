import React from "react";
import { Session } from "../../../lib/sessionService";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import ListViewSessionCard from "../../../components/sessions/ListViewSessionCard";
import {
  formatDate,
  formatTime,
  getTemperatureDisplay,
  renderStars,
} from "../../../lib/sessionCardUtils";

type Props = {
  sessions: Session[];
  setIsNewSessionOpen: (open: boolean) => void;
  handleSessionClick: (session: Session) => void;
  viewMode: "cards" | "list";
};

const SessionsGrid = ({
  sessions,
  setIsNewSessionOpen,
  handleSessionClick,
  viewMode,
}: Props) => {
  if (sessions.length === 0) {
    return (
      <div className="col-span-full text-center py-6 sm:py-8 lg:py-12 px-4">
        <div className="text-doser-text-muted mb-4 text-sm sm:text-base">
          No sessions recorded yet
        </div>
        <Button
          onClick={() => setIsNewSessionOpen(true)}
          className="bg-doser-primary hover:bg-doser-primary-hover w-full sm:w-auto max-w-xs"
        >
          Record Your First Session
        </Button>
      </div>
    );
  }

  const renderCardView = () => (
    <div className="bg-doser-surface border border-doser-border rounded-xl overflow-hidden flex flex-col h-[calc(100vh-300px)]">
      <div className="flex-1 overflow-y-auto scrollbar-doser p-4">
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className="relative bg-doser-surface border border-doser-border rounded-xl p-3 sm:p-4 cursor-pointer hover:shadow-xl hover:shadow-doser-primary/10 transition-all duration-300 hover:border-doser-primary/40 hover:bg-doser-surface-hover group transform hover:-translate-y-1"
              onClick={() => handleSessionClick(session)}
            >
              {/* Session Header */}
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <div className="text-xl font-bold text-doser-text truncate group-hover:text-doser-primary transition-colors duration-200">
                    {formatTime(session.session_time)}
                  </div>
                  <div className="text-sm text-doser-text-muted group-hover:text-doser-text/80 transition-colors duration-200">
                    {formatDate(session.session_date)}
                  </div>
                </div>
                <div className="flex items-center flex-shrink-0 ml-2">
                  {renderStars(session.rating)}
                </div>
              </div>

              {/* Enhanced Calculations */}
              <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gradient-to-r from-doser-primary-light/10 to-doser-primary-light/5 border border-doser-primary/20 rounded-lg group-hover:border-doser-primary/30 transition-all duration-200">
                <div className="text-xs font-semibold text-doser-primary mb-2 uppercase tracking-wide">
                  Dosage Breakdown
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-amber-400 font-bold text-sm">
                      {session.total_thc_mg.toFixed(1)}mg
                    </div>
                    <div className="text-doser-text-muted text-xs">
                      Total THC
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-400 font-bold text-sm">
                      {session.total_cbd_mg.toFixed(1)}mg
                    </div>
                    <div className="text-doser-text-muted text-xs">
                      Total CBD
                    </div>
                  </div>
                </div>
              </div>
              {/* Effects */}
              {session.effects && session.effects.length > 0 && (
                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gradient-to-r from-purple-500/5 to-purple-500/10 border border-purple-500/20 rounded-lg group-hover:border-purple-500/30 transition-all duration-200">
                  <div className="text-xs font-semibold text-purple-400 mb-2 uppercase tracking-wide">
                    Effects Experienced
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {session.effects
                      .slice(0, 4)
                      .map((effect: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-xs"
                        >
                          <div className="w-4 h-4 bg-green-500/20 text-green-400 rounded text-center text-xs flex items-center justify-center">
                            😌
                          </div>
                          <span className="text-doser-text truncate">
                            {effect}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              {/* Session Details Grid */}
              <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gradient-to-r from-doser-primary-light/10 to-doser-primary-light/5 border border-doser-primary/20 rounded-lg group-hover:border-doser-primary/30 transition-all duration-200">
                {/* Device and Temperature */}
                <div className="space-y-2 mb-4">
                  <div className="text-sm">
                    <span className="font-medium text-doser-text-muted">
                      Device:
                    </span>
                    <span className="block text-doser-text font-medium truncate">
                      {session.device_name}
                    </span>
                  </div>
                  <div className="text-sm flex flex-row gap-2">
                    <div className="font-medium text-doser-text-muted">
                      Temp:
                    </div>
                    <div className="block text-doser-text font-medium">
                      {getTemperatureDisplay(session)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-sm">
                    <span className="font-medium text-doser-text-muted">
                      Duration:
                    </span>
                    <span className="block text-doser-text font-semibold">
                      {session.duration_minutes}min
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-doser-text-muted">
                      Method:
                    </span>
                    <span className="block text-doser-text font-semibold">
                      {session.unit_type === "capsule" ? "Capsule" : "Chamber"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Higher Accuracy Badge */}
              {session.higher_accuracy_mode && (
                <div className="mt-3">
                  <Badge className="bg-gradient-to-r from-green-500/20 to-green-400/20 text-green-400 border-green-500/30 text-xs px-3 py-1 font-medium">
                    High Accuracy Mode
                  </Badge>
                </div>
              )}

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-doser-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderListView = () => (
    <div className="bg-doser-surface border border-doser-border rounded-xl overflow-hidden flex flex-col h-[calc(100vh-300px)]">
      <div className="flex-1 overflow-y-auto scrollbar-doser">
        {sessions.map((session) => (
          <ListViewSessionCard
            key={session.id}
            session={session}
            onClick={handleSessionClick}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {viewMode === "cards" ? renderCardView() : renderListView()}
    </div>
  );
};

export default SessionsGrid;

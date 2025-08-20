import React from "react";
import { Session } from "../../../lib/sessionService";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";

type Props = {
  sessions: Session[];
  setIsNewSessionOpen: (open: boolean) => void;
  handleSessionClick: (session: Session) => void;
  formatDate: (date: string) => string;
  formatTime: (time: string) => string;
  getTemperatureDisplay: (session: Session) => string;
  getMaterialDisplay: (session: Session) => string;
  renderEnhancedCalculations: (session: Session) => React.ReactNode;
  renderStars: (rating: number | null) => React.ReactNode;
};

const SessionsGrid = ({
  sessions,
  setIsNewSessionOpen,
  handleSessionClick,
  formatDate,
  formatTime,
  getTemperatureDisplay,
  getMaterialDisplay,
  renderEnhancedCalculations,
  renderStars,
}: Props) => {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {sessions.length === 0 ? (
        <div className="col-span-full text-center py-6 sm:py-8 lg:py-12 px-4">
          <div className="text-doser-text-muted mb-4 text-sm sm:text-base">
            No sessions recorded yet
          </div>
          <Button
            onClick={() => setIsNewSessionOpen(true)}
            className="bg-doser-primary hover:bg-doser-primary/90 w-full sm:w-auto max-w-xs"
          >
            Record Your First Session
          </Button>
        </div>
      ) : (
        sessions.map((session) => (
          <Card
            key={session.id}
            className="p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-shadow border-doser-primary/20 hover:border-doser-primary/40"
            onClick={() => handleSessionClick(session)}
          >
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="flex-1 min-w-0">
                <div className="text-base sm:text-lg font-semibold text-doser-primary truncate">
                  {formatTime(session.session_time)}
                </div>
                <div className="text-xs sm:text-sm text-doser-text-muted">
                  {formatDate(session.session_date)}
                </div>
              </div>
              <div className="flex items-center flex-shrink-0 ml-2">
                {renderStars(session.rating)}
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
              <div className="text-xs sm:text-sm">
                <span className="font-medium text-doser-text-muted">
                  Device:
                </span>{" "}
                <span className="truncate block text-doser-text">
                  {session.device_name}
                </span>
              </div>
              <div className="text-xs sm:text-sm">
                <span className="font-medium text-doser-text-muted">
                  Temperature:
                </span>{" "}
                <span className="truncate block text-doser-text">
                  {getTemperatureDisplay(session)}
                </span>
              </div>
              <div className="text-xs sm:text-sm">
                <span className="font-medium text-doser-text-muted">
                  Draws:
                </span>{" "}
                <span className="text-doser-text">
                  {session.total_session_inhalations !== null
                    ? session.total_session_inhalations
                    : "N/A"}
                </span>
              </div>
              <div className="text-xs sm:text-sm">
                <span className="font-medium text-doser-text-muted">
                  Material:
                </span>{" "}
                <span className="truncate block text-doser-text">
                  {getMaterialDisplay(session)}
                </span>
              </div>
              <div className="text-xs sm:text-sm">
                <span className="font-medium text-doser-primary">
                  Duration:
                </span>{" "}
                <span className="text-doser-text">
                  {session.duration_minutes}min
                </span>
              </div>
            </div>

            {/* Enhanced Calculations Display */}
            <div className="mb-3 sm:mb-4 text-xs sm:text-sm">
              {renderEnhancedCalculations(session)}
            </div>

            {/* Effects */}
            {session.effects && session.effects.length > 0 && (
              <div className="mt-3 sm:mt-4">
                <div className="text-xs sm:text-sm font-medium text-doser-primary mb-2">
                  Effects
                </div>
                <div className="flex flex-wrap gap-1">
                  {session.effects.map((effect: string, index: number) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs border-doser-primary/30 text-doser-primary"
                    >
                      {effect}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Higher Accuracy Badge */}
            {session.higher_accuracy_mode && (
              <div className="mt-3">
                <Badge className="bg-green-100 text-green-800 text-xs">
                  High Accuracy Mode
                </Badge>
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  );
};

export default SessionsGrid;

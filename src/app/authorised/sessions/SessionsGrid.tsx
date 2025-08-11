import React from "react";
import { Session } from "../../../lib/sessionService";
import { Badge } from "lucide-react";
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sessions.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <div className="text-doser-text-muted mb-4">
            No sessions recorded yet
          </div>
          <Button
            onClick={() => setIsNewSessionOpen(true)}
            className="bg-doser-primary hover:bg-doser-primary/90"
          >
            Record Your First Session
          </Button>
        </div>
      ) : (
        sessions.map((session) => (
          <Card
            key={session.id}
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-doser-primary/20 hover:border-doser-primary/40"
            onClick={() => handleSessionClick(session)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-lg font-semibold text-doser-primary">
                  {formatTime(session.session_time)}
                </div>
                <div className="text-sm text-doser-text-muted">
                  {formatDate(session.session_date)}
                </div>
              </div>
              <div className="flex items-center">
                {renderStars(session.rating)}
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="text-sm">
                <span className="font-medium">Device:</span>{" "}
                {session.device_name}
              </div>
              <div className="text-sm">
                <span className="font-medium">Temperature:</span>{" "}
                {getTemperatureDisplay(session)}
              </div>
              <div className="text-sm">
                <span className="font-medium">Draws:</span>{" "}
                {session.draws_count}
              </div>
              <div className="text-sm">
                <span className="font-medium">Material:</span>{" "}
                {getMaterialDisplay(session)}
              </div>
              <div className="text-sm">
                <span className="font-medium">Duration:</span>{" "}
                {session.duration_minutes}min
              </div>
            </div>

            {/* Enhanced Calculations Display */}
            {renderEnhancedCalculations(session)}

            {/* Effects */}
            {session.effects && session.effects.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium text-doser-primary mb-2">
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

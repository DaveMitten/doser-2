import React from "react";
import { Session } from "@/lib/sessionService";
import { Badge } from "@/components/ui/badge";
import {
  formatDate,
  formatTime,
  renderStars,
} from "../../lib/sessionCardUtils";

interface ListViewSessionCardProps {
  session: Session;
  onClick: (session: Session) => void;
}

const ListViewSessionCard: React.FC<ListViewSessionCardProps> = ({
  session,
  onClick,
}) => {
  return (
    <div
      className="p-4 border border-doser-border/50 rounded-lg cursor-pointer hover:bg-doser-surface-hover hover:border-doser-primary/40 hover:shadow-lg hover:shadow-doser-primary/10 transition-all duration-200 group"
      onClick={() => onClick(session)}
    >
      {/* Session Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <div className="text-lg font-semibold text-doser-text group-hover:text-green-400 transition-colors duration-200">
            {formatTime(session.session_time)}
          </div>
          <div className="text-sm text-doser-text-muted group-hover:text-green-400 transition-colors duration-200">
            {formatDate(session.session_date)}
          </div>
        </div>
        <div className="flex items-center flex-shrink-0 ml-2">
          {renderStars(session.rating)}
        </div>
      </div>

      {/* 3 col layout */}
      <div className="grid grid-cols-3 gap-4 w-full">
        {/* Dosage Breakdown */}
        <div className="mb-4 p-3 bg-gradient-to-r from-doser-primary-light/10 to-doser-primary-light/5 border border-doser-primary/20 rounded-lg group-hover:border-doser-primary/30 transition-all duration-200">
          <div className="text-xs font-semibold text-doser-primary mb-2 uppercase tracking-wide">
            Dosage Breakdown
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <div className="text-amber-400 font-bold text-sm">
                {session.total_thc_mg.toFixed(1)}mg
              </div>
              <div className="text-doser-text-muted text-xs">Total THC</div>
            </div>
            <div className="text-center">
              <div className="text-blue-400 font-bold text-sm">
                {session.total_cbd_mg.toFixed(1)}mg
              </div>
              <div className="text-doser-text-muted text-xs">Total CBD</div>
            </div>
          </div>
        </div>

        {/* Effects */}
        {session.effects && session.effects.length > 0 && (
          <div className="w-full mb-4 p-3 bg-gradient-to-r from-purple-500/5 to-purple-500/10 border border-purple-500/20 rounded-lg group-hover:border-purple-500/30 transition-all duration-200">
            <div className="text-xs font-semibold text-purple-400 mb-2 uppercase tracking-wide">
              Effects Experienced
            </div>
            <div className="grid grid-cols-2 gap-2">
              {session.effects
                .slice(0, 4)
                .map((effect: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 bg-green-500/20 text-green-400 rounded text-center text-xs flex items-center justify-center">
                      😌
                    </div>
                    <span className="text-doser-text truncate">{effect}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Session Details */}
        <div className="mb-4 p-3 bg-gradient-to-r from-doser-primary-light/10 to-doser-primary-light/5 border border-doser-primary/20 rounded-lg group-hover:border-doser-primary/30 transition-all duration-200">
          <div className="space-y-3">
            {/* Session Details Grid  */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              {/* duration */}
              <div>
                <span className="font-medium text-doser-text-muted">
                  Duration:
                </span>
                <span className="ml-2 text-doser-text font-semibold">
                  {session.duration_minutes}min
                </span>
              </div>
              {/* method */}
              <div>
                <span className="font-medium text-doser-text-muted">
                  Method:
                </span>
                <span className="ml-2 text-doser-text font-semibold">
                  {session.unit_type === "capsule" ? "Capsule" : "Chamber"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1">
              {" "}
              {/* device */}
              <div className="flex items-center">
                <span className="font-medium text-doser-text-muted">
                  Device:
                </span>
                <span className="ml-2 text-doser-text font-semibold">
                  {session.device_name}
                </span>
              </div>
            </div>
          </div>

          {/* Higher Accuracy Badge */}
          {session.higher_accuracy_mode && (
            <div className="pt-1">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs px-2 py-1">
                High Accuracy Mode
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListViewSessionCard;

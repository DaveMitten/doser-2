import React from "react";
import { Session } from "@/lib/sessionService";
import { formatDate, formatTime } from "@/lib/sessionCardUtils";

interface DashboardSessionCardProps {
  session: Session;
  onClick: (session: Session) => void;
}

const DashboardSessionCard: React.FC<DashboardSessionCardProps> = ({
  session,
  onClick,
}) => {
  return (
    <div
      className="bg-doser-surface border border-doser-border rounded-xl p-4 cursor-pointer hover:shadow-lg hover:shadow-doser-primary/10 transition-all duration-300 hover:border-doser-primary/40 hover:bg-doser-surface-hover group transform hover:-translate-y-1 relative"
      onClick={() => onClick(session)}
    >
      {/* Session Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <div className="text-lg font-bold text-doser-text truncate group-hover:text-green-400 transition-colors duration-200">
            {formatDate(session.session_date)}
          </div>
          <div className="text-sm text-doser-text-muted group-hover:text-green-400 transition-colors duration-200">
            {formatTime(session.session_time)}
          </div>
        </div>
        <div className="flex items-center flex-shrink-0 ml-2">
          {session.rating && (
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < session.rating! ? "text-yellow-400" : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Device */}
      <div className="mb-3">
        <div className="text-sm">
          <span className="font-medium text-doser-text-muted">Device:</span>
          <span className="block text-doser-text font-medium truncate">
            {session.device_name}
          </span>
        </div>
      </div>

      {/* Dosage Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-sm">
          <span className="font-medium text-doser-text-muted">THC:</span>
          <span className="block text-doser-text font-bold text-amber-400 text-lg">
            {session.total_thc_mg.toFixed(1)}mg
          </span>
          <span className="text-xs text-doser-text-muted">
            ({session.thc_percentage}%)
          </span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-doser-text-muted">CBD:</span>
          <span className="block text-doser-text font-bold text-blue-400 text-lg">
            {session.total_cbd_mg.toFixed(1)}mg
          </span>
          <span className="text-xs text-doser-text-muted">
            ({session.cbd_percentage}%)
          </span>
        </div>
      </div>

      {/* Additional Details */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-sm">
          <span className="font-medium text-doser-text-muted">Duration:</span>
          <span className="block text-doser-text font-semibold">
            {session.duration_minutes}min
          </span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-doser-text-muted">Method:</span>
          <span className="block text-doser-text font-semibold">
            {session.unit_type === "capsule" ? "Capsule" : "Chamber"}
          </span>
        </div>
      </div>

      {/* Enhanced Calculations - Dosage Breakdown */}
      <div className="mb-3 p-3 bg-gradient-to-r from-doser-primary-light/10 to-doser-primary-light/5 border border-doser-primary/20 rounded-lg group-hover:border-doser-primary/30 transition-all duration-200">
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

      {/* Effects (if any) */}
      {session.effects && session.effects.length > 0 && (
        <div className="mb-3 p-3 bg-gradient-to-r from-purple-500/5 to-purple-500/10 border border-purple-500/20 rounded-lg group-hover:border-purple-500/30 transition-all duration-200">
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

      {/* Higher Accuracy Badge */}
      {session.higher_accuracy_mode && (
        <div className="mt-2">
          <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30 font-medium">
            High Accuracy
          </span>
        </div>
      )}

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-doser-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
    </div>
  );
};

export default DashboardSessionCard;

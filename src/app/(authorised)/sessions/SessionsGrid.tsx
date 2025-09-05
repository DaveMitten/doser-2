import React from "react";
import { Session } from "../../../lib/sessionService";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import ListViewSessionCard from "../../../components/sessions/ListViewSessionCard";
import SessionCard from "../../../components/sessions/SessionCard";
import { EmptyState } from "../../../components/ui/empty-state";

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
      <EmptyState
        title="No sessions recorded yet"
        description="Start tracking your cannabis consumption to see your dosing patterns and effects"
        buttonText="Record Your First Session"
        onButtonClick={() => setIsNewSessionOpen(true)}
        icon="📊"
      />
    );
  }

  const renderCardView = () => (
    <div className="bg-doser-surface border border-doser-border rounded-xl overflow-hidden flex flex-col h-[calc(100vh-300px)]">
      <div className="flex-1 overflow-y-auto scrollbar-doser p-4">
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onClick={handleSessionClick}
            />
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

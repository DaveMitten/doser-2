import React from "react";
import { Session } from "../../../lib/sessionService";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import ListViewSessionCard from "../../../components/sessions/ListViewSessionCard";
import SessionCard from "../../../components/sessions/SessionCard";

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

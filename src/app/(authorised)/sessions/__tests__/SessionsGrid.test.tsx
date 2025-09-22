import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SessionsGrid from "../SessionsGrid";
import { Session } from "@/lib/sessionService";

// Mock the EmptyState component
jest.mock("@/components/ui/empty-state", () => ({
  EmptyState: ({
    title,
    description,
    buttonText,
    onButtonClick,
  }: {
    title: string;
    description: string;
    buttonText: string;
    onButtonClick: () => void;
  }) => (
    <div data-testid="empty-state">
      <div>{title}</div>
      <div>{description}</div>
      <button onClick={onButtonClick}>{buttonText}</button>
    </div>
  ),
}));

// Mock the SessionCard components
jest.mock("@/components/sessions/SessionCard", () => ({
  __esModule: true,
  default: ({
    session,
    onClick,
  }: {
    session: Session;
    onClick: (session: Session) => void;
  }) => (
    <div
      data-testid={`session-card-${session.id}`}
      onClick={() => onClick(session)}
    >
      Session {session.id}
    </div>
  ),
}));

jest.mock("@/components/sessions/ListViewSessionCard", () => ({
  __esModule: true,
  default: ({
    session,
    onClick,
  }: {
    session: Session;
    onClick: (session: Session) => void;
  }) => (
    <div
      data-testid={`list-session-card-${session.id}`}
      onClick={() => onClick(session)}
    >
      List Session {session.id}
    </div>
  ),
}));

describe("SessionsGrid", () => {
  const mockSetIsNewSessionOpen = jest.fn();
  const mockHandleSessionClick = jest.fn();

  const mockSessions: Session[] = [
    {
      id: "1",
      user_id: "user1",
      session_date: "2024-01-01",
      session_time: "10:00:00",
      duration_minutes: 30,
      total_thc_mg: 10.5,
      total_cbd_mg: 2.0,
      unit_type: "capsule",
      device_name: "Test Device",
      total_session_inhalations: 5,
      temperature_celsius: 180,
      effects: ["relaxed", "focused"],
      rating: 4,
      notes: "Great session",
      created_at: "2024-01-01T10:00:00Z",
      updated_at: "2024-01-01T10:00:00Z",
      temperature_fahrenheit: null,
      unit_amount: 0,
      unit_capacity_grams: 0,
      thc_percentage: 0,
      cbd_percentage: 0,
      higher_accuracy_mode: false,
      inhalations_per_capsule: null,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when no sessions", () => {
    render(
      <SessionsGrid
        sessions={[]}
        setIsNewSessionOpen={mockSetIsNewSessionOpen}
        handleSessionClick={mockHandleSessionClick}
        viewMode="cards"
      />
    );

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("No sessions recorded yet")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Start tracking your cannabis consumption to see your dosing patterns and effects"
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Record Your First Session")).toBeInTheDocument();
  });

  it("calls setIsNewSessionOpen when empty state button is clicked", () => {
    render(
      <SessionsGrid
        sessions={[]}
        setIsNewSessionOpen={mockSetIsNewSessionOpen}
        handleSessionClick={mockHandleSessionClick}
        viewMode="cards"
      />
    );

    const button = screen.getByText("Record Your First Session");
    fireEvent.click(button);

    expect(mockSetIsNewSessionOpen).toHaveBeenCalledWith(true);
  });

  it("renders sessions in card view when sessions exist", () => {
    render(
      <SessionsGrid
        sessions={mockSessions}
        setIsNewSessionOpen={mockSetIsNewSessionOpen}
        handleSessionClick={mockHandleSessionClick}
        viewMode="cards"
      />
    );

    expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
    expect(screen.getByTestId("session-card-1")).toBeInTheDocument();
    expect(screen.getByText("Session 1")).toBeInTheDocument();
  });

  it("renders sessions in list view when sessions exist", () => {
    render(
      <SessionsGrid
        sessions={mockSessions}
        setIsNewSessionOpen={mockSetIsNewSessionOpen}
        handleSessionClick={mockHandleSessionClick}
        viewMode="list"
      />
    );

    expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
    expect(screen.getByTestId("list-session-card-1")).toBeInTheDocument();
    expect(screen.getByText("List Session 1")).toBeInTheDocument();
  });

  it("calls handleSessionClick when a session card is clicked", () => {
    render(
      <SessionsGrid
        sessions={mockSessions}
        setIsNewSessionOpen={mockSetIsNewSessionOpen}
        handleSessionClick={mockHandleSessionClick}
        viewMode="cards"
      />
    );

    const sessionCard = screen.getByTestId("session-card-1");
    fireEvent.click(sessionCard);

    expect(mockHandleSessionClick).toHaveBeenCalledWith(mockSessions[0]);
  });
});

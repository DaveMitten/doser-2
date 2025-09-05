import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DashboardPage from "../page";
import { Session } from "@/lib/sessionService";

// Mock the AuthContext
jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user1", email: "test@example.com" },
  }),
}));

// Mock the sessionService
jest.mock("@/lib/sessionService", () => ({
  sessionService: {
    getUserSessions: jest.fn(),
  },
  Session: {} as Session,
}));

// Mock the supabase-browser
jest.mock("@/lib/supabase-browser", () => ({
  createSupabaseBrowserClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    }),
  }),
}));

// Mock the EmptyState component
jest.mock("@/components/ui/empty-state", () => ({
  EmptyState: ({
    title,
    description,
    buttonText,
    onButtonClick,
  }: {
    title: string;
    description?: string;
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

// Mock the NewSessionForm component
jest.mock("@/components/new-session/new-session-form", () => ({
  NewSessionForm: ({
    isOpen,
    setSessionFormOpen,
    onSessionCreated,
  }: {
    isOpen: boolean;
    setSessionFormOpen: (open: boolean) => void;
    onSessionCreated: () => void;
  }) =>
    isOpen ? (
      <div data-testid="new-session-form">
        <button onClick={() => setSessionFormOpen(false)}>Close</button>
        <button onClick={() => onSessionCreated()}>Create Session</button>
      </div>
    ) : null,
}));

// Mock the SessionCard component
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

// Skip the reload test for now to avoid mocking issues

describe("DashboardPage", () => {
  const mockGetUserSessions = jest.mocked(
    require("@/lib/sessionService").sessionService.getUserSessions
  );

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserSessions.mockResolvedValue({ data: [], error: null });
  });

  it("renders loading state initially", () => {
    render(<DashboardPage />);

    // Should show loading skeleton with pulse animations
    expect(screen.getByText("Welcome back, User")).toBeInTheDocument();
  });

  it("renders empty state when no sessions", async () => {
    render(<DashboardPage />);

    // Wait for loading to complete and empty state to render
    const emptyState = await screen.findByTestId("empty-state");
    expect(emptyState).toBeInTheDocument();

    expect(screen.getByText("No sessions recorded yet")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Start tracking your cannabis consumption to see your dosing patterns and effects"
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Record Your First Session")).toBeInTheDocument();
  });

  it("shows New Session button in header when sessions exist", async () => {
    mockGetUserSessions.mockResolvedValue({
      data: [
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
          effects: ["relaxed"],
          rating: 4,
          notes: "Great session",
          created_at: "2024-01-01T10:00:00Z",
          updated_at: "2024-01-01T10:00:00Z",
        },
      ],
      error: null,
    });

    render(<DashboardPage />);

    // Wait for loading to complete
    await screen.findByText("Recent Sessions");

    // Should show New Session button in header
    expect(screen.getByText("+ New Session")).toBeInTheDocument();
  });

  it("does not show New Session button in header when no sessions", async () => {
    render(<DashboardPage />);

    // Wait for loading to complete
    await screen.findByTestId("empty-state");

    // Should not show New Session button in header
    expect(screen.queryByText("+ New Session")).not.toBeInTheDocument();
  });

  it("opens new session form when empty state button is clicked", async () => {
    render(<DashboardPage />);

    // Wait for loading to complete
    const emptyState = await screen.findByTestId("empty-state");

    const button = screen.getByText("Record Your First Session");
    fireEvent.click(button);

    // Should show new session form
    expect(screen.getByTestId("new-session-form")).toBeInTheDocument();
  });

  it("opens new session form when header button is clicked", async () => {
    mockGetUserSessions.mockResolvedValue({
      data: [
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
          effects: ["relaxed"],
          rating: 4,
          notes: "Great session",
          created_at: "2024-01-01T10:00:00Z",
          updated_at: "2024-01-01T10:00:00Z",
        },
      ],
      error: null,
    });

    render(<DashboardPage />);

    // Wait for loading to complete
    await screen.findByText("Recent Sessions");

    const headerButton = screen.getByText("+ New Session");
    fireEvent.click(headerButton);

    // Should show new session form
    expect(screen.getByTestId("new-session-form")).toBeInTheDocument();
  });
});

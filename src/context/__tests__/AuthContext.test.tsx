import React from "react";
import {
  render,
  screen,
  waitFor,
  act,
  renderHook,
} from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthContext";
import "@testing-library/jest-dom";

// Mock Supabase client
const mockSupabase = {
  auth: {
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(),
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    refreshSession: jest.fn(),
  },
};

// Mock the supabase-browser module
jest.mock("@/lib/supabase-browser", () => ({
  createSupabaseBrowserClient: () => mockSupabase,
}));

// Mock cookie utilities
jest.mock("@/lib/cookie-utils", () => ({
  getCookie: jest.fn(),
  deleteCookie: jest.fn(),
}));

// Mock utils
jest.mock("@/lib/utils", () => ({
  getAuthCallbackUrl: () => "http://localhost:3000/auth/callback",
}));

// Test component to access auth context
function TestComponent() {
  const {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshSession,
    checkSessionValidity,
  } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading ? "Loading..." : "Loaded"}</div>
      <div data-testid="user">{user ? user.email : "No user"}</div>
      <button
        data-testid="signup-btn"
        onClick={() => signUp("test@example.com", "password")}
      >
        Sign Up
      </button>
      <button
        data-testid="signin-btn"
        onClick={() => signIn("test@example.com", "password")}
      >
        Sign In
      </button>
      <button data-testid="signout-btn" onClick={signOut}>
        Sign Out
      </button>
      <button
        data-testid="reset-btn"
        onClick={() => resetPassword("test@example.com")}
      >
        Reset Password
      </button>
      <button data-testid="refresh-btn" onClick={refreshSession}>
        Refresh Session
      </button>
      <button data-testid="check-btn" onClick={checkSessionValidity}>
        Check Session
      </button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    });
  });

  it("should render with loading state initially", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("loading")).toHaveTextContent("Loading...");
  });

  it("should show no user initially", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("user")).toHaveTextContent("No user");
  });

  it("should handle signup successfully", async () => {
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: { email: "test@example.com" } },
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signupBtn = screen.getByTestId("signup-btn");
    await act(async () => {
      signupBtn.click();
    });

    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password",
      options: {
        emailRedirectTo: "http://localhost:3000/auth/callback",
        data: {
          email_verified: false, // Should be false in test environment
        },
      },
    });
  });

  it("should handle signin successfully", async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { email: "test@example.com" } },
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signinBtn = screen.getByTestId("signin-btn");
    await act(async () => {
      signinBtn.click();
    });

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password",
    });
  });

  it("should handle signout successfully", async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signoutBtn = screen.getByTestId("signout-btn");
    await act(async () => {
      signoutBtn.click();
    });

    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });

  it("should handle reset password successfully", async () => {
    mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const resetBtn = screen.getByTestId("reset-btn");
    await act(async () => {
      resetBtn.click();
    });

    expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      "test@example.com"
    );
  });

  it("should handle session refresh successfully", async () => {
    mockSupabase.auth.refreshSession.mockResolvedValue({
      data: { session: { user: { email: "test@example.com" } } },
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const refreshBtn = screen.getByTestId("refresh-btn");
    await act(async () => {
      refreshBtn.click();
    });

    expect(mockSupabase.auth.refreshSession).toHaveBeenCalled();
  });

  it("should handle auth state changes", async () => {
    let authStateCallback: (event: string, session: unknown) => void;

    mockSupabase.auth.onAuthStateChange.mockImplementation(
      (callback: unknown) => {
        authStateCallback = callback as (
          event: string,
          session: unknown
        ) => void;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      }
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Simulate auth state change
    await act(async () => {
      authStateCallback("SIGNED_IN", { user: { email: "test@example.com" } });
    });

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("Loaded");
    });
  });

  it("should handle signup errors gracefully", async () => {
    const mockError = new Error("Signup failed");
    mockSupabase.auth.signUp.mockResolvedValue({
      data: null,
      error: mockError,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    // The function should throw the error, which is expected behavior
    await expect(
      result.current.signUp("test@example.com", "password")
    ).rejects.toThrow("Signup failed");

    expect(mockSupabase.auth.signUp).toHaveBeenCalled();
  });

  it("should handle signin errors gracefully", async () => {
    const mockError = new Error("Invalid credentials");
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: mockError,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    // The function should throw the error, which is expected behavior
    await expect(
      result.current.signIn("test@example.com", "password")
    ).rejects.toThrow("Invalid credentials");

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalled();
  });
});

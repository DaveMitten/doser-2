"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Zap } from "lucide-react";
import { login } from "../../app/(public)/auth/actions";

interface LoginFormProps {
  onToggleMode: () => void;
}

// Test credentials - only used in development
const IS_DEV = process.env.NODE_ENV === "development";
const TEST_EMAIL = IS_DEV ? "test@example.com" : "";
const TEST_PASSWORD = IS_DEV ? "testpassword123" : "";
export function LoginForm({ onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();

  // Auto-fill test credentials in development
  useEffect(() => {
    if (IS_DEV) {
      setEmail(TEST_EMAIL);
      setPassword(TEST_PASSWORD);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuickLogin = async () => {
    setEmail(TEST_EMAIL);
    setPassword(TEST_PASSWORD);
    setLoading(true);
    setError(null);

    try {
      await signIn(TEST_EMAIL, TEST_PASSWORD);
    } catch {
      try {
        const formData = new FormData();
        formData.append("email", TEST_EMAIL);
        formData.append("password", TEST_PASSWORD);
        await login(formData);
      } catch (serverErr) {
        const errorMessage =
          serverErr instanceof Error
            ? serverErr.message
            : "An error occurred during sign in";
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    try {
      // Try client-side auth first for better UX
      await signIn(email, password);
    } catch {
      // If client-side fails, try server action
      try {
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        await login(formData);
      } catch (serverErr) {
        const errorMessage =
          serverErr instanceof Error
            ? serverErr.message
            : "An error occurred during sign in";
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6 bg-doser-card border-doser-border">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-doser-text">Welcome Back</h2>
        <p className="text-doser-text-muted mt-2">Sign in to your account</p>
      </div>

      {IS_DEV && (
        <div className="mb-4">
          <Button
            type="button"
            onClick={handleQuickLogin}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-sm"
            variant="outline"
          >
            <Zap size={14} className="mr-2" />
            Quick Login (Test Mode)
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="bg-doser-background border-doser-border text-doser-text"
            required
          />
        </div>

        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="bg-doser-background border-doser-border text-doser-text pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-doser-text-muted hover:text-doser-text transition-colors"
            disabled={loading}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <Button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full bg-doser-primary hover:bg-doser-primary-hover text-doser-text"
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-doser-text-muted">
          Don&apos;t have an account?{" "}
          <button
            onClick={onToggleMode}
            className="text-doser-primary hover:text-doser-primary-hover font-medium"
          >
            Sign up
          </button>
        </p>
      </div>
    </Card>
  );
}

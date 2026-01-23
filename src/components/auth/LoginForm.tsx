"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Zap } from "lucide-react";
import { login } from "../../app/(public)/auth/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface LoginFormProps {
  onToggleMode: () => void;
}

// Test credentials - only used in development
const IS_DEV = process.env.NODE_ENV === "development";
const TEST_EMAIL = IS_DEV ? "davidmitten88+prod3@gmail.com" : "";
const TEST_PASSWORD = IS_DEV ? "Ihatepasswords1" : "";

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  // Auto-fill test credentials in development
  useEffect(() => {
    if (IS_DEV) {
      setEmail(TEST_EMAIL);
      setPassword(TEST_PASSWORD);
    }
  }, []);

  const handleQuickLogin = () => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", TEST_EMAIL);
      formData.append("password", TEST_PASSWORD);
      const result = await login(formData);

      if (result.success) {
        // Refresh the client-side session to pick up the new cookies
        await supabase.auth.getSession();
        // Small delay to ensure auth state updates
        await new Promise((resolve) => setTimeout(resolve, 100));
        // Navigate to dashboard
        window.location.href = "/dashboard";
      } else {
        setError(result.error || "An error occurred during sign in");
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      const result = await login(formData);

      if (result.success) {
        // Refresh the client-side session to pick up the new cookies
        await supabase.auth.getSession();
        // Small delay to ensure auth state updates
        await new Promise((resolve) => setTimeout(resolve, 100));
        // Navigate to dashboard
        window.location.href = "/dashboard";
      } else {
        setError(result.error || "An error occurred during sign in");
      }
    });
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
            disabled={isPending}
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
            disabled={isPending}
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
            disabled={isPending}
            className="bg-doser-background border-doser-border text-doser-text pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-doser-text-muted hover:text-doser-text transition-colors"
            disabled={isPending}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <Button
          type="submit"
          disabled={isPending || !email || !password}
          className="w-full bg-doser-primary hover:bg-doser-primary-hover text-doser-text"
        >
          {isPending ? "Signing in..." : "Sign In"}
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

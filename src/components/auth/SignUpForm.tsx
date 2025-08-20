"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { signup } from "@/app/(public)/auth/actions";

interface SignUpFormProps {
  onToggleMode: () => void;
}

export function SignUpForm({ onToggleMode }: SignUpFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with:", { email, password, confirmPassword });

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Attempting to sign up with email:", email);
      // Try client-side auth first for better UX
      await signUp(email, password);
      console.log("Sign up successful!");
      setSuccess(true);
    } catch (err) {
      console.error("Client-side signup failed:", err);
      // If client-side fails, try server action
      try {
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        await signup(formData);
        setSuccess(true);
      } catch (serverErr) {
        console.error("Server-side signup failed:", serverErr);
        const errorMessage =
          serverErr instanceof Error
            ? serverErr.message
            : "An error occurred during sign up";
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto p-6 bg-doser-card border-doser-border">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-doser-text mb-4">
            Check Your Email
          </h2>
          <p className="text-doser-text-muted mb-6">
            We&apos;ve sent you a confirmation link at <strong>{email}</strong>
          </p>
          <Button onClick={onToggleMode} variant="doser">
            Back to Sign In
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6 bg-doser-card border-doser-border">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-doser-text">Create Account</h2>
        <p className="text-doser-text-muted mt-2">Sign up for a new account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
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

        <div className="relative">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            className="bg-doser-background border-doser-border text-doser-text pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-doser-text-muted hover:text-doser-text transition-colors"
            disabled={loading}
          >
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <Button
          type="submit"
          disabled={loading || !email || !password || !confirmPassword}
          className="w-full bg-doser-primary hover:bg-doser-primary-hover text-doser-text"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-doser-text-muted">
          Already have an account?{" "}
          <button
            onClick={onToggleMode}
            className="text-doser-primary hover:text-doser-primary-hover font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </Card>
  );
}

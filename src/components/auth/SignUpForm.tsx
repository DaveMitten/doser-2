"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { signup, checkEmailExists } from "@/app/(public)/auth/actions";
import { EmailConfirmationModal } from "@/components/auth/EmailConfirmationModal";

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
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailValid, setEmailValid] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { signUp, resendVerificationEmail } = useAuth();

  // Debounced email validation
  useEffect(() => {
    if (!email) {
      setEmailError(null);
      setEmailValid(false);
      return;
    }

    // Clear previous error and reset valid state while typing
    setEmailError(null);
    setEmailValid(false);

    // Debounce both format validation and existence check - only run after user stops typing
    const timeoutId = setTimeout(async () => {
      // Only check if the email is still the same (user hasn't continued typing)
      if (email) {
        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          setEmailError("Please enter a valid email address");
          setEmailValid(false);
          return;
        }

        // If format is valid, check existence
        setIsCheckingEmail(true);
        try {
          const result = await checkEmailExists(email);
          if (result.exists) {
            setEmailError(
              "An account with this email already exists. Please sign in instead."
            );
            setEmailValid(false);
          } else {
            setEmailError(null);
            setEmailValid(true);
          }
        } catch (error) {
          console.error("Error checking email:", error);
          // Don't show error for network issues, just log them
          setEmailValid(false);
        } finally {
          setIsCheckingEmail(false);
        }
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [email]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  // Helper function to get user-friendly error messages
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (
        message.includes("user already registered") ||
        message.includes("already exists") ||
        message.includes("duplicate key") ||
        message.includes("23505")
      ) {
        return "An account with this email already exists. Please sign in instead.";
      }

      if (message.includes("invalid email")) {
        return "Please enter a valid email address.";
      }

      if (message.includes("password")) {
        return "Password must be at least 6 characters long.";
      }

      if (
        message.includes("rate limit") ||
        message.includes("too many requests")
      ) {
        return "Too many signup attempts. Please wait a moment and try again.";
      }

      if (message.includes("network") || message.includes("connection")) {
        return "Network error. Please check your connection and try again.";
      }

      // Return the original error message for other cases
      return error.message;
    }

    return "An unexpected error occurred. Please try again.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear any previous errors
    setError(null);

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    // Check if there's an email validation error
    if (emailError) {
      setError("Please fix the email validation errors before submitting");
      return;
    }

    // Wait for email validation to complete if it's still checking
    if (isCheckingEmail) {
      setError("Please wait for email validation to complete");
      return;
    }

    // Ensure email has been validated and is available
    if (!emailValid) {
      setError("Please enter a valid email address that hasn't been used");
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
      // Try client-side auth first for better UX
      await signUp(email, password);
      setSuccess(true);
    } catch (err) {
      console.error("Client-side signup failed:", err);

      // Check if this is a duplicate email error
      const errorMessage = getErrorMessage(err);
      if (errorMessage.includes("already exists")) {
        setError(errorMessage);
        return;
      }

      // If client-side fails, try server action
      try {
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        await signup(formData);
        setSuccess(true);
      } catch (serverErr) {
        console.error("Server-side signup failed:", serverErr);

        // Use the helper function for server errors too
        const finalErrorMessage = getErrorMessage(serverErr);
        setError(finalErrorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendMessage(null);

    try {
      await resendVerificationEmail(email);
      setResendMessage("Verification email sent! Please check your inbox.");
      // Start 60-second cooldown timer
      setResendCooldown(60);
    } catch (error) {
      console.error("Resend verification error:", error);
      setResendMessage("Failed to send verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError(null);
    setEmailError(null);
    setEmailValid(false);
    setResendMessage(null);
    setResendCooldown(0);
  };

  if (success) {
    return (
      <EmailConfirmationModal
        title="Check Your Email"
        message="We've sent you a confirmation link at"
        email={email}
        secondaryMessage="Once verified, you'll have access to your 7-day free trial!"
        resendMessage={resendMessage}
        isResending={isResending}
        resendCooldown={resendCooldown}
        onResend={handleResendVerification}
        onReset={() => {
          resetForm();
          onToggleMode();
        }}
        resetButtonText="Back to Sign In"
      />
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
            aria-invalid={!!emailError}
            required
          />
          {isCheckingEmail && (
            <p className="text-blue-500 text-xs mt-1">
              Checking email availability...
            </p>
          )}
          {emailError && (
            <p className="text-red-500 text-xs mt-1">{emailError}</p>
          )}
          {emailValid && !emailError && !isCheckingEmail && email && (
            <p className="text-green-500 text-xs mt-1">✓ Email is available</p>
          )}
          {email && !emailError && !emailValid && !isCheckingEmail && (
            <p className="text-gray-500 text-xs mt-1">
              Type to check email availability
            </p>
          )}
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
          <div className="text-red-500 text-sm text-center p-3 bg-red-50 border border-red-200 rounded-md">
            {error}
            {error.includes("already exists") && (
              <div className="mt-2">
                <button
                  onClick={onToggleMode}
                  className="text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  Click here to sign in instead
                </button>
              </div>
            )}
          </div>
        )}

        <Button
          type="submit"
          disabled={
            loading ||
            !email ||
            !password ||
            !confirmPassword ||
            isCheckingEmail ||
            !emailValid
          }
          className="w-full bg-doser-primary hover:bg-doser-primary-hover text-doser-text"
        >
          {loading
            ? "Creating account..."
            : isCheckingEmail
            ? "Validating email..."
            : "Sign Up"}
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

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/authorised/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-doser-background flex items-center justify-center">
        <div className="text-doser-text">Loading...</div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-doser-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)]"></div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        {isSignUp ? (
          <SignUpForm onToggleMode={() => setIsSignUp(false)} />
        ) : (
          <LoginForm onToggleMode={() => setIsSignUp(true)} />
        )}
      </div>
    </div>
  );
}

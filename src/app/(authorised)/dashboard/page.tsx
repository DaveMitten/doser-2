"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { sessionService, Session } from "@/lib/sessionService";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import SessionCard from "@/components/sessions/SessionCard";
import { EmptyState } from "@/components/ui/empty-state";
import { NewSessionForm } from "@/components/new-session/new-session-form";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";

import {
  processDosingTrends,
  processEffectsData,
  processUsagePattern,
} from "@/lib/chartDataUtils";

interface DashboardStats {
  totalSessions: number;
  avgThcDose: number;
  avgCbdDose: number;
  totalDaysTracked: number;
  thisWeekSessions: number;
  lastWeekSessions: number;
  mostUsedDevice: string;
  totalThcConsumed: number;
  totalCbdConsumed: number;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);

  // DEBUG: Log user state on dashboard mount
  useEffect(() => {
    // console.log("=== DASHBOARD MOUNTED ===");
    // console.log("User:", user ? { id: user.id, email: user.email } : "No user");
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user profile
        const supabase = createSupabaseBrowserClient();
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else {
          setProfile(profileData);
        }

        // Fetch user sessions
        const { data: sessions, error: sessionsError } =
          await sessionService.getUserSessions();

        if (sessionsError) {
          throw sessionsError;
        }

        if (sessions) {
          setAllSessions(sessions);
          setRecentSessions(sessions.slice(0, 3)); // Get 3 most recent sessions

          // Calculate statistics
          const now = new Date();
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const twoWeeksAgo = new Date(
            now.getTime() - 14 * 24 * 60 * 60 * 1000
          );

          const thisWeekSessions = sessions.filter(
            (s) => new Date(s.session_date) >= oneWeekAgo
          );
          const lastWeekSessions = sessions.filter(
            (s) =>
              new Date(s.session_date) >= twoWeeksAgo &&
              new Date(s.session_date) < oneWeekAgo
          );

          // Calculate unique days tracked
          const uniqueDays = new Set(sessions.map((s) => s.session_date)).size;

          // Calculate averages
          const totalThc = sessions.reduce((sum, s) => sum + s.total_thc_mg, 0);
          const totalCbd = sessions.reduce((sum, s) => sum + s.total_cbd_mg, 0);
          const avgThc = sessions.length > 0 ? totalThc / sessions.length : 0;
          const avgCbd = sessions.length > 0 ? totalCbd / sessions.length : 0;

          // Find most used device
          const deviceCounts: { [key: string]: number } = {};
          sessions.forEach((s) => {
            deviceCounts[s.device_name] =
              (deviceCounts[s.device_name] || 0) + 1;
          });
          const mostUsedDevice =
            Object.entries(deviceCounts).sort(
              ([, a], [, b]) => b - a
            )[0]?.[0] || "None";

          setStats({
            totalSessions: sessions.length,
            avgThcDose: Math.round(avgThc * 10) / 10,
            avgCbdDose: Math.round(avgCbd * 10) / 10,
            totalDaysTracked: uniqueDays,
            thisWeekSessions: thisWeekSessions.length,
            lastWeekSessions: lastWeekSessions.length,
            mostUsedDevice,
            totalThcConsumed: Math.round(totalThc * 10) / 10,
            totalCbdConsumed: Math.round(totalCbd * 10) / 10,
          });
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // const getDisplayName = () => {
  //   if (profile?.full_name) {
  //     return profile.full_name.split(" ")[0]; // First name only
  //   }
  //   return user?.email?.split("@")[0] || "User";
  // };

  const handleSessionClick = (session: Session) => {
    // For now, just log the session. In a real app, you might want to navigate to a detail view
    // console.log("Session clicked:", session);
  };

  const handleNewSessionCreated = () => {
    // Refresh dashboard data
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-80 animate-pulse"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-doser-surface border-doser-border">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-doser-text-muted mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-doser-text mb-2">
            {/* Welcome back, {getDisplayName()} */}
            Welcome back, Luke!
          </h1>
          <p className="text-doser-text-muted">
            Here&apos;s your cannabis dosing overview for today
          </p>
        </div>
        {recentSessions.length > 0 && (
          <Button
            onClick={() => setIsNewSessionOpen(true)}
            className="bg-doser-primary hover:bg-doser-primary-hover"
          >
            + New Session
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="md:hidden">
        {/* Mobile: Horizontal scrolling cards */}
        <div className="mb-3">
          <p className="text-xs text-doser-text-muted text-center">
            ← Scroll to see all stats →
          </p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-doser">
          {/* Total Sessions */}
          <Card className="bg-doser-surface border-doser-border min-w-[280px] flex-shrink-0">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-doser-text mb-2">
                  {stats?.totalSessions || 0}
                </div>
                <div className="text-doser-text-muted text-sm mb-2">
                  Total Sessions
                </div>
                {stats && stats.lastWeekSessions > 0 && (
                  <div className="text-doser-primary text-xs">
                    +{stats.thisWeekSessions - stats.lastWeekSessions} from last
                    week
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Avg THC Dose */}
          <Card className="bg-doser-surface border-doser-border min-w-[280px] flex-shrink-0">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-doser-text mb-2">
                  {stats?.avgThcDose || 0}mg
                </div>
                <div className="text-doser-text-muted text-sm mb-2">
                  Avg THC Dose
                </div>
                {stats && stats.totalThcConsumed > 0 && (
                  <div className="text-doser-primary text-xs">
                    {stats.totalThcConsumed}mg total consumed
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Avg CBD Dose */}
          <Card className="bg-doser-surface border-doser-border min-w-[280px] flex-shrink-0">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-doser-text mb-2">
                  {stats?.avgCbdDose || 0}mg
                </div>
                <div className="text-doser-text-muted text-sm mb-2">
                  Avg CBD Dose
                </div>
                {stats && stats.totalCbdConsumed > 0 && (
                  <div className="text-doser-primary text-xs">
                    {stats.totalCbdConsumed}mg total consumed
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Days Tracked */}
          <Card className="bg-doser-surface border-doser-border min-w-[280px] flex-shrink-0">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-doser-text mb-2">
                  {stats?.totalDaysTracked || 0}
                </div>
                <div className="text-doser-text-muted text-sm mb-2">
                  Days Tracked
                </div>
                {stats && stats.thisWeekSessions > 0 && (
                  <div className="text-doser-primary text-xs">
                    {stats.thisWeekSessions} this week
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Desktop: Grid layout */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sessions */}
        <Card className="bg-doser-surface border-doser-border">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-doser-text mb-2">
                {stats?.totalSessions || 0}
              </div>
              <div className="text-doser-text-muted text-sm mb-2">
                Total Sessions
              </div>
              {stats && stats.lastWeekSessions > 0 && (
                <div className="text-doser-primary text-sm">
                  +{stats.thisWeekSessions - stats.lastWeekSessions} from last
                  week
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Avg THC Dose */}
        <Card className="bg-doser-surface border-doser-border">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-doser-text mb-2">
                {stats?.avgThcDose || 0}mg
              </div>
              <div className="text-doser-text-muted text-sm mb-2">
                Avg THC Dose
              </div>
              {stats && stats.totalThcConsumed > 0 && (
                <div className="text-doser-primary text-sm">
                  {stats.totalThcConsumed}mg total consumed
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Avg CBD Dose */}
        <Card className="bg-doser-surface border-doser-border">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-doser-text mb-2">
                {stats?.avgCbdDose || 0}mg
              </div>
              <div className="text-doser-text-muted text-sm mb-2">
                Avg CBD Dose
              </div>
              {stats && stats.totalCbdConsumed > 0 && (
                <div className="text-doser-primary text-sm">
                  {stats.totalCbdConsumed}mg total consumed
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Days Tracked */}
        <Card className="bg-doser-surface border-doser-border">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-doser-text mb-2">
                {stats?.totalDaysTracked || 0}
              </div>
              <div className="text-doser-text-muted text-sm mb-2">
                Days Tracked
              </div>
              {stats && stats.thisWeekSessions > 0 && (
                <div className="text-doser-primary text-sm">
                  {stats.thisWeekSessions} this week
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      {stats && stats.totalSessions > 0 && allSessions.length > 0 && (
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-xl font-semibold text-doser-text">
            Analytics & Insights
          </h2>
          <DashboardCharts
            dosingTrends={processDosingTrends(allSessions)}
            effects={processEffectsData(allSessions)}
            usagePattern={processUsagePattern(allSessions)}
          />
        </div>
      )}

      {/* Recent Sessions */}
      {recentSessions.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-doser-text">
            Recent Sessions
          </h2>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {recentSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onClick={handleSessionClick}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-doser-text">
            Recent Sessions
          </h2>
          <EmptyState
            title="No sessions recorded yet"
            description="Start tracking your cannabis consumption to see your dosing patterns and effects"
            buttonText="Record Your First Session"
            onButtonClick={() => setIsNewSessionOpen(true)}
            icon="📊"
          />
        </div>
      )}

      {/* New Session Form */}
      <NewSessionForm
        isOpen={isNewSessionOpen}
        setSessionFormOpen={setIsNewSessionOpen}
        onSessionCreated={handleNewSessionCreated}
      />
    </div>
  );
}

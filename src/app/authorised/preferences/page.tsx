"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useUserPreferences } from "@/lib/useUserPreferences";
import { useState } from "react";

export default function PreferencesPage() {
  const { preferences, loading, error, updateTemperatureUnit } =
    useUserPreferences();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleTemperatureUnitChange = async (
    unit: "celsius" | "fahrenheit"
  ) => {
    if (!preferences) return;

    setIsUpdating(true);
    try {
      await updateTemperatureUnit(unit);
    } catch (err) {
      console.error("Failed to update temperature unit:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-doser-text">Loading preferences...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-400">Error loading preferences: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-doser-text mb-2">Preferences</h1>
        <p className="text-doser-text-muted">
          Customize your Doser experience and settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Temperature Unit Preference */}
        <Card className="bg-doser-surface border-doser-border">
          <CardHeader>
            <CardTitle className="text-doser-text flex items-center gap-3">
              <span className="text-2xl">🌡️</span>
              Temperature Unit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-doser-text-muted">
                Choose your preferred temperature unit for vaporizer sessions.
                This will be used in the new session form and other
                temperature-related features.
              </p>

              <div className="flex items-center justify-between p-4 bg-doser-surface-hover rounded-lg border border-doser-border">
                <div>
                  <div className="font-medium text-doser-text">
                    Celsius (°C)
                  </div>
                  <div className="text-sm text-doser-text-muted">
                    Standard temperature scale (150-230°C range)
                  </div>
                </div>
                <Switch
                  checked={preferences?.temperature_unit === "celsius"}
                  onCheckedChange={(checked) =>
                    handleTemperatureUnitChange(
                      checked ? "celsius" : "fahrenheit"
                    )
                  }
                  disabled={isUpdating}
                  className="data-[state=checked]:bg-doser-primary"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-doser-surface-hover rounded-lg border border-doser-border">
                <div>
                  <div className="font-medium text-doser-text">
                    Fahrenheit (°F)
                  </div>
                  <div className="text-sm text-doser-text-muted">
                    US temperature scale (300-450°F range)
                  </div>
                </div>
                <Switch
                  checked={preferences?.temperature_unit === "fahrenheit"}
                  onCheckedChange={(checked) =>
                    handleTemperatureUnitChange(
                      checked ? "fahrenheit" : "celsius"
                    )
                  }
                  disabled={isUpdating}
                  className="data-[state=checked]:bg-doser-primary"
                />
              </div>

              {isUpdating && (
                <div className="text-sm text-doser-text-muted">
                  Updating preference...
                </div>
              )}

              <div className="mt-4 p-3 bg-doser-primary/10 border border-doser-primary/20 rounded-lg">
                <p className="text-sm text-doser-primary">
                  <strong>Current setting:</strong>{" "}
                  {preferences?.temperature_unit === "celsius"
                    ? "Celsius (°C)"
                    : "Fahrenheit (°F)"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Other Preferences */}
        <Card className="bg-doser-surface border-doser-border">
          <CardHeader>
            <CardTitle className="text-doser-text flex items-center gap-3">
              <span className="text-2xl">⚙️</span>
              Other Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-doser-surface-hover rounded-lg border border-doser-border">
                <div>
                  <div className="font-medium text-doser-text">
                    Default Vape Type
                  </div>
                  <div className="text-sm text-doser-text-muted">
                    {preferences?.default_vape_type || "Not set"}
                  </div>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Coming Soon
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-doser-surface-hover rounded-lg border border-doser-border">
                <div>
                  <div className="font-medium text-doser-text">
                    Inhalations per Capsule
                  </div>
                  <div className="text-sm text-doser-text-muted">
                    {preferences?.inhalations_per_capsule || "Not set"}
                  </div>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Coming Soon
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-doser-surface-hover rounded-lg border border-doser-border">
                <div>
                  <div className="font-medium text-doser-text">
                    Preferred Dose Unit
                  </div>
                  <div className="text-sm text-doser-text-muted">
                    {preferences?.preferred_dose_unit || "Not set"}
                  </div>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Coming Soon
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

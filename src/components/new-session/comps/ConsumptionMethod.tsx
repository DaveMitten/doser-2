"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import React from "react";
import { dryHerbVaporizers } from "../../../data/vapes";
import {
  getTemperaturePlaceholder,
  getTemperatureMin,
  getTemperatureMax,
  getTemperatureUnitSymbol,
  getMaterialPlaceholder,
  getMaterialMax,
  getMaterialUnitLabel,
  isDrawsValid,
  getMaxDraws,
} from "../../../lib/new-session";
import { Input } from "../../ui/input";
import { Vaporizer } from "../../../context/data-types";
import { SessionFormData } from "../../../lib/sessionService";

type ConsumptionMethodProps = {
  formData: SessionFormData;
  handleInputChange: (field: string, value: string | boolean) => void;
  selectedDevice: Vaporizer | null;
  temperatureUnit: "celsius" | "fahrenheit";
  setTemperatureUnit: (unit: "celsius" | "fahrenheit") => void;
};

const ConsumptionMethod = ({
  formData,
  handleInputChange,
  selectedDevice,
  temperatureUnit,
  setTemperatureUnit,
}: ConsumptionMethodProps) => {
  return (
    <div>
      <h3 className="text-doser-primary font-semibold mb-4">
        Consumption Method
      </h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-doser-text mb-2">
            Method <span className="text-red-400">*</span>
          </label>
          <div className="bg-doser-surface-hover border border-doser-border rounded-lg px-3 py-2 text-doser-text">
            <span className="text-sm">Dry Herb Vaporizer</span>
          </div>
          <p className="text-xs text-doser-text-muted mt-1">
            Fixed to vaporizer for now
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-doser-text mb-2">
            Device Used <span className="text-red-400">*</span>
          </label>
          <Select
            value={formData.device}
            onValueChange={(value) => handleInputChange("device", value)}
          >
            <SelectTrigger className="w-full bg-doser-surface-hover border-doser-border text-doser-text">
              <SelectValue placeholder="Select your vaporizer" />
            </SelectTrigger>
            <SelectContent className="bg-doser-surface-hover border-doser-border">
              <div className="px-2 py-1.5 text-sm font-semibold text-doser-text-muted border-b border-doser-border">
                Portable Vaporizers
              </div>
              {dryHerbVaporizers
                .filter((v) => v.type === "portable")
                .map((vaporizer) => (
                  <SelectItem
                    key={vaporizer.name}
                    value={vaporizer.name}
                    className="text-doser-text hover:bg-doser-surface-hover"
                  >
                    {vaporizer.name}
                  </SelectItem>
                ))}
              <div className="px-2 py-1.5 text-sm font-semibold text-doser-text-muted border-b border-doser-border mt-2">
                Desktop Vaporizers
              </div>
              {dryHerbVaporizers
                .filter((v) => v.type === "desktop")
                .map((vaporizer) => (
                  <SelectItem
                    key={vaporizer.name}
                    value={vaporizer.name}
                    className="text-doser-text hover:bg-doser-surface-hover"
                  >
                    {vaporizer.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-doser-text-muted mt-1">
            Select the vaporizer you used for this session
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-doser-text mb-2">
            Temperature
          </label>
          <div className="relative">
            <Input
              type="number"
              placeholder={getTemperaturePlaceholder(temperatureUnit)}
              value={formData.temperature}
              onChange={(e) => handleInputChange("temperature", e.target.value)}
              className="bg-doser-surface-hover border-doser-border text-doser-text pr-16"
              min={getTemperatureMin(temperatureUnit)}
              max={getTemperatureMax(temperatureUnit)}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <span className="text-doser-text-muted text-sm">
                {getTemperatureUnitSymbol(temperatureUnit)}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-doser-text-muted">°C</span>
                <Switch
                  checked={temperatureUnit === "fahrenheit"}
                  onCheckedChange={(checked) =>
                    setTemperatureUnit(checked ? "fahrenheit" : "celsius")
                  }
                  className="data-[state=checked]:bg-doser-primary data-[state=unchecked]:bg-doser-border"
                />
                <span className="text-xs text-doser-text-muted">°F</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-doser-text-muted mt-1">
            {temperatureUnit === "celsius"
              ? "150-230°C range"
              : "300-450°F range"}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-doser-text mb-2">
            Measurement Method
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              className={`flex-1 px-3 py-2 rounded-lg border transition-all text-sm font-medium ${
                formData.material.includes("chamber")
                  ? "bg-doser-primary/10 border-doser-primary/30 text-doser-primary"
                  : "bg-doser-surface-hover border-doser-border text-doser-text-muted hover:text-doser-text hover:bg-doser-surface"
              }`}
              onClick={() => {
                if (selectedDevice && selectedDevice.chamberCapacity > 0) {
                  handleInputChange(
                    "material",
                    `chamber-${selectedDevice.chamberCapacity}`
                  );
                }
              }}
              disabled={!selectedDevice || selectedDevice.chamberCapacity === 0}
            >
              Chamber
            </button>
            <button
              type="button"
              className={`flex-1 px-3 py-2 rounded-lg border transition-all text-sm font-medium ${
                formData.material.includes("capsule")
                  ? "bg-doser-primary/10 border-doser-primary/30 text-doser-primary"
                  : "bg-doser-surface-hover border-doser-border text-doser-text-muted hover:text-doser-text hover:bg-doser-surface"
              }`}
              onClick={() => {
                if (selectedDevice && selectedDevice.capsuleOption) {
                  handleInputChange(
                    "material",
                    `capsule-${selectedDevice.dosingCapsuleCapacity}`
                  );
                }
              }}
              disabled={!selectedDevice || !selectedDevice.capsuleOption}
            >
              Capsule
            </button>
          </div>
          <p className="text-xs text-doser-text-muted mt-1">
            {selectedDevice
              ? `Select whether you used the chamber or dosing capsule`
              : "Select a device first to see available options"}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-doser-text mb-2">
            Amount Used <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Input
              type="number"
              step="1"
              placeholder={getMaterialPlaceholder(formData, selectedDevice)}
              value={formData.materialAmount}
              onChange={(e) =>
                handleInputChange("materialAmount", e.target.value)
              }
              className="bg-doser-surface-hover border-doser-border text-doser-text pr-20"
              min="1"
              max={getMaterialMax(formData, selectedDevice)}
              required
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-doser-text-muted text-sm">
              {getMaterialUnitLabel(formData)}
            </span>
          </div>
          <p className="text-xs text-doser-text-muted mt-1">
            Number of {getMaterialUnitLabel(formData)} consumed (max:{" "}
            {getMaterialMax(formData, selectedDevice)}). Each{" "}
            {formData.material.includes("capsule") ? "capsule" : "chamber"}{" "}
            contains{" "}
            {formData.material.includes("capsule")
              ? selectedDevice?.dosingCapsuleCapacity
              : selectedDevice?.chamberCapacity}
            g of material.
          </p>
        </div>
      </div>

      {/* Higher Accuracy Mode Toggle */}
      <div className="grid grid-cols-1 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-doser-text mb-2">
            Higher Accuracy Mode
          </label>
          <div className="flex items-center space-x-3">
            <Switch
              checked={formData.higherAccuracy}
              onCheckedChange={(checked) => {
                console.log("Switch changed to:", checked);
                handleInputChange("higherAccuracy", checked);
              }}
            />
            <span className="text-xs text-doser-text-muted">
              Use detailed inhalation calculations
            </span>
          </div>
          {!formData.higherAccuracy && (
            <p className="text-xs text-doser-text-muted mt-2 italic">
              💡 When disabled, total inhalations is hidden and calculations use
              a default value of 8 inhalations.
            </p>
          )}
        </div>
      </div>

      {/* Inhalations Fields - Now in a row when higher accuracy is enabled */}
      {formData.higherAccuracy && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-doser-text mb-2">
              Inhalations per{" "}
              {formData.material.includes("capsule") ? "capsule" : "chamber"}{" "}
              <span className="text-red-400">*</span>
            </label>
            <Input
              type="number"
              placeholder="6"
              value={formData.totalSessionInhalations}
              onChange={(e) =>
                handleInputChange("totalSessionInhalations", e.target.value)
              }
              className={`bg-doser-surface-hover border text-doser-text ${
                formData.totalSessionInhalations && !isDrawsValid(formData)
                  ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                  : "border-doser-border focus:border-doser-primary focus:ring-doser-primary/20"
              }`}
              min="1"
              max={getMaxDraws(formData)}
              required
            />
            <div className="mt-1">
              <p className="text-xs text-doser-text-muted">
                Max: {getMaxDraws(formData)} inhalations per{" "}
                {formData.material.includes("capsule") ? "capsule" : "chamber"}
              </p>
              {formData.totalSessionInhalations && !isDrawsValid(formData) && (
                <p className="text-xs text-red-400 mt-1">
                  ⚠️ Inhalations per{" "}
                  {formData.material.includes("capsule")
                    ? "capsule"
                    : "chamber"}{" "}
                  cannot exceed {getMaxDraws(formData)}.
                </p>
              )}
            </div>
            <p className="text-xs text-doser-text-muted mt-1">
              Number of inhalations you took from each{" "}
              {formData.material.includes("capsule") ? "capsule" : "chamber"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-doser-text mb-2">
              Total Session Inhalations
            </label>
            <Input
              type="number"
              placeholder="e.g., 8"
              value={formData.totalSessionInhalations}
              onChange={(e) =>
                handleInputChange("totalSessionInhalations", e.target.value)
              }
              className="w-full"
            />
            <p className="text-xs text-doser-text-muted mt-1">
              Total number of inhalations for this session
            </p>
            <div className="mt-2 p-2 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              <p className="text-xs text-blue-600/80">
                💡 This is the maximum number of inhalations you can typically
                get from one capsule/chamber before the material is fully
                extracted. This helps calculate how much material you actually
                consumed based on your actual inhalations taken.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumptionMethod;

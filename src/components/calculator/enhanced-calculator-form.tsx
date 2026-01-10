"use client"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { HelpCircle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { dryHerbVaporizers } from "@/data/vapes"
import { cn } from "@/lib/utils"
import type { CalculatorInputs } from "@/lib/calculator"

interface EnhancedCalculatorFormProps {
  inputs: CalculatorInputs
  setInputs: (inputs: CalculatorInputs) => void
  onCalculate: () => void
  errors: string[]
  isVaporizerSelected: boolean
  thcDisplayValue: string
  cbdDisplayValue: string
  onDecimalInput: (e: React.ChangeEvent<HTMLInputElement>, field: keyof CalculatorInputs) => void
}

export function EnhancedCalculatorForm({
  inputs,
  setInputs,
  onCalculate,
  errors,
  isVaporizerSelected,
  thcDisplayValue,
  cbdDisplayValue,
  onDecimalInput,
}: EnhancedCalculatorFormProps) {
  return (
    <Card className="bg-doser-surface border-doser-border p-8">
      <h2 className="text-xl font-semibold mb-7">Calculator Settings</h2>

      <TooltipProvider>
        <div className="space-y-7">
          {/* Vaporizer Select */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              Vaporizer
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-doser-primary/20 cursor-help">
                    <HelpCircle className="h-3 w-3 text-doser-primary" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Select your vaporizer device from the list</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <Select value={inputs.vaporizer} onValueChange={(value) => setInputs({ ...inputs, vaporizer: value })}>
              <SelectTrigger className="w-full bg-doser-background border-doser-border h-11">
                <SelectValue placeholder="Select your vaporizer" />
              </SelectTrigger>
              <SelectContent>
                {dryHerbVaporizers.map((vape) => (
                  <SelectItem key={vape.name} value={vape.name}>
                    {vape.name}
                  </SelectItem>
                ))}
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Method Toggle */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              Measurement Method
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-doser-primary/20 cursor-help">
                    <HelpCircle className="h-3 w-3 text-doser-primary" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Choose between dosing capsule or chamber</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <div className="flex gap-2 p-1.5 rounded-lg bg-doser-background border border-doser-border">
              <button
                onClick={() => setInputs({ ...inputs, measurementMethod: "capsule" })}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all",
                  inputs.measurementMethod === "capsule"
                    ? "bg-doser-primary text-white"
                    : "text-doser-text-disabled hover:text-doser-text-primary hover:bg-white/5"
                )}
              >
                Capsule
              </button>
              <button
                onClick={() => setInputs({ ...inputs, measurementMethod: "chamber" })}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all",
                  inputs.measurementMethod === "chamber"
                    ? "bg-doser-primary text-white"
                    : "text-doser-text-disabled hover:text-doser-text-primary hover:bg-white/5"
                )}
              >
                Chamber
              </button>
            </div>
          </div>

          {/* Higher Accuracy (Coming Soon) */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              Higher Accuracy
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-[11px] font-semibold text-amber-500">
                <span>⏱</span>
                Coming Soon
              </span>
            </Label>
            <p className="text-xs text-doser-text-disabled leading-relaxed">
              Include detailed inhalation calculations for more precise results
            </p>
            <div className="flex gap-2 p-1.5 rounded-lg bg-doser-background border border-doser-border opacity-40 pointer-events-none">
              <button className="flex-1 py-2.5 px-4 rounded-md text-sm font-medium text-doser-text-disabled">
                Disabled
              </button>
              <button className="flex-1 py-2.5 px-4 rounded-md text-sm font-medium text-doser-text-disabled">
                Enabled
              </button>
            </div>
          </div>

          {/* Cannabinoid Percentages */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              Cannabinoid Percentages
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-doser-primary/20 cursor-help">
                    <HelpCircle className="h-3 w-3 text-doser-primary" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Enter the THC and CBD percentages from your product label</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  type="text"
                  value={thcDisplayValue}
                  onChange={(e) => onDecimalInput(e, "thcPercentage")}
                  className="bg-doser-background border-doser-border h-11 pr-16"
                  placeholder="15"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-doser-text-disabled pointer-events-none">
                  % THC
                </span>
              </div>
              <div className="relative">
                <Input
                  type="text"
                  value={cbdDisplayValue}
                  onChange={(e) => onDecimalInput(e, "cbdPercentage")}
                  className="bg-doser-background border-doser-border h-11 pr-16"
                  placeholder="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-doser-text-disabled pointer-events-none">
                  % CBD
                </span>
              </div>
            </div>
          </div>

          {/* Desired Dose Type */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              Desired Dose Type
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-doser-primary/20 cursor-help">
                    <HelpCircle className="h-3 w-3 text-doser-primary" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Choose whether to calculate based on THC or CBD</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setInputs({ ...inputs, desiredDoseType: "thc" })}
                className={cn(
                  "py-3.5 px-4 rounded-lg text-sm font-medium border-2 transition-all",
                  inputs.desiredDoseType === "thc"
                    ? "border-doser-primary bg-doser-primary/10 text-doser-primary"
                    : "border-doser-border hover:border-doser-border-hover"
                )}
              >
                THC
              </button>
              <button
                onClick={() => setInputs({ ...inputs, desiredDoseType: "cbd" })}
                className={cn(
                  "py-3.5 px-4 rounded-lg text-sm font-medium border-2 transition-all",
                  inputs.desiredDoseType === "cbd"
                    ? "border-doser-primary bg-doser-primary/10 text-doser-primary"
                    : "border-doser-border hover:border-doser-border-hover"
                )}
              >
                CBD
              </button>
            </div>
          </div>

          {/* Desired Dose Amount */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              Desired Dose (mg)
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-doser-primary/20 cursor-help">
                    <HelpCircle className="h-3 w-3 text-doser-primary" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Enter your target dose in milligrams</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <Input
              type="number"
              value={inputs.desiredDose}
              onChange={(e) => setInputs({ ...inputs, desiredDose: parseFloat(e.target.value) || 0 })}
              className="bg-doser-background border-doser-border h-11"
              min="0"
              step="0.5"
              placeholder="5"
            />
            <div className="mt-2">
              <Slider
                value={[inputs.desiredDose]}
                onValueChange={(value) => setInputs({ ...inputs, desiredDose: value[0] })}
                max={50}
                step={0.5}
                className="[&_[role=slider]]:bg-doser-primary [&_[role=slider]]:border-doser-primary [&_[role=slider]]:shadow-doser-button"
              />
              <div className="flex justify-between mt-2 text-xs text-doser-text-disabled">
                <span>0mg</span>
                <span>25mg</span>
                <span>50mg</span>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {errors.length > 0 && (
            <div className="space-y-2">
              {errors.map((error, index) => (
                <div key={index} className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              ))}
            </div>
          )}

          {/* Calculate Button */}
          <Button
            onClick={onCalculate}
            disabled={!isVaporizerSelected}
            className="w-full h-12 text-base font-semibold bg-doser-primary hover:bg-doser-primary-hover text-white shadow-doser-button hover:shadow-doser-button-hover hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isVaporizerSelected ? "Calculate Dosage" : "Select a Vaporizer First"}
          </Button>
        </div>
      </TooltipProvider>
    </Card>
  )
}
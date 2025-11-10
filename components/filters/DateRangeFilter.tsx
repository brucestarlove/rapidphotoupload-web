"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format, subDays, startOfYear, startOfDay, addDays } from "date-fns";

interface DateRangeFilterProps {
  value?: { start: string; end: string };
  onChange: (range: { start: string; end: string } | undefined) => void;
}

type Preset = "last7days" | "last30days" | "thisyear" | "custom" | "none";

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [preset, setPreset] = useState<Preset>(
    value ? "custom" : "none"
  );
  const [customStart, setCustomStart] = useState(
    value?.start ? format(new Date(value.start), "yyyy-MM-dd") : ""
  );
  const [customEnd, setCustomEnd] = useState(
    value?.end ? format(new Date(value.end), "yyyy-MM-dd") : ""
  );

  const handlePresetChange = (newPreset: Preset) => {
    setPreset(newPreset);

    if (newPreset === "none") {
      onChange(undefined);
      return;
    }

    const now = new Date();
    let start: Date;
    // For "end of today", use start of tomorrow minus 1ms to ensure we cover the entire UTC day
    const tomorrow = addDays(now, 1);
    const tomorrowStart = startOfDay(tomorrow);
    const end: Date = new Date(tomorrowStart.getTime() - 1);

    switch (newPreset) {
      case "last7days":
        start = subDays(now, 7);
        break;
      case "last30days":
        start = subDays(now, 30);
        break;
      case "thisyear":
        start = startOfYear(now);
        break;
      case "custom":
        // Keep existing values or default to last week to today
        if (customStart && customEnd) {
          // Parse dates as local dates and convert to UTC boundaries
          const startDate = startOfDay(new Date(customStart + "T00:00:00"));
          // For end date, use start of next day minus 1ms to ensure full UTC day coverage
          const endDateInput = new Date(customEnd + "T00:00:00");
          const nextDayStart = new Date(endDateInput);
          nextDayStart.setDate(nextDayStart.getDate() + 1);
          const endDate = new Date(nextDayStart.getTime() - 1);
          onChange({
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          });
        } else {
          // Auto-fill with last week to today
          // Use start of day 7 days ago (local time, will convert to UTC)
          const lastWeek = startOfDay(subDays(now, 7));
          // For "end of today", use start of tomorrow minus 1ms to ensure we cover the entire UTC day
          // This ensures photos created at any time today (in any timezone) are included
          const tomorrow = addDays(now, 1);
          const tomorrowStart = startOfDay(tomorrow);
          const todayEnd = new Date(tomorrowStart.getTime() - 1);
          const startDate = format(lastWeek, "yyyy-MM-dd");
          const endDate = format(now, "yyyy-MM-dd"); // Use today's date for the input
          setCustomStart(startDate);
          setCustomEnd(endDate);
          onChange({
            start: lastWeek.toISOString(),
            end: todayEnd.toISOString(),
          });
        }
        return;
      default:
        return;
    }

    onChange({
      start: start.toISOString(),
      end: end.toISOString(),
    });
  };

      const handleCustomDateChange = () => {
        if (customStart && customEnd) {
          // Parse dates as local dates and convert to UTC boundaries
          const startDate = startOfDay(new Date(customStart + "T00:00:00")); // Start of selected start date in local time
          // For end date, use start of next day minus 1ms to ensure full UTC day coverage
          const endDateInput = new Date(customEnd + "T00:00:00");
          const nextDayStart = new Date(endDateInput);
          nextDayStart.setDate(nextDayStart.getDate() + 1);
          const endDate = new Date(nextDayStart.getTime() - 1); // End of selected end date

          if (startDate <= endDate) {
            onChange({
              start: startDate.toISOString(),
              end: endDate.toISOString(),
            });
            setPreset("custom");
          }
        }
      };

      const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleCustomDateChange();
        }
      };

  return (
    <div className="space-y-2">
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Date range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">All Dates</SelectItem>
          <SelectItem value="last7days">Last 7 days</SelectItem>
          <SelectItem value="last30days">Last 30 days</SelectItem>
          <SelectItem value="thisyear">This year</SelectItem>
          <SelectItem value="custom">Custom range</SelectItem>
        </SelectContent>
      </Select>

      {preset === "custom" && (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            onBlur={handleCustomDateChange}
            onKeyDown={handleKeyDown}
            className="w-full"
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            onBlur={handleCustomDateChange}
            onKeyDown={handleKeyDown}
            className="w-full"
          />
        </div>
      )}

      {value && preset !== "none" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setPreset("none");
            onChange(undefined);
            setCustomStart("");
            setCustomEnd("");
          }}
          className="text-xs"
        >
          Clear
        </Button>
      )}
    </div>
  );
}


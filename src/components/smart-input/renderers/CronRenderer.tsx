"use client";

import { useState } from "react";
import cronstrue from "cronstrue";
import { Wrench, Type, ChevronDown } from "lucide-react";

interface CronRendererProps {
  expression: string;
  onChange: (expression: string) => void;
}

export function CronRenderer({ expression, onChange }: CronRendererProps) {
  const [isVisualMode, setIsVisualMode] = useState(false);

  let explanation: string | null = null;
  let error: string | null = null;

  if (expression) {
    try {
      explanation = cronstrue.toString(expression);
    } catch {
      error = "Invalid Cron Expression";
    }
  }

  // Parse expression into individual fields
  const parts = expression.split(" ");
  const [minute = "*", hour = "*", day = "*", month = "*", weekday = "*"] =
    parts;

  // Update a specific field
  const updateField = (index: number, value: string) => {
    const newParts = expression.split(" ");
    while (newParts.length < 5) newParts.push("*");
    newParts[index] = value;
    onChange(newParts.join(" "));
  };

  // Dropdown options
  const minuteOptions = [
    { value: "*", label: "Every minute" },
    { value: "0", label: "At minute 0" },
    { value: "*/5", label: "Every 5 minutes" },
    { value: "*/10", label: "Every 10 minutes" },
    { value: "*/15", label: "Every 15 minutes" },
    { value: "*/30", label: "Every 30 minutes" },
  ];

  const hourOptions = [
    { value: "*", label: "Every hour" },
    { value: "0", label: "At midnight (00:00)" },
    { value: "6", label: "At 06:00" },
    { value: "9", label: "At 09:00" },
    { value: "12", label: "At noon (12:00)" },
    { value: "18", label: "At 18:00" },
    { value: "*/2", label: "Every 2 hours" },
    { value: "*/6", label: "Every 6 hours" },
  ];

  const dayOptions = [
    { value: "*", label: "Every day" },
    { value: "1", label: "On day 1" },
    { value: "15", label: "On day 15" },
    { value: "*/7", label: "Every 7 days" },
  ];

  const monthOptions = [
    { value: "*", label: "Every month" },
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const weekdayOptions = [
    { value: "*", label: "All days" },
    { value: "0", label: "Sunday" },
    { value: "1", label: "Monday" },
    { value: "2", label: "Tuesday" },
    { value: "3", label: "Wednesday" },
    { value: "4", label: "Thursday" },
    { value: "5", label: "Friday" },
    { value: "6", label: "Saturday" },
    { value: "1-5", label: "Weekdays (Mon-Fri)" },
  ];

  return (
    <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center p-12 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl flex flex-col items-center gap-8">
        {/* Toggle Mode Button */}
        <button
          onClick={() => setIsVisualMode(!isVisualMode)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-zinc-300 hover:text-white transition-colors"
        >
          {isVisualMode ? (
            <>
              <Type size={16} />
              <span>Switch to Text Input</span>
            </>
          ) : (
            <>
              <Wrench size={16} />
              <span>Visual Builder</span>
            </>
          )}
        </button>

        {/* Visual Builder Mode */}
        {isVisualMode ? (
          <div className="w-full space-y-6">
            <div className="text-zinc-500 text-sm font-medium text-center uppercase tracking-widest mb-4">
              Build Cron Expression
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Minute */}
              <div className="space-y-2">
                <label className="block text-xs text-zinc-500 uppercase tracking-wider font-medium">
                  Minute
                </label>
                <div className="relative flex items-center group h-10 w-full">
                  <select
                    value={minute}
                    onChange={(e) => updateField(0, e.target.value)}
                    className="appearance-none w-full h-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg pl-3 pr-8 text-sm text-zinc-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 focus:outline-none transition-all cursor-pointer"
                  >
                    {minuteOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 w-4 h-4 text-zinc-500 pointer-events-none group-hover:text-zinc-300 transition-colors" />
                </div>
                <div className="text-xs text-zinc-600 font-mono text-center bg-zinc-900/50 rounded py-1">
                  {minute}
                </div>
              </div>

              {/* Hour */}
              <div className="space-y-2">
                <label className="block text-xs text-zinc-500 uppercase tracking-wider font-medium">
                  Hour
                </label>
                <div className="relative flex items-center group h-10 w-full">
                  <select
                    value={hour}
                    onChange={(e) => updateField(1, e.target.value)}
                    className="appearance-none w-full h-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg pl-3 pr-8 text-sm text-zinc-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 focus:outline-none transition-all cursor-pointer"
                  >
                    {hourOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 w-4 h-4 text-zinc-500 pointer-events-none group-hover:text-zinc-300 transition-colors" />
                </div>
                <div className="text-xs text-zinc-600 font-mono text-center bg-zinc-900/50 rounded py-1">
                  {hour}
                </div>
              </div>

              {/* Day */}
              <div className="space-y-2">
                <label className="block text-xs text-zinc-500 uppercase tracking-wider font-medium">
                  Day
                </label>
                <div className="relative flex items-center group h-10 w-full">
                  <select
                    value={day}
                    onChange={(e) => updateField(2, e.target.value)}
                    className="appearance-none w-full h-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg pl-3 pr-8 text-sm text-zinc-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 focus:outline-none transition-all cursor-pointer"
                  >
                    {dayOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 w-4 h-4 text-zinc-500 pointer-events-none group-hover:text-zinc-300 transition-colors" />
                </div>
                <div className="text-xs text-zinc-600 font-mono text-center bg-zinc-900/50 rounded py-1">
                  {day}
                </div>
              </div>

              {/* Month */}
              <div className="space-y-2">
                <label className="block text-xs text-zinc-500 uppercase tracking-wider font-medium">
                  Month
                </label>
                <div className="relative flex items-center group h-10 w-full">
                  <select
                    value={month}
                    onChange={(e) => updateField(3, e.target.value)}
                    className="appearance-none w-full h-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg pl-3 pr-8 text-sm text-zinc-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 focus:outline-none transition-all cursor-pointer"
                  >
                    {monthOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 w-4 h-4 text-zinc-500 pointer-events-none group-hover:text-zinc-300 transition-colors" />
                </div>
                <div className="text-xs text-zinc-600 font-mono text-center bg-zinc-900/50 rounded py-1">
                  {month}
                </div>
              </div>

              {/* Weekday */}
              <div className="space-y-2">
                <label className="block text-xs text-zinc-500 uppercase tracking-wider font-medium whitespace-nowrap">
                  Weekday
                </label>
                <div className="relative flex items-center group h-10 w-full">
                  <select
                    value={weekday}
                    onChange={(e) => updateField(4, e.target.value)}
                    className="appearance-none w-full h-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg pl-3 pr-8 text-sm text-zinc-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 focus:outline-none transition-all cursor-pointer"
                  >
                    {weekdayOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 w-4 h-4 text-zinc-500 pointer-events-none group-hover:text-zinc-300 transition-colors" />
                </div>
                <div className="text-xs text-zinc-600 font-mono text-center bg-zinc-900/50 rounded py-1">
                  {weekday}
                </div>
              </div>
            </div>

            {/* Generated Expression Display */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">
                Generated Expression
              </div>
              <div className="text-2xl font-mono text-violet-400 text-center">
                {expression || "* * * * *"}
              </div>
            </div>
          </div>
        ) : (
          /* Text Input Mode */
          <div className="w-full">
            <label className="block text-zinc-500 text-sm font-medium mb-4 text-center uppercase tracking-widest">
              Cron Expression
            </label>
            <input
              type="text"
              value={expression}
              onChange={(e) => onChange(e.target.value)}
              className="w-full bg-transparent text-center text-5xl md:text-6xl font-mono text-zinc-100 border-b-2 border-zinc-800 focus:border-violet-500 outline-none py-4 transition-colors placeholder:text-zinc-800"
              placeholder="* * * * *"
              spellCheck={false}
              autoFocus
            />
          </div>
        )}

        {/* Human-Readable Output (Always Visible) */}
        <div className="text-center h-24 flex items-center justify-center w-full">
          {explanation ? (
            <div
              key="valid"
              className="animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="text-3xl md:text-4xl text-violet-400 font-medium leading-tight">
                {explanation}
              </div>
            </div>
          ) : error ? (
            <div
              key="invalid"
              className="animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="text-xl text-red-400 bg-red-400/10 px-4 py-2 rounded-full border border-red-400/20">
                {error}
              </div>
            </div>
          ) : (
            <div className="text-zinc-700 text-xl italic">
              {isVisualMode
                ? "Use the dropdowns above to build your schedule"
                : "Enter a cron expression to see the schedule"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

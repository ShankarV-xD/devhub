import { useState, useEffect, useCallback } from "react";
import { X, Eye, EyeOff, Shield, Check, X as XIcon } from "lucide-react";
import zxcvbn from "zxcvbn";
import { toast } from "sonner";

interface PasswordStrengthMeterProps {
  isOpen: boolean;
  onClose: () => void;
}

const STRENGTH_CONFIG = {
  0: { label: "Very Weak", color: "red", bgClass: "bg-red-600", percent: 20 },
  1: { label: "Weak", color: "orange", bgClass: "bg-orange-600", percent: 40 },
  2: { label: "Fair", color: "yellow", bgClass: "bg-yellow-600", percent: 60 },
  3: {
    label: "Good",
    color: "emerald",
    bgClass: "bg-emerald-600",
    percent: 80,
  },
  4: { label: "Strong", color: "green", bgClass: "bg-green-600", percent: 100 },
};

export function PasswordStrengthMeter({
  isOpen,
  onClose,
}: PasswordStrengthMeterProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const generateStrongPassword = useCallback(() => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    const length = 16;
    let newPassword = "";
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      newPassword += chars[array[i] % chars.length];
    }
    setPassword(newPassword);
  }, []);

  useEffect(() => {
    if (isOpen) {
      generateStrongPassword();
    }
  }, [isOpen, generateStrongPassword]);

  if (!isOpen) return null;

  const analysis = password ? zxcvbn(password) : null;
  const strength = analysis
    ? STRENGTH_CONFIG[analysis.score as 0 | 1 | 2 | 3 | 4]
    : null;

  // Requirements check
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const copyPassword = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    toast.success("Password copied to clipboard");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-zinc-400" />
            <h2 className="text-lg font-semibold text-zinc-100">
              Password Generator
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-zinc-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-auto custom-scrollbar flex-1">
          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password to analyze..."
                className="w-full px-3 py-2 pr-16 bg-zinc-950 border border-zinc-800 rounded text-sm text-zinc-100 focus:outline-none focus:border-zinc-700"
                autoFocus
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {password && (
                  <button
                    onClick={() => setPassword("")}
                    className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Helper & Generator */}
          <div className="flex justify-between items-center -mt-4">
            <span className="text-xs text-zinc-500">
              Type your own to test strength
            </span>
            <button
              onClick={generateStrongPassword}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              ✨ Generate New
            </button>
          </div>

          {/* Strength Indicator */}
          {password && strength && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-300">
                  Strength
                </span>
                <span
                  className={`text-sm font-medium text-${strength.color}-400`}
                >
                  {strength.label}
                </span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strength.bgClass} transition-all duration-300`}
                  style={{ width: `${strength.percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Requirements Checklist */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-zinc-300">
              Requirements
            </div>
            <div className="space-y-1">
              {[
                { key: "length", label: "At least 8 characters" },
                { key: "uppercase", label: "Contains uppercase letter" },
                { key: "lowercase", label: "Contains lowercase letter" },
                { key: "number", label: "Contains number" },
                { key: "special", label: "Contains special character" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  {requirements[key as keyof typeof requirements] ? (
                    <Check size={14} className="text-emerald-500" />
                  ) : (
                    <XIcon size={14} className="text-zinc-600" />
                  )}
                  <span
                    className={
                      requirements[key as keyof typeof requirements]
                        ? "text-emerald-400"
                        : "text-zinc-500"
                    }
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Time to Crack */}
          {analysis && password && (
            <div className="p-3 bg-zinc-950 rounded border border-zinc-800">
              <div className="text-xs text-zinc-500 mb-1">Time to crack</div>
              <div className="text-sm text-zinc-300">
                {
                  analysis.crack_times_display
                    .offline_slow_hashing_1e4_per_second
                }
              </div>
            </div>
          )}

          {/* Suggestions */}
          {analysis?.feedback.suggestions &&
            analysis.feedback.suggestions.length > 0 && (
              <div className="p-3 bg-amber-950/20 border border-amber-900/50 rounded">
                <div className="text-xs font-medium text-amber-400 mb-2">
                  Suggestions
                </div>
                <ul className="space-y-1">
                  {analysis.feedback.suggestions.map((suggestion, i) => (
                    <li key={i} className="text-xs text-amber-300">
                      • {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Warning */}
          {analysis?.feedback.warning && (
            <div className="p-3 bg-red-950/20 border border-red-900/50 rounded">
              <div className="text-xs text-red-400">
                ⚠️ {analysis.feedback.warning}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {password && (
          <div className="p-4 border-t border-zinc-800 flex-shrink-0">
            <button
              onClick={copyPassword}
              className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded transition-colors"
            >
              Copy Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

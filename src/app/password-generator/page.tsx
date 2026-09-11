"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";

export default function PasswordGenerator() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(false);
  const [copied, setCopied] = useState(false);

  const generatePassword = useCallback(() => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
    const ambiguous = "il1Lo0O";

    let charset = "";
    if (includeUpper) charset += upper;
    if (includeLower) charset += lower;
    if (includeNumbers) charset += numbers;
    if (includeSymbols) charset += symbols;

    if (avoidAmbiguous) {
      charset = charset.split("").filter(c => !ambiguous.includes(c)).join("");
    }

    if (charset === "") {
      setPassword("");
      return;
    }

    let newPassword = "";
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      newPassword += charset[array[i] % charset.length];
    }
    setPassword(newPassword);
    setCopied(false);
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols, avoidAmbiguous]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const copyToClipboard = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const calculateStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length > 8) score += 1;
    if (password.length > 12) score += 1;
    if (password.length >= 16) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return Math.min(score, 5);
  };

  const strength = calculateStrength();
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500", "bg-emerald-600"];

  return (
    <ToolLayout
      title="Password Generator"
      description="Create secure, random passwords instantly. Everything happens locally in your browser."
      category="Utilities"
      categoryHref="/utilities"
      icon="🔑"
    >
      <div className="flex flex-col gap-8 w-full mt-4">
        {/* Output Area */}
        <div className="relative group">
          <div className="w-full bg-black/5 dark:bg-white/5 rounded-xl p-4 sm:p-6 pr-24 break-all min-h-[5rem] flex items-center shadow-inner border border-black/5 dark:border-white/5 relative text-xl sm:text-2xl font-mono">
            {password || "Select options to generate..."}
          </div>
          <button 
            onClick={copyToClipboard}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white dark:bg-black shadow-sm border border-black/10 dark:border-white/10 hover:scale-105 transition-all text-sm font-medium flex items-center gap-1.5"
          >
            {copied ? (
              <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied</>
            ) : (
              <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy</>
            )}
          </button>
        </div>

        {/* Strength Meter */}
        <div className="flex items-center gap-4 w-full">
          <div className="text-sm font-semibold opacity-70 w-24">Strength</div>
          <div className="flex-1 flex gap-1 h-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <div 
                key={level} 
                className={`flex-1 rounded-full transition-colors ${
                  level <= strength ? strengthColors[strength] : "bg-black/10 dark:bg-white/10"
                }`}
              />
            ))}
          </div>
          <div className="text-sm font-semibold w-24 text-right">
            {strengthLabels[strength]}
          </div>
        </div>

        {/* Controls */}
        <div className="grid sm:grid-cols-2 gap-6 mt-2">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-sm">Password Length: {length}</label>
            </div>
            <input 
              type="range" 
              min="4" max="64" 
              value={length} 
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>

          <div className="space-y-3">
            {[
              { id: "upper", label: "Uppercase (A-Z)", checked: includeUpper, onChange: setIncludeUpper },
              { id: "lower", label: "Lowercase (a-z)", checked: includeLower, onChange: setIncludeLower },
              { id: "numbers", label: "Numbers (0-9)", checked: includeNumbers, onChange: setIncludeNumbers },
              { id: "symbols", label: "Symbols (!@#)", checked: includeSymbols, onChange: setIncludeSymbols },
              { id: "ambiguous", label: "Avoid ambiguous (il1Lo0O)", checked: avoidAmbiguous, onChange: setAvoidAmbiguous },
            ].map(opt => (
              <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={opt.checked} 
                  onChange={(e) => opt.onChange(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500 cursor-pointer"
                />
                <span className="text-sm opacity-80 group-hover:opacity-100 transition-opacity">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <button 
            onClick={generatePassword}
            className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.13 15.57a9 9 0 1 0 3.14-10.05L2 2"></path></svg>
            Regenerate Password
          </button>
        </div>
      </div>
    </ToolLayout>
  );
}

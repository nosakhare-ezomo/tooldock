"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";

export default function PercentageCalculator() {
  const [mode, setMode] = useState<"percentOf" | "whatPercent" | "change">("percentOf");

  // Mode 1: What is X% of Y?
  const [val1A, setVal1A] = useState("");
  const [val1B, setVal1B] = useState("");
  
  // Mode 2: X is what percent of Y?
  const [val2A, setVal2A] = useState("");
  const [val2B, setVal2B] = useState("");

  // Mode 3: Change from X to Y
  const [val3A, setVal3A] = useState("");
  const [val3B, setVal3B] = useState("");

  const calc1 = (a: string, b: string) => {
    const na = parseFloat(a);
    const nb = parseFloat(b);
    if (isNaN(na) || isNaN(nb)) return "0";
    return ((na / 100) * nb).toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  const calc2 = (a: string, b: string) => {
    const na = parseFloat(a);
    const nb = parseFloat(b);
    if (isNaN(na) || isNaN(nb) || nb === 0) return "0%";
    return ((na / nb) * 100).toLocaleString(undefined, { maximumFractionDigits: 4 }) + "%";
  };

  const calc3 = (a: string, b: string) => {
    const na = parseFloat(a);
    const nb = parseFloat(b);
    if (isNaN(na) || isNaN(nb) || na === 0) return "0%";
    const diff = nb - na;
    const res = (diff / Math.abs(na)) * 100;
    const sign = res >= 0 ? "+" : "";
    return sign + res.toLocaleString(undefined, { maximumFractionDigits: 4 }) + "%";
  };

  const PercentIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg>
  );

  return (
    <ToolLayout
      title="Percentage Calculator"
      description="Quick and precise percentage mathematics."
      category="Calculators"
      categoryHref="/calculators"
      icon={PercentIcon}
      isLocalProcessing={false} // it's just math, no need for the "processed locally" badge which is mostly for files
    >
      <div className="flex flex-col items-center gap-8 w-full mt-2">
        
        {/* Main Interface */}
        <div className="w-full flex flex-col items-center gap-6">
          
          {mode === "percentOf" && (
            <div className="flex flex-col sm:flex-row items-center gap-3 text-[17px] font-medium w-full justify-center">
              <span className="text-[var(--foreground-muted)]">What is</span>
              <input 
                type="number" 
                value={val1A} 
                onChange={e => setVal1A(e.target.value)}
                className="ios-input w-full sm:w-24 text-center font-semibold text-lg"
                placeholder="20"
              />
              <span className="text-[var(--foreground-muted)]">% of</span>
              <input 
                type="number" 
                value={val1B} 
                onChange={e => setVal1B(e.target.value)}
                className="ios-input w-full sm:w-32 text-center font-semibold text-lg"
                placeholder="60"
              />
              <span className="text-[var(--foreground-muted)] hidden sm:inline">=</span>
              <div className="result-output px-6 h-[52px] w-full sm:w-auto min-w-[120px] flex items-center justify-center font-bold text-xl result-text">
                {calc1(val1A, val1B)}
              </div>
            </div>
          )}

          {mode === "whatPercent" && (
            <div className="flex flex-col sm:flex-row items-center gap-3 text-[17px] font-medium w-full justify-center">
              <input 
                type="number" 
                value={val2A} 
                onChange={e => setVal2A(e.target.value)}
                className="ios-input w-full sm:w-32 text-center font-semibold text-lg"
                placeholder="12"
              />
              <span className="text-[var(--foreground-muted)] text-center">is what percent of</span>
              <input 
                type="number" 
                value={val2B} 
                onChange={e => setVal2B(e.target.value)}
                className="ios-input w-full sm:w-32 text-center font-semibold text-lg"
                placeholder="60"
              />
              <span className="text-[var(--foreground-muted)] hidden sm:inline">=</span>
              <div className="result-output px-6 h-[52px] w-full sm:w-auto min-w-[120px] flex items-center justify-center font-bold text-xl result-text">
                {calc2(val2A, val2B)}
              </div>
            </div>
          )}

          {mode === "change" && (
            <div className="flex flex-col sm:flex-row items-center gap-3 text-[17px] font-medium w-full justify-center">
              <span className="text-[var(--foreground-muted)]">Change from</span>
              <input 
                type="number" 
                value={val3A} 
                onChange={e => setVal3A(e.target.value)}
                className="ios-input w-full sm:w-32 text-center font-semibold text-lg"
                placeholder="50"
              />
              <span className="text-[var(--foreground-muted)]">to</span>
              <input 
                type="number" 
                value={val3B} 
                onChange={e => setVal3B(e.target.value)}
                className="ios-input w-full sm:w-32 text-center font-semibold text-lg"
                placeholder="75"
              />
              <span className="text-[var(--foreground-muted)] hidden sm:inline">=</span>
              <div className="result-output px-6 h-[52px] w-full sm:w-auto min-w-[120px] flex items-center justify-center font-bold text-xl result-text">
                {calc3(val3A, val3B)}
              </div>
            </div>
          )}

        </div>

        {/* Segmented Control */}
        <div className="mt-6 p-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl flex w-full max-w-lg mx-auto">
          {[
            { id: "percentOf", label: "Percent of number" },
            { id: "whatPercent", label: "What percent?" },
            { id: "change", label: "Increase / decrease" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id as any)}
              className={`flex-1 py-2 text-[13px] font-medium rounded-lg transition-all ${
                mode === tab.id 
                  ? "bg-[var(--background-secondary)] text-[var(--foreground)] shadow-sm border border-[var(--glass-border)]" 
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>
    </ToolLayout>
  );
}

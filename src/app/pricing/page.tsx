"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");

  return (
    <div className="flex flex-col items-center pb-24 w-full">
      <header className="w-full text-center py-20 flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
          Simple, honest pricing.
        </h1>
        <p className="text-lg opacity-70 max-w-xl text-balance">
          All essential tools are free forever. Upgrade for premium features, higher limits, and an ad-free experience.
        </p>
        
        <div className="mt-10 p-1.5 bg-black/5 dark:bg-white/5 rounded-full inline-flex gap-1 border border-black/5 dark:border-white/5">
          <button 
            onClick={() => setBilling("monthly")}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              billing === "monthly" 
                ? "bg-white dark:bg-black text-primary-600 dark:text-primary-400 shadow-sm" 
                : "opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setBilling("yearly")}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
              billing === "yearly" 
                ? "bg-white dark:bg-black text-primary-600 dark:text-primary-400 shadow-sm" 
                : "opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            Yearly <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-md font-bold transition-colors ${billing === "yearly" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : "bg-black/10 dark:bg-white/10 text-current"}`}>Save 39%</span>
          </button>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
        {/* Free Tier */}
        <div className="liquid-glass-card p-8 md:p-10 flex flex-col h-full border border-black/5 dark:border-white/5">
          <h2 className="text-2xl font-bold mb-2">FREE</h2>
          <div className="text-4xl font-bold mb-6">$0</div>
          <p className="opacity-70 text-sm mb-8 h-10">
            For occasional use and standard tasks.
          </p>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start gap-3 text-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500 shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>
              All 12 essential tools
            </li>
            <li className="flex items-start gap-3 text-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500 shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Private browser processing
            </li>
            <li className="flex items-start gap-3 text-sm opacity-60">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Standard limits (up to 10 files)
            </li>
            <li className="flex items-start gap-3 text-sm opacity-60">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Ad-supported experience
            </li>
          </ul>

          <Link href="/" className="w-full py-3 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 font-semibold rounded-xl transition-all text-center">
            Start Free
          </Link>
        </div>

        {/* Pro Tier */}
        <div className="liquid-glass-card p-8 md:p-10 flex flex-col h-full border-2 border-primary-500 relative shadow-xl shadow-primary-500/10">
          <div className="absolute top-0 right-8 -translate-y-1/2 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Most Popular
          </div>
          <h2 className="text-2xl font-bold mb-2 text-primary-600 dark:text-primary-400">PRO</h2>
          <div className="flex items-end gap-1 mb-6">
            <div className="text-4xl font-bold">${billing === "yearly" ? "29" : "3.99"}</div>
            <div className="opacity-60 mb-1">/{billing === "yearly" ? "year" : "month"}</div>
          </div>
          <p className="opacity-70 text-sm mb-8 h-10">
            For power users who need more capacity and no distractions. Cancel anytime.
          </p>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start gap-3 text-sm font-medium">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500 shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Everything in Free
            </li>
            <li className="flex items-start gap-3 text-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500 shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <strong>100% Ad-Free</strong>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500 shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Higher limits (up to 100 files)
            </li>
            <li className="flex items-start gap-3 text-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500 shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Batch processing capabilities
            </li>
            <li className="flex items-start gap-3 text-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500 shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Saved presets & history (Coming soon)
            </li>
          </ul>

          <button className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-md transition-all">
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  );
}

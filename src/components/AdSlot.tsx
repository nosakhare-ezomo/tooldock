"use client";

import React, { useState, useEffect } from "react";

interface AdSlotProps {
  placement: "homepage" | "tool-bottom" | "sidebar";
}

export function AdSlot({ placement }: AdSlotProps) {
  const [isPro, setIsPro] = useState(true); // Defaulting to true in dev so it doesn't look ugly, but in reality we'd pull from a context

  useEffect(() => {
    // In the future, check user's tier. If FREE, set isPro(false).
    setIsPro(false);
  }, []);

  // Collapse cleanly if Pro user
  if (isPro) return null;

  // Placeholder for free users
  return (
    <div className="w-full py-6 flex justify-center my-8 border-y border-black/5 dark:border-white/5 opacity-50 bg-black/5 dark:bg-white/5">
      <div className="text-xs font-semibold uppercase tracking-widest text-center flex flex-col items-center gap-2">
        <span className="opacity-60">Advertisement ({placement})</span>
        {/* Real AdSense or Carbon Ads script would go here */}
      </div>
    </div>
  );
}

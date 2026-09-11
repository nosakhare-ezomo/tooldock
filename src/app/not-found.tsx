import React from "react";
import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center w-full px-4">
      <div className="w-20 h-20 rounded-2xl liquid-glass flex items-center justify-center text-[var(--foreground-muted)] mb-8 shadow-sm">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      </div>
      <h1 className="text-[40px] md:text-[56px] font-[650] tracking-[-0.035em] mb-4 leading-tight">Tool not found</h1>
      <p className="text-lg text-[var(--foreground-secondary)] max-w-[500px] leading-relaxed mb-10">
        We couldn&apos;t find the page or tool you&apos;re looking for. It might have been moved or removed.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Link 
          href="/" 
          className="ios-button-primary px-8"
        >
          Back to Homepage
        </Link>
        <Link 
          href="/?search=focus" 
          className="ios-button-secondary px-8 flex items-center gap-2"
        >
          <Search size={18} aria-hidden="true" />
          Search Tools
        </Link>
      </div>
    </div>
  );
}

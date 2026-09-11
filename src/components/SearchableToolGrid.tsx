"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Tool {
  name: string;
  category?: string;
  desc: string;
  icon: React.ReactNode;
  href: string;
}

interface SearchableToolGridProps {
  tools: Tool[];
}

export function SearchableToolGrid({ tools }: SearchableToolGridProps) {
  const [query, setQuery] = useState("");
  
  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(query.toLowerCase()) || 
    tool.desc.toLowerCase().includes(query.toLowerCase())
  );

  // Group tools by category if not searching
  const groupedTools = filteredTools.reduce((acc, tool) => {
    const category = tool.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Search Field */}
      <div className="w-full max-w-[600px] relative group mb-12 mt-4">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-[var(--foreground-muted)] group-focus-within:text-primary-500 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
        <input 
          type="text" 
          placeholder="Search tools..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-14 pr-16 py-4 text-[17px] rounded-[18px] liquid-glass placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all text-[var(--foreground)]"
        />
        {query && (
          <button 
            onClick={() => setQuery("")}
            className="absolute inset-y-0 right-4 flex items-center text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        )}
      </div>

      {/* Tools Grid */}
      <section className="w-full">
        {filteredTools.length > 0 ? (
          <div className="flex flex-col gap-12 w-full">
            {Object.entries(groupedTools).map(([category, categoryTools]) => (
              <div key={category} className="w-full">
                {!query && (
                  <h2 className="text-[20px] font-semibold mb-5 flex items-center gap-3 tracking-[-0.01em] text-[var(--foreground-secondary)]">
                    {category}
                  </h2>
                )}
                {query && category === Object.keys(groupedTools)[0] && (
                  <h2 className="text-[22px] font-[650] mb-6 flex items-center gap-3 tracking-[-0.02em]">
                    Search Results
                  </h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categoryTools.map((tool) => (
                    <Link 
                      key={tool.name} 
                      href={tool.href}
                      className="liquid-glass-card p-5 flex flex-col items-start gap-4 group"
                    >
                      <div className="w-10 h-10 rounded-[10px] bg-[var(--background)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--foreground-secondary)] group-hover:text-[var(--primary-500)] transition-colors">
                        {tool.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[15px]">{tool.name}</h3>
                        <p className="text-[13px] text-[var(--foreground-muted)] mt-1 leading-snug">{tool.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full py-12 flex flex-col items-center text-center liquid-glass-panel rounded-2xl">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--foreground-muted)] mb-4"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <h3 className="font-semibold text-lg mb-2">No tools found</h3>
            <p className="text-[var(--foreground-muted)] text-sm">We couldn&apos;t find any tools matching &quot;{query}&quot;.</p>
          </div>
        )}
      </section>
    </div>
  );
}

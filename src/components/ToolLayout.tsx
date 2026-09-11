import React from "react";
import Link from "next/link";

interface ToolLayoutProps {
  title: string;
  description: string;
  category: string;
  categoryHref: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isLocalProcessing?: boolean;
  aboutContent?: React.ReactNode;
}

export function ToolLayout({
  title,
  description,
  category,
  categoryHref,
  icon,
  children,
  isLocalProcessing = true,
  aboutContent,
}: ToolLayoutProps) {
  return (
    <div className="flex flex-col items-center pb-24 w-full">
      {/* Back Button */}
      <nav className="w-full max-w-[800px] mb-6 mt-2 flex items-center">
        <Link href={categoryHref} className="flex items-center gap-1.5 text-primary-500 hover:opacity-80 transition-opacity font-medium text-[17px] p-2 -ml-2 min-h-[44px] min-w-[44px]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
          Back
        </Link>
      </nav>

      {/* Header */}
      <header className="w-full max-w-[800px] flex flex-col mb-10">
        <div className="w-14 h-14 rounded-[14px] liquid-glass flex items-center justify-center text-2xl mb-5 shadow-sm text-[var(--foreground)]" aria-hidden="true">
          {icon}
        </div>
        <h1 className="text-[36px] md:text-[52px] font-[650] tracking-[-0.035em] mb-4 leading-tight">{title}</h1>
        <p className="text-lg text-[var(--foreground-secondary)] max-w-[650px] leading-relaxed">
          {description}
        </p>
      </header>

      {/* Main Tool Interface */}
      <section className="w-full max-w-[800px]">
        <div className="liquid-glass-panel p-5 md:p-8 w-full relative flex flex-col">
          {isLocalProcessing && (
            <div className="self-end mb-6 flex items-center gap-2 text-[11px] font-medium text-[var(--foreground-muted)] bg-[rgba(255,255,255,0.05)] px-2.5 py-1.5 rounded-full border border-[var(--glass-border)]" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              Processed on your device
              <div className="w-1.5 h-1.5 rounded-full bg-[#30D158] ml-0.5"></div>
            </div>
          )}
          <div className="w-full">
            {children}
          </div>
        </div>
      </section>

      {/* FAQ / Info Below Tool */}
      <section className="w-full max-w-[800px] mt-24">
        <div className="border-t border-[var(--glass-border)] pt-12">
          <h2 className="text-xl font-semibold mb-6">About {title}</h2>
          <div className="space-y-6 text-[var(--foreground-muted)] text-sm leading-relaxed">
            {aboutContent ? aboutContent : (
              <p>
                This utility is part of ToolDock. It runs quickly and securely. 
                {isLocalProcessing && " Because it runs directly in your browser, your data never leaves your device."}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

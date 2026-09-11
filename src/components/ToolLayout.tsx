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
}

export function ToolLayout({
  title,
  description,
  category,
  categoryHref,
  icon,
  children,
  isLocalProcessing = true,
}: ToolLayoutProps) {
  return (
    <div className="flex flex-col items-center pb-24 w-full">
      {/* Breadcrumb */}
      <nav className="w-full max-w-[800px] mb-6 mt-4 flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
        <Link href="/" className="hover:text-[var(--foreground)] transition-colors">Tools</Link>
        <span className="opacity-50">/</span>
        <Link href={categoryHref} className="hover:text-[var(--foreground)] transition-colors">{category}</Link>
        <span className="opacity-50">/</span>
        <span className="text-[var(--foreground)] font-medium">{title}</span>
      </nav>

      {/* Header */}
      <header className="w-full max-w-[800px] flex flex-col mb-10">
        <div className="w-14 h-14 rounded-[14px] liquid-glass flex items-center justify-center text-2xl mb-5 shadow-sm text-[var(--foreground)]">
          {icon}
        </div>
        <h1 className="text-[36px] md:text-[52px] font-[650] tracking-[-0.035em] mb-4 leading-tight">{title}</h1>
        <p className="text-lg text-[var(--foreground-secondary)] max-w-[650px] leading-relaxed">
          {description}
        </p>
      </header>

      {/* Main Tool Interface */}
      <main className="w-full max-w-[800px]">
        <div className="liquid-glass-panel p-5 md:p-8 w-full relative">
          {isLocalProcessing && (
            <div className="absolute top-4 right-4 flex items-center gap-2 text-[11px] font-medium text-[var(--foreground-muted)] bg-[rgba(255,255,255,0.05)] px-2.5 py-1.5 rounded-full border border-[var(--glass-border)]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              Processed on your device
              <div className="w-1.5 h-1.5 rounded-full bg-[#30D158] ml-0.5"></div>
            </div>
          )}
          {children}
        </div>
      </main>

      {/* FAQ / Info Below Tool */}
      <section className="w-full max-w-[800px] mt-24">
        <div className="border-t border-[var(--glass-border)] pt-12">
          <h2 className="text-xl font-semibold mb-6">About {title}</h2>
          <div className="space-y-6 text-[var(--foreground-muted)] text-sm leading-relaxed">
            <p>
              This utility is part of ToolDock. It runs quickly and securely. 
              {isLocalProcessing && " Because it runs directly in your browser, your data never leaves your device."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

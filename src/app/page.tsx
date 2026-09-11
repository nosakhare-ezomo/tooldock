import React from "react";
import Link from "next/link";

const popularTools = [
  { name: "Merge PDF", desc: "Combine multiple PDFs into one", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>, href: "/pdf/merge" },
  { name: "Split PDF", desc: "Extract pages from a PDF", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line></svg>, href: "/pdf/split" },
  { name: "Compress PDF", desc: "Reduce PDF file size", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line></svg>, href: "/pdf/compress" },
  { name: "PDF to JPG", desc: "Convert PDF pages to images", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>, href: "/pdf-to-jpg" },
  { name: "JPG to PDF", desc: "Combine images to PDF", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>, href: "/jpg-to-pdf" },
  { name: "Image Compressor", desc: "Reduce image file size", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>, href: "/image/compress" },
  { name: "Image Resizer", desc: "Change image dimensions", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3z"></path><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>, href: "/image/resize" },
  { name: "Image Converter", desc: "Convert image formats", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>, href: "/image/convert" },
  { name: "QR Generator", desc: "Create scannable QR codes", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M7 7h.01"></path><path d="M17 7h.01"></path><path d="M7 17h.01"></path><path d="M17 17h.01"></path></svg>, href: "/qr-code-generator" },
  { name: "Password Gen", desc: "Create secure passwords", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>, href: "/password-generator" },
  { name: "Word Counter", desc: "Count words & characters", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>, href: "/word-counter" },
  { name: "Percentage", desc: "Quick percentage math", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg>, href: "/percentage-calculator" },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center pb-24">
      {/* Hero Section */}
      <section className="w-full text-center py-24 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[8px] bg-[var(--card-bg)] border border-[var(--card-border)] text-xs font-semibold tracking-wider mb-8 uppercase text-[var(--foreground-muted)]">
          <span>Fast</span>
          <span className="w-1 h-1 rounded-full bg-current opacity-30"></span>
          <span>Private</span>
          <span className="w-1 h-1 rounded-full bg-current opacity-30"></span>
          <span>Simple</span>
        </div>
        
        <h1 className="text-[42px] md:text-[60px] font-[650] tracking-[-0.035em] mb-6 max-w-[800px] text-balance leading-[1.1]">
          Every tool you need.<br/>
          <span className="text-[var(--foreground-muted)]">No nonsense.</span>
        </h1>
        
        <p className="text-lg text-[var(--foreground-secondary)] max-w-[600px] text-balance mb-12 leading-relaxed">
          Fast, private utilities for PDFs, images, text, calculations and everyday tasks.
        </p>

        {/* Search Field */}
        <div className="w-full max-w-[600px] relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-[var(--foreground-muted)] group-focus-within:text-primary-500 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <input 
            type="text" 
            placeholder="Search tools" 
            className="w-full pl-14 pr-16 py-4 text-[17px] rounded-[18px] liquid-glass placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all text-[var(--foreground)]"
          />
          <div className="absolute inset-y-0 right-3 flex items-center">
             <div className="px-2 py-1 rounded-[6px] bg-[var(--card-bg)] border border-[var(--card-border)] text-[11px] font-medium text-[var(--foreground-muted)]">⌘ K</div>
          </div>
        </div>
      </section>

      {/* Popular Tools Grid */}
      <section className="w-full mt-10">
        <h2 className="text-[22px] font-[650] mb-6 flex items-center gap-3 tracking-[-0.02em]">
          Popular Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {popularTools.map((tool) => (
            <Link 
              key={tool.name} 
              href={tool.href}
              className="liquid-glass-card p-5 flex flex-col items-start gap-4 group"
            >
              <div className="w-10 h-10 rounded-[10px] bg-[var(--background)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--foreground-secondary)] group-hover:text-primary-500 transition-colors">
                {tool.icon}
              </div>
              <div>
                <h3 className="font-semibold text-[15px]">{tool.name}</h3>
                <p className="text-[13px] text-[var(--foreground-muted)] mt-1 leading-snug">{tool.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Local Processing Promise */}
      <section className="w-full mt-32 text-center flex flex-col items-center">
        <div className="w-14 h-14 rounded-[14px] liquid-glass flex items-center justify-center mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        </div>
        <h2 className="text-[22px] font-[650] mb-3 tracking-[-0.02em]">Your files stay on your device.</h2>
        <p className="max-w-[500px] text-[var(--foreground-secondary)] text-sm leading-relaxed text-balance">
          Where possible, ToolDock processes your files locally right in your browser. We don&apos;t see your data, we don&apos;t store your files, and we don&apos;t want to.
        </p>
      </section>
    </div>
  );
}

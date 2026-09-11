import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ToolDock | Every tool you need.",
  description: "Fast, private utilities for PDFs, images, text, and everyday tasks.",
};

function Navigation() {
  return (
    <div className="absolute top-0 left-0 right-0 z-50 p-4 pt-4 md:pt-5 flex justify-center pointer-events-none">
      <nav className="pointer-events-auto liquid-glass rounded-[20px] px-5 py-0 h-[64px] flex items-center justify-between gap-8 w-full max-w-[1180px]">
        <Link href="/" className="font-semibold text-lg tracking-tight flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-[8px] bg-black/20 dark:bg-white/10 shadow-inner flex items-center justify-center text-white border border-black/10 dark:border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary-500/20"></div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10"><rect x="3" y="3" width="18" height="18" rx="4" ry="4"></rect><circle cx="12" cy="12" r="3"></circle></svg>
          </div>
          ToolDock
        </Link>
        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-[var(--foreground-secondary)]">
          <Link href="/pdf" className="hover:text-[var(--foreground)] transition-colors">PDF</Link>
          <Link href="/image" className="hover:text-[var(--foreground)] transition-colors">Images</Link>
          <Link href="/text" className="hover:text-[var(--foreground)] transition-colors">Text</Link>
          <Link href="/calculators" className="hover:text-[var(--foreground)] transition-colors">Calculators</Link>
          <Link href="/pricing" className="hover:text-[var(--foreground)] transition-colors">Pricing</Link>
        </div>
        <div className="flex items-center gap-5 text-[var(--foreground-secondary)]">
          <button aria-label="Search" className="hover:text-[var(--foreground)] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
          <button aria-label="Theme" className="hover:text-[var(--foreground)] transition-colors hidden md:block">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
          </button>
          <Link href="/pricing" className="hidden sm:flex text-sm font-semibold text-[var(--foreground)] hover:text-primary-500 transition-colors">
            Sign In
          </Link>
        </div>
      </nav>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-32 border-t border-[var(--glass-border)] py-12 px-6">
      <div className="max-w-[1180px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-semibold mb-4 text-sm">Tools</h3>
          <ul className="space-y-3 text-sm text-[var(--foreground-muted)]">
            <li><Link href="/pdf" className="hover:text-[var(--foreground)] transition-colors">PDF Tools</Link></li>
            <li><Link href="/image" className="hover:text-[var(--foreground)] transition-colors">Image Tools</Link></li>
            <li><Link href="/text" className="hover:text-[var(--foreground)] transition-colors">Text Tools</Link></li>
            <li><Link href="/calculators" className="hover:text-[var(--foreground)] transition-colors">Calculators</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4 text-sm">Company</h3>
          <ul className="space-y-3 text-sm text-[var(--foreground-muted)]">
            <li><Link href="/pricing" className="hover:text-[var(--foreground)] transition-colors">Pricing</Link></li>
            <li><Link href="/about" className="hover:text-[var(--foreground)] transition-colors">About</Link></li>
            <li><Link href="/contact" className="hover:text-[var(--foreground)] transition-colors">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4 text-sm">Legal</h3>
          <ul className="space-y-3 text-sm text-[var(--foreground-muted)]">
            <li><Link href="/privacy" className="hover:text-[var(--foreground)] transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-[var(--foreground)] transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
        <div className="flex flex-col justify-between">
          <div className="font-semibold text-lg flex items-center gap-2 mb-4">
            <div className="w-5 h-5 rounded-[6px] bg-black/20 dark:bg-white/10 shadow-inner flex items-center justify-center text-white border border-black/10 dark:border-white/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-primary-500/20"></div>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10"><rect x="3" y="3" width="18" height="18" rx="4" ry="4"></rect><circle cx="12" cy="12" r="3"></circle></svg>
            </div>
            ToolDock
          </div>
          <p className="text-sm text-[var(--foreground-muted)]">&copy; {new Date().getFullYear()} ToolDock.</p>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col relative selection:bg-primary-500/30">
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
           <div className="absolute top-[5%] left-[5%] w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[120px]" />
           <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] rounded-full bg-cyan-500/5 blur-[100px]" />
        </div>
        <Navigation />
        <main className="flex-grow pt-[104px] px-4 sm:px-6">
          <div className="max-w-[1180px] mx-auto">
            {children}
          </div>
        </main>
        <Footer />
      </body>
    </html>
  );
}

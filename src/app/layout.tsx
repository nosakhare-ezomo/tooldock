import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import Link from "next/link";
import { Providers } from "@/components/Providers";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
  title: "ToolDock | Every tool you need.",
  description: "Fast, private utilities for PDFs, images, text, and everyday tasks.",
};

function Footer() {
  return (
    <footer className="mt-32 border-t border-[var(--glass-border)] py-12 px-6">
      <div className="max-w-[1180px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-semibold mb-4 text-sm">Tools</h3>
          <ul className="space-y-1 text-sm text-[var(--foreground-muted)]">
            <li><Link href="/pdf" className="block py-2 hover:text-[var(--foreground)] transition-colors min-h-[44px]">PDF Tools</Link></li>
            <li><Link href="/image" className="block py-2 hover:text-[var(--foreground)] transition-colors min-h-[44px]">Image Tools</Link></li>
            <li><Link href="/text" className="block py-2 hover:text-[var(--foreground)] transition-colors min-h-[44px]">Text Tools</Link></li>
            <li><Link href="/calculators" className="block py-2 hover:text-[var(--foreground)] transition-colors min-h-[44px]">Calculators</Link></li>
            <li><Link href="/utilities" className="block py-2 hover:text-[var(--foreground)] transition-colors min-h-[44px]">Utilities</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4 text-sm">Company</h3>
          <ul className="space-y-1 text-sm text-[var(--foreground-muted)]">
            <li><Link href="/pricing" className="block py-2 hover:text-[var(--foreground)] transition-colors min-h-[44px]">Pricing</Link></li>
            <li><Link href="/about" className="block py-2 hover:text-[var(--foreground)] transition-colors min-h-[44px]">About</Link></li>
            <li><Link href="/contact" className="block py-2 hover:text-[var(--foreground)] transition-colors min-h-[44px]">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4 text-sm">Legal</h3>
          <ul className="space-y-1 text-sm text-[var(--foreground-muted)]">
            <li><Link href="/privacy" className="block py-2 hover:text-[var(--foreground)] transition-colors min-h-[44px]">Privacy Policy</Link></li>
            <li><Link href="/terms" className="block py-2 hover:text-[var(--foreground)] transition-colors min-h-[44px]">Terms of Service</Link></li>
          </ul>
        </div>
        <div className="flex flex-col justify-between pt-2">
          <div className="font-semibold text-lg flex items-center gap-2 mb-4">
            <div className="w-5 h-5 rounded-[6px] bg-black/20 dark:bg-white/10 shadow-inner flex items-center justify-center text-white border border-black/10 dark:border-white/10 relative overflow-hidden" aria-hidden="true">
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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col relative selection:bg-primary-500/30">
        <Providers defaultTheme="system" enableSystem>
          <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden" aria-hidden="true">
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
        </Providers>
      </body>
    </html>
  );
}

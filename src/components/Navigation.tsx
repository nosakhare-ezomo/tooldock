"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Search, Moon, Sun, Monitor, Menu, X } from "lucide-react";

export function Navigation() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Escape key closes mobile menu
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleSearchClick = () => {
    if (pathname === "/") {
      const searchInput = document.getElementById("global-search");
      if (searchInput) {
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      router.push("/?search=focus");
    }
  };

  const navLinks = [
    { name: "PDF", href: "/pdf" },
    { name: "Images", href: "/image" },
    { name: "Text", href: "/text" },
    { name: "Calculators", href: "/calculators" },
    { name: "Utilities", href: "/utilities" },
    { name: "Pricing", href: "/pricing" },
  ];

  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-50 p-4 pt-4 md:pt-5 flex justify-center pointer-events-none">
        <nav className="pointer-events-auto liquid-glass rounded-[20px] px-5 py-0 h-[64px] flex items-center justify-between gap-8 w-full max-w-[1180px]">
          {/* Logo */}
          <Link href="/" className="font-semibold text-lg tracking-tight flex items-center gap-2.5 hover:opacity-80 transition-opacity min-h-[44px] min-w-[44px]">
            <div className="w-7 h-7 rounded-[8px] bg-black/20 dark:bg-white/10 shadow-inner flex items-center justify-center text-white border border-black/10 dark:border-white/10 relative overflow-hidden" aria-hidden="true">
              <div className="absolute inset-0 bg-primary-500/20"></div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10"><rect x="3" y="3" width="18" height="18" rx="4" ry="4"></rect><circle cx="12" cy="12" r="3"></circle></svg>
            </div>
            ToolDock
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-[var(--foreground-secondary)]">
            {navLinks.map(link => (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`hover:text-[var(--foreground)] transition-colors py-2 ${pathname.startsWith(link.href) ? "text-[var(--foreground)]" : ""}`}
                aria-current={pathname.startsWith(link.href) ? "page" : undefined}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Right Controls */}
          <div className="flex items-center gap-2 text-[var(--foreground-secondary)]">
            <button 
              aria-label="Search" 
              onClick={handleSearchClick}
              className="hover:text-[var(--foreground)] transition-colors w-11 h-11 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/5"
            >
              <Search size={18} aria-hidden="true" />
            </button>
            
            {mounted && (
              <button 
                aria-label="Toggle theme"
                onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')}
                className="hover:text-[var(--foreground)] transition-colors w-11 h-11 hidden md:flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/5"
              >
                {theme === 'dark' ? <Moon size={18} aria-hidden="true" /> : theme === 'light' ? <Sun size={18} aria-hidden="true" /> : <Monitor size={18} aria-hidden="true" />}
              </button>
            )}

            <button
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden hover:text-[var(--foreground)] transition-colors w-11 h-11 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/5"
            >
              {mobileMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="absolute top-[80px] left-4 right-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-xl overflow-hidden flex flex-col p-4 animate-in slide-in-from-top-4 fade-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              {navLinks.map(link => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className={`p-3 rounded-xl font-medium ${pathname.startsWith(link.href) ? "bg-primary-500/10 text-primary-500" : "hover:bg-black/5 dark:hover:bg-white/5"}`}
                  aria-current={pathname.startsWith(link.href) ? "page" : undefined}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            <div className="border-t border-[var(--glass-border)] mt-4 pt-4 flex items-center justify-between">
              <span className="font-medium px-3">Theme</span>
              <div className="flex gap-2">
                {mounted && ['light', 'dark', 'system'].map(t => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    aria-label={`Set theme to ${t}`}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === t ? 'bg-primary-500/10 text-primary-500' : 'bg-black/5 dark:bg-white/5'}`}
                  >
                    {t === 'light' ? <Sun size={16} /> : t === 'dark' ? <Moon size={16} /> : <Monitor size={16} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

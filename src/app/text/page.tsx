import React from "react";
import Link from "next/link";

const textTools = [
  { name: "Word Counter", desc: "Count words & characters", icon: "📝", href: "/word-counter" },
];

export default function TextCategory() {
  return (
    <div className="flex flex-col items-center pb-24 w-full">
      <header className="w-full text-center py-20 flex flex-col items-center border-b border-black/5 dark:border-white/5 mb-12">
        <div className="w-16 h-16 rounded-2xl liquid-glass flex items-center justify-center text-3xl mb-6 shadow-sm">
          📝
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
          Text Tools
        </h1>
        <p className="text-lg opacity-70 max-w-xl text-balance">
          Quick utilities for text analysis, formatting, and generation.
        </p>
      </header>

      <section className="w-full max-w-5xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {textTools.map((tool) => (
            <Link 
              key={tool.name} 
              href={tool.href}
              className="liquid-glass-card p-6 flex flex-col items-start gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl liquid-glass flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">
                {tool.icon}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{tool.name}</h3>
                <p className="text-sm opacity-60 mt-1 leading-snug">{tool.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

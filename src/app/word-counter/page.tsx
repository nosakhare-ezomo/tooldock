"use client";

import React, { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";

export default function WordCounter() {
  const [text, setText] = useState("");
  const [stats, setStats] = useState({
    words: 0,
    chars: 0,
    charsNoSpaces: 0,
    sentences: 0,
    paragraphs: 0,
    readingTime: 0,
  });

  useEffect(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s+/g, "").length;
    const sentences = text.split(/[.!?]+/).filter(Boolean).length;
    const paragraphs = text.split(/\n+/).filter(Boolean).length;
    const readingTime = Math.ceil(words / 238); // Avg reading speed ~238 wpm

    setStats({ words, chars, charsNoSpaces, sentences, paragraphs, readingTime });
  }, [text]);

  return (
    <ToolLayout
      title="Word Counter"
      description="Count words, characters, sentences, and estimate reading time instantly. Type or paste your text below."
      category="Text Tools"
      categoryHref="/text"
      icon="📝"
    >
      <div className="flex flex-col gap-6 w-full mt-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-2">
          {[
            { label: "Words", value: stats.words },
            { label: "Characters", value: stats.chars },
            { label: "Chars (no spaces)", value: stats.charsNoSpaces },
            { label: "Sentences", value: stats.sentences },
            { label: "Paragraphs", value: stats.paragraphs },
            { label: "Reading Time", value: `${stats.readingTime} min` },
          ].map(stat => (
            <div key={stat.label} className="bg-white/50 dark:bg-black/20 p-4 rounded-xl border border-black/5 dark:border-white/5 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">{stat.value}</div>
              <div className="text-xs font-semibold uppercase tracking-wider opacity-60 text-center">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here..."
            className="w-full min-h-[300px] p-6 rounded-2xl bg-white/80 dark:bg-black/40 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500/50 shadow-inner resize-y text-lg"
          ></textarea>
          {text.length > 0 && (
            <button
              onClick={() => setText("")}
              className="absolute top-4 right-4 p-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}

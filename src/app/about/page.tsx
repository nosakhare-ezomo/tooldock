import React from "react";

export default function AboutPage() {
  return (
    <div className="flex flex-col items-center pb-24 w-full">
      <header className="w-full text-center py-20 flex flex-col items-center border-b border-[var(--glass-border)] mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">About ToolDock</h1>
        <p className="text-lg text-[var(--foreground-muted)] max-w-xl text-balance">
          Every tool you need, running locally on your device.
        </p>
      </header>

      <section className="w-full max-w-3xl liquid-glass-panel p-8 md:p-12 text-[var(--foreground)]">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-lg">
            ToolDock was created with a simple philosophy: everyday digital utilities shouldn't be slow, bloated with ads, or compromise your privacy by uploading your files to remote servers.
          </p>
          <h2 className="text-xl font-bold mt-8 mb-4">Privacy by Design</h2>
          <p>
            The majority of our tools—especially PDF and image manipulation—utilize WebAssembly and HTML5 technologies to process files directly inside your browser. Your files never leave your device.
          </p>
        </div>
      </section>
    </div>
  );
}

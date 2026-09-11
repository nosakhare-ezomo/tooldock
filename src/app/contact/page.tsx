import React from "react";

export default function ContactPage() {
  return (
    <div className="flex flex-col items-center pb-24 w-full">
      <header className="w-full text-center py-20 flex flex-col items-center border-b border-[var(--glass-border)] mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Contact Us</h1>
        <p className="text-lg text-[var(--foreground-muted)] max-w-xl text-balance">
          We'd love to hear from you.
        </p>
      </header>

      <section className="w-full max-w-xl liquid-glass-panel p-8 md:p-12 text-[var(--foreground)] text-center">
        <h2 className="text-xl font-bold mb-4">Get in touch</h2>
        <p className="mb-8 text-[var(--foreground-secondary)]">
          Have a question, feedback, or need support? Send us an email.
        </p>
        <a 
          href="mailto:support@tooldock.com" 
          className="inline-block px-8 py-3 bg-[var(--color-primary-500)] text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-opacity"
        >
          support@tooldock.com
        </a>
      </section>
    </div>
  );
}

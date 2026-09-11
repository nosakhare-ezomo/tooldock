import React from "react";
import Link from "next/link";

const pdfTools = [
  { name: "Merge PDF", desc: "Combine multiple PDFs into one", icon: "📄+", href: "/pdf/merge" },
  { name: "Split PDF", desc: "Extract pages from a PDF", icon: "📄-", href: "/pdf/split" },
  { name: "Compress PDF", desc: "Reduce PDF file size", icon: "🗜️", href: "/pdf/compress" },
  { name: "PDF to JPG", desc: "Convert PDF pages to images", icon: "🖼️", href: "/pdf-to-jpg" },
  { name: "IMG to PDF", desc: "Combine images to PDF", icon: "📑", href: "/img-to-pdf" },
];

export default function PdfCategory() {
  return (
    <div className="flex flex-col items-center pb-24 w-full">
      <header className="w-full text-center py-20 flex flex-col items-center border-b border-black/5 dark:border-white/5 mb-12">
        <div className="w-16 h-16 rounded-2xl liquid-glass flex items-center justify-center text-3xl mb-6 shadow-sm">
          📄
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
          PDF Tools
        </h1>
        <p className="text-lg opacity-70 max-w-xl text-balance">
          Fast, private PDF utilities that process entirely in your web browser. Your files never leave your device.
        </p>
      </header>

      <section className="w-full max-w-5xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {pdfTools.map((tool) => (
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

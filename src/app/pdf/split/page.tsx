"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { PDFDocument } from "pdf-lib";
import { ToolLayout } from "@/components/ToolLayout";

export default function SplitPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [pageRange, setPageRange] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (selected.type !== "application/pdf") return;
      
      setFile(selected);
      setResultUrl(null);

      // Load PDF to get total pages
      try {
        const arrayBuffer = await selected.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        setTotalPages(pdf.getPageCount());
      } catch (err) {
        console.error("Could not load PDF to count pages");
      }
    }
  };

  const parsePageRange = (rangeStr: string, maxPages: number) => {
    const pages = new Set<number>();
    const parts = rangeStr.replace(/\s+/g, "").split(",");
    
    for (const part of parts) {
      if (!part) continue;
      if (part.includes("-")) {
        const [start, end] = part.split("-").map(Number);
        if (!isNaN(start) && !isNaN(end) && start <= end && start > 0) {
          for (let i = start; i <= Math.min(end, maxPages); i++) {
            pages.add(i);
          }
        }
      } else {
        const num = Number(part);
        if (!isNaN(num) && num > 0 && num <= maxPages) {
          pages.add(num);
        }
      }
    }
    
    return Array.from(pages).sort((a, b) => a - b);
  };

  const splitPDF = async () => {
    if (!file) return;
    setLoading(true);

    try {
      let pagesToExtract: number[] = [];
      
      if (pageRange.trim() === "") {
        // If empty, assume all pages
        pagesToExtract = Array.from({length: totalPages}, (_, i) => i + 1);
      } else {
        pagesToExtract = parsePageRange(pageRange, totalPages);
      }

      if (pagesToExtract.length === 0) {
        alert("Invalid page range.");
        setLoading(false);
        return;
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const splitPdf = await PDFDocument.create();

      // pdf-lib pages are 0-indexed
      const indices = pagesToExtract.map(p => p - 1);
      const copiedPages = await splitPdf.copyPages(pdf, indices);
      copiedPages.forEach(page => splitPdf.addPage(page));

      const splitPdfBytes = await splitPdf.save();
      const blob = new Blob([splitPdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      setResultUrl(url);
    } catch (err) {
      console.error(err);
      alert("An error occurred while splitting the PDF.");
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setTotalPages(0);
    setResultUrl(null);
    setPageRange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <ToolLayout
      title="Split PDF"
      description="Extract specific pages from a PDF. All processing happens locally in your browser."
      category="PDF Tools"
      categoryHref="/pdf"
      icon="📄-"
    >
      <div className="flex flex-col gap-8">
        {!file ? (
          <button type="button" className="w-full min-h-[300px] border-2 border-dashed border-primary-500/30 rounded-2xl flex flex-col items-center justify-center p-8 bg-primary-500/5 hover:bg-primary-500/10 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:outline-none cursor-pointer" onClick={() => fileInputRef.current?.click()} aria-label="Upload file">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500 mb-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line></svg>
            <p className="text-lg font-bold mb-2">Select a PDF</p>
            <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" tabIndex={-1} aria-hidden="true" />
            </button>
        ) : (
          <>
            <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-4 rounded-xl">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center font-bold text-sm shrink-0">PDF</div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{file.name}</p>
                  <p className="text-xs opacity-60">{totalPages > 0 ? `${totalPages} Pages` : "Loading pages..."}</p>
                </div>
              </div>
              <button onClick={clearFile} className="p-2 bg-black/5 dark:bg-white/10 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-sm font-semibold">
                Remove
              </button>
            </div>

            {!resultUrl ? (
              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Pages to Extract</label>
                  <input 
                    type="text" 
                    value={pageRange} 
                    onChange={e => setPageRange(e.target.value)} 
                    placeholder="e.g. 1-3, 5, 8-10"
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 focus:ring-2 focus:ring-primary-500/50 outline-none"
                  />
                  <p className="text-xs opacity-60 mt-2">Leave blank to extract all pages, or specify comma-separated ranges.</p>
                </div>

                <button 
                  onClick={splitPDF}
                  disabled={loading || totalPages === 0}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white text-lg font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Extract Pages"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center bg-green-50 dark:bg-green-900/20 p-8 rounded-2xl border border-green-200 dark:border-green-800/30 text-center animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center text-green-600 dark:text-green-300 mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Done!</h3>
                <p className="opacity-70 mb-6">Your extracted PDF is ready to download.</p>
                
                <div className="flex gap-4">
                  <a 
                    href={resultUrl} 
                    download={`split-${file.name}`}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Download PDF
                  </a>
                  <button onClick={clearFile} className="px-6 py-3 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 font-semibold rounded-xl transition-all">
                    Start Over
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
}

"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { PDFDocument } from "pdf-lib";
import { ToolLayout } from "@/components/ToolLayout";

export default function MergePDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).filter(f => f.type === "application/pdf");
      setFiles(prev => [...prev, ...selected]);
      setResultUrl(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setFiles(prev => {
      const newFiles = [...prev];
      const temp = newFiles[index - 1];
      newFiles[index - 1] = newFiles[index];
      newFiles[index] = temp;
      return newFiles;
    });
  };

  const moveDown = (index: number) => {
    if (index === files.length - 1) return;
    setFiles(prev => {
      const newFiles = [...prev];
      const temp = newFiles[index + 1];
      newFiles[index + 1] = newFiles[index];
      newFiles[index] = temp;
      return newFiles;
    });
  };

  const mergePDFs = async () => {
    if (files.length < 2) return;
    setLoading(true);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      setResultSize(mergedPdfBytes.byteLength);
      setResultUrl(url);
    } catch (err) {
      console.error(err);
      alert("An error occurred while merging PDFs.");
    } finally {
      setLoading(false);
    }
  };

  const clearFiles = () => {
    setFiles([]);
    setResultUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <ToolLayout
      title="Merge PDF"
      description="Combine multiple PDFs into a single document instantly in your browser."
      category="PDF Tools"
      categoryHref="/pdf"
      icon="📄+"
    >
      <div className="flex flex-col gap-8">
        {!resultUrl ? (
          <>
            <button type="button" className="w-full min-h-[150px] border-2 border-dashed border-primary-500/30 rounded-2xl flex flex-col items-center justify-center p-6 bg-primary-500/5 hover:bg-primary-500/10 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:outline-none" onClick={() => fileInputRef.current?.click()} aria-label="Upload files">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500 mb-3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
              <p className="text-base font-bold mb-1">Add PDF Files</p>
              <p className="text-xs opacity-60">Select two or more files to merge</p>
              <input ref={fileInputRef} type="file" accept="application/pdf" multiple onChange={handleFileChange} className="hidden" tabIndex={-1} aria-hidden="true" />
            </button>

            {files.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold opacity-70 uppercase tracking-wider">{files.length} Files Selected</p>
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-xl">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center font-bold text-xs">PDF</div>
                        <div className="truncate">
                          <p className="font-semibold text-sm truncate">{f.name}</p>
                          <p className="text-xs opacity-60">{formatSize(f.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => moveUp(i)} disabled={i === 0} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded disabled:opacity-30">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                        </button>
                        <button onClick={() => moveDown(i)} disabled={i === files.length - 1} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded disabled:opacity-30">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>
                        <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1"></div>
                        <button onClick={() => removeFile(i)} className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded text-red-400">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 mt-4">
                  <button onClick={clearFiles} className="px-6 py-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 font-semibold rounded-xl transition-all">
                    Clear All
                  </button>
                  <button 
                    onClick={mergePDFs}
                    disabled={loading || files.length < 2}
                    className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? "Merging..." : "Merge PDFs"}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center bg-green-50 dark:bg-green-900/20 p-8 rounded-2xl border border-green-200 dark:border-green-800/30 text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center text-green-600 dark:text-green-300 mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Merged Successfully!</h3>
            <p className="opacity-70 mb-6">
                Your merged document is ready.<br/>
                Size: {formatSize(resultSize)}
            </p>
            
            <div className="flex gap-4">
              <a 
                href={resultUrl} 
                download="merged.pdf"
                className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download PDF
              </a>
              <button onClick={clearFiles} className="px-6 py-3 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 font-semibold rounded-xl transition-all">
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

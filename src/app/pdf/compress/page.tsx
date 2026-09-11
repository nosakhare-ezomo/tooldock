"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { PDFDocument } from "pdf-lib";

export default function CompressPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [compressionType, setCompressionType] = useState("balanced");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (selected.type !== "application/pdf") return;
      
      setFile(selected);
      setResultUrl(null);
      setMessage(null);
    }
  };

  const compressPDF = async () => {
    if (!file) return;
    setLoading(true);

    try {
      // Browser-based PDF compression is limited because libraries like pdf-lib 
      // cannot easily compress embedded images or re-encode streams.
      // We do a "dumb" re-save which might strip some unreferenced objects,
      // but we will be honest if the size doesn't decrease.
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      
      // Save without object streams to see if it reduces size (sometimes it does, sometimes it increases it)
      const pdfBytes = await pdf.save({ useObjectStreams: false });
      
      if (pdfBytes.byteLength >= file.size) {
        setMessage("Local browser compression could not meaningfully reduce the size of this specific PDF. This usually happens when the PDF consists of highly optimized images or fonts.");
      } else {
        setMessage(`Successfully saved ${formatSize(file.size - pdfBytes.byteLength)}!`);
      }

      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      
    } catch (err) {
      console.error(err);
      alert("An error occurred during compression.");
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setResultUrl(null);
    setMessage(null);
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
      title="Compress PDF"
      description="Reduce PDF file size. Some PDFs containing many images cannot be compressed heavily in the browser."
      category="PDF Tools"
      categoryHref="/pdf"
      icon="🗜️"
    >
      <div className="flex flex-col gap-8">
        {!file ? (
          <button type="button" className="w-full min-h-[300px] border-2 border-dashed border-primary-500/30 rounded-2xl flex flex-col items-center justify-center p-8 bg-primary-500/5 hover:bg-primary-500/10 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:outline-none cursor-pointer" onClick={() => fileInputRef.current?.click()} aria-label="Upload file">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500 mb-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
            <p className="text-lg font-bold mb-2">Select a PDF to compress</p>
            <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" tabIndex={-1} aria-hidden="true" />
            </button>
        ) : (
          <>
            <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-4 rounded-xl">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center font-bold text-sm shrink-0">PDF</div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{file.name}</p>
                  <p className="text-xs opacity-60">Size: {formatSize(file.size)}</p>
                </div>
              </div>
              <button onClick={clearFile} className="p-2 bg-black/5 dark:bg-white/10 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-sm font-semibold">
                Remove
              </button>
            </div>

            {!resultUrl ? (
              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-3">Compression Level</label>
                  <div className="flex gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-xl">
                    {["light", "balanced", "maximum"].map((level) => (
                      <button 
                        key={level}
                        onClick={() => setCompressionType(level)}
                        className={`flex-1 py-3 rounded-lg text-sm font-bold capitalize tracking-wider transition-all ${compressionType === level ? "bg-white dark:bg-black shadow-sm text-primary-600 dark:text-primary-400" : "opacity-60 hover:opacity-100"}`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs opacity-60 mt-3 text-balance">
                    Note: Browser-based compression removes unreferenced objects but cannot heavily compress embedded images like desktop software can.
                  </p>
                </div>

                <button 
                  onClick={compressPDF}
                  disabled={loading}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white text-lg font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? "Compressing..." : "Compress PDF"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center bg-black/5 dark:bg-white/5 p-8 rounded-2xl border border-black/10 dark:border-white/10 text-center animate-fade-in">
                <h3 className="text-xl font-bold mb-2">Processing Complete</h3>
                <p className="opacity-70 mb-6 text-balance">{message}</p>
                
                <div className="flex gap-4">
                  <a 
                    href={resultUrl} 
                    download={`compressed-${file.name}`}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Download PDF
                  </a>
                  <button onClick={clearFile} className="px-6 py-3 bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 font-semibold rounded-xl transition-all">
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

"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { PDFDocument } from "pdf-lib";
import { ToolLayout } from "@/components/ToolLayout";

export default function ImgToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).filter(f => f.type.startsWith("image/"));
      setFiles(prev => [...prev, ...selected]);
      setResultUrl(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const convertToPDF = async () => {
    if (files.length === 0) return;
    setLoading(true);

    try {
      const pdf = await PDFDocument.create();

      for (const file of files) {
        // Use browser's native Image decoding and Canvas to standardize all images to JPG
        // This makes it work flawlessly for PNGs, WebP, GIF, etc. without pdf-lib crashing
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });

        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        
        if (!ctx) continue;
        
        // Fill white background in case of transparent PNG/WebP
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        // Export as standard JPG base64 for pdf-lib
        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
        const base64Data = dataUrl.split(",")[1];
        
        const image = await pdf.embedJpg(base64Data);
        const page = pdf.addPage([image.width, image.height]);
        
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
        
        URL.revokeObjectURL(url);
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const outUrl = URL.createObjectURL(blob);
      
      setResultUrl(outUrl);
    } catch (err) {
      console.error(err);
      alert("An error occurred during conversion.");
    } finally {
      setLoading(false);
    }
  };

  const clearFiles = () => {
    setFiles([]);
    setResultUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <ToolLayout
      title="IMG to PDF"
      description="Convert any images (JPG, PNG, WebP) to a single PDF document locally in your browser."
      category="PDF Tools"
      categoryHref="/pdf"
      icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>}
    >
      <div className="flex flex-col gap-8">
        {!resultUrl ? (
          <>
            <div 
              className="w-full min-h-[150px] border-2 border-dashed border-[var(--primary-500)]/30 rounded-2xl flex flex-col items-center justify-center p-6 bg-[var(--primary-500)]/5 hover:bg-[var(--primary-500)]/10 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--primary-500)] mb-3"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              <p className="text-base font-bold mb-1">Add Images</p>
              <p className="text-xs opacity-60">JPG, PNG, WebP supported</p>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
            </div>

            {files.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold opacity-70 uppercase tracking-wider">{files.length} Images Selected</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {files.map((f, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-black/10 dark:border-white/10">
                      <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removeFile(i)} 
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 mt-4">
                  <button onClick={clearFiles} className="px-6 py-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 font-semibold rounded-xl transition-all">
                    Clear All
                  </button>
                  <button 
                    onClick={convertToPDF}
                    disabled={loading}
                    className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? "Converting..." : "Convert to PDF"}
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
            <h3 className="text-xl font-bold mb-2">Created Successfully!</h3>
            <p className="opacity-70 mb-6">Your images have been combined into a PDF.</p>
            
            <div className="flex gap-4">
              <a 
                href={resultUrl} 
                download="images.pdf"
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

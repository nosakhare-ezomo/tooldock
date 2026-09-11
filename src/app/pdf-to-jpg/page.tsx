"use client";

import React, { useState, useRef, ChangeEvent, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";

export default function PdfToJpg() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [pdfjsLib, setPdfjsLib] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Dynamic import for pdfjs-dist to avoid SSR issues
    import("pdfjs-dist").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      setPdfjsLib(pdfjs);
    }).catch(err => console.error("Failed to load PDF.js", err));
  }, []);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && pdfjsLib) {
      const selected = e.target.files[0];
      if (selected.type !== "application/pdf") return;
      
      setFile(selected);
      setImages([]);

      try {
        const arrayBuffer = await selected.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument(new Uint8Array(arrayBuffer));
        const pdf = await loadingTask.promise;
        setTotalPages(pdf.numPages);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const convertToImages = async () => {
    if (!file || !pdfjsLib || totalPages === 0) return;
    setLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument(new Uint8Array(arrayBuffer));
      const pdf = await loadingTask.promise;
      const extractedImages: string[] = [];

      // Only extract first 10 pages max to avoid browser crash in MVP
      const maxPages = Math.min(totalPages, 10);

      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: ctx,
          viewport: viewport
        }).promise;

        extractedImages.push(canvas.toDataURL("image/jpeg", 0.9));
      }

      setImages(extractedImages);
    } catch (err) {
      console.error(err);
      alert("An error occurred during conversion.");
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setTotalPages(0);
    setImages([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <ToolLayout
      title="PDF to JPG"
      description="Convert PDF pages into high-quality JPG images directly in your browser."
      category="PDF Tools"
      categoryHref="/pdf"
      icon="🖼️"
    >
      <div className="flex flex-col gap-8">
        {!file ? (
          <div 
            className={`w-full min-h-[300px] border-2 border-dashed border-primary-500/30 rounded-2xl flex flex-col items-center justify-center p-8 transition-colors cursor-pointer ${!pdfjsLib ? "opacity-50 cursor-not-allowed bg-gray-100" : "bg-primary-500/5 hover:bg-primary-500/10"}`}
            onClick={() => pdfjsLib && fileInputRef.current?.click()}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500 mb-4"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            <p className="text-lg font-bold mb-2">{!pdfjsLib ? "Loading engine..." : "Select a PDF"}</p>
            <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" disabled={!pdfjsLib} />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-4 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center font-bold text-sm">PDF</div>
                <div>
                  <p className="font-semibold">{file.name}</p>
                  <p className="text-xs opacity-60">{totalPages > 0 ? `${totalPages} Pages` : "Loading..."}</p>
                </div>
              </div>
              <button onClick={clearFile} className="p-2 bg-black/5 dark:bg-white/10 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-sm font-semibold">
                Remove
              </button>
            </div>

            {images.length === 0 ? (
              <button 
                onClick={convertToImages}
                disabled={loading || totalPages === 0}
                className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white text-lg font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Converting..." : "Convert to JPG"}
              </button>
            ) : (
              <div className="flex flex-col gap-6 animate-fade-in">
                <h3 className="text-xl font-bold">Extracted {images.length} Images</h3>
                {totalPages > 10 && <p className="text-sm text-yellow-600">Note: Only the first 10 pages are extracted in the free version to prevent browser crashes.</p>}
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((img, i) => (
                    <div key={i} className="flex flex-col gap-2 p-2 border border-black/5 dark:border-white/5 rounded-xl bg-white/50 dark:bg-black/20">
                      <img src={img} alt={`Page ${i+1}`} className="w-full aspect-[1/1.4] object-contain bg-white rounded-lg shadow-sm" />
                      <a 
                        href={img} 
                        download={`page-${i+1}.jpg`}
                        className="w-full py-2 bg-black/5 dark:bg-white/10 hover:bg-primary-500 hover:text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        Page {i+1}
                      </a>
                    </div>
                  ))}
                </div>
                <button onClick={clearFile} className="px-6 py-3 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 font-semibold rounded-xl transition-all mt-4 self-center">
                  Start Over
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
}

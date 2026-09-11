"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { ToolLayout } from "@/components/ToolLayout";

export default function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState(0.7);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (!selected.type.startsWith("image/") || selected.type === "image/svg+xml") return;
      
      setFile(selected);
      setResultUrl(null);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const processImage = () => {
    if (!preview || !file) return;
    setLoading(true);

    setTimeout(() => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          
          let format = file.type;
          if (format === "image/png") {
              // HTML5 canvas doesn't support quality parameter for png, use webp instead
              format = "image/webp";
          }
          const dataUrl = canvas.toDataURL(format, quality);
          
          // calculate size
          const base64str = dataUrl.split(",")[1];
          const decoded = atob(base64str);
          setResultSize(decoded.length);
          
          setResultUrl(dataUrl);
        }
        setLoading(false);
      };
      img.src = preview;
    }, 100);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
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
      title="Image Compressor"
      description="Reduce image file size instantly while preserving quality."
      category="Image Tools"
      categoryHref="/image"
      icon="📉"
    >
      {!file ? (
        <div 
          className="w-full min-h-[300px] border-2 border-dashed border-primary-500/30 rounded-2xl flex flex-col items-center justify-center p-8 bg-primary-500/5 hover:bg-primary-500/10 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500 mb-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          <p className="text-lg font-bold mb-2">Drop image to compress</p>
          <p className="text-sm opacity-60">JPG, PNG, WebP supported</p>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-4 rounded-xl">
            <div className="flex items-center gap-4 min-w-0">
              {preview && <img src={preview} alt="Preview" className="w-16 h-16 object-cover rounded-lg shadow-sm shrink-0" />}
              <div className="min-w-0">
                <p className="font-semibold truncate">{file.name}</p>
                <p className="text-xs opacity-60">Original Size: {formatSize(file.size)}</p>
              </div>
            </div>
            <button onClick={clearFile} className="p-2 bg-black/5 dark:bg-white/10 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-sm font-semibold">
              Remove
            </button>
          </div>

          {!resultUrl ? (
            <div className="flex flex-col gap-6">
              <div className="bg-white/50 dark:bg-black/20 p-6 rounded-2xl border border-black/5 dark:border-white/5">
                  <label className="flex justify-between text-sm font-semibold mb-6">
                    <span>Compression Level</span>
                    <span className="opacity-60">{Math.round((1 - quality) * 100)}%</span>
                  </label>
                  
                  <div className="relative mb-6">
                      <input 
                        type="range" 
                        min="0.1" max="0.9" step="0.1"
                        value={quality} 
                        onChange={e => setQuality(parseFloat(e.target.value))}
                        className="w-full accent-primary-500"
                        style={{ direction: 'rtl' }}
                      />
                  </div>
                  
                  <div className="flex justify-between text-xs font-semibold opacity-60">
                      <span>Lighter (High Quality)</span>
                      <span>Maximum Compression</span>
                  </div>
              </div>

              <button 
                onClick={processImage}
                disabled={loading}
                className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white text-lg font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? "Compressing..." : "Compress Image"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center bg-green-50 dark:bg-green-900/20 p-8 rounded-2xl border border-green-200 dark:border-green-800/30 text-center animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center text-green-600 dark:text-green-300 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Done!</h3>
              
              {resultSize >= file.size ? (
                <p className="opacity-70 mb-6 text-balance">
                  This image is already highly optimized. Re-compressing it did not reduce the file size further.<br/>
                  Original size: {formatSize(file.size)}
                </p>
              ) : (
                <p className="opacity-70 mb-6">
                  Saved <strong>{Math.round(((file.size - resultSize) / file.size) * 100)}%</strong><br/>
                  New size: {formatSize(resultSize)}
                </p>
              )}
              
              <div className="flex gap-4">
                <a 
                  href={resultSize >= file.size ? preview || resultUrl : resultUrl} 
                  download={`compressed-${file.name}`}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  {resultSize >= file.size ? "Download Original" : "Download Image"}
                </a>
                <button onClick={clearFile} className="px-6 py-3 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 font-semibold rounded-xl transition-all">
                  Start Over
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
}

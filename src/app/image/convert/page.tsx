"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { ToolLayout } from "@/components/ToolLayout";

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [format, setFormat] = useState<"image/jpeg" | "image/png" | "image/webp">("image/jpeg");
  const [quality, setQuality] = useState(0.8);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (!selected.type.startsWith("image/")) return;
      
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
          const dataUrl = canvas.toDataURL(format, format === "image/png" ? undefined : quality);
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

  const getExt = (mime: string) => mime.split("/")[1];

  return (
    <ToolLayout
      title="Image Converter"
      description="Convert images between PNG, JPG, and WebP directly in your browser."
      category="Image Tools"
      categoryHref="/image"
      icon="🔄"
    >
      {!file ? (
        <div 
          className="w-full min-h-[300px] border-2 border-dashed border-primary-500/30 rounded-2xl flex flex-col items-center justify-center p-8 bg-primary-500/5 hover:bg-primary-500/10 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500 mb-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          <p className="text-lg font-bold mb-2">Select an image</p>
          <p className="text-sm opacity-60">PNG, JPG, WebP supported</p>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-4 rounded-xl">
            <div className="flex items-center gap-4">
              {preview && <img src={preview} alt="Preview" className="w-16 h-16 object-cover rounded-lg shadow-sm" />}
              <div>
                <p className="font-semibold">{file.name}</p>
                <p className="text-xs opacity-60 uppercase">Format: {getExt(file.type)}</p>
              </div>
            </div>
            <button onClick={clearFile} className="p-2 bg-black/5 dark:bg-white/10 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-sm font-semibold">
              Remove
            </button>
          </div>

          {!resultUrl ? (
            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-semibold mb-3">Convert to</label>
                <div className="flex gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-xl">
                  {["image/jpeg", "image/png", "image/webp"].map((fmt) => (
                    <button 
                      key={fmt}
                      onClick={() => setFormat(fmt as any)}
                      className={`flex-1 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${format === fmt ? "bg-white dark:bg-black shadow-sm text-primary-600 dark:text-primary-400" : "opacity-60 hover:opacity-100"}`}
                    >
                      {getExt(fmt)}
                    </button>
                  ))}
                </div>
              </div>

              {format !== "image/png" && (
                <div>
                  <label className="flex justify-between text-sm font-semibold mb-3">
                    <span>Quality</span>
                    <span className="opacity-60">{Math.round(quality * 100)}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0.1" max="1" step="0.05"
                    value={quality} 
                    onChange={e => setQuality(parseFloat(e.target.value))}
                    className="w-full accent-primary-500"
                  />
                </div>
              )}

              <button 
                onClick={processImage}
                disabled={loading}
                className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white text-lg font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                {loading ? "Converting..." : `Convert to ${getExt(format).toUpperCase()}`}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center bg-green-50 dark:bg-green-900/20 p-8 rounded-2xl border border-green-200 dark:border-green-800/30 text-center animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center text-green-600 dark:text-green-300 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Done!</h3>
              <p className="opacity-70 mb-6">Your image has been converted to {getExt(format).toUpperCase()}.</p>
              
              <div className="flex gap-4">
                <a 
                  href={resultUrl} 
                  download={`converted-${file.name.split('.')[0]}.${getExt(format)}`}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Download Image
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

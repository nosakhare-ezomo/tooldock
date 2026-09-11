"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { ToolLayout } from "@/components/ToolLayout";

export default function ImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (!selected.type.startsWith("image/")) return;
      
      setFile(selected);
      setResultUrl(null);
      
      const objectUrl = URL.createObjectURL(selected);
      setPreview(objectUrl);

      const img = new Image();
      img.onload = () => {
        setOriginalWidth(img.width);
        setOriginalHeight(img.height);
        setWidth(img.width);
        setHeight(img.height);
      };
      img.src = objectUrl;
    }
  };

  const handleWidthChange = (val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) { setWidth(0); return; }
    setWidth(num);
    if (lockAspect && originalWidth) {
      setHeight(Math.round((num / originalWidth) * originalHeight));
    }
  };

  const handleHeightChange = (val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) { setHeight(0); return; }
    setHeight(num);
    if (lockAspect && originalHeight) {
      setWidth(Math.round((num / originalHeight) * originalWidth));
    }
  };

  const applyPreset = (w: number, h: number) => {
    setWidth(w);
    setHeight(h);
    setLockAspect(false);
  };

  const processImage = () => {
    if (!preview || width <= 0 || height <= 0) return;
    setLoading(true);

    setTimeout(() => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL(file?.type || "image/png", 0.9);
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

  return (
    <ToolLayout
      title="Image Resizer"
      description="Change image dimensions instantly in your browser."
      category="Image Tools"
      categoryHref="/image"
      icon="📐"
    >
      {!file ? (
        <div 
          className="w-full min-h-[300px] border-2 border-dashed border-primary-500/30 rounded-2xl flex flex-col items-center justify-center p-8 bg-primary-500/5 hover:bg-primary-500/10 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500 mb-4"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          <p className="text-lg font-bold mb-2">Drop your image here</p>
          <p className="text-sm opacity-60">or click to browse</p>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-4 rounded-xl">
            <div className="flex items-center gap-4">
              {preview && <img src={preview} alt="Preview" className="w-16 h-16 object-cover rounded-lg shadow-sm" />}
              <div>
                <p className="font-semibold">{file.name}</p>
                <p className="text-xs opacity-60">Original: {originalWidth} &times; {originalHeight} px</p>
              </div>
            </div>
            <button onClick={clearFile} className="p-2 bg-black/5 dark:bg-white/10 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-sm font-semibold">
              Remove
            </button>
          </div>

          {!resultUrl ? (
            <>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-6">
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold mb-2">Width (px)</label>
                      <input 
                        type="number" 
                        value={width || ""} 
                        onChange={e => handleWidthChange(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary-500/50"
                      />
                    </div>
                    <div className="flex flex-col items-center justify-center pb-2 cursor-pointer opacity-60 hover:opacity-100 transition-opacity" onClick={() => setLockAspect(!lockAspect)}>
                      {lockAspect ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-semibold mb-2">Height (px)</label>
                      <input 
                        type="number" 
                        value={height || ""} 
                        onChange={e => handleHeightChange(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary-500/50"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={processImage}
                    disabled={loading}
                    className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Resize Image"}
                  </button>
                </div>
                
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl">
                  <p className="text-sm font-semibold mb-3 opacity-70 uppercase tracking-wider">Presets</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => applyPreset(1080, 1080)} className="px-3 py-1.5 bg-white dark:bg-black/50 border border-black/5 rounded-lg text-sm hover:border-primary-500 transition-colors">Instagram Square</button>
                    <button onClick={() => applyPreset(1080, 1920)} className="px-3 py-1.5 bg-white dark:bg-black/50 border border-black/5 rounded-lg text-sm hover:border-primary-500 transition-colors">IG Story</button>
                    <button onClick={() => applyPreset(1280, 720)} className="px-3 py-1.5 bg-white dark:bg-black/50 border border-black/5 rounded-lg text-sm hover:border-primary-500 transition-colors">YouTube HD</button>
                    <button onClick={() => applyPreset(1920, 1080)} className="px-3 py-1.5 bg-white dark:bg-black/50 border border-black/5 rounded-lg text-sm hover:border-primary-500 transition-colors">Full HD</button>
                    <button onClick={() => applyPreset(originalWidth, originalHeight)} className="px-3 py-1.5 bg-white dark:bg-black/50 border border-black/5 rounded-lg text-sm hover:border-primary-500 transition-colors">Original Size</button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center bg-green-50 dark:bg-green-900/20 p-8 rounded-2xl border border-green-200 dark:border-green-800/30 text-center animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center text-green-600 dark:text-green-300 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Done!</h3>
              <p className="opacity-70 mb-6">Your image has been resized to {width} &times; {height} px.</p>
              
              <div className="flex gap-4">
                <a 
                  href={resultUrl} 
                  download={`resized-${file.name}`}
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

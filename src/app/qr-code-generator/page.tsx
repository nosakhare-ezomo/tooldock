"use client";

import React, { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ToolLayout } from "@/components/ToolLayout";

export default function QRCodeGenerator() {
  const [type, setType] = useState<"url" | "text" | "wifi">("url");
  const [value, setValue] = useState("");
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [encryption, setEncryption] = useState("WPA");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");

  const svgRef = useRef<SVGSVGElement>(null);

  const getQRValue = () => {
    if (type === "wifi") {
      return `WIFI:S:${ssid};T:${encryption};P:${password};;`;
    }
    return value || "https://tooldock.com";
  };

  const downloadQR = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "qrcode.png";
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const downloadSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.download = "qrcode.svg";
    downloadLink.href = url;
    downloadLink.click();
  };

  return (
    <ToolLayout
      title="QR Code Generator"
      description="Create scannable QR codes for URLs, text, and Wi-Fi networks."
      category="Utilities"
      categoryHref="/utilities"
      icon="📱"
    >
      <div className="flex flex-col md:flex-row gap-10 mt-4">
        {/* Controls */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-xl">
            {["url", "text", "wifi"].map(t => (
              <button 
                key={t}
                onClick={() => setType(t as any)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${type === t ? "bg-white dark:bg-black shadow-sm" : "opacity-60 hover:opacity-100"}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {type === "url" && (
              <div>
                <label className="block text-sm font-semibold mb-2">Website URL</label>
                <input 
                  type="url" 
                  value={value} 
                  onChange={e => setValue(e.target.value)} 
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 focus:ring-2 focus:ring-primary-500/50 outline-none"
                />
              </div>
            )}

            {type === "text" && (
              <div>
                <label className="block text-sm font-semibold mb-2">Text Content</label>
                <textarea 
                  value={value} 
                  onChange={e => setValue(e.target.value)} 
                  placeholder="Enter your text here..."
                  className="w-full h-32 px-4 py-3 rounded-xl bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 focus:ring-2 focus:ring-primary-500/50 outline-none resize-none"
                />
              </div>
            )}

            {type === "wifi" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Network Name (SSID)</label>
                  <input 
                    type="text" 
                    value={ssid} 
                    onChange={e => setSsid(e.target.value)} 
                    placeholder="MyWiFiNetwork"
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 focus:ring-2 focus:ring-primary-500/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Password</label>
                  <input 
                    type="text" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="SecretPassword"
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 focus:ring-2 focus:ring-primary-500/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Security</label>
                  <select 
                    value={encryption} 
                    onChange={e => setEncryption(e.target.value)} 
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 focus:ring-2 focus:ring-primary-500/50 outline-none"
                  >
                    <option value="WPA">WPA/WPA2/WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/5 dark:border-white/5">
            <div>
              <label className="block text-sm font-semibold mb-2 opacity-80">Foreground</label>
              <div className="flex items-center gap-3">
                <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                <span className="text-sm font-mono opacity-60 uppercase">{fgColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 opacity-80">Background</label>
              <div className="flex items-center gap-3">
                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                <span className="text-sm font-mono opacity-60 uppercase">{bgColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="flex flex-col items-center gap-6">
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-black/5 flex items-center justify-center min-w-[250px] min-h-[250px]">
            <QRCodeSVG 
              ref={svgRef}
              value={getQRValue()} 
              size={220} 
              fgColor={fgColor} 
              bgColor={bgColor} 
              level="M" 
              includeMargin={false} 
            />
          </div>
          
          <div className="flex gap-3 w-full">
            <button 
              onClick={downloadQR}
              className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              PNG
            </button>
            <button 
              onClick={downloadSVG}
              className="flex-1 py-3 bg-white dark:bg-black/50 hover:bg-gray-50 dark:hover:bg-white/5 border border-black/10 dark:border-white/10 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              SVG
            </button>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

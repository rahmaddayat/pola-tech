"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface FabricUploadProps {
  onFabricApply: (patternUrl: string) => void;
  currentFabric: string | null;
  onFabricRemove: () => void;
}

export default function FabricUpload({ onFabricApply, currentFabric, onFabricRemove }: FabricUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentFabric);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl);
      onFabricApply(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onFabricRemove();
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Custom Fabric</h4>
      <p className="text-[10px] text-gray-400">Upload gambar kain untuk dijadikan pattern desain Anda</p>

      {preview ? (
        <div className="relative group">
          <div
            className="w-full h-28 rounded-xl border-2 border-indigo-200 overflow-hidden"
            style={{
              backgroundImage: `url(${preview})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1 text-center">
            ✓ Fabric sedang aktif
          </p>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group cursor-pointer"
        >
          <Upload size={24} className="text-gray-300 group-hover:text-indigo-500 mb-2" />
          <span className="text-xs text-gray-400 group-hover:text-indigo-600 font-medium">
            Upload Gambar Kain
          </span>
          <span className="text-[9px] text-gray-300 mt-1">JPG, PNG, WEBP</span>
        </button>
      )}

      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

      {/* Preset fabrics */}
      <div className="pt-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Preset Kain</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { name: "Denim", url: "https://www.transparenttextures.com/patterns/denim.png" },
            { name: "Linen", url: "https://www.transparenttextures.com/patterns/woven-light.png" },
            { name: "Cotton", url: "https://www.transparenttextures.com/patterns/clean-textile.png" },
            { name: "Leather", url: "https://www.transparenttextures.com/patterns/black-scales.png" },
          ].map((f) => (
            <button
              key={f.name}
              onClick={() => onFabricApply(f.url)}
              className="flex flex-col items-center gap-1 group"
              title={f.name}
            >
              <div
                className="w-10 h-10 rounded-lg border border-gray-200 group-hover:border-indigo-400 transition-all overflow-hidden bg-indigo-50"
                style={{ backgroundImage: `url(${f.url})` }}
              />
              <span className="text-[8px] text-gray-400 font-medium">{f.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
        <p className="text-[10px] text-indigo-700">💡 <b>Info:</b> Fitur ini akan menerapkan tekstur atau gambar yang Anda upload langsung ke pola desain baju 3D Anda!</p>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Ruler, Lock } from "lucide-react";
import { SIZE_SCALES, BASE_MATERIAL, PlanType } from "@/app/lib/planUtils";

interface SizeGradingProps {
  plan: PlanType;
  bodyType: string;
  onSizeChange: (size: string, scale: number) => void;
  currentSize: string;
}

export default function SizeGrading({ plan, bodyType, onSizeChange, currentSize }: SizeGradingProps) {
  const [customScale, setCustomScale] = useState(1.0);
  const canUse = plan === "pro" || plan === "business";

  if (!canUse) {
    return (
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Ruler size={14} /> Grading Ukuran
        </h4>
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-center">
          <Lock size={24} className="mx-auto text-gray-300 mb-2" />
          <p className="text-xs text-gray-400 font-medium">Fitur ini tersedia di paket Pro & Business</p>
          <p className="text-[10px] text-gray-300 mt-1">Auto-scaling pola dari XS hingga XXL</p>
        </div>
      </div>
    );
  }

  const sizes = Object.entries(SIZE_SCALES);

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
        <Ruler size={14} /> Grading Ukuran
      </h4>
      <p className="text-[10px] text-gray-400">Pilih ukuran untuk auto-scaling pola</p>

      <div className="grid grid-cols-3 gap-2">
        {sizes.map(([size, scale]) => (
          <button
            key={size}
            onClick={() => onSizeChange(size, scale)}
            className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
              currentSize === size
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-gray-100 hover:border-indigo-300 hover:bg-indigo-50/50 text-gray-600"
            }`}
          >
            <span className="text-sm font-bold">{size}</span>
            <span className="text-[9px] text-gray-400 mt-1">×{scale.toFixed(2)}</span>
          </button>
        ))}
      </div>

      <div className="mt-2 pt-2 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 mb-2">Atau gunakan ukuran custom:</p>
        <div className="flex gap-2 items-center">
          <input 
            type="number" 
            step="0.05" 
            min="0.5" 
            max="3" 
            value={customScale}
            onChange={(e) => setCustomScale(Number(e.target.value))}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs"
          />
          <button 
            onClick={() => onSizeChange("Custom", customScale)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold"
          >
            Terapkan
          </button>
        </div>
      </div>

      {/* Material estimation */}
      {plan === "business" && (
        <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100">
          <h5 className="text-[10px] font-bold text-amber-700 uppercase mb-2">📐 Estimasi Bahan</h5>
          {(() => {
            const base = BASE_MATERIAL[bodyType] || BASE_MATERIAL.shirt;
            const scale = SIZE_SCALES[currentSize] || 1;
            const meters = (base.fabric_m * scale).toFixed(2);
            const width = 1.5; // standard fabric width in meters
            return (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-500">Tipe:</span>
                  <span className="font-semibold text-gray-700">{base.label}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-500">Ukuran:</span>
                  <span className="font-semibold text-gray-700">{currentSize}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-500">Kain (panjang):</span>
                  <span className="font-bold text-amber-700">{meters} m</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-500">Lebar standar:</span>
                  <span className="font-semibold text-gray-700">{width} m</span>
                </div>
                <div className="pt-1 border-t border-amber-200 mt-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500">Total area:</span>
                    <span className="font-bold text-amber-800">{(parseFloat(meters) * width).toFixed(2)} m²</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

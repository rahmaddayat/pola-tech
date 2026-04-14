"use client";

import React, { useState } from "react";
import {
  FolderArchive,
  Shirt,
  FileDown,
  Square,
  Palette,
  RotateCcw,
  RotateCw,
  X,
} from "lucide-react";
import { VARIASI_POLA } from "@/app/constants/patterns";
import { useDesignCanvas, pocketOffsets } from "@/app/hooks/useDesignCanvas";

export default function DesignDashboard() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>("Color");
  
  // State baru untuk melacak pattern yang aktif
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  // Inisialisasi Logika
  const { states, updatePart } = useDesignCanvas();

  const toolOptions: Record<string, any> = {
    Silhouettes: VARIASI_POLA.body,
    Necklines: VARIASI_POLA.necklines,
    Sleeves: VARIASI_POLA.sleeves,
    Pockets: VARIASI_POLA.pocket,
  };

  const colors = [
    { name: "White", hex: "#FFFFFF" },
    { name: "Off White", hex: "#F5F5F0" },
    { name: "Black", hex: "#1A1A1A" },
    { name: "Charcoal", hex: "#374151" },
    { name: "Silver", hex: "#D1D5DB" },
    { name: "Beige", hex: "#D2B48C" },
    { name: "Khaki", hex: "#C3B091" },
    { name: "Olive", hex: "#556B2F" },
    { name: "Terracotta", hex: "#E2725B" },
    { name: "Chocolate", hex: "#5D4037" },
    { name: "Navy", hex: "#1E3A8A" },
    { name: "Royal Blue", hex: "#2563EB" },
    { name: "Sky", hex: "#7DD3FC" },
    { name: "Forest", hex: "#064E3B" },
    { name: "Emerald", hex: "#10B981" },
    { name: "Crimson", hex: "#991B1B" },
    { name: "Salmon", hex: "#FA8072" },
    { name: "Mustard", hex: "#EAB308" },
    { name: "Lavender", hex: "#A78BFA" },
    { name: "Coral", hex: "#FF7F50" },
  ];

  const patterns = [
    { id: "p_stripes", name: "Stripes Vertical" },
    { id: "p_checkered", name: "Checkered Box" },
    { id: "p_dots", name: "Polka Dots" },
    { id: "p_denim", name: "Denim Texture" },
    { id: "p_grid", name: "Fine Grid" },
  ];

  // Helper render path yang dimodifikasi untuk mendukung URL Pattern
  const renderPaths = (
    data: any,
    color: string,
    stroke: string,
    width: string,
  ) => {
    if (!data) return null;
    const paths = Array.isArray(data) ? data : [data];
    
    // Logika penentuan fill: Jika ada pattern terpilih, gunakan url(#id)
    const fillValue = selectedPattern ? `url(#${selectedPattern})` : color;

    return paths.map((d, index) => (
      <path
        key={index}
        d={d}
        fill={fillValue}
        stroke={stroke}
        strokeWidth={width}
        className="transition-all duration-500 ease-in-out"
      />
    ));
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden font-sans text-gray-800">
      {/* --- TOP NAVBAR --- */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-30">
        <div className="flex items-center space-x-6">
          <div className="font-bold text-xl text-indigo-600 tracking-tight border-r pr-6 border-gray-100">
            <span className="font-bold text-xl text-black tracking-tight">Pola</span>
            Tech
          </div>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Untitled Project"
              className="text-sm font-medium text-gray-600 bg-transparent border-none focus:ring-2 focus:ring-indigo-100 rounded-md px-3 py-1 outline-none hover:bg-gray-50 transition-all w-48"
            />
          </div>
          <div className="flex items-center space-x-4 border-l pl-6 border-gray-100">
            {[
              { name: "Design", icon: <FolderArchive size={20} /> },
              { name: "Undo", icon: <RotateCcw size={20} /> },
              { name: "Redo", icon: <RotateCw size={20} /> },
              { name: "Download", icon: <FileDown size={20} /> },
            ].map((btn) => (
              <button key={btn.name} className="flex flex-col items-center group transition-colors px-2">
                <div className="p-2 group-hover:bg-gray-100 rounded-full text-gray-600 group-hover:text-indigo-600">
                  {btn.icon}
                </div>
                <span className="text-[10px] font-medium text-gray-500 group-hover:text-indigo-600">{btn.name}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* --- BOTTOM AREA --- */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* --- LEFT SIDEBAR --- */}
        <aside className="w-24 bg-white border-r border-gray-200 flex flex-col shadow-sm z-20">
          <nav className="flex-1 overflow-y-auto p-3 space-y-4 text-center">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-4">Tools</h3>
            {Object.keys(toolOptions).map((name) => (
              <button
                key={name}
                onClick={() => setActiveTool(activeTool === name ? null : name)}
                className={`w-full flex flex-col items-center justify-center p-3 rounded-xl transition-all group border ${
                  activeTool === name
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                    : "text-gray-400 border-transparent hover:bg-indigo-50 hover:text-indigo-600"
                }`}
              >
                <Shirt size={20} className={`${activeTool === name ? "text-white" : "group-hover:text-indigo-500"} mb-1`} />
                <span className="text-[9px] font-medium leading-tight">{name}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* --- SECONDARY SIDEBAR --- */}
        <div className={`bg-white border-r border-gray-100 transition-all duration-300 ease-in-out overflow-hidden z-10 ${activeTool ? "w-80" : "w-0"}`}>
          <div className="w-80 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900">{activeTool}</h3>
              <button onClick={() => setActiveTool(null)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {activeTool && Object.keys(toolOptions[activeTool]).map((optionKey) => (
                <button
                  key={optionKey}
                  onClick={() => updatePart(activeTool, optionKey)}
                  className={`flex flex-col items-center justify-center aspect-square rounded-lg border transition-all group ${
                    states[activeTool.toLowerCase().replace("silhouettes", "body") as keyof typeof states] === optionKey
                      ? "border-indigo-500 bg-indigo-50"
                      : "bg-gray-50 border-gray-100 hover:border-indigo-300 hover:bg-indigo-50"
                  }`}
                >
                  <div className="w-8 h-8 bg-white rounded border border-gray-200 mb-2 flex items-center justify-center">
                    <Shirt size={14} className="text-gray-300 group-hover:text-indigo-400" />
                  </div>
                  <span className="text-[7px] font-bold text-gray-500 text-center leading-tight px-1 uppercase">
                    {optionKey.replace(/_/g, " ")}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- MAIN CANVAS AREA --- */}
        <main className="flex-1 relative bg-[#f8f9fa] flex items-center justify-center p-8 transition-all duration-300">
          <div className="w-full max-w-3xl aspect-4/3 bg-white shadow-xl rounded-lg border border-gray-200 relative overflow-hidden flex flex-col items-center justify-center">
            <svg width="100%" height="80%" viewBox="0 0 100 120" className="drop-shadow-2xl">
              {/* --- DEFINISI PATTERN --- */}
              <defs>
                <pattern id="p_stripes" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width="4" height="4" fill={states.primaryColor} />
                  <line x1="0" y1="0" x2="0" y2="4" stroke="rgba(0,0,0,0.1)" strokeWidth="1.5" />
                </pattern>
                <pattern id="p_checkered" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                  <rect width="8" height="8" fill={states.primaryColor} />
                  <rect width="4" height="4" fill="rgba(255,255,255,0.15)" />
                  <rect x="4" y="4" width="4" height="4" fill="rgba(255,255,255,0.15)" />
                </pattern>
                <pattern id="p_dots" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                  <rect width="6" height="6" fill={states.primaryColor} />
                  <circle cx="3" cy="3" r="1.2" fill="rgba(255,255,255,0.3)" />
                </pattern>
                <pattern id="p_denim" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <image href="https://www.transparenttextures.com/patterns/denim.png" x="0" y="0" width="20" height="20" />
                  <rect width="20" height="20" fill={states.primaryColor} fillOpacity="0.6" />
                </pattern>
                <pattern id="p_grid" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
                  <rect width="5" height="5" fill={states.primaryColor} stroke="rgba(0,0,0,0.05)" strokeWidth="0.5" />
                </pattern>
              </defs>

              <g className="shirt-layers">
                <g opacity="0.15">
                  {renderPaths(VARIASI_POLA.body[states.body].back, states.primaryColor, states.primaryColor, "0.4")}
                  {renderPaths(VARIASI_POLA.sleeves[states.sleeves].back, states.primaryColor, states.primaryColor, "0.4")}
                  {renderPaths(VARIASI_POLA.necklines[states.necklines].back, states.primaryColor, states.primaryColor, "0.4")}
                </g>

                <g>
                  {renderPaths(VARIASI_POLA.body[states.body].front, states.primaryColor, "#1e1b4b", "0.4")}
                  {renderPaths(VARIASI_POLA.sleeves[states.sleeves].front, states.primaryColor, "#1e1b4b", "0.4")}
                  <g transform={pocketOffsets[states.pocket] || "translate(0, 0)"}>
                    {renderPaths(VARIASI_POLA.pocket[states.pocket], states.primaryColor, "#1e1b4b", "0.3")}
                  </g>
                  {renderPaths(VARIASI_POLA.necklines[states.necklines].front, states.primaryColor, "#1e1b4b", "0.4")}
                </g>
              </g>
            </svg>
          </div>
        </main>

        {/* --- RIGHT SIDEBAR --- */}
        <aside className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto flex flex-col z-20">
          <section className="space-y-6">
            <header>
              <h2 className="font-bold text-gray-900 text-lg">Technical Sketch</h2>
              <p className="text-xs text-gray-400">Configure your pattern details</p>
            </header>

            <div className="flex gap-3">
              {[
                { name: "Color", icon: <Palette size={20} /> },
                { name: "pattern", icon: <Square size={20} /> },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => setActiveCategory(item.name)}
                  className={`w-full flex flex-col items-center justify-center p-3 rounded-xl transition-all border ${
                    activeCategory === item.name
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                      : "bg-white text-gray-400 border-gray-100 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
                >
                  <div className={`mb-1 ${activeCategory === item.name ? "text-white" : "text-gray-400"}`}>
                    {item.icon}
                  </div>
                  <span className="text-[9px] font-medium leading-tight capitalize">{item.name}</span>
                </button>
              ))}
            </div>

            <div className="pt-2">
              <div className="relative group">
                <input
                  type="text"
                  placeholder={`Search ${activeCategory}...`}
                  className="w-full bg-transparent border-b border-gray-200 pb-2 text-sm italic font-bold text-gray-400 outline-none focus:border-indigo-400 focus:text-gray-600 transition-all duration-300"
                />
                <span className="absolute bottom-0 left-0 w-0 h-px bg-indigo-500 transition-all duration-300 group-focus-within:w-full"></span>
              </div>
            </div>

            <div className="pt-4">
              {/* --- KATEGORI COLOR --- */}
              {activeCategory === "Color" && (
                <div className="grid grid-cols-5 gap-y-5 gap-x-2">
                  {colors.map((color) => {
                    const isColorActive = states.primaryColor === color.hex && !selectedPattern;
                    return (
                      <div key={color.hex} className="flex flex-col items-center space-y-1">
                        <button
                          onClick={() => {
                            updatePart("Color", color.hex);
                            setSelectedPattern(null); // Reset pattern jika pilih warna solid
                          }}
                          className={`w-10 h-10 rounded-full border-2 transition-all duration-200 active:scale-90 shadow-sm ${
                            isColorActive ? "border-indigo-600 scale-110 ring-2 ring-indigo-100" : "border-white hover:border-gray-200"
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                        <span className={`text-[8px] font-medium text-center w-12 truncate ${isColorActive ? "text-indigo-600 font-bold" : "text-gray-400"}`}>
                          {color.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* --- KATEGORI PATTERN --- */}
              {activeCategory === "pattern" && (
                <div className="grid grid-cols-2 gap-3">
                  {/* Opsi Tanpa Pattern (Solid) */}
                  <button 
                    onClick={() => setSelectedPattern(null)}
                    className={`col-span-2 p-2 rounded-lg border text-[10px] font-bold transition-all ${!selectedPattern ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-400'}`}
                  >
                    SOLID COLOR ONLY
                  </button>
                  
                  {patterns.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPattern(p.id)}
                      className={`flex items-center space-x-3 p-2 rounded-lg border transition-all group ${
                        selectedPattern === p.id ? "border-indigo-500 bg-indigo-50" : "bg-gray-50 border-gray-100 hover:bg-indigo-50 hover:border-indigo-200"
                      }`}
                    >
                      <div className="w-8 h-8 rounded border border-gray-200 flex-shrink-0 overflow-hidden bg-white">
                         <svg width="100%" height="100%"><rect width="100%" height="100%" fill={`url(#${p.id})`} /></svg>
                      </div>
                      <span className={`text-[10px] font-semibold truncate ${selectedPattern === p.id ? 'text-indigo-600' : 'text-gray-600'}`}>
                        {p.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
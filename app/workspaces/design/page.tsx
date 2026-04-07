"use client";

import React, { useState } from "react";
import {
  FolderArchive,
  Shirt,
  FileDown,
  LogIn,
  Square,
  Palette,
  RotateCcw,
  RotateCw,
  X,
  Download
} from "lucide-react";

export default function DesignDashboard() {
  // 1. State untuk Tool di Sidebar Kiri
  const [activeTool, setActiveTool] = useState<string | null>(null);

  // 2. State untuk Kategori di Sidebar Kanan (Color/Pattern)
  const [activeCategory, setActiveCategory] = useState<string | null>("Color");

  // --- DATA DUMMY ---
  const toolOptions: Record<string, string[]> = {
    Silhouettes: ["Oversized", "Slim Fit", "Regular", "Boxy", "Crop", "Longline", "A-Line", "Tailored"],
    Necklines: ["Crew Neck", "V-Neck", "Polo", "Hoodie", "Turtle Neck", "Scoop"],
    Sleeves: ["Short", "Long", "Raglan", "Cuff", "Sleeveless", "Cap"],
    Pockets: ["Chest", "Kangaroo", "Welt", "Patch", "Hidden"],
  };

  const colors = [
    { name: "White", hex: "#FFFFFF" },
    { name: "Charcoal", hex: "#333333" },
    { name: "Brown", hex: "#8B4513" },
    { name: "Forest", hex: "#2E8B57" },
    { name: "Gray", hex: "#E5E7EB" },
    { name: "Red", hex: "#F87171" },
    { name: "Blue", hex: "#60A5FA" },
  ];

  const patterns = [
    "Cotton Combed",
    "Ribana",
    "Denim Premium",
    "Linen",
    "Polyester",
  ];

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden font-sans text-gray-800">
      
      {/* --- TOP NAVBAR --- */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-30">
        <div className="flex items-center space-x-6">
          <div className="font-bold text-xl text-indigo-600 tracking-tight border-r pr-6 border-gray-100">
            <span className="font-bold text-xl text-black tracking-tight border-r border-gray-100">Pola</span>Tech
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
                <span className="text-[10px] font-medium text-gray-500 group-hover:text-indigo-600">
                  {btn.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* <button className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition-all active:scale-95 shadow-sm">
            <LogIn size={18} />
            <span className="text-sm font-semibold">Sign In</span>
          </button> */}
        </div>
      </header>

      {/* --- BOTTOM AREA --- */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* --- LEFT SIDEBAR (Icons Only) --- */}
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

        {/* --- SECONDARY SIDEBAR (Collapsible Menu) --- */}
        <div 
          className={`bg-white border-r border-gray-100 transition-all duration-300 ease-in-out overflow-hidden z-10 ${
            activeTool ? "w-80" : "w-0"
          }`}
        >
          <div className="w-80 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900">{activeTool}</h3>
              <button onClick={() => setActiveTool(null)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                <X size={16} />
              </button>
            </div>

            {/* Grid 4 Item per Baris */}
            <div className="grid grid-cols-4 gap-3">
              {activeTool && toolOptions[activeTool].map((option) => (
                <button 
                  key={option}
                  className="flex flex-col items-center justify-center aspect-square bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                >
                  <div className="w-8 h-8 bg-white rounded border border-gray-200 mb-2 flex items-center justify-center">
                    <Shirt size={14} className="text-gray-300 group-hover:text-indigo-400" />
                  </div>
                  <span className="text-[8px] font-medium text-gray-500 text-center leading-tight px-1">
                    {option}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- MAIN CANVAS AREA --- */}
        <main className="flex-1 relative bg-[#f8f9fa] flex items-center justify-center p-8 transition-all duration-300">
          <div className="w-full max-w-3xl aspect-4/3 bg-white shadow-xl rounded-lg border border-gray-200 relative overflow-hidden flex flex-col items-center justify-center text-gray-300 italic">
            <div className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-full flex items-center justify-center mb-4">
              <Square size={32} />
            </div>
            <p className="text-sm">Canvas: Pattern layers will render here</p>
          </div>
        </main>

        {/* --- RIGHT SIDEBAR (Properties) --- */}
        <aside className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto flex flex-col z-20">
          <section className="space-y-6">
            <header>
              <h2 className="font-bold text-gray-900 text-lg">Technical Sketch</h2>
              <p className="text-xs text-gray-400">Configure your pattern details</p>
            </header>

            {/* Kategori Tab */}
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

            {/* Search Input */}
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

            {/* Konten Dinamis Berdasarkan State Kanan */}
            <div className="pt-4 animate-in fade-in slide-in-from-top-1 duration-300">
              {activeCategory === "Color" && (
                <div className="flex flex-wrap gap-4">
                  {colors.map((color) => (
                    <div key={color.hex} className="flex flex-col items-center space-y-1">
                      <button
                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200 hover:scale-110 transition-transform active:scale-95"
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                      <span className="text-[9px] font-medium text-gray-500 text-center w-12 truncate">
                        {color.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeCategory === "pattern" && (
                <div className="flex flex-wrap gap-4">
                  {patterns.map((pattern, index) => (
                    <div key={pattern} className="flex flex-col items-center space-y-1">
                      <button
                        className="w-10 h-10 rounded-md border border-gray-200 shadow-sm hover:scale-110 transition-transform active:scale-95 flex items-center justify-center ring-1 ring-white ring-inset"
                        style={{ backgroundColor: index % 2 === 0 ? "#E5E7EB" : "#D1D5DB" }}
                        title={pattern}
                      />
                      <span className="text-[9px] font-medium text-gray-500 text-center w-12 truncate leading-tight">
                        {pattern}
                      </span>
                    </div>
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
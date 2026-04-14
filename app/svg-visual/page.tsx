"use client";
import { useState, useEffect } from "react";

export default function SVGVisualizer() {
  const [inputValue, setInputValue] = useState("");
  const [pathData, setPathData] = useState("M50 20 L80 100 L20 100 Z"); // Default shape
  const [fillColor, setFillColor] = useState("#6366f1");
  const [showGrid, setShowGrid] = useState(true);

  // Fungsi untuk mengekstrak koordinat dari string d="..."
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawValue = e.target.value;
    setInputValue(rawValue);

    // Regex untuk menangkap isi di dalam d="..." atau d='...'
    const match = rawValue.match(/d=["']([^"']*)["']/);
    
    if (match && match[1]) {
      setPathData(match[1].trim());
    } else {
      // Jika tidak ditemukan pola d="", anggap input adalah koordinat murni
      setPathData(rawValue.trim());
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans">
      
      {/* 1. SIDEBAR KONTROL */}
      <aside className="w-[400px] bg-slate-800 border-r border-slate-700 flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-black text-indigo-400 tracking-tight">
            SVG <span className="text-white font-light">Visualizer</span>
          </h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
            PolaTech Debugging Tool
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Input Area */}
          <section>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-3 px-1">
              Path Input (Paste d="..." here)
            </label>
            <textarea
              className="w-full h-40 bg-slate-950 border border-slate-700 rounded-xl p-4 text-xs font-mono text-indigo-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none shadow-inner"
              value={inputValue}
              onChange={handleInputChange}
              placeholder='Contoh: d="M15.75 65.46L27.51...Z"'
            />
          </section>

          {/* Clean Output Area (Read Only) */}
          <section>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-3 px-1">
              Extracted Path Data
            </label>
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-[10px] font-mono text-slate-400 break-all">
              {pathData || "No data detected"}
            </div>
          </section>

          {/* Appearance Settings */}
          <section className="space-y-4">
            <label className="block text-[10px] font-bold text-slate-500 uppercase px-1">
              Visual Settings
            </label>
            
            <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-700">
              <span className="text-xs">Fill Color</span>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={fillColor}
                  onChange={(e) => setFillColor(e.target.value)}
                  className="w-6 h-6 bg-transparent cursor-pointer"
                />
                <span className="text-[10px] font-mono text-slate-400 uppercase">{fillColor}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-700">
              <span className="text-xs">Show Grid Helper</span>
              <button 
                onClick={() => setShowGrid(!showGrid)}
                className={`w-9 h-5 rounded-full transition-all relative ${showGrid ? 'bg-indigo-600' : 'bg-slate-600'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showGrid ? 'left-5' : 'left-1'}`} />
              </button>
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-slate-700 bg-slate-800/50">
          <button 
            onClick={() => { setInputValue(""); setPathData(""); }}
            className="w-full py-3 bg-slate-700 hover:bg-red-900/40 hover:text-red-400 text-slate-300 rounded-xl text-xs font-bold transition-all"
          >
            Clear All
          </button>
        </div>
      </aside>

      {/* 2. CANVAS PREVIEW */}
      <main className="flex-1 flex flex-col items-center justify-center relative bg-slate-950 p-12">
        {/* Background Decorative */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#4f46e5 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />

        <div className="relative group">
          {/* SVG Frame */}
          <div className="bg-white p-8 rounded-[2rem] shadow-[0_0_100px_rgba(79,70,229,0.15)] border border-white/5 transition-transform duration-500 group-hover:scale-[1.01]">
            <svg 
              width="400" 
              height="480" 
              viewBox="0 0 100 120" 
              className="bg-white rounded-lg"
            >
              {/* Grid System */}
              {showGrid && (
                <g stroke="#f1f5f9" strokeWidth="0.2">
                  {Array.from({ length: 11 }).map((_, i) => (
                    <line key={`v-${i}`} x1={i * 10} y1="0" x2={i * 10} y2="120" />
                  ))}
                  {Array.from({ length: 13 }).map((_, i) => (
                    <line key={`h-${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} />
                  ))}
                </g>
              )}

              {/* Main Path Render */}
              <path 
                d={pathData} 
                fill={fillColor} 
                stroke="#1e1b4b" 
                strokeWidth="0.5" 
                strokeLinejoin="round"
                strokeLinecap="round"
                className="transition-all duration-300"
              />

              {/* Center Reference Point */}
              {showGrid && <circle cx="50" cy="60" r="0.8" fill="#ef4444" opacity="0.5" />}
            </svg>
          </div>

          {/* Scale Indicator */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
             <div className="bg-slate-800 border border-slate-700 px-4 py-1.5 rounded-full text-[10px] font-mono text-indigo-300 shadow-xl">
               ViewBox: 100x120
             </div>
          </div>
        </div>

        {/* Path Stats */}
        <div className="mt-16 grid grid-cols-2 gap-4 w-full max-w-md">
          <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total Points</p>
            <p className="text-xl font-mono text-white">{pathData.split(/[a-zA-Z]/).filter(Boolean).length}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Path Status</p>
            <p className="text-xl font-mono text-green-400">{pathData ? "Ready" : "Empty"}</p>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
}
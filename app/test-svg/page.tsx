"use client";
import { useState } from "react";
import { VARIASI_POLA } from "@/app/constants/patterns";

// 1. Definisikan pemetaan translasi khusus untuk tiap jenis kantong
const pocketOffsets: Record<string, string> = {
  slanted_welt_pocket: "translate(0, 12)",
  u_line_pocket: "translate(0, 0)",
  kangaroo_pocket: "translate(0, -2)",
  none: "translate(0, 0)",
};

export default function TestSVGPage() {
  const [body, setBody] = useState<keyof typeof VARIASI_POLA.body>("shirt");
  const [necklines, setNecklines] =
    useState<keyof typeof VARIASI_POLA.necklines>("round_neck_binding");
  const [sleeves, setSleeves] =
    useState<keyof typeof VARIASI_POLA.sleeves>("short_sleeves");
  const [pocket, setPocket] =
    useState<keyof typeof VARIASI_POLA.pocket>("none");

  // Helper untuk merender path baik string tunggal maupun array
  const renderPaths = (
    data: any,
    color: string,
    stroke: string,
    width: string,
  ) => {
    if (!data) return null;
    const paths = Array.isArray(data) ? data : [data];
    return paths.map((d, index) => (
      <path
        key={index}
        d={d}
        fill={color}
        stroke={stroke}
        strokeWidth={width}
      />
    ));
  };

  const ControlSection = ({ title, options, current, setter }: any) => (
    <div className="mb-8">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
        {title}
      </h3>
      <div className="flex flex-col gap-1.5">
        {Object.keys(options).map((key) => (
          <button
            key={key}
            onClick={() => setter(key)}
            className={`text-left px-4 py-2.5 text-xs rounded-lg border transition-all duration-200 ${
              current === key
                ? "bg-indigo-600 text-white border-indigo-600 shadow-md translate-x-1"
                : "bg-white text-slate-600 border-slate-100 hover:border-indigo-300 hover:bg-indigo-50"
            }`}
          >
            {key.replace(/_/g, " ")}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-black text-indigo-600 tracking-tighter">
            PolaTech <span className="text-slate-400 font-light">Lab</span>
          </h1>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tight">
            SVG Layering System v2
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <ControlSection
            title="Body Style"
            options={VARIASI_POLA.body}
            current={body}
            setter={setBody}
          />
          <ControlSection
            title="Necklines"
            options={VARIASI_POLA.necklines}
            current={necklines}
            setter={setNecklines}
          />
          <ControlSection
            title="Sleeves"
            options={VARIASI_POLA.sleeves}
            current={sleeves}
            setter={setSleeves}
          />
          <ControlSection
            title="Pocket"
            options={VARIASI_POLA.pocket}
            current={pocket}
            setter={setPocket}
          />
        </div>
      </aside>

      <main className="flex-1 relative flex flex-col items-center justify-center p-12 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
        <div className="bg-white p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/50 backdrop-blur-sm relative transition-all duration-500">
          <svg
            width="400"
            height="500"
            viewBox="0 0 100 120"
            className="drop-shadow-2xl"
          >
            <g className="shirt-layers">
              {/* --- LAYER 1: BACK-VIEW --- */}
              <g className="back-view" opacity="0.8">
                {renderPaths(VARIASI_POLA.body[body].back, "#6366f1", "#6366f1", "0.4")}
                {renderPaths(VARIASI_POLA.sleeves[sleeves].back, "#6366f1", "#6366f1", "0.4")}
                {renderPaths(VARIASI_POLA.necklines[necklines].back, "#6366f1", "#6366f1", "0.4")}
              </g>

              {/* --- LAYER 2: FRONT-VIEW --- */}
              <g className="front-view">
                {/* 1. Body Depan */}
                {renderPaths(VARIASI_POLA.body[body].front, "#6366f1", "#1e1b4b", "0.4")}

                {/* 2. Sleeves Depan */}
                {renderPaths(VARIASI_POLA.sleeves[sleeves].front, "#6366f1", "#1e1b4b", "0.4")}

                {/* 3. POCKET (Dinamis berdasarkan pocketOffsets) */}
                <g transform={pocketOffsets[pocket] || "translate(0, 0)"}>
                  {renderPaths(
                    VARIASI_POLA.pocket[pocket],
                    "#4f46e5",
                    "#1e1b4b",
                    "0.3",
                  )}
                </g>

                {/* 4. Kerah Depan */}
                {renderPaths(VARIASI_POLA.necklines[necklines].front, "#4338ca", "#1e1b4b", "0.4")}
              </g>
            </g>
          </svg>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-1.5 rounded-full text-[10px] font-mono shadow-xl whitespace-nowrap">
            RENDERED: {body.toUpperCase()} /{" "}
            {pocket.replace(/_/g, " ").toUpperCase()}
          </div>
        </div>

        <div className="mt-12 flex gap-4">
          <button className="px-8 py-3 bg-white text-slate-700 rounded-2xl text-sm font-semibold shadow-sm border border-slate-200 hover:bg-slate-50 transition-all">
            Reset Design
          </button>
          <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-semibold shadow-lg hover:opacity-90 transition-all active:scale-95">
            Download SVG
          </button>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
"use client";

import React, { useState, useEffect, Suspense } from "react";
import {
  Shirt, Square, Palette, RotateCcw, RotateCw, X, Loader2,
  ArrowLeft, Check, Save, FileDown, Upload, Ruler, PenLine, Sparkles,
} from "lucide-react";
import { VARIASI_POLA } from "@/app/constants/patterns";
import { useDesignCanvas, pocketOffsets } from "@/app/hooks/useDesignCanvas";
import { useRouter, useSearchParams } from "next/navigation";
import { PlanType, getUserPlan, PLAN_LABELS, PLAN_COLORS } from "@/app/lib/planUtils";
import ExportPanel from "@/app/components/ExportPanel";
import FabricUpload from "@/app/components/FabricUpload";
import SizeGrading from "@/app/components/SizeGrading";
import CanvasDrawing from "@/app/components/CanvasDrawing";
import AIAssistant from "@/app/components/AIAssistant";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-medium animate-in slide-in-from-top-4 fade-in duration-300 ${type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
      {type === "success" ? <Check size={18} /> : <X size={18} />}
      <span>{message}</span>
    </div>
  );
}

type RightTab = "Color" | "pattern" | "export" | "fabric" | "grading" | "canvas" | "ai";

function DesignDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const designId = searchParams.get("id");

  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<RightTab>("Color");
  const [projectName, setProjectName] = useState("Untitled Project");
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [plan, setPlan] = useState<PlanType>("lite");
  const [currentSize, setCurrentSize] = useState("M");
  const [sizeScale, setSizeScale] = useState(1);
  const [customFabric, setCustomFabric] = useState<string | null>(null);
  const [canvasShapes, setCanvasShapes] = useState<any[]>([]);

  const svgRef = React.useRef<SVGSVGElement>(null);
  const { states, updatePart, undo, redo, canUndo, canRedo, loadConfig } = useDesignCanvas();

  // Load plan from session
  useEffect(() => { setPlan(getUserPlan()); }, []);

  // Load existing design
  useEffect(() => {
    if (!designId) return;
    const fetchDesign = async () => {
      try {
        const sessionStr = localStorage.getItem("user_session");
        if (!sessionStr) return;
        const session = JSON.parse(sessionStr);
        const res = await fetch(`${API_URL}/api/designs/detail/${designId}`, {
          headers: { Authorization: `Bearer ${session.token}` },
        });
        if (res.ok) {
          const { data } = await res.json();
          setProjectName(data.nama_design);
          if (data.config) loadConfig(data.config);
          if (data.canvas_data) setCanvasShapes(data.canvas_data);
        }
      } catch (err) { console.error("Failed to load design:", err); }
    };
    fetchDesign();
  }, [designId]);

  const showToast = (message: string, type: "success" | "error") => setToast({ message, type });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const sessionStr = localStorage.getItem("user_session");
      if (!sessionStr) { showToast("Sesi tidak ditemukan.", "error"); return; }
      const session = JSON.parse(sessionStr);
      const token = session.token;
      if (!token) { showToast("Token tidak ditemukan.", "error"); return; }

      const wsRes = await fetch(`${API_URL}/api/workspaces`, { headers: { Authorization: `Bearer ${token}` } });
      if (wsRes.status === 401) { showToast("Sesi habis.", "error"); localStorage.removeItem("user_session"); return; }
      const wsData = await wsRes.json();
      let workspaceId = wsData.data?.[0]?.id_workspace;

      if (!workspaceId) {
        const createWsRes = await fetch(`${API_URL}/api/workspaces`, {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ nama_workspace: "Default Workspace" }),
        });
        const newWs = await createWsRes.json();
        workspaceId = newWs.data?.id_workspace;
      }
      if (!workspaceId) throw new Error("Gagal membuat workspace.");

      const body: any = { nama_design: projectName || "Untitled Design", config: states };
      if (canvasShapes.length > 0) body.canvas_data = canvasShapes;

      let res;
      if (designId) {
        res = await fetch(`${API_URL}/api/designs/${designId}`, {
          method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch(`${API_URL}/api/designs`, {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id_workspace: workspaceId, ...body }),
        });
      }

      const result = await res.json();
      if (!res.ok) {
        const errorDetail = result.errors ? result.errors.map((e: any) => `${e.field}: ${e.message}`).join(", ") : result.message;
        throw new Error(errorDetail || "Gagal menyimpan.");
      }

      showToast("Desain berhasil disimpan!", "success");
      if (!designId && result.data?.id_design) router.replace(`/workspaces/design?id=${result.data.id_design}`);
    } catch (err: any) {
      showToast(err.message || "Gagal menyimpan.", "error");
    } finally { setIsSaving(false); }
  };

  const handleApplySuggestion = (type: string, value: string) => {
    updatePart(type, value);
    showToast("Saran AI diterapkan!", "success");
  };

  const toolOptions: Record<string, any> = {
    Silhouettes: VARIASI_POLA.body,
    Necklines: VARIASI_POLA.necklines,
    Sleeves: VARIASI_POLA.sleeves,
    Pockets: VARIASI_POLA.pocket,
  };

  const colors = [
    { name: "White", hex: "#FFFFFF" }, { name: "Off White", hex: "#F5F5F0" },
    { name: "Black", hex: "#1A1A1A" }, { name: "Charcoal", hex: "#374151" },
    { name: "Silver", hex: "#D1D5DB" }, { name: "Beige", hex: "#D2B48C" },
    { name: "Khaki", hex: "#C3B091" }, { name: "Olive", hex: "#556B2F" },
    { name: "Terracotta", hex: "#E2725B" }, { name: "Chocolate", hex: "#5D4037" },
    { name: "Navy", hex: "#1E3A8A" }, { name: "Royal Blue", hex: "#2563EB" },
    { name: "Sky", hex: "#7DD3FC" }, { name: "Forest", hex: "#064E3B" },
    { name: "Emerald", hex: "#10B981" }, { name: "Crimson", hex: "#991B1B" },
    { name: "Salmon", hex: "#FA8072" }, { name: "Mustard", hex: "#EAB308" },
    { name: "Lavender", hex: "#A78BFA" }, { name: "Coral", hex: "#FF7F50" },
  ];

  const patterns = [
    { id: "p_stripes", name: "Stripes Vertical" }, { id: "p_checkered", name: "Checkered Box" },
    { id: "p_dots", name: "Polka Dots" }, { id: "p_denim", name: "Denim Texture" },
    { id: "p_grid", name: "Fine Grid" },
  ];

  const renderPaths = (data: any, color: string, stroke: string, width: string) => {
    if (!data) return null;
    const paths = Array.isArray(data) ? data : [data];
    let fillValue = states.pattern ? `url(#${states.pattern})` : color;
    if (customFabric) fillValue = "url(#custom_fabric)";
    return paths.map((d, i) => (
      <path key={i} d={d} fill={fillValue} stroke={stroke} strokeWidth={width} className="transition-all duration-500 ease-in-out" />
    ));
  };

  const rightTabs: { id: RightTab; icon: React.ReactNode; label: string; planReq?: PlanType[] }[] = [
    { id: "Color", icon: <Palette size={16} />, label: "Color" },
    { id: "pattern", icon: <Square size={16} />, label: "Pattern" },
    { id: "fabric", icon: <Upload size={16} />, label: "Fabric" },
    { id: "export", icon: <FileDown size={16} />, label: "Export" },
    { id: "grading", icon: <Ruler size={16} />, label: "Grading", planReq: ["pro", "business"] },
    { id: "canvas", icon: <PenLine size={16} />, label: "Canvas", planReq: ["business"] },
    { id: "ai", icon: <Sparkles size={16} />, label: "AI", planReq: ["business"] },
  ];

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden font-sans text-gray-800">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* TOP NAVBAR */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-30">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.push("/workspaces")} className="group flex items-center gap-2 px-3 py-2 -ml-1 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200" title="Kembali">
            <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
            <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline">Kembali</span>
          </button>
          <div className="h-8 w-px bg-gray-200" />
          <div className="font-bold text-xl text-indigo-600 tracking-tight"><span className="text-black">Pola</span>Tech</div>
          <div className="h-8 w-px bg-gray-200" />
          <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Untitled Project" className="text-sm font-medium text-gray-600 bg-transparent border-none focus:ring-2 focus:ring-indigo-100 rounded-md px-3 py-1 outline-none hover:bg-gray-50 transition-all w-48" />
          <div className="h-8 w-px bg-gray-200" />

          {/* Plan badge */}
          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${PLAN_COLORS[plan]}`}>
            {PLAN_LABELS[plan]}
          </span>

          <div className="h-8 w-px bg-gray-200" />
          <div className="flex items-center space-x-1">
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 shadow-sm hover:shadow-md">
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span>{isSaving ? "Menyimpan..." : "Simpan"}</span>
            </button>
            <div className="h-8 w-px bg-gray-200 mx-2" />
            <button onClick={undo} disabled={!canUndo} title="Undo" className={`p-2.5 rounded-xl transition-all ${canUndo ? "text-gray-500 hover:bg-gray-100 hover:text-indigo-600 active:scale-90" : "text-gray-200 cursor-not-allowed"}`}><RotateCcw size={18} /></button>
            <button onClick={redo} disabled={!canRedo} title="Redo" className={`p-2.5 rounded-xl transition-all ${canRedo ? "text-gray-500 hover:bg-gray-100 hover:text-indigo-600 active:scale-90" : "text-gray-200 cursor-not-allowed"}`}><RotateCw size={18} /></button>
          </div>
        </div>
      </header>

      {/* BOTTOM AREA */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* LEFT SIDEBAR */}
        <aside className="w-24 bg-white border-r border-gray-200 flex flex-col shadow-sm z-20">
          <nav className="flex-1 overflow-y-auto p-3 space-y-4 text-center">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-4">Tools</h3>
            {Object.keys(toolOptions).map((name) => (
              <button key={name} onClick={() => setActiveTool(activeTool === name ? null : name)}
                className={`w-full flex flex-col items-center justify-center p-3 rounded-xl transition-all group border ${activeTool === name ? "bg-indigo-600 text-white border-indigo-600 shadow-md" : "text-gray-400 border-transparent hover:bg-indigo-50 hover:text-indigo-600"}`}>
                <Shirt size={20} className={`${activeTool === name ? "text-white" : "group-hover:text-indigo-500"} mb-1`} />
                <span className="text-[9px] font-medium leading-tight">{name}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* SECONDARY SIDEBAR */}
        <div className={`bg-white border-r border-gray-100 transition-all duration-300 ease-in-out overflow-hidden z-10 ${activeTool ? "w-80" : "w-0"}`}>
          <div className="w-80 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900">{activeTool}</h3>
              <button onClick={() => setActiveTool(null)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {activeTool && Object.keys(toolOptions[activeTool]).map((optionKey) => (
                <button key={optionKey} onClick={() => updatePart(activeTool, optionKey)}
                  className={`flex flex-col items-center justify-center aspect-square rounded-lg border transition-all group ${states[activeTool.toLowerCase().replace("silhouettes", "body").replace("pockets", "pocket") as keyof typeof states] === optionKey ? "border-indigo-500 bg-indigo-50" : "bg-gray-50 border-gray-100 hover:border-indigo-300 hover:bg-indigo-50"}`}>
                  <div className="w-8 h-8 bg-white rounded border border-gray-200 mb-2 flex items-center justify-center">
                    <Shirt size={14} className="text-gray-300 group-hover:text-indigo-400" />
                  </div>
                  <span className="text-[7px] font-bold text-gray-500 text-center leading-tight px-1 uppercase">{optionKey.replace(/_/g, " ")}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN CANVAS */}
        <main className="flex-1 relative bg-[#f8f9fa] flex items-center justify-center p-8 transition-all duration-300">
          {activeTab === "canvas" ? (
            <div className="w-full h-full bg-white shadow-xl rounded-lg border border-gray-200 overflow-hidden flex flex-col">
               <CanvasDrawing plan={plan} canvasData={canvasShapes} onCanvasChange={setCanvasShapes} isFullScreen={true} />
            </div>
          ) : (
          <div className="w-full max-w-3xl aspect-4/3 bg-white shadow-xl rounded-lg border border-gray-200 relative overflow-hidden flex flex-col items-center justify-center">
            {currentSize !== "M" && (
              <div className="absolute top-3 left-3 bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[10px] font-bold z-10">
                Size: {currentSize} (×{sizeScale.toFixed(2)})
              </div>
            )}
            <svg ref={svgRef} width="100%" height="80%" viewBox="0 0 100 120" className="drop-shadow-2xl">
              <defs>
                <pattern id="p_stripes" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width="4" height="4" fill={states.primaryColor} /><line x1="0" y1="0" x2="0" y2="4" stroke="rgba(0,0,0,0.1)" strokeWidth="1.5" />
                </pattern>
                <pattern id="p_checkered" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                  <rect width="8" height="8" fill={states.primaryColor} /><rect width="4" height="4" fill="rgba(255,255,255,0.15)" /><rect x="4" y="4" width="4" height="4" fill="rgba(255,255,255,0.15)" />
                </pattern>
                <pattern id="p_dots" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                  <rect width="6" height="6" fill={states.primaryColor} /><circle cx="3" cy="3" r="1.2" fill="rgba(255,255,255,0.3)" />
                </pattern>
                <pattern id="p_denim" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <rect width="20" height="20" fill={states.primaryColor} fillOpacity="0.85" />
                </pattern>
                <pattern id="p_grid" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
                  <rect width="5" height="5" fill={states.primaryColor} stroke="rgba(0,0,0,0.05)" strokeWidth="0.5" />
                </pattern>
                {customFabric && (
                  <pattern id="custom_fabric" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                    <image href={customFabric} x="0" y="0" width="30" height="30" preserveAspectRatio="xMidYMid slice" />
                  </pattern>
                )}
              </defs>
              <g className="shirt-layers" transform={`scale(${sizeScale})`} style={{ transformOrigin: "50px 60px" }}>
                <g opacity="0.15">
                  {renderPaths(VARIASI_POLA.body[states.body]?.back, states.primaryColor, states.primaryColor, "0.4")}
                  {renderPaths(VARIASI_POLA.sleeves[states.sleeves]?.back, states.primaryColor, states.primaryColor, "0.4")}
                  {renderPaths(VARIASI_POLA.necklines[states.necklines]?.back, states.primaryColor, states.primaryColor, "0.4")}
                </g>
                <g>
                  {renderPaths(VARIASI_POLA.body[states.body]?.front, states.primaryColor, "#1e1b4b", "0.4")}
                  {renderPaths(VARIASI_POLA.sleeves[states.sleeves]?.front, states.primaryColor, "#1e1b4b", "0.4")}
                  <g transform={pocketOffsets[states.pocket] || "translate(0, 0)"}>
                    {renderPaths(VARIASI_POLA.pocket[states.pocket], states.primaryColor, "#1e1b4b", "0.3")}
                  </g>
                  {renderPaths(VARIASI_POLA.necklines[states.necklines]?.front, states.primaryColor, "#1e1b4b", "0.4")}
                </g>
              </g>
            </svg>
          </div>
          )}
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto flex flex-col z-20">
          <section className="space-y-6">
            <header>
              <h2 className="font-bold text-gray-900 text-lg">Technical Sketch</h2>
              <p className="text-xs text-gray-400">Configure your pattern details</p>
            </header>

            {/* Tab buttons */}
            <div className="grid grid-cols-4 gap-1.5">
              {rightTabs.map((tab) => {
                const locked = tab.planReq && !tab.planReq.includes(plan);
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all border text-[9px] font-medium ${activeTab === tab.id ? "bg-indigo-600 text-white border-indigo-600 shadow-md" : locked ? "bg-gray-50 text-gray-300 border-gray-50" : "bg-white text-gray-400 border-gray-100 hover:bg-indigo-50 hover:text-indigo-600"}`}>
                    <div className={`mb-0.5 ${activeTab === tab.id ? "text-white" : locked ? "text-gray-300" : "text-gray-400"}`}>{tab.icon}</div>
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              {/* COLOR TAB */}
              {activeTab === "Color" && (
                <div className="grid grid-cols-5 gap-y-5 gap-x-2">
                  {colors.map((color) => (
                    <div key={color.hex} className="flex flex-col items-center space-y-1">
                      <button onClick={() => updatePart("Color", color.hex)}
                        className={`w-10 h-10 rounded-full border-2 transition-all duration-200 active:scale-90 shadow-sm ${states.primaryColor === color.hex ? "border-indigo-600 scale-110 ring-2 ring-indigo-100" : "border-white hover:border-gray-200"}`}
                        style={{ backgroundColor: color.hex }} title={color.name} />
                      <span className={`text-[8px] font-medium text-center w-12 truncate ${states.primaryColor === color.hex ? "text-indigo-600 font-bold" : "text-gray-400"}`}>{color.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* PATTERN TAB */}
              {activeTab === "pattern" && (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => { updatePart("Pattern", null); setCustomFabric(null); }}
                    className={`col-span-2 p-2 rounded-lg border text-[10px] font-bold transition-all ${!states.pattern && !customFabric ? "bg-indigo-600 text-white border-indigo-600" : "bg-gray-50 text-gray-400"}`}>
                    SOLID COLOR ONLY
                  </button>
                  {patterns.map((p) => (
                    <button key={p.id} onClick={() => { updatePart("Pattern", p.id); setCustomFabric(null); }}
                      className={`flex items-center space-x-3 p-2 rounded-lg border transition-all group ${states.pattern === p.id ? "border-indigo-500 bg-indigo-50" : "bg-gray-50 border-gray-100 hover:bg-indigo-50 hover:border-indigo-200"}`}>
                      <div className="w-8 h-8 rounded border border-gray-200 flex-shrink-0 overflow-hidden bg-white">
                        <svg width="100%" height="100%"><rect width="100%" height="100%" fill={states.primaryColor || "#6366f1"} opacity={0.3} /><text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="6" fill="#666">P</text></svg>
                      </div>
                      <span className={`text-[10px] font-semibold truncate ${states.pattern === p.id ? "text-indigo-600" : "text-gray-600"}`}>{p.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* FABRIC TAB */}
              {activeTab === "fabric" && (
                <FabricUpload
                  currentFabric={customFabric}
                  onFabricApply={(url) => { setCustomFabric(url); updatePart("Pattern", null); }}
                  onFabricRemove={() => setCustomFabric(null)}
                />
              )}

              {/* EXPORT TAB */}
              {activeTab === "export" && (
                <ExportPanel svgRef={svgRef} projectName={projectName} plan={plan} onToast={showToast} />
              )}

              {/* GRADING TAB */}
              {activeTab === "grading" && (
                <SizeGrading plan={plan} bodyType={states.body} currentSize={currentSize}
                  onSizeChange={(size, scale) => { setCurrentSize(size); setSizeScale(scale); }} />
              )}

              {/* CANVAS TAB */}
              {activeTab === "canvas" && (
                <div className="text-center p-6 bg-indigo-50 border border-indigo-100 rounded-xl mt-4">
                  <PenLine size={32} className="mx-auto text-indigo-400 mb-2" />
                  <h4 className="font-bold text-indigo-700">Canvas Aktif</h4>
                  <p className="text-xs text-indigo-600 mt-1">Silakan menggambar di area canvas utama di sebelah kiri.</p>
                </div>
              )}

              {/* AI TAB */}
              {activeTab === "ai" && (
                <AIAssistant plan={plan} currentConfig={states} onApplySuggestion={handleApplySuggestion} />
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default function DesignDashboard() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>}>
      <DesignDashboardContent />
    </Suspense>
  );
}

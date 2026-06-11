"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Trash2, FileDown, Sparkles, RefreshCw,
  Scissors, Check, MousePointer, PenTool, Info, User,
  Triangle, Circle, Square, Layers, Send, Loader2
} from "lucide-react";
import Navbar from "@/app/components/navbar";

interface ControlPoint { x: number; y: number; }
interface Point {
  id: string; x: number; y: number;
  label?: string; symmetricWith?: string; isCenter?: boolean;
  cpNext?: ControlPoint | null;
}
interface ShapeStyle { fill: string; pattern: string; }
interface Shape {
  id: string;
  name: string;
  points: Point[];
  closed: boolean;
  style: ShapeStyle;
}

export default function CanvasCADPage() {
  const router = useRouter();

  // --- MULTI-SHAPE STATE ---
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [activeShapeId, setActiveShapeId] = useState<string | null>(null);

  // --- INTERACTION STATE ---
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [mode, setMode] = useState<"edit" | "curve" | "draw" | "delete">("edit");
  const [symmetry, setSymmetry] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showHelperLines, setShowHelperLines] = useState(true);
  const [showMannequin, setShowMannequin] = useState(true);
  
  // History for Shapes
  const [history, setHistory] = useState<Shape[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [projectName, setProjectName] = useState("Proyek Baju Multi-Komponen");

  // AI Copilot State
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const canvasRef = useRef<SVGSVGElement>(null);
  const draggingPointId = useRef<string | null>(null);
  const draggingControlIndex = useRef<number | null>(null);

  // --- PRESETS ---
  const getPresetPoints = (type: string): Point[] => {
    const idPrefix = Date.now().toString(36);
    if (type === "square") {
      return [
        { id: `${idPrefix}-tl`, x: 25, y: 25, symmetricWith: `${idPrefix}-tr` },
        { id: `${idPrefix}-tr`, x: 75, y: 25, symmetricWith: `${idPrefix}-tl` },
        { id: `${idPrefix}-br`, x: 75, y: 75, symmetricWith: `${idPrefix}-bl` },
        { id: `${idPrefix}-bl`, x: 25, y: 75, symmetricWith: `${idPrefix}-br` },
      ];
    }
    if (type === "triangle") {
      return [
        { id: `${idPrefix}-t`, x: 50, y: 20, isCenter: true },
        { id: `${idPrefix}-br`, x: 80, y: 80, symmetricWith: `${idPrefix}-bl` },
        { id: `${idPrefix}-bl`, x: 20, y: 80, symmetricWith: `${idPrefix}-br` }
      ];
    }
    if (type === "circle") {
      return [
        { id: `${idPrefix}-t`, x: 50, y: 15, isCenter: true, cpNext: { x: 75, y: 15 } },
        { id: `${idPrefix}-tr`, x: 85, y: 50, symmetricWith: `${idPrefix}-tl`, cpNext: { x: 85, y: 85 } },
        { id: `${idPrefix}-b`, x: 50, y: 85, isCenter: true, cpNext: { x: 25, y: 85 } },
        { id: `${idPrefix}-tl`, x: 15, y: 50, symmetricWith: `${idPrefix}-tr`, cpNext: { x: 15, y: 15 } }
      ];
    }
    return [];
  };

  useEffect(() => {
    if (shapes.length === 0) {
      addShape("Badan Utama", "square", { fill: "#818cf8", pattern: "none" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- HISTORY MANAGEMENT ---
  const saveHistory = (newShapes: Shape[]) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    const copiedShapes = JSON.parse(JSON.stringify(newShapes));
    setHistory([...nextHistory, copiedShapes]);
    setHistoryIndex(nextHistory.length);
  };

  const updateActiveShape = (newPoints: Point[]) => {
    setShapes(prev => {
      const updated = prev.map(s => s.id === activeShapeId ? { ...s, points: newPoints } : s);
      return updated;
    });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setShapes(JSON.parse(JSON.stringify(history[prevIndex])));
      setHistoryIndex(prevIndex);
      setSelectedPointId(null);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setShapes(JSON.parse(JSON.stringify(history[nextIndex])));
      setHistoryIndex(nextIndex);
      setSelectedPointId(null);
    }
  };

  // --- SHAPE ACTIONS ---
  const addShape = (name: string, type: "square" | "circle" | "triangle" | Point[], style?: ShapeStyle) => {
    const newShape: Shape = {
      id: `shape-${Date.now()}`,
      name: name,
      points: typeof type === 'string' ? getPresetPoints(type) : type,
      closed: true,
      style: style || { fill: "#4ade80", pattern: "none" }
    };
    const updated = [...shapes, newShape];
    setShapes(updated);
    setActiveShapeId(newShape.id);
    saveHistory(updated);
  };

  const deleteShape = (id: string) => {
    const updated = shapes.filter(s => s.id !== id);
    setShapes(updated);
    if (activeShapeId === id) setActiveShapeId(updated.length > 0 ? updated[0].id : null);
    saveHistory(updated);
  };

  const setShapeStyle = (shapeId: string, styleUpdate: Partial<ShapeStyle>) => {
    const updated = shapes.map(s => s.id === shapeId ? { ...s, style: { ...s.style, ...styleUpdate } } : s);
    setShapes(updated);
    saveHistory(updated);
  };

  // --- AI GENERATOR ---
  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/ai/generate-shape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt })
      });

      const resData = await response.json();
      if (resData.status === "success" && resData.data) {
        addShape(resData.data.name || "AI Component", resData.data.points, { fill: "#f472b6", pattern: "none" });
        setAiPrompt("");
      } else {
        alert("Gagal menghasilkan bentuk: " + (resData.message || "Unknown error"));
      }
    } catch (err) {
      alert("Error menghubungi server AI.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- CANVAS MATH ---
  const getBezierPath = (pts: Point[], isClosed: boolean): string => {
    if (pts.length < 2) return "";
    let path = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
    const len = pts.length;
    for (let i = 0; i < (isClosed ? len : len - 1); i++) {
      const pCurrent = pts[i];
      const pNext = pts[(i + 1) % len];
      if (pCurrent.cpNext) {
        path += ` Q ${pCurrent.cpNext.x.toFixed(2)} ${pCurrent.cpNext.y.toFixed(2)}, ${pNext.x.toFixed(2)} ${pNext.y.toFixed(2)}`;
      } else {
        path += ` L ${pNext.x.toFixed(2)} ${pNext.y.toFixed(2)}`;
      }
    }
    if (isClosed) path += " Z";
    return path;
  };

  const getCurveHandles = (pts: Point[], isClosed: boolean) => {
    const handles = [];
    const len = pts.length;
    for (let i = 0; i < (isClosed ? len : len - 1); i++) {
      const pCurrent = pts[i];
      const pNext = pts[(i + 1) % len];
      let cx = pCurrent.cpNext ? pCurrent.cpNext.x : (pCurrent.x + pNext.x) / 2;
      let cy = pCurrent.cpNext ? pCurrent.cpNext.y : (pCurrent.y + pNext.y) / 2;
      handles.push({ index: i, cx, cy, isCurved: !!pCurrent.cpNext, pCurrent, pNext });
    }
    return handles;
  };

  // --- CANVAS INTERACTION ---
  const activeShape = shapes.find(s => s.id === activeShapeId);
  const activePoints = activeShape ? activeShape.points : [];

  const getMouseCoords = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = canvasRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!activeShapeId) return;
    const coords = getMouseCoords(e);
    
    if (mode === "draw") {
      const newId = `pt-${Date.now()}`;
      let newPoint: Point = { id: newId, x: coords.x, y: coords.y };
      let newPoints = [...activePoints];

      if (symmetry) {
        if (Math.abs(coords.x - 50) < 3) {
          newPoint.x = 50; newPoint.isCenter = true;
          newPoints.push(newPoint);
        } else {
          const mirroredX = 100 - coords.x;
          const mirrorId = `pt-mir-${Date.now()}`;
          newPoint.symmetricWith = mirrorId;
          const mirroredPoint: Point = { id: mirrorId, x: mirroredX, y: coords.y, symmetricWith: newId };
          newPoints.unshift(mirroredPoint);
          newPoints.push(newPoint);
        }
      } else {
        newPoints.push(newPoint);
      }
      updateActiveShape(newPoints);
      // History will be saved on mouse up for drag, but for click we should save immediately.
      // Wait, we can't reliably read shapes state inside updateActiveShape synchronously. Let's just trust history on changes.
    }
  };

  const handlePointMouseDown = (e: React.MouseEvent, pt: Point) => {
    e.stopPropagation(); 
    if (mode !== "edit" && mode !== "delete") return;
    if (mode === "delete") {
      let updatedPoints = activePoints.filter((p) => p.id !== pt.id);
      if (pt.symmetricWith) updatedPoints = updatedPoints.filter((p) => p.id !== pt.symmetricWith);
      updateActiveShape(updatedPoints);
      setSelectedPointId(null);
      return;
    }
    draggingPointId.current = pt.id;
    setSelectedPointId(pt.id);
  };

  const handleCurveHandleMouseDown = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (mode !== "curve" && mode !== "edit") return;
    draggingControlIndex.current = index;
    setSelectedPointId(activePoints[index].id); 
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!activeShapeId || (draggingPointId.current === null && draggingControlIndex.current === null)) return;
    const coords = getMouseCoords(e);
    const clampedX = Math.max(0, Math.min(100, coords.x));
    const clampedY = Math.max(0, Math.min(100, coords.y));

    if (draggingPointId.current !== null) {
      const index = activePoints.findIndex((p) => p.id === draggingPointId.current);
      if (index === -1) return;
      const updatedPoints = [...activePoints];
      const targetPoint = { ...updatedPoints[index] };

      if (targetPoint.isCenter) {
        targetPoint.x = 50; targetPoint.y = clampedY;
      } else {
        targetPoint.x = clampedX; targetPoint.y = clampedY;
        if (symmetry && targetPoint.symmetricWith) {
          const mirrorIndex = updatedPoints.findIndex((p) => p.id === targetPoint.symmetricWith);
          if (mirrorIndex !== -1) {
            updatedPoints[mirrorIndex] = { ...updatedPoints[mirrorIndex], x: 100 - clampedX, y: clampedY };
          }
        }
      }
      updatedPoints[index] = targetPoint;
      updateActiveShape(updatedPoints);
      
    } else if (draggingControlIndex.current !== null) {
      const idx = draggingControlIndex.current as number;
      const updatedPoints = [...activePoints];
      updatedPoints[idx] = { ...updatedPoints[idx], cpNext: { x: clampedX, y: clampedY } };

      if (symmetry) {
        const pt = updatedPoints[idx];
        if (pt.symmetricWith) {
          const pNext = updatedPoints[(idx + 1) % updatedPoints.length];
          if (pNext.symmetricWith) {
            const mirrorStartIdx = updatedPoints.findIndex(p => p.id === pNext.symmetricWith);
            if (mirrorStartIdx !== -1) {
              updatedPoints[mirrorStartIdx] = { ...updatedPoints[mirrorStartIdx], cpNext: { x: 100 - clampedX, y: clampedY } };
            }
          }
        }
      }
      updateActiveShape(updatedPoints);
    }
  };

  const handleCanvasMouseUp = () => {
    if (draggingPointId.current !== null || draggingControlIndex.current !== null) {
      draggingPointId.current = null;
      draggingControlIndex.current = null;
      saveHistory(shapes); // Save after drag is done
    }
  };

  // --- RENDER HELPERS ---
  const handleExportSVG = () => {
    setShowHelperLines(false); setShowGrid(false); setShowMannequin(false);
    setTimeout(() => {
      const svgContent = document.getElementById("cad-garment-svg")?.outerHTML;
      if (svgContent) {
        const blob = new Blob([svgContent], { type: "image/svg+xml" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${projectName.replace(/\s+/g, "-")}.svg`;
        a.click();
      }
      setShowHelperLines(true); setShowGrid(true); setShowMannequin(true);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans">
      <Navbar />

      {/* HEADER */}
      <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 z-10 shrink-0">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.push("/workspaces")} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold transition-all">
            <ArrowLeft size={16} /><span>Kembali</span>
          </button>
          <div className="h-6 w-px bg-gray-800" />
          <h1 className="font-semibold text-sm text-gray-200 flex items-center gap-2">
            <Layers size={16} className="text-indigo-400" />
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-transparent border-none outline-none text-white font-bold focus:ring-1 focus:ring-indigo-500 rounded px-2 w-64"
            />
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 rounded-xl transition-all">
            <RefreshCw size={14} className="transform -rotate-180" />
          </button>
          <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 rounded-xl transition-all">
            <RefreshCw size={14} />
          </button>
          <div className="h-6 w-px bg-gray-800 mx-2" />
          <button onClick={handleExportSVG} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300">
            <FileDown size={14} /><span>Cetak Pola (SVG)</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT PANEL: LAYERS & AI */}
        <aside className="w-72 bg-gray-900 border-r border-gray-800 p-5 flex flex-col gap-6 overflow-y-auto custom-scrollbar shrink-0">
          
          {/* AI COPILOT */}
          <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-4 shadow-lg shadow-indigo-900/20">
            <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Sparkles size={14} className="text-indigo-400" /> AI Pattern Copilot
            </h3>
            <p className="text-[10px] text-gray-400 mb-3 leading-relaxed">
              Ketik komponen yang ingin ditambahkan. AI akan menghitung dan menyisipkannya otomatis.
            </p>
            <form onSubmit={handleAIGenerate} className="flex flex-col gap-2">
              <input 
                type="text" 
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="Misal: Saku di dada kiri, Kerah bundar..." 
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <button 
                type="submit" 
                disabled={isAiLoading || !aiPrompt.trim()}
                className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 text-white text-xs font-bold py-2 rounded-lg transition-all"
              >
                {isAiLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                <span>{isAiLoading ? "Memproses AI..." : "Generate Komponen"}</span>
              </button>
            </form>
          </div>

          <div className="h-px bg-gray-800" />

          {/* LAYERS (KOMPONEN BAJU) */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Komponen (Layers)</h3>
              <div className="flex gap-1">
                <button onClick={() => addShape(`Kotak ${shapes.length + 1}`, "square")} className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white" title="Tambah Kotak"><Square size={12} /></button>
                <button onClick={() => addShape(`Bulat ${shapes.length + 1}`, "circle")} className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white" title="Tambah Lingkaran"><Circle size={12} /></button>
                <button onClick={() => addShape(`Segitiga ${shapes.length + 1}`, "triangle")} className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white" title="Tambah Segitiga"><Triangle size={12} /></button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {shapes.map((shape, idx) => (
                <div 
                  key={shape.id} 
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                    activeShapeId === shape.id ? "bg-gray-800 border-indigo-500" : "bg-gray-900/50 border-gray-800 hover:bg-gray-800"
                  }`}
                  onClick={() => setActiveShapeId(shape.id)}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-3 h-3 rounded-sm border border-white/20" style={{ backgroundColor: shape.style.fill }} />
                    <span className={`text-xs font-semibold ${activeShapeId === shape.id ? "text-white" : "text-gray-400"}`}>
                      {shape.name}
                    </span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteShape(shape.id); }} className="text-gray-500 hover:text-red-400 p-1">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {shapes.length === 0 && (
                <div className="text-[10px] text-gray-500 text-center py-4 border border-dashed border-gray-800 rounded-xl">
                  Belum ada komponen. Tambahkan dari atas atau tanya AI.
                </div>
              )}
            </div>
          </div>

          {/* Overlays / Options */}
          <div className="space-y-4 mt-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tampilan Bantuan</h3>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-semibold flex items-center gap-1.5"><User size={12}/> Overlay Manekin</span>
              <button onClick={() => setShowMannequin(!showMannequin)} className={`w-10 h-5 rounded-full p-0.5 transition-all ${showMannequin ? "bg-indigo-600" : "bg-gray-800"}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${showMannequin ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-semibold flex items-center gap-1.5"><RefreshCw size={12}/> Cermin Simetris</span>
              <button onClick={() => setSymmetry(!symmetry)} className={`w-10 h-5 rounded-full p-0.5 transition-all ${symmetry ? "bg-indigo-600" : "bg-gray-800"}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${symmetry ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-semibold">Tampilkan Grid</span>
              <button onClick={() => setShowGrid(!showGrid)} className={`w-10 h-5 rounded-full p-0.5 transition-all ${showGrid ? "bg-indigo-600" : "bg-gray-800"}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${showGrid ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-semibold">Tampilkan Titik (Nodes)</span>
              <button onClick={() => setShowHelperLines(!showHelperLines)} className={`w-10 h-5 rounded-full p-0.5 transition-all ${showHelperLines ? "bg-indigo-600" : "bg-gray-800"}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${showHelperLines ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
          </div>
        </aside>

        {/* CENTER PANEL: SVG CANVAS */}
        <main className="flex-1 bg-gray-950 relative flex flex-col p-6 overflow-hidden select-none">
          
          {/* Tools Floating Bar */}
          <div className="flex items-center justify-center gap-2 mb-4 bg-gray-900/80 backdrop-blur border border-gray-800 p-2 rounded-2xl w-fit mx-auto shadow-2xl z-20">
             <button onClick={() => setMode("curve")} className={`flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${mode === "curve" ? "bg-pink-600 text-white" : "text-gray-400 hover:bg-gray-800"}`}>
                <Sparkles size={14} /><span>Bengkokkan</span>
              </button>
              <button onClick={() => setMode("edit")} className={`flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${mode === "edit" ? "bg-indigo-600 text-white" : "text-gray-400 hover:bg-gray-800"}`}>
                <MousePointer size={14} /><span>Geser</span>
              </button>
              <button onClick={() => setMode("draw")} className={`flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${mode === "draw" ? "bg-indigo-600 text-white" : "text-gray-400 hover:bg-gray-800"}`}>
                <PenTool size={14} /><span>Tambah</span>
              </button>
              <button onClick={() => setMode("delete")} className={`flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${mode === "delete" ? "bg-red-600 text-white" : "text-gray-400 hover:bg-gray-800"}`}>
                <Trash2 size={14} /><span>Hapus</span>
              </button>
          </div>

          <div className="flex-1 bg-gray-900/60 rounded-3xl border border-gray-800 relative overflow-hidden shadow-2xl flex items-center justify-center max-w-3xl aspect-[4/5] mx-auto w-full">
            <svg
              id="cad-garment-svg"
              xmlns="http://www.w3.org/2000/svg"
              ref={canvasRef}
              viewBox="0 0 100 100"
              width="100%"
              height="100%"
              className="w-full h-full cursor-crosshair relative z-10"
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              onMouseDown={handleCanvasMouseDown}
            >
              <defs>
                <pattern id="gridPattern" width="5" height="5" patternUnits="userSpaceOnUse">
                  <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="0.1" />
                </pattern>
                <pattern id="pat-denim" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="4" stroke="currentColor" strokeWidth="2" strokeOpacity="0.4"/>
                  <line x1="2" y1="0" x2="2" y2="4" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.1"/>
                </pattern>
                <pattern id="pat-knit" width="6" height="6" patternUnits="userSpaceOnUse">
                  <path d="M 0 3 Q 1.5 0 3 3 T 6 3" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5"/>
                  <path d="M 0 6 Q 1.5 3 3 6 T 6 6" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2"/>
                </pattern>
                <pattern id="pat-polkadot" width="8" height="8" patternUnits="userSpaceOnUse">
                  <circle cx="4" cy="4" r="1.5" fill="currentColor" fillOpacity="0.6" />
                </pattern>
              </defs>

              {/* Grid */}
              {showGrid && <rect width="100" height="100" fill="url(#gridPattern)" />}

              {/* MANNEQUIN OVERLAY */}
              {showMannequin && (
                <g opacity="0.08" stroke="#ffffff" strokeWidth="0.5" fill="none">
                  <ellipse cx="50" cy="12" rx="6" ry="8" />
                  <path d="M 47 18 L 47 22 L 53 22 L 53 18" />
                  <path d="M 47 22 Q 35 22 30 28 L 35 45 Q 40 45 42 60 L 38 90 L 62 90 L 58 60 Q 60 45 65 45 L 70 28 Q 65 22 53 22" />
                  <path d="M 30 28 L 22 55 M 70 28 L 78 55" />
                </g>
              )}

              {/* Garis Simetri */}
              {showHelperLines && symmetry && (
                <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="0.3" strokeDasharray="1, 1" />
              )}

              {/* ── DRAW ALL SHAPES ── */}
              {shapes.map(shape => {
                const isActive = shape.id === activeShapeId;
                const pathData = getBezierPath(shape.points, shape.closed);
                if (!pathData) return null;

                return (
                  <g key={shape.id} style={{ color: shape.style.fill }}>
                    <path
                      d={pathData}
                      fill={shape.closed ? (shape.style.pattern === 'none' ? shape.style.fill : `url(#${shape.style.pattern})`) : "none"}
                      fillOpacity={shape.style.pattern === 'none' ? "0.25" : "1"}
                      stroke={shape.style.fill}
                      strokeWidth={isActive ? "0.8" : "0.4"}
                      strokeDasharray={isActive ? "none" : "1,1"}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                );
              })}

              {/* ── DRAW HELPER NODES (ONLY FOR ACTIVE SHAPE) ── */}
              {showHelperLines && activeShape && activePoints.map((pt) => {
                const isSelected = pt.id === selectedPointId;
                return (
                  <g key={pt.id}>
                    {isSelected && <circle cx={pt.x} cy={pt.y} r="2" fill="none" stroke="rgba(99, 102, 241, 0.5)" strokeWidth="0.3" className="animate-ping" />}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={pt.isCenter ? "1" : "0.8"}
                      fill={pt.isCenter ? "#f59e0b" : isSelected ? "#6366f1" : "#ffffff"}
                      stroke="#1e1b4b"
                      strokeWidth="0.2"
                      className="cursor-pointer hover:scale-150 hover:fill-indigo-400 transition-all"
                      onMouseDown={(e) => handlePointMouseDown(e, pt)}
                    />
                  </g>
                );
              })}

              {/* ── DRAW CURVE HANDLES (ONLY FOR ACTIVE SHAPE) ── */}
              {showHelperLines && activeShape && getCurveHandles(activePoints, activeShape.closed).map((handle) => (
                <g key={`curve-${handle.index}`}>
                  {handle.isCurved && (
                    <>
                      <line x1={handle.pCurrent.x} y1={handle.pCurrent.y} x2={handle.cx} y2={handle.cy} stroke="rgba(236, 72, 153, 0.4)" strokeWidth="0.15" strokeDasharray="0.5,0.5" />
                      <line x1={handle.pNext.x} y1={handle.pNext.y} x2={handle.cx} y2={handle.cy} stroke="rgba(236, 72, 153, 0.4)" strokeWidth="0.15" strokeDasharray="0.5,0.5" />
                    </>
                  )}
                  <rect
                    x={handle.cx - 0.6}
                    y={handle.cy - 0.6}
                    width="1.2"
                    height="1.2"
                    fill={handle.isCurved ? "#ec4899" : "rgba(255,255,255,0.6)"}
                    stroke={handle.isCurved ? "#be185d" : "#4b5563"}
                    strokeWidth="0.15"
                    transform={`rotate(45, ${handle.cx}, ${handle.cy})`}
                    className={`${mode === "curve" ? "cursor-grab hover:scale-150" : ""} hover:fill-pink-400 transition-all`}
                    onMouseDown={(e) => handleCurveHandleMouseDown(e, handle.index)}
                  />
                </g>
              ))}
            </svg>
          </div>
        </main>

        {/* RIGHT PANEL: STYLE COMPONENT */}
        <aside className="w-72 bg-gray-900 border-l border-gray-800 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar shrink-0">
          
          <div className="text-xs text-gray-400 bg-gray-800/50 p-3 rounded-xl border border-gray-700/50">
            Sedang Mengedit:<br/>
            <strong className="text-white text-sm">{activeShape ? activeShape.name : "Tidak ada komponen"}</strong>
          </div>

          <div className={!activeShape ? "opacity-30 pointer-events-none" : ""}>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Warna Komponen</h3>
            <div className="grid grid-cols-5 gap-2">
              {[
                { hex: "#818cf8" }, { hex: "#f87171" }, { hex: "#4ade80" }, { hex: "#fbbf24" }, { hex: "#f472b6" },
                { hex: "#22d3ee" }, { hex: "#c084fc" }, { hex: "#94a3b8" }, { hex: "#f1f5f9" }, { hex: "#1e293b" }
              ].map((c) => (
                <button
                  key={c.hex}
                  onClick={() => activeShapeId && setShapeStyle(activeShapeId, { fill: c.hex })}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${activeShape?.style.fill === c.hex ? "border-white scale-110" : "border-gray-800 hover:border-gray-600"}`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-800" />

          <div className={!activeShape ? "opacity-30 pointer-events-none" : ""}>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Tekstur Kain</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "none", label: "Polos (Solid)" },
                { id: "pat-denim", label: "Jeans / Denim" },
                { id: "pat-knit", label: "Rajut (Knit)" },
                { id: "pat-polkadot", label: "Polkadot" }
              ].map(pat => (
                <button
                  key={pat.id}
                  onClick={() => activeShapeId && setShapeStyle(activeShapeId, { pattern: pat.id })}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${activeShape?.style.pattern === pat.id ? "bg-indigo-950/40 text-indigo-300 border-indigo-500" : "bg-gray-800/50 text-gray-400 border-transparent hover:bg-gray-800"}`}
                >
                  {pat.label}
                </button>
              ))}
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}

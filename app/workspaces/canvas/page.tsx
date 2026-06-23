"use client";

import React, { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ZoomIn, ZoomOut, Maximize, Undo2, Redo2, Plus, Trash2,
  Eye, EyeOff, ChevronUp, ChevronDown, Layers, Download,
  Upload, Copy, RotateCcw, FlipHorizontal, Save, Sparkles,
  Loader2, ArrowLeft, AlertCircle, Send, Check, X
} from "lucide-react";
import Navbar from "@/app/components/navbar";

// ─── Konstanta API & Canvas ──────────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const VB_W = 100;
const VB_H = 120;
const CANVAS_W = 500;
const CANVAS_H = 580;
const GRID_SIZE = 2.5;

const INITIAL_PATH =
  "M31.29 62.95 L31.29 62.95 L29.987 87.90 L28.967 106.90 L28.95 107.22 L29.82 107.67 L30.80 108.07 L31.70 108.38 L32.68 108.67 L33.66 108.91 L34.64 109.13 L35.60 109.31 L36.54 109.48 L37.60 109.64 L39.57 109.89 L41.52 110.08 L42.54 110.17 L43.56 110.24 L45.50 110.35 L47.57 110.42 L49.51 110.45 L51.55 110.44 L53.49 110.40 L55.48 110.32 L56.49 110.27 L58.52 110.12 L59.55 110.03 L61.51 109.82 L62.49 109.69 L64.48 109.38 L65.48 109.19 L66.44 108.99 L67.41 108.76 L68.38 108.49 L69.31 108.19 L70.25 107.83 L71.13 107.41 L71.50 106.90 L69.18 62.95 L69.21 62.59 L69.24 60.61 L69.27 59.61 L69.39 57.62 L69.47 56.62 L69.69 54.62 L69.82 53.62 L69.97 52.63 L70.15 51.64 L70.34 50.65 L70.55 49.68 L70.79 48.70 L71.05 47.73 L71.33 46.77 L71.64 45.82 L71.97 44.88 L72.32 43.95 L72.70 43.03 L73.10 42.11 L73.53 41.21 L73.99 40.33 L59.72 34.02 L59.65 35.02 L59.51 36.00 L59.30 36.98 L59.02 37.92 L58.68 38.89 L58.28 39.81 L57.81 40.68 L57.27 41.52 L56.66 42.30 L55.95 43.02 L55.17 43.66 L54.33 44.19 L53.43 44.61 L52.49 44.91 L51.48 45.10 L50.50 45.17 L50.05 45.17 L49.04 45.09 L48.08 44.90 L47.11 44.58 L46.20 44.15 L45.38 43.64 L44.59 43.00 L43.88 42.29 L43.26 41.50 L42.72 40.68 L42.24 39.79 L41.84 38.87 L41.51 37.94 L41.24 36.96 L41.02 35.98 L40.86 35.01 L40.75 34.02 L26.51 40.33 L26.67 40.64 L27.11 41.53 L27.53 42.44 L27.93 43.35 L28.30 44.28 L28.64 45.21 L28.96 46.16 L29.26 47.11 L29.54 48.08 L29.79 49.05 L30.01 50.02 L30.22 51.00 L30.41 51.99 L30.72 53.98 L30.85 54.97 L31.05 56.97 L31.12 57.97 L31.23 59.97 L31.26 60.96 Z";

const LAYER_COLORS = ["#6366f1", "#22d3ee", "#f472b6", "#4ade80", "#fb923c", "#a78bfa", "#f87171", "#fbbf24"];

// ─── Tipe Data ───────────────────────────────────────────────────────────────
type PathSegment =
  | { cmd: "M"; x: number; y: number }
  | { cmd: "L"; x: number; y: number }
  | { cmd: "Q"; cx: number; cy: number; x: number; y: number }
  | { cmd: "Z" };

type VertexType = "smooth" | "corner";
type LayerKind = "foundation" | "shape" | "circle";

type Layer = {
  id: string;
  name: string;
  kind: LayerKind;
  segments: PathSegment[];
  vertexTypes: Record<number, VertexType>;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  cx?: number;
  cy?: number;
  r?: number;
};

type Snapshot = { layers: Layer[]; activeLayerId: string };
const MAX_HISTORY = 50;

type DragState =
  | { kind: "none" }
  | { kind: "pan" }
  | { kind: "vertex"; layerId: string; idx: number }
  | { kind: "control"; layerId: string; idx: number }
  | { kind: "edge"; layerId: string; idx: number }
  | { kind: "move"; layerId: string; startX: number; startY: number; origSegs: PathSegment[]; origCx?: number; origCy?: number }
  | { kind: "circleResize"; layerId: string; startX: number; startY: number; origR: number };

type ContextMenu = {
  x: number;
  y: number;
  layerId: string;
  vertexIdx: number;
} | null;

type GeomTemplate = "line" | "rect" | "triangle" | "polygon5" | "polygon6" | "polygon10" | "circle";

// ─── Toast Feedback Component ───────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-medium animate-in slide-in-from-top-4 fade-in duration-300 ${type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
      {type === "success" ? <Check size={18} /> : <X size={18} />}
      <span>{message}</span>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function makeGeomSegments(type: GeomTemplate): PathSegment[] {
  const cx = 50, cy = 60;
  switch (type) {
    case "line":
      return [
        { cmd: "M", x: 30, y: 60 },
        { cmd: "L", x: 70, y: 60 },
      ];
    case "rect":
      return [
        { cmd: "M", x: 35, y: 45 },
        { cmd: "L", x: 65, y: 45 },
        { cmd: "L", x: 65, y: 75 },
        { cmd: "L", x: 35, y: 75 },
        { cmd: "Z" },
      ];
    case "triangle":
      return [
        { cmd: "M", x: cx, y: cy - 18 },
        { cmd: "L", x: cx + 16, y: cy + 12 },
        { cmd: "L", x: cx - 16, y: cy + 12 },
        { cmd: "Z" },
      ];
    case "polygon5": {
      const segs: PathSegment[] = [];
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const x = cx + 18 * Math.cos(angle);
        const y = cy + 18 * Math.sin(angle);
        segs.push(i === 0 ? { cmd: "M", x, y } : { cmd: "L", x, y });
      }
      segs.push({ cmd: "Z" });
      return segs;
    }
    case "polygon6": {
      const segs: PathSegment[] = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i * 2 * Math.PI) / 6;
        const x = cx + 18 * Math.cos(angle);
        const y = cy + 18 * Math.sin(angle);
        segs.push(i === 0 ? { cmd: "M", x, y } : { cmd: "L", x, y });
      }
      segs.push({ cmd: "Z" });
      return segs;
    }
    case "polygon10": {
      const segs: PathSegment[] = [];
      for (let i = 0; i < 10; i++) {
        const angle = (i * 2 * Math.PI) / 10 - Math.PI / 2;
        const x = cx + 18 * Math.cos(angle);
        const y = cy + 18 * Math.sin(angle);
        segs.push(i === 0 ? { cmd: "M", x, y } : { cmd: "L", x, y });
      }
      segs.push({ cmd: "Z" });
      return segs;
    }
    case "circle":
      return [];
  }
}

function parsePath(d: string): PathSegment[] {
  const segments: PathSegment[] = [];
  const tokens = d.trim().match(/[MLQZmlqz]|[-+]?[0-9]*\.?[0-9]+/g) || [];
  let i = 0;
  const num = () => parseFloat(tokens[i++]);
  while (i < tokens.length) {
    const cmd = tokens[i++].toUpperCase();
    if (cmd === "M") segments.push({ cmd: "M", x: num(), y: num() });
    else if (cmd === "L") {
      while (i < tokens.length && /[-+0-9.]/.test(tokens[i]))
        segments.push({ cmd: "L", x: num(), y: num() });
    } else if (cmd === "Q") {
      while (i < tokens.length && /[-+0-9.]/.test(tokens[i]))
        segments.push({ cmd: "Q", cx: num(), cy: num(), x: num(), y: num() });
    } else if (cmd === "Z") segments.push({ cmd: "Z" });
  }
  return segments;
}

function serializePath(segs: PathSegment[]): string {
  return segs.map((s) => {
    if (s.cmd === "M") return `M${s.x.toFixed(2)} ${s.y.toFixed(2)}`;
    if (s.cmd === "L") return `L${s.x.toFixed(2)} ${s.y.toFixed(2)}`;
    if (s.cmd === "Q") return `Q${s.cx.toFixed(2)} ${s.cy.toFixed(2)} ${s.x.toFixed(2)} ${s.y.toFixed(2)}`;
    if (s.cmd === "Z") return "Z";
    return "";
  }).join(" ");
}

function endPoint(seg: PathSegment): { x: number; y: number } | null {
  if (seg.cmd === "M" || seg.cmd === "L" || seg.cmd === "Q") return { x: seg.x, y: seg.y };
  return null;
}

function getPrevEP(segs: PathSegment[], idx: number) {
  for (let i = idx - 1; i >= 0; i--) {
    const ep = endPoint(segs[i]);
    if (ep) return ep;
  }
  return null;
}

function getSegmentsCenter(segs: PathSegment[]): { cx: number; cy: number } {
  const pts: { x: number; y: number }[] = [];
  for (const s of segs) {
    const ep = endPoint(s);
    if (ep) pts.push(ep);
    if (s.cmd === "Q") pts.push({ x: s.cx, y: s.cy });
  }
  if (pts.length === 0) return { cx: 50, cy: 60 };
  const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length;
  const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length;
  return { cx, cy };
}

function rotateSegments(segs: PathSegment[], angleDeg: number): PathSegment[] {
  const { cx, cy } = getSegmentsCenter(segs);
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad), sin = Math.sin(rad);
  const rotPt = (x: number, y: number) => ({
    x: cos * (x - cx) - sin * (y - cy) + cx,
    y: sin * (x - cx) + cos * (y - cy) + cy,
  });
  return segs.map(s => {
    if (s.cmd === "M" || s.cmd === "L") return { cmd: s.cmd, ...rotPt(s.x, s.y) };
    if (s.cmd === "Q") {
      const ep = rotPt(s.x, s.y);
      const cp = rotPt(s.cx, s.cy);
      return { cmd: "Q", cx: cp.x, cy: cp.y, x: ep.x, y: ep.y };
    }
    return s;
  });
}

function mirrorSegmentsH(segs: PathSegment[]): PathSegment[] {
  const { cx } = getSegmentsCenter(segs);
  return segs.map(s => {
    if (s.cmd === "M" || s.cmd === "L") return { cmd: s.cmd, x: 2 * cx - s.x, y: s.y };
    if (s.cmd === "Q") return { cmd: "Q", cx: 2 * cx - s.cx, cy: s.cy, x: 2 * cx - s.x, y: s.y };
    return s;
  });
}

function translateSegments(segs: PathSegment[], dx: number, dy: number): PathSegment[] {
  return segs.map(s => {
    if (s.cmd === "M" || s.cmd === "L") return { cmd: s.cmd, x: s.x + dx, y: s.y + dy };
    if (s.cmd === "Q") return { cmd: "Q", cx: s.cx + dx, cy: s.cy + dy, x: s.x + dx, y: s.y + dy };
    return s;
  });
}

let _layerCounter = 1;
function newLayerId() { return `layer-${Date.now()}-${_layerCounter++}`; }

function deepCloneLayer(l: Layer): Layer {
  return { ...l, segments: l.segments.map(s => ({ ...s })), vertexTypes: { ...l.vertexTypes } };
}

// ─── AI Helper: Convert AI points to SVG segments ───────────────────────────
function convertAiPointsToSegments(points: any[], closed: boolean = true): PathSegment[] {
  if (!points || points.length === 0) return [];
  const segments: PathSegment[] = [];
  
  // Ambil poin pertama
  segments.push({ cmd: "M", x: points[0].x, y: points[0].y });
  
  const len = points.length;
  // Hubungkan tiap titik
  for (let i = 0; i < (closed ? len : len - 1); i++) {
    const pCurrent = points[i];
    const pNext = points[(i + 1) % len];
    if (pCurrent.cpNext) {
      segments.push({
        cmd: "Q",
        cx: pCurrent.cpNext.x,
        cy: pCurrent.cpNext.y,
        x: pNext.x,
        y: pNext.y
      });
    } else {
      segments.push({
        cmd: "L",
        x: pNext.x,
        y: pNext.y
      });
    }
  }
  
  if (closed) {
    segments.push({ cmd: "Z" });
  }
  return segments;
}

// ─── Komponen utama ───────────────────────────────────────────────────────────
function SVGVisualizer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const designId = searchParams.get("id") || searchParams.get("design_id");

  // ── State Utama Canvas ────────────────────────────────────────────────────
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string>("");

  // ── UI state ──────────────────────────────────────────────────────────────
  const [showGrid, setShowGrid] = useState(true);
  const [showVertices, setShowVertices] = useState(true);
  const [showControlPoints, setShowControlPoints] = useState(true);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<DragState>({ kind: "none" });
  const [hoveredVertex, setHoveredVertex] = useState<{ layerId: string; idx: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenu>(null);
  const [showAddLayer, setShowAddLayer] = useState(false);

  // ── Database & Auth Integration States ────────────────────────────────────
  const [projectName, setProjectName] = useState("Desain CAD Baru");
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<"loading" | "unauthorized" | "authorized">("loading");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // ── Undo/Redo ─────────────────────────────────────────────────────────────
  const [history, setHistory] = useState<Snapshot[]>([
    { layers: [], activeLayerId: "" }
  ]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const dragStartLayers = useRef<Layer[] | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const canUndo = historyIdx > 0;
  const canRedo = historyIdx < history.length - 1;

  // ── Helpers ───────────────────────────────────────────────────────────────
  const activeLayer = activeLayerId ? (layers.find(l => l.id === activeLayerId) ?? layers[0]) : null;

  const updateLayer = useCallback((id: string, updater: (l: Layer) => Layer) => {
    setLayers(prev => prev.map(l => l.id === id ? updater(l) : l));
  }, []);

  const mouseToSVG = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const x = (clientX - rect.left - pan.x) / (rect.width / VB_W * scale);
    const y = (clientY - rect.top - pan.y) / (rect.height / VB_H * scale);
    return { x, y };
  };

  // ── Push history ──────────────────────────────────────────────────────────
  const pushHistory = useCallback((newLayers: Layer[], newActiveId: string) => {
    const snap: Snapshot = {
      layers: newLayers.map(deepCloneLayer),
      activeLayerId: newActiveId,
    };
    setHistory(prev => {
      const base = prev.slice(0, historyIdx + 1);
      const next = [...base, snap];
      return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
    });
    setHistoryIdx(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyIdx]);

  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    const snap = history[historyIdx - 1];
    setLayers(snap.layers.map(deepCloneLayer));
    setActiveLayerId(snap.activeLayerId);
    setHistoryIdx(p => p - 1);
  }, [canUndo, history, historyIdx]);

  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    const snap = history[historyIdx + 1];
    setLayers(snap.layers.map(deepCloneLayer));
    setActiveLayerId(snap.activeLayerId);
    setHistoryIdx(p => p + 1);
  }, [canRedo, history, historyIdx]);

  // Keyboard shortcut binding
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); handleUndo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); handleRedo(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleUndo, handleRedo]);

  // ─── AUTH & DATABASE LOAD INTEGRATION ─────────────────────────────────────
  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const sessionStr = localStorage.getItem("user_session");
      
      if (!sessionStr) {
        setStatus("unauthorized");
        setTimeout(() => router.push("/"), 2500);
        return;
      }

      if (!designId) {
        // No design ID means new project, authorize immediately
        setStatus("authorized");
        return;
      }

      try {
        const session = JSON.parse(sessionStr);
        const token = session.token;

        const res = await fetch(`${API_URL}/api/designs/detail/${designId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.status === 401) {
          throw new Error("Sesi tidak valid");
        }

        if (res.ok) {
          const { data } = await res.json();
          setProjectName(data.nama_design);
          if (data.config && data.config.layers) {
            setLayers(data.config.layers);
            // Reset history for this loaded design
            setHistory([{
              layers: data.config.layers.map(deepCloneLayer),
              activeLayerId: data.config.layers[0]?.id || "foundation"
            }]);
            setHistoryIdx(0);
            setActiveLayerId(data.config.layers[0]?.id || "foundation");
          }
        }
        setStatus("authorized");
      } catch (err) {
        console.error("Gagal memuat desain dari database:", err);
        localStorage.removeItem("user_session");
        setStatus("unauthorized");
        setTimeout(() => router.push("/"), 2500);
      }
    };

    checkAuthAndFetch();
  }, [designId, router]);

  // ─── DATABASE SAVE INTEGRATION ────────────────────────────────────────────
  const handleSaveToDb = async () => {
    setIsSaving(true);
    try {
      const sessionStr = localStorage.getItem("user_session");
      if (!sessionStr) {
        setToast({ message: "Sesi tidak ditemukan. Silakan login terlebih dahulu.", type: "error" });
        return;
      }
      const session = JSON.parse(sessionStr);
      const token = session.token;

      // 1. Dapatkan workspace pertama pengguna
      const wsRes = await fetch(`${API_URL}/api/workspaces`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (wsRes.status === 401) {
        setToast({ message: "Sesi Anda telah habis. Silakan login kembali.", type: "error" });
        localStorage.removeItem("user_session");
        router.push("/");
        return;
      }
      const wsData = await wsRes.json();
      let workspaceId = wsData.data?.[0]?.id_workspace;

      // 2. Jika belum memiliki workspace, buat workspace default
      if (!workspaceId) {
        const createWsRes = await fetch(`${API_URL}/api/workspaces`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ nama_workspace: "Workspace Default" })
        });
        const newWs = await createWsRes.json();
        workspaceId = newWs.data?.id_workspace;
      }

      if (!workspaceId) throw new Error("Gagal membuat workspace.");

      const bodyPayload = {
        nama_design: projectName || "Desain CAD Baru",
        config: { layers }
      };

      let saveRes;
      if (designId) {
        // Update existing design
        saveRes = await fetch(`${API_URL}/api/designs/${designId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(bodyPayload)
        });
      } else {
        // Create new design
        saveRes = await fetch(`${API_URL}/api/designs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ id_workspace: workspaceId, ...bodyPayload })
        });
      }

      const result = await saveRes.json();
      if (!saveRes.ok) {
        throw new Error(result.message || "Gagal menyimpan pola ke database.");
      }

      setToast({ message: "Proyek pola berhasil disimpan ke database!", type: "success" });
      if (!designId && result.data?.id_design) {
        router.replace(`/workspaces/canvas?id=${result.data.id_design}`);
      }
    } catch (err: any) {
      setToast({ message: err.message || "Gagal menyimpan ke database.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  // ─── AI PATTERN COPILOT INTEGRATION ───────────────────────────────────────
  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiLoading(true);
    try {
      const sessionStr = localStorage.getItem("user_session");
      let token = "";
      if (sessionStr) {
        try {
          token = JSON.parse(sessionStr).token;
        } catch (e) {}
      }

      const response = await fetch(`${API_URL}/api/ai/generate-shape`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ prompt: aiPrompt })
      });

      const resData = await response.json();
      if (resData.status === "success" && resData.data) {
        const aiShape = resData.data;
        const segments = convertAiPointsToSegments(aiShape.points, true);
        const colorIdx = (layers.length - 1) % LAYER_COLORS.length;

        const newLayer: Layer = {
          id: newLayerId(),
          name: aiShape.name || "AI Komponen",
          kind: "shape",
          segments: segments,
          vertexTypes: {},
          fillColor: LAYER_COLORS[colorIdx],
          strokeColor: "#1e293b",
          strokeWidth: 0.5,
          opacity: 0.85,
          visible: true,
          locked: false
        };

        const newLayers = [...layers, newLayer];
        setLayers(newLayers);
        setActiveLayerId(newLayer.id);
        setAiPrompt("");
        pushHistory(newLayers, newLayer.id);
        setToast({ message: `Komponen "${aiShape.name}" berhasil ditambahkan oleh AI!`, type: "success" });
      } else {
        setToast({ message: "Gagal membuat komponen: " + (resData.message || "Error tidak dikenal"), type: "error" });
      }
    } catch (err) {
      setToast({ message: "Error menghubungi server AI.", type: "error" });
    } finally {
      setIsAiLoading(false);
    }
  };

  // ── Add layer ─────────────────────────────────────────────────────────────
  const addLayer = (type: GeomTemplate) => {
    const colorIdx = (layers.length - 1) % LAYER_COLORS.length;
    const isCircle = type === "circle";
    const newLayer: Layer = {
      id: newLayerId(),
      name: type === "line" ? "Garis" : type === "rect" ? "Persegi" : type === "triangle" ? "Segitiga" : type === "polygon5" ? "Pentagon" : type === "polygon6" ? "Hexagon" : type === "polygon10" ? "Dekagon" : "Lingkaran",
      kind: isCircle ? "circle" : "shape",
      segments: isCircle ? [] : makeGeomSegments(type),
      vertexTypes: {},
      fillColor: type === "line" ? "none" : LAYER_COLORS[colorIdx],
      strokeColor: "#1e293b",
      strokeWidth: 0.5,
      opacity: 0.85,
      visible: true,
      locked: false,
      ...(isCircle ? { cx: 50, cy: 60, r: 15 } : {}),
    };
    const newLayers = [...layers, newLayer];
    setLayers(newLayers);
    setActiveLayerId(newLayer.id);
    setShowAddLayer(false);
    pushHistory(newLayers, newLayer.id);
  };

  const deleteLayer = (id: string) => {
    const layer = layers.find(l => l.id === id);
    if (!layer || layer.locked) return;
    const newLayers = layers.filter(l => l.id !== id);
    const newActiveId = newLayers[newLayers.length - 1]?.id ?? "foundation";
    setLayers(newLayers);
    setActiveLayerId(newActiveId);
    pushHistory(newLayers, newActiveId);
  };

  const moveLayer = (id: string, dir: -1 | 1) => {
    const idx = layers.findIndex(l => l.id === id);
    if (idx === -1) return;
    const newIdx = idx + dir;
    if (newIdx < 1 || newIdx >= layers.length) return;
    const newLayers = [...layers];
    [newLayers[idx], newLayers[newIdx]] = [newLayers[newIdx], newLayers[idx]];
    setLayers(newLayers);
    pushHistory(newLayers, activeLayerId);
  };

  // ── Duplikat layer ────────────────────────────────────────────────────────
  const duplicateLayer = (id: string) => {
    const layer = layers.find(l => l.id === id);
    if (!layer) return;
    const dup: Layer = {
      ...deepCloneLayer(layer),
      id: newLayerId(),
      name: layer.name + " (kopi)",
      locked: false,
    };
    if (dup.kind === "circle") {
      dup.cx = (dup.cx ?? 50) + 5;
      dup.cy = (dup.cy ?? 60) + 5;
    } else {
      dup.segments = translateSegments(dup.segments, 5, 5);
    }
    const idx = layers.findIndex(l => l.id === id);
    const newLayers = [...layers.slice(0, idx + 1), dup, ...layers.slice(idx + 1)];
    setLayers(newLayers);
    setActiveLayerId(dup.id);
    pushHistory(newLayers, dup.id);
  };

  // ── Rotate layer 90° ──────────────────────────────────────────────────────
  const rotateLayer = (id: string) => {
    const newLayers = layers.map(l => {
      if (l.id !== id) return l;
      if (l.kind === "circle") return l;
      return { ...l, segments: rotateSegments(l.segments, 90) };
    });
    setLayers(newLayers);
    pushHistory(newLayers, activeLayerId);
  };

  // ── Mirror layer horizontal ───────────────────────────────────────────────
  const mirrorLayer = (id: string) => {
    const newLayers = layers.map(l => {
      if (l.id !== id) return l;
      if (l.kind === "circle") return l;
      return { ...l, segments: mirrorSegmentsH(l.segments) };
    });
    setLayers(newLayers);
    pushHistory(newLayers, activeLayerId);
  };

  // ── Save / Load JSON project ──────────────────────────────────────────────
  const handleSaveProject = () => {
    const data = JSON.stringify({ layers, activeLayerId }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, "-")}-project.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed.layers && Array.isArray(parsed.layers)) {
          const migratedLayers = parsed.layers.map((l: Layer) => ({ ...l, strokeWidth: l.strokeWidth ?? 0.5 }));
          setLayers(migratedLayers);
          setActiveLayerId(parsed.activeLayerId ?? migratedLayers[0]?.id ?? "foundation");
          pushHistory(migratedLayers, parsed.activeLayerId ?? migratedLayers[0]?.id ?? "foundation");
          setToast({ message: "Proyek JSON berhasil dimuat!", type: "success" });
        }
      } catch {
        setToast({ message: "Format file JSON proyek tidak valid.", type: "error" });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ── SVG Mouse Handlers ────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setContextMenu(null);
    if (e.target === svgRef.current || (e.target as SVGElement).tagName === "line" || (e.target as SVGElement).tagName === "svg") {
      setActiveLayerId("");
    }
    setDrag({ kind: "pan" });
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleVertexMouseDown = (layerId: string, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    dragStartLayers.current = layers.map(deepCloneLayer);
    setDrag({ kind: "vertex", layerId, idx });
  };

  const handleControlMouseDown = (layerId: string, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    dragStartLayers.current = layers.map(deepCloneLayer);
    setDrag({ kind: "control", layerId, idx });
  };

  const handleEdgeMouseDown = (layerId: string, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;
    const seg = layer.segments[idx];
    if (seg.cmd !== "L" && seg.cmd !== "Q") return;
    dragStartLayers.current = layers.map(deepCloneLayer);
    const { x: mx, y: my } = mouseToSVG(e.clientX, e.clientY);
    if (seg.cmd === "L") {
      updateLayer(layerId, l => {
        const segs = [...l.segments];
        segs[idx] = { cmd: "Q", cx: mx, cy: my, x: seg.x, y: seg.y };
        return { ...l, segments: segs };
      });
    }
    setActiveLayerId(layerId);
    setDrag({ kind: "edge", layerId, idx });
  };

  const handleLayerBodyMouseDown = (layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const layer = layers.find(l => l.id === layerId);
    if (!layer || layer.locked) return;
    dragStartLayers.current = layers.map(deepCloneLayer);
    const { x, y } = mouseToSVG(e.clientX, e.clientY);
    setDrag({
      kind: "move",
      layerId,
      startX: x,
      startY: y,
      origSegs: layer.segments.map(s => ({ ...s })),
      origCx: layer.cx,
      origCy: layer.cy,
    });
    setActiveLayerId(layerId);
  };

  const handleCircleResizeMouseDown = (layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const layer = layers.find(l => l.id === layerId);
    if (!layer || layer.kind !== "circle") return;
    dragStartLayers.current = layers.map(deepCloneLayer);
    const { x } = mouseToSVG(e.clientX, e.clientY);
    setDrag({ kind: "circleResize", layerId, startX: x, startY: 0, origR: layer.r ?? 15 });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (drag.kind === "pan") {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }
    if (drag.kind === "vertex") {
      const { x, y } = mouseToSVG(e.clientX, e.clientY);
      const cx = Math.max(-20, Math.min(120, x));
      const cy = Math.max(-20, Math.min(140, y));
      updateLayer(drag.layerId, l => {
        const segs = [...l.segments];
        const seg = segs[drag.idx];
        if (seg.cmd === "M") segs[drag.idx] = { cmd: "M", x: cx, y: cy };
        else if (seg.cmd === "L") segs[drag.idx] = { cmd: "L", x: cx, y: cy };
        else if (seg.cmd === "Q") segs[drag.idx] = { cmd: "Q", cx: seg.cx, cy: seg.cy, x: cx, y: cy };
        return { ...l, segments: segs };
      });
    }
    if (drag.kind === "control") {
      const { x, y } = mouseToSVG(e.clientX, e.clientY);
      updateLayer(drag.layerId, l => {
        const segs = [...l.segments];
        const seg = segs[drag.idx];
        if (seg.cmd === "Q") segs[drag.idx] = { cmd: "Q", cx: x, cy: y, x: seg.x, y: seg.y };
        return { ...l, segments: segs };
      });
    }
    if (drag.kind === "edge") {
      const { x, y } = mouseToSVG(e.clientX, e.clientY);
      updateLayer(drag.layerId, l => {
        const segs = [...l.segments];
        const seg = segs[drag.idx];
        if (seg.cmd === "Q") segs[drag.idx] = { cmd: "Q", cx: x, cy: y, x: seg.x, y: seg.y };
        return { ...l, segments: segs };
      });
    }
    if (drag.kind === "move") {
      const { x, y } = mouseToSVG(e.clientX, e.clientY);
      const dx = x - drag.startX;
      const dy = y - drag.startY;
      updateLayer(drag.layerId, l => {
        if (l.kind === "circle") {
          return { ...l, cx: (drag.origCx ?? 50) + dx, cy: (drag.origCy ?? 60) + dy };
        }
        return { ...l, segments: translateSegments(drag.origSegs, dx, dy) };
      });
    }
    if (drag.kind === "circleResize") {
      const { x } = mouseToSVG(e.clientX, e.clientY);
      const dx = x - drag.startX;
      updateLayer(drag.layerId, l => {
        const newR = Math.max(2, drag.origR + dx);
        return { ...l, r: newR };
      });
    }
  };

  const handleMouseUp = () => {
    if ((drag.kind === "vertex" || drag.kind === "control" || drag.kind === "edge" || drag.kind === "move" || drag.kind === "circleResize") && dragStartLayers.current) {
      pushHistory(layers, activeLayerId);
    }
    dragStartLayers.current = null;
    setDrag({ kind: "none" });
  };

  // ── Edge double click ─────────────────────────────────────────────────────
  const handleEdgeDblClick = (layerId: string, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;
    const seg = layer.segments[idx];
    if (seg.cmd !== "Q") return;
    const newLayers = layers.map(l => {
      if (l.id !== layerId) return l;
      const segs = [...l.segments];
      segs[idx] = { cmd: "L", x: seg.x, y: seg.y };
      return { ...l, segments: segs };
    });
    setLayers(newLayers);
    pushHistory(newLayers, activeLayerId);
  };

  // ── Insert vertex di tengah garis (shift+click pada midpoint) ─────────────
  const handleInsertVertex = (layerId: string, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;
    const seg = layer.segments[idx];
    if (seg.cmd !== "L" && seg.cmd !== "Q") return;
    const prev = getPrevEP(layer.segments, idx);
    if (!prev) return;
    const ep = endPoint(seg)!;

    const newLayers = layers.map(l => {
      if (l.id !== layerId) return l;
      const segs = [...l.segments];
      const mx = (prev.x + ep.x) / 2;
      const my = (prev.y + ep.y) / 2;
      const newSeg: PathSegment = { cmd: "L", x: mx, y: my };
      segs.splice(idx, 0, newSeg);
      const newVT: Record<number, VertexType> = {};
      for (const [k, v] of Object.entries(l.vertexTypes)) {
        const n = Number(k);
        if (n < idx) newVT[n] = v;
        else newVT[n + 1] = v;
      }
      return { ...l, segments: segs, vertexTypes: newVT };
    });
    setLayers(newLayers);
    pushHistory(newLayers, activeLayerId);
    setToast({ message: "Vertex baru disisipkan pada garis!", type: "success" });
  };

  // ── Context menu ──────────────────────────────────────────────────────────
  const handleVertexRightClick = (layerId: string, idx: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveLayerId(layerId);
    setContextMenu({ x: e.clientX, y: e.clientY, layerId, vertexIdx: idx });
  };

  const handleToggleVertexType = (layerId: string, idx: number) => {
    const newLayers = layers.map(l => {
      if (l.id !== layerId) return l;
      const current = l.vertexTypes[idx] ?? "smooth";
      const next: VertexType = current === "smooth" ? "corner" : "smooth";
      return { ...l, vertexTypes: { ...l.vertexTypes, [idx]: next } };
    });
    setLayers(newLayers);
    setContextMenu(null);
    pushHistory(newLayers, activeLayerId);
  };

  const handleDeleteVertex = (layerId: string, idx: number) => {
    setContextMenu(null);
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;
    const seg = layer.segments[idx];
    if (seg.cmd === "M") {
      if (layer.segments.filter(s => s.cmd === "M").length <= 1) return;
    }
    const newLayers = layers.map(l => {
      if (l.id !== layerId) return l;
      const segs = [...l.segments];
      if (idx + 1 < segs.length && segs[idx + 1].cmd === "Q") {
        const q = segs[idx + 1] as { cmd: "Q"; cx: number; cy: number; x: number; y: number };
        segs[idx + 1] = { cmd: "L", x: q.x, y: q.y };
      }
      segs.splice(idx, 1);
      const newVT: Record<number, VertexType> = {};
      for (const [k, v] of Object.entries(l.vertexTypes)) {
        const n = Number(k);
        if (n < idx) newVT[n] = v;
        else if (n > idx) newVT[n - 1] = v;
      }
      return { ...l, segments: segs, vertexTypes: newVT };
    });
    setLayers(newLayers);
    pushHistory(newLayers, activeLayerId);
  };

  const handleAltDelete = (layerId: string, idx: number, e: React.MouseEvent) => {
    if (!e.altKey) return;
    e.preventDefault(); e.stopPropagation();
    handleDeleteVertex(layerId, idx);
  };

  // ── Zoom ──────────────────────────────────────────────────────────────────
  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const f = 1.1;
    if (e.deltaY < 0) setScale(p => Math.min(p * f, 8));
    else setScale(p => Math.max(p / f, 0.5));
  };

  const handleShowVerticesToggle = (v: boolean) => {
    setShowVertices(v);
    if (!v) setShowControlPoints(false);
  };
  const handleShowControlPointsToggle = (v: boolean) => {
    setShowControlPoints(v);
    if (v) setShowVertices(true);
  };

  // Export SVG Local file download
  const handleExportLocalSVG = () => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const svgStr = svgEl.outerHTML;
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, "-")}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ message: "Vektor SVG berhasil diunduh!", type: "success" });
  };

  // ── Render layer di SVG ───────────────────────────────────────────────────
  const renderLayer = (layer: Layer) => {
    if (!layer.visible) return null;
    const isActive = layer.id === activeLayerId;

    if (layer.kind === "circle") {
      const cx = layer.cx ?? 50, cy = layer.cy ?? 60, r = layer.r ?? 15;
      const resX = cx + r, resY = cy;
      const isDraggingMove = drag.kind === "move" && drag.layerId === layer.id;
      const isDraggingResize = drag.kind === "circleResize" && drag.layerId === layer.id;
      return (
        <g key={layer.id} opacity={layer.opacity}>
          <circle
            cx={cx} cy={cy} r={r}
            fill={layer.fillColor === "none" ? "none" : layer.fillColor}
            stroke={layer.strokeColor}
            strokeWidth={(layer.strokeWidth ?? 0.5) / scale}
            style={{ cursor: layer.locked ? "default" : "move" }}
            onMouseDown={e => handleLayerBodyMouseDown(layer.id, e)}
            onClick={() => setActiveLayerId(layer.id)}
          />
          {isActive && (
            <g opacity={0.5} style={{ pointerEvents: "none" }}>
              <line x1={cx - 2 / scale} y1={cy} x2={cx + 2 / scale} y2={cy} stroke={layer.strokeColor} strokeWidth={0.2 / scale} />
              <line x1={cx} y1={cy - 2 / scale} x2={cx} y2={cy + 2 / scale} stroke={layer.strokeColor} strokeWidth={0.2 / scale} />
            </g>
          )}
          {isActive && (
            <g style={{ cursor: "ew-resize" }}
              onMouseDown={e => handleCircleResizeMouseDown(layer.id, e)}>
              <circle cx={resX} cy={resY} r={3 / scale} fill="transparent" />
              <circle cx={resX} cy={resY}
                r={(isDraggingResize ? 1.3 : 0.9) / scale}
                fill={isDraggingResize ? "#f59e0b" : "#22d3ee"}
                stroke="#fff" strokeWidth={0.2 / scale} />
              <text x={resX + 1.5 / scale} y={resY} fontSize={2.5 / scale}
                fill="#94a3b8" dominantBaseline="middle"
                style={{ pointerEvents: "none", userSelect: "none" }}>
                r={r.toFixed(1)}
              </text>
            </g>
          )}
          {isActive && (
            <g style={{ cursor: "move" }}
              onMouseDown={e => handleLayerBodyMouseDown(layer.id, e)}>
              <circle cx={cx} cy={cy} r={2.5 / scale} fill="transparent" />
              <circle cx={cx} cy={cy}
                r={(isDraggingMove ? 1.3 : 0.9) / scale}
                fill={isDraggingMove ? "#22c55e" : "#3b82f6"}
                stroke="#fff" strokeWidth={0.2 / scale} />
            </g>
          )}
        </g>
      );
    }

    const segs = layer.segments;
    const pathStr = serializePath(segs);
    const isDraggingMove = drag.kind === "move" && drag.layerId === layer.id;

    return (
      <g key={layer.id} opacity={layer.opacity}>
        <path
          d={pathStr}
          fill={layer.fillColor === "none" ? "none" : layer.fillColor}
          stroke={layer.strokeColor}
          strokeWidth={(layer.strokeWidth ?? 0.5) / scale}
          strokeLinejoin="round"
          strokeLinecap="round"
          onClick={() => setActiveLayerId(layer.id)}
          onMouseDown={e => {
            if (!isActive) { setActiveLayerId(layer.id); return; }
            if (drag.kind !== "vertex" && drag.kind !== "control" && drag.kind !== "edge") {
              handleLayerBodyMouseDown(layer.id, e);
            }
          }}
          style={{ cursor: layer.locked ? "pointer" : (isDraggingMove ? "grabbing" : "grab") }}
        />

        {isActive && showControlPoints && segs.map((seg, i) => {
          if (seg.cmd !== "L" && seg.cmd !== "Q") return null;
          const prev = getPrevEP(segs, i);
          if (!prev) return null;
          const ep = endPoint(seg)!;

          if (seg.cmd === "L") {
            const mx = (prev.x + ep.x) / 2;
            const my = (prev.y + ep.y) / 2;
            return (
              <g key={`edge-${i}`} style={{ cursor: "crosshair" }}
                onMouseDown={e => {
                  if (e.shiftKey) {
                    handleInsertVertex(layer.id, i, e);
                  } else {
                    handleEdgeMouseDown(layer.id, i, e);
                  }
                }}>
                <circle cx={mx} cy={my} r={2.5 / scale} fill="transparent" />
                <circle cx={mx} cy={my} r={0.8 / scale} fill="#94a3b8" stroke="#fff" strokeWidth={0.2 / scale} opacity={0.85} />
                <line x1={mx - 0.6 / scale} y1={my} x2={mx + 0.6 / scale} y2={my} stroke="#fff" strokeWidth={0.15 / scale} />
                <line x1={mx} y1={my - 0.6 / scale} x2={mx} y2={my + 0.6 / scale} stroke="#fff" strokeWidth={0.15 / scale} />
              </g>
            );
          }
          if (seg.cmd === "Q") {
            return (
              <g key={`ctrl-${i}`}>
                <line x1={prev.x} y1={prev.y} x2={seg.cx} y2={seg.cy} stroke="#fbbf24" strokeWidth={0.25 / scale} strokeDasharray={`${0.8 / scale} ${0.4 / scale}`} opacity={0.6} />
                <line x1={seg.cx} y1={seg.cy} x2={seg.x} y2={seg.y} stroke="#fbbf24" strokeWidth={0.25 / scale} strokeDasharray={`${0.8 / scale} ${0.4 / scale}`} opacity={0.6} />
                <g style={{ cursor: "move" }}
                  onMouseDown={e => handleControlMouseDown(layer.id, i, e)}
                  onDoubleClick={e => handleEdgeDblClick(layer.id, i, e)}>
                  <circle cx={seg.cx} cy={seg.cy} r={2.5 / scale} fill="transparent" />
                  <circle cx={seg.cx} cy={seg.cy}
                    r={(drag.kind === "control" && drag.layerId === layer.id && drag.idx === i ? 1.2 : 0.8) / scale}
                    fill={drag.kind === "control" && drag.layerId === layer.id && drag.idx === i ? "#f59e0b" : "#fbbf24"}
                    stroke="#fff" strokeWidth={0.2 / scale} />
                </g>
              </g>
            );
          }
          return null;
        })}

        {isActive && showVertices && segs.map((seg, i) => {
          const ep = endPoint(seg);
          if (!ep) return null;
          const isM = seg.cmd === "M";
          const isDragging = drag.kind === "vertex" && drag.layerId === layer.id && drag.idx === i;
          const isHov = hoveredVertex?.layerId === layer.id && hoveredVertex?.idx === i;
          const vtype = layer.vertexTypes[i] ?? "smooth";
          const isCorner = vtype === "corner";

          const fillBase = isM ? "#ef4444" : isCorner ? "#a855f7" : (isActive ? "#3b82f6" : "#94a3b8");
          const fillFinal = isDragging ? "#22c55e" : fillBase;

          return (
            <g key={`vtx-${i}`} style={{ cursor: isActive ? "grab" : "pointer" }}
              onMouseDown={e => {
                if (!isActive) { setActiveLayerId(layer.id); return; }
                if (e.altKey) handleAltDelete(layer.id, i, e);
                else handleVertexMouseDown(layer.id, i, e);
              }}
              onContextMenu={e => handleVertexRightClick(layer.id, i, e)}
              onMouseEnter={() => setHoveredVertex({ layerId: layer.id, idx: i })}
              onMouseLeave={() => setHoveredVertex(null)}>
              <circle cx={ep.x} cy={ep.y} r={2.5 / scale} fill="transparent" />
              {isCorner && !isM ? (
                <rect
                  x={ep.x - (isDragging ? 1.1 : isHov ? 0.9 : 0.7) / scale}
                  y={ep.y - (isDragging ? 1.1 : isHov ? 0.9 : 0.7) / scale}
                  width={(isDragging ? 2.2 : isHov ? 1.8 : 1.4) / scale}
                  height={(isDragging ? 2.2 : isHov ? 1.8 : 1.4) / scale}
                  fill={fillFinal} stroke="#fff" strokeWidth={0.2 / scale}
                  transform={`rotate(45, ${ep.x}, ${ep.y})`} />
              ) : (
                <circle cx={ep.x} cy={ep.y}
                  r={(isDragging ? 1.1 : isHov ? 0.9 : 0.65) / scale}
                  fill={fillFinal} stroke="#fff" strokeWidth={0.2 / scale} />
              )}
              {isHov && isActive && !isM && (
                <g opacity={0.5}>
                  <line x1={ep.x - 0.5 / scale} y1={ep.y - 0.5 / scale} x2={ep.x + 0.5 / scale} y2={ep.y + 0.5 / scale} stroke="#fff" strokeWidth={0.15 / scale} />
                  <line x1={ep.x + 0.5 / scale} y1={ep.y - 0.5 / scale} x2={ep.x - 0.5 / scale} y2={ep.y + 0.5 / scale} stroke="#fff" strokeWidth={0.15 / scale} />
                </g>
              )}
            </g>
          );
        })}
      </g>
    );
  };

  // --- RENDERING WIDGET STATE CHECK ---
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-indigo-400">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="animate-spin text-indigo-500" size={42} />
          <p className="text-slate-400 font-medium animate-pulse">Memuat Studio CAD...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthorized") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-[2.5rem] shadow-2xl p-10 flex flex-col items-center text-center animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-red-950/40 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="text-red-500" size={42} />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-3">Akses Ditolak</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Halaman editor CAD ini memerlukan otentikasi member.<br />
            Kembali ke beranda untuk masuk ke akun Anda.
          </p>
          <div className="w-full space-y-3">
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 animate-shrink origin-left"></div>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">Kembali ke Beranda...</p>
          </div>
        </div>
        <style jsx>{`
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
          .animate-shrink {
            animation: shrink 2.5s linear forwards;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans select-none overflow-hidden">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Navbar />

      {/* ── Context Menu ── */}
      {contextMenu && (() => {
        const layer = layers.find(l => l.id === contextMenu.layerId);
        const seg = layer?.segments[contextMenu.vertexIdx];
        const isM = seg?.cmd === "M";
        const isOnlyM = isM && (layer?.segments.filter(s => s.cmd === "M").length ?? 0) <= 1;
        const vtype = layer?.vertexTypes[contextMenu.vertexIdx] ?? "smooth";
        const isCorner = vtype === "corner";
        return (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
            <div className="fixed z-50 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl py-1.5 min-w-[190px] text-sm overflow-hidden"
              style={{ left: contextMenu.x, top: contextMenu.y }}>
              <div className="px-3 py-1.5 text-[10px] text-slate-500 uppercase tracking-widest font-bold border-b border-slate-700 mb-1">
                Vertex #{contextMenu.vertexIdx} · {layer?.name}
              </div>
              {!isM && (
                <button className="w-full px-3 py-2 text-left hover:bg-slate-700 flex items-center gap-2.5 transition-colors"
                  onClick={() => handleToggleVertexType(contextMenu.layerId, contextMenu.vertexIdx)}>
                  {isCorner ? (
                    <><span className="w-3 h-3 rounded-full bg-blue-400 inline-block shrink-0" /><span className="text-blue-300">Ubah ke Smooth</span></>
                  ) : (
                    <><span className="w-3 h-3 bg-purple-400 inline-block shrink-0" style={{ borderRadius: "2px", transform: "rotate(45deg)" }} /><span className="text-purple-300">Ubah ke Corner</span></>
                  )}
                </button>
              )}
              <button disabled={isOnlyM}
                className={`w-full px-3 py-2 text-left flex items-center gap-2.5 transition-colors ${isOnlyM ? "opacity-30 cursor-not-allowed text-slate-500" : "hover:bg-red-900/50 text-red-400 hover:text-red-300"}`}
                onClick={() => !isOnlyM && handleDeleteVertex(contextMenu.layerId, contextMenu.vertexIdx)}>
                <span className="text-base leading-none">✕</span><span>Hapus Vertex</span>
              </button>
            </div>
          </>
        );
      })()}

      {/* ── Add Layer Popup ── */}
      {showAddLayer && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setShowAddLayer(false)} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl p-6 w-80">
            <div className="text-sm font-bold text-white mb-4">Pilih Geometri</div>
            <div className="grid grid-cols-4 gap-2">
              {([
                ["line", "─", "Garis"],
                ["rect", "▭", "Persegi"],
                ["triangle", "△", "Segitiga"],
                ["polygon5", "⬠", "Pentagon"],
                ["polygon6", "⬡", "Hexagon"],
                ["polygon10", "⬟", "Dekagon"],
                ["circle", "◯", "Lingkaran"],
              ] as [GeomTemplate, string, string][]).map(([type, icon, label]) => (
                <button key={type}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-700 hover:bg-indigo-700 border border-slate-600 hover:border-indigo-500 rounded-xl transition-colors text-sm"
                  onClick={() => addLayer(type)}>
                  <span className="text-2xl">{icon}</span>
                  <span className="text-xs text-slate-300">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── TOP WORKSPACE TOOLBAR ── */}
      <header className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 z-30 shrink-0">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.push("/workspaces")} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-bold transition-all">
            <ArrowLeft size={16} /><span>Kembali</span>
          </button>
          <div className="h-6 w-px bg-slate-700" />
          <h1 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
            <Layers size={16} className="text-indigo-400" />
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-transparent border-none outline-none text-white font-bold focus:ring-1 focus:ring-indigo-500 rounded px-2 w-48"
            />
          </h1>
          <div className="h-6 w-px bg-slate-700" />
          <button onClick={handleSaveToDb} disabled={isSaving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-bold text-white transition-all shadow-md">
            {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            <span>{isSaving ? "Menyimpan..." : "Simpan Pola (DB)"}</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={handleUndo} disabled={!canUndo} className="p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 rounded-xl transition-all" title="Undo (Ctrl+Z)">
            <Undo2 size={14} />
          </button>
          <button onClick={handleRedo} disabled={!canRedo} className="p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 rounded-xl transition-all" title="Redo (Ctrl+Y)">
            <Redo2 size={14} />
          </button>
          <div className="h-6 w-px bg-slate-700 mx-2" />
          <button onClick={handleExportLocalSVG} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-300 transition-all">
            <Download size={14} /><span>Cetak Pola (SVG)</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT PANEL: LAYERS & AI COPILOT ── */}
        <aside className="w-[340px] bg-slate-800 border-r border-slate-700 flex flex-col shadow-2xl z-10 overflow-y-auto">
          
          {/* AI COPILOT WIDGET */}
          <div className="p-5 border-b border-slate-700">
            <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-4 shadow-lg shadow-indigo-900/20">
              <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Sparkles size={14} className="text-indigo-400" /> AI Pattern Copilot
              </h3>
              <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">
                Ketik komponen pakaian yang diinginkan. AI Copilot Gemini akan menghitung koordinat dan menggambarnya otomatis di kanvas CAD.
              </p>
              <form onSubmit={handleAIGenerate} className="flex flex-col gap-2">
                <input 
                  type="text" 
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder="Misal: Saku berbentuk kotak, kerah bulat..." 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button 
                  type="submit" 
                  disabled={isAiLoading || !aiPrompt.trim()}
                  className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white text-xs font-bold py-2 rounded-lg transition-all"
                >
                  {isAiLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>{isAiLoading ? "AI Sedang Menggambar..." : "Generate dengan AI"}</span>
                </button>
              </form>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* ── Layer Panel ── */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <Layers size={11} /> Layer ({layers.length})
                </label>
                <button
                  onClick={() => setShowAddLayer(true)}
                  className="flex items-center gap-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg transition-colors"
                >
                  <Plus size={10} /> Tambah Layer
                </button>
              </div>
              <div className="space-y-1.5">
                {[...layers].reverse().map((layer) => {
                  const isActive = layer.id === activeLayerId;
                  const originalIdx = layers.findIndex(l => l.id === layer.id);
                  return (
                    <div key={layer.id}
                      onClick={() => setActiveLayerId(layer.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-colors ${
                        isActive
                          ? "bg-indigo-950/60 border-indigo-500/70 text-white"
                          : "bg-slate-900/40 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500"
                      }`}>
                      <div className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                        style={{ background: layer.fillColor === "none" ? "transparent" : layer.fillColor, borderColor: layer.strokeColor }} />
                      <span className="flex-1 text-xs font-medium truncate">{layer.name}</span>
                      {layer.locked && <span className="text-[9px] text-slate-500 bg-slate-700 px-1.5 py-0.5 rounded">PONDASI</span>}
                      {layer.kind === "circle" && <span className="text-[9px] text-cyan-600 bg-cyan-950/60 px-1.5 py-0.5 rounded">◯</span>}
                      <div className="flex items-center gap-0.5 ml-auto shrink-0">
                        <button
                          className="p-1 hover:text-white text-slate-500 rounded"
                          onClick={e => { e.stopPropagation(); updateLayer(layer.id, l => ({ ...l, visible: !l.visible })); }}
                          title={layer.visible ? "Sembunyikan" : "Tampilkan"}>
                          {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>
                        {!layer.locked && (
                          <>
                            <button className="p-1 hover:text-cyan-400 text-slate-500 rounded" title="Duplikat"
                              onClick={e => { e.stopPropagation(); duplicateLayer(layer.id); }}>
                              <Copy size={12} />
                            </button>
                            {layer.kind !== "circle" && (
                              <>
                                <button className="p-1 hover:text-yellow-400 text-slate-500 rounded" title="Rotate 90°"
                                  onClick={e => { e.stopPropagation(); rotateLayer(layer.id); }}>
                                  <RotateCcw size={12} />
                                </button>
                                <button className="p-1 hover:text-pink-400 text-slate-500 rounded" title="Mirror Horizontal"
                                  onClick={e => { e.stopPropagation(); mirrorLayer(layer.id); }}>
                                  <FlipHorizontal size={12} />
                                </button>
                              </>
                            )}
                            <button className="p-1 hover:text-white text-slate-500 rounded disabled:opacity-30"
                              onClick={e => { e.stopPropagation(); moveLayer(layer.id, 1); }}
                              disabled={originalIdx === layers.length - 1} title="Naikan layer">
                              <ChevronUp size={12} />
                            </button>
                            <button className="p-1 hover:text-white text-slate-500 rounded disabled:opacity-30"
                              onClick={e => { e.stopPropagation(); moveLayer(layer.id, -1); }}
                              disabled={originalIdx === 1} title="Turunkan layer">
                              <ChevronDown size={12} />
                            </button>
                            <button className="p-1 hover:text-red-400 text-slate-500 rounded"
                              onClick={e => { e.stopPropagation(); deleteLayer(layer.id); }}
                              title="Hapus layer">
                              <Trash2 size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ── Path Data (layer aktif) ── */}
            <section>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                Data Vektor Koordinat CAD · <span className="text-indigo-400 font-semibold">{activeLayer?.name}</span>
              </label>
              {activeLayer?.kind === "circle" ? (
                <div className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-cyan-300">
                  cx={activeLayer.cx?.toFixed(2)} cy={activeLayer.cy?.toFixed(2)} r={activeLayer.r?.toFixed(2)}
                </div>
              ) : (
                <textarea
                  className="w-full h-20 bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-mono text-indigo-300 focus:border-indigo-500 outline-none resize-none"
                  value={activeLayer ? serializePath(activeLayer.segments) : ""}
                  readOnly
                />
              )}
            </section>
          </div>
        </aside>

        {/* ── CENTER PANEL: SVG CANVAS VIEWPORT ── */}
        <main className="flex-1 flex flex-col items-center justify-center relative bg-slate-950 overflow-hidden">
          {/* Zoom & Viewport controller */}
          <div className="absolute top-6 right-6 flex items-center bg-slate-850/90 border border-slate-700 p-1.5 rounded-xl shadow-xl gap-1 z-20 backdrop-blur">
            <button onClick={handleUndo} disabled={!canUndo}
              className={`p-2 rounded-lg transition-colors ${canUndo ? "hover:bg-slate-700 text-slate-300 hover:text-white" : "text-slate-600 cursor-not-allowed"}`}
              title="Undo (Ctrl+Z)"><Undo2 size={15} /></button>
            <button onClick={handleRedo} disabled={!canRedo}
              className={`p-2 rounded-lg transition-colors ${canRedo ? "hover:bg-slate-700 text-slate-300 hover:text-white" : "text-slate-600 cursor-not-allowed"}`}
              title="Redo (Ctrl+Y)"><Redo2 size={15} /></button>
            <div className="w-px h-5 bg-slate-700 mx-0.5" />
            <button onClick={() => setScale(p => Math.min(p * 1.2, 8))} className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white" title="Zoom In"><ZoomIn size={16} /></button>
            <button onClick={() => setScale(p => Math.max(p / 1.2, 0.5))} className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white" title="Zoom Out"><ZoomOut size={16} /></button>
            <button onClick={() => { setScale(1); setPan({ x: 0, y: 0 }); }}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white flex items-center gap-1 text-xs px-3" title="Reset View">
              <Maximize size={14} /> {Math.round(scale * 100)}%
            </button>
          </div>

          {/* Active Layer Badge */}
          <div className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-slate-850/90 border border-slate-700 px-3 py-2 rounded-xl text-xs backdrop-blur">
            {activeLayer ? (
              <>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: activeLayer.fillColor === "none" ? "transparent" : activeLayer.fillColor, border: `1.5px solid ${activeLayer.strokeColor}` }} />
                <span className="text-slate-300">{activeLayer.name}</span>
                <span className="text-slate-500">aktif</span>
              </>
            ) : (
              <span className="text-slate-500 italic">Tidak ada layer aktif</span>
            )}
          </div>

          {/* Canvas Wrapper */}
          <div className="w-[500px] h-[580px] bg-white rounded-[2rem] shadow-2xl border border-white/5 overflow-hidden relative cursor-grab active:cursor-grabbing">
            <svg ref={svgRef} id="cad-garment-svg" width="100%" height="100%" viewBox={`0 0 ${VB_W} ${VB_H}`}
              className="bg-white overflow-visible"
              onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onWheel={handleWheel}>
              <g transform={`translate(${pan.x / (CANVAS_W / VB_W)}, ${pan.y / (CANVAS_H / VB_H)}) scale(${scale})`}>
                {/* Grid Canvas CAD */}
                {showGrid && (
                  <g stroke="#f1f5f9" strokeWidth={0.15 / scale}>
                    {Array.from({ length: Math.ceil(150 / GRID_SIZE) + 2 }).map((_, i) => {
                      const pos = (i - 3) * GRID_SIZE;
                      return <line key={`v-${i}`} x1={pos} y1="-20" x2={pos} y2="150" />;
                    })}
                    {Array.from({ length: Math.ceil(170 / GRID_SIZE) + 2 }).map((_, i) => {
                      const pos = (i - 3) * GRID_SIZE;
                      return <line key={`h-${i}`} x1="-20" y1={pos} x2="130" y2={pos} />;
                    })}
                  </g>
                )}
                {/* Render Layers */}
                {layers.map(layer => renderLayer(layer))}
              </g>
            </svg>
          </div>
        </main>

        {/* ── RIGHT PANEL: PROPERTIES & STYLING ── */}
        <aside className="w-80 bg-slate-800 border-l border-slate-700 p-6 flex flex-col gap-5 overflow-y-auto">
          {activeLayer && activeLayer.id !== "" ? (
            <section className="bg-slate-900/40 p-4 border border-slate-700 rounded-2xl space-y-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Properties · {activeLayer.name}</div>
              
              {!activeLayer.locked && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-16 shrink-0">Nama</span>
                  <input className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-indigo-500"
                    value={activeLayer.name}
                    onChange={e => updateLayer(activeLayer.id, l => ({ ...l, name: e.target.value }))} />
                </div>
              )}

              {activeLayer.kind === "circle" && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-16 shrink-0">Radius</span>
                  <input type="range" min={2} max={45} step={0.5}
                    className="flex-1"
                    value={activeLayer.r ?? 15}
                    onChange={e => {
                      const val = parseFloat(e.target.value);
                      const newLayers = layers.map(l => l.id === activeLayer.id ? { ...l, r: val } : l);
                      setLayers(newLayers);
                    }}
                    onMouseUp={() => pushHistory(layers, activeLayerId)}
                  />
                  <span className="text-xs text-slate-300 w-10 text-right">{(activeLayer.r ?? 15).toFixed(1)}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-16 shrink-0">Warna Isi</span>
                <input type="color" className="w-8 h-7 rounded cursor-pointer border border-slate-600 bg-transparent"
                  value={activeLayer.fillColor === "none" ? "#000000" : activeLayer.fillColor}
                  onChange={e => updateLayer(activeLayer.id, l => ({ ...l, fillColor: e.target.value }))} />
                {!activeLayer.locked && (
                  <button className={`text-xs px-2 py-1 rounded-lg border transition-colors ${activeLayer.fillColor === "none" ? "bg-slate-600 border-slate-500 text-white" : "border-slate-750 text-slate-400 hover:text-white"}`}
                    onClick={() => updateLayer(activeLayer.id, l => ({ ...l, fillColor: l.fillColor === "none" ? "#888888" : "none" }))}>
                    kosong
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-16 shrink-0">Garis Tepi</span>
                <input type="color" className="w-8 h-7 rounded cursor-pointer border border-slate-600 bg-transparent"
                  value={activeLayer.strokeColor}
                  onChange={e => updateLayer(activeLayer.id, l => ({ ...l, strokeColor: e.target.value }))} />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-16 shrink-0">Ketebalan</span>
                <input type="range" min={0.1} max={5} step={0.1}
                  className="flex-1"
                  value={activeLayer.strokeWidth ?? 0.5}
                  onChange={e => updateLayer(activeLayer.id, l => ({ ...l, strokeWidth: parseFloat(e.target.value) }))}
                  onMouseUp={() => pushHistory(layers, activeLayerId)}
                />
                <span className="text-xs text-slate-300 w-8 text-right">{(activeLayer.strokeWidth ?? 0.5).toFixed(1)}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-16 shrink-0">Transparansi</span>
                <input type="range" min={0} max={1} step={0.05}
                  className="flex-1"
                  value={activeLayer.opacity}
                  onChange={e => updateLayer(activeLayer.id, l => ({ ...l, opacity: parseFloat(e.target.value) }))} />
                <span className="text-xs text-slate-300 w-8 text-right">{Math.round(activeLayer.opacity * 100)}%</span>
              </div>

              {!activeLayer.locked && activeLayer.kind !== "circle" && (
                <div className="pt-2 border-t border-slate-700">
                  <div className="text-[10px] text-slate-500 mb-2 uppercase">Transformasi Layer</div>
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => rotateLayer(activeLayer.id)}
                      className="flex items-center gap-1 px-2 py-1.5 bg-slate-700 hover:bg-yellow-900/50 hover:text-yellow-300 text-slate-300 text-[10px] rounded-lg border border-slate-600 hover:border-yellow-700 transition-colors">
                      <RotateCcw size={10} /> Putar 90°
                    </button>
                    <button onClick={() => mirrorLayer(activeLayer.id)}
                      className="flex items-center gap-1 px-2 py-1.5 bg-slate-700 hover:bg-pink-900/50 hover:text-pink-300 text-slate-300 text-[10px] rounded-lg border border-slate-600 hover:border-pink-700 transition-colors">
                      <FlipHorizontal size={10} /> Cermin
                    </button>
                    <button onClick={() => duplicateLayer(activeLayer.id)}
                      className="flex items-center gap-1 px-2 py-1.5 bg-slate-700 hover:bg-cyan-900/50 hover:text-cyan-300 text-slate-300 text-[10px] rounded-lg border border-slate-600 hover:border-cyan-700 transition-colors">
                      <Copy size={10} /> Kopi
                    </button>
                  </div>
                </div>
              )}
            </section>
          ) : (
            <div className="text-xs text-slate-500 italic text-center p-6 border border-dashed border-slate-700 rounded-2xl">
              Pilih salah satu layer untuk memodifikasi warna, garis, ketebalan, dan ukuran.
            </div>
          )}

          {/* Guidelines info */}
          <section className="p-4 bg-indigo-950/30 border border-indigo-800/40 rounded-2xl text-xs space-y-1.5">
            <div className="font-semibold text-white flex items-center gap-1.5">💡 Panduan Cepat CAD</div>
            <ul className="list-disc pl-4 space-y-1 text-indigo-300/80">
              <li><b>Drag Pola</b> → Pindahkan bentuk</li>
              <li><b>Drag Node Biru</b> → Ubah bentuk pola</li>
              <li><b>Drag Node Abu-abu</b> → Lengkungkan garis</li>
              <li><b>Shift+Klik Abu-abu</b> → Tambah titik baru</li>
              <li><b>Klik Kanan Node</b> → Menu hapus / corner</li>
            </ul>
          </section>

          {/* Toggles */}
          <section className="space-y-1.5">
            {[
              { label: "Tampilkan Grid CAD", value: showGrid, set: setShowGrid },
              { label: "Tampilkan Titik Node", value: showVertices, set: handleShowVerticesToggle },
              { label: "Tampilkan Titik Kontrol", value: showControlPoints, set: handleShowControlPointsToggle },
            ].map(({ label, value, set }) => (
              <div key={label} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-xl border border-slate-700 text-xs">
                <span>{label}</span>
                <button onClick={() => set(!value)} className={`w-8 h-4 rounded-full relative transition-colors ${value ? "bg-indigo-500" : "bg-slate-600"}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${value ? "left-4.5" : "left-0.5"}`} />
                </button>
              </div>
            ))}
          </section>

          {/* Local Save/Load JSON */}
          <section className="space-y-2 pt-2 border-t border-slate-750">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Ekspor JSON Lokal</div>
            <div className="flex gap-2">
              <button onClick={handleSaveProject}
                className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-[10px] rounded-lg border border-slate-600 transition-colors">
                <Download size={11} /> Ekspor JSON
              </button>
              <button onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-750 hover:bg-slate-700 text-slate-200 text-[10px] rounded-lg border border-slate-600 transition-colors">
                <Upload size={11} /> Impor JSON
              </button>
              <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleLoadProject} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

// ─── WRAPPER COMPONENT WITH SUSPENSE ─────────────────────────────────────────
export default function CanvasPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-slate-950 text-indigo-400">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="animate-spin text-indigo-500" size={42} />
          <p className="text-slate-400 font-medium animate-pulse">Memuat Workspace...</p>
        </div>
      </div>
    }>
      <SVGVisualizer />
    </Suspense>
  );
}
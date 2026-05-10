"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Minus,
  Square,
  Circle,
  PenTool,
  Trash2,
  MousePointer,
  Lock,
  Undo2,
  Palette,
} from "lucide-react";
import { PlanType } from "@/app/lib/planUtils";

type DrawTool = "select" | "line" | "rect" | "circle" | "pencil";

interface CanvasShape {
  id: string;
  type: "line" | "rect" | "circle" | "pencil";
  points: number[];
  stroke: string;
  strokeWidth: number;
  fill: string;
}

interface CanvasDrawingProps {
  plan: PlanType;
  canvasData: CanvasShape[];
  onCanvasChange: (data: CanvasShape[]) => void;
  isFullScreen?: boolean;
}

export default function CanvasDrawing({ plan, canvasData, onCanvasChange, isFullScreen }: CanvasDrawingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<DrawTool>("select");
  const [shapes, setShapes] = useState<CanvasShape[]>(canvasData || []);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [strokeColor, setStrokeColor] = useState("#1e1b4b");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);

  const canUse = plan === "business";

  // Draw all shapes on canvas
  const drawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid background
    ctx.strokeStyle = "#f0f0f0";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw shapes
    shapes.forEach((shape) => {
      ctx.strokeStyle = shape.stroke;
      ctx.lineWidth = shape.strokeWidth;
      ctx.fillStyle = shape.fill || "transparent";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const isSelected = selectedShape === shape.id;
      if (isSelected) {
        ctx.shadowColor = "#6366f1";
        ctx.shadowBlur = 6;
      }

      switch (shape.type) {
        case "line":
          ctx.beginPath();
          ctx.moveTo(shape.points[0], shape.points[1]);
          ctx.lineTo(shape.points[2], shape.points[3]);
          ctx.stroke();
          break;
        case "rect": {
          const [x1, y1, x2, y2] = shape.points;
          const w = x2 - x1;
          const h = y2 - y1;
          if (shape.fill && shape.fill !== "transparent") {
            ctx.fillRect(x1, y1, w, h);
          }
          ctx.strokeRect(x1, y1, w, h);
          break;
        }
        case "circle": {
          const [cx, cy, rx, ry] = shape.points;
          ctx.beginPath();
          ctx.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
          if (shape.fill && shape.fill !== "transparent") {
            ctx.fill();
          }
          ctx.stroke();
          break;
        }
        case "pencil":
          if (shape.points.length < 4) break;
          ctx.beginPath();
          ctx.moveTo(shape.points[0], shape.points[1]);
          for (let i = 2; i < shape.points.length; i += 2) {
            ctx.lineTo(shape.points[i], shape.points[i + 1]);
          }
          ctx.stroke();
          break;
      }

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
    });
  }, [shapes, selectedShape]);

  useEffect(() => {
    drawAll();
  }, [drawAll]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === "select") return;
    const pos = getPos(e);
    setIsDrawing(true);
    setStartPos(pos);
    if (tool === "pencil") {
      setCurrentPath([pos.x, pos.y]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    const pos = getPos(e);

    if (tool === "pencil") {
      setCurrentPath((prev) => [...prev, pos.x, pos.y]);
      // Live preview
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      drawAll();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      const pts = [...currentPath, pos.x, pos.y];
      ctx.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length; i += 2) {
        ctx.lineTo(pts[i], pts[i + 1]);
      }
      ctx.stroke();
    } else {
      // Live preview for shapes
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      drawAll();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.setLineDash([5, 5]);

      switch (tool) {
        case "line":
          ctx.beginPath();
          ctx.moveTo(startPos.x, startPos.y);
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
          break;
        case "rect": {
          const w = pos.x - startPos.x;
          const h = pos.y - startPos.y;
          ctx.strokeRect(startPos.x, startPos.y, w, h);
          break;
        }
        case "circle": {
          const rx = Math.abs(pos.x - startPos.x);
          const ry = Math.abs(pos.y - startPos.y);
          ctx.beginPath();
          ctx.ellipse(startPos.x, startPos.y, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }
      }
      ctx.setLineDash([]);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    const pos = getPos(e);
    setIsDrawing(false);

    const newShape: CanvasShape = {
      id: `s_${Date.now()}`,
      type: tool as CanvasShape["type"],
      points: [],
      stroke: strokeColor,
      strokeWidth,
      fill: "transparent",
    };

    switch (tool) {
      case "line":
        newShape.points = [startPos.x, startPos.y, pos.x, pos.y];
        break;
      case "rect":
        newShape.points = [startPos.x, startPos.y, pos.x, pos.y];
        break;
      case "circle":
        newShape.points = [
          startPos.x,
          startPos.y,
          Math.abs(pos.x - startPos.x),
          Math.abs(pos.y - startPos.y),
        ];
        break;
      case "pencil":
        newShape.points = [...currentPath, pos.x, pos.y];
        break;
      default:
        return;
    }

    // Don't add if too small (accidental clicks)
    if (tool !== "pencil") {
      const dx = Math.abs(pos.x - startPos.x);
      const dy = Math.abs(pos.y - startPos.y);
      if (dx < 3 && dy < 3) {
        setStartPos(null);
        setCurrentPath([]);
        drawAll();
        return;
      }
    }

    const updated = [...shapes, newShape];
    setShapes(updated);
    onCanvasChange(updated);
    setStartPos(null);
    setCurrentPath([]);
  };

  const handleClear = () => {
    setShapes([]);
    onCanvasChange([]);
    setSelectedShape(null);
  };

  const handleUndo = () => {
    const updated = shapes.slice(0, -1);
    setShapes(updated);
    onCanvasChange(updated);
  };

  const handleDeleteSelected = () => {
    if (!selectedShape) return;
    const updated = shapes.filter((s) => s.id !== selectedShape);
    setShapes(updated);
    onCanvasChange(updated);
    setSelectedShape(null);
  };

  if (!canUse) {
    return (
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Canvas Drawing</h4>
        <div className="p-6 rounded-xl bg-gray-50 border border-gray-100 text-center">
          <Lock size={28} className="mx-auto text-gray-300 mb-2" />
          <p className="text-xs text-gray-400 font-medium">Fitur Canvas Drawing</p>
          <p className="text-[10px] text-gray-300 mt-1">Tersedia di paket Business</p>
          <p className="text-[10px] text-gray-300">Gambar bebas: Line, Rectangle, Circle, Pencil</p>
        </div>
      </div>
    );
  }

  const tools: { id: DrawTool; icon: React.ReactNode; label: string }[] = [
    { id: "select", icon: <MousePointer size={16} />, label: "Select" },
    { id: "line", icon: <Minus size={16} />, label: "Line" },
    { id: "rect", icon: <Square size={16} />, label: "Rect" },
    { id: "circle", icon: <Circle size={16} />, label: "Circle" },
    { id: "pencil", icon: <PenTool size={16} />, label: "Pencil" },
  ];

  const drawColors = ["#1e1b4b", "#dc2626", "#16a34a", "#2563eb", "#9333ea", "#ea580c", "#64748b"];

  return (
    <div className={`space-y-3 flex flex-col ${isFullScreen ? "h-full w-full p-4 bg-gray-50" : ""}`}>
      {!isFullScreen && <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Canvas Drawing</h4>}

      {/* Toolbar */}
      <div className={`flex gap-3 flex-wrap items-center bg-white p-2 rounded-xl border border-gray-200 ${isFullScreen ? "shadow-sm" : ""}`}>
        <div className="flex gap-1">
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
              tool === t.id
                ? "bg-indigo-600 text-white"
                : "bg-gray-50 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
            }`}
            title={t.label}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1"></div>

      {/* Color picker */}
      <div className="flex items-center gap-2">
        <Palette size={14} className="text-gray-400" />
        <div className="flex gap-1.5">
          {drawColors.map((c) => (
            <button
              key={c}
              onClick={() => setStrokeColor(c)}
              className={`w-5 h-5 rounded-full border-2 transition-all ${
                strokeColor === c ? "border-indigo-600 scale-125" : "border-gray-200"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Stroke width */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-400 w-8">Size:</span>
        <input
          type="range"
          min="1"
          max="8"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          className="flex-1 accent-indigo-600"
        />
        <span className="text-[10px] text-gray-500 font-mono w-4">{strokeWidth}</span>
      </div>
      </div>

      {/* Canvas */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white flex-1 relative shadow-inner">
        <canvas
          ref={canvasRef}
          width={isFullScreen ? 1000 : 500}
          height={isFullScreen ? 700 : 400}
          className="w-full h-full cursor-crosshair object-contain"
          style={{ cursor: tool === "select" ? "default" : "crosshair" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            if (isDrawing) {
              setIsDrawing(false);
              setStartPos(null);
              setCurrentPath([]);
              drawAll();
            }
          }}
        />
      </div>

      {/* Actions */}
      <div className={`flex gap-2 ${isFullScreen ? "justify-end mt-2" : ""}`}>
        <button
          onClick={handleUndo}
          disabled={shapes.length === 0}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-gray-50 text-gray-500 text-[10px] font-semibold hover:bg-gray-100 disabled:opacity-40 transition-all"
        >
          <Undo2 size={14} /> Undo
        </button>
        <button
          onClick={handleDeleteSelected}
          disabled={!selectedShape}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-gray-50 text-gray-500 text-[10px] font-semibold hover:bg-red-50 hover:text-red-500 disabled:opacity-40 transition-all"
        >
          <Trash2 size={14} /> Hapus
        </button>
        <button
          onClick={handleClear}
          disabled={shapes.length === 0}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-red-50 text-red-500 text-[10px] font-semibold hover:bg-red-100 disabled:opacity-40 transition-all"
        >
          <Trash2 size={14} /> Clear
        </button>
      </div>

      <p className="text-[9px] text-gray-300 text-center">
        {shapes.length} objek • Klik canvas untuk menggambar
      </p>
    </div>
  );
}

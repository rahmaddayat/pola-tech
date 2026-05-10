"use client";

import React, { useState } from "react";
import { FileDown, FileImage, FileText, File, Loader2, Lock } from "lucide-react";
import { PlanType } from "@/app/lib/planUtils";

interface ExportPanelProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  projectName: string;
  plan: PlanType;
  onToast: (msg: string, type: "success" | "error") => void;
}

export default function ExportPanel({ svgRef, projectName, plan, onToast }: ExportPanelProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const fileName = projectName.toLowerCase().replace(/\s+/g, "-") || "design";

  const canExportPNG = plan === "pro" || plan === "business";

  const handleExportSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onToast("SVG berhasil diunduh!", "success");
  };

  const handleExportPNG = async () => {
    if (!canExportPNG) {
      onToast("Ekspor PNG membutuhkan paket Pro atau Business.", "error");
      return;
    }
    if (!svgRef.current) return;

    setExporting("png");
    try {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = 4; // High-res
        canvas.width = img.naturalWidth * scale;
        canvas.height = img.naturalHeight * scale;
        const ctx = canvas.getContext("2d")!;
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (!blob) return;
          const pngUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = pngUrl;
          link.download = `${fileName}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(pngUrl);
          URL.revokeObjectURL(url);
          setExporting(null);
          onToast("PNG berhasil diunduh!", "success");
        }, "image/png");
      };
      img.onerror = () => {
        setExporting(null);
        onToast("Gagal mengekspor PNG.", "error");
      };
      img.src = url;
    } catch {
      setExporting(null);
      onToast("Gagal mengekspor PNG.", "error");
    }
  };

  const handleExportPDF = async () => {
    if (!svgRef.current) return;
    setExporting("pdf");
    try {
      const { jsPDF } = await import("jspdf");
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const imgRatio = img.naturalWidth / img.naturalHeight;
        let drawW = pageW - 20;
        let drawH = drawW / imgRatio;
        if (drawH > pageH - 40) {
          drawH = pageH - 40;
          drawW = drawH * imgRatio;
        }

        // Render to canvas first for PDF
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth * 4;
        canvas.height = img.naturalHeight * 4;
        const ctx = canvas.getContext("2d")!;
        ctx.scale(4, 4);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, img.naturalWidth, img.naturalHeight);
        ctx.drawImage(img, 0, 0);

        const imgData = canvas.toDataURL("image/png", 1.0);

        // Header
        pdf.setFontSize(18);
        pdf.setTextColor(79, 70, 229);
        pdf.text("PolaTech", 10, 15);
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(`Design: ${projectName}`, 10, 22);
        pdf.text(`Exported: ${new Date().toLocaleDateString("id-ID")}`, 10, 27);

        // Image centered
        const x = (pageW - drawW) / 2;
        pdf.addImage(imgData, "PNG", x, 35, drawW, drawH);

        pdf.save(`${fileName}.pdf`);
        URL.revokeObjectURL(url);
        setExporting(null);
        onToast("PDF berhasil diunduh!", "success");
      };
      img.onerror = () => {
        setExporting(null);
        onToast("Gagal mengekspor PDF.", "error");
      };
      img.src = url;
    } catch {
      setExporting(null);
      onToast("Gagal mengekspor PDF.", "error");
    }
  };

  const formats = [
    {
      id: "svg",
      label: "SVG",
      desc: "Vector file",
      icon: <File size={18} />,
      handler: handleExportSVG,
      locked: false,
    },
    {
      id: "pdf",
      label: "PDF",
      desc: "Skala 1:1 • A4",
      icon: <FileText size={18} />,
      handler: handleExportPDF,
      locked: false,
    },
    {
      id: "png",
      label: "PNG",
      desc: "High-res image",
      icon: <FileImage size={18} />,
      handler: handleExportPNG,
      locked: !canExportPNG,
    },
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Export Desain</h4>
      {formats.map((fmt) => (
        <button
          key={fmt.id}
          onClick={fmt.handler}
          disabled={exporting !== null}
          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${
            fmt.locked
              ? "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
              : "border-gray-100 hover:border-indigo-300 hover:bg-indigo-50 active:scale-[0.98]"
          }`}
        >
          <div className={`p-2 rounded-lg ${fmt.locked ? "bg-gray-100 text-gray-300" : "bg-indigo-50 text-indigo-600"}`}>
            {fmt.locked ? <Lock size={18} /> : fmt.icon}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-700">{fmt.label}</div>
            <div className="text-[10px] text-gray-400">
              {fmt.locked ? "Paket Pro / Business" : fmt.desc}
            </div>
          </div>
          {exporting === fmt.id && <Loader2 size={16} className="animate-spin text-indigo-600" />}
          {!fmt.locked && !exporting && (
            <FileDown size={16} className="text-gray-300 group-hover:text-indigo-500" />
          )}
        </button>
      ))}
    </div>
  );
}

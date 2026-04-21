import React from "react";
import { VARIASI_POLA } from "@/app/constants/patterns";
import { pocketOffsets } from "@/app/hooks/useDesignCanvas";

interface CanvasProps {
  design: {
    body: keyof typeof VARIASI_POLA.body;
    necklines: keyof typeof VARIASI_POLA.necklines;
    sleeves: keyof typeof VARIASI_POLA.sleeves;
    pocket: keyof typeof VARIASI_POLA.pocket;
    primaryColor: string;
  };
}

export const DesignCanvas = ({ design }: CanvasProps) => {
  const renderPaths = (data: any, color: string, stroke: string, width: string) => {
    if (!data) return null;
    const paths = Array.isArray(data) ? data : [data];
    return paths.map((d, index) => (
      <path key={index} d={d} fill={color} stroke={stroke} strokeWidth={width} className="transition-all duration-500 ease-in-out" />
    ));
  };

  return (
    <svg width="100%" height="100%" viewBox="0 0 100 120" className="drop-shadow-2xl">
      <g className="shirt-layers">
        {/* BACK VIEW */}
        <g opacity="0.50">
          {renderPaths(VARIASI_POLA.body[design.body].back, "#1e1b4b", "#1e1b4b", "0.4")}
          {renderPaths(VARIASI_POLA.sleeves[design.sleeves].back, "#1e1b4b", "#1e1b4b", "0.4")}
          {renderPaths(VARIASI_POLA.necklines[design.necklines].back, "#1e1b4b", "#1e1b4b", "0.4")}
        </g>

        {/* FRONT VIEW */}
        <g>
          {renderPaths(VARIASI_POLA.body[design.body].front, design.primaryColor, "#1e1b4b", "0.4")}
          {renderPaths(VARIASI_POLA.sleeves[design.sleeves].front, design.primaryColor, "#1e1b4b", "0.4")}
          
          <g transform={pocketOffsets[design.pocket] || "translate(0, 0)"}>
            {renderPaths(VARIASI_POLA.pocket[design.pocket], "#4f46e5", "#1e1b4b", "0.3")}
          </g>

          {renderPaths(VARIASI_POLA.necklines[design.necklines].front, "#4338ca", "#1e1b4b", "0.4")}
        </g>
      </g>
    </svg>
  );
};
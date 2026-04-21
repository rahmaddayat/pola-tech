import React from "react";
import { VARIASI_POLA } from "@/app/constants/patterns";
import { pocketOffsets } from "@/app/hooks/useDesignCanvas";

interface ShirtPreviewProps {
  states: {
    body: keyof typeof VARIASI_POLA.body;
    necklines: keyof typeof VARIASI_POLA.necklines;
    sleeves: keyof typeof VARIASI_POLA.sleeves;
    pocket: keyof typeof VARIASI_POLA.pocket;
    primaryColor: string;
    pattern?: string | null;
  };
}

export default function ShirtPreview({ states }: ShirtPreviewProps) {
  const renderPaths = (data: any, color: string, stroke: string, width: string) => {
    if (!data) return null;
    const paths = Array.isArray(data) ? data : [data];
    // Logika penentuan fill: Jika ada pattern terpilih, gunakan url(#id)
    const fillValue = states.pattern ? `url(#${states.pattern})` : color;

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
    <svg width="100%" height="80%" viewBox="0 0 100 120" className="drop-shadow-2xl">
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
  );
}

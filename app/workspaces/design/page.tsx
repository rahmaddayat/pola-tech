"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  FolderArchive, FileDown, RotateCcw, RotateCw, X,
  Palette, Square, Shirt, CircleDot, RectangleHorizontal,
  Scissors, Layers,
} from "lucide-react";

/* ================================================================
   GARMENT TYPES & LABELS
   ================================================================ */
type GarmentType = "tshirt" | "polo" | "kemeja" | "tanktop" | "hoodie" | "jaket" | "dress" | "rok" | "celana";

const GARMENT_LABELS: Record<GarmentType, string> = {
  tshirt: "T-Shirt", polo: "Polo Shirt", kemeja: "Kemeja", tanktop: "Tank Top",
  hoodie: "Hoodie", jaket: "Jaket", dress: "Dress", rok: "Rok", celana: "Celana",
};

/* ================================================================
   SVG GARMENT COMPONENTS — Realistic bezier-curved proportions
   Each returns JSX paths for the canvas
   ================================================================ */

// Helper: darken a hex color for stroke/details
const darkenColor = (hex: string, amount: number = 30) => {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return `rgb(${r},${g},${b})`;
};

interface GarmentProps {
  fill: string; stroke: string; sw: number; dash: string;
  silhouette: string; neckline: string; sleeve: string; pocket: boolean;
}

/* ---- T-SHIRT ---- */
const TShirtSVG = ({ fill, stroke, sw, dash, silhouette, neckline, pocket }: GarmentProps) => {
  const paths: Record<string, string> = {
    regular: "M150,52 C142,52 136,50 130,48 L118,46 C112,46 106,48 100,52 L78,64 C70,68 64,72 56,78 L32,64 C28,62 24,64 22,68 L12,96 C10,100 12,104 16,106 L52,120 C54,121 56,124 56,126 L56,308 C56,316 62,322 70,322 L230,322 C238,322 244,316 244,308 L244,126 C244,124 246,121 248,120 L284,106 C288,104 290,100 288,96 L278,68 C276,64 272,62 268,64 L244,78 C236,72 230,68 222,64 L200,52 C194,48 188,46 182,46 L170,48 C164,50 158,52 150,52 Z",
    slim: "M150,52 C142,52 136,50 130,48 L120,46 C114,46 108,48 102,52 L82,64 C74,68 68,72 60,78 L36,64 C32,62 28,64 26,68 L16,96 C14,100 16,104 20,106 L56,120 C58,121 60,124 60,126 L66,308 C66,316 72,322 80,322 L220,322 C228,322 234,316 234,308 L240,126 C240,124 242,121 244,120 L280,106 C284,104 286,100 284,96 L274,68 C272,64 268,62 264,64 L240,78 C232,72 226,68 218,64 L198,52 C192,48 186,46 180,46 L170,48 C164,50 158,52 150,52 Z",
    oversized: "M150,52 C142,52 136,50 130,48 L114,46 C106,46 98,50 90,54 L66,68 C56,74 48,80 40,86 L18,68 C14,66 10,68 8,72 L-2,100 C-4,104 -2,108 2,110 L42,126 C44,127 46,130 46,132 L44,310 C44,318 50,324 58,324 L242,324 C250,324 256,318 256,310 L254,132 C254,130 256,127 258,126 L298,110 C302,108 304,104 302,100 L292,72 C290,68 286,66 282,68 L260,86 C252,80 244,74 234,68 L210,54 C202,50 194,46 186,46 L170,48 C164,50 158,52 150,52 Z",
    crop: "M150,52 C142,52 136,50 130,48 L118,46 C112,46 106,48 100,52 L78,64 C70,68 64,72 56,78 L32,64 C28,62 24,64 22,68 L12,96 C10,100 12,104 16,106 L52,120 C54,121 56,124 56,126 L58,248 C58,254 63,258 69,258 L231,258 C237,258 242,254 242,248 L244,126 C244,124 246,121 248,120 L284,106 C288,104 290,100 288,96 L278,68 C276,64 272,62 268,64 L244,78 C236,72 230,68 222,64 L200,52 C194,48 188,46 182,46 L170,48 C164,50 158,52 150,52 Z",
  };
  const necklines: Record<string, string> = {
    crew: "M130,48 C136,56 143,60 150,62 C157,60 164,56 170,48",
    vneck: "M128,48 C134,54 140,62 150,78 C160,62 166,54 172,48",
    scoop: "M126,48 C132,62 140,72 150,76 C160,72 168,62 174,48",
    turtle: "M132,48 L132,38 C132,32 140,28 150,28 C160,28 168,32 168,38 L168,48",
  };
  const d = paths[silhouette] || paths.regular;
  return (
    <g>
      <path d={d} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <path d={necklines[neckline] || necklines.crew} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      {/* Sleeve stitch */}
      <path d="M56,126 C58,148 58,168 58,180" fill="none" stroke={stroke} strokeWidth="0.6" strokeDasharray={dash} opacity="0.3" />
      <path d="M244,126 C242,148 242,168 242,180" fill="none" stroke={stroke} strokeWidth="0.6" strokeDasharray={dash} opacity="0.3" />
      {/* Side body curve stitch */}
      <path d="M56,180 C60,220 62,260 64,308" fill="none" stroke={stroke} strokeWidth="0.5" strokeDasharray="8,4" opacity="0.12" />
      <path d="M244,180 C240,220 238,260 236,308" fill="none" stroke={stroke} strokeWidth="0.5" strokeDasharray="8,4" opacity="0.12" />
      {/* Center seam */}
      <line x1="150" y1="70" x2="150" y2="320" stroke={stroke} strokeWidth="0.4" strokeDasharray="6,6" opacity="0.08" />
      {pocket && <rect x="105" y="130" width="36" height="40" rx="3" fill="none" stroke={stroke} strokeWidth="0.8" strokeDasharray={dash} opacity="0.3" />}
    </g>
  );
};

/* ---- POLO SHIRT ---- */
const PoloSVG = ({ fill, stroke, sw, dash, silhouette, pocket }: GarmentProps) => {
  const body = silhouette === "slim"
    ? "M150,58 C142,58 136,56 130,54 L120,52 C114,52 108,54 102,58 L82,70 C74,74 68,78 60,84 L36,70 C32,68 28,70 26,74 L16,102 C14,106 16,110 20,112 L56,126 C58,127 60,130 60,132 L66,310 C66,318 72,324 80,324 L220,324 C228,324 234,318 234,310 L240,132 C240,130 242,127 244,126 L280,112 C284,110 286,106 284,102 L274,74 C272,70 268,68 264,70 L240,84 C232,78 226,74 218,70 L198,58 C192,54 186,52 180,52 L170,54 C164,56 158,58 150,58 Z"
    : "M150,58 C142,58 136,56 130,54 L118,52 C112,52 106,54 100,58 L78,70 C70,74 64,78 56,84 L32,70 C28,68 24,70 22,74 L12,102 C10,106 12,110 16,112 L52,126 C54,127 56,130 56,132 L56,310 C56,318 62,324 70,324 L230,324 C238,324 244,318 244,310 L244,132 C244,130 246,127 248,126 L284,112 C288,110 290,106 288,102 L278,74 C276,70 272,68 268,70 L244,84 C236,78 230,74 222,70 L200,58 C194,54 188,52 182,52 L170,54 C164,56 158,58 150,58 Z";
  return (
    <g>
      <path d={body} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      {/* Polo collar */}
      <path d="M128,54 C132,50 138,44 142,40 L150,36 L158,40 C162,44 168,50 172,54" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M142,40 L150,36 L158,40" fill="none" stroke={stroke} strokeWidth="0.8" />
      {/* Collar fold lines */}
      <path d="M134,52 C138,48 144,42 150,38" fill="none" stroke={stroke} strokeWidth="0.6" opacity="0.3" />
      <path d="M166,52 C162,48 156,42 150,38" fill="none" stroke={stroke} strokeWidth="0.6" opacity="0.3" />
      {/* Button placket */}
      <line x1="150" y1="38" x2="150" y2="110" stroke={stroke} strokeWidth="0.5" strokeDasharray="3,3" opacity="0.3" />
      {[56, 72, 88].map((cy) => <circle key={cy} cx={150} cy={cy} r="2.5" fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.4" />)}
      {/* Sleeve stitch */}
      <path d="M56,132 C58,152 58,172 58,186" fill="none" stroke={stroke} strokeWidth="0.6" strokeDasharray={dash} opacity="0.25" />
      <path d="M244,132 C242,152 242,172 242,186" fill="none" stroke={stroke} strokeWidth="0.6" strokeDasharray={dash} opacity="0.25" />
      {pocket && <rect x="170" y="130" width="36" height="38" rx="3" fill="none" stroke={stroke} strokeWidth="0.8" strokeDasharray={dash} opacity="0.3" />}
    </g>
  );
};

/* ---- KEMEJA (Button-down) ---- */
const KemejaSVG = ({ fill, stroke, sw, dash, silhouette }: GarmentProps) => {
  const body = silhouette === "slim"
    ? "M150,54 L138,52 C130,54 122,56 114,50 L102,54 L80,70 C72,74 66,80 58,86 L34,72 C30,70 26,72 24,76 L14,104 C12,108 14,112 18,114 L54,128 C56,129 58,132 58,134 L64,310 C64,318 70,324 78,324 L222,324 C230,324 236,318 236,310 L242,134 C242,132 244,129 246,128 L282,114 C286,112 288,108 286,104 L276,76 C274,72 270,70 266,72 L242,86 C234,80 228,74 220,70 L198,54 L186,50 C178,56 170,54 162,52 L150,54 Z"
    : "M150,54 L138,52 C130,54 122,56 114,50 L100,54 L76,70 C68,74 62,80 54,86 L30,72 C26,70 22,72 20,76 L10,104 C8,108 10,112 14,114 L50,128 C52,129 54,132 54,134 L54,310 C54,318 60,324 68,324 L232,324 C240,324 246,318 246,310 L246,134 C246,132 248,129 250,128 L286,114 C290,112 292,108 290,104 L280,76 C278,72 274,70 270,72 L246,86 C238,80 232,74 224,70 L200,54 L186,50 C178,56 170,54 162,52 L150,54 Z";
  return (
    <g>
      <path d={body} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      {/* Spread collar */}
      <path d="M114,50 L126,36 C130,32 136,28 140,26 L150,24 L160,26 C164,28 170,32 174,36 L186,50" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <path d="M126,36 L140,26 L150,24 L160,26 L174,36" fill="none" stroke={stroke} strokeWidth="0.6" opacity="0.35" />
      {/* Collar lapel fold */}
      <path d="M114,50 C120,44 126,38 128,36" fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.3" />
      <path d="M186,50 C180,44 174,38 172,36" fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.3" />
      {/* Button placket */}
      <line x1="150" y1="24" x2="150" y2="322" stroke={stroke} strokeWidth="0.5" strokeDasharray="3,3" opacity="0.25" />
      {[60, 90, 120, 150, 185, 220, 260, 295].map((cy) => <circle key={cy} cx={150} cy={cy} r="2.8" fill="none" stroke={stroke} strokeWidth="0.7" opacity="0.35" />)}
      {/* Chest pocket */}
      <rect x="164" y="110" width="34" height="38" rx="2" fill="none" stroke={stroke} strokeWidth="0.7" strokeDasharray={dash} opacity="0.25" />
      {/* Cuff lines */}
      <path d="M54,186 C56,188 58,186 60,184" fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.2" />
      <path d="M246,186 C244,188 242,186 240,184" fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.2" />
    </g>
  );
};

/* ---- TANK TOP ---- */
const TankTopSVG = ({ fill, stroke, sw, silhouette }: GarmentProps) => {
  const body = silhouette === "racerback"
    ? "M150,46 C140,46 132,48 126,52 C118,58 112,64 108,70 L88,76 C82,78 78,84 78,90 L78,310 C78,318 84,324 92,324 L208,324 C216,324 222,318 222,310 L222,90 C222,84 218,78 212,76 L192,70 C188,64 182,58 174,52 C168,48 160,46 150,46 Z"
    : "M150,46 C140,46 130,48 122,52 C114,58 106,66 98,72 L74,62 C70,60 66,62 64,66 L64,90 C64,94 66,96 70,96 L86,96 C86,98 84,102 82,106 L72,310 C72,318 78,324 86,324 L214,324 C222,324 228,318 228,310 L218,106 C216,102 214,98 214,96 L230,96 C234,96 236,94 236,90 L236,66 C234,62 230,60 226,62 L202,72 C194,66 186,58 178,52 C170,48 160,46 150,46 Z";
  const neckD = silhouette === "racerback"
    ? "M126,52 C134,60 142,64 150,66 C158,64 166,60 174,52"
    : "M122,52 C132,64 142,70 150,72 C158,70 168,64 178,52";
  return (
    <g>
      <path d={body} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <path d={neckD} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="150" y1="80" x2="150" y2="322" stroke={stroke} strokeWidth="0.4" strokeDasharray="6,6" opacity="0.08" />
    </g>
  );
};

/* ---- HOODIE ---- */
const HoodieSVG = ({ fill, stroke, sw, dash, silhouette }: GarmentProps) => {
  const isOversized = silhouette === "oversized";
  const ox = isOversized ? 8 : 0;
  const body = `M150,56 C142,56 134,54 128,52 L${116-ox},50 C${108-ox},50 ${100-ox},54 ${92-ox},58 L${68-ox*2},72 C${58-ox*2},78 ${50-ox*2},84 ${42-ox*2},90 L${22-ox*2},76 C${18-ox*2},74 ${14-ox*2},76 ${12-ox*2},80 L${2-ox*2},108 C${0-ox*2},112 ${2-ox*2},116 ${6-ox*2},118 L${44-ox},132 C${46-ox},133 ${48-ox},136 ${48-ox},138 L${46-ox},312 C${46-ox},320 ${52-ox},326 ${60-ox},326 L${240+ox},326 C${248+ox},326 ${254+ox},320 ${254+ox},312 L${252+ox},138 C${252+ox},136 ${254+ox},133 ${256+ox},132 L${294+ox*2},118 C${298+ox*2},116 ${300+ox*2},112 ${298+ox*2},108 L${288+ox*2},80 C${286+ox*2},76 ${282+ox*2},74 ${278+ox*2},76 L${258+ox*2},90 C${250+ox*2},84 ${242+ox*2},78 ${232+ox*2},72 L${208+ox},58 C${200+ox},54 ${192+ox},50 ${184+ox},50 L172,52 C166,54 158,56 150,56 Z`;
  return (
    <g>
      <path d={body} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      {/* Hood */}
      <path d="M128,52 C122,42 118,30 120,20 C124,10 136,4 150,2 C164,4 176,10 180,20 C182,30 178,42 172,52" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <path d="M128,52 C134,46 142,42 150,40 C158,42 166,46 172,52" fill="none" stroke={stroke} strokeWidth={sw} />
      {/* Hood center seam */}
      <path d="M150,2 C150,10 150,22 150,40" fill="none" stroke={stroke} strokeWidth="0.6" strokeDasharray={dash} opacity="0.25" />
      {/* Drawstrings */}
      <path d="M142,52 C140,58 138,68 140,78" fill="none" stroke={stroke} strokeWidth="1" opacity="0.35" />
      <path d="M158,52 C160,58 162,68 160,78" fill="none" stroke={stroke} strokeWidth="1" opacity="0.35" />
      <circle cx={140} cy={80} r="2" fill={stroke} opacity="0.3" />
      <circle cx={160} cy={80} r="2" fill={stroke} opacity="0.3" />
      {/* Kangaroo pocket */}
      <path d={`M${100-ox},210 C${100-ox},200 ${108-ox},194 ${118-ox},194 L${182+ox},194 C${192+ox},194 ${200+ox},200 ${200+ox},210 L${200+ox},264 C${200+ox},270 ${194+ox},274 ${188+ox},274 L${112-ox},274 C${106-ox},274 ${100-ox},270 ${100-ox},264 Z`}
        fill="none" stroke={stroke} strokeWidth="0.8" strokeDasharray={dash} opacity="0.3" />
      <line x1="150" y1="194" x2="150" y2="274" stroke={stroke} strokeWidth="0.6" opacity="0.2" />
      {/* Ribbed hem */}
      <path d={`M${60-ox},322 L${240+ox},322`} fill="none" stroke={stroke} strokeWidth="2" opacity="0.15" />
      <path d={`M${60-ox},326 L${240+ox},326`} fill="none" stroke={stroke} strokeWidth="1" opacity="0.1" />
    </g>
  );
};

/* ---- JAKET (Jacket) ---- */
const JaketSVG = ({ fill, stroke, sw, dash, silhouette }: GarmentProps) => {
  const isBomber = silhouette === "bomber";
  const body = "M150,50 L136,48 C128,50 120,52 112,48 L98,52 L74,68 C66,72 60,78 52,84 L28,70 C24,68 20,70 18,74 L8,102 C6,106 8,110 12,112 L48,126 C50,127 52,130 52,132 L50,310 C50,318 56,324 64,324 L236,324 C244,324 250,318 250,310 L248,132 C248,130 250,127 252,126 L288,112 C292,110 294,106 292,102 L282,74 C280,70 276,68 272,70 L248,84 C240,78 234,72 226,68 L202,52 L188,48 C180,52 172,50 164,48 L150,50 Z";
  return (
    <g>
      <path d={body} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      {/* Collar */}
      {isBomber ? (
        <>
          {/* Band collar for bomber */}
          <path d="M112,48 L112,38 C112,32 128,26 150,26 C172,26 188,32 188,38 L188,48" fill={fill} stroke={stroke} strokeWidth={sw} />
          <path d="M112,42 C128,36 140,34 150,34 C160,34 172,36 188,42" fill="none" stroke={stroke} strokeWidth="0.6" opacity="0.25" />
        </>
      ) : (
        <>
          {/* Lapel collar for denim */}
          <path d="M112,48 L104,26 C108,18 120,12 136,10 L150,8 L164,10 C180,12 192,18 196,26 L188,48" fill={fill} stroke={stroke} strokeWidth={sw} />
          <path d="M112,48 L128,30 L136,10" fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.3" />
          <path d="M188,48 L172,30 L164,10" fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.3" />
        </>
      )}
      {/* Center zipper */}
      <line x1="150" y1={isBomber ? "26" : "8"} x2="150" y2="322" stroke={stroke} strokeWidth="1.2" opacity="0.3" />
      <line x1="148" y1={isBomber ? "26" : "8"} x2="148" y2="322" stroke={stroke} strokeWidth="0.3" opacity="0.15" />
      <line x1="152" y1={isBomber ? "26" : "8"} x2="152" y2="322" stroke={stroke} strokeWidth="0.3" opacity="0.15" />
      {/* Zipper pull */}
      <rect x="146" y="60" width="8" height="12" rx="2" fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.35" />
      {/* Pockets */}
      <path d="M66,190 L66,250 C66,256 72,260 78,260 L120,260 C126,260 130,256 130,250 L130,190" fill="none" stroke={stroke} strokeWidth="0.8" strokeDasharray={dash} opacity="0.3" />
      <path d="M170,190 L170,250 C170,256 176,260 182,260 L224,260 C230,260 234,256 234,250 L234,190" fill="none" stroke={stroke} strokeWidth="0.8" strokeDasharray={dash} opacity="0.3" />
      {/* Ribbed hem & cuffs */}
      <path d="M64,320 L236,320" fill="none" stroke={stroke} strokeWidth="2" opacity="0.15" />
      <path d="M64,324 L236,324" fill="none" stroke={stroke} strokeWidth="1.5" opacity="0.1" />
    </g>
  );
};

/* ---- DRESS ---- */
const DressSVG = ({ fill, stroke, sw, dash, silhouette, neckline }: GarmentProps) => {
  const paths: Record<string, string> = {
    aline: "M150,46 C142,46 134,48 128,52 C120,58 112,66 104,72 L80,60 C76,58 72,60 70,64 L60,90 C58,94 60,98 64,100 L92,112 C92,114 92,118 90,122 L82,170 C78,190 68,240 48,340 C46,348 52,354 60,354 L240,354 C248,354 254,348 252,340 L232,240 C222,190 218,170 210,122 C208,118 208,114 208,112 L236,100 C240,98 242,94 240,90 L230,64 C228,60 224,58 220,60 L196,72 C188,66 180,58 172,52 C166,48 158,46 150,46 Z",
    bodycon: "M150,46 C142,46 134,48 128,52 C120,58 112,66 104,72 L80,60 C76,58 72,60 70,64 L60,90 C58,94 60,98 64,100 L92,112 C92,114 92,120 92,126 L86,170 C82,200 80,250 78,340 C78,348 84,354 92,354 L208,354 C216,354 222,348 222,340 L220,250 C218,200 214,170 208,126 C208,120 208,114 208,112 L236,100 C240,98 242,94 240,90 L230,64 C228,60 224,58 220,60 L196,72 C188,66 180,58 172,52 C166,48 158,46 150,46 Z",
    shift: "M150,46 C142,46 134,48 128,52 C120,58 112,66 104,72 L80,60 C76,58 72,60 70,64 L60,90 C58,94 60,98 64,100 L92,112 C92,114 92,118 90,122 L80,340 C80,348 86,354 94,354 L206,354 C214,354 220,348 220,340 L210,122 C208,118 208,114 208,112 L236,100 C240,98 242,94 240,90 L230,64 C228,60 224,58 220,60 L196,72 C188,66 180,58 172,52 C166,48 158,46 150,46 Z",
  };
  const necklines: Record<string, string> = {
    crew: "M128,52 C136,60 143,64 150,66 C157,64 164,60 172,52",
    vneck: "M126,52 C134,60 142,70 150,84 C158,70 166,60 174,52",
    scoop: "M124,52 C132,66 140,76 150,80 C160,76 168,66 176,52",
    sweetheart: "M126,52 C130,60 136,66 142,64 C146,62 148,58 150,56 C152,58 154,62 158,64 C164,66 170,60 174,52",
  };
  return (
    <g>
      <path d={paths[silhouette] || paths.aline} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <path d={necklines[neckline] || necklines.crew} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      {/* Waist stitch */}
      <path d="M86,170 C100,164 125,160 150,158 C175,160 200,164 214,170" fill="none" stroke={stroke} strokeWidth="0.6" strokeDasharray={dash} opacity="0.2" />
      {/* Center seam */}
      <line x1="150" y1="74" x2="150" y2="352" stroke={stroke} strokeWidth="0.4" strokeDasharray="6,6" opacity="0.08" />
    </g>
  );
};

/* ---- ROK (Skirt) ---- */
const RokSVG = ({ fill, stroke, sw, dash, silhouette }: GarmentProps) => {
  const paths: Record<string, string> = {
    aline: "M90,30 L80,30 C74,30 70,34 70,40 L70,60 C66,100 52,200 40,320 C38,328 44,334 52,334 L248,334 C256,334 262,328 260,320 L248,200 C234,100 230,60 230,40 C230,34 226,30 220,30 L210,30 Z",
    pencil: "M90,30 L80,30 C74,30 70,34 70,40 L70,60 C70,120 72,220 76,320 C76,328 82,334 90,334 L210,334 C218,334 224,328 224,320 C228,220 230,120 230,60 L230,40 C230,34 226,30 220,30 L210,30 Z",
    flare: "M90,30 L80,30 C74,30 70,34 70,40 L70,60 C62,100 40,180 20,320 C18,330 26,336 36,336 L264,336 C274,336 282,330 280,320 L260,180 C238,100 230,60 230,40 C230,34 226,30 220,30 L210,30 Z",
  };
  return (
    <g>
      <path d={paths[silhouette] || paths.aline} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      {/* Waistband */}
      <path d="M80,30 L220,30 L222,52 L78,52 Z" fill={fill} stroke={stroke} strokeWidth={sw} opacity="0.95" />
      <line x1="80" y1="44" x2="220" y2="44" stroke={stroke} strokeWidth="0.5" strokeDasharray={dash} opacity="0.2" />
      {/* Center seam */}
      <line x1="150" y1="52" x2="150" y2="330" stroke={stroke} strokeWidth="0.4" strokeDasharray="6,6" opacity="0.08" />
    </g>
  );
};

/* ---- CELANA (Pants) ---- */
const CelanaSVG = ({ fill, stroke, sw, dash, silhouette }: GarmentProps) => {
  const paths: Record<string, string> = {
    regular: "M90,30 L80,30 C74,30 70,34 70,40 L70,60 C68,80 64,110 60,150 L54,340 C54,348 60,354 68,354 L130,354 C138,354 143,348 142,340 L150,190 L158,340 C157,348 162,354 170,354 L232,354 C240,354 246,348 246,340 L240,150 C236,110 232,80 230,60 L230,40 C230,34 226,30 220,30 L210,30 Z",
    slim: "M90,30 L80,30 C74,30 70,34 70,40 L70,60 C68,80 66,110 64,150 L70,340 C70,348 76,354 84,354 L134,354 C142,354 146,348 146,340 L150,185 L154,340 C154,348 158,354 166,354 L216,354 C224,354 230,348 230,340 L236,150 C234,110 232,80 230,60 L230,40 C230,34 226,30 220,30 L210,30 Z",
    wide: "M90,30 L80,30 C74,30 70,34 70,40 L70,60 C66,80 58,120 48,170 L30,340 C28,350 36,356 46,356 L128,356 C136,356 142,350 140,340 L150,195 L160,340 C158,350 164,356 172,356 L254,356 C264,356 272,350 270,340 L252,170 C242,120 234,80 230,60 L230,40 C230,34 226,30 220,30 L210,30 Z",
  };
  return (
    <g>
      <path d={paths[silhouette] || paths.regular} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      {/* Waistband */}
      <path d="M80,30 L220,30 L222,54 L78,54 Z" fill={fill} stroke={stroke} strokeWidth={sw} opacity="0.95" />
      <line x1="82" y1="44" x2="218" y2="44" stroke={stroke} strokeWidth="0.5" strokeDasharray={dash} opacity="0.2" />
      {/* Belt loops */}
      {[95, 130, 150, 170, 205].map((x) => <rect key={x} x={x-3} y={28} width="6" height="28" rx="1" fill="none" stroke={stroke} strokeWidth="0.6" opacity="0.2" />)}
      {/* Center seam (fly) */}
      <path d="M150,54 C148,80 148,100 150,130" fill="none" stroke={stroke} strokeWidth="0.7" strokeDasharray={dash} opacity="0.25" />
      {/* Pockets - western style */}
      <path d="M80,54 C82,72 88,86 100,82 L108,54" fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.25" />
      <path d="M220,54 C218,72 212,86 200,82 L192,54" fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.25" />
      {/* Knee darts */}
      <path d="M80,240 C90,238 100,238 110,240" fill="none" stroke={stroke} strokeWidth="0.4" opacity="0.1" />
      <path d="M190,240 C200,238 210,238 220,240" fill="none" stroke={stroke} strokeWidth="0.4" opacity="0.1" />
    </g>
  );
};

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
export default function DesignDashboard() {
  const [garmentType, setGarmentType] = useState<GarmentType>("tshirt");
  const [selectedColor, setSelectedColor] = useState("#60A5FA");
  const [selectedSilhouette, setSelectedSilhouette] = useState("regular");
  const [selectedNeckline, setSelectedNeckline] = useState("crew");
  const [selectedSleeve, setSelectedSleeve] = useState("short");
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [showPocket, setShowPocket] = useState(false);
  const [projectName, setProjectName] = useState("Untitled Project");
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("Color");

  type DS = { gt: GarmentType; co: string; si: string; ne: string; sl: string; pa: string | null; po: boolean };
  const [history, setHistory] = useState<DS[]>([{ gt: "tshirt", co: "#60A5FA", si: "regular", ne: "crew", sl: "short", pa: null, po: false }]);
  const [hIdx, setHIdx] = useState(0);
  const canvasRef = useRef<SVGSVGElement>(null);

  const cur = (): DS => ({ gt: garmentType, co: selectedColor, si: selectedSilhouette, ne: selectedNeckline, sl: selectedSleeve, pa: selectedPattern, po: showPocket });
  const apply = (s: DS) => { setGarmentType(s.gt); setSelectedColor(s.co); setSelectedSilhouette(s.si); setSelectedNeckline(s.ne); setSelectedSleeve(s.sl); setSelectedPattern(s.pa); setShowPocket(s.po); };
  const push = useCallback((s: DS) => { setHistory(p => [...p.slice(0, hIdx + 1), s]); setHIdx(p => p + 1); }, [hIdx]);
  const change = (u: Partial<DS>) => { const n = { ...cur(), ...u }; apply(n); push(n); };
  const undo = () => { if (hIdx > 0) { apply(history[hIdx - 1]); setHIdx(hIdx - 1); } };
  const redo = () => { if (hIdx < history.length - 1) { apply(history[hIdx + 1]); setHIdx(hIdx + 1); } };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const svg = new XMLSerializer().serializeToString(canvasRef.current);
    const c = document.createElement("canvas"); c.width = 600; c.height = 800;
    const ctx = c.getContext("2d"); const img = new window.Image();
    img.onload = () => { ctx?.fillRect(0, 0, 600, 800); ctx && (ctx.fillStyle = "#fff"); ctx?.fillRect(0, 0, 600, 800); ctx?.drawImage(img, 0, 0, 600, 800); const a = document.createElement("a"); a.download = `${projectName}.png`; a.href = c.toDataURL("image/png"); a.click(); };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
  };

  // Silhouette options per garment
  const silOptions: Record<GarmentType, { key: string; label: string }[]> = {
    tshirt: [{ key: "regular", label: "Regular" }, { key: "slim", label: "Slim Fit" }, { key: "oversized", label: "Oversized" }, { key: "crop", label: "Crop" }],
    polo: [{ key: "regular", label: "Regular" }, { key: "slim", label: "Slim Fit" }],
    kemeja: [{ key: "regular", label: "Regular" }, { key: "slim", label: "Slim Fit" }],
    tanktop: [{ key: "regular", label: "Regular" }, { key: "racerback", label: "Racerback" }],
    hoodie: [{ key: "regular", label: "Regular" }, { key: "oversized", label: "Oversized" }],
    jaket: [{ key: "bomber", label: "Bomber" }, { key: "denim", label: "Denim" }],
    dress: [{ key: "aline", label: "A-Line" }, { key: "bodycon", label: "Bodycon" }, { key: "shift", label: "Shift" }],
    rok: [{ key: "aline", label: "A-Line" }, { key: "pencil", label: "Pencil" }, { key: "flare", label: "Flare" }],
    celana: [{ key: "regular", label: "Regular" }, { key: "slim", label: "Slim Fit" }, { key: "wide", label: "Wide Leg" }],
  };

  const neckOptions: Record<string, { key: string; label: string }[]> = {
    tshirt: [{ key: "crew", label: "Crew" }, { key: "vneck", label: "V-Neck" }, { key: "scoop", label: "Scoop" }, { key: "turtle", label: "Turtle" }],
    dress: [{ key: "crew", label: "Crew" }, { key: "vneck", label: "V-Neck" }, { key: "scoop", label: "Scoop" }, { key: "sweetheart", label: "Sweetheart" }],
  };

  const hasNeckline = ["tshirt", "dress"].includes(garmentType);
  const hasSleeve = ["tshirt", "polo", "kemeja"].includes(garmentType);
  const hasPocket = ["tshirt", "polo"].includes(garmentType);

  const colors = [
    { n: "White", h: "#FFFFFF" }, { n: "Cream", h: "#FFF8E7" }, { n: "Charcoal", h: "#333333" }, { n: "Black", h: "#111111" }, { n: "Brown", h: "#8B4513" },
    { n: "Tan", h: "#D2B48C" }, { n: "Forest", h: "#2E8B57" }, { n: "Sage", h: "#9CAF88" }, { n: "Olive", h: "#6B7B3A" }, { n: "Gray", h: "#9CA3AF" },
    { n: "Red", h: "#EF4444" }, { n: "Coral", h: "#F97066" }, { n: "Blue", h: "#60A5FA" }, { n: "Navy", h: "#1E3A5F" }, { n: "Indigo", h: "#6366F1" },
    { n: "Lavender", h: "#C4B5FD" }, { n: "Pink", h: "#F472B6" }, { n: "Rose", h: "#FDA4AF" }, { n: "Yellow", h: "#FBBF24" }, { n: "Emerald", h: "#10B981" },
  ];

  const patterns = [
    { n: "None", v: null }, { n: "Cotton", v: "cotton" }, { n: "Ribana", v: "ribana" }, { n: "Denim", v: "denim" },
    { n: "Linen", v: "linen" }, { n: "Stripes", v: "stripes" }, { n: "Plaid", v: "plaid" },
  ];

  const fill = selectedPattern ? `url(#fp)` : selectedColor;
  const stroke = "#4B5563";
  const sw = 1.6;
  const dash = "3,3";
  const vb = ["dress", "rok", "celana"].includes(garmentType) ? "0 0 300 380" : "0 0 300 350";

  const gProps: GarmentProps = { fill, stroke, sw, dash, silhouette: selectedSilhouette, neckline: selectedNeckline, sleeve: selectedSleeve, pocket: showPocket };

  const handleGarmentChange = (t: GarmentType) => {
    const defSil = silOptions[t][0].key;
    change({ gt: t, si: defSil });
  };

  const toolCats = [
    { name: "Garment", icon: <Layers size={18} /> },
    { name: "Silhouettes", icon: <Shirt size={18} /> },
    ...(hasNeckline ? [{ name: "Necklines", icon: <CircleDot size={18} /> }] : []),
    ...(hasSleeve ? [{ name: "Sleeves", icon: <RectangleHorizontal size={18} /> }] : []),
    ...(hasPocket ? [{ name: "Pockets", icon: <Scissors size={18} /> }] : []),
  ];

  const renderToolPanel = () => {
    if (!activeTool) return null;
    if (activeTool === "Garment") return (
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(GARMENT_LABELS) as GarmentType[]).map(t => (
          <button key={t} onClick={() => handleGarmentChange(t)}
            className={`p-3 rounded-xl border-2 text-xs font-semibold transition-all ${garmentType === t ? "bg-indigo-50 border-indigo-400 text-indigo-700 ring-2 ring-indigo-100" : "bg-gray-50 border-gray-100 text-gray-500 hover:border-indigo-200"}`}>
            {GARMENT_LABELS[t]}
          </button>
        ))}
      </div>
    );
    if (activeTool === "Silhouettes") return (
      <div className="grid grid-cols-2 gap-2">
        {silOptions[garmentType].map(o => (
          <button key={o.key} onClick={() => change({ si: o.key })}
            className={`p-3 rounded-xl border-2 text-xs font-semibold transition-all ${selectedSilhouette === o.key ? "bg-indigo-50 border-indigo-400 text-indigo-700 ring-2 ring-indigo-100" : "bg-gray-50 border-gray-100 text-gray-500 hover:border-indigo-200"}`}>
            {o.label}
          </button>
        ))}
      </div>
    );
    if (activeTool === "Necklines" && hasNeckline) return (
      <div className="grid grid-cols-2 gap-2">
        {(neckOptions[garmentType] || []).map(o => (
          <button key={o.key} onClick={() => change({ ne: o.key })}
            className={`p-3 rounded-xl border-2 text-xs font-semibold transition-all ${selectedNeckline === o.key ? "bg-indigo-50 border-indigo-400 text-indigo-700 ring-2 ring-indigo-100" : "bg-gray-50 border-gray-100 text-gray-500 hover:border-indigo-200"}`}>
            {o.label}
          </button>
        ))}
      </div>
    );
    if (activeTool === "Sleeves" && hasSleeve) return (
      <div className="grid grid-cols-2 gap-2">
        {["short", "long"].map(k => (
          <button key={k} onClick={() => change({ sl: k })}
            className={`p-3 rounded-xl border-2 text-xs font-semibold transition-all capitalize ${selectedSleeve === k ? "bg-indigo-50 border-indigo-400 text-indigo-700 ring-2 ring-indigo-100" : "bg-gray-50 border-gray-100 text-gray-500 hover:border-indigo-200"}`}>
            {k}
          </button>
        ))}
      </div>
    );
    if (activeTool === "Pockets" && hasPocket) return (
      <div className="grid grid-cols-2 gap-2">
        {[false, true].map(v => (
          <button key={String(v)} onClick={() => change({ po: v })}
            className={`p-3 rounded-xl border-2 text-xs font-semibold transition-all ${showPocket === v ? "bg-indigo-50 border-indigo-400 text-indigo-700 ring-2 ring-indigo-100" : "bg-gray-50 border-gray-100 text-gray-500 hover:border-indigo-200"}`}>
            {v ? "With Pocket" : "No Pocket"}
          </button>
        ))}
      </div>
    );
    return <p className="text-sm text-gray-400 italic">Tidak tersedia untuk {GARMENT_LABELS[garmentType]}</p>;
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden font-sans text-gray-800">
      {/* NAVBAR */}
      <header className="h-13 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-30 shrink-0">
        <div className="flex items-center space-x-3">
          <Link href="/workspaces" className="font-bold text-lg text-indigo-600 tracking-tight border-r pr-3 border-gray-100 hover:opacity-80"><span className="text-black">Pola</span>Tech</Link>
          <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} className="text-sm font-medium text-gray-600 bg-transparent border-none focus:ring-2 focus:ring-indigo-100 rounded-md px-2 py-1 outline-none hover:bg-gray-50 w-36" />
          <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-[11px] font-bold rounded-full border border-indigo-100">{GARMENT_LABELS[garmentType]}</span>
          <div className="flex items-center space-x-1 border-l pl-3 border-gray-100">
            {[
              { n: "Design", i: <FolderArchive size={16} />, f: () => {}, d: false },
              { n: "Undo", i: <RotateCcw size={16} />, f: undo, d: hIdx <= 0 },
              { n: "Redo", i: <RotateCw size={16} />, f: redo, d: hIdx >= history.length - 1 },
              { n: "Download", i: <FileDown size={16} />, f: handleDownload, d: false },
            ].map(b => (
              <button key={b.n} onClick={b.f} disabled={b.d} title={b.n}
                className={`flex flex-col items-center px-2 py-1 group ${b.d ? "opacity-25 cursor-not-allowed" : ""}`}>
                <div className="p-1 group-hover:bg-gray-100 rounded-full text-gray-500 group-hover:text-indigo-600">{b.i}</div>
                <span className="text-[8px] font-medium text-gray-400">{b.n}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* LEFT SIDEBAR */}
        <aside className="w-[72px] bg-white border-r border-gray-200 flex flex-col shadow-sm z-20 shrink-0">
          <nav className="flex-1 overflow-y-auto p-1.5 space-y-1.5 text-center pt-3">
            <h3 className="text-[8px] font-bold text-gray-400 uppercase mb-2 tracking-wider">Tools</h3>
            {toolCats.map(c => (
              <button key={c.name} onClick={() => setActiveTool(activeTool === c.name ? null : c.name)}
                className={`w-full flex flex-col items-center p-2 rounded-xl transition-all group border ${activeTool === c.name ? "bg-indigo-600 text-white border-indigo-600 shadow-md" : "text-gray-400 border-transparent hover:bg-indigo-50 hover:text-indigo-600"}`}>
                <div className={`${activeTool === c.name ? "text-white" : "group-hover:text-indigo-500"} mb-0.5`}>{c.icon}</div>
                <span className="text-[7px] font-medium leading-tight">{c.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* COLLAPSIBLE TOOL PANEL */}
        <div className={`bg-white border-r border-gray-100 transition-all duration-300 overflow-hidden z-10 shrink-0 ${activeTool ? "w-64" : "w-0"}`}>
          <div className="w-64 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-sm">{activeTool}</h3>
              <button onClick={() => setActiveTool(null)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400"><X size={14} /></button>
            </div>
            {renderToolPanel()}
          </div>
        </div>

        {/* CANVAS */}
        <main className="flex-1 relative bg-[#f5f6f8] flex items-center justify-center p-4 overflow-hidden">
          <div className="w-full max-w-lg aspect-[3/4] bg-white shadow-lg rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden">
            <svg ref={canvasRef} viewBox={vb} className="w-full h-full p-5 transition-all duration-500" xmlns="http://www.w3.org/2000/svg">
              <defs>
                {selectedPattern === "cotton" && <pattern id="fp" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill={selectedColor}/><circle cx="3" cy="3" r="0.4" fill="rgba(0,0,0,0.05)"/></pattern>}
                {selectedPattern === "ribana" && <pattern id="fp" width="3" height="5" patternUnits="userSpaceOnUse"><rect width="3" height="5" fill={selectedColor}/><line x1="1.5" y1="0" x2="1.5" y2="5" stroke="rgba(0,0,0,0.06)" strokeWidth="0.8"/></pattern>}
                {selectedPattern === "denim" && <pattern id="fp" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill={selectedColor}/><line x1="0" y1="4" x2="8" y2="4" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"/></pattern>}
                {selectedPattern === "linen" && <pattern id="fp" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill={selectedColor}/><line x1="0" y1="2.5" x2="5" y2="2.5" stroke="rgba(0,0,0,0.03)" strokeWidth="0.4"/><line x1="2.5" y1="0" x2="2.5" y2="5" stroke="rgba(0,0,0,0.03)" strokeWidth="0.4"/></pattern>}
                {selectedPattern === "stripes" && <pattern id="fp" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill={selectedColor}/><rect x="0" y="0" width="4" height="8" fill="rgba(255,255,255,0.12)"/></pattern>}
                {selectedPattern === "plaid" && <pattern id="fp" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill={selectedColor}/><rect x="0" y="0" width="8" height="8" fill="rgba(0,0,0,0.06)"/><rect x="8" y="8" width="8" height="8" fill="rgba(0,0,0,0.06)"/></pattern>}
                <filter id="gs" x="-5%" y="-5%" width="110%" height="115%"><feGaussianBlur in="SourceAlpha" stdDeviation="4"/><feOffset dy="6"/><feComponentTransfer><feFuncA type="linear" slope="0.1"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>
              <g filter="url(#gs)">
                {garmentType === "tshirt" && <TShirtSVG {...gProps} />}
                {garmentType === "polo" && <PoloSVG {...gProps} />}
                {garmentType === "kemeja" && <KemejaSVG {...gProps} />}
                {garmentType === "tanktop" && <TankTopSVG {...gProps} />}
                {garmentType === "hoodie" && <HoodieSVG {...gProps} />}
                {garmentType === "jaket" && <JaketSVG {...gProps} />}
                {garmentType === "dress" && <DressSVG {...gProps} />}
                {garmentType === "rok" && <RokSVG {...gProps} />}
                {garmentType === "celana" && <CelanaSVG {...gProps} />}
              </g>
            </svg>
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="w-64 bg-white border-l border-gray-200 p-4 overflow-y-auto flex flex-col z-20 shrink-0">
          <section className="space-y-4">
            <header>
              <h2 className="font-bold text-gray-900 text-sm">Technical Sketch</h2>
              <p className="text-[10px] text-gray-400">Configure pattern details</p>
            </header>
            <div className="flex gap-2">
              {[{ n: "Color", i: <Palette size={16} /> }, { n: "Pattern", i: <Square size={16} /> }].map(it => (
                <button key={it.n} onClick={() => setActiveCategory(it.n)}
                  className={`w-full flex flex-col items-center p-2 rounded-xl border transition-all ${activeCategory === it.n ? "bg-indigo-600 text-white border-indigo-600 shadow-md" : "bg-white text-gray-400 border-gray-100 hover:bg-indigo-50"}`}>
                  <div className={`mb-0.5 ${activeCategory === it.n ? "text-white" : "text-gray-400"}`}>{it.i}</div>
                  <span className="text-[8px] font-medium capitalize">{it.n}</span>
                </button>
              ))}
            </div>
            <div className="pt-1">
              {activeCategory === "Color" && (
                <div>
                  <div className="flex items-center gap-2 mb-4 p-2.5 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 rounded-lg border-2 border-white shadow-sm ring-1 ring-gray-200" style={{ backgroundColor: selectedColor }} />
                    <div>
                      <p className="text-[11px] font-medium text-gray-700">Warna Aktif</p>
                      <p className="text-[9px] text-gray-400 font-mono">{selectedColor}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-2.5">
                    {colors.map(c => (
                      <div key={c.h} className="flex flex-col items-center space-y-0.5">
                        <button onClick={() => change({ co: c.h })}
                          className={`w-8 h-8 rounded-full border-2 shadow-sm hover:scale-110 transition-transform active:scale-95 ${selectedColor === c.h ? "border-indigo-500 ring-2 ring-indigo-200 scale-110" : "border-white ring-1 ring-gray-200"}`}
                          style={{ backgroundColor: c.h }} title={c.n} />
                        <span className="text-[7px] font-medium text-gray-400 text-center w-9 truncate">{c.n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeCategory === "Pattern" && (
                <div className="space-y-1.5">
                  {patterns.map(p => (
                    <button key={p.n} onClick={() => change({ pa: p.v })}
                      className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border transition-all text-left ${selectedPattern === p.v ? "bg-indigo-50 border-indigo-400 ring-1 ring-indigo-200" : "bg-gray-50 border-gray-100 hover:border-indigo-200"}`}>
                      <div className={`w-6 h-6 rounded-md border ${selectedPattern === p.v ? "border-indigo-300" : "border-gray-200"}`} style={{ backgroundColor: p.v ? "#d1d5db" : "#fff" }} />
                      <span className={`text-xs font-medium ${selectedPattern === p.v ? "text-indigo-700" : "text-gray-600"}`}>{p.n}</span>
                    </button>
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
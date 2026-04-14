import { useState } from "react";
import { VARIASI_POLA } from "@/app/constants/patterns";

export const pocketOffsets: Record<string, string> = {
  slanted_welt_pocket: "translate(0, 12)",
  u_line_pocket: "translate(0, 0)",
  kangaroo_pocket: "translate(0, -2)",
  none: "translate(0, 0)",
};

export function useDesignCanvas() {
  const [body, setBody] = useState<keyof typeof VARIASI_POLA.body>("shirt");
  const [necklines, setNecklines] = useState<keyof typeof VARIASI_POLA.necklines>("round_neck_binding");
  const [sleeves, setSleeves] = useState<keyof typeof VARIASI_POLA.sleeves>("short_sleeves");
  const [pocket, setPocket] = useState<keyof typeof VARIASI_POLA.pocket>("none");
  const [primaryColor, setPrimaryColor] = useState("#6366f1");

  const updatePart = (type: string, value: any) => {
    switch (type) {
      case "Silhouettes": setBody(value); break;
      case "Necklines": setNecklines(value); break;
      case "Sleeves": setSleeves(value); break;
      case "Pockets": setPocket(value); break;
      case "Color": setPrimaryColor(value); break;
    }
  };

  return {
    states: { body, necklines, sleeves, pocket, primaryColor },
    updatePart,
  };
}
import { useState } from "react";
import { VARIASI_POLA } from "@/app/constants/patterns";

export const pocketOffsets: Record<string, string> = {
  slanted_welt_pocket: "translate(0, 12)",
  u_line_pocket: "translate(0, 0)",
  kangaroo_pocket: "translate(0, -2)",
  none: "translate(0, 0)",
};

export interface DesignState {
  body: keyof typeof VARIASI_POLA.body;
  necklines: keyof typeof VARIASI_POLA.necklines;
  sleeves: keyof typeof VARIASI_POLA.sleeves;
  pocket: keyof typeof VARIASI_POLA.pocket;
  primaryColor: string;
  pattern: string | null; // Now part of the core state
}

const initialState: DesignState = {
  body: "shirt",
  necklines: "round_neck_binding",
  sleeves: "short_sleeves",
  pocket: "none",
  primaryColor: "#6366f1",
  pattern: null,
};

export function useDesignCanvas() {
  const [past, setPast] = useState<DesignState[]>([]);
  const [present, setPresent] = useState<DesignState>(initialState);
  const [future, setFuture] = useState<DesignState[]>([]);

  const updatePart = (type: string, value: any) => {
    let key: keyof DesignState | null = null;
    
    switch (type) {
      case "Silhouettes": key = "body"; break;
      case "Necklines": key = "necklines"; break;
      case "Sleeves": key = "sleeves"; break;
      case "Pockets": key = "pocket"; break;
      case "Color": key = "primaryColor"; break;
      case "Pattern": key = "pattern"; break;
    }

    if (key && present[key] !== value) {
      const newState = { ...present, [key]: value };
      
      setPast([...past, present]);
      setPresent(newState);
      setFuture([]); // Clear future on new action
    }
  };

  const undo = () => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    
    setFuture([present, ...future]);
    setPresent(previous);
    setPast(newPast);
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    
    setPast([...past, present]);
    setPresent(next);
    setFuture(newFuture);
  };

  const loadConfig = (config: DesignState) => {
    setPast([]);
    setFuture([]);
    setPresent({ ...initialState, ...config });
  };

  return {
    states: present,
    updatePart,
    undo,
    redo,
    loadConfig,
    canUndo: past.length > 0,
    canRedo: future.length > 0
  };
}
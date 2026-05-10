// Plan feature definitions & utilities

export type PlanType = "lite" | "pro" | "business";

export interface PlanFeatures {
  max_designs: number;
  export_formats: string[];
  custom_fabric: boolean;
  size_grading: boolean;
  canvas_drawing: boolean;
  ai_assistant: boolean;
  watermark: boolean;
  material_report: boolean;
  multi_user: boolean;
}

export const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  lite: {
    max_designs: 5,
    export_formats: ["svg", "pdf"],
    custom_fabric: true,
    size_grading: false,
    canvas_drawing: false,
    ai_assistant: false,
    watermark: false,
    material_report: false,
    multi_user: false,
  },
  pro: {
    max_designs: -1,
    export_formats: ["svg", "pdf", "png"],
    custom_fabric: true,
    size_grading: true,
    canvas_drawing: false,
    ai_assistant: false,
    watermark: false,
    material_report: false,
    multi_user: false,
  },
  business: {
    max_designs: -1,
    export_formats: ["svg", "pdf", "png"],
    custom_fabric: true,
    size_grading: true,
    canvas_drawing: true,
    ai_assistant: true,
    watermark: true,
    material_report: true,
    multi_user: true,
  },
};

export function getUserPlan(): PlanType {
  if (typeof window === "undefined") return "lite";
  const session = localStorage.getItem("user_session");
  if (!session) return "lite";
  try {
    const parsed = JSON.parse(session);
    return (parsed.plan as PlanType) || "lite";
  } catch {
    return "lite";
  }
}

export function getFeatures(plan?: PlanType): PlanFeatures {
  const p = plan || getUserPlan();
  return PLAN_FEATURES[p] || PLAN_FEATURES.lite;
}

export function canAccess(feature: keyof PlanFeatures, plan?: PlanType): boolean {
  const features = getFeatures(plan);
  const val = features[feature];
  if (typeof val === "boolean") return val;
  if (typeof val === "number") return val !== 0;
  if (Array.isArray(val)) return val.length > 0;
  return false;
}

export const PLAN_LABELS: Record<PlanType, string> = {
  lite: "Lite",
  pro: "Pro",
  business: "Business",
};

export const PLAN_COLORS: Record<PlanType, string> = {
  lite: "bg-gray-100 text-gray-600",
  pro: "bg-indigo-100 text-indigo-700",
  business: "bg-amber-100 text-amber-700",
};

// Size grading scales
export const SIZE_SCALES: Record<string, number> = {
  XS: 0.85,
  S: 0.92,
  M: 1.0,
  L: 1.08,
  XL: 1.16,
  XXL: 1.24,
};

// Material estimation (meters of fabric per garment type per size M)
export const BASE_MATERIAL: Record<string, { fabric_m: number; label: string }> = {
  shirt: { fabric_m: 1.5, label: "Kemeja/Shirt" },
  polo: { fabric_m: 1.3, label: "Polo" },
  tshirt: { fabric_m: 1.2, label: "T-Shirt" },
  tanktop: { fabric_m: 0.8, label: "Tank Top" },
  hoodie: { fabric_m: 2.0, label: "Hoodie" },
};

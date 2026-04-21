"use client";

import React from "react";
import { AlertCircle, X, CheckCircle2 } from "lucide-react";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "error" | "success" | "warning";
}

export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = "error",
}: AlertModalProps) {
  if (!isOpen) return null;

  // Konfigurasi warna berdasarkan tipe alert
  const config = {
    error: {
      icon: <AlertCircle className="text-red-700" size={40} />,
      button: "bg-red-500 hover:bg-red-700 shadow-red-700",
      border: "border-red-100",
      titleColor: "text-red-700",
    },
    success: {
      icon: <CheckCircle2 className="text-emerald-500" size={40} />,
      button: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200",
      border: "border-emerald-100",
      titleColor: "text-emerald-700",
    },
    warning: {
      icon: <AlertCircle className="text-amber-500" size={40} />,
      button: "bg-amber-500 hover:bg-amber-600 shadow-amber-200",
      border: "border-amber-100",
      titleColor: "text-amber-700",
    },
  };

  const currentStyle = config[type];

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-white/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div
        className={`relative bg-white w-full max-w-sm rounded-2rem shadow-2xl p-8 flex flex-col items-center text-center animate-in fade-in zoom-in duration-200 border-2 ${currentStyle.border}`}
      >
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-300 hover:text-gray-500 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Icon Section */}
        <div className="mb-4">{currentStyle.icon}</div>

        {/* Text Content */}
        <h3 className={`text-xl font-bold mb-2 ${currentStyle.titleColor}`}>
          {title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">{message}</p>

        {/* Action Button */}
        <button
          onClick={onClose}
          className={`w-full py-3 rounded-xl text-white font-bold text-sm transition-all active:scale-95 shadow-lg ${currentStyle.button}`}
        >
          MENGERTI
        </button>
      </div>
    </div>
  );
}

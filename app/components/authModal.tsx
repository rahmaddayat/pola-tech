"use client";

import React, { useState, useEffect } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, initialView = "login" }: AuthModalProps) {
  const [view, setView] = useState<"login" | "signup">(initialView);

  // Sinkronisasi state tampilan saat initialView berubah dari props
  useEffect(() => {
    setView(initialView);
  }, [initialView, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* --- BACKDROP WITH BLUR (Halaman di belakang blur) --- */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* --- MODAL CONTAINER --- */}
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 flex flex-col items-center animate-in fade-in zoom-in duration-300">
        
        {/* Tombol Tutup (X) */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-300 hover:text-gray-500 transition-colors"
        >
          {/* <X size={30} strokeWidth={1.5} /> */}
        </button>

        {view === "login" ? (
          /* ================= LOGIN VIEW ================= */
          <>
            <h2 className="text-3xl font-light text-gray-700 mb-8 mt-4 text-center leading-tight">
              Hello and Welcome Back!
            </h2>

            {/* Tombol Facebook */}
            <button className="text-[#3b5998] hover:scale-110 transition-transform mb-6">
              {/* <Facebook size={45} fill="currentColor" stroke="none" /> */}
            </button>

            {/* Pemisah "or" */}
            <div className="flex items-center w-full mb-8 text-gray-300">
              <div className="grow h-px bg-gray-100"></div>
              <span className="px-4 text-sm font-light">or</span>
              <div className="grow h-px bg-gray-100"></div>
            </div>

            {/* Input Fields */}
            <div className="w-full space-y-5">
              <input type="email" placeholder="Email" className="auth-field" />
              <div className="relative">
                <input type="password" placeholder="Password" defaultValue="" className="auth-field text-gray-400" />
              </div>
            </div>

            {/* Remember me & Forgot Pass */}
            <div className="w-full flex items-center justify-between mt-5 mb-10 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer text-gray-400 group">
                {/* Checkbox diubah jadi indigo agar selaras */}
                <input type="checkbox" className="w-4 h-4 border-gray-200 rounded text-indigo-500 focus:ring-0" />
                <span className="group-hover:text-gray-600 transition-colors">Remember me</span>
              </label>
              <button className="text-gray-300 hover:text-gray-500 transition-colors">Forgot password?</button>
            </div>

            {/* --- TOMBOL SUBMIT (Diubah ke indigo-600) --- */}
            <button className="auth-submit uppercase">LOG IN</button>

            {/* Navigasi ke Sign Up */}
            <p className="text-gray-400 text-sm mt-8">
              Don't have an account?{" "}
              <button onClick={() => setView("signup")} className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">Sign up!</button>
            </p>
          </>
        ) : (
          /* ================= SIGN UP VIEW ================= */
          <>
            <h2 className="text-4xl font-light text-gray-700 mb-12 mt-4 text-center leading-tight">
              Create an account
            </h2>

            {/* Input Fields (Sesuai gambar referensi) */}
            <div className="w-full space-y-8 pt-2">
              <input type="email" placeholder="Email *" className="auth-field" />
              
              <div className="relative pt-2">
                <input type="password" placeholder="Password *" className="auth-field" />
                <span className="absolute -bottom-5 right-0 text-[10px] text-gray-300 italic">0 / 20</span>
              </div>

              <div className="relative pt-2">
                <input type="password" placeholder="Password confirmation *" className="auth-field" />
                <span className="absolute -bottom-5 right-0 text-[10px] text-gray-300 italic">0 / 20</span>
              </div>
            </div>

            {/* --- TOMBOL SUBMIT (Diubah ke indigo-600) --- */}
            <button className="auth-submit mt-14 mb-6 uppercase">
              CREATE ACCOUNT
            </button>

            {/* Footer Sign Up */}
            <div className="text-center space-y-4 pt-2">
              <p className="text-gray-400 text-[11px] leading-relaxed px-2">
                By clicking "CREATE ACCOUNT"<br />
                I agree to PolaTech's <button className="hover:underline">Terms of Service</button>
              </p>
              
              <p className="text-gray-400 text-sm pt-4">
                Already have an account?{" "}
                <button onClick={() => setView("login")} className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">Sign in!</button>
              </p>
            </div>
          </>
        )}
      </div>

      {/* --- STYLES (Menggunakan warna indigo) --- */}
      <style jsx>{`
        .auth-field {
          width: 100%;
          padding: 1rem 1.25rem;
          border: 1px solid #f3f4f6;
          border-radius: 0.75rem;
          outline: none;
          font-size: 0.95rem;
          transition: all 0.2s;
        }
        .auth-field:focus {
          border-color: #a5b4fc; /* indigo-200 saat focus */
          background-color: #fcfcff;
        }
        .auth-field::placeholder {
          color: #d1d5db;
        }
        .auth-submit {
          width: 100%;
          background-color: #4f46e5; /* indigo-600 */
          color: white;
          font-weight: 700;
          padding: 1.1rem;
          border-radius: 0.75rem;
          letter-spacing: 0.05em;
          transition: all 0.2s;
          box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.2); /* Shadow warna indigo */
        }
        .auth-submit:hover {
          background-color: #4338ca; /* indigo-700 */
          transform: translateY(-1px);
          box-shadow: 0 12px 20px -3px rgba(79, 70, 229, 0.3);
        }
        .auth-submit:active {
          transform: scale(0.98);
          background-color: #3730a3; /* indigo-800 */
        }
      `}</style>
    </div>
  );
}
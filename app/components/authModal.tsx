"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, initialView = "login" }: AuthModalProps) {
  const [view, setView] = useState<"login" | "signup">(initialView);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sinkronisasi state tampilan saat initialView berubah dari props
  useEffect(() => {
    setView(initialView);
    setErrors({});
  }, [initialView, isOpen]);

  // Reset form saat view berubah
  useEffect(() => {
    setErrors({});
  }, [view]);

  if (!isOpen) return null;

  const validateLogin = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!loginEmail.trim()) newErrors.loginEmail = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) newErrors.loginEmail = "Format email tidak valid";
    if (!loginPassword.trim()) newErrors.loginPassword = "Password wajib diisi";
    else if (loginPassword.length < 6) newErrors.loginPassword = "Password minimal 6 karakter";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignup = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!signupEmail.trim()) newErrors.signupEmail = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) newErrors.signupEmail = "Format email tidak valid";
    if (!signupPassword.trim()) newErrors.signupPassword = "Password wajib diisi";
    else if (signupPassword.length < 6) newErrors.signupPassword = "Password minimal 6 karakter";
    if (signupPassword !== signupConfirm) newErrors.signupConfirm = "Konfirmasi password tidak cocok";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    alert("Login berhasil! (Demo)");
    onClose();
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignup()) return;
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    alert("Akun berhasil dibuat! (Demo)");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* --- BACKDROP WITH BLUR --- */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* --- MODAL CONTAINER --- */}
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 flex flex-col items-center animate-in fade-in zoom-in duration-300">
        
        {/* Tombol Tutup (X) */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-all"
          aria-label="Tutup modal"
        >
          <X size={22} strokeWidth={1.5} />
        </button>

        {view === "login" ? (
          /* ================= LOGIN VIEW ================= */
          <form onSubmit={handleLogin} className="w-full flex flex-col items-center">
            <h2 className="text-3xl font-light text-gray-700 mb-8 mt-4 text-center leading-tight">
              Hello and Welcome Back!
            </h2>

            {/* Pemisah */}
            <div className="flex items-center w-full mb-8 text-gray-300">
              <div className="grow h-px bg-gray-100"></div>
              <span className="px-4 text-sm font-light">masuk dengan email</span>
              <div className="grow h-px bg-gray-100"></div>
            </div>

            {/* Input Fields */}
            <div className="w-full space-y-4">
              <div>
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className={`auth-field ${errors.loginEmail ? "!border-red-300 !bg-red-50/50" : ""}`}
                />
                {errors.loginEmail && <span className="text-red-400 text-xs mt-1 block pl-2">{errors.loginEmail}</span>}
              </div>
              <div>
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={`auth-field ${errors.loginPassword ? "!border-red-300 !bg-red-50/50" : ""}`}
                />
                {errors.loginPassword && <span className="text-red-400 text-xs mt-1 block pl-2">{errors.loginPassword}</span>}
              </div>
            </div>

            {/* Remember me & Forgot Pass */}
            <div className="w-full flex items-center justify-between mt-5 mb-10 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer text-gray-400 group">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 border-gray-200 rounded text-indigo-500 focus:ring-0" 
                />
                <span className="group-hover:text-gray-600 transition-colors">Remember me</span>
              </label>
              <button type="button" className="text-gray-300 hover:text-gray-500 transition-colors">Forgot password?</button>
            </div>

            {/* TOMBOL SUBMIT */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="auth-submit uppercase disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  MEMPROSES...
                </>
              ) : "LOG IN"}
            </button>

            {/* Navigasi ke Sign Up */}
            <p className="text-gray-400 text-sm mt-8">
              Don&apos;t have an account?{" "}
              <button type="button" onClick={() => setView("signup")} className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">Sign up!</button>
            </p>
          </form>
        ) : (
          /* ================= SIGN UP VIEW ================= */
          <form onSubmit={handleSignup} className="w-full flex flex-col items-center">
            <h2 className="text-4xl font-light text-gray-700 mb-12 mt-4 text-center leading-tight">
              Create an account
            </h2>

            {/* Input Fields */}
            <div className="w-full space-y-6 pt-2">
              <div>
                <input 
                  type="email" 
                  placeholder="Email *" 
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className={`auth-field ${errors.signupEmail ? "!border-red-300 !bg-red-50/50" : ""}`}
                />
                {errors.signupEmail && <span className="text-red-400 text-xs mt-1 block pl-2">{errors.signupEmail}</span>}
              </div>

              <div className="relative">
                <input 
                  type="password" 
                  placeholder="Password *" 
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className={`auth-field ${errors.signupPassword ? "!border-red-300 !bg-red-50/50" : ""}`}
                />
                <span className={`absolute -bottom-5 right-0 text-[10px] italic ${signupPassword.length > 0 ? "text-indigo-500" : "text-gray-300"}`}>
                  {signupPassword.length} / 20
                </span>
                {errors.signupPassword && <span className="text-red-400 text-xs mt-1 block pl-2">{errors.signupPassword}</span>}
              </div>

              <div className="relative pt-2">
                <input 
                  type="password" 
                  placeholder="Password confirmation *" 
                  value={signupConfirm}
                  onChange={(e) => setSignupConfirm(e.target.value)}
                  className={`auth-field ${errors.signupConfirm ? "!border-red-300 !bg-red-50/50" : ""}`}
                />
                <span className={`absolute -bottom-5 right-0 text-[10px] italic ${signupConfirm.length > 0 ? "text-indigo-500" : "text-gray-300"}`}>
                  {signupConfirm.length} / 20
                </span>
                {errors.signupConfirm && <span className="text-red-400 text-xs mt-1 block pl-2">{errors.signupConfirm}</span>}
              </div>
            </div>

            {/* TOMBOL SUBMIT */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="auth-submit mt-14 mb-6 uppercase disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  MEMPROSES...
                </>
              ) : "CREATE ACCOUNT"}
            </button>

            {/* Footer Sign Up */}
            <div className="text-center space-y-4 pt-2">
              <p className="text-gray-400 text-[11px] leading-relaxed px-2">
                By clicking &quot;CREATE ACCOUNT&quot;<br />
                I agree to PolaTech&apos;s <button type="button" className="hover:underline">Terms of Service</button>
              </p>
              
              <p className="text-gray-400 text-sm pt-4">
                Already have an account?{" "}
                <button type="button" onClick={() => setView("login")} className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">Sign in!</button>
              </p>
            </div>
          </form>
        )}
      </div>

      {/* --- STYLES --- */}
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
        .auth-submit:hover:not(:disabled) {
          background-color: #4338ca; /* indigo-700 */
          transform: translateY(-1px);
          box-shadow: 0 12px 20px -3px rgba(79, 70, 229, 0.3);
        }
        .auth-submit:active:not(:disabled) {
          transform: scale(0.98);
          background-color: #3730a3; /* indigo-800 */
        }
      `}</style>
    </div>
  );
}
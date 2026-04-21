"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, CheckCircle, AlertTriangle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, initialView = "login" }: AuthModalProps) {
  const [view, setView] = useState<"login" | "signup">(initialView);
  
  // Form States
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    setView(initialView);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setNama("");
    setErrorMsg("");
    setSuccessMsg("");
  }, [initialView, isOpen]);

  // --- HANDLE LOGIN via Backend API ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Login gagal. Periksa email & password.");
        return;
      }

      // Store user + token for protected API calls
      localStorage.setItem(
        "user_session",
        JSON.stringify({
          id: data.user.id_user,
          name: data.user.nama,
          email: data.user.email,
          role: data.user.role,
          token: data.token,
        })
      );

      setSuccessMsg(`Selamat datang, ${data.user.nama}!`);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 800);
    } catch {
      setErrorMsg("Server tidak merespons. Pastikan backend menyala di port 5000.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLE REGISTER via Backend API ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Password konfirmasi tidak cocok!");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password minimal 6 karakter.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: nama || email.split("@")[0], email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Registrasi gagal.");
        return;
      }

      setSuccessMsg("Akun berhasil dibuat! Silakan login.");
      setTimeout(() => {
        setView("login");
        setSuccessMsg("");
        setPassword("");
        setConfirmPassword("");
      }, 1500);
    } catch {
      setErrorMsg("Server tidak merespons. Pastikan backend menyala di port 5000.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 flex flex-col items-center animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-300 hover:text-gray-500">
          <X size={30} strokeWidth={1.5} />
        </button>

        <form onSubmit={view === "login" ? handleLogin : handleRegister} className="w-full flex flex-col items-center">
          {view === "login" ? (
            <>
              <h2 className="text-3xl font-light text-gray-700 mb-8 mt-4">Hello and Welcome Back!</h2>

              <div className="flex items-center w-full mb-8 text-gray-300">
                <div className="grow h-px bg-gray-100"></div>
                <span className="px-4 text-sm">Login dengan email</span>
                <div className="grow h-px bg-gray-100"></div>
              </div>

              <div className="w-full space-y-5">
                <input 
                  type="email" placeholder="Email" required className="auth-field"
                  value={email} onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
                />
                <input 
                  type="password" placeholder="Password" required className="auth-field"
                  value={password} onChange={(e) => { setPassword(e.target.value); setErrorMsg(""); }}
                />
              </div>

              <div className="w-full flex justify-between mt-5 mb-6 text-xs text-gray-400">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded text-indigo-500 focus:ring-0" />
                  <span>Remember me</span>
                </label>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-light text-gray-700 mb-12 mt-4">Create an account</h2>
              <div className="w-full space-y-5">
                <input 
                  type="text" placeholder="Nama Lengkap *" required className="auth-field"
                  value={nama} onChange={(e) => { setNama(e.target.value); setErrorMsg(""); }}
                />
                <input 
                  type="email" placeholder="Email *" required className="auth-field"
                  value={email} onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
                />
                <input 
                  type="password" placeholder="Password *" required className="auth-field"
                  value={password} onChange={(e) => { setPassword(e.target.value); setErrorMsg(""); }}
                />
                <input 
                  type="password" placeholder="Konfirmasi Password *" required className="auth-field"
                  value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setErrorMsg(""); }}
                />
              </div>
            </>
          )}

          {/* Error / Success Messages */}
          {errorMsg && (
            <div className="w-full mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm animate-in fade-in duration-200">
              <AlertTriangle size={18} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="w-full mt-4 p-3 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 text-green-600 text-sm animate-in fade-in duration-200">
              <CheckCircle size={18} className="flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button type="submit" disabled={isLoading} className="auth-submit uppercase flex items-center justify-center gap-2">
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            {isLoading ? "Processing..." : view === "login" ? "LOG IN" : "CREATE ACCOUNT"}
          </button>

          <p className="text-gray-400 text-sm mt-8">
            {view === "login" ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              onClick={() => { setView(view === "login" ? "signup" : "login"); setErrorMsg(""); setSuccessMsg(""); }} 
              className="text-indigo-600 font-semibold"
            >
              {view === "login" ? "Sign up!" : "Sign in!"}
            </button>
          </p>
        </form>
      </div>

      <style jsx>{`
        .auth-field {
          width: 100%;
          padding: 1rem 1.25rem;
          border: 1px solid #f3f4f6;
          border-radius: 0.75rem;
          outline: none;
          color: black;
          transition: all 0.2s;
        }
        .auth-field:focus { border-color: #a5b4fc; background-color: #fcfcff; box-shadow: 0 0 0 3px rgba(99,102,241,0.08); }
        .auth-submit {
          width: 100%;
          background-color: #4f46e5;
          color: white;
          font-weight: 700;
          padding: 1.1rem;
          border-radius: 0.75rem;
          margin-top: 1.5rem;
          transition: all 0.2s;
        }
        .auth-submit:hover:not(:disabled) { background-color: #4338ca; transform: translateY(-1px); }
        .auth-submit:disabled { background-color: #9ca3af; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
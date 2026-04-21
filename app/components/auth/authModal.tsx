"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, initialView = "login" }: AuthModalProps) {
  const [view, setView] = useState<"login" | "signup">(initialView);
  
  // Form States
  const [identifier, setIdentifier] = useState(""); // Bisa diisi Email atau Username
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setView(initialView);
    // Reset semua field saat modal terbuka/tutup
    setIdentifier("");
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
  }, [initialView, isOpen]);

  // --- HANDLE LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Selamat datang kembali, ${data.username}!`);
        localStorage.setItem("user_session", JSON.stringify(data));
        onClose();
        window.location.reload(); 
      } else {
        alert(data.error || "Kredensial tidak valid.");
      }
    } catch (error) {
      alert("Gagal terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLE REGISTER ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Konfirmasi password tidak sesuai!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Pendaftaran berhasil! Silakan login.");
        setView("login");
      } else {
        alert(data.error || "Gagal mendaftar.");
      }
    } catch (error) {
      alert("Terjadi kesalahan koneksi database.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 flex flex-col items-center animate-in fade-in zoom-in duration-300">
        {/* <button onClick={onClose} className="absolute top-8 right-8 text-gray-300 hover:text-gray-500 transition-colors">
          <X size={30} strokeWidth={1.5} />
        </button> */}

        <form onSubmit={view === "login" ? handleLogin : handleRegister} className="w-full flex flex-col items-center">
          {view === "login" ? (
            <>
              <h2 className="text-3xl font-light text-gray-700 mb-8 mt-4 text-center">Hello and Welcome Back!</h2>
              
              <div className="w-full space-y-5">
                <input 
                  type="text" placeholder="Email or Username" required className="auth-field text-black"
                  value={identifier} onChange={(e) => setIdentifier(e.target.value)} 
                />
                
                <div className="relative w-full">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" required className="auth-field pr-12 text-black"
                    value={password} onChange={(e) => setPassword(e.target.value)} 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="w-full flex justify-between mt-5 mb-10 text-xs text-gray-400">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded text-indigo-500 focus:ring-0" />
                  <span>Remember me</span>
                </label>
                <button type="button" className="hover:text-indigo-500 transition-colors">Forgot password?</button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-light text-gray-700 mb-8 mt-4 text-center">Create account</h2>
              <div className="w-full space-y-4 mb-6">
                <input 
                  type="text" placeholder="Username *" required className="auth-field text-black"
                  value={username} onChange={(e) => setUsername(e.target.value)} 
                />
                <input 
                  type="email" placeholder="Email *" required className="auth-field text-black"
                  value={email} onChange={(e) => setEmail(e.target.value)} 
                />
                
                {/* Main Password */}
                <div className="relative w-full">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password *" required className="auth-field pr-12 text-black"
                    value={password} onChange={(e) => setPassword(e.target.value)} 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Confirm Password (follows showPassword state) */}
                <div className="relative w-full">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Confirm Password *" required className="auth-field pr-12 text-black"
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </>
          )}

          <button type="submit" disabled={isLoading} className="auth-submit uppercase tracking-wider">
            {isLoading ? "Processing..." : view === "login" ? "LOG IN" : "CREATE ACCOUNT"}
          </button>

          <p className="text-gray-400 text-sm mt-8">
            {view === "login" ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              onClick={() => setView(view === "login" ? "signup" : "login")} 
              className="text-indigo-600 font-semibold hover:underline underline-offset-4 transition-all"
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
          transition: all 0.2s ease-in-out;
        }
        .auth-field:focus { 
          border-color: #4f46e5; 
          background-color: #fcfcff;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.05);
        }
        .auth-submit {
          width: 100%;
          background-color: #4f46e5;
          color: white;
          font-weight: 700;
          padding: 1.1rem;
          border-radius: 0.75rem;
          margin-top: 1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .auth-submit:hover:not(:disabled) { 
          background-color: #4338ca; 
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
        }
        .auth-submit:active:not(:disabled) {
          transform: translateY(0);
        }
        .auth-submit:disabled { 
          background-color: #9ca3af; 
          cursor: not-allowed; 
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { DUMMY_USERS } from "@/app/lib/placeholder-data";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, initialView = "login" }: AuthModalProps) {
  const [view, setView] = useState<"login" | "signup">(initialView);
  
  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setView(initialView);
    // Reset form fields when modal opens/closes
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  }, [initialView, isOpen]);

  // --- HANDLE LOGIN ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      // Ambil user hasil register dari localStorage
      const registeredUsers = JSON.parse(localStorage.getItem("registered_users") || "[]");
      
      // Gabungkan data file dengan data dinamis
      const allUsers = [...DUMMY_USERS, ...registeredUsers];
      
      const userFound = allUsers.find(u => u.email === email && u.password === password);

      if (userFound) {
        alert(`Selamat datang kembali, ${userFound.name}!`);
        localStorage.setItem("user_session", JSON.stringify(userFound));
        onClose();
      } else {
        alert("Email atau password salah.");
      }
      setIsLoading(false);
    }, 1000);
  };

  // --- HANDLE REGISTER ---
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Password konfirmasi tidak cocok!");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const newUser = {
        id: Date.now().toString(),
        name: email.split("@")[0], // Dummy name based on email
        email,
        password,
        avatar: `https://ui-avatars.com/api/?name=${email[0]}`
      };

      // Simpan ke localStorage agar bisa dipakai login
      const currentRegisters = JSON.parse(localStorage.getItem("registered_users") || "[]");
      localStorage.setItem("registered_users", JSON.stringify([...currentRegisters, newUser]));

      alert("Akun berhasil dibuat! Data tersimpan di database lokal (browser).");
      setView("login");
      setIsLoading(false);
    }, 1200);
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
                <span className="px-4 text-sm">or</span>
                <div className="grow h-px bg-gray-100"></div>
              </div>

              <div className="w-full space-y-5">
                <input 
                  type="email" placeholder="Email" required className="auth-field"
                  value={email} onChange={(e) => setEmail(e.target.value)} 
                />
                <input 
                  type="password" placeholder="Password" required className="auth-field"
                  value={password} onChange={(e) => setPassword(e.target.value)} 
                />
              </div>

              <div className="w-full flex justify-between mt-5 mb-10 text-xs text-gray-400">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded text-indigo-500 focus:ring-0" />
                  <span>Remember me</span>
                </label>
                <button type="button">Forgot password?</button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-light text-gray-700 mb-12 mt-4">Create an account</h2>
              <div className="w-full space-y-8">
                <input 
                  type="email" placeholder="Email *" required className="auth-field"
                  value={email} onChange={(e) => setEmail(e.target.value)} 
                />
                <input 
                  type="password" placeholder="Password *" required className="auth-field"
                  value={password} onChange={(e) => setPassword(e.target.value)} 
                />
                <input 
                  type="password" placeholder="Password confirmation *" required className="auth-field"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} 
                />
              </div>
            </>
          )}

          <button type="submit" disabled={isLoading} className="auth-submit uppercase">
            {isLoading ? "Processing..." : view === "login" ? "LOG IN" : "CREATE ACCOUNT"}
          </button>

          <p className="text-gray-400 text-sm mt-8">
            {view === "login" ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              onClick={() => setView(view === "login" ? "signup" : "login")} 
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
        }
        .auth-field:focus { border-color: #a5b4fc; background-color: #fcfcff; }
        .auth-submit {
          width: 100%;
          background-color: #4f46e5;
          color: white;
          font-weight: 700;
          padding: 1.1rem;
          border-radius: 0.75rem;
          margin-top: 2rem;
          transition: all 0.2s;
        }
        .auth-submit:hover:not(:disabled) { background-color: #4338ca; transform: translateY(-1px); }
        .auth-submit:disabled { background-color: #9ca3af; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
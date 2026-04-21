"use client";

import React, { useState, useEffect } from "react";
import { LogIn, User, LogOut } from "lucide-react";
import Link from "next/link";
import AuthModal from "@/app/components/auth/authModal";

export default function Navbar() {
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "WorkSpace", href: "/workspaces" },
    { name: "Templates", href: "/template" },
    { name: "Paket", href: "/#pricing" },
    { name: "FAQ", href: "/#faq" },
    { name: "Tentang", href: "/#about" },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  
  // State untuk menyimpan data user yang sedang login
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Periksa sesi saat komponen pertama kali muncul
  useEffect(() => {
    const checkSession = () => {
      const session = localStorage.getItem("user_session");
      if (session) {
        setCurrentUser(JSON.parse(session));
      }
    };

    checkSession();
    // Tambahkan event listener agar navbar update jika tab lain melakukan login/logout
    window.addEventListener("storage", checkSession);
    return () => window.removeEventListener("storage", checkSession);
  }, [isModalOpen]); // Re-check saat modal ditutup (setelah login sukses)

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    setCurrentUser(null);
    window.location.reload(); // Opsional: refresh untuk reset semua state aplikasi
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-50">
        {/* LEFT: Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <span className="font-bold text-xl text-gray-900 tracking-tight">
            Pola<span className="text-indigo-600">Tech</span>
          </span>
        </Link>

        {/* RIGHT: Nav + Button/Profile */}
        <div className="flex items-center space-x-8">
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

          {currentUser ? (
            /* --- TAMPILAN KETIKA SUDAH LOGIN --- */
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-end sm:flex">
                <span className="text-xs font-bold text-gray-900">{currentUser.name}</span>
                <button 
                  onClick={handleLogout}
                  className="text-[10px] text-red-500 hover:underline flex items-center"
                >
                  <LogOut size={10} className="mr-1" /> Logout
                </button>
              </div>
              
              <button className="w-10 h-10 rounded-full border-2 border-indigo-100 p-0.5 hover:border-indigo-500 transition-all overflow-hidden bg-gray-50">
                {currentUser.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-indigo-600">
                    <User size={20} />
                  </div>
                )}
              </button>
            </div>
          ) : (
            /* --- TAMPILAN KETIKA BELUM LOGIN --- */
            <button 
              onClick={() => {
                setAuthMode("login");
                setIsModalOpen(true);
              }}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2 rounded-full border border-transparent hover:bg-indigo-700 transition-all active:scale-95 shadow-md group"
            >
              <LogIn size={18} className="group-hover:translate-x-1 transition-transform text-indigo-100" />
              <span className="text-sm font-semibold">Sign In</span>
            </button>
          )}
        </div>
      </header>

      <AuthModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialView={authMode}
      />
    </>
  );
}
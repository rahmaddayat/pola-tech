"use client";

import React, { useState } from "react";
import { LogIn } from "lucide-react";
import Link from "next/link";
import AuthModal from "./authModal"; // Nama file diseragamkan (PascalCase)

export default function Navbar() {
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "WorkSpace", href: "/workspaces" },
    { name: "Templates", href: "/templates" },
    { name: "Paket", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
    { name: "Tentang", href: "#about" },
  ];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const handleOpenLogin = () => {
    setAuthMode("login");
    setIsModalOpen(true);
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

        {/* RIGHT: Nav + Button */}
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

          <button 
            onClick={handleOpenLogin}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2 rounded-full border border-transparent hover:bg-indigo-700 transition-all active:scale-95 shadow-md group"
          >
            <LogIn size={18} className="group-hover:translate-x-1 transition-transform text-indigo-100" />
            <span className="text-sm font-semibold">Sign In</span>
          </button>
        </div>
      </header>

      {/* Reusable Auth Modal */}
      <AuthModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialView={authMode}
      />
    </>
  );
}
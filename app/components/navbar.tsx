"use client";

import React, { useState, useEffect } from "react";
import { LogIn, Menu, X } from "lucide-react";
import Link from "next/link";
import AuthModal from "./authModal"; // Nama file diseragamkan (PascalCase)

export default function Navbar() {
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "WorkSpace", href: "/workspaces" },
    { name: "Templates", href: "/template" },
    { name: "Paket", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
    { name: "Tentang", href: "#about" },
  ];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleOpenLogin = () => {
    setAuthMode("login");
    setIsModalOpen(true);
    setMobileMenuOpen(false);
  };

  // Tutup mobile menu saat resize ke desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll saat mobile menu open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 md:px-8 sticky top-0 z-50">
        {/* LEFT: Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <span className="font-bold text-xl text-gray-900 tracking-tight">
            Pola<span className="text-indigo-600">Tech</span>
          </span>
        </Link>

        {/* RIGHT: Nav + Button (Desktop) */}
        <div className="hidden md:flex items-center space-x-8">
          <nav className="flex items-center space-x-6">
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

          <div className="h-6 w-px bg-gray-200"></div>

          <button 
            onClick={handleOpenLogin}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2 rounded-full border border-transparent hover:bg-indigo-700 transition-all active:scale-95 shadow-md group"
          >
            <LogIn size={18} className="group-hover:translate-x-1 transition-transform text-indigo-100" />
            <span className="text-sm font-semibold">Sign In</span>
          </button>
        </div>

        {/* Hamburger Button (Mobile) */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Slide-in Panel */}
        <div 
          className={`absolute top-16 right-0 w-72 h-[calc(100vh-4rem)] bg-white shadow-2xl transition-transform duration-300 ease-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <nav className="flex flex-col p-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl text-gray-600 font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-all"
              >
                {link.name}
              </Link>
            ))}

            <div className="h-px bg-gray-100 my-4" />

            <button 
              onClick={handleOpenLogin}
              className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all active:scale-95 shadow-md"
            >
              <LogIn size={18} />
              <span>Sign In</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Reusable Auth Modal */}
      <AuthModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialView={authMode}
      />
    </>
  );
}
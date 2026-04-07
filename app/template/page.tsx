"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Image as ImageIcon, ArrowLeft } from "lucide-react";

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const templates = [
    { id: 1, title: "Pattern Dummy", author: "John" },
    { id: 2, title: "Pattern Dummy", author: "John" },
    { id: 3, title: "Pattern Dummy", author: "John" },
    { id: 4, title: "Pattern Dummy", author: "Sam" },
    { id: 5, title: "Pattern Dummy", author: "John" },
    { id: 6, title: "Pattern Dummy", author: "John" },
  ];

  return (
    <div className="min-h-screen bg-white relative">
      
      {/* --- TOMBOL RETURN (Sudut Kiri Atas) --- */}
      <div className="absolute top-8 left-8 z-50">
        <Link 
          href="/" 
          className="flex items-center justify-center w-12 h-12 bg-white border-2 border-gray-100 rounded-full text-gray-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-md transition-all group"
          title="Kembali ke Home"
        >
          <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </Link>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-20">
        
        {/* --- HEADER TITLE --- */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-indigo-600">Templates</h1>
        </div>

        {/* --- SEARCH BAR --- */}
        <div className="flex justify-center mb-16">
          <div className="relative w-full max-w-2xl group">
            <input
              type="text"
              placeholder="Cari..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 text-xl rounded-full border-2 border-indigo-600 outline-none focus:ring-4 focus:ring-indigo-50 transition-all text-indigo-700 placeholder-indigo-300 shadow-sm"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-600" size={28} />
          </div>
        </div>

        {/* --- TEMPLATES GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {templates.map((template, index) => (
            <div 
              key={index} 
              className="flex flex-col aspect-4/3 bg-white border-2 border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer group"
            >
              {/* Preview Area (Light Gray) */}
              <div className="flex-1 bg-gray-50 flex items-center justify-center p-8 transition-colors group-hover:bg-gray-100">
                <ImageIcon size={100} strokeWidth={1} className="text-gray-200" />
              </div>

              {/* Info Area (Indigo) */}
              <div className="bg-indigo-600 p-6 text-white">
                <h3 className="text-2xl font-semibold mb-1 leading-tight">
                  {template.title}
                </h3>
                <p className="text-sm text-indigo-200 font-light">
                  Design By {template.author}
                </p>
              </div>
            </div>
          ))}

        </div>
      </main>
    </div>
  );
}
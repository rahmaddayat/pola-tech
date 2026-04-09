"use client";

import React, { useState } from "react";
import { Search, Image as ImageIcon } from "lucide-react";
import Navbar from "@/app/components/navbar";

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const templates = [
    { id: 1, title: "T-Shirt Basic", author: "PolaTech" },
    { id: 2, title: "Kemeja Slim Fit", author: "Rina K." },
    { id: 3, title: "Dress A-Line", author: "PolaTech" },
    { id: 4, title: "Jaket Bomber", author: "Sam D." },
    { id: 5, title: "Celana Chino", author: "PolaTech" },
    { id: 6, title: "Rok Flare", author: "Dina M." },
  ];

  // Filter templates berdasarkan search
  const filteredTemplates = templates.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12">

        {/* --- HEADER TITLE --- */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-indigo-600">Templates</h1>
          <p className="text-sm text-gray-400 mt-1">Pilih template siap pakai untuk memulai desain Anda</p>
        </div>

        {/* --- SEARCH BAR --- */}
        <div className="flex justify-center mb-16">
          <div className="relative w-full max-w-2xl group">
            <input
              type="text"
              placeholder="Cari template..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 text-xl rounded-full border-2 border-indigo-600 outline-none focus:ring-4 focus:ring-indigo-50 transition-all text-indigo-700 placeholder-indigo-300 shadow-sm"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-600" size={28} />
          </div>
        </div>

        {/* --- TEMPLATES GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {filteredTemplates.map((template) => (
            <div 
              key={template.id} 
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

          {/* No results */}
          {filteredTemplates.length === 0 && searchQuery && (
            <div className="col-span-full text-center py-16 text-gray-400">
              <Search size={48} className="mx-auto mb-4 text-gray-200" />
              <p className="text-lg">Tidak ada template yang cocok dengan &ldquo;{searchQuery}&rdquo;</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import Navbar from "@/app/components/ui/navbar";
import ProjectCard from "@/app/components/projectCard";
import { templates } from "@/app/lib/placeholder-data";
import withAuth from "@/app/components/auth/withAuth";

function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = templates.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-indigo-600">Templates</h1>
          <p className="text-sm text-gray-400 mt-1">Pilih template siap pakai untuk memulai desain Anda</p>
        </div>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map((template) => (
            <ProjectCard
              key={template.id}
              // href={`/templates/${template.id}`}
              href={`/template`}
              title={template.title}
              subtitle={`Design By ${template.author}`} // Menampilkan Nama Desainer
            />
          ))}

          {filteredTemplates.length === 0 && searchQuery && (
            <div className="col-span-full text-center py-16 text-gray-400">
              <Search size={48} className="mx-auto mb-4 text-gray-200" />
              <p className="text-lg">Tidak ada template yang cocok</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default withAuth(TemplatesPage);
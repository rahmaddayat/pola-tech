"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Plus, Image as ImageIcon, ArrowLeft } from "lucide-react";

export default function WorkspacesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const projects = [
    { id: 1, title: "Pattern Dummy", date: "21-03-2025" },
    { id: 2, title: "Pattern Dummy", date: "21-03-2025" },
    { id: 3, title: "Pattern Dummy", date: "21-03-2025" },
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
          <ArrowLeft
            size={24}
            className="group-hover:-translate-x-1 transition-transform"
          />
        </Link>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-20">
        {/* --- HEADER TITLE --- */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-indigo-600">WorkSpaces</h1>
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
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-600"
              size={28}
            />
          </div>
        </div>

        {/* --- PROJECT GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card: Buat Projek Baru */}
          <Link
            href="/workspaces/design"
            className="flex flex-col items-center justify-center aspect-4/3 bg-white border-2 border-gray-100 rounded-3xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group shadow-sm"
          >
            <div className="w-24 h-24 rounded-3xl border-4 border-gray-200 flex items-center justify-center mb-4 group-hover:border-indigo-200 transition-colors">
              <Plus
                size={48}
                className="text-gray-300 group-hover:text-indigo-400"
              />
            </div>
            <span className="text-2xl font-medium text-gray-300 group-hover:text-indigo-400">
              Buat Projek Baru
            </span>
          </Link>

          {/* Render Project Cards */}
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex flex-col aspect-4/3 bg-white border-2 border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex-1 bg-gray-50 flex items-center justify-center p-8">
                <ImageIcon
                  size={100}
                  strokeWidth={1}
                  className="text-gray-200"
                />
              </div>

              <div className="bg-indigo-600 p-6 text-white">
                <h3 className="text-2xl font-semibold mb-1">{project.title}</h3>
                <p className="text-sm text-indigo-200">{project.date}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

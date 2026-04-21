"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, AlertCircle, Loader2 } from "lucide-react";
import Navbar from "@/app/components/ui/navbar";
import ProjectCard from "@/app/components/projectCard";
import { projects } from "@/app/lib/placeholder-data";
import withAuth from "@/app/components/auth/withAuth";


function WorkspacesPage() {

  // States
  const [searchQuery, setSearchQuery] = useState("");

  // Filter logika
  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header Section */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-light text-indigo-600">WorkSpaces</h1>
            <p className="text-sm text-gray-400 mt-1 uppercase tracking-widest font-medium">
              Creative Studio
            </p>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-xs font-bold text-gray-300 uppercase italic">
              Project Management v1.0
            </span>
          </div>
        </div>

        {/* Search Bar Center */}
        <div className="flex justify-center mb-16">
          <div className="relative w-full max-w-2xl group">
            <input
              type="text"
              placeholder="Cari desain pola Anda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-5 text-lg rounded-full border-2 border-gray-100 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all text-indigo-700 placeholder-gray-300 shadow-sm"
            />
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors"
              size={24}
            />
          </div>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Create New Project Card */}
          <Link
            href="/workspaces/design"
            className="flex flex-col items-center justify-center aspect-4/3 bg-white border-2 border-dashed border-gray-200 rounded-2rem hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group relative overflow-hidden"
          >
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:rotate-90 transition-all duration-500">
              <Plus
                size={32}
                className="text-gray-400 group-hover:text-white"
              />
            </div>
            <span className="text-xl font-semibold text-gray-400 group-hover:text-indigo-600">
              New Project
            </span>
          </Link>

          {/* Project List */}
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="animate-in fade-in zoom-in duration-500"
            >
              <ProjectCard
                href={`/workspaces/design`}
                title={project.title}
                subtitle={`Terakhir diedit: ${project.date}`}
              />
            </div>
          ))}

          {/* Empty Search Result */}
          {filteredProjects.length === 0 && searchQuery && (
            <div className="col-span-full text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Search size={24} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">
                Tidak ada hasil untuk &ldquo;
                <span className="text-indigo-600">{searchQuery}</span>&rdquo;
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-xs font-bold text-indigo-500 underline"
              >
                Reset Pencarian
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default withAuth(WorkspacesPage);
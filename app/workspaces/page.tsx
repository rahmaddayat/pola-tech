"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, AlertCircle, Loader2 } from "lucide-react";
import Navbar from "@/app/components/navbar";
import ProjectCard from "@/app/components/projectCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Design {
  id_design: number;
  nama_design: string;
  config: any;
  updated_at: string;
}

export default function WorkspacesPage() {
  const router = useRouter();
  
  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState<"loading" | "unauthorized" | "authorized">("loading");
  const [designs, setDesigns] = useState<Design[]>([]);

  // --- LOGIKA PROTEKSI AKSES & FETCH DATA ---
  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const sessionStr = localStorage.getItem("user_session");
      
      if (!sessionStr) {
        setStatus("unauthorized");
        setTimeout(() => router.push("/"), 2500);
        return;
      }
      
      try {
        const session = JSON.parse(sessionStr);
        const token = session.token;
        
        // 1. Dapatkan daftar workspace
        const wsRes = await fetch(`${API_URL}/api/workspaces`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (wsRes.status === 401) {
          throw new Error("Unauthorized");
        }
        
        const wsData = await wsRes.json();
        const firstWorkspace = wsData.data?.[0];
        
        if (firstWorkspace) {
          // 2. Dapatkan desain dari workspace pertama
          const designRes = await fetch(`${API_URL}/api/workspaces/${firstWorkspace.id_workspace}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const designData = await designRes.json();
          if (designData.data?.designs) {
            setDesigns(designData.data.designs);
          }
        }
        
        setStatus("authorized");
      } catch (err) {
        console.error("Gagal mengambil data:", err);
        localStorage.removeItem("user_session");
        setStatus("unauthorized");
        setTimeout(() => router.push("/"), 2500);
      }
    };

    checkAuthAndFetch();
  }, [router]);

  // Filter logika
  const filteredProjects = designs.filter((p) =>
    p.nama_design.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- 1. TAMPILAN LOADING (SAAT CEK SESSION) ---
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="text-indigo-600 animate-spin" size={40} />
          <p className="text-gray-400 font-medium animate-pulse">Memverifikasi Sesi...</p>
        </div>
      </div>
    );
  }

  // --- 2. TAMPILAN PERINGATAN (JIKA BELUM LOGIN) ---
  if (status === "unauthorized") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-10 flex flex-col items-center text-center animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="text-red-500" size={42} />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Akses Ditolak</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Halaman ini hanya untuk member. <br />
            Silakan **Login** terlebih dahulu untuk mengelola proyek Anda.
          </p>

          {/* Progress Bar Timer */}
          <div className="w-full space-y-3">
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 animate-shrink origin-left"></div>
            </div>
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">
              Kembali ke Beranda...
            </p>
          </div>
        </div>

        <style jsx>{`
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
          .animate-shrink {
            animation: shrink 2.5s linear forwards;
          }
        `}</style>
      </div>
    );
  }

  // --- 3. TAMPILAN UTAMA (JIKA SUDAH LOGIN) ---
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
             <span className="text-xs font-bold text-gray-300 uppercase italic">Project Management v1.0</span>
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
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={24} />
          </div>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Create New Project Card */}
          <Link
            href="/workspaces/design"
            className="flex flex-col items-center justify-center aspect-[4/3] bg-white border-2 border-dashed border-gray-200 rounded-[2rem] hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group relative overflow-hidden"
          >
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:rotate-90 transition-all duration-500">
              <Plus size={32} className="text-gray-400 group-hover:text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-400 group-hover:text-indigo-600">
              New Project
            </span>
          </Link>

          {/* Project List */}
          {filteredProjects.map((project) => (
            <div key={project.id_design} className="animate-in fade-in zoom-in duration-500">
              <ProjectCard
                href={`/workspaces/design?id=${project.id_design}`}
                title={project.nama_design}
                subtitle={`Terakhir diedit: ${new Date(project.updated_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}`}
                config={project.config}
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
                Tidak ada hasil untuk &ldquo;<span className="text-indigo-600">{searchQuery}</span>&rdquo;
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
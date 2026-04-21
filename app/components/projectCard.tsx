"use client";

import React from "react";
import Link from "next/link";
import { Image as ImageIcon } from "lucide-react";
import ShirtPreview from "@/app/components/shirtPreview";

interface ProjectCardProps {
  href: string;
  title: string;
  subtitle: string;
  config?: any; // The JSON config of the design
}

export default function ProjectCard({ href, title, subtitle, config }: ProjectCardProps) {
  return (
    <Link
      href={href}
      className="flex flex-col aspect-4/3 bg-white border-2 border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer group"
    >
      {/* Preview Area */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center p-0 transition-colors group-hover:bg-gray-100 relative overflow-hidden">
        {config && config.body ? (
          <div className="w-full h-full transform scale-[1.7] origin-top pt-8">
            <ShirtPreview states={config} />
          </div>
        ) : (
          <ImageIcon
            size={100}
            strokeWidth={1}
            className="text-gray-200 group-hover:text-gray-300 transition-colors"
          />
        )}
      </div>

      {/* Info Area */}
      <div className="bg-indigo-600 p-6 text-white">
        <h3 className="text-2xl font-semibold mb-1 truncate leading-tight">
          {title}
        </h3>
        <p className="text-sm text-indigo-200 font-light italic">
          {subtitle}
        </p>
      </div>
    </Link>
  );
}
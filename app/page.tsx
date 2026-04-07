"use client";

import Navbar from "@/app/components/navbar";
import { CheckCircle2, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const targets = [
    "Komunitas Menjahit DIY",
    "Pelajar Fesyen",
    "Pedagang Fesyen",
    "Butik Pakaian",
    "Penjahit & Pembuat Pakaian",
    "Desainer Indie",
    "Merek Pakaian",
    "Pengecer Pola Busana",
    "Produsen Pakaian Khusus",
  ];

  const testimonials = [
    {
      name: "Karen",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      name: "Tony",
      text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    },
    {
      name: "Sharon M",
      text: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    },
  ];

  const router = useRouter();

  const handleDesignClick = () => {
    // Tambahkan logika di sini (misal: analitik atau pengecekan auth)
    router.push("/workspaces/design");
  };

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Apakah Pola.io gratis untuk digunakan?",
      answer:
        "Kami menyediakan paket gratis untuk pemula dengan fitur desain dasar. Untuk fitur profesional seperti ekspor pola industri, kami menyediakan paket berlangganan yang terjangkau.",
    },
    {
      question: "Format file apa saja yang didukung untuk ekspor?",
      answer:
        "Anda dapat mengekspor desain Anda dalam format PDF (skala 1:1), PNG resolusi tinggi, dan file vektor SVG yang kompatibel dengan software desain lainnya.",
    },
    {
      question: "Apakah saya bisa mencetak pola langsung dari rumah?",
      answer:
        "Tentu! Fitur ekspor kami mendukung format 'A4 Tiled PDF' sehingga Anda bisa mencetak pola menggunakan printer rumahan biasa dan menyatukannya dengan mudah.",
    },
    {
      question: "Apakah tersedia panduan untuk pemula?",
      answer:
        "Ya, kami menyediakan video tutorial lengkap dan dokumentasi langkah-demi-langkah di dalam dashboard untuk membantu Anda memulai desain pertama Anda.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const plans = [
    {
      title: "LITE",
      price: "19",
      subtitle: "Cocok untuk hobi & pemula",
      features: [
        { text: "Akses 50+ Template Desain Dasar", active: true },
        { text: "Ekspor File PDF (Skala 1:1)", active: true },
        { text: "Penyimpanan hingga 5 Desain", active: true },
        { text: "Custom Fabric Upload", active: true },
        { text: "Lisensi Komersial", active: false },
        { text: "Fitur Grading Ukuran", active: false },
        { text: "Prioritas Customer Support", active: false },
      ],
      buttonText: "PILIH LITE",
      isHighlighted: false,
    },
    {
      title: "PRO",
      price: "39",
      subtitle: "Untuk penjahit & desainer indie",
      features: [
        { text: "Unlimited Template Desain", isNew: true, active: true },
        { text: "Ekspor PDF, SVG, & PNG", active: true },
        { text: "Penyimpanan Cloud Unlimited", active: true },
        { text: "Fitur Grading Ukuran Otomatis", active: true },
        { text: "Lisensi Komersial", active: true },
        { text: "Custom Fabric Upload", active: true },
        { text: "Prioritas Customer Support", active: false },
      ],
      buttonText: "PILIH PRO",
      isHighlighted: true, // Tag Best Value
    },
    {
      title: "BUSINESS",
      price: "59",
      subtitle: "Solusi untuk butik & konveksi",
      features: [
        { text: "Semua Fitur Paket PRO", active: true },
        { text: "Multi-User (Hingga 3 Akun)", active: true },
        { text: "Custom Brand Watermark", active: true },
        { text: "Laporan Penggunaan Bahan", active: true },
        { text: "Prioritas Customer Support 24/7", active: true },
        { text: "Akses Early-Bird Fitur Baru", active: true },
        { text: "Konsultasi Teknis Bulanan", active: true },
      ],
      buttonText: "PILIH BUSINESS",
      isHighlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="min-h-[85vh] bg-[#F9FAFB] flex flex-col md:flex-row items-center justify-between px-10 md:px-16 py-16 md:py-24 relative overflow-hidden">
        {/* 1. KOLOM KIRI (Teks & Tombol) - Ambil 55% lebar */}
        <div className="md:w-[55%] flex flex-col items-start justify-center z-20 space-y-8 pr-8">
          <h1 className="text-5xl md:text-6xl font-extrabold text-indigo-700 leading-[1.15] tracking-tight">
            Dari Ide ke Pola, Semua Dalam <br /> Satu Tempat.
          </h1>

          <p className="text-lg text-gray-600 max-w-xl leading-relaxed">
            Ekspresikan kreativitas dalam mendesain pola busana dengan tools
            yang fleksibel dan mudah digunakan. Ubah ide sederhana menjadi pola
            nyata dengan cepat.
          </p>

          <Link href="/workspaces/design">
            <button className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-extrabold text-sm hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-200 active:scale-95">
              Desain Sekarang
            </button>
          </Link>
        </div>

        {/* 2. KOLOM KANAN (Gambar Background Asset) - Ambil 45% lebar */}
        {/* Container ini 'mengunci' area untuk gambar asset */}
        <div className="absolute top-0 right-0 w-full h-full md:w-[45%] md:relative md:h-[85vh] z-10">
          <Image
            src="/design_pattern_bg.jpg" // GANTI DENGAN PATH ASSET ANDA
            alt="Fashion Design Pattern Process"
            fill // Membuat gambar memenuhi container pembungkusnya
            quality={100} // Jaga kualitas gambar tinggi
            className="object-cover object-center" // Penting agar gambar memotong rapi, bukan gepeng
            priority // Prioritaskan loading gambar ini
          />

          {/* Opsional: Overlay gradasi tipis di sebelah kiri gambar agar teks lebih terbaca */}
          <div className="absolute inset-y-0 left-0 w-32 bg-linear-to-r from-[#F9FAFB] to-transparent z-10 md:block hidden"></div>
        </div>
      </section>

      {/* --- TARGET AUDIENCE SECTION --- */}
      <section className="bg-indigo-600 py-20 px-10 text-white">
        <h2 className="text-3xl font-bold mb-12">
          Siapa saja yang perlu web ini?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12">
          {targets.map((item, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 border-b border-indigo-400 pb-4 hover:border-white transition-colors"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full border border-white text-xs font-bold">
                {index + 1}
              </span>
              <span className="font-medium text-lg">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* --- PAKET HARGA --- */}
      <section id="pricing" className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-indigo-700 mb-4">
              Pilih Paket Kreativitasmu
            </h2>
            <p className="text-gray-500">
              Mulai gratis atau pilih paket profesional untuk fitur lebih
              lengkap.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative flex flex-col bg-white border border-gray-100 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl ${
                  plan.isHighlighted
                    ? "ring-2 ring-indigo-500 scale-105 z-10"
                    : "hover:-translate-y-2"
                }`}
              >
                {/* Ribbon Best Value */}
                {plan.isHighlighted && (
                  <div className="absolute top-0 right-0 overflow-hidden w-32 h-32">
                    <div className="bg-indigo-600 text-white text-[10px] font-bold py-1 px-10 transform rotate-45 translate-x-8 translate-y-6 shadow-md text-center">
                      POPULER
                    </div>
                  </div>
                )}

                {/* Header Harga */}
                <div className="text-center mb-10">
                  <h3 className="text-indigo-600 font-bold tracking-widest text-sm mb-4 uppercase">
                    {plan.title}
                  </h3>
                  <div className="flex items-start justify-center text-gray-800">
                    <span className="text-2xl mt-2 font-medium">Rp</span>
                    <span className="text-6xl font-bold tracking-tighter">
                      {plan.price}
                    </span>
                    <span className="text-lg self-end mb-2 text-gray-400">
                      rb/bln
                    </span>
                  </div>
                  <p className="mt-4 text-gray-500 text-sm font-medium">
                    {plan.subtitle}
                  </p>
                </div>

                {/* List Fitur */}
                <div className="grow space-y-4 mb-10">
                  {plan.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-start text-sm">
                      <span
                        className={`leading-relaxed ${
                          feature.active
                            ? "text-gray-600"
                            : "text-gray-300 line-through"
                        }`}
                      >
                        {feature.active ? "• " : "✕ "} {feature.text}
                      </span>
                      {feature.isNew && (
                        <span className="ml-2 bg-indigo-100 text-indigo-600 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">
                          Baru
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Tombol Aksi */}
                <button
                  className={`w-full font-bold py-4 rounded-2xl text-sm transition-all active:scale-95 ${
                    plan.isHighlighted
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS SECTION --- */}
      <section className="py-24 px-10 bg-gray-50">
        <h2 className="text-center text-4xl font-bold text-indigo-700 mb-16 uppercase tracking-widest">
          Apa yang dikatakan oleh pengguna kami?
        </h2>

        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
          {/* Melakukan map untuk setiap kartu */}
          {testimonials.map((t, i) => (
            /* KUNCI 1: flex flex-col agar elemen bertumpuk vertikal dan h-full agar sama tinggi */
            <div
              key={i}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center h-full"
            >
              {/* KUNCI 2: flex-grow agar teks ini mengambil sisa ruang dan menekan elemen di bawahnya */}
              <p className="italic text-gray-500 mb-8 leading-relaxed text-center grow">
                "{t.text}"
              </p>

              {/* Wadah Nama (Fixed di posisi bawah) */}
              <div className="flex flex-col items-center justify-center mt-auto">
                <p className="font-bold text-gray-800 text-base leading-none">
                  • {t.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="py-24 px-10 bg-white">
        <div className="max-w-3xl mx-auto">
          {/* Header FAQ */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-indigo-700 mb-4 uppercase tracking-wider">
              Pertanyaan Sering Diajukan
            </h2>
            <p className="text-gray-500">
              Temukan jawaban cepat untuk pertanyaan umum tentang penggunaan
              Pola.io
            </p>
          </div>

          {/* Accordion List */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`border rounded-2xl transition-all duration-300 ${
                  openIndex === index
                    ? "border-indigo-500 shadow-md"
                    : "border-gray-100"
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <div className="flex items-center space-x-4">
                    <HelpCircle
                      className={`w-5 h-5 ${openIndex === index ? "text-indigo-600" : "text-gray-400"}`}
                    />
                    <span
                      className={`font-semibold text-lg ${openIndex === index ? "text-indigo-700" : "text-gray-700"}`}
                    >
                      {faq.question}
                    </span>
                  </div>
                  {openIndex === index ? (
                    <ChevronUp className="text-indigo-600" />
                  ) : (
                    <ChevronDown className="text-gray-400" />
                  )}
                </button>

                {/* Expandable Answer */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === index
                      ? "max-h-40 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-50">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer
        id="about"
        className="bg-indigo-600 py-16 px-10 text-white border-t border-indigo-500"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-sm">
          <div className="space-y-4">
            <h4 className="font-bold text-xl">Contact Info :</h4>
            <p className="font-semibold">PolaTech</p>
            <p className="text-indigo-200">xxxx-xxxx-xxxx</p>
            <p className="text-indigo-200">xxxx-xxxx-xxxx</p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-xl">Company</h4>
            <ul className="space-y-2 text-indigo-200">
              <li>
                <button className="hover:text-white transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors">
                  Affiliate Team
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors">
                  Privacy
                </button>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-xl">Follow Us</h4>
            <ul className="space-y-2 text-indigo-200">
              <li>
                <button className="hover:text-white transition-colors">
                  youtube.com
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors">
                  X.com
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors">
                  Facebook.com
                </button>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

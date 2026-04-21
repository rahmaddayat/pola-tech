"use client";

import Navbar from "@/app/components/ui/navbar";
import { Star, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AlertModal from "@/app/components/ui/alertModal";

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "error" as "error" | "success"
  });

  // --- LOGIKA PENGECEKAN LOGIN (SQA GUARD) ---
  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (session) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleStartDesigning = () => {
    if (!isLoggedIn) {
      // Gantikan alert standar dengan modal custom
      setAlertConfig({
        isOpen: true,
        title: "Akses Terbatas",
        message: "Silakan Login atau Buat Akun terlebih dahulu untuk mulai mendesain pola busana Anda.",
        type: "error"
      });
    } else {
      router.push("/workspaces/design");
    }
  };

  // --- DATA STATIC ---
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
      name: "Rina Kartika",
      role: "Desainer Indie, Jakarta",
      text: "PolaTech benar-benar mengubah cara saya bekerja. Dulu saya membuat pola manual di kertas besar, sekarang semuanya digital.",
      rating: 5,
    },
    {
      name: "Budi Santoso",
      role: "Pemilik Butik, Bandung",
      text: "Fitur grading ukuran otomatis sangat membantu produksi kami. Sangat direkomendasikan!",
      rating: 5,
    },
    {
      name: "Siti Nurhaliza",
      role: "Guru SMK, Surabaya",
      text: "Interface-nya intuitif dan mudah dipahami bahkan oleh pemula.",
      rating: 4,
    },
  ];

  const faqs = [
    {
      question: "Apakah PolaTech gratis untuk digunakan?",
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

  const plans = [
    {
      title: "LITE",
      price: "19",
      subtitle: "Cocok untuk hobi & pemula",
      features: [
        { text: "Akses 50+ Template", active: true },
        { text: "Ekspor PDF (1:1)", active: true },
        { text: "Penyimpanan 5 Desain", active: true },
        { text: "Lisensi Komersial", active: false },
      ],
      buttonText: "PILIH LITE",
      isHighlighted: false,
    },
    {
      title: "PRO",
      price: "39",
      subtitle: "Untuk desainer indie",
      features: [
        { text: "Unlimited Template", isNew: true, active: true },
        { text: "Ekspor PDF, SVG, & PNG", active: true },
        { text: "Grading Ukuran Otomatis", active: true },
        { text: "Lisensi Komersial", active: true },
      ],
      buttonText: "PILIH PRO",
      isHighlighted: true,
    },
    {
      title: "BUSINESS",
      price: "59",
      subtitle: "Solusi konveksi",
      features: [
        { text: "Semua Fitur PRO", active: true },
        { text: "Multi-User (3 Akun)", active: true },
        { text: "Custom Watermark", active: true },
        { text: "Support 24/7", active: true },
      ],
      buttonText: "PILIH BUSINESS",
      isHighlighted: false,
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const avatarColors = ["bg-indigo-500", "bg-emerald-500", "bg-amber-500"];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Navbar />
    
      <AlertModal 
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />

      {/* --- HERO SECTION --- */}
      <section className="min-h-[85vh] bg-[#F9FAFB] flex flex-col md:flex-row items-center justify-between px-10 md:px-16 py-16 md:py-24 relative overflow-hidden">
        <div className="md:w-[55%] flex flex-col items-start justify-center z-20 space-y-8 pr-8">
          <h1 className="text-5xl md:text-6xl font-extrabold text-indigo-700 leading-[1.15] tracking-tight">
            Dari Ide ke Pola, Semua Dalam <br /> Satu Tempat.
          </h1>

          <p className="text-lg text-gray-600 max-w-xl leading-relaxed">
            Ekspresikan kreativitas dalam mendesain pola busana dengan tools
            yang fleksibel dan mudah digunakan.
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            {/* BUTTON DENGAN PROTEKSI LOGIN */}
            <button
              onClick={handleStartDesigning}
              className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-extrabold text-sm hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-200 active:scale-95"
            >
              Desain Sekarang
            </button>

            <Link href="#pricing">
              <button className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-extrabold text-sm border-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all active:scale-95">
                Lihat Paket
              </button>
            </Link>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-full h-full md:w-[45%] md:relative md:h-[85vh] z-10">
          <Image
            src="/design_pattern_bg.jpg"
            alt="Fashion Design"
            fill
            quality={100}
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-y-0 left-0 w-32 bg-linear-to-r from-[#F9FAFB] to-transparent z-10 md:block hidden"></div>
        </div>
      </section>

      {/* --- TARGET AUDIENCE --- */}
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

      {/* --- PRICING --- */}
      <section id="pricing" className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-indigo-700 mb-4">
              Pilih Paket Kreativitasmu
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative flex flex-col bg-white border rounded-3xl p-8 transition-all hover:shadow-2xl ${plan.isHighlighted ? "ring-2 ring-indigo-500 scale-105 z-10" : ""}`}
              >
                <div className="text-center mb-10">
                  <h3 className="text-indigo-600 font-bold uppercase text-sm mb-4">
                    {plan.title}
                  </h3>
                  <div className="flex items-start justify-center">
                    <span className="text-2xl mt-2 font-medium text-gray-800">
                      Rp
                    </span>
                    <span className="text-6xl font-bold text-gray-800 tracking-tighter">
                      {plan.price}
                    </span>
                    <span className="text-lg self-end mb-2 text-gray-400">
                      rb/bln
                    </span>
                  </div>
                </div>
                <div className="grow space-y-4 mb-10">
                  {plan.features.map((f, fi) => (
                    <p
                      key={fi}
                      className={`text-sm ${f.active ? "text-gray-600" : "text-gray-300 line-through"}`}
                    >
                      {f.active ? "• " : "✕ "} {f.text}
                    </p>
                  ))}
                </div>
                <button
                  className={`w-full font-bold py-4 rounded-2xl text-sm ${plan.isHighlighted ? "bg-indigo-600 text-white" : "bg-gray-50 border"}`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className="py-24 px-10 bg-white">
        <h2 className="text-center text-3xl font-bold text-indigo-700 mb-16">
          Apa Kata Pengguna Kami?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-gray-50 p-8 rounded-2xl border flex flex-col h-full"
            >
              <div className="flex gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    size={16}
                    className={
                      si < t.rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-200"
                    }
                  />
                ))}
              </div>
              <p className="italic text-gray-600 mb-8 grow">"{t.text}"</p>
              <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                <div
                  className={`w-12 h-12 rounded-full ${avatarColors[i % 3]} flex items-center justify-center text-white font-bold`}
                >
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-24 px-10 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center text-3xl font-bold text-indigo-700 mb-16">
            Pertanyaan Sering Diajukan
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border bg-white rounded-2xl">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className="font-semibold text-gray-700">
                    {faq.question}
                  </span>
                  {openIndex === index ? (
                    <ChevronUp className="text-indigo-600" />
                  ) : (
                    <ChevronDown className="text-gray-400" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="p-6 pt-0 text-gray-600 border-t border-gray-50">
                    {faq.answer}
                  </div>
                )}
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
            <h4 className="font-bold text-xl">Contact Info</h4>
            <p className="font-semibold text-lg">
              Pola<span className="text-indigo-200">Tech</span>
            </p>
            <p className="text-indigo-200">📧 hello@polatech.id</p>
            <p className="text-indigo-200">📞 +62 812-3456-7890</p>
            <p className="text-indigo-200">📍 Jakarta, Indonesia</p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-xl">Company</h4>
            <ul className="space-y-2 text-indigo-200">
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Affiliate Team
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-xl">Follow Us</h4>
            <ul className="space-y-2 text-indigo-200">
              <li>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  YouTube
                </a>
              </li>
              <li>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  X (Twitter)
                </a>
              </li>
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-indigo-500/50 text-center text-indigo-300 text-sm">
          © {new Date().getFullYear()} PolaTech. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Sparkles, Send, Lock, ChevronRight } from "lucide-react";
import { PlanType } from "@/app/lib/planUtils";

interface AIAssistantProps {
  plan: PlanType;
  currentConfig: {
    body: string;
    necklines: string;
    sleeves: string;
    pocket: string;
    primaryColor: string;
    pattern: string | null;
  };
  onApplySuggestion: (type: string, value: string) => void;
}

interface Message {
  role: "user" | "ai";
  text: string;
  suggestions?: { type: string; value: string; label: string }[];
}

// Rule-based AI fashion advisor
function getAIResponse(
  question: string,
  config: AIAssistantProps["currentConfig"]
): Message {
  const q = question.toLowerCase();
  const responses: Message[] = [];

  // Color suggestions
  if (q.includes("warna") || q.includes("color") || q.includes("cocok")) {
    if (config.primaryColor === "#1A1A1A" || config.primaryColor === "#374151") {
      responses.push({
        role: "ai",
        text: "Warna gelap Anda sangat versatile! Untuk tampilan lebih segar, coba padukan dengan aksen warna terang:",
        suggestions: [
          { type: "Color", value: "#FA8072", label: "Salmon" },
          { type: "Color", value: "#EAB308", label: "Mustard" },
          { type: "Color", value: "#10B981", label: "Emerald" },
        ],
      });
    } else {
      responses.push({
        role: "ai",
        text: "Berdasarkan desain saat ini, berikut rekomendasi warna yang serasi:",
        suggestions: [
          { type: "Color", value: "#1E3A8A", label: "Navy Blue" },
          { type: "Color", value: "#D2B48C", label: "Beige" },
          { type: "Color", value: "#556B2F", label: "Olive" },
        ],
      });
    }
  }

  // Style suggestions
  if (q.includes("style") || q.includes("gaya") || q.includes("casual") || q.includes("formal")) {
    if (q.includes("casual") || q.includes("santai")) {
      responses.push({
        role: "ai",
        text: "Untuk tampilan casual yang trendy, saya sarankan kombinasi ini:",
        suggestions: [
          { type: "Silhouettes", value: "tshirt", label: "T-Shirt body" },
          { type: "Necklines", value: "round_neck_binding", label: "Round neck" },
          { type: "Sleeves", value: "short_sleeves", label: "Short sleeves" },
        ],
      });
    } else if (q.includes("formal") || q.includes("kerja") || q.includes("kantor")) {
      responses.push({
        role: "ai",
        text: "Untuk tampilan formal & profesional:",
        suggestions: [
          { type: "Silhouettes", value: "shirt", label: "Shirt body" },
          { type: "Necklines", value: "collar", label: "Collar neck" },
          { type: "Sleeves", value: "long_sleeves", label: "Long sleeves" },
        ],
      });
    }
  }

  // Neckline suggestions
  if (q.includes("leher") || q.includes("neck") || q.includes("kerah")) {
    responses.push({
      role: "ai",
      text: `Dengan body type "${config.body}", berikut saran kerah terbaik:`,
      suggestions: [
        { type: "Necklines", value: "v_neck", label: "V-Neck (modern)" },
        { type: "Necklines", value: "round_neck_binding", label: "Round Neck (klasik)" },
        { type: "Necklines", value: "collar", label: "Collar (formal)" },
      ],
    });
  }

  // Sleeve suggestions
  if (q.includes("lengan") || q.includes("sleeve")) {
    responses.push({
      role: "ai",
      text: "Pilihan lengan yang cocok untuk desain Anda:",
      suggestions: [
        { type: "Sleeves", value: "short_sleeves", label: "Short (kasual)" },
        { type: "Sleeves", value: "long_sleeves", label: "Long (formal)" },
        { type: "Sleeves", value: "raglan", label: "Raglan (sporty)" },
      ],
    });
  }

  // Pattern suggestions
  if (q.includes("pattern") || q.includes("motif") || q.includes("pola") || q.includes("corak")) {
    responses.push({
      role: "ai",
      text: "Rekomendasi pattern yang sedang tren saat ini:",
      suggestions: [
        { type: "Pattern", value: "p_stripes", label: "Stripes" },
        { type: "Pattern", value: "p_checkered", label: "Checkered" },
        { type: "Pattern", value: "p_dots", label: "Polka Dots" },
      ],
    });
  }

  // Conversational / Greetings
  if (q.includes("halo") || q.includes("hai") || q.includes("hello")) {
    return {
      role: "ai",
      text: "Halo! Saya adalah AI Fashion Assistant dari PolaTech. Ada yang bisa saya bantu dengan desain baju Anda hari ini?",
    };
  }

  if (q.includes("siapa kamu") || q.includes("kamu siapa") || q.includes("nama kamu")) {
    return {
      role: "ai",
      text: "Saya adalah Asisten AI khusus fashion yang dikembangkan oleh tim PolaTech. Saya bisa membantu Anda memilih warna, gaya, kerah, lengan, dan motif yang cocok untuk desain Anda!",
    };
  }

  if (q.includes("bisa bicara") || q.includes("ngomong") || q.includes("chat")) {
    return {
      role: "ai",
      text: "Tentu saja saya bisa ngobrol! Silakan tanyakan saran seputar desain pakaian, dan saya akan merekomendasikan gaya yang sesuai.",
    };
  }

  if (q.includes("terima kasih") || q.includes("makasih") || q.includes("thanks")) {
    return {
      role: "ai",
      text: "Sama-sama! Senang bisa membantu. Jangan ragu untuk bertanya lagi jika butuh inspirasi desain.",
    };
  }

  // General / default fallback
  if (responses.length === 0) {
    const bodyLabel = config.body.replace(/_/g, " ");
    return {
      role: "ai",
      text: `Menarik! Untuk melengkapi ide Anda, saat ini desain Anda menggunakan body "${bodyLabel}" dengan kerah "${config.necklines.replace(/_/g, " ")}" dan lengan "${config.sleeves.replace(/_/g, " ")}". Mungkin Anda ingin mencoba variasi ini:`,
      suggestions: [
        { type: "Color", value: "#6366f1", label: "Indigo (modern)" },
        { type: "Pattern", value: "p_stripes", label: "Tambah stripes" },
        { type: "Necklines", value: "v_neck", label: "Ganti ke V-Neck" },
      ],
    };
  }

  return responses[0];
}

export default function AIAssistant({ plan, currentConfig, onApplySuggestion }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Halo! Saya asisten desain AI PolaTech. Tanyakan apapun tentang desain fashion — warna, style, pattern, atau rekomendasi lainnya!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canUse = plan === "business";

  if (!canUse) {
    return (
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles size={14} /> AI Assistant
        </h4>
        <div className="p-6 rounded-xl bg-gray-50 border border-gray-100 text-center">
          <Lock size={28} className="mx-auto text-gray-300 mb-2" />
          <p className="text-xs text-gray-400 font-medium">AI Fashion Assistant</p>
          <p className="text-[10px] text-gray-300 mt-1">Tersedia di paket Business</p>
          <p className="text-[10px] text-gray-300">Saran warna, style, dan pattern otomatis</p>
        </div>
      </div>
    );
  }

  const handleSend = async (textOverride?: string) => {
    const textToUse = textOverride || input;
    if (!textToUse.trim() || isLoading) return;

    const userMsg: Message = { role: "user", text: textToUse };
    setMessages((prev) => [...prev, userMsg]);
    if (!textOverride) setInput("");
    setIsLoading(true);

    try {
      const sessionStr = localStorage.getItem("user_session");
      const token = sessionStr ? JSON.parse(sessionStr).token : "";
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: textToUse, config: currentConfig }),
      });

      const data = await res.json();
      let text = "Maaf, server AI sedang sibuk.";
      if (res.ok && data.data?.text) {
        text = data.data.text;
      }

      // Keep interactive suggestion buttons using local rule logic
      const localAI = getAIResponse(textToUse, currentConfig);

      setMessages((prev) => [
        ...prev,
        { role: "ai", text, suggestions: localAI.suggestions },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Gagal menghubungi server AI." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-3 flex flex-col" style={{ maxHeight: "60vh" }}>
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
        <Sparkles size={14} className="text-amber-500" /> AI Fashion Assistant
      </h4>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1" style={{ maxHeight: "35vh" }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[90%] p-3 rounded-2xl text-xs ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-md"
                  : "bg-gray-50 text-gray-700 rounded-bl-md border border-gray-100"
              }`}
            >
              <p className="leading-relaxed">{msg.text}</p>
              {msg.suggestions && (
                <div className="mt-2 space-y-1.5">
                  {msg.suggestions.map((s, si) => (
                    <button
                      key={si}
                      onClick={() => onApplySuggestion(s.type, s.value)}
                      className="w-full flex items-center gap-2 p-2 rounded-lg bg-white border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left group"
                    >
                      {s.type === "Color" && (
                        <div
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: s.value }}
                        />
                      )}
                      <span className="flex-1 text-[10px] font-medium text-gray-600 group-hover:text-indigo-600">
                        {s.label}
                      </span>
                      <ChevronRight size={12} className="text-gray-300 group-hover:text-indigo-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick prompts */}
      <div className="flex gap-1.5 flex-wrap">
        {["Saran warna", "Style casual", "Style formal", "Rekomendasi pattern"].map((prompt) => (
          <button
            key={prompt}
            onClick={() => {
              handleSend(prompt);
            }}
            className="px-2 py-1 rounded-full bg-indigo-50 text-[9px] font-medium text-indigo-600 hover:bg-indigo-100 transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tanya tentang desain..."
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className="px-3 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-all"
        >
          {isLoading ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send size={14} />
          )}
        </button>
      </div>
    </div>
  );
}

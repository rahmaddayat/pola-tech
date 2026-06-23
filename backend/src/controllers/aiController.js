const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.chat = async (req, res, next) => {
  try {
    const { message, config } = req.body;
    
    if (!message) {
      return res.status(400).json({ status: "fail", message: "Message is required" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Format the system prompt to guide the AI
    const systemPrompt = `Anda adalah asisten AI Fashion Design dari PolaTech. 
Anda membantu desainer pakaian memilih gaya, warna, pola, kerah, dan lengan untuk baju mereka.
Saat ini desain mereka menggunakan konfigurasi berikut:
- Body: ${config?.body || "Belum dipilih"}
- Kerah: ${config?.necklines || "Belum dipilih"}
- Lengan: ${config?.sleeves || "Belum dipilih"}
- Warna: ${config?.primaryColor || "Belum dipilih"}
- Motif: ${config?.pattern || "Belum dipilih"}

Jawab dengan ramah, kasual, profesional, dan relevan. 
Berikan saran desain jika diminta. Jika pengguna bertanya tentang identitas, jelaskan Anda AI PolaTech.
Jawab dengan singkat (maks 3-4 kalimat).`;

    const prompt = `${systemPrompt}\n\nUser: ${message}\nAI:`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    res.status(200).json({
      status: "success",
      data: { text: responseText }
    });
  } catch (error) {
    if (error.message && error.message.includes("503 Service Unavailable")) {
      return res.status(503).json({
        status: "fail",
        message: "Server AI sedang sibuk (permintaan tinggi). Silakan coba beberapa saat lagi."
      });
    }
    next(error);
  }
};

exports.generateShape = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ status: "fail", message: "Prompt is required" });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `Anda adalah AI CAD Pattern Generator untuk PolaTech.
Pengguna akan meminta komponen pakaian (misal: Saku, Kerah Bulat, Lengan Pendek, dll).
Anda harus merespons HANYA dengan format JSON murni.
ATURAN SANGAT PENTING: JANGAN PERNAH MENGGUNAKAN KOMENTAR (// atau /* */) DI DALAM JSON. JSON HARUS VALID DAN BISA DIPARSE OLEH JSON.parse().
Gunakan struktur ini:
{
  "name": "Nama Komponen",
  "points": [
    { "id": "p1", "x": 20, "y": 20, "cpNext": { "x": 30, "y": 20 } },
    { "id": "p2", "x": 40, "y": 20 }
  ]
}
Catatan: x dan y dalam persentase kanvas (0-100). cpNext bersifat opsional untuk garis melengkung (Bezier).`;

    const result = await model.generateContent(`${systemPrompt}\n\nPermintaan: ${prompt}`);
    const responseText = result.response.text();
    
    // Parse JSON safely: strip any accidental JS comments before parsing
    const cleanedText = responseText.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
    let jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    let shapeData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!shapeData) {
       throw new Error("AI gagal menghasilkan JSON yang valid");
    }

    res.status(200).json({
      status: "success",
      data: shapeData
    });
  } catch (error) {
    if (error.message && error.message.includes("503 Service Unavailable")) {
      return res.status(503).json({
        status: "fail",
        message: "Server AI sedang sibuk (permintaan tinggi). Silakan coba beberapa saat lagi."
      });
    }
    next(error);
  }
};

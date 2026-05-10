const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.chat = async (req, res, next) => {
  try {
    const { message, config } = req.body;
    
    if (!message) {
      return res.status(400).json({ status: "fail", message: "Message is required" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-" });

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
    next(error);
  }
};

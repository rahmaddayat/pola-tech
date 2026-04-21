import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    // 1. Validasi input dasar
    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Email/Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    // 2. Mencari user berdasarkan Email ATAU Username (Logika OR)
    // Ini mendukung fitur login fleksibel yang Anda minta
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      }
    });

    // 3. Verifikasi keberadaan user dan kecocokan password
    // SQA Note: Saat ini masih plain text, kedepannya gunakan library 'bcrypt'
    if (!user || user.passwordHash !== password) {
      return NextResponse.json(
        { error: "Kredensial salah. Silakan periksa kembali email/username dan password Anda." },
        { status: 401 }
      );
    }

    // 4. Jika sukses, kirim data profil user
    // Jangan mengirim passwordHash kembali ke client demi keamanan
    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.username, // Bisa disesuaikan dengan field nama jika ada
    }, { status: 200 });

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan koneksi pada server" },
      { status: 500 }
    );
  }
}
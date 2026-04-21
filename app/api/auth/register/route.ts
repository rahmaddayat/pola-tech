import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // 1. Ambil username dari body request
    const { email, password, username } = body;

    if (!email || !password || !username) {
      return NextResponse.json({ error: "Semua field harus diisi" }, { status: 400 });
    }

    // 2. SQA Check: Pastikan username belum dipakai orang lain (karena username biasanya unik)
    const existingUsername = await prisma.user.findFirst({
      where: { username: username }
    });

    if (existingUsername) {
      return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email: email }
    });

    if (existingEmail) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    // 3. Simpan ke Database
    const newUser = await prisma.user.create({
      data: {
        email,
        username, // Simpan username pilihan user
        passwordHash: password,
        subscriptionPlan: "free",
      },
    });

    return NextResponse.json({ message: "Berhasil" }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
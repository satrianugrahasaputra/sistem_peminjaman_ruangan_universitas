import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, signSessionToken, COOKIE_NAME } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        nidn: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Data pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data profil." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, nidn, phone, currentPassword, newPassword } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Nama lengkap tidak boleh kosong." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    const updateData: any = {
      name: name.trim(),
      phone: phone?.trim() || null,
    };

    if (existingUser.role === "DOSEN") {
      updateData.nidn = nidn?.trim() || null;
    }

    // Password change logic if newPassword provided
    if (newPassword && newPassword.trim()) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: "Kata sandi saat ini wajib diisi untuk mengubah kata sandi baru." },
          { status: 400 }
        );
      }

      const isCurrentValid = await bcrypt.compare(currentPassword, existingUser.password);
      if (!isCurrentValid) {
        return NextResponse.json(
          { success: false, error: "Kata sandi saat ini yang Anda masukkan salah." },
          { status: 400 }
        );
      }

      if (newPassword.trim().length < 6) {
        return NextResponse.json(
          { success: false, error: "Kata sandi baru minimal 6 karakter." },
          { status: 400 }
        );
      }

      updateData.password = await bcrypt.hash(newPassword.trim(), 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        nidn: true,
        phone: true,
      },
    });

    // Re-sign session token with new name/nidn
    const newSessionToken = await signSessionToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role as "ADMIN" | "DOSEN",
      nidn: updatedUser.nidn,
    });

    const response = NextResponse.json({
      success: true,
      message: "Profil Anda berhasil diperbarui.",
      data: updatedUser,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: newSessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("PUT /api/profile error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui profil pengguna." },
      { status: 500 }
    );
  }
}

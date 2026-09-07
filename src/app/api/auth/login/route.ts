import { NextResponse } from "next/server";
import { authenticateCredentials, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const authResult = await authenticateCredentials(email, password);

    if (!authResult.success || !authResult.token || !authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.error || "Autentikasi gagal." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: authResult.user,
      redirectUrl:
        authResult.user.role === "ADMIN"
          ? "/admin/dashboard"
          : "/dosen/dashboard",
    });

    // Set HttpOnly session cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: authResult.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan pada server saat login." },
      { status: 500 }
    );
  }
}

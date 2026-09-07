import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { syncRoomsFromWebService } from "@/lib/room-sync";

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Hanya Admin yang memiliki hak akses untuk sinkronisasi data ruangan." },
        { status: 403 }
      );
    }

    let customUrl: string | undefined;
    try {
      const body = await request.json();
      if (body?.url) customUrl = body.url;
    } catch {
      // Body is optional
    }

    const result = await syncRoomsFromWebService(customUrl);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Sync API error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menjalankan sinkronisasi ruangan." },
      { status: 500 }
    );
  }
}

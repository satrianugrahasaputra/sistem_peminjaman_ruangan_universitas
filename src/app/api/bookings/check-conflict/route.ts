import { NextResponse } from "next/server";
import { checkBookingConflict } from "@/lib/booking-conflict";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomId, startTime, endTime, excludeBookingId } = body;

    if (!roomId || !startTime || !endTime) {
      return NextResponse.json(
        { hasConflict: false, message: "Parameter tidak lengkap." },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { hasConflict: false, message: "Format tanggal atau jam tidak valid." },
        { status: 400 }
      );
    }

    const result = await checkBookingConflict(roomId, start, end, excludeBookingId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("check-conflict error:", error);
    return NextResponse.json(
      { hasConflict: false, error: "Gagal memeriksa bentrok jadwal." },
      { status: 500 }
    );
  }
}

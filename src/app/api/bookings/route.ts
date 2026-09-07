import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { checkBookingConflict } from "@/lib/booking-conflict";

export async function GET(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const q = searchParams.get("q") || "";
    const roomId = searchParams.get("roomId");
    const myOnly = searchParams.get("myOnly") === "true";
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const where: any = {};

    // Soft delete filter: by default exclude deleted unless specifically requested (e.g. Riwayat page)
    if (!includeDeleted) {
      where.isDeleted = false;
    }

    // Role-based visibility
    if (session.role === "DOSEN" || myOnly) {
      where.userId = session.userId;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (roomId) {
      where.roomId = roomId;
    }

    if (q) {
      where.OR = [
        { bookingCode: { contains: q } },
        { purpose: { contains: q } },
        { user: { name: { contains: q } } },
        { room: { name: { contains: q } } },
        { room: { code: { contains: q } } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true, nidn: true, phone: true },
        },
        room: {
          select: { id: true, code: true, name: true, location: true, capacity: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error: any) {
    console.error("GET /api/bookings error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data peminjaman." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    // Aturan Bisnis 1: Hanya user dengan role Dosen yang dapat mengajukan peminjaman
    if (session.role !== "DOSEN") {
      return NextResponse.json(
        {
          success: false,
          error: "Akses ditolak. Hanya user dengan role Dosen yang dapat mengajukan peminjaman ruangan.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { roomId, purpose, startTime, endTime } = body;

    if (!roomId || !purpose || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: "Semua data formulir pengajuan wajib diisi lengkap." },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { success: false, error: "Format tanggal atau waktu tidak valid." },
        { status: 400 }
      );
    }

    if (start >= end) {
      return NextResponse.json(
        { success: false, error: "Waktu mulai harus lebih awal dari waktu selesai peminjaman." },
        { status: 400 }
      );
    }

    // Aturan Bisnis 2: Pencegahan Bentrok Jadwal
    const conflictResult = await checkBookingConflict(roomId, start, end);
    if (conflictResult.hasConflict) {
      return NextResponse.json(
        {
          success: false,
          error: conflictResult.message || "Ruangan telah dipinjam dan disetujui pada waktu tersebut.",
        },
        { status: 400 }
      );
    }

    // Generate readable unique bookingCode: BK-YYYYMMDD-RANDOM
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `BK-${datePart}-${randomSuffix}`;

    const newBooking = await prisma.booking.create({
      data: {
        bookingCode,
        userId: session.userId,
        roomId,
        purpose: purpose.trim(),
        startTime: start,
        endTime: end,
        status: "MENUNGGU",
      },
      include: {
        room: true,
        user: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pengajuan peminjaman berhasil dikirim. Menunggu persetujuan Admin.",
      data: newBooking,
    });
  } catch (error: any) {
    console.error("POST /api/bookings error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat pengajuan peminjaman." },
      { status: 500 }
    );
  }
}

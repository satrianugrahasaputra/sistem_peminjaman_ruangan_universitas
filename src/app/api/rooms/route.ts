import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const location = searchParams.get("location") || "";
    const minCapacity = searchParams.get("minCapacity");

    const where: any = {};

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { code: { contains: q } },
        { facilities: { contains: q } },
      ];
    }

    if (location) {
      where.location = { contains: location };
    }

    if (minCapacity && !isNaN(Number(minCapacity))) {
      where.capacity = { gte: Number(minCapacity) };
    }

    const rooms = await prisma.room.findMany({
      where,
      orderBy: { code: "asc" },
      include: {
        bookings: {
          where: {
            status: "DISETUJUI",
            isDeleted: false,
            endTime: { gte: new Date() },
          },
          select: {
            id: true,
            bookingCode: true,
            purpose: true,
            startTime: true,
            endTime: true,
            user: { select: { name: true } },
          },
          orderBy: { startTime: "asc" },
          take: 3,
        },
      },
    });

    return NextResponse.json({ success: true, data: rooms });
  } catch (error: any) {
    console.error("GET /api/rooms error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat data ruangan." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Hanya Admin yang dapat menambah ruangan." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { code, name, capacity, location, facilities, imageUrl } = body;

    if (!code || !name || !capacity || !location) {
      return NextResponse.json(
        { success: false, error: "Kode ruangan, nama, kapasitas, dan lokasi wajib diisi." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    const existing = await prisma.room.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Kode ruangan "${cleanCode}" sudah digunakan.` },
        { status: 400 }
      );
    }

    const room = await prisma.room.create({
      data: {
        code: cleanCode,
        name: name.trim(),
        capacity: Number(capacity),
        location: location.trim(),
        facilities: facilities?.trim() || "Proyektor, AC, Whiteboard",
        imageUrl: imageUrl?.trim() || null,
        isAvailable: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Ruangan berhasil ditambahkan.",
      data: room,
    });
  } catch (error: any) {
    console.error("POST /api/rooms error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menambahkan ruangan baru." },
      { status: 500 }
    );
  }
}

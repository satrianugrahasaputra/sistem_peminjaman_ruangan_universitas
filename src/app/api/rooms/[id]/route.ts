import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: params.id },
      include: {
        bookings: {
          where: { isDeleted: false },
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
          orderBy: { startTime: "desc" },
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        { success: false, error: "Ruangan tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: room });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Gagal memuat detail ruangan." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Hanya Admin yang dapat mengubah data ruangan." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { code, name, capacity, location, facilities, isAvailable, imageUrl } = body;

    const existingRoom = await prisma.room.findUnique({
      where: { id: params.id },
    });

    if (!existingRoom) {
      return NextResponse.json(
        { success: false, error: "Ruangan tidak ditemukan." },
        { status: 404 }
      );
    }

    const cleanCode = code ? code.trim().toUpperCase() : existingRoom.code;

    // Check if code is taken by another room
    if (cleanCode !== existingRoom.code) {
      const duplicate = await prisma.room.findUnique({
        where: { code: cleanCode },
      });
      if (duplicate) {
        return NextResponse.json(
          { success: false, error: `Kode ruangan "${cleanCode}" telah dipakai oleh ruangan lain.` },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.room.update({
      where: { id: params.id },
      data: {
        code: cleanCode,
        name: name ? name.trim() : existingRoom.name,
        capacity: capacity ? Number(capacity) : existingRoom.capacity,
        location: location ? location.trim() : existingRoom.location,
        facilities: facilities ? facilities.trim() : existingRoom.facilities,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : existingRoom.isAvailable,
        imageUrl: imageUrl !== undefined ? imageUrl : existingRoom.imageUrl,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data ruangan berhasil diperbarui.",
      data: updated,
    });
  } catch (error: any) {
    console.error("PUT /api/rooms/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui data ruangan." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Hanya Admin yang dapat menghapus ruangan." },
        { status: 403 }
      );
    }

    // Check if room has active bookings
    const activeBookingsCount = await prisma.booking.count({
      where: {
        roomId: params.id,
        isDeleted: false,
        status: { in: ["MENUNGGU", "DISETUJUI"] },
        endTime: { gte: new Date() },
      },
    });

    if (activeBookingsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Ruangan tidak dapat dihapus karena memiliki jadwal peminjaman aktif atau menunggu.",
        },
        { status: 400 }
      );
    }

    // Check if room has any historical bookings
    const totalBookingsCount = await prisma.booking.count({
      where: { roomId: params.id },
    });

    if (totalBookingsCount > 0) {
      // Deactivate room availability rather than hard-deleting foreign key relations
      await prisma.room.update({
        where: { id: params.id },
        data: { isAvailable: false },
      });
      return NextResponse.json({
        success: true,
        message: "Ruangan memiliki riwayat peminjaman, status berhasil diubah menjadi Non-Aktif.",
      });
    }

    await prisma.room.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Ruangan berhasil dihapus.",
    });
  } catch (error: any) {
    console.error("DELETE /api/rooms/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus ruangan." },
      { status: 500 }
    );
  }
}

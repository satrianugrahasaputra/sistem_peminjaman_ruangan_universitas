import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const isDosen = session.role === "DOSEN";
    const userFilter = isDosen ? { userId: session.userId } : {};

    const [
      totalRooms,
      totalUsers,
      totalBookings,
      pendingCount,
      approvedCount,
      rejectedCount,
      finishedCount,
      recentBookings,
    ] = await Promise.all([
      prisma.room.count({ where: { isAvailable: true } }),
      prisma.user.count(),
      prisma.booking.count({ where: { ...userFilter, isDeleted: false } }),
      prisma.booking.count({ where: { ...userFilter, isDeleted: false, status: "MENUNGGU" } }),
      prisma.booking.count({ where: { ...userFilter, isDeleted: false, status: "DISETUJUI" } }),
      prisma.booking.count({ where: { ...userFilter, isDeleted: false, status: "DITOLAK" } }),
      prisma.booking.count({ where: { ...userFilter, isDeleted: false, status: "SELESAI" } }),
      prisma.booking.findMany({
        where: { ...userFilter, isDeleted: false },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          user: { select: { name: true, email: true } },
          room: { select: { name: true, code: true, location: true } },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalRooms,
        totalUsers,
        totalBookings,
        pendingCount,
        approvedCount,
        rejectedCount,
        finishedCount,
      },
      recentBookings,
      user: session,
    });
  } catch (error: any) {
    console.error("Stats API Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil statistik dashboard." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildNotificationsFromBookings } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Query relevant bookings with room & user data
    let bookings;
    if (session.role === "DOSEN") {
      bookings = await prisma.booking.findMany({
        where: {
          userId: session.userId,
          isDeleted: false,
        },
        include: {
          room: true,
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 20,
      });
    } else {
      // ADMIN sees latest bookings from all users
      bookings = await prisma.booking.findMany({
        where: {
          isDeleted: false,
        },
        include: {
          room: true,
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 30,
      });
    }

    const notifications = buildNotificationsFromBookings(
      session.role,
      session.userId,
      bookings
    );

    return NextResponse.json({
      success: true,
      notifications,
      total: notifications.length,
      role: session.role,
    });
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

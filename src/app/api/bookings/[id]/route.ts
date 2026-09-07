import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { checkBookingConflict } from "@/lib/booking-conflict";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true, nidn: true, phone: true } },
        room: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Peminjaman tidak ditemukan" }, { status: 404 });
    }

    if (session.role === "DOSEN" && booking.userId !== session.userId) {
      return NextResponse.json({ success: false, error: "Akses ditolak." }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const body = await request.json();
    const { status, adminNotes } = body;

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { room: true },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Data peminjaman tidak ditemukan." }, { status: 404 });
    }

    // Aturan Bisnis: Hanya user dengan role Admin yang dapat menyetujui atau menolak pengajuan peminjaman
    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Hanya Administrator yang dapat mengubah status persetujuan peminjaman." },
        { status: 403 }
      );
    }

    // Status validation: must be one of MENUNGGU, DISETUJUI, DITOLAK, SELESAI
    const allowedStatuses = ["MENUNGGU", "DISETUJUI", "DITOLAK", "SELESAI"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: "Status peminjaman tidak valid." }, { status: 400 });
    }

    // If approving, re-check conflict to prevent race conditions
    if (status === "DISETUJUI") {
      const conflictResult = await checkBookingConflict(
        booking.roomId,
        booking.startTime,
        booking.endTime,
        booking.id
      );

      if (conflictResult.hasConflict) {
        return NextResponse.json(
          {
            success: false,
            error: `Tidak dapat menyetujui: ${conflictResult.message}`,
          },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status,
        adminNotes: adminNotes !== undefined ? adminNotes : booking.adminNotes,
        approvedAt: status === "DISETUJUI" || status === "DITOLAK" ? new Date() : booking.approvedAt,
        approvedById: status === "DISETUJUI" || status === "DITOLAK" ? session.userId : booking.approvedById,
      },
      include: {
        user: { select: { name: true, email: true } },
        room: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Status peminjaman berhasil diubah menjadi "${status}".`,
      data: updated,
    });
  } catch (error: any) {
    console.error("PATCH /api/bookings/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui status peminjaman." },
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
    if (!session) {
      return NextResponse.json({ success: false, error: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Peminjaman tidak ditemukan." }, { status: 404 });
    }

    // Dosen can only cancel their own pending booking; Admin can cancel/archive any
    if (session.role === "DOSEN" && booking.userId !== session.userId) {
      return NextResponse.json({ success: false, error: "Akses ditolak." }, { status: 403 });
    }

    // Aturan Bisnis: Semua riwayat peminjaman tidak boleh terhapus permanen dan harus tersimpan/dapat dilihat.
    const softDeleted = await prisma.booking.update({
      where: { id: params.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Peminjaman berhasil dibatalkan/diarsipkan (disimpan dalam riwayat).",
      data: softDeleted,
    });
  } catch (error: any) {
    console.error("DELETE /api/bookings/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memproses pembatalan peminjaman." },
      { status: 500 }
    );
  }
}

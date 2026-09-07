import { prisma } from "./prisma";

export interface ConflictCheckResult {
  hasConflict: boolean;
  message?: string;
  conflictingBooking?: {
    id: string;
    bookingCode: string;
    purpose: string;
    startTime: Date;
    endTime: Date;
    userName?: string;
  };
}

/**
 * Checks whether a proposed booking timeslot for a given room conflicts with
 * an already approved booking (status = "DISETUJUI").
 *
 * Conflict formula:
 * (Existing.startTime < Proposed.endTime) AND (Existing.endTime > Proposed.startTime)
 */
export async function checkBookingConflict(
  roomId: string,
  startTime: Date,
  endTime: Date,
  excludeBookingId?: string
): Promise<ConflictCheckResult> {
  if (startTime >= endTime) {
    return {
      hasConflict: true,
      message: "Waktu mulai harus lebih awal daripada waktu selesai peminjaman.",
    };
  }

  // Find any active approved booking for the same room that overlaps in time
  const conflict = await prisma.booking.findFirst({
    where: {
      roomId,
      status: "DISETUJUI",
      isDeleted: false,
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
      AND: [
        {
          startTime: {
            lt: endTime,
          },
        },
        {
          endTime: {
            gt: startTime,
          },
        },
      ],
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
      room: {
        select: {
          name: true,
        },
      },
    },
  });

  if (conflict) {
    const startStr = new Date(conflict.startTime).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const endStr = new Date(conflict.endTime).toLocaleString("id-ID", {
      timeStyle: "short",
    });

    return {
      hasConflict: true,
      message: `Jadwal bentrok! Ruangan ${conflict.room.name} telah disetujui untuk kegiatan "${conflict.purpose}" oleh ${conflict.user.name} pada ${startStr} - ${endStr}.`,
      conflictingBooking: {
        id: conflict.id,
        bookingCode: conflict.bookingCode,
        purpose: conflict.purpose,
        startTime: conflict.startTime,
        endTime: conflict.endTime,
        userName: conflict.user.name,
      },
    };
  }

  return {
    hasConflict: false,
  };
}

/**
 * Pure function to check date overlap for unit testing without database dependency.
 */
export function isTimeslotOverlapping(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  return startA < endB && endA > startB;
}

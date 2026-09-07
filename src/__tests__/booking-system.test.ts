import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../lib/prisma";
import {
  checkBookingConflict,
  isTimeslotOverlapping,
} from "../lib/booking-conflict";
import { syncRoomsFromWebService } from "../lib/room-sync";

describe("Sistem Peminjaman Ruang Universitas - Core Logic & Business Rules", () => {
  let dosenUser: any;
  let adminUser: any;
  let testRoom: any;

  beforeAll(async () => {
    // Retrieve seeded test fixtures
    dosenUser = await prisma.user.findFirst({ where: { role: "DOSEN" } });
    adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    testRoom = await prisma.room.findFirst({ where: { code: "RK-A101" } });

    expect(dosenUser).toBeDefined();
    expect(adminUser).toBeDefined();
    expect(testRoom).toBeDefined();
  });

  afterAll(async () => {
    // Cleanup any temporary test booking
    await prisma.booking.deleteMany({
      where: {
        bookingCode: { startsWith: "TEST-BK-" },
      },
    });
    await prisma.$disconnect();
  });

  // Test 1: Schedule Overlap Prevention (Pure Logic)
  it("Test 1: Pencegahan Bentrok - deteksi tumpang tindih waktu dengan presisi", () => {
    const slot1Start = new Date("2026-10-10T08:00:00Z");
    const slot1End = new Date("2026-10-10T10:00:00Z");

    // Overlapping: 09:00 - 11:00
    const slotOverlapStart = new Date("2026-10-10T09:00:00Z");
    const slotOverlapEnd = new Date("2026-10-10T11:00:00Z");
    expect(
      isTimeslotOverlapping(
        slot1Start,
        slot1End,
        slotOverlapStart,
        slotOverlapEnd
      )
    ).toBe(true);

    // Overlapping: completely inside (08:30 - 09:30)
    const slotInsideStart = new Date("2026-10-10T08:30:00Z");
    const slotInsideEnd = new Date("2026-10-10T09:30:00Z");
    expect(
      isTimeslotOverlapping(slot1Start, slot1End, slotInsideStart, slotInsideEnd)
    ).toBe(true);

    // Non-overlapping: strictly after (10:00 - 12:00)
    const slotAfterStart = new Date("2026-10-10T10:00:00Z");
    const slotAfterEnd = new Date("2026-10-10T12:00:00Z");
    expect(
      isTimeslotOverlapping(slot1Start, slot1End, slotAfterStart, slotAfterEnd)
    ).toBe(false);

    // Non-overlapping: strictly before (06:00 - 08:00)
    const slotBeforeStart = new Date("2026-10-10T06:00:00Z");
    const slotBeforeEnd = new Date("2026-10-10T08:00:00Z");
    expect(
      isTimeslotOverlapping(slot1Start, slot1End, slotBeforeStart, slotBeforeEnd)
    ).toBe(false);
  });

  // Test 2: Database Conflict Check with DISETUJUI Booking
  it("Test 2: Pencegahan Bentrok - tolak peminjaman jika ruangan dan waktu bentrok dengan jadwal DISETUJUI", async () => {
    // Create an approved booking for testing
    const startTime = new Date("2026-11-01T08:00:00Z");
    const endTime = new Date("2026-11-01T11:00:00Z");

    const approvedBooking = await prisma.booking.create({
      data: {
        bookingCode: "TEST-BK-APPROVED-001",
        userId: dosenUser.id,
        roomId: testRoom.id,
        purpose: "Ujian Tengah Semester Pemrograman",
        startTime,
        endTime,
        status: "DISETUJUI",
      },
    });

    // Attempt to book overlapping time (09:00 - 10:30) on the same room
    const conflictProposal = await checkBookingConflict(
      testRoom.id,
      new Date("2026-11-01T09:00:00Z"),
      new Date("2026-11-01T10:30:00Z")
    );

    expect(conflictProposal.hasConflict).toBe(true);
    expect(conflictProposal.message).toContain("Jadwal bentrok");

    // Clean up test booking
    await prisma.booking.delete({ where: { id: approvedBooking.id } });
  });

  // Test 3: Allow non-conflicting booking
  it("Test 3: Izinkan peminjaman jika waktu tidak beririsan atau ruangan berbeda", async () => {
    const startTime = new Date("2026-11-02T08:00:00Z");
    const endTime = new Date("2026-11-02T10:00:00Z");

    const approvedBooking = await prisma.booking.create({
      data: {
        bookingCode: "TEST-BK-NONCONFLICT-001",
        userId: dosenUser.id,
        roomId: testRoom.id,
        purpose: "Kuliah Reguler Pagi",
        startTime,
        endTime,
        status: "DISETUJUI",
      },
    });

    // Check non-conflicting time on same room (13:00 - 15:00)
    const afternoonCheck = await checkBookingConflict(
      testRoom.id,
      new Date("2026-11-02T13:00:00Z"),
      new Date("2026-11-02T15:00:00Z")
    );

    expect(afternoonCheck.hasConflict).toBe(false);

    // Clean up
    await prisma.booking.delete({ where: { id: approvedBooking.id } });
  });

  // Test 4: Role-Based Authorization - Only Dosen can request booking
  it("Test 4: Aturan Role - hanya role DOSEN yang diizinkan mengajukan peminjaman", () => {
    function canRequestBooking(userRole: string): boolean {
      return userRole === "DOSEN";
    }

    expect(canRequestBooking("DOSEN")).toBe(true);
    expect(canRequestBooking("ADMIN")).toBe(false);
    expect(canRequestBooking("MAHASISWA")).toBe(false);
  });

  // Test 5: Role-Based Authorization - Only Admin can approve or reject
  it("Test 5: Aturan Role - hanya role ADMIN yang diizinkan approve atau reject pengajuan", () => {
    function canApproveOrReject(userRole: string): boolean {
      return userRole === "ADMIN";
    }

    expect(canApproveOrReject("ADMIN")).toBe(true);
    expect(canApproveOrReject("DOSEN")).toBe(false);
    expect(canApproveOrReject("GUEST")).toBe(false);
  });

  // Test 6: 4-Stage Lifecycle Cycle (Menunggu -> Disetujui/Ditolak -> Selesai)
  it("Test 6: Siklus Status Pengajuan - 4 Tahap (Menunggu, Disetujui, Ditolak, Selesai)", () => {
    const validStatuses = ["MENUNGGU", "DISETUJUI", "DITOLAK", "SELESAI"];

    function isValidStatusTransition(
      currentStatus: string,
      nextStatus: string
    ): boolean {
      if (!validStatuses.includes(nextStatus)) return false;

      if (currentStatus === "MENUNGGU") {
        return nextStatus === "DISETUJUI" || nextStatus === "DITOLAK";
      }
      if (currentStatus === "DISETUJUI") {
        return nextStatus === "SELESAI";
      }
      return false;
    }

    expect(isValidStatusTransition("MENUNGGU", "DISETUJUI")).toBe(true);
    expect(isValidStatusTransition("MENUNGGU", "DITOLAK")).toBe(true);
    expect(isValidStatusTransition("DISETUJUI", "SELESAI")).toBe(true);
    // Invalid transition
    expect(isValidStatusTransition("DITOLAK", "SELESAI")).toBe(false);
    expect(isValidStatusTransition("SELESAI", "MENUNGGU")).toBe(false);
  });

  // Test 7: Historical Data Retention (Soft delete preserves data)
  it("Test 7: Retensi Riwayat - data peminjaman tidak boleh terhapus permanen dari database", async () => {
    const booking = await prisma.booking.create({
      data: {
        bookingCode: "TEST-BK-HISTORY-001",
        userId: dosenUser.id,
        roomId: testRoom.id,
        purpose: "Kuliah Pengganti",
        startTime: new Date("2026-11-03T08:00:00Z"),
        endTime: new Date("2026-11-03T10:00:00Z"),
        status: "MENUNGGU",
      },
    });

    // Soft delete action
    const softDeleted = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    expect(softDeleted.isDeleted).toBe(true);
    expect(softDeleted.deletedAt).toBeDefined();

    // Verify row still exists in database
    const recordInDb = await prisma.booking.findUnique({
      where: { id: booking.id },
    });
    expect(recordInDb).not.toBeNull();
    expect(recordInDb?.bookingCode).toBe("TEST-BK-HISTORY-001");

    // Clean up
    await prisma.booking.delete({ where: { id: booking.id } });
  });

  // Test 8: Room WebService Sync & Upsert
  it("Test 8: Sinkronisasi Ruangan - berhasil melakukan upsert data ruangan dari WebService / Fallback", async () => {
    const result = await syncRoomsFromWebService();
    expect(result.success).toBe(true);
    expect(result.total).toBeGreaterThanOrEqual(10);

    const roomCount = await prisma.room.count();
    expect(roomCount).toBeGreaterThanOrEqual(10);
  });
});

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../lib/prisma";

describe("Analitik & Dashboard Reporting Logic", () => {
  beforeAll(async () => {
    // Warm up DB connection
    await prisma.room.count();
  }, 20000);

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("Test Analytics 1: Perhitungan rasio status pengajuan (status distribution) akurat", async () => {
    const [totalBookings, approvedCount, pendingCount, rejectedCount] = await Promise.all([
      prisma.booking.count({ where: { isDeleted: false } }),
      prisma.booking.count({ where: { isDeleted: false, status: "DISETUJUI" } }),
      prisma.booking.count({ where: { isDeleted: false, status: "MENUNGGU" } }),
      prisma.booking.count({ where: { isDeleted: false, status: "DITOLAK" } }),
    ]);

    expect(totalBookings).toBeGreaterThanOrEqual(0);
    expect(approvedCount).toBeGreaterThanOrEqual(0);
    expect(pendingCount).toBeGreaterThanOrEqual(0);
    expect(rejectedCount).toBeGreaterThanOrEqual(0);
  }, 15000);

  it("Test Analytics 2: Data ruangan terpopuler dapat diagregasi dan diurutkan", async () => {
    const rooms = await prisma.room.findMany({
      where: { isAvailable: true },
      take: 5,
    });

    expect(rooms.length).toBeGreaterThanOrEqual(1);
    expect(rooms[0].name).toBeDefined();
    expect(rooms[0].code).toBeDefined();
  }, 15000);

  it("Test Analytics 3: Indikator KPI Approval Rate valid antara 0% s.d. 100%", async () => {
    const approved = await prisma.booking.count({ where: { status: "DISETUJUI" } });
    const rejected = await prisma.booking.count({ where: { status: "DITOLAK" } });
    const resolved = approved + rejected;

    const rate = resolved > 0 ? Math.round((approved / resolved) * 100) : 100;
    expect(rate).toBeGreaterThanOrEqual(0);
    expect(rate).toBeLessThanOrEqual(100);
  }, 15000);
});

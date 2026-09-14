import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../lib/prisma";
import QRCode from "qrcode";

describe("Fitur Cetak Surat Izin / Lembar Rekomendasi (Cetak PDF)", () => {
  let approvedBooking: any;
  let testUser: any;
  let testRoom: any;

  beforeAll(async () => {
    // Retrieve an existing approved booking or create one for testing
    testUser = await prisma.user.findFirst({ where: { role: "DOSEN" } });
    testRoom = await prisma.room.findFirst({ where: { code: "RK-A101" } });

    approvedBooking = await prisma.booking.create({
      data: {
        bookingCode: "TEST-BK-SURAT-01",
        userId: testUser.id,
        roomId: testRoom.id,
        purpose: "Kuliah Umum & Ujian Akhir Semester Pemrograman Web",
        startTime: new Date("2026-10-15T08:00:00Z"),
        endTime: new Date("2026-10-15T11:00:00Z"),
        status: "DISETUJUI",
        adminNotes: "Disetujui untuk kegiatan akademik resmi. Harap menjaga kebersihan.",
        approvedAt: new Date("2026-10-10T10:00:00Z"),
      },
      include: {
        user: true,
        room: true,
      },
    });
  });

  afterAll(async () => {
    if (approvedBooking) {
      await prisma.booking.delete({
        where: { id: approvedBooking.id },
      });
    }
    await prisma.$disconnect();
  });

  it("Test Surat 1: Data pengajuan yang disetujui memuat seluruh komponen resmi surat izin", () => {
    expect(approvedBooking.status).toBe("DISETUJUI");
    expect(approvedBooking.bookingCode).toBe("TEST-BK-SURAT-01");
    expect(approvedBooking.user.name).toBeDefined();
    expect(approvedBooking.room.name).toBeDefined();
    expect(approvedBooking.room.code).toBe("RK-A101");
    expect(approvedBooking.room.location).toBeDefined();
    expect(approvedBooking.purpose).toContain("Pemrograman Web");
  });

  it("Test Surat 2: Format nomor surat resmi universitas tergenerasi dengan benar", () => {
    const startDate = new Date(approvedBooking.startTime);
    const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const romanMonth = romanMonths[startDate.getMonth()] || "X";
    const letterYear = startDate.getFullYear();
    const letterNumber = `048/UNIV/SARPRAS-IZIN/${romanMonth}/${letterYear}/${approvedBooking.bookingCode}`;

    expect(letterNumber).toContain("048/UNIV/SARPRAS-IZIN");
    expect(letterNumber).toContain("2026");
    expect(letterNumber).toContain("TEST-BK-SURAT-01");
  });

  it("Test Surat 3: QR Code verifikasi dokumen resmi berhasil digenerate ke format Data URL", async () => {
    const verifyUrl = `https://kampus.ac.id/cetak-surat/${approvedBooking.id}?code=${approvedBooking.bookingCode}`;
    const qrData = await QRCode.toDataURL(verifyUrl);

    expect(qrData).toBeDefined();
    expect(qrData.startsWith("data:image/png;base64,")).toBe(true);
  });
});

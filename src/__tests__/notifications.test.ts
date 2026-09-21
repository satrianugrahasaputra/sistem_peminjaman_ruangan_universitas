import { describe, it, expect } from "vitest";
import {
  formatRelativeTime,
  buildNotificationsFromBookings,
} from "../lib/notifications";

describe("In-App Notifications Logic & Rules", () => {
  it("Test 1: formatRelativeTime menghasilkan teks waktu relatif bahasa Indonesia yang tepat", () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe("Baru saja");

    const tenMinAgo = new Date(now.getTime() - 10 * 60 * 1000);
    expect(formatRelativeTime(tenMinAgo)).toBe("10 menit yang lalu");

    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoHoursAgo)).toBe("2 jam yang lalu");

    const yesterday = new Date(now.getTime() - 25 * 60 * 60 * 1000);
    expect(formatRelativeTime(yesterday)).toBe("Kemarin");
  });

  it("Test 2: Dosen menerima notifikasi 'Pengajuan Disetujui' saat status booking DISETUJUI", () => {
    const mockBookings = [
      {
        id: "b-1",
        bookingCode: "BK-2026-001",
        userId: "dosen-1",
        status: "DISETUJUI",
        approvedAt: new Date(),
        updatedAt: new Date(),
        createdAt: new Date(),
        isDeleted: false,
        room: {
          code: "RK-A101",
          name: "Ruang Kuliah Teori A101",
        },
      },
    ];

    const notifs = buildNotificationsFromBookings("DOSEN", "dosen-1", mockBookings);
    expect(notifs.length).toBe(1);
    expect(notifs[0].type).toBe("APPROVED");
    expect(notifs[0].title).toBe("Pengajuan Disetujui");
    expect(notifs[0].message).toContain("RK-A101");
    expect(notifs[0].message).toContain("Disetujui oleh Admin");
    expect(notifs[0].link).toBe("/dosen/riwayat");
  });

  it("Test 3: Dosen menerima notifikasi 'Pengajuan Ditolak' dengan alasan jika status DITOLAK", () => {
    const mockBookings = [
      {
        id: "b-2",
        bookingCode: "BK-2026-002",
        userId: "dosen-1",
        status: "DITOLAK",
        adminNotes: "Jadwal bentrok dengan pemeliharaan AC",
        updatedAt: new Date(),
        createdAt: new Date(),
        isDeleted: false,
        room: {
          code: "LAB-KOMP-1",
          name: "Laboratorium Komputer 1",
        },
      },
    ];

    const notifs = buildNotificationsFromBookings("DOSEN", "dosen-1", mockBookings);
    expect(notifs.length).toBe(1);
    expect(notifs[0].type).toBe("REJECTED");
    expect(notifs[0].title).toBe("Pengajuan Ditolak");
    expect(notifs[0].message).toContain("Jadwal bentrok dengan pemeliharaan AC");
  });

  it("Test 4: Admin menerima notifikasi 'Ada pengajuan baru menunggu persetujuan' untuk status MENUNGGU", () => {
    const mockBookings = [
      {
        id: "b-3",
        bookingCode: "BK-2026-003",
        userId: "dosen-2",
        status: "MENUNGGU",
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        room: {
          code: "RK-B201",
          name: "Ruang Kuliah B201",
        },
        user: {
          name: "Dr. Siti Aminah",
        },
      },
    ];

    const notifs = buildNotificationsFromBookings("ADMIN", "admin-1", mockBookings);
    expect(notifs.length).toBeGreaterThanOrEqual(1);
    const pendingNotif = notifs.find((n) => n.type === "PENDING_NEW");
    expect(pendingNotif).toBeDefined();
    expect(pendingNotif?.title).toContain("Menunggu Persetujuan");
    expect(pendingNotif?.message).toContain("menunggu persetujuan");
    expect(pendingNotif?.link).toBe("/admin/peminjaman");
  });

  it("Test 5: Dosen tidak menerima notifikasi dari booking milik Dosen lain", () => {
    const mockBookings = [
      {
        id: "b-4",
        bookingCode: "BK-2026-004",
        userId: "dosen-lain",
        status: "DISETUJUI",
        approvedAt: new Date(),
        updatedAt: new Date(),
        createdAt: new Date(),
        isDeleted: false,
        room: { code: "AULA-UTAMA", name: "Aula Utama" },
      },
    ];

    const notifs = buildNotificationsFromBookings("DOSEN", "dosen-saya", mockBookings);
    expect(notifs.length).toBe(0);
  });
});

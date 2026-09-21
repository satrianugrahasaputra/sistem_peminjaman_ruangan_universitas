export interface SystemNotification {
  id: string;
  type: "APPROVED" | "REJECTED" | "PENDING" | "PENDING_NEW" | "INFO";
  title: string;
  message: string;
  timestamp: string; // ISO string
  timeAgo: string;
  link: string;
  bookingCode?: string;
  roomCode?: string;
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit yang lalu`;
  if (diffHour < 24) return `${diffHour} jam yang lalu`;
  if (diffDay === 1) return "Kemarin";
  if (diffDay < 7) return `${diffDay} hari yang lalu`;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export function buildNotificationsFromBookings(
  role: "ADMIN" | "DOSEN",
  userId: string,
  bookings: any[]
): SystemNotification[] {
  const notifs: SystemNotification[] = [];

  if (role === "DOSEN") {
    // Notifications for Dosen
    const userBookings = bookings.filter((b) => b.userId === userId && !b.isDeleted);

    for (const b of userBookings) {
      const roomCode = b.room?.code || "Ruangan";
      const roomName = b.room?.name || "";

      if (b.status === "DISETUJUI") {
        const ts = b.approvedAt ? new Date(b.approvedAt) : new Date(b.updatedAt);
        notifs.push({
          id: `notif-${b.id}-approved`,
          type: "APPROVED",
          title: "Pengajuan Disetujui",
          message: `Pengajuan ${roomCode} (${roomName}) Anda telah Disetujui oleh Admin.`,
          timestamp: ts.toISOString(),
          timeAgo: formatRelativeTime(ts),
          link: `/dosen/riwayat`,
          bookingCode: b.bookingCode,
          roomCode: roomCode,
        });
      } else if (b.status === "DITOLAK") {
        const ts = new Date(b.updatedAt);
        const reason = b.adminNotes ? `: ${b.adminNotes}` : " oleh Admin.";
        notifs.push({
          id: `notif-${b.id}-rejected`,
          type: "REJECTED",
          title: "Pengajuan Ditolak",
          message: `Pengajuan ${roomCode} Ditolak${reason}`,
          timestamp: ts.toISOString(),
          timeAgo: formatRelativeTime(ts),
          link: `/dosen/riwayat`,
          bookingCode: b.bookingCode,
          roomCode: roomCode,
        });
      } else if (b.status === "MENUNGGU") {
        const ts = new Date(b.createdAt);
        notifs.push({
          id: `notif-${b.id}-pending`,
          type: "PENDING",
          title: "Menunggu Persetujuan",
          message: `Pengajuan ${roomCode} berhasil dikirim dan menunggu persetujuan Admin.`,
          timestamp: ts.toISOString(),
          timeAgo: formatRelativeTime(ts),
          link: `/dosen/riwayat`,
          bookingCode: b.bookingCode,
          roomCode: roomCode,
        });
      } else if (b.status === "SELESAI") {
        const ts = new Date(b.updatedAt);
        notifs.push({
          id: `notif-${b.id}-finished`,
          type: "INFO",
          title: "Peminjaman Selesai",
          message: `Peminjaman ruangan ${roomCode} telah selesai digunakan.`,
          timestamp: ts.toISOString(),
          timeAgo: formatRelativeTime(ts),
          link: `/dosen/riwayat`,
          bookingCode: b.bookingCode,
          roomCode: roomCode,
        });
      }
    }
  } else {
    // Notifications for Admin
    const activeBookings = bookings.filter((b) => !b.isDeleted);
    const pendingBookings = activeBookings.filter((b) => b.status === "MENUNGGU");

    // Summary of pending if multiple
    if (pendingBookings.length > 0) {
      const latestPending = pendingBookings[0];
      const ts = new Date(latestPending.createdAt);
      notifs.push({
        id: `notif-admin-pending-summary-${latestPending.id}`,
        type: "PENDING_NEW",
        title: "Pengajuan Baru Menunggu Persetujuan",
        message:
          pendingBookings.length === 1
            ? `Ada 1 pengajuan baru menunggu persetujuan (${latestPending.room?.code} oleh ${latestPending.user?.name || "Dosen"}).`
            : `Ada ${pendingBookings.length} pengajuan baru menunggu persetujuan Anda.`,
        timestamp: ts.toISOString(),
        timeAgo: formatRelativeTime(ts),
        link: `/admin/peminjaman`,
        bookingCode: latestPending.bookingCode,
        roomCode: latestPending.room?.code,
      });
    }

    // Individual recent activities
    for (const b of activeBookings.slice(0, 10)) {
      const roomCode = b.room?.code || "Ruangan";
      const userName = b.user?.name || "Dosen";

      if (b.status === "MENUNGGU" && pendingBookings.length === 1) {
        // Already covered in summary
        continue;
      }

      if (b.status === "MENUNGGU") {
        const ts = new Date(b.createdAt);
        notifs.push({
          id: `notif-admin-${b.id}-pending`,
          type: "PENDING_NEW",
          title: "Pengajuan Masuk",
          message: `${userName} mengajukan peminjaman ${roomCode} (${b.bookingCode}).`,
          timestamp: ts.toISOString(),
          timeAgo: formatRelativeTime(ts),
          link: `/admin/peminjaman`,
          bookingCode: b.bookingCode,
          roomCode: roomCode,
        });
      } else if (b.status === "DISETUJUI") {
        const ts = b.approvedAt ? new Date(b.approvedAt) : new Date(b.updatedAt);
        notifs.push({
          id: `notif-admin-${b.id}-approved`,
          type: "APPROVED",
          title: "Peminjaman Disetujui",
          message: `Peminjaman ${roomCode} oleh ${userName} telah disetujui.`,
          timestamp: ts.toISOString(),
          timeAgo: formatRelativeTime(ts),
          link: `/admin/peminjaman`,
          bookingCode: b.bookingCode,
          roomCode: roomCode,
        });
      }
    }
  }

  // Sort latest first
  return notifs.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DosenLayout from "@/components/DosenLayout";
import StatusBadge from "@/components/StatusBadge";
import {
  CalendarPlus,
  DoorOpen,
  Clock,
  CheckCircle2,
  XCircle,
  CheckCheck,
  ArrowRight,
  Calendar,
  Sparkles,
} from "lucide-react";

export default function DosenDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
          setRecentBookings(data.recentBookings || []);
          setUser(data.user);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DosenLayout>
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl mb-8">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Selamat Datang di Portal Sarpras Dosen
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Halo, {user?.name || "Bapak/Ibu Dosen"}
          </h1>
          <p className="text-emerald-100/90 text-sm mt-2 leading-relaxed">
            Ajukan reservasi ruangan perkuliahan, laboratorium, atau ruang rapat dengan mudah. Sistem akan memverifikasi jadwal bentrok secara otomatis.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/dosen/ajukan"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs sm:text-sm font-bold transition shadow-md"
            >
              <CalendarPlus className="w-4 h-4 text-emerald-600" />
              <span>Ajukan Peminjaman Baru</span>
            </Link>
            <Link
              href="/dosen/ruangan"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-900/60 hover:bg-emerald-900 border border-emerald-400/30 text-white rounded-xl text-xs sm:text-sm font-semibold transition"
            >
              <DoorOpen className="w-4 h-4" />
              <span>Lihat Katalog Ruang</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        {/* Card 1: Menunggu */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Menunggu Review
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-amber-900">
              {loading ? "..." : stats?.pendingCount ?? 0}
            </span>
            <Link
              href="/dosen/riwayat?status=MENUNGGU"
              className="text-xs font-medium text-amber-700 hover:text-amber-900 flex items-center gap-0.5"
            >
              Lihat <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 2: Disetujui */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Disetujui
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-emerald-900">
              {loading ? "..." : stats?.approvedCount ?? 0}
            </span>
            <Link
              href="/dosen/riwayat?status=DISETUJUI"
              className="text-xs font-medium text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5"
            >
              Jadwal Aktif <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 3: Ditolak */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ditolak
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-rose-700">
              {loading ? "..." : stats?.rejectedCount ?? 0}
            </span>
            <Link
              href="/dosen/riwayat?status=DITOLAK"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-0.5"
            >
              Lihat Alasan <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 4: Total Selesai */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Selesai Terlaksana
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-indigo-700">
              {loading ? "..." : stats?.finishedCount ?? 0}
            </span>
            <Link
              href="/dosen/riwayat"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-0.5"
            >
              Riwayat <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Personal Bookings */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="p-5 sm:px-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Status Pengajuan Terakhir Saya
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau status persetujuan ruangan yang Anda ajukan.
            </p>
          </div>
          <Link
            href="/dosen/riwayat"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
          >
            Semua Riwayat <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Kode Booking</th>
                <th className="py-3 px-4">Ruangan</th>
                <th className="py-3 px-4">Waktu Peminjaman</th>
                <th className="py-3 px-4">Keperluan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Memuat status pengajuan...
                  </td>
                </tr>
              ) : recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Anda belum pernah mengajukan peminjaman ruangan.
                  </td>
                </tr>
              ) : (
                recentBookings.map((b) => {
                  const start = new Date(b.startTime);
                  const end = new Date(b.endTime);

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-semibold text-xs text-emerald-800">
                        {b.bookingCode}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-xs text-slate-900">
                          {b.room?.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {b.room?.code} &bull; {b.room?.location}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <div className="text-slate-800 font-medium">
                          {start.toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {start.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} -{" "}
                          {end.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs max-w-xs truncate" title={b.purpose}>
                        {b.purpose}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={b.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href="/dosen/riwayat"
                          className="text-xs text-emerald-700 hover:underline font-semibold"
                        >
                          Lihat
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DosenLayout>
  );
}

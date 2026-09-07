"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import StatusBadge from "@/components/StatusBadge";
import {
  DoorOpen,
  Clock,
  CheckCircle2,
  XCircle,
  CheckCheck,
  ArrowRight,
  RefreshCw,
  Plus,
  Calendar,
  Search,
  AlertTriangle,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Quick Action Modal states
  const [actionBooking, setActionBooking] = useState<any | null>(null);
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentBookings(data.recentBookings || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSyncRooms = async () => {
    try {
      setSyncing(true);
      setSyncMessage(null);
      const res = await fetch("/api/rooms/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSyncMessage(`✅ ${data.message}`);
        loadData();
      } else {
        setSyncMessage(`❌ ${data.error || "Gagal melakukan sinkronisasi."}`);
      }
    } catch {
      setSyncMessage("❌ Terjadi kesalahan saat sinkronisasi.");
    } finally {
      setSyncing(false);
    }
  };

  const handleProcessAction = async () => {
    if (!actionBooking || !actionType) return;
    setActionLoading(true);
    setActionError("");

    try {
      const nextStatus = actionType === "APPROVE" ? "DISETUJUI" : "DITOLAK";
      const res = await fetch(`/api/bookings/${actionBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          adminNotes: actionType === "REJECT" ? rejectReason : "Pengajuan telah disetujui.",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setActionError(data.error || "Gagal memproses pengajuan.");
        setActionLoading(false);
        return;
      }

      // Close modal and refresh
      setActionBooking(null);
      setActionType(null);
      setRejectReason("");
      loadData();
    } catch (err: any) {
      setActionError("Terjadi kesalahan jaringan.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout>
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Dashboard Administrator
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Ringkasan pemantauan statistik dan pengajuan peminjaman ruangan universitas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-sync-api-dashboard"
            onClick={handleSyncRooms}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm hover:border-slate-400 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 text-indigo-600 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Sinkronisasi..." : "Sinkronisasi API"}</span>
          </button>

          <Link
            href="/admin/ruangan"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Ruang</span>
          </Link>
        </div>
      </div>

      {/* Sync feedback notification */}
      {syncMessage && (
        <div className="mb-6 p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-sm flex items-center justify-between">
          <span>{syncMessage}</span>
          <button
            onClick={() => setSyncMessage(null)}
            className="text-xs font-semibold text-indigo-700 hover:underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 mb-8">
        {/* Card 1: Total Ruangan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Ruangan
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DoorOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900">
              {loading ? "..." : stats?.totalRooms ?? 0}
            </span>
            <Link
              href="/admin/ruangan"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
            >
              Lihat <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 2: Menunggu Persetujuan */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-sm flex flex-col justify-between hover:border-amber-300 transition">
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
              href="/admin/peminjaman?status=MENUNGGU"
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-0.5"
            >
              Review <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 3: Disetujui */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-emerald-200 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Disetujui
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-emerald-700">
              {loading ? "..." : stats?.approvedCount ?? 0}
            </span>
            <Link
              href="/admin/peminjaman?status=DISETUJUI"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-0.5"
            >
              Daftar <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 4: Ditolak */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-rose-200 transition">
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
              href="/admin/peminjaman?status=DITOLAK"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-0.5"
            >
              Daftar <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 5: Selesai */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Selesai
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
              href="/admin/riwayat"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-0.5"
            >
              Riwayat <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Bookings Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">
        <div className="p-5 sm:px-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Pengajuan Peminjaman Terbaru
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar permohonan ruang yang baru diajukan oleh dosen pengajar.
            </p>
          </div>
          <Link
            href="/admin/peminjaman"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start sm:self-auto"
          >
            Buka Seluruh Pengajuan <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Kode & Dosen</th>
                <th className="py-3 px-4">Ruangan</th>
                <th className="py-3 px-4">Waktu Peminjaman</th>
                <th className="py-3 px-4">Keperluan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Memuat data peminjaman...
                  </td>
                </tr>
              ) : recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Belum ada data pengajuan peminjaman.
                  </td>
                </tr>
              ) : (
                recentBookings.map((b) => {
                  const start = new Date(b.startTime);
                  const end = new Date(b.endTime);
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 text-xs">
                          {b.bookingCode}
                        </div>
                        <div className="text-xs text-slate-500">
                          {b.user?.name || "-"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 text-xs">
                          {b.room?.name || "-"}
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
                          {start.toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {end.toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs max-w-xs truncate">
                        {b.purpose}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={b.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {b.status === "MENUNGGU" ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setActionBooking(b);
                                setActionType("APPROVE");
                                setActionError("");
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition"
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() => {
                                setActionBooking(b);
                                setActionType("REJECT");
                                setRejectReason("");
                                setActionError("");
                              }}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition"
                            >
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <Link
                            href="/admin/peminjaman"
                            className="text-xs text-indigo-600 hover:underline font-medium"
                          >
                            Detail
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation & Action Modal */}
      {actionBooking && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {actionType === "APPROVE" ? "Konfirmasi Persetujuan" : "Tolak Pengajuan Peminjaman"}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {actionType === "APPROVE"
                ? `Apakah Anda yakin ingin menyetujui peminjaman ruangan ${actionBooking.room?.name} untuk kegiatan "${actionBooking.purpose}"? Slot waktu akan dikunci.`
                : `Masukkan alasan penolakan peminjaman ruangan ${actionBooking.room?.name}:`}
            </p>

            {actionError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            {actionType === "REJECT" && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Alasan Penolakan:
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Contoh: Ruangan sedang dalam masa perawatan AC dan proyektor."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  required
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setActionBooking(null);
                  setActionType(null);
                }}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleProcessAction}
                disabled={actionLoading || (actionType === "REJECT" && !rejectReason.trim())}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-xl transition ${
                  actionType === "APPROVE"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                } disabled:opacity-50`}
              >
                {actionLoading ? "Memproses..." : actionType === "APPROVE" ? "Ya, Setujui" : "Tolak Pengajuan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import StatusBadge from "@/components/StatusBadge";
import {
  ClipboardCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  CheckCheck,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  Info,
  MapPin,
  X,
  Printer,
} from "lucide-react";

interface BookingItem {
  id: string;
  bookingCode: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    nidn?: string;
    phone?: string;
  };
  roomId: string;
  room: {
    id: string;
    code: string;
    name: string;
    location: string;
    capacity: number;
  };
  purpose: string;
  startTime: string;
  endTime: string;
  status: "MENUNGGU" | "DISETUJUI" | "DITOLAK" | "SELESAI";
  adminNotes?: string;
  approvedAt?: string;
  createdAt: string;
}

export default function AdminPeminjamanPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Action State
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | "FINISH" | "DETAIL" | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (searchQuery) params.set("q", searchQuery);

      const res = await fetch(`/api/bookings?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setBookings(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, searchQuery]);

  const handleUpdateStatus = async (targetStatus: string, notes?: string) => {
    if (!selectedBooking) return;
    setActionLoading(true);
    setActionError("");

    try {
      const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: targetStatus,
          adminNotes: notes || (targetStatus === "DISETUJUI" ? "Pengajuan disetujui oleh Administrator." : undefined),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setActionError(data.error || "Gagal mengubah status peminjaman.");
        setActionLoading(false);
        return;
      }

      // Close modal and refresh list
      setSelectedBooking(null);
      setActionType(null);
      setRejectReason("");
      fetchBookings();
    } catch (err) {
      setActionError("Terjadi kesalahan jaringan.");
    } finally {
      setActionLoading(false);
    }
  };

  const statusTabs = [
    { label: "Semua Pengajuan", value: "ALL" },
    { label: "Menunggu Review", value: "MENUNGGU" },
    { label: "Disetujui", value: "DISETUJUI" },
    { label: "Ditolak", value: "DITOLAK" },
    { label: "Selesai", value: "SELESAI" },
  ];

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Persetujuan Pengajuan Peminjaman
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Review pengajuan dari Dosen, setujui (Approve), tolak (Reject), atau tandai selesai.
        </p>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-1 sm:gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1">
        {statusTabs.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-t-xl transition whitespace-nowrap border-b-2 -mb-1 ${
                isActive
                  ? "text-indigo-600 border-indigo-600 bg-indigo-50/50"
                  : "text-slate-500 hover:text-slate-800 border-transparent hover:border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari kode booking, nama dosen, ruangan, atau kegiatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Kode Booking</th>
                <th className="py-3.5 px-4">Dosen Pemohon</th>
                <th className="py-3.5 px-4">Ruangan</th>
                <th className="py-3.5 px-4">Jadwal Penggunaan</th>
                <th className="py-3.5 px-4">Keperluan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Memuat data pengajuan peminjaman...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ditemukan pengajuan peminjaman.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const start = new Date(b.startTime);
                  const end = new Date(b.endTime);

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-semibold text-xs text-indigo-700">
                        {b.bookingCode}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-xs text-slate-900">
                          {b.user?.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {b.user?.email} {b.user?.nidn ? `• NIDN: ${b.user.nidn}` : ""}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-xs text-slate-800">
                          {b.room?.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {b.room?.code} ({b.room?.location})
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <div className="text-slate-800 font-medium">
                          {start.toLocaleDateString("id-ID", {
                            weekday: "short",
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
                      <td className="py-3.5 px-4 text-xs max-w-xs truncate" title={b.purpose}>
                        {b.purpose}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={b.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {b.status === "MENUNGGU" && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedBooking(b);
                                  setActionType("APPROVE");
                                  setActionError("");
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                              >
                                Setujui
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedBooking(b);
                                  setActionType("REJECT");
                                  setRejectReason("");
                                  setActionError("");
                                }}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition"
                              >
                                Tolak
                              </button>
                            </>
                          )}

                          {b.status === "DISETUJUI" && (
                            <button
                              onClick={() => {
                                setSelectedBooking(b);
                                setActionType("FINISH");
                                setActionError("");
                              }}
                              className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-semibold transition"
                            >
                              Tandai Selesai
                            </button>
                          )}

                          {(b.status === "DISETUJUI" || b.status === "SELESAI") && (
                            <Link
                              href={`/cetak-surat/${b.id}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-semibold transition"
                              title="Cetak Surat Izin / Lembar Rekomendasi (PDF)"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Surat</span>
                            </Link>
                          )}

                          <button
                            onClick={() => {
                              setSelectedBooking(b);
                              setActionType("DETAIL");
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition"
                            title="Detail Peminjaman"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Approve / Reject / Detail */}
      {selectedBooking && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {actionType === "APPROVE" && "Setujui Peminjaman"}
                {actionType === "REJECT" && "Tolak Pengajuan Peminjaman"}
                {actionType === "FINISH" && "Tandai Peminjaman Selesai"}
                {actionType === "DETAIL" && "Detail Peminjaman Ruang"}
              </h3>
              <button
                onClick={() => {
                  setSelectedBooking(null);
                  setActionType(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Quick Summary Info */}
            <div className="bg-slate-50 p-3.5 rounded-xl text-xs space-y-2 mb-4 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Kode Booking:</span>
                <span className="font-semibold text-indigo-700">{selectedBooking.bookingCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pemohon:</span>
                <span className="font-semibold text-slate-800">{selectedBooking.user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ruangan:</span>
                <span className="font-semibold text-slate-800">{selectedBooking.room?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(selectedBooking.startTime).toLocaleDateString("id-ID", { dateStyle: "medium" })}{" "}
                  ({new Date(selectedBooking.startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} -{" "}
                  {new Date(selectedBooking.endTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Keperluan:</span>
                <p className="font-medium text-slate-800">{selectedBooking.purpose}</p>
              </div>
              {selectedBooking.adminNotes && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block mb-0.5">Catatan Admin:</span>
                  <p className="text-slate-700 italic">{selectedBooking.adminNotes}</p>
                </div>
              )}
            </div>

            {/* Form if REJECT */}
            {actionType === "REJECT" && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alasan Penolakan Pengajuan *
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Tuliskan alasan penolakan agar dosen dapat menyesuaikan jadwal atau ruangan lain..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setSelectedBooking(null);
                  setActionType(null);
                }}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Tutup
              </button>

              {actionType === "APPROVE" && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("DISETUJUI")}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm shadow-emerald-600/30"
                >
                  {actionLoading ? "Menyetujui..." : "Ya, Setujui Pengajuan"}
                </button>
              )}

              {actionType === "REJECT" && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("DITOLAK", rejectReason)}
                  disabled={actionLoading || !rejectReason.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-sm shadow-rose-600/30 disabled:opacity-50"
                >
                  {actionLoading ? "Memproses..." : "Tolak Pengajuan"}
                </button>
              )}

              {actionType === "FINISH" && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("SELESAI", "Kegiatan telah selesai.")}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm shadow-indigo-600/30"
                >
                  {actionLoading ? "Memproses..." : "Tandai Selesai"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

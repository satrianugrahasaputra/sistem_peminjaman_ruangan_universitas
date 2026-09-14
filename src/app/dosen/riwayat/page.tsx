"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DosenLayout from "@/components/DosenLayout";
import StatusBadge from "@/components/StatusBadge";
import {
  History,
  CalendarPlus,
  Search,
  Filter,
  Calendar,
  Clock,
  DoorOpen,
  Info,
  XCircle,
  AlertTriangle,
  X,
  Printer,
} from "lucide-react";

interface BookingItem {
  id: string;
  bookingCode: string;
  roomId: string;
  room: {
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
  createdAt: string;
  isDeleted: boolean;
}

export default function DosenRiwayatPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Detail & Cancel states
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [cancelTarget, setCancelTarget] = useState<BookingItem | null>(null);
  const [canceling, setCanceling] = useState(false);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("myOnly", "true");
      params.set("includeDeleted", "true");
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (searchQuery) params.set("q", searchQuery);

      const res = await fetch(`/api/bookings?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setBookings(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, [statusFilter, searchQuery]);

  const handleCancelBooking = async () => {
    if (!cancelTarget) return;
    setCanceling(true);

    try {
      const res = await fetch(`/api/bookings/${cancelTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setCancelTarget(null);
        fetchMyBookings();
      } else {
        alert(data.error || "Gagal membatalkan pengajuan.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setCanceling(false);
    }
  };

  const statusTabs = [
    { label: "Semua Riwayat", value: "ALL" },
    { label: "Menunggu", value: "MENUNGGU" },
    { label: "Disetujui", value: "DISETUJUI" },
    { label: "Ditolak", value: "DITOLAK" },
    { label: "Selesai", value: "SELESAI" },
  ];

  return (
    <DosenLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Riwayat Peminjaman Ruangan Saya
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Daftar pengajuan ruangan yang pernah Anda buat beserta status verifikasi dari Administrator.
          </p>
        </div>

        <Link
          href="/dosen/ajukan"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm shadow-emerald-600/30 self-start sm:self-auto"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Ajukan Peminjaman Baru</span>
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1 sm:gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1">
        {statusTabs.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-t-xl transition whitespace-nowrap border-b-2 -mb-1 ${
                isActive
                  ? "text-emerald-700 border-emerald-600 bg-emerald-50/50"
                  : "text-slate-500 hover:text-slate-800 border-transparent hover:border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari kode booking, ruangan, atau keperluan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Kode Booking</th>
                <th className="py-3.5 px-4">Ruangan</th>
                <th className="py-3.5 px-4">Waktu Peminjaman</th>
                <th className="py-3.5 px-4">Keperluan</th>
                <th className="py-3.5 px-4">Status Pengajuan</th>
                <th className="py-3.5 px-4">Catatan Admin</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Memuat riwayat peminjaman...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Belum ada pengajuan peminjaman pada kategori ini.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const start = new Date(b.startTime);
                  const end = new Date(b.endTime);

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-xs text-emerald-800">
                          {b.bookingCode}
                        </div>
                        {b.isDeleted && (
                          <span className="text-[10px] text-slate-400 block font-medium">
                            (Dibatalkan)
                          </span>
                        )}
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
                            weekday: "short",
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
                      <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate" title={b.adminNotes || "-"}>
                        {b.adminNotes || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {(b.status === "DISETUJUI" || b.status === "SELESAI") && (
                            <Link
                              href={`/cetak-surat/${b.id}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition"
                              title="Cetak Surat Izin Penggunaan Ruangan (PDF)"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Cetak Surat</span>
                            </Link>
                          )}

                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition"
                            title="Detail"
                          >
                            <Info className="w-4 h-4" />
                          </button>

                          {b.status === "MENUNGGU" && !b.isDeleted && (
                            <button
                              onClick={() => setCancelTarget(b)}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
                            >
                              Batalkan
                            </button>
                          )}
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

      {/* Modal Detail Info */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Detail Pengajuan Peminjaman
              </h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs mb-4">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Kode Booking:</span>
                <span className="font-bold text-emerald-800">{selectedBooking.bookingCode}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Ruangan:</span>
                <span className="font-semibold text-slate-800">{selectedBooking.room?.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Lokasi:</span>
                <span className="font-medium text-slate-700">{selectedBooking.room?.location}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Waktu:</span>
                <span className="font-medium text-slate-800">
                  {new Date(selectedBooking.startTime).toLocaleString("id-ID")} -{" "}
                  {new Date(selectedBooking.endTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="py-1.5 border-b border-slate-100">
                <span className="text-slate-500 block mb-1">Keperluan:</span>
                <p className="text-slate-800 font-medium bg-slate-50 p-2 rounded-lg">{selectedBooking.purpose}</p>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Status Terkini:</span>
                <StatusBadge status={selectedBooking.status} size="sm" />
              </div>
              {selectedBooking.adminNotes && (
                <div className="py-1.5">
                  <span className="text-slate-500 block mb-1">Catatan dari Admin:</span>
                  <p className="text-slate-800 italic bg-amber-50/70 border border-amber-200/60 p-2.5 rounded-lg">
                    {selectedBooking.adminNotes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {(selectedBooking.status === "DISETUJUI" || selectedBooking.status === "SELESAI") ? (
                <Link
                  href={`/cetak-surat/${selectedBooking.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/30 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Surat Izin (PDF)</span>
                </Link>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cancel Confirmation */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Batalkan Pengajuan Peminjaman
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Apakah Anda yakin ingin membatalkan pengajuan peminjaman untuk <strong>{cancelTarget.room?.name}</strong>? Data akan tetap tercatat dalam riwayat sebagai arsip.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                disabled={canceling}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={canceling}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition"
              >
                {canceling ? "Membatalkan..." : "Ya, Batalkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DosenLayout>
  );
}

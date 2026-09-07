"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import StatusBadge from "@/components/StatusBadge";
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  DoorOpen,
  Archive,
} from "lucide-react";

export default function AdminRiwayatPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("includeDeleted", "true");
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (searchQuery) params.set("q", searchQuery);

      const res = await fetch(`/api/bookings?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setBookings(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [statusFilter, searchQuery]);

  const exportToCSV = () => {
    if (bookings.length === 0) return;

    const headers = [
      "Kode Booking",
      "Nama Dosen",
      "Email Dosen",
      "Nama Ruangan",
      "Kode Ruang",
      "Tanggal Mulai",
      "Tanggal Selesai",
      "Keperluan",
      "Status",
      "Catatan Admin",
      "Diarsipkan",
    ];

    const rows = bookings.map((b) => [
      `"${b.bookingCode}"`,
      `"${b.user?.name || ""}"`,
      `"${b.user?.email || ""}"`,
      `"${b.room?.name || ""}"`,
      `"${b.room?.code || ""}"`,
      `"${new Date(b.startTime).toLocaleString("id-ID")}"`,
      `"${new Date(b.endTime).toLocaleString("id-ID")}"`,
      `"${(b.purpose || "").replace(/"/g, '""')}"`,
      `"${b.status}"`,
      `"${(b.adminNotes || "").replace(/"/g, '""')}"`,
      b.isDeleted ? "Ya" : "Tidak",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `riwayat_peminjaman_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Riwayat Lengkap Peminjaman
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Arsip permanen seluruh aktivitas peminjaman ruangan kampus untuk audit dan laporan.
          </p>
        </div>

        <button
          onClick={exportToCSV}
          disabled={bookings.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor Laporan (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari kode booking, nama pemohon, ruangan, atau kegiatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
        >
          <option value="ALL">Semua Status</option>
          <option value="MENUNGGU">Menunggu</option>
          <option value="DISETUJUI">Disetujui</option>
          <option value="DITOLAK">Ditolak</option>
          <option value="SELESAI">Selesai</option>
        </select>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Kode & Dibuat Pada</th>
                <th className="py-3.5 px-4">Dosen Pemohon</th>
                <th className="py-3.5 px-4">Ruangan</th>
                <th className="py-3.5 px-4">Waktu Peminjaman</th>
                <th className="py-3.5 px-4">Keperluan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Catatan / Alasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Memuat riwayat arsip peminjaman...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Belum ada data riwayat peminjaman.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const start = new Date(b.startTime);
                  const end = new Date(b.endTime);
                  const created = new Date(b.createdAt);

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-xs text-indigo-700 flex items-center gap-1.5">
                          {b.bookingCode}
                          {b.isDeleted && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">
                              <Archive className="w-3 h-3" /> Arsip
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {created.toLocaleDateString("id-ID", { dateStyle: "short" })}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-xs text-slate-900">
                          {b.user?.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {b.user?.email}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-xs text-slate-800">
                          {b.room?.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {b.room?.code}
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
                      <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate" title={b.adminNotes || "-"}>
                        {b.adminNotes || "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

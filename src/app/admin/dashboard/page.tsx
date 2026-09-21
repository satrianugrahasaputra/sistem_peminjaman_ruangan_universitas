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
  TrendingUp,
  BarChart3,
  PieChart,
  Building,
  Award,
  Sparkles,
  Layers,
  Activity,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [hoveredMonth, setHoveredMonth] = useState<any | null>(null);

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
        setAnalytics(data.analytics);
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

      {/* Analytics & Visualization Section */}
      <div className="space-y-6 mb-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Insight & Kinerja Sistem</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Analisis Pemanfaatan Sarana & Prasarana
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
              Visualisasi tren volume pengajuan, proporsi persetujuan ruangan, dan utilitas fasilitas kampus secara terintegrasi.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-300 uppercase block font-semibold">Tingkat Persetujuan</span>
              <span className="text-base font-bold text-emerald-400">
                {loading ? "..." : `${analytics?.kpi?.approvalRate ?? 95}%`}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-300 uppercase block font-semibold">Jam Terjadwal</span>
              <span className="text-base font-bold text-indigo-300">
                {loading ? "..." : `${analytics?.kpi?.totalDurationHours ?? 0} Jam`}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-300 uppercase block font-semibold">Ruangan Aktif</span>
              <span className="text-base font-bold text-amber-300">
                {loading ? "..." : `${analytics?.kpi?.roomUtilizationRate ?? 80}%`}
              </span>
            </div>
          </div>
        </div>

        {/* Charts 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 1: Monthly Trends Area Curve (7 Cols) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  Tren Pengajuan Ruang Bulanan
                </h3>
                <p className="text-[11px] text-slate-500">
                  Volume pengajuan dan persetujuan ruangan 6 bulan terakhir.
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Total
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Disetujui
                </span>
              </div>
            </div>

            {/* SVG Area Chart */}
            <div className="relative w-full h-52 flex flex-col justify-end">
              {loading ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Memuat grafik tren...
                </div>
              ) : (
                (() => {
                  const months = analytics?.monthlyTrends || [];
                  const maxVal = Math.max(...months.map((m: any) => m.total), 10);
                  const w = 500;
                  const h = 160;
                  const padX = 35;
                  const padY = 20;

                  // Coordinates
                  const points = months.map((m: any, i: number) => {
                    const x = padX + i * ((w - 2 * padX) / Math.max(1, months.length - 1));
                    const y = h - padY - (m.total / maxVal) * (h - 2 * padY);
                    return { ...m, x, y };
                  });

                  // Approved points
                  const appPoints = months.map((m: any, i: number) => {
                    const x = padX + i * ((w - 2 * padX) / Math.max(1, months.length - 1));
                    const y = h - padY - (m.approved / maxVal) * (h - 2 * padY);
                    return { x, y };
                  });

                  const linePath = points.length > 0
                    ? points.reduce((acc: string, p: any, idx: number) => `${acc} ${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`, "")
                    : "";

                  const areaPath = points.length > 0
                    ? `${linePath} L ${points[points.length - 1].x} ${h - padY} L ${points[0].x} ${h - padY} Z`
                    : "";

                  const appLinePath = appPoints.length > 0
                    ? appPoints.reduce((acc: string, p: any, idx: number) => `${acc} ${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`, "")
                    : "";

                  return (
                    <div className="w-full h-full relative">
                      <svg
                        viewBox={`0 0 ${w} ${h}`}
                        className="w-full h-full overflow-visible"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.28" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Horizontal Gridlines */}
                        {[0.25, 0.5, 0.75, 1].map((lvl) => {
                          const yPos = h - padY - lvl * (h - 2 * padY);
                          return (
                            <line
                              key={lvl}
                              x1={padX}
                              y1={yPos}
                              x2={w - padX}
                              y2={yPos}
                              stroke="#f1f5f9"
                              strokeDasharray="4 4"
                              strokeWidth="1"
                            />
                          );
                        })}

                        {/* Area Fill */}
                        <path d={areaPath} fill="url(#areaGradient)" />

                        {/* Total Line */}
                        <path
                          d={linePath}
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Approved Line */}
                        <path
                          d={appLinePath}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2"
                          strokeDasharray="4 3"
                          strokeLinecap="round"
                        />

                        {/* Interactive Data Points */}
                        {points.map((p: any, idx: number) => (
                          <g key={idx} className="cursor-pointer">
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r={hoveredMonth?.month === p.month ? "6" : "4"}
                              className="fill-white stroke-indigo-600 transition-all duration-150"
                              strokeWidth="2.5"
                              onMouseEnter={() => setHoveredMonth(p)}
                              onMouseLeave={() => setHoveredMonth(null)}
                            />
                          </g>
                        ))}
                      </svg>

                      {/* X-Axis Month Labels */}
                      <div className="flex justify-between px-6 mt-1 text-[11px] font-semibold text-slate-400">
                        {months.map((m: any, idx: number) => (
                          <span
                            key={idx}
                            className={hoveredMonth?.month === m.month ? "text-indigo-600 font-bold" : ""}
                          >
                            {m.month}
                          </span>
                        ))}
                      </div>

                      {/* Hover Tooltip Overlay */}
                      {hoveredMonth && (
                        <div
                          className="absolute -top-12 z-20 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs shadow-xl pointer-events-none transform -translate-x-1/2 transition-all animate-fade-in"
                          style={{
                            left: `${(points.find((p: any) => p.month === hoveredMonth.month)?.x / w) * 100}%`,
                          }}
                        >
                          <div className="font-bold text-[11px] text-indigo-300">
                            {hoveredMonth.month} {hoveredMonth.year}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] mt-0.5">
                            <span>Total: <strong className="text-white">{hoveredMonth.total}</strong></span>
                            <span>Disetujui: <strong className="text-emerald-400">{hoveredMonth.approved}</strong></span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          </div>

          {/* Chart 2: Status Distribution Donut (5 Cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-600" />
                Rasio Status Peminjaman
              </h3>
              <p className="text-[11px] text-slate-500">
                Komposisi pengajuan berdasarkan status akhir.
              </p>
            </div>

            {/* Donut Chart & Legend */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-auto pt-2">
              {/* SVG Donut */}
              <div className="relative w-36 h-36 flex-shrink-0">
                {(() => {
                  const items = analytics?.statusDistribution || [];
                  const totalAll = items.reduce((sum: number, it: any) => sum + it.count, 0) || 1;
                  const radius = 50;
                  const circumference = 2 * Math.PI * radius;
                  let accumulatedOffset = 0;

                  return (
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                      {/* Background track */}
                      <circle
                        cx="60"
                        cy="60"
                        r={radius}
                        fill="transparent"
                        stroke="#f1f5f9"
                        strokeWidth="16"
                      />

                      {/* Segments */}
                      {items.map((slice: any, idx: number) => {
                        const sliceLength = (slice.count / totalAll) * circumference;
                        const dashArray = `${sliceLength} ${circumference - sliceLength}`;
                        const dashOffset = -accumulatedOffset;
                        accumulatedOffset += sliceLength;

                        if (slice.count === 0) return null;

                        return (
                          <circle
                            key={idx}
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="transparent"
                            stroke={slice.color}
                            strokeWidth="16"
                            strokeDasharray={dashArray}
                            strokeDashoffset={dashOffset}
                            className="transition-all duration-500 hover:opacity-80"
                          />
                        );
                      })}
                    </svg>
                  );
                })()}

                {/* Donut Center Count */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-extrabold text-slate-900 leading-none">
                    {stats?.totalBookings ?? 0}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                    Pengajuan
                  </span>
                </div>
              </div>

              {/* Legend List */}
              <div className="flex-1 w-full space-y-2 text-xs">
                {(analytics?.statusDistribution || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-700 font-medium truncate text-xs">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="font-bold text-slate-900 text-xs">{item.count}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Popular Rooms Ranking (Horizontal Bar Progress) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                Ruangan Terpopuler & Paling Sering Digunakan
              </h3>
              <p className="text-[11px] text-slate-500">
                Peringkat frekuensi pemakaian ruang kuliah dan laboratorium kampus.
              </p>
            </div>
            <Link
              href="/admin/ruangan"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Kelola Ruangan <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {(analytics?.popularRooms || []).map((room: any, idx: number) => {
              const rankColors = [
                "bg-amber-400 text-amber-950 font-bold",
                "bg-slate-300 text-slate-800 font-bold",
                "bg-amber-700/70 text-white font-bold",
                "bg-slate-100 text-slate-600",
                "bg-slate-100 text-slate-600",
              ];

              return (
                <div key={room.id || idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${rankColors[idx] || "bg-slate-100"}`}>
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-800 truncate">{room.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                        {room.code}
                      </span>
                      <span className="text-[11px] text-slate-400 hidden sm:inline">
                        &bull; {room.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-bold text-indigo-700 text-xs">{room.count}x Dipinjam</span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(8, Math.min(100, (room.count / Math.max(1, analytics?.popularRooms?.[0]?.count || 1)) * 100))}%` }}
                    />
                  </div>
                </div>
              );
            })}
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

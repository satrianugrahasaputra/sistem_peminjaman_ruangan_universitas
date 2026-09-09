"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DosenLayout from "@/components/DosenLayout";
import { getRoomImage, parseFacilityTag } from "@/lib/room-helpers";
import {
  DoorOpen,
  Search,
  Users,
  MapPin,
  CalendarPlus,
  Sparkles,
  CheckCircle2,
  Tv,
  Wind,
  Volume2,
  Cpu,
  Layers,
  ArrowRight,
} from "lucide-react";

interface RoomItem {
  id: string;
  code: string;
  name: string;
  capacity: number;
  location: string;
  facilities: string;
  imageUrl?: string;
  isAvailable: boolean;
  bookings?: any[];
}

export default function DosenRuanganPage() {
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [minCapacity, setMinCapacity] = useState("");

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (locationFilter) params.set("location", locationFilter);
      if (minCapacity) params.set("minCapacity", minCapacity);

      const res = await fetch(`/api/rooms?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setRooms(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch rooms", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [searchQuery, locationFilter, minCapacity]);

  const renderFacilityIcon = (type: string) => {
    switch (type) {
      case "screen":
        return <Tv className="w-3.5 h-3.5 text-sky-600" />;
      case "ac":
        return <Wind className="w-3.5 h-3.5 text-emerald-600" />;
      case "audio":
        return <Volume2 className="w-3.5 h-3.5 text-purple-600" />;
      case "tech":
        return <Cpu className="w-3.5 h-3.5 text-indigo-600" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getFacilityBadgeClass = (type: string) => {
    switch (type) {
      case "screen":
        return "bg-sky-50/90 text-sky-900 border-sky-200";
      case "ac":
        return "bg-emerald-50/90 text-emerald-900 border-emerald-200";
      case "audio":
        return "bg-purple-50/90 text-purple-900 border-purple-200";
      case "tech":
        return "bg-indigo-50/90 text-indigo-900 border-indigo-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <DosenLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/70 text-emerald-800 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Fasilitas Kampus Lengkap & Terintegrasi
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Katalog & Direktori Ruangan
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Eksplorasi spesifikasi visual, daya tampung, dan fasilitas ruangan untuk perkuliahan maupun kegiatan akademik Anda.
          </p>
        </div>

        <Link
          href="/dosen/ajukan"
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-emerald-600/25 self-start sm:self-auto hover:-translate-y-0.5"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Form Pengajuan Peminjaman</span>
        </Link>
      </div>

      {/* Modern Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-3.5">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama ruang, kode (misal: LAB-KOMP-1, AULA), atau fasilitas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative w-full md:w-56">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter Gedung / Lantai..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>

          <div className="relative w-full md:w-48">
            <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={minCapacity}
              onChange={(e) => setMinCapacity(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            >
              <option value="">Semua Kapasitas</option>
              <option value="30">&ge; 30 Kursi</option>
              <option value="50">&ge; 50 Kursi</option>
              <option value="100">&ge; 100 Kursi</option>
              <option value="200">&ge; 200 Kursi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Visual Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Memuat katalog ruangan kampus...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <DoorOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-800 font-bold text-base">Tidak ada ruangan yang cocok</p>
          <p className="text-xs text-slate-500 mt-1">
            Silakan ubah kata kunci pencarian atau sesuaikan filter lokasi/kapasitas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-7">
          {rooms.map((room) => {
            const rawFacilities = room.facilities
              ? room.facilities.split(",").map((f) => f.trim()).filter(Boolean)
              : [];
            const roomImg = getRoomImage(room);

            return (
              <div
                key={room.id}
                className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Photo Banner with Badges Overlay */}
                  <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                    <img
                      src={roomImg}
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

                    {/* Top Overlay Badges */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-xl bg-slate-950/75 backdrop-blur-md text-white font-extrabold text-xs tracking-wider border border-white/20 shadow-md">
                        {room.code}
                      </span>

                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/90 backdrop-blur-md text-white font-bold text-xs shadow-md border border-emerald-400/30">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        Siap Digunakan
                      </span>
                    </div>

                    {/* Bottom of Banner Details */}
                    <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-end justify-between">
                      <div className="flex items-center gap-1.5 text-white text-xs font-semibold drop-shadow-sm">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{room.location}</span>
                      </div>

                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/95 text-slate-900 font-extrabold text-xs shadow-md">
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        {room.capacity} Kursi
                      </span>
                    </div>
                  </div>

                  {/* Room Content Details */}
                  <div className="p-5 pb-3">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-snug group-hover:text-emerald-700 transition">
                      {room.name}
                    </h2>

                    {/* Facilities Section with High Contrast Badges */}
                    <div className="mt-4 pt-3.5 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          Fasilitas Ruangan:
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {rawFacilities.length} fasilitas
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {rawFacilities.map((fac, idx) => {
                          const parsed = parseFacilityTag(fac);
                          return (
                            <span
                              key={idx}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${getFacilityBadgeClass(
                                parsed.type
                              )}`}
                            >
                              {renderFacilityIcon(parsed.type)}
                              <span>{parsed.label}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card CTA Footer */}
                <div className="p-5 pt-3 border-t border-slate-100 bg-slate-50/50">
                  <Link
                    href={`/dosen/ajukan?roomId=${room.id}`}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 group/btn"
                  >
                    <CalendarPlus className="w-4 h-4 text-emerald-200" />
                    <span>Pinjam Ruangan Ini</span>
                    <ArrowRight className="w-4 h-4 text-emerald-200 group-hover/btn:translate-x-1 transition" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DosenLayout>
  );
}

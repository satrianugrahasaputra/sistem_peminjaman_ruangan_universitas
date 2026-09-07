"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DosenLayout from "@/components/DosenLayout";
import {
  DoorOpen,
  Search,
  Users,
  MapPin,
  CalendarPlus,
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
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

  return (
    <DosenLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Katalog & Fasilitas Ruangan
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Pilih ruangan yang sesuai dengan kebutuhan perkuliahan, praktikum, seminar, atau rapat Anda.
          </p>
        </div>

        <Link
          href="/dosen/ajukan"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm shadow-emerald-600/30 self-start sm:self-auto"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Form Pengajuan Langsung</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama ruang, kode (contoh: RK-A101), atau fasilitas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <input
            type="text"
            placeholder="Filter Lokasi / Gedung..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full md:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />

          <select
            value={minCapacity}
            onChange={(e) => setMinCapacity(e.target.value)}
            className="w-full md:w-44 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          >
            <option value="">Semua Kapasitas</option>
            <option value="30">&ge; 30 Kursi</option>
            <option value="50">&ge; 50 Kursi</option>
            <option value="100">&ge; 100 Kursi</option>
          </select>
        </div>
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          Memuat data ruangan kampus...
        </div>
      ) : rooms.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
          <DoorOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-700 font-semibold">Tidak ada ruangan yang cocok</p>
          <p className="text-xs text-slate-400 mt-1">
            Coba ubah kata kunci pencarian atau filter kapasitas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const facilitiesList = room.facilities
              ? room.facilities.split(",").map((f) => f.trim())
              : [];

            return (
              <div
                key={room.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-200 transition flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold rounded-lg text-xs">
                        {room.code}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        {room.capacity} Kursi
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                      {room.name}
                    </h2>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{room.location}</span>
                    </div>
                  </div>

                  {/* Facilities list */}
                  <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Fasilitas Tersedia:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {facilitiesList.slice(0, 4).map((fac, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[11px] bg-white border border-slate-200 text-slate-600"
                        >
                          {fac}
                        </span>
                      ))}
                      {facilitiesList.length > 4 && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-500">
                          +{facilitiesList.length - 4} lainnya
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card CTA Footer */}
                <div className="p-5 pt-3 border-t border-slate-100">
                  <Link
                    href={`/dosen/ajukan?roomId=${room.id}`}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm shadow-emerald-600/20"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    <span>Pinjam Ruangan Ini</span>
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

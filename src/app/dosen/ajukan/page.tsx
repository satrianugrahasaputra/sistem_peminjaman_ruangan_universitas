"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DosenLayout from "@/components/DosenLayout";
import { getRoomImage, parseFacilityTag } from "@/lib/room-helpers";
import {
  CalendarPlus,
  DoorOpen,
  Calendar,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Users,
  MapPin,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Search,
  Check,
  ChevronRight,
  Tv,
  Wind,
  Volume2,
  Cpu,
  Layers,
  X,
} from "lucide-react";

interface RoomItem {
  id: string;
  code: string;
  name: string;
  capacity: number;
  location: string;
  facilities: string;
  imageUrl?: string;
  isAvailable?: boolean;
}

const SESSION_PRESETS = [
  { label: "Sesi Pagi 1", start: "08:00", end: "10:00", desc: "08:00 - 10:00 WIB" },
  { label: "Sesi Pagi 2", start: "10:15", end: "12:15", desc: "10:15 - 12:15 WIB" },
  { label: "Sesi Siang", start: "13:00", end: "15:00", desc: "13:00 - 15:00 WIB" },
  { label: "Sesi Sore", start: "15:30", end: "17:30", desc: "15:30 - 17:30 WIB" },
];

const PURPOSE_PRESETS = [
  "Kuliah Pengganti Mata Kuliah",
  "Praktikum Laboratorium Lanjut",
  "Seminar Riset & Diskusi Ilmiah",
  "Workshop & Pelatihan Mahasiswa",
  "Sidang Ujian Akademik",
];

function DosenAjukanForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRoomId = searchParams.get("roomId") || "";

  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState(initialRoomId);
  const [bookingDate, setBookingDate] = useState("");
  const [startTimeStr, setStartTimeStr] = useState("08:00");
  const [endTimeStr, setEndTimeStr] = useState("10:00");
  const [purpose, setPurpose] = useState("");

  // Room Picker Modal State
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [roomSearchQuery, setRoomSearchQuery] = useState("");

  // Conflict Checking State
  const [conflictResult, setConflictResult] = useState<{
    checked: boolean;
    hasConflict: boolean;
    message?: string;
  }>({ checked: false, hasConflict: false });
  const [checkingConflict, setCheckingConflict] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch available rooms
  useEffect(() => {
    fetch("/api/rooms")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRooms(data.data || []);
          if (!selectedRoomId && data.data?.length > 0) {
            setSelectedRoomId(data.data[0].id);
          }
        }
      })
      .catch((err) => console.error(err));

    // Default booking date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateFormatted = tomorrow.toISOString().slice(0, 10);
    setBookingDate(dateFormatted);
  }, []);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  // Quick Date Presets
  const setQuickDate = (daysFromToday: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    setBookingDate(d.toISOString().slice(0, 10));
  };

  // Calculate Duration
  const calculateDuration = () => {
    if (!startTimeStr || !endTimeStr) return null;
    const [startH, startM] = startTimeStr.split(":").map(Number);
    const [endH, endM] = endTimeStr.split(":").map(Number);
    const totalMinutes = endH * 60 + endM - (startH * 60 + startM);
    if (totalMinutes <= 0) return "Waktu tidak valid";
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (mins === 0) return `${hours} Jam`;
    if (hours === 0) return `${mins} Menit`;
    return `${hours} Jam ${mins} Menit`;
  };

  // Real-time conflict checking
  useEffect(() => {
    if (!selectedRoomId || !bookingDate || !startTimeStr || !endTimeStr) {
      setConflictResult({ checked: false, hasConflict: false });
      return;
    }

    const start = new Date(`${bookingDate}T${startTimeStr}:00`);
    const end = new Date(`${bookingDate}T${endTimeStr}:00`);

    if (start >= end) {
      setConflictResult({
        checked: true,
        hasConflict: true,
        message: "Waktu mulai harus lebih awal dari waktu selesai peminjaman.",
      });
      return;
    }

    setCheckingConflict(true);
    const timeoutId = setTimeout(() => {
      fetch("/api/bookings/check-conflict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: selectedRoomId,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setConflictResult({
            checked: true,
            hasConflict: Boolean(data.hasConflict),
            message: data.message,
          });
        })
        .catch(() => {})
        .finally(() => setCheckingConflict(false));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [selectedRoomId, bookingDate, startTimeStr, endTimeStr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (conflictResult.hasConflict) {
      setFormError(conflictResult.message || "Terdapat bentrok jadwal pada waktu yang dipilih.");
      return;
    }

    const start = new Date(`${bookingDate}T${startTimeStr}:00`);
    const end = new Date(`${bookingDate}T${endTimeStr}:00`);

    if (start >= end) {
      setFormError("Waktu selesai peminjaman harus lebih besar dari waktu mulai.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: selectedRoomId,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          purpose: purpose.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || "Gagal mengajukan peminjaman.");
        setSubmitting(false);
        return;
      }

      setSuccessMessage("Pengajuan peminjaman berhasil dikirim! Mengalihkan ke riwayat...");
      setTimeout(() => {
        router.push("/dosen/riwayat");
      }, 1500);
    } catch (err: any) {
      setFormError("Terjadi kesalahan koneksi jaringan.");
      setSubmitting(false);
    }
  };

  // Filtered rooms in modal
  const modalFilteredRooms = rooms.filter((r) => {
    const q = roomSearchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.code.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q) ||
      r.facilities.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Page Header */}
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/70 text-emerald-800 mb-2">
          <CalendarPlus className="w-3.5 h-3.5" />
          Formulir Reservasi Sarpras Dosen
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Pengajuan Peminjaman Ruang
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Pilih ruangan, tentukan jadwal kegiatan akademik, dan verifikasi ketersediaan secara langsung.
        </p>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-bold">{successMessage}</span>
        </div>
      )}

      {/* Form Error Alert */}
      {formError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Pengajuan Tidak Dapat Diproses</p>
            <p className="text-xs text-rose-700 mt-0.5">{formError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ================= SECTION 1: PILIH RUANGAN KAMPUS ================= */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 hover:border-emerald-200 transition">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <DoorOpen className="w-4 h-4 text-emerald-600" />
                Langkah 1
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Pilih Ruangan Kampus
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setRoomModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-xl text-xs sm:text-sm transition self-start sm:self-auto shadow-sm"
            >
              <Search className="w-4 h-4 text-emerald-600" />
              <span>Ganti / Pilih dari Katalog ({rooms.length} Ruangan)</span>
            </button>
          </div>

          {/* Active Room Selected Preview Card */}
          {selectedRoom ? (
            <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/40 via-white to-slate-50 p-4 sm:p-5 overflow-hidden shadow-sm">
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                {/* Photo Thumbnail */}
                <div className="relative w-full sm:w-48 h-32 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0 shadow-md">
                  <img
                    src={getRoomImage(selectedRoom)}
                    alt={selectedRoom.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm text-white font-extrabold text-[11px] border border-white/20">
                    {selectedRoom.code}
                  </div>
                </div>

                {/* Info and Badges */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      Ruangan Terpilih
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-slate-900 text-white shadow-sm">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      {selectedRoom.capacity} Kursi
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
                    {selectedRoom.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold mt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{selectedRoom.location}</span>
                  </div>

                  {/* Facilities list tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {selectedRoom.facilities
                      .split(",")
                      .map((f) => f.trim())
                      .filter(Boolean)
                      .map((fac, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs"
                        >
                          {fac}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-sm">
              Memuat data ruangan...
            </div>
          )}

          {/* Quick Rooms Scroll Pills */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Pilihan Cepat Ruangan:
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {rooms.slice(0, 6).map((r) => {
                const isSelected = r.id === selectedRoomId;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRoomId(r.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                    }`}
                  >
                    {r.code} - {r.name.split(" ")[0]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= SECTION 2: KALENDER & JAM PEMINJAMAN ================= */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 hover:border-emerald-200 transition">
          <div className="mb-5">
            <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Langkah 2
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Jadwal Tanggal & Waktu Peminjaman
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih tanggal kegiatan dan gunakan tombol sesi cepat atau atur jam mulai & selesai secara presisi.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Tanggal Peminjaman Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 to-slate-100/60 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Tanggal Kegiatan *
                </label>
              </div>

              {/* Quick Date Shortcuts */}
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                <button
                  type="button"
                  onClick={() => setQuickDate(0)}
                  className="py-1 px-2 text-[11px] font-bold rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 transition"
                >
                  Hari Ini
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(1)}
                  className="py-1 px-2 text-[11px] font-bold rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 transition"
                >
                  Besok
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(2)}
                  className="py-1 px-2 text-[11px] font-bold rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 transition"
                >
                  Lusa
                </button>
              </div>

              {/* Styled Date Input */}
              <input
                id="input-booking-date"
                type="date"
                required
                value={bookingDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition shadow-2xs"
              />

              {/* Formatted Date Display Badge */}
              {bookingDate && (
                <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                    Hari & Tanggal Terpilih:
                  </span>
                  <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">
                    {new Date(bookingDate + "T00:00:00").toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Right: Sesi Perkuliahan & Jam Mulai-Selesai */}
            <div className="lg:col-span-7 space-y-4">
              {/* Sesi Perkuliahan Cepat */}
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    Pilihan Sesi Perkuliahan:
                  </span>
                  {calculateDuration() && (
                    <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ⏱️ {calculateDuration()}
                    </span>
                  )}
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {SESSION_PRESETS.map((sesi) => {
                    const isSelected = startTimeStr === sesi.start && endTimeStr === sesi.end;
                    return (
                      <button
                        key={sesi.label}
                        type="button"
                        onClick={() => {
                          setStartTimeStr(sesi.start);
                          setEndTimeStr(sesi.end);
                        }}
                        className={`p-2.5 rounded-xl text-left border transition ${
                          isSelected
                            ? "bg-emerald-50 border-emerald-500 text-emerald-950 shadow-sm ring-1 ring-emerald-500"
                            : "bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-800"
                        }`}
                      >
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span>{sesi.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {sesi.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Time Pickers */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="block text-[11px] font-bold text-slate-600 mb-1">
                    Jam Mulai
                  </span>
                  <div className="relative">
                    <input
                      id="input-start-time"
                      type="time"
                      required
                      value={startTimeStr}
                      onChange={(e) => setStartTimeStr(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="block text-[11px] font-bold text-slate-600 mb-1">
                    Jam Selesai
                  </span>
                  <div className="relative">
                    <input
                      id="input-end-time"
                      type="time"
                      required
                      value={endTimeStr}
                      onChange={(e) => setEndTimeStr(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Conflict Detector Banner (Sangat Jelas & Estetik) */}
          <div className="mt-5">
            {checkingConflict ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <span className="font-semibold">
                  Memeriksa bentrok jadwal ruangan dengan database secara real-time...
                </span>
              </div>
            ) : conflictResult.checked ? (
              conflictResult.hasConflict ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs shadow-sm flex items-start gap-3.5 animate-shake">
                  <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-extrabold text-rose-800 text-sm block">
                      ⚠️ Jadwal Bentrok Terdeteksi!
                    </span>
                    <p className="mt-1 text-xs text-rose-700 font-medium leading-relaxed">
                      {conflictResult.message}
                    </p>
                    <p className="text-[11px] text-rose-600 mt-2 font-semibold bg-white/80 p-2 rounded-lg border border-rose-200 inline-block">
                      💡 Saran: Silakan geser jam kegiatan ke sesi lain atau pilih ruangan lain yang tersedia.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs shadow-sm flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-emerald-900 text-xs block">
                      Jadwal Tersedia & Bebas Digunakan!
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      Ruangan bebas dari jadwal peminjaman lain pada rentang waktu ini.
                    </span>
                  </div>
                </div>
              )
            ) : null}
          </div>
        </div>

        {/* ================= SECTION 3: KEPERLUAN PEMINJAMAN ================= */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 hover:border-emerald-200 transition">
          <div className="mb-4">
            <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <FileText className="w-4 h-4 text-emerald-600" />
              Langkah 3
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Tujuan & Keperluan Peminjaman *
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Jelaskan mata kuliah, judul kegiatan, atau agenda akademik yang akan dilaksanakan.
            </p>
          </div>

          {/* Quick Purpose Tag Suggestions */}
          <div className="mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Contoh Keperluan Cepat:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PURPOSE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setPurpose((prev) => (prev ? `${prev} - ${preset}` : preset))}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          <textarea
            id="input-purpose"
            rows={3}
            required
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="Contoh: Kuliah Pengganti Mata Kuliah Kecerdasan Buatan Kelas 4A (disertai materi praktikum komputasi grafis)."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
          />
        </div>

        {/* Submit Actions */}
        <div className="pt-2 flex items-center justify-end gap-3.5">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-2xl transition"
          >
            Kembali
          </button>
          <button
            id="btn-submit-booking"
            type="submit"
            disabled={submitting || (conflictResult.checked && conflictResult.hasConflict)}
            className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-white font-extrabold rounded-2xl text-sm transition shadow-lg shadow-emerald-600/30 flex items-center gap-2 hover:-translate-y-0.5"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Mengirimkan Pengajuan...</span>
              </>
            ) : (
              <>
                <span>Kirim Pengajuan Peminjaman</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* ================= MODAL SELEKSI RUANGAN (INTERAKTIF & ESTETIK) ================= */}
      {roomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Pilih Ruangan Kampus
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilih ruangan yang sesuai dengan kapasitas dan fasilitas yang Anda butuhkan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRoomModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Input */}
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Ketik nama ruang, kode (misal: LAB-KOMP-1, AULA), gedung, atau fasilitas..."
                  value={roomSearchQuery}
                  onChange={(e) => setRoomSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  autoFocus
                />
              </div>
            </div>

            {/* Modal Rooms List */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
              {modalFilteredRooms.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  Tidak ditemukan ruangan dengan kata kunci tersebut.
                </div>
              ) : (
                modalFilteredRooms.map((room) => {
                  const isSelected = room.id === selectedRoomId;
                  const roomImg = getRoomImage(room);

                  return (
                    <div
                      key={room.id}
                      onClick={() => {
                        setSelectedRoomId(room.id);
                        setRoomModalOpen(false);
                      }}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
                        isSelected
                          ? "bg-emerald-50/70 border-emerald-500 shadow-md ring-1 ring-emerald-500"
                          : "bg-white hover:bg-slate-50 border-slate-200 hover:border-emerald-300"
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-full sm:w-28 h-20 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0 shadow-sm">
                        <img
                          src={roomImg}
                          alt={room.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-slate-950/80 text-[10px] font-bold text-white">
                          {room.code}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900 truncate">
                            {room.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded-lg text-xs font-extrabold bg-slate-900 text-white flex-shrink-0">
                            {room.capacity} Kursi
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>{room.location}</span>
                        </div>

                        <p className="text-[11px] text-slate-500 mt-1 truncate">
                          {room.facilities}
                        </p>
                      </div>

                      {/* Selection Indicator */}
                      <div className="self-end sm:self-center">
                        <span
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition ${
                            isSelected
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-emerald-600 hover:text-white"
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Terpilih
                            </>
                          ) : (
                            "Pilih Ruangan"
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setRoomModalOpen(false)}
                className="px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DosenAjukanPage() {
  return (
    <DosenLayout>
      <Suspense fallback={<div className="p-8 text-center text-slate-400">Memuat formulir...</div>}>
        <DosenAjukanForm />
      </Suspense>
    </DosenLayout>
  );
}

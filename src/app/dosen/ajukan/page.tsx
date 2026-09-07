"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DosenLayout from "@/components/DosenLayout";
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
} from "lucide-react";

interface RoomItem {
  id: string;
  code: string;
  name: string;
  capacity: number;
  location: string;
  facilities: string;
}

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

  // Real-time conflict checking when parameters change
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
        message: "Waktu mulai harus lebih awal dari waktu selesai.",
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

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Formulir Pengajuan Peminjaman Ruangan
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Lengkapi data peminjaman di bawah ini. Sistem memvalidasi jadwal bentrok secara otomatis.
        </p>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Form Error Alert */}
      {formError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Pengajuan Ditolak</p>
            <p className="text-xs text-rose-700 mt-0.5">{formError}</p>
          </div>
        </div>
      )}

      {/* Booking Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Pilih Ruangan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Pilih Ruangan Kampus *
            </label>
            <select
              id="select-room"
              required
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code} - {r.name} (Kapasitas: {r.capacity} orang, {r.location})
                </option>
              ))}
            </select>

            {/* Selected Room Specs Preview */}
            {selectedRoom && (
              <div className="mt-3 p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-emerald-950">{selectedRoom.name}</span>
                  <span className="text-slate-500 block text-[11px] mt-0.5">
                    {selectedRoom.facilities}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="px-2.5 py-1 bg-white rounded-lg border border-emerald-200 font-semibold text-emerald-800 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {selectedRoom.capacity} Kursi
                  </span>
                  <span className="px-2.5 py-1 bg-white rounded-lg border border-emerald-200 font-semibold text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {selectedRoom.location}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Tanggal & Waktu */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              2. Jadwal Peminjaman *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="block text-[11px] text-slate-500 mb-1">Tanggal Kegiatan</span>
                <input
                  id="input-booking-date"
                  type="date"
                  required
                  value={bookingDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <span className="block text-[11px] text-slate-500 mb-1">Jam Mulai</span>
                <input
                  id="input-start-time"
                  type="time"
                  required
                  value={startTimeStr}
                  onChange={(e) => setStartTimeStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <span className="block text-[11px] text-slate-500 mb-1">Jam Selesai</span>
                <input
                  id="input-end-time"
                  type="time"
                  required
                  value={endTimeStr}
                  onChange={(e) => setEndTimeStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Real-time Conflict Detector Banner */}
            <div className="mt-3">
              {checkingConflict ? (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  <span>Memeriksa ketersediaan jadwal ruangan secara real-time...</span>
                </div>
              ) : conflictResult.checked ? (
                conflictResult.hasConflict ? (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-rose-800 block">Jadwal Bentrok Terdeteksi!</span>
                      <p className="mt-0.5 text-rose-700">{conflictResult.message}</p>
                      <p className="text-[11px] text-rose-500 mt-1">
                        Silakan pilih jam yang berbeda atau gunakan ruangan lain.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="font-semibold">
                      Jadwal Tersedia! Ruangan bebas dan belum dipinjam pada rentang waktu ini.
                    </span>
                  </div>
                )
              ) : null}
            </div>
          </div>

          {/* 3. Keperluan / Tujuan Peminjaman */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              3. Keperluan / Tujuan Peminjaman *
            </label>
            <textarea
              id="input-purpose"
              rows={3}
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Contoh: Kuliah Pengganti Mata Kuliah Kecerdasan Buatan Kelas 4A (disertai materi praktikum komputasi grafis)."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Batal
            </button>
            <button
              id="btn-submit-booking"
              type="submit"
              disabled={submitting || (conflictResult.checked && conflictResult.hasConflict)}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-md shadow-emerald-600/30 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Mengirimkan...</span>
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
      </div>
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

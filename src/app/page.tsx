"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  DoorOpen,
  ArrowRight,
  CheckCircle2,
  Search,
  Sparkles,
  Printer,
  Users,
  Layers,
  MapPin,
  Laptop,
  GraduationCap,
  ExternalLink,
  Phone,
  Mail,
  ChevronRight,
  RefreshCw,
  Menu,
  X,
} from "lucide-react";

interface RoomItem {
  id: string;
  code: string;
  name: string;
  capacity: number;
  location: string;
  facilities: string;
  isAvailable: boolean;
}

export default function PublicLandingPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});

    // Fetch rooms for public explorer
    fetch("/api/rooms")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setRooms(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingRooms(false));
  }, []);

  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.facilities.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (categoryFilter === "LAB") {
      return r.name.toLowerCase().includes("lab");
    } else if (categoryFilter === "KULIAH") {
      return r.name.toLowerCase().includes("kuliah") || r.code.startsWith("RK");
    } else if (categoryFilter === "AULA") {
      return (
        r.name.toLowerCase().includes("aula") ||
        r.name.toLowerCase().includes("sidang") ||
        r.name.toLowerCase().includes("seminar") ||
        r.name.toLowerCase().includes("studio")
      );
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. PUBLIC TOPBAR NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Column 1: Brand & Logo (anchored to left) */}
          <div className="flex-1 flex items-center justify-start">
            <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 group-hover:bg-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-600/25 transition-all duration-300 group-hover:scale-105">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="font-extrabold text-slate-900 tracking-tight leading-none text-base sm:text-lg">
                  SARPRAS KAMPUS
                </div>
                <span className="text-[11px] font-semibold text-indigo-600 tracking-wide mt-1">
                  Universitas Terpadu
                </span>
              </div>
            </Link>
          </div>

          {/* Column 2: Centered Modern Pill Navigation (strictly centered in the container) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/70 shadow-2xs">
            <a
              href="#katalog"
              className="px-4 py-2 text-xs lg:text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white rounded-full transition-all duration-200"
            >
              Katalog Ruangan
            </a>
            <a
              href="#alur"
              className="px-4 py-2 text-xs lg:text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white rounded-full transition-all duration-200"
            >
              Alur Peminjaman
            </a>
            <a
              href="#keunggulan"
              className="px-4 py-2 text-xs lg:text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white rounded-full transition-all duration-200"
            >
              Fitur Unggulan
            </a>
            <a
              href="#kontak"
              className="px-4 py-2 text-xs lg:text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white rounded-full transition-all duration-200"
            >
              Kontak
            </a>
          </nav>

          {/* Column 3: Action Button & Mobile Menu (anchored to right) */}
          <div className="flex-1 flex items-center justify-end gap-3">
            {currentUser ? (
              <Link
                href={currentUser.role === "ADMIN" ? "/admin/dashboard" : "/dosen/dashboard"}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition-all duration-200 cursor-pointer hover:shadow-indigo-600/35 hover:-translate-y-0.5"
              >
                <span>Buka Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition-all duration-200 cursor-pointer hover:shadow-indigo-600/35 hover:-translate-y-0.5"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Masuk ke Sistem</span>
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-hidden"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu for smaller screens */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-4 py-4 space-y-1.5 shadow-lg animate-fade-in">
            <a
              href="#katalog"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition"
            >
              Katalog Ruangan
            </a>
            <a
              href="#alur"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition"
            >
              Alur Peminjaman
            </a>
            <a
              href="#keunggulan"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition"
            >
              Fitur Unggulan
            </a>
            <a
              href="#kontak"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition"
            >
              Kontak
            </a>
          </div>
        )}
      </header>

      {/* 2. HERO BANNER SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/80 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-400/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[250px] bg-emerald-400/10 blur-[90px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold mb-6 shadow-xs animate-fade-in">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Sistem Manajemen Ruang Kampus Terpadu & Terintegrasi</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight lg:leading-tight">
            Peminjaman Ruang Kuliah & Lab Kampus Jadi Lebih{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              Cepat, Transparan, & Bebas Bentrok
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Platform modern civitas akademika untuk reservasi ruang kuliah teori, seminar pascasarjana, dan laboratorium komputer berfasilitas lengkap dengan validasi jadwal otomatis dan surat izin resmi QR Code.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <a
              href="#katalog"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transition cursor-pointer"
            >
              <DoorOpen className="w-4 h-4" />
              <span>Jelajahi Katalog Ruangan</span>
            </a>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-sm shadow-xs transition"
            >
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Masuk Portal Dosen / Admin</span>
            </Link>
          </div>

          {/* Floating Key Counters */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <span className="text-2xl sm:text-3xl font-black text-indigo-600 block">10+</span>
              <span className="text-xs font-semibold text-slate-600 mt-1 block">Ruang Kuliah & Lab</span>
            </div>

            <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 block">100%</span>
              <span className="text-xs font-semibold text-slate-600 mt-1 block">Pencegahan Bentrok</span>
            </div>

            <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <span className="text-2xl sm:text-3xl font-black text-indigo-600 block">QR Code</span>
              <span className="text-xs font-semibold text-slate-600 mt-1 block">Verifikasi Surat Izin</span>
            </div>

            <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <span className="text-2xl sm:text-3xl font-black text-amber-500 block">24/7</span>
              <span className="text-xs font-semibold text-slate-600 mt-1 block">Pengajuan Online</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PUBLIC ROOM EXPLORER (#katalog) */}
      <section id="katalog" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
            Katalog Fasilitas Kampus
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Eksplorasi Ruangan Tersedia
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Lihat kapasitas daya tampung, lokasi gedung, serta kelengkapan fasilitas masing-masing ruangan sebelum melakukan pengajuan peminjaman.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {[
              { label: "Semua Kategori", val: "ALL" },
              { label: "Ruang Kuliah", val: "KULIAH" },
              { label: "Laboratorium Komputer", val: "LAB" },
              { label: "Aula & Sidang", val: "AULA" },
            ].map((cat) => (
              <button
                key={cat.val}
                onClick={() => setCategoryFilter(cat.val)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  categoryFilter === cat.val
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama ruang, gedung, atau fasilitas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Room Cards Grid */}
        {loadingRooms ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-3" />
            <p className="text-slate-500 text-sm font-medium">Memuat katalog ruangan kampus...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
            <DoorOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-700 font-bold text-base">Ruangan Tidak Ditemukan</p>
            <p className="text-slate-400 text-xs mt-1">Coba gunakan kata kunci pencarian atau kategori lain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => {
              const facilitiesList = room.facilities ? room.facilities.split(",").map((f) => f.trim()) : [];

              return (
                <div
                  key={room.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-6">
                    {/* Top Row: Code Badge & Capacity */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                        {room.code}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        {room.capacity} Kursi
                      </span>
                    </div>

                    {/* Name & Location */}
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">
                      {room.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{room.location}</span>
                    </p>

                    {/* Facilities Chips */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                        Fasilitas Ruangan:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {facilitiesList.slice(0, 4).map((fac, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200/80"
                          >
                            {fac}
                          </span>
                        ))}
                        {facilitiesList.length > 4 && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-200">
                            +{facilitiesList.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="p-4 px-6 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Tersedia
                    </span>

                    <Link
                      href={currentUser ? "/dosen/ajukan" : "/login?redirect=/dosen/ajukan"}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
                    >
                      <span>Ajukan Ruang</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. ALUR PEMINJAMAN 3 LANGKAH (#alur) */}
      <section id="alur" className="py-16 sm:py-24 bg-gradient-to-b from-slate-900 to-indigo-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-800/40 px-3 py-1 rounded-full border border-indigo-700/60">
              Alur Pengajuan Praktis
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-3">
              3 Langkah Mudah Peminjaman Ruangan
            </h2>
            <p className="text-slate-300 text-sm mt-2">
              Proses digital terstandarisasi untuk mempermudah kegiatan akademik perkuliahan dan seminar kampus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 relative hover:border-indigo-400/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-lg shadow-lg shadow-indigo-600/40 mb-6">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Pilih Ruang & Cek Jadwal</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pilih ruangan sesuai kapasitas peserta dan spesifikasi fasilitas pendukung. Sistem secara pintar menampilkan visual ketersediaan ruangan.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 relative hover:border-emerald-400/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-lg shadow-lg shadow-emerald-600/40 mb-6">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Validasi Bebas Bentrok</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tentukan tanggal dan rentang jam acara. Algoritma otomatis memastikan jadwal Anda tidak tumpang tindih dengan jadwal peminjam lain.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 relative hover:border-indigo-400/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-extrabold text-lg shadow-lg shadow-indigo-500/40 mb-6">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Persetujuan & Surat Izin QR</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Setelah disetujui Administrator, Anda dapat langsung mengunduh dan mencetak Surat Izin Resmi ber-QR Code digital yang sah.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FITUR UNGGULAN (#keunggulan) */}
      <section id="keunggulan" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
            Fitur Unggulan Sistem
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Standar Mutu Pelayanan Sarana Prasarana
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Dibangun dengan teknologi modern dan arsitektur enterprise demi keandalan operasional kampus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-indigo-300 transition">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1.5">Zero Conflict Scheduler</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mencegah bentrok ruang secara real-time saat pengisian formulir dan verifikasi ganda saat persetujuan admin.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-indigo-300 transition">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Printer className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1.5">Surat Izin PDF A4</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cetak dokumen izin resmi kampus berstandar tata naskah dinas universitas lengkap dengan stempel digital dan QR Code.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-indigo-300 transition">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1.5">Sinkronisasi WebService</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Penarikan data inventaris ruang dari API pusat dengan mekanisme fault-tolerant fallback terjamin.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-indigo-300 transition">
            <div className="w-11 h-11 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1.5">Audit Trail Permanen</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Seluruh riwayat pengajuan tidak pernah dihapus permanen (soft-delete) dan dapat diekspor langsung ke format CSV.
            </p>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 rounded-3xl p-8 sm:p-14 text-white text-center relative overflow-hidden shadow-xl">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Siap Mengoptimalkan Pemanfaatan Ruangan Kampus?
          </h2>
          <p className="mt-3 text-indigo-200 text-xs sm:text-base max-w-xl mx-auto">
            Gunakan kredensial akun dosen atau administrator Anda untuk mulai mengelola jadwal kegiatan dan peminjaman ruang perkuliahan.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-2xl bg-white text-indigo-700 font-bold text-sm shadow-lg hover:bg-indigo-50 transition cursor-pointer"
            >
              Masuk ke Portal Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FOOTER RESMI (#kontak) */}
      <footer id="kontak" className="bg-white border-t border-slate-200 py-12 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm mb-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Building2 className="w-4 h-4" />
              </div>
              <span>UNIVERSITAS INDONESIA TERPADU</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Biro Pengelolaan Sarana dan Prasarana Kampus. Gedung Rektorat Lt. 2, Jl. Kampus Terpadu No. 1, Kota Akademik 14045.
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-900 text-sm block mb-2">Kontak Bantuan Sarpras</span>
            <p className="flex items-center gap-2 text-slate-500 mb-1">
              <Phone className="w-3.5 h-3.5 text-indigo-600" />
              <span>(021) 7890123 / Ext. 402</span>
            </p>
            <p className="flex items-center gap-2 text-slate-500">
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
              <span>sarpras@kampus.ac.id</span>
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-900 text-sm block mb-2">Jam Layanan Operasional</span>
            <p className="text-slate-500 leading-relaxed">
              Senin - Jumat: 08.00 - 16.00 WIB
              <br />
              Pelayanan perizinan dan kunci ruang dikoordinasikan bersama teknisi gedung.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-[11px]">
          <p>&copy; {new Date().getFullYear()} Sistem Peminjaman Ruang Universitas. Hak Cipta Dilindungi.</p>
          <p>Production Showcase Portfolio Ready.</p>
        </div>
      </footer>
    </div>
  );
}

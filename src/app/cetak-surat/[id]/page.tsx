"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ArrowLeft, ShieldCheck, CheckCircle2, Building2, AlertTriangle } from "lucide-react";
import QRCode from "qrcode";

interface BookingDetail {
  id: string;
  bookingCode: string;
  purpose: string;
  startTime: string;
  endTime: string;
  status: "MENUNGGU" | "DISETUJUI" | "DITOLAK" | "SELESAI";
  adminNotes?: string;
  createdAt: string;
  approvedAt?: string;
  user: {
    name: string;
    email: string;
    nidn?: string | null;
    phone?: string | null;
  };
  room: {
    code: string;
    name: string;
    location: string;
    capacity: number;
    facilities: string;
  };
}

export default function CetakSuratPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const bookingId = params?.id as string;

  useEffect(() => {
    if (!bookingId) return;

    fetch(`/api/bookings/${bookingId}`)
      .then((res) => res.json())
      .then(async (resData) => {
        if (resData.success && resData.data) {
          const data = resData.data as BookingDetail;
          setBooking(data);

          // Generate authentic verification QR code
          const verifyUrl = `${window.location.origin}/cetak-surat/${data.id}?code=${data.bookingCode}`;
          try {
            const qrData = await QRCode.toDataURL(verifyUrl, {
              width: 130,
              margin: 1,
              color: {
                dark: "#0f172a",
                light: "#ffffff",
              },
            });
            setQrCodeUrl(qrData);
          } catch (qrErr) {
            console.error("QR Code Error:", qrErr);
          }
        } else {
          setError(resData.error || "Data surat izin peminjaman tidak ditemukan.");
        }
      })
      .catch(() => {
        setError("Gagal memuat data surat izin peminjaman.");
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-medium text-sm">Menyiapkan Lembar Surat Izin...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-200">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800">Tidak Dapat Mencetak Surat</h2>
          <p className="text-sm text-slate-500 mt-2 mb-6">{error || "Data tidak ditemukan."}</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // Format dates
  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);
  const approvedDate = booking.approvedAt ? new Date(booking.approvedAt) : new Date(booking.createdAt);

  const formattedDate = startDate.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = `${startDate.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })} - ${endDate.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })} WIB`;

  const approvedDateStr = approvedDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Calculate duration in hours
  const durationHours = Math.max(
    1,
    Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60))
  );

  // Dynamic Official Letter Number
  const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  const romanMonth = romanMonths[startDate.getMonth()] || "IX";
  const letterYear = startDate.getFullYear();
  const letterNumber = `048/UNIV/SARPRAS-IZIN/${romanMonth}/${letterYear}/${booking.bookingCode}`;

  return (
    <div className="min-h-screen bg-slate-200/80 py-6 sm:py-10 px-2 sm:px-4 text-slate-900 print:bg-white print:p-0 print:m-0">
      {/* Top Floating Action Bar (Hidden on Print) */}
      <div className="max-w-[210mm] mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-slate-300 print:hidden">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Dokumen Resmi Terverifikasi
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Unduh PDF</span>
          </button>
        </div>
      </div>

      {/* Official A4 Document Sheet */}
      <div
        id="surat-izin-container"
        className="w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white p-8 sm:p-14 shadow-2xl rounded-sm text-slate-900 relative font-serif text-[13px] leading-relaxed print:shadow-none print:p-0 print:w-full print:max-w-none print:min-h-0 print:rounded-none"
        style={{
          boxSizing: "border-box",
        }}
      >
        {/* KOP SURAT RESMI UNIVERSITAS */}
        <div className="border-b-4 border-double border-slate-900 pb-3 mb-6">
          <div className="flex items-center justify-between gap-4">
            {/* Logo Emblem Kampus */}
            <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center rounded-2xl bg-indigo-900 text-white shadow-md print:border print:border-slate-800">
              <Building2 className="w-11 h-11" />
            </div>

            {/* Header Text */}
            <div className="flex-1 text-center font-sans">
              <p className="text-[11px] uppercase tracking-widest font-semibold text-slate-700 leading-tight">
                Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi
              </p>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight uppercase leading-tight mt-0.5">
                UNIVERSITAS INDONESIA TERPADU
              </h1>
              <h2 className="text-xs sm:text-sm font-bold text-indigo-950 uppercase tracking-wide leading-snug">
                Biro Pengelolaan Sarana dan Prasarana Kampus
              </h2>
              <p className="text-[10px] text-slate-600 font-normal leading-tight mt-1 font-sans">
                Gedung Rektorat Lt. 2, Jl. Kampus Terpadu No. 1, Kota Akademik 14045
                <br />
                Telepon: (021) 7890123 &bull; Laman: www.kampus.ac.id &bull; Surel: sarpras@kampus.ac.id
              </p>
            </div>

            {/* Badge Akreditasi / Cap Kecil */}
            <div className="w-20 hidden sm:flex flex-col items-center justify-center p-1.5 border border-slate-300 rounded-xl bg-slate-50 text-[9px] font-sans text-center font-bold text-slate-700 print:flex">
              <span>TERAKREDITASI</span>
              <span className="text-indigo-700 text-xs font-black">UNGGUL</span>
              <span className="text-[8px] font-normal text-slate-500">BAN-PT</span>
            </div>
          </div>
        </div>

        {/* NOMOR SURAT & PERIHAL */}
        <div className="mb-6 font-sans">
          <div className="flex justify-between items-start text-xs">
            <table className="text-xs">
              <tbody>
                <tr>
                  <td className="pr-3 font-semibold text-slate-700 w-24">Nomor</td>
                  <td className="pr-2">:</td>
                  <td className="font-mono font-bold text-slate-900">{letterNumber}</td>
                </tr>
                <tr>
                  <td className="pr-3 font-semibold text-slate-700">Lampiran</td>
                  <td className="pr-2">:</td>
                  <td>1 (Satu) Lembar Dokumen</td>
                </tr>
                <tr>
                  <td className="pr-3 font-semibold text-slate-700">Sifat</td>
                  <td className="pr-2">:</td>
                  <td>Penting / Resmi</td>
                </tr>
                <tr>
                  <td className="pr-3 font-semibold text-slate-700 align-top">Perihal</td>
                  <td className="pr-2 align-top">:</td>
                  <td className="font-bold text-slate-900 uppercase">
                    Izin Penggunaan Fasilitas & Ruangan Kampus
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="text-right text-xs text-slate-600">
              <p>Kota Akademik, {approvedDateStr}</p>
            </div>
          </div>
        </div>

        {/* TUJUAN SURAT */}
        <div className="mb-4 font-sans text-xs">
          <p className="text-slate-700">Kepada Yth.</p>
          <p className="font-bold text-slate-900">{booking.user.name}</p>
          <p className="text-slate-600">
            {booking.user.nidn ? `NIDN: ${booking.user.nidn}` : "Dosen Pengajar / Civitas Akademika"}
          </p>
          <p className="text-slate-600">Universitas Indonesia Terpadu</p>
        </div>

        {/* ISI PEMBUKA */}
        <p className="text-justify mb-4">
          Menindaklanjuti permohonan pengajuan peminjaman ruangan yang telah diajukan melalui Sistem Informasi Sarana Prasarana Kampus (SARPRAS), dengan ini Biro Pengelolaan Sarana dan Prasarana memberikan <strong>IZIN RESMI PENGGUNAAN RUANGAN</strong> dengan rincian kegiatan sebagai berikut:
        </p>

        {/* TABEL RINCIAN RUANGAN & ACARA */}
        <div className="mb-5 font-sans">
          <table className="w-full text-xs border border-slate-300 rounded-lg overflow-hidden">
            <tbody>
              <tr className="bg-slate-100 border-b border-slate-300">
                <td className="py-2 px-3 font-bold text-slate-800 w-44">Kode Booking Registrasi</td>
                <td className="py-2 px-3 font-mono font-bold text-indigo-700">{booking.bookingCode}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3 font-semibold text-slate-700">Nama Ruangan</td>
                <td className="py-2 px-3 font-bold text-slate-900">
                  {booking.room.name} ({booking.room.code})
                </td>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <td className="py-2 px-3 font-semibold text-slate-700">Lokasi / Gedung</td>
                <td className="py-2 px-3 text-slate-800">{booking.room.location}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3 font-semibold text-slate-700">Kapasitas Tempat Duduk</td>
                <td className="py-2 px-3 text-slate-800">{booking.room.capacity} Orang</td>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <td className="py-2 px-3 font-semibold text-slate-700">Hari & Tanggal Pelaksanaan</td>
                <td className="py-2 px-3 font-bold text-slate-900">{formattedDate}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3 font-semibold text-slate-700">Waktu / Durasi Peminjaman</td>
                <td className="py-2 px-3 text-slate-800">
                  <span className="font-bold text-slate-900">{formattedTime}</span> ({durationHours} Jam)
                </td>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <td className="py-2 px-3 font-semibold text-slate-700">Tujuan / Keperluan Kegiatan</td>
                <td className="py-2 px-3 font-medium text-slate-900">{booking.purpose}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3 font-semibold text-slate-700">Fasilitas yang Disetujui</td>
                <td className="py-2 px-3 text-slate-700 italic">{booking.room.facilities || "Standar Ruangan"}</td>
              </tr>
              {booking.adminNotes && (
                <tr className="bg-amber-50/60">
                  <td className="py-2 px-3 font-semibold text-amber-900">Catatan Khusus Pengelola</td>
                  <td className="py-2 px-3 text-amber-950 font-medium">{booking.adminNotes}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* KETENTUAN PENGGUNAAN RUANGAN */}
        <div className="mb-6 font-sans text-xs">
          <p className="font-bold text-slate-900 mb-1.5">Ketentuan & Tata Tertib Penggunaan:</p>
          <ol className="list-decimal pl-5 space-y-1 text-slate-700 leading-normal text-[11.5px]">
            <li>Pemohon wajib menjaga kebersihan, ketertiban, dan keutuhan seluruh sarana inventaris di dalam ruangan.</li>
            <li>Dilarang merokok, membawa makanan berkuah, atau minuman terbuka yang dapat merusak perangkat teknologi informasi.</li>
            <li>Menyerahkan salinan lembar surat izin ini kepada petugas keamanan / teknisi gedung sebelum pengambilan kunci ruang.</li>
            <li>Mengembalikan tata letak kursi dan mematikan AC, proyektor, serta lampu setelah kegiatan berakhir.</li>
            <li>Kerusakan fasilitas akibat kelalaian pemakaian menjadi tanggung jawab penuh pihak penyelenggara kegiatan.</li>
          </ol>
        </div>

        {/* PENGESAHAN & TANDA TANGAN (Biro Sarpras & QR Code Verification) */}
        <div className="mt-8 pt-4 border-t border-slate-200 font-sans">
          <div className="flex items-end justify-between gap-6">
            {/* Bagian QR Code Verifikasi Digital */}
            <div className="flex items-center gap-3 p-2.5 border border-slate-300 rounded-xl bg-slate-50/80 max-w-xs">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="QR Code Verifikasi Dokumen Resmi"
                  className="w-20 h-20 rounded-md border border-slate-200 bg-white"
                />
              ) : (
                <div className="w-20 h-20 bg-slate-200 animate-pulse rounded-md" />
              )}
              <div className="text-[10px] text-slate-600 leading-tight">
                <div className="flex items-center gap-1 font-bold text-slate-800 text-[11px] mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Verifikasi Elektronik</span>
                </div>
                <p>Dokumen ini sah dan diterbitkan secara digital oleh Sistem Sarpras Kampus.</p>
                <p className="font-mono text-[9px] text-indigo-600 mt-1">{booking.bookingCode}</p>
              </div>
            </div>

            {/* Bagian Tanda Tangan & Stempel Resmi */}
            <div className="text-center relative pr-4 min-w-[200px]">
              <p className="text-xs text-slate-700">a.n. Rektor,</p>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                Kepala Biro Sarana & Prasarana
              </p>

              {/* STEMPEL DINAS DIGITAL BIRU */}
              <div className="relative my-2 h-16 flex items-center justify-center">
                <div className="absolute w-24 h-24 rounded-full border-2 border-indigo-600/70 text-indigo-700/80 flex flex-col items-center justify-center text-[7px] font-bold uppercase tracking-tighter transform -rotate-12 pointer-events-none select-none">
                  <div className="border-b border-indigo-600/50 w-20 text-center pb-0.5">BIRO SARPRAS</div>
                  <div className="my-0.5 text-[8px] font-black tracking-normal text-indigo-800">TERVERIFIKASI</div>
                  <div className="border-t border-indigo-600/50 w-20 text-center pt-0.5">UNIV. INDONESIA</div>
                </div>

                {/* Tanda Tangan Basah Digital */}
                <div className="font-serif italic text-lg font-bold text-indigo-950 z-10 select-none">
                  Rachmat Hidayat
                </div>
              </div>

              <p className="text-xs font-bold text-slate-900 underline leading-tight">
                Ir. H. Rachmat Hidayat, M.T.
              </p>
              <p className="text-[10px] text-slate-600">NIP. 19780412 200312 1 002</p>
            </div>
          </div>
        </div>

        {/* Catatan Kaki Lembar Resmi */}
        <div className="mt-8 pt-2 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-400 font-sans">
          <span>Dicetak otomatis melalui Sistem Peminjaman Ruang Terpadu &bull; www.kampus.ac.id</span>
          <span>Halaman 1 dari 1</span>
        </div>
      </div>
    </div>
  );
}

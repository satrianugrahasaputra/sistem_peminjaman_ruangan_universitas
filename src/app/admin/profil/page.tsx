"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  KeyRound,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  DoorOpen,
  ClipboardCheck,
} from "lucide-react";
import Link from "next/link";

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Password change states
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.success && data.data) {
        setProfile(data.data);
        setName(data.data.name || "");
        setPhone(data.data.phone || "");
      } else {
        setErrorMsg(data.error || "Gagal memuat profil admin.");
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan jaringan saat memuat profil.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim()) {
      setErrorMsg("Nama administrator wajib diisi.");
      return;
    }

    if (showPasswordSection && newPassword) {
      if (!currentPassword) {
        setErrorMsg("Masukkan kata sandi saat ini untuk menyetujui perubahan kata sandi.");
        return;
      }
      if (newPassword.length < 6) {
        setErrorMsg("Kata sandi baru harus minimal 6 karakter.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg("Konfirmasi kata sandi baru tidak cocok.");
        return;
      }
    }

    setSaving(true);

    try {
      const payload: any = {
        name: name.trim(),
        phone: phone.trim(),
      };

      if (showPasswordSection && newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMsg(data.message || "Profil administrator berhasil diperbarui!");
        // Clear password fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordSection(false);
        // Refresh profile data
        fetchProfile();
      } else {
        setErrorMsg(data.error || "Gagal memperbarui profil.");
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan saat menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* Header Breadcrumb */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
            <span>ADMINISTRATOR</span>
            <span>/</span>
            <span className="text-slate-500">PENGATURAN AKUN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Profil Administrator
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola informasi data administrator, nomor kontak, serta kata sandi akun sistem Sarpras.
          </p>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm animate-fade-in shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm animate-fade-in shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-3" />
            <p className="text-slate-500 text-sm font-medium">Memuat data profil administrator...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Profile Card & Quick Info */}
            <div className="space-y-6">
              {/* User Overview Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900" />

                <div className="relative pt-8">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-white p-1.5 shadow-lg border-2 border-indigo-100">
                    <div className="w-full h-full rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-2xl font-bold">
                      {name ? name.charAt(0).toUpperCase() : "A"}
                    </div>
                  </div>

                  <h3 className="mt-3 font-bold text-slate-900 text-lg">{name || "Administrator"}</h3>
                  <p className="text-xs text-slate-500 font-medium">{profile?.email}</p>

                  <div className="mt-3 flex justify-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Super Administrator
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      Hak Akses Penuh
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-4 text-left">
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Level Wewenang</span>
                    <span className="text-sm font-bold text-slate-800">
                      Full Admin
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Status Akun</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Aktif
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Navigation Admin */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2.5 text-indigo-400 mb-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Akses Cepat Panel</span>
                </div>
                <h4 className="text-sm font-semibold text-white">
                  Tinjau Permohonan Peminjaman
                </h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Kelola persetujuan ruang atau perbarui data master inventaris ruangan kampus.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col gap-2">
                  <Link
                    href="/admin/peminjaman"
                    className="flex items-center justify-between px-3 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-medium transition"
                  >
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="w-4 h-4" />
                      <span>Persetujuan Peminjaman</span>
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/admin/ruangan"
                    className="flex items-center justify-between px-3 py-2 bg-slate-800 hover:bg-slate-700/80 text-slate-300 rounded-xl text-xs font-medium transition"
                  >
                    <div className="flex items-center gap-2">
                      <DoorOpen className="w-4 h-4" />
                      <span>Manajemen & Sinkronisasi Ruang</span>
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Edit Profile & Password Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Personal Information Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <User className="w-5 h-5 text-indigo-600" />
                      Informasi Data Administrator
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Perbarui nama akun admin dan kontak darurat WhatsApp / Telepon.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Nama Lengkap / Identitas Admin <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Masukkan nama administrator"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                      </div>
                    </div>

                    {/* Email (Readonly) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Email Login Administrator
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          disabled
                          value={profile?.email || ""}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-500 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Email akun utama pengelola sistem sarana prasarana.
                      </p>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Nomor Telepon / WhatsApp
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Contoh: 081234567890"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password Change Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <KeyRound className="w-5 h-5 text-indigo-600" />
                        Keamanan & Kata Sandi
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Pastikan menggunakan kombinasi kata sandi yang kuat demi keamanan sistem.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowPasswordSection(!showPasswordSection)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                        showPasswordSection
                          ? "bg-slate-100 text-slate-700 border-slate-300"
                          : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                      }`}
                    >
                      {showPasswordSection ? "Batal Ubah Kata Sandi" : "Ubah Kata Sandi"}
                    </button>
                  </div>

                  {showPasswordSection ? (
                    <div className="space-y-4 pt-2 animate-fade-in">
                      {/* Current Password */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Kata Sandi Saat Ini <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPass ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Ketik kata sandi Anda yang sedang aktif"
                            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                          >
                            {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* New Password */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Kata Sandi Baru <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPass ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Minimal 6 karakter"
                              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPass(!showNewPass)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                            >
                              {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Confirm New Password */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPass ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Ulangi kata sandi baru"
                              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPass(!showConfirmPass)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                            >
                              {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 text-xs text-slate-400 italic">
                      Klik tombol &ldquo;Ubah Kata Sandi&rdquo; di atas bila Anda ingin memperbarui password login administrator.
                    </div>
                  )}
                </div>

                {/* Save Button Bar */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Simpan Perubahan</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

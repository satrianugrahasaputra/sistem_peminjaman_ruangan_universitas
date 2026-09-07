"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Login gagal. Silakan periksa kredensial Anda.");
        setLoading(false);
        return;
      }

      // Success redirect
      router.push(data.redirectUrl || "/");
      router.refresh();
    } catch (err: any) {
      setErrorMessage("Terjadi gangguan koneksi jaringan.");
      setLoading(false);
    }
  };

  const setCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-4 shadow-xl shadow-indigo-950">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Sistem Peminjaman Ruang
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Portal Manajemen & Reservasi Ruangan Universitas Terpadu
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Masuk ke Akun Anda
          </h2>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-sm animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Alamat Email Kampus
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="nama@kampus.ac.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-700/70 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 bg-slate-950/60 border border-slate-700/70 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/60 text-white font-medium rounded-xl text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Sistem</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </>
              )}
            </button>
          </form>

          {/* Quick Fill Box for Evaluation & Demo */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-xs font-medium text-slate-400 mb-3 text-center">
              Akses Cepat Pengujian (Demo Akun Seeder):
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCredentials("admin@kampus.ac.id", "Admin123!")}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 rounded-lg text-left transition"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white">Role Admin</div>
                  <div className="text-[10px] text-slate-400">admin@kampus.ac.id</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCredentials("budi.santoso@kampus.ac.id", "Dosen123!")}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 rounded-lg text-left transition"
              >
                <GraduationCap className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white">Role Dosen</div>
                  <div className="text-[10px] text-slate-400">budi.santoso@...</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Sistem Informasi Peminjaman Sarpras Kampus &copy; 2026. All rights reserved.
        </p>
      </div>
    </div>
  );
}

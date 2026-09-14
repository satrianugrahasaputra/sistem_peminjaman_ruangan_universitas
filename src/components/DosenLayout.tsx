"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  DoorOpen,
  CalendarPlus,
  History,
  LogOut,
  Building2,
  Menu,
  X,
  GraduationCap,
  User,
  ChevronDown,
  UserCog,
} from "lucide-react";

interface DosenLayoutProps {
  children: React.ReactNode;
}

export default function DosenLayout({ children }: DosenLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (confirm("Apakah Anda yakin ingin keluar dari akun?")) {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    }
  };

  const navItems = [
    {
      name: "Dashboard Dosen",
      href: "/dosen/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Katalog Ruangan",
      href: "/dosen/ruangan",
      icon: DoorOpen,
    },
    {
      name: "Ajukan Peminjaman",
      href: "/dosen/ajukan",
      icon: CalendarPlus,
    },
    {
      name: "Riwayat Pengajuan",
      href: "/dosen/riwayat",
      icon: History,
    },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex">
      {/* Sidebar for Desktop - Fixed 100% Height, Never Scrolls with Main Content */}
      <aside className="hidden lg:flex lg:flex-col w-72 h-screen bg-slate-900 text-slate-300 border-r border-slate-800 flex-shrink-0 select-none">
        {/* Logo Branding */}
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3.5 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-white tracking-tight leading-none text-base">
              PORTAL DOSEN
            </h2>
            <span className="text-[11px] text-emerald-400 font-medium">
              Sistem Sarpras Kampus
            </span>
          </div>
        </div>

        {/* Navigation links - Scrollable only within sidebar if needed */}
        <nav className="p-4 flex-1 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Menu Dosen
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout - Pinned to bottom of Sidebar */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-9 h-9 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {currentUser?.name || "Dosen Pengajar"}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {currentUser?.email || "dosen@kampus.ac.id"}
              </p>
              {currentUser?.nidn && (
                <p className="text-[10px] text-emerald-400">
                  NIDN: {currentUser.nidn}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 hover:border-rose-900/50 border border-slate-700/60 rounded-xl text-xs font-medium transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* Main Container - Has its own independent scroll container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar - Fixed at the top */}
        <header className="h-16 flex-shrink-0 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <GraduationCap className="w-3.5 h-3.5" />
                Portal Dosen
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">|</span>
              <span className="text-xs text-slate-500 hidden sm:inline">
                Sistem Peminjaman Ruang Kampus
              </span>
            </div>
          </div>

          {/* Profile Dropdown Component */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="btn-dosen-profile-dropdown"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-3 p-1.5 sm:px-3 sm:py-2 rounded-2xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200 cursor-pointer"
            >
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser?.name || "Dosen Pengajar"}
                </div>
                <div className="text-[11px] text-slate-500">
                  {currentUser?.nidn ? `NIDN: ${currentUser.nidn}` : currentUser?.email || "dosen@kampus.ac.id"}
                </div>
              </div>

              <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs shadow-xs">
                <User className="w-4 h-4" />
              </div>

              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {currentUser?.name || "Dosen Pengajar"}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {currentUser?.email}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <GraduationCap className="w-3 h-3" />
                    Dosen Akademik {currentUser?.nidn ? `• ${currentUser.nidn}` : ""}
                  </span>
                </div>

                <div className="p-1.5 space-y-1">
                  <Link
                    href="/dosen/profil"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
                  >
                    <UserCog className="w-4 h-4 text-emerald-600" />
                    <span>Profil Saya</span>
                  </Link>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Keluar Akun</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-1 flex-shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    isActive
                      ? "bg-emerald-600 text-white font-semibold"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full mt-2 flex items-center gap-3 px-3 py-2 text-rose-400 hover:bg-rose-950/30 rounded-xl text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        )}

        {/* Page Content - ONLY this area scrolls */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}

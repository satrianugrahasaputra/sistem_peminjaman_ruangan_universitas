"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { SystemNotification } from "@/lib/notifications";

interface NotificationDropdownProps {
  role: "ADMIN" | "DOSEN";
}

export default function NotificationDropdown({ role }: NotificationDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const storageKey = `univ_sarpras_read_notifs_${role}`;

  // Load read notifications from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setReadIds(new Set(JSON.parse(stored)));
      }
    } catch (e) {}
  }, [storageKey]);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success && data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const markAllAsRead = () => {
    const allIds = new Set([...Array.from(readIds), ...notifications.map((n) => n.id)]);
    setReadIds(allIds);
    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(allIds)));
    } catch (e) {}
  };

  const handleNotificationClick = (notif: SystemNotification) => {
    // Mark as read
    const newRead = new Set(readIds);
    newRead.add(notif.id);
    setReadIds(newRead);
    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(newRead)));
    } catch (e) {}

    setIsOpen(false);
    router.push(notif.link);
  };

  const renderIcon = (type: SystemNotification["type"]) => {
    switch (type) {
      case "APPROVED":
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      case "REJECTED":
        return (
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-4 h-4" />
          </div>
        );
      case "PENDING":
      case "PENDING_NEW":
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        id="btn-navbar-notifications"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition border border-transparent hover:border-slate-200 cursor-pointer focus:outline-hidden"
        title="Lonceng Notifikasi"
        aria-label="Notifikasi"
      >
        <Bell className="w-5 h-5" />

        {/* Unread Ping Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[10px] font-bold text-white items-center justify-center leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fade-in">
          {/* Header */}
          <div className="px-4 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm">Notifikasi</span>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                  {unreadCount} Baru
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-200 text-slate-600">
                  Semua Terbaca
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                title="Tandai semua notifikasi sudah dibaca"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Tandai dibaca</span>
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Inbox className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-700">Belum ada notifikasi</p>
                <p className="text-xs text-slate-400 mt-1">
                  Aktivitas peminjaman dan status verifikasi akan muncul di sini.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = !readIds.has(notif.id);
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 flex items-start gap-3 hover:bg-slate-50/80 transition cursor-pointer group ${
                      isUnread ? "bg-indigo-50/40" : ""
                    }`}
                  >
                    {renderIcon(notif.type)}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span
                          className={`text-xs ${
                            isUnread
                              ? "font-bold text-slate-900"
                              : "font-semibold text-slate-700"
                          }`}
                        >
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {notif.timeAgo}
                        </span>
                      </div>
                      <p
                        className={`text-xs line-clamp-2 leading-relaxed ${
                          isUnread ? "text-slate-800 font-medium" : "text-slate-500"
                        }`}
                      >
                        {notif.message}
                      </p>
                    </div>

                    {isUnread && (
                      <span
                        className="w-2 h-2 rounded-full bg-indigo-600 mt-2 flex-shrink-0"
                        title="Belum dibaca"
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Navigation */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push(role === "ADMIN" ? "/admin/peminjaman" : "/dosen/riwayat");
              }}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition cursor-pointer w-full py-1"
            >
              <span>Buka Seluruh Riwayat Peminjaman</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

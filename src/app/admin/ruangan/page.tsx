"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  DoorOpen,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit,
  Trash2,
  Users,
  MapPin,
  Sparkles,
  AlertCircle,
  CheckCircle2,
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
  isAvailable: boolean;
}

export default function AdminRuanganPage() {
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [minCapacity, setMinCapacity] = useState("");

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  // Modal State (Create / Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomItem | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    capacity: 30,
    location: "",
    facilities: "",
    isAvailable: true,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState<RoomItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const handleSyncWebService = async () => {
    try {
      setSyncing(true);
      setSyncResult(null);
      const res = await fetch("/api/rooms/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setSyncResult(data);
      if (data.success) {
        fetchRooms();
      }
    } catch (err) {
      setSyncResult({
        success: false,
        error: "Gagal menghubungkan ke WebService sinkronisasi.",
      });
    } finally {
      setSyncing(false);
    }
  };

  const openCreateModal = () => {
    setEditingRoom(null);
    setFormData({
      code: "",
      name: "",
      capacity: 40,
      location: "",
      facilities: "Proyektor, AC, Whiteboard, Sound System",
      isAvailable: true,
    });
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (room: RoomItem) => {
    setEditingRoom(room);
    setFormData({
      code: room.code,
      name: room.name,
      capacity: room.capacity,
      location: room.location,
      facilities: room.facilities,
      isAvailable: room.isAvailable,
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    try {
      const url = editingRoom ? `/api/rooms/${editingRoom.id}` : "/api/rooms";
      const method = editingRoom ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || "Gagal menyimpan data ruangan.");
        setFormLoading(false);
        return;
      }

      setModalOpen(false);
      fetchRooms();
    } catch (err: any) {
      setFormError("Terjadi kesalahan jaringan.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/rooms/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Gagal menghapus ruangan.");
      } else {
        setDeleteTarget(null);
        fetchRooms();
      }
    } catch {
      alert("Terjadi kesalahan saat menghapus ruangan.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <AdminLayout>
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Manajemen Data Ruangan
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola data ruangan perkuliahan, laboratorium, dan sinkronkan dengan WebService API.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Tombol Khusus Sinkronisasi WebService API */}
          <button
            id="btn-sync-api-ruangan"
            onClick={handleSyncWebService}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm hover:border-slate-400 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 text-indigo-600 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Menyinkronkan..." : "Sinkronisasi WebService"}</span>
          </button>

          <button
            id="btn-tambah-ruang"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Ruang Baru</span>
          </button>
        </div>
      </div>

      {/* Sync feedback notification banner */}
      {syncResult && (
        <div
          className={`mb-6 p-4 rounded-xl border flex items-start justify-between gap-3 text-sm ${
            syncResult.success
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {syncResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <div>
              <p className="font-semibold">{syncResult.message || syncResult.error}</p>
              {syncResult.source && (
                <p className="text-xs text-slate-500 mt-0.5">Sumber Endpoint: {syncResult.source}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setSyncResult(null)}
            className="text-xs font-semibold hover:underline opacity-80"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama ruangan, kode (misal: LAB-KOMP-1), atau fasilitas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <input
            type="text"
            placeholder="Filter Gedung / Lokasi..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full md:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />

          <select
            value={minCapacity}
            onChange={(e) => setMinCapacity(e.target.value)}
            className="w-full md:w-44 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          >
            <option value="">Semua Kapasitas</option>
            <option value="30">&ge; 30 Orang</option>
            <option value="50">&ge; 50 Orang</option>
            <option value="100">&ge; 100 Orang</option>
          </select>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Kode Ruang</th>
                <th className="py-3.5 px-4">Nama Ruangan</th>
                <th className="py-3.5 px-4">Kapasitas</th>
                <th className="py-3.5 px-4">Lokasi Gedung</th>
                <th className="py-3.5 px-4">Fasilitas Utama</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Memuat daftar ruangan...
                  </td>
                </tr>
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ditemukan ruangan yang sesuai filter.
                  </td>
                </tr>
              ) : (
                rooms.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-bold text-xs text-indigo-700">
                      {r.code}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-xs text-slate-900">
                      {r.name}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="inline-flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        <Users className="w-3 h-3 text-slate-500" />
                        {r.capacity} Kursi
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {r.location}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                      {r.facilities}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {r.isAvailable ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Tersedia
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          Non-Aktif
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(r)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit Ruangan"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(r)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus / Non-aktifkan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create / Edit Room */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingRoom ? "Edit Data Ruangan" : "Tambah Ruangan Baru"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveRoom} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kode Ruang *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: LAB-KOMP-3"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kapasitas (Kursi) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Ruangan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Laboratorium Robotika & IoT"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lokasi / Gedung *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Gedung FTI Lt. 2"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fasilitas Ruangan (Pisahkan dengan koma)
                </label>
                <textarea
                  rows={2}
                  value={formData.facilities}
                  onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                  placeholder="Proyektor 4K, 30 PC, AC, Sound System, LAN Gigabit"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="chk-available"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <label htmlFor="chk-available" className="text-xs font-medium text-slate-700">
                  Ruangan Aktif & Siap Digunakan
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={formLoading}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm shadow-indigo-600/30"
                >
                  {formLoading ? "Menyimpan..." : editingRoom ? "Simpan Perubahan" : "Tambah Ruangan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Hapus / Nonaktifkan Ruangan
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Apakah Anda yakin ingin menghapus ruangan <strong>{deleteTarget.name}</strong> ({deleteTarget.code})? Jika memiliki riwayat peminjaman, ruangan akan dinonaktifkan secara aman.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteRoom}
                disabled={deleteLoading}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition"
              >
                {deleteLoading ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

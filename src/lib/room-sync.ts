import { prisma } from "./prisma";

export interface ExternalRoomItem {
  id?: string | number;
  code?: string;
  kode?: string;
  kode_ruang?: string;
  name?: string;
  nama?: string;
  nama_ruang?: string;
  capacity?: number;
  kapasitas?: number;
  location?: string;
  gedung?: string;
  lokasi?: string;
  facilities?: string | string[];
  fasilitas?: string | string[];
  imageUrl?: string;
  image?: string;
}

export const FALLBACK_ROOMS: ExternalRoomItem[] = [
  {
    code: "LAB-KOMP-1",
    name: "Laboratorium Komputer 1 (Synced)",
    capacity: 45,
    location: "Gedung Rektorat Lt. 2",
    facilities: "40 PC Core i7, Proyektor 4K, Full AC, Sound System, LAN Gigabit",
  },
  {
    code: "LAB-KOMP-2",
    name: "Laboratorium Komputer 2 (Synced)",
    capacity: 35,
    location: "Gedung Rektorat Lt. 2",
    facilities: "35 PC Core i5, Proyektor, AC, Whiteboard, Switch Gigabit",
  },
  {
    code: "LAB-MULTIMEDIA",
    name: "Lab Multimedia & VR (Synced)",
    capacity: 32,
    location: "Gedung FTI Lt. 3",
    facilities: "30 PC RTX 4070, Headset VR Meta Quest 3, Sound Booth, Green Screen",
  },
  {
    code: "RK-A101",
    name: "Ruang Kuliah Teori A101 (Synced)",
    capacity: 55,
    location: "Gedung Kuliah Bersama Lt. 1",
    facilities: "Smart TV 75 inch, AC, Mic Wireless, Kursi Kuliah Ergonomis",
  },
  {
    code: "RK-A102",
    name: "Ruang Kuliah Teori A102 (Synced)",
    capacity: 50,
    location: "Gedung Kuliah Bersama Lt. 1",
    facilities: "Proyektor Laser, 2 AC, Papan Tulis Kaca, Sound System",
  },
  {
    code: "RK-B201",
    name: "Ruang Kuliah Teori B201 (Synced)",
    capacity: 65,
    location: "Gedung Kuliah Bersama Lt. 2",
    facilities: "Dual Proyektor, 3 AC, Podium Dosen, Mic Wireless",
  },
  {
    code: "AULA-UTAMA",
    name: "Auditorium / Aula Utama (Synced)",
    capacity: 350,
    location: "Gedung Serbaguna Lt. 1",
    facilities: "Videotron P2.5 8x4m, Line Array Sound, Panggung Teater, Central AC, Lighting System",
  },
  {
    code: "SEMINAR-S2",
    name: "Ruang Seminar Pascasarjana (Synced)",
    capacity: 45,
    location: "Gedung Pascasarjana Lt. 3",
    facilities: "Video Conference Polycom, Interactive Display 86 inch, AC, Meja Rapat U-Shape",
  },
  {
    code: "RAPAT-SENAT",
    name: "Ruang Sidang Senat Universitas (Synced)",
    capacity: 30,
    location: "Gedung Rektorat Lt. 4",
    facilities: "Sistem Voting Digital, Mic Delegasi Goose Neck, AC, Executive Chairs",
  },
  {
    code: "STUDIO-DESAIN",
    name: "Studio Desain & Arsitektur (Synced)",
    capacity: 35,
    location: "Gedung Fakultas Teknik Lt. 1",
    facilities: "Drawing Tablets Wacom Cintiq, Lightbox Meja Gambar, Proyektor Ultra Short Throw",
  },
];

export async function syncRoomsFromWebService(
  customUrl?: string
): Promise<{
  success: boolean;
  message: string;
  source: string;
  created: number;
  updated: number;
  total: number;
}> {
  const targetUrl =
    customUrl ||
    process.env.ROOM_API_URL ||
    "https://api-ruangan.vercel.app/rooms";

  let rawData: any[] = [];
  let sourceName = targetUrl;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json)) {
        rawData = json;
      } else if (json && Array.isArray(json.data)) {
        rawData = json.data;
      } else if (json && Array.isArray(json.rooms)) {
        rawData = json.rooms;
      }
    } else {
      console.warn(`External API returned status ${res.status}. Using fallback catalogue.`);
      rawData = FALLBACK_ROOMS;
      sourceName = `${targetUrl} (HTTP ${res.status} -> Fallback Service)`;
    }
  } catch (error: any) {
    console.warn(`External API fetch failed (${error.message}). Using fallback catalogue.`);
    rawData = FALLBACK_ROOMS;
    sourceName = `${targetUrl} (Network unavailable -> Fallback Service)`;
  }

  if (!rawData || rawData.length === 0) {
    rawData = FALLBACK_ROOMS;
    sourceName = "Fallback Service";
  }

  let createdCount = 0;
  let updatedCount = 0;

  for (let i = 0; i < rawData.length; i++) {
    const item = rawData[i];
    const code = (
      item.code ||
      item.kode ||
      item.kode_ruang ||
      `ROOM-${i + 1}`
    ).toString().trim().toUpperCase();

    const name = (
      item.name ||
      item.nama ||
      item.nama_ruang ||
      `Ruangan ${code}`
    ).toString().trim();

    const capacity = Number(
      item.capacity || item.kapasitas || 30
    );

    const location = (
      item.location ||
      item.gedung ||
      item.lokasi ||
      "Kampus Utama"
    ).toString().trim();

    let facilities = "Proyektor, AC, Whiteboard";
    const rawFac = item.facilities || item.fasilitas;
    if (Array.isArray(rawFac)) {
      facilities = rawFac.join(", ");
    } else if (typeof rawFac === "string" && rawFac.trim().length > 0) {
      facilities = rawFac;
    }

    const existing = await prisma.room.findUnique({
      where: { code },
    });

    if (existing) {
      await prisma.room.update({
        where: { code },
        data: {
          name,
          capacity,
          location,
          facilities,
        },
      });
      updatedCount++;
    } else {
      await prisma.room.create({
        data: {
          code,
          name,
          capacity,
          location,
          facilities,
          isAvailable: true,
        },
      });
      createdCount++;
    }
  }

  return {
    success: true,
    message: `Berhasil sinkronisasi ${createdCount + updatedCount} ruangan (${createdCount} baru, ${updatedCount} diperbarui) dari ${sourceName}.`,
    source: sourceName,
    created: createdCount,
    updated: updatedCount,
    total: createdCount + updatedCount,
  };
}

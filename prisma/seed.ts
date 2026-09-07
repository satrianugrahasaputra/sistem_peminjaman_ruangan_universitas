import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  const hashedAdminPassword = await bcrypt.hash("Admin123!", 10);
  const hashedDosenPassword = await bcrypt.hash("Dosen123!", 10);

  // 1. Create 10 Users (2 Admins + 8 Dosen)
  const users = [
    {
      name: "Administrator Sarpras",
      email: "admin@kampus.ac.id",
      password: hashedAdminPassword,
      role: "ADMIN",
      nidn: null,
      phone: "081234567890",
    },
    {
      name: "Admin Akademik & Fasilitas",
      email: "admin.sarpras@kampus.ac.id",
      password: hashedAdminPassword,
      role: "ADMIN",
      nidn: null,
      phone: "081234567891",
    },
    {
      name: "Dr. Budi Santoso, M.Kom.",
      email: "budi.santoso@kampus.ac.id",
      password: hashedDosenPassword,
      role: "DOSEN",
      nidn: "0412058001",
      phone: "081234567801",
    },
    {
      name: "Siti Aminah, M.T.",
      email: "siti.aminah@kampus.ac.id",
      password: hashedDosenPassword,
      role: "DOSEN",
      nidn: "0415088202",
      phone: "081234567802",
    },
    {
      name: "Eko Prasetyo, Ph.D.",
      email: "eko.prasetyo@kampus.ac.id",
      password: hashedDosenPassword,
      role: "DOSEN",
      nidn: "0420018503",
      phone: "081234567803",
    },
    {
      name: "Dr. Dewi Lestari, M.Si.",
      email: "dewi.lestari@kampus.ac.id",
      password: hashedDosenPassword,
      role: "DOSEN",
      nidn: "0403118704",
      phone: "081234567804",
    },
    {
      name: "Ahmad Dahlan, M.Kom.",
      email: "ahmad.dahlan@kampus.ac.id",
      password: hashedDosenPassword,
      role: "DOSEN",
      nidn: "0425068905",
      phone: "081234567805",
    },
    {
      name: "Fitri Handayani, M.Eng.",
      email: "fitri.handayani@kampus.ac.id",
      password: hashedDosenPassword,
      role: "DOSEN",
      nidn: "0418049106",
      phone: "081234567806",
    },
    {
      name: "Hendra Wijaya, M.Kom.",
      email: "hendra.wijaya@kampus.ac.id",
      password: hashedDosenPassword,
      role: "DOSEN",
      nidn: "0409099207",
      phone: "081234567807",
    },
    {
      name: "Rina Maharani, M.Sc.",
      email: "rina.maharani@kampus.ac.id",
      password: hashedDosenPassword,
      role: "DOSEN",
      nidn: "0430129308",
      phone: "081234567808",
    },
  ];

  const createdUsers: Record<string, any> = {};
  for (const u of users) {
    const user = await prisma.user.create({ data: u });
    createdUsers[u.email] = user;
  }
  console.log(`Created ${Object.keys(createdUsers).length} users.`);

  // 2. Create 10 Rooms
  const rooms = [
    {
      code: "LAB-KOMP-1",
      name: "Laboratorium Komputer 1",
      capacity: 40,
      location: "Gedung Rektorat Lt. 2",
      facilities: "40 PC Core i7, Proyektor 4K, Full AC, Sound System, LAN Gigabit",
      imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
    },
    {
      code: "LAB-KOMP-2",
      name: "Laboratorium Komputer 2",
      capacity: 35,
      location: "Gedung Rektorat Lt. 2",
      facilities: "35 PC Core i5, Proyektor, AC, Whiteboard, Switch Gigabit",
      imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
    },
    {
      code: "LAB-MULTIMEDIA",
      name: "Lab Multimedia & VR",
      capacity: 30,
      location: "Gedung FTI Lt. 3",
      facilities: "30 PC RTX 4070, Headset VR Meta Quest 3, Sound Booth, Green Screen",
      imageUrl: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80",
    },
    {
      code: "RK-A101",
      name: "Ruang Kuliah Teori A101",
      capacity: 50,
      location: "Gedung Kuliah Bersama Lt. 1",
      facilities: "Smart TV 75 inch, AC, Mic Wireless, Kursi Kuliah Ergonomis",
      imageUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80",
    },
    {
      code: "RK-A102",
      name: "Ruang Kuliah Teori A102",
      capacity: 50,
      location: "Gedung Kuliah Bersama Lt. 1",
      facilities: "Proyektor Laser, 2 AC, Papan Tulis Kaca, Sound System",
      imageUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80",
    },
    {
      code: "RK-B201",
      name: "Ruang Kuliah Teori B201",
      capacity: 60,
      location: "Gedung Kuliah Bersama Lt. 2",
      facilities: "Dual Proyektor, 3 AC, Podium Dosen, Mic Wireless",
      imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
    },
    {
      code: "AULA-UTAMA",
      name: "Auditorium / Aula Utama",
      capacity: 300,
      location: "Gedung Serbaguna Lt. 1",
      facilities: "Videotron P2.5 8x4m, Line Array Sound, Panggung Teater, Central AC, Lighting System",
      imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
    },
    {
      code: "SEMINAR-S2",
      name: "Ruang Seminar Pascasarjana",
      capacity: 45,
      location: "Gedung Pascasarjana Lt. 3",
      facilities: "Video Conference Polycom, Interactive Display 86 inch, AC, Meja Rapat U-Shape",
      imageUrl: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80",
    },
    {
      code: "RAPAT-SENAT",
      name: "Ruang Sidang Senat Universitas",
      capacity: 25,
      location: "Gedung Rektorat Lt. 4",
      facilities: "Sistem Voting Digital, Mic Delegasi Goose Neck, AC, Executive Chairs",
      imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    },
    {
      code: "STUDIO-DESAIN",
      name: "Studio Desain & Arsitektur",
      capacity: 30,
      location: "Gedung Fakultas Teknik Lt. 1",
      facilities: "Drawing Tablets Wacom Cintiq, Lightbox Meja Gambar, Proyektor Ultra Short Throw",
      imageUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const createdRooms: Record<string, any> = {};
  for (const r of rooms) {
    const room = await prisma.room.create({ data: r });
    createdRooms[r.code] = room;
  }
  console.log(`Created ${Object.keys(createdRooms).length} rooms.`);

  // 3. Create Sample Bookings (Illustrating 4 Statuses: MENUNGGU, DISETUJUI, DITOLAK, SELESAI)
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const bookings = [
    {
      bookingCode: "BK-20260901-001",
      userId: createdUsers["budi.santoso@kampus.ac.id"].id,
      roomId: createdRooms["LAB-KOMP-1"].id,
      purpose: "Praktikum Pemrograman Web Lanjut - Kelas A",
      startTime: new Date(new Date().setDate(now.getDate() - 3)),
      endTime: new Date(new Date().setDate(now.getDate() - 3)),
      status: "SELESAI",
      adminNotes: "Kegiatan telah selesai dilaksanakan dengan baik.",
      approvedAt: new Date(new Date().setDate(now.getDate() - 4)),
      approvedById: createdUsers["admin@kampus.ac.id"].id,
    },
    {
      bookingCode: "BK-20260907-002",
      userId: createdUsers["siti.aminah@kampus.ac.id"].id,
      roomId: createdRooms["RK-A101"].id,
      purpose: "Kuliah Pengganti Matematika Diskrit",
      startTime: new Date(new Date(tomorrow).setHours(8, 0, 0, 0)),
      endTime: new Date(new Date(tomorrow).setHours(10, 30, 0, 0)),
      status: "DISETUJUI",
      adminNotes: "Disetujui. Harap menjaga kebersihan dan mematikan AC setelah selesai.",
      approvedAt: now,
      approvedById: createdUsers["admin@kampus.ac.id"].id,
    },
    {
      bookingCode: "BK-20260907-003",
      userId: createdUsers["eko.prasetyo@kampus.ac.id"].id,
      roomId: createdRooms["AULA-UTAMA"].id,
      purpose: "Seminar Internasional AI & Future of Work",
      startTime: new Date(new Date(tomorrow).setHours(13, 0, 0, 0)),
      endTime: new Date(new Date(tomorrow).setHours(17, 0, 0, 0)),
      status: "MENUNGGU",
      adminNotes: null,
    },
    {
      bookingCode: "BK-20260907-004",
      userId: createdUsers["dewi.lestari@kampus.ac.id"].id,
      roomId: createdRooms["RAPAT-SENAT"].id,
      purpose: "Rapat Koordinasi Hibah Penelitian",
      startTime: new Date(new Date().setDate(now.getDate() - 1)),
      endTime: new Date(new Date().setDate(now.getDate() - 1)),
      status: "DITOLAK",
      adminNotes: "Ruangan sedang dalam perbaikan instalasi sistem audio dan AC.",
      approvedAt: now,
      approvedById: createdUsers["admin@kampus.ac.id"].id,
    },
    {
      bookingCode: "BK-20260908-005",
      userId: createdUsers["ahmad.dahlan@kampus.ac.id"].id,
      roomId: createdRooms["LAB-MULTIMEDIA"].id,
      purpose: "Workshop Animasi 3D & Blender Dasar",
      startTime: new Date(new Date(tomorrow).setDate(tomorrow.getDate() + 2)),
      endTime: new Date(new Date(tomorrow).setDate(tomorrow.getDate() + 2)),
      status: "MENUNGGU",
      adminNotes: null,
    },
  ];

  for (const b of bookings) {
    await prisma.booking.create({ data: b });
  }

  console.log(`Created ${bookings.length} initial sample bookings.`);
  console.log("Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

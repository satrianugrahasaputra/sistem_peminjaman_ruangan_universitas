import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistem Peminjaman Ruang Universitas",
  description:
    "Aplikasi Manajemen & Peminjaman Ruangan Kampus Terpadu untuk Dosen dan Administrator Sarpras",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

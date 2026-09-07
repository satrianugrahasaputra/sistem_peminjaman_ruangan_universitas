import { Clock, CheckCircle2, XCircle, CheckCheck } from "lucide-react";

interface StatusBadgeProps {
  status: "MENUNGGU" | "DISETUJUI" | "DITOLAK" | "SELESAI" | string;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const isSm = size === "sm";

  switch (status) {
    case "MENUNGGU":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 ${
            isSm ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs"
          }`}
        >
          <Clock className={isSm ? "w-3 h-3 text-amber-500 animate-pulse" : "w-3.5 h-3.5 text-amber-500 animate-pulse"} />
          <span>Menunggu</span>
        </span>
      );

    case "DISETUJUI":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${
            isSm ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs"
          }`}
        >
          <CheckCircle2 className={isSm ? "w-3 h-3 text-emerald-500" : "w-3.5 h-3.5 text-emerald-500"} />
          <span>Disetujui</span>
        </span>
      );

    case "DITOLAK":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 ${
            isSm ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs"
          }`}
        >
          <XCircle className={isSm ? "w-3 h-3 text-rose-500" : "w-3.5 h-3.5 text-rose-500"} />
          <span>Ditolak</span>
        </span>
      );

    case "SELESAI":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 ${
            isSm ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs"
          }`}
        >
          <CheckCheck className={isSm ? "w-3 h-3 text-indigo-500" : "w-3.5 h-3.5 text-indigo-500"} />
          <span>Selesai</span>
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          {status}
        </span>
      );
  }
}

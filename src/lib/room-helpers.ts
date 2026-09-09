export function getRoomImage(room?: {
  code?: string;
  name?: string;
  imageUrl?: string | null;
}): string {
  if (!room) {
    return "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80";
  }

  if (room.imageUrl && room.imageUrl.startsWith("http")) {
    return room.imageUrl;
  }

  const code = (room.code || "").toUpperCase();
  const name = (room.name || "").toLowerCase();

  if (code.includes("LAB") || name.includes("lab") || name.includes("komputer")) {
    if (code.includes("MULTI") || name.includes("multimedia") || name.includes("vr")) {
      return "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80";
    }
    if (code.includes("KOMP-2")) {
      return "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80";
    }
    return "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80";
  }

  if (code.includes("AULA") || name.includes("aula") || name.includes("auditorium")) {
    return "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80";
  }

  if (code.includes("SENAT") || code.includes("RAPAT") || name.includes("senat") || name.includes("sidang")) {
    return "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80";
  }

  if (code.includes("SEMINAR") || name.includes("seminar")) {
    return "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80";
  }

  if (code.includes("STUDIO") || name.includes("studio") || name.includes("desain")) {
    return "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80";
  }

  if (code.includes("B201") || name.includes("teori")) {
    return "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80";
  }

  if (code.includes("A102")) {
    return "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80";
  }

  // Default lecture hall
  return "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80";
}

export function parseFacilityTag(facility: string): {
  label: string;
  type: "screen" | "audio" | "ac" | "tech" | "general";
} {
  const f = facility.toLowerCase();
  if (f.includes("proyektor") || f.includes("tv") || f.includes("videotron") || f.includes("display")) {
    return { label: facility, type: "screen" };
  }
  if (f.includes("ac") || f.includes("air conditioner")) {
    return { label: facility, type: "ac" };
  }
  if (f.includes("sound") || f.includes("mic") || f.includes("audio") || f.includes("speaker")) {
    return { label: facility, type: "audio" };
  }
  if (f.includes("pc") || f.includes("vr") || f.includes("lan") || f.includes("komputer") || f.includes("tablet") || f.includes("switch")) {
    return { label: facility, type: "tech" };
  }
  return { label: facility, type: "general" };
}

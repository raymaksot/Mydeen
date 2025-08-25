export function parseYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace("/", "") || null;
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2];
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2];
    }
    return null;
  } catch { return null; }
}

export function ytThumb(id: string, quality: "hqdefault" | "mqdefault" | "maxresdefault" = "hqdefault") {
  return `https://i.ytimg.com/vi/${id}/${quality}.jpg`;
}

export function secsToMMSS(s?: number | null) {
  if (s == null) return null;
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${ss.toString().padStart(2, "0")}`;
}

// лёгкий оEmbed для заголовка/канала (без API-ключа; Node 18+)
export async function fetchOEmbed(url: string) {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
    if (!res.ok) return null;
    const j: any = await res.json();
    return { title: j.title as string, channel: j.author_name as string };
  } catch { return null; }
}

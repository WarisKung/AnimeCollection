// Shared palette for genres across cards, tags and charts.
const GENRE_COLORS: Record<string, string> = {
  romance: "#f472b6",
  action: "#fb7185",
  adventure: "#fbbf24",
  comedy: "#facc15",
  drama: "#c084fc",
  fantasy: "#a78bfa",
  "sci-fi": "#22d3ee",
  "slice of life": "#86efac",
  mystery: "#818cf8",
  horror: "#ef4444",
  supernatural: "#d8b4fe",
  sports: "#a3e635",
  music: "#2dd4bf",
  psychological: "#94a3b8",
  thriller: "#f97316",
  mecha: "#60a5fa",
  ecchi: "#f9a8d4",
  "award winning": "#fbbf24",
  gourmet: "#fb923c",
  suspense: "#f87171",
};

export function genreColor(genre: string): string {
  return GENRE_COLORS[genre.trim().toLowerCase()] ?? "#a78bfa";
}

export function genreTagStyle(genre: string) {
  const color = genreColor(genre);
  return {
    color,
    borderColor: `${color}66`,
    backgroundColor: `${color}20`,
  };
}

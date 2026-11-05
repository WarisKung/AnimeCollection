export type JikanAnime = {
  mal_id: number;
  title: string;
  title_english: string | null;
  year: number | null;
  episodes: number | null;
  images: { webp: { large_image_url: string } };
  aired: { from: string | null };
  genres: { name: string }[];
  duration_minutes: number | null;
  anime_format: string | null;
  watch_url: string | null;
};

type AniListMedia = {
  id: number;
  idMal: number | null;
  title: { english: string | null; romaji: string | null };
  coverImage: { extraLarge: string | null; large: string | null } | null;
  startDate: { year: number | null; month: number | null; day: number | null } | null;
  seasonYear: number | null;
  episodes: number | null;
  genres: string[] | null;
  duration: number | null;
  format: string | null;
  streamingEpisodes: {url:string|null;site:string|null}[] | null;
  externalLinks: {url:string|null;type:string|null;isDisabled:boolean|null}[] | null;
};

const MEDIA_FIELDS = `
  id
  idMal
  title { english romaji }
  coverImage { extraLarge large }
  startDate { year month day }
  seasonYear
  episodes
  genres
  duration
  format
  streamingEpisodes { url site }
  externalLinks { url type isDisabled }
`;

const SEARCH_QUERY = `
  query SearchAnime($search: String!) {
    Page(perPage: 10) {
      media(search: $search, type: ANIME, isAdult: false) {
        ${MEDIA_FIELDS}
      }
    }
  }
`;

const DETAIL_QUERY = `
  query AnimeByMalId($idMal: Int!) {
    Media(idMal: $idMal, type: ANIME) {
      ${MEDIA_FIELDS}
    }
  }
`;

let nextAllowedAt = 0;

async function requestAniList(query: string, variables: Record<string, unknown>) {
  // Throttle server requests to reduce the risk of HTTP 429.
  const wait = Math.max(0, nextAllowedAt - Date.now());
  nextAllowedAt = Date.now() + wait + 1100;
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));

  let response: Response;
  try {
    response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(12000),
      cache: "no-store",
    });
  } catch {
    throw new Error("Cannot connect to AniList. Check your internet connection and try again.");
  }

  if (response.status === 429) {
    throw new Error("AniList rate limit reached. Please try again later.");
  }
  if (!response.ok) {
    throw new Error(`AniList is unavailable (HTTP ${response.status}).`);
  }

  const body = (await response.json()) as {
    data?: { Page?: { media?: AniListMedia[] }; Media?: AniListMedia | null };
    errors?: { message: string }[];
  };

  if (body.errors?.length) {
    throw new Error(body.errors[0].message);
  }

  return body.data;
}

function toDate(value: AniListMedia["startDate"]): string | null {
  if (!value?.year || !value.month || !value.day) return null;
  return [String(value.year), String(value.month).padStart(2, "0"), String(value.day).padStart(2, "0")].join("-");
}

function mapAnime(a: AniListMedia): JikanAnime {
  return {
    // AniList provides the original MyAnimeList ID when available.
    mal_id: a.idMal!,
    title: a.title.romaji || a.title.english || "Untitled",
    title_english: a.title.english,
    year: a.startDate?.year ?? a.seasonYear,
    episodes: a.episodes,
    images: {
      webp: { large_image_url: a.coverImage?.extraLarge || a.coverImage?.large || "" },
    },
    aired: { from: toDate(a.startDate) },
    genres: (a.genres ?? []).map((name) => ({ name })),
    duration_minutes: a.duration,
    anime_format: a.format,
    watch_url: [...(a.streamingEpisodes ?? []).map(e=>e.url), ...(a.externalLinks ?? []).filter(e=>e.type==='STREAMING'&&!e.isDisabled).map(e=>e.url)].find(u=>typeof u==='string'&&/^https:\/\//.test(u)) ?? null,
  };
}

export async function jikanGet(path: string): Promise<{ data: JikanAnime[] | JikanAnime }> {
  // Preserve the existing /api/jikan/search contract and mal_id database field.
  // Jikan public API was discontinued; AniList is the upstream catalog.
  const url = new URL(path, "https://internal.invalid");

  if (url.pathname.startsWith("/anime/")) {
    const id = Number(url.pathname.split("/").pop());
    if (!Number.isInteger(id) || id <= 0) throw new Error("Invalid anime ID");
    const result = await requestAniList(DETAIL_QUERY, { idMal: id });
    if (!result?.Media?.idMal) throw new Error("Anime not found on AniList");
    return { data: mapAnime(result.Media) };
  }

  const search = url.searchParams.get("q")?.trim();
  if (!search || search.length < 2) return { data: [] };
  const result = await requestAniList(SEARCH_QUERY, { search });
  // Entries without a MAL ID cannot use the current database duplicate-check model.
  const normalized = search.toLocaleLowerCase().trim();
  const relevance = (a: AniListMedia): number => {
    const names = [a.title.english, a.title.romaji]
      .filter((name): name is string => Boolean(name))
      .map((name) => name.toLocaleLowerCase().trim());
    if (names.some((name) => name === normalized)) return 0;
    if (names.some((name) => name.startsWith(normalized))) return 1;
    if (names.some((name) => name.includes(normalized))) return 2;
    return 3;
  };
  const items = (result?.Page?.media ?? [])
    .filter((a) => a.idMal != null)
    .sort((a, b) => relevance(a) - relevance(b))
    .map(mapAnime);
  return { data: items };
}

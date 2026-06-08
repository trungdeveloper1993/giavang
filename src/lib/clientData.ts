// Client-side data fetching so the app works as a fully static site
// (e.g. on GitHub Pages) without the Express backend.
//
// Order of preference for the Kim Môn price table:
//   1. Live fetch via a CORS proxy (fresh / real-time, when it works).
//   2. The build-time snapshot in gold-data.json, scraped server-side during
//      deployment with a real browser User-Agent (no CORS) so it MATCHES the
//      source site. This is what makes release prices line up with the link
//      even when the browser-side proxy is blocked.
//   3. A last-resort hard-coded reference table.

export interface WorldGold {
  worldGoldUsd: number;
  usdVnd: number;
  worldGoldVndLuong: number;
}

export interface GoldTableResult {
  table: string[][];
  isFallback: boolean;
}

interface Snapshot {
  table: string[][];
  isFallback: boolean;
  world: WorldGold;
  fetchedAt?: string;
}

const HARD_FALLBACK_TABLE: string[][] = [
  ["Cơ Cấu Loại Vàng", "Mua Vào", "Bán Ra"],
  ["Nhẫn Tròn Kim Môn 9999 (24K)", "14.200", "14.500"],
  ["Nhẫn Tròn Kim Môn BMT 999", "14.180", "14.480"],
  ["Trang sức KM 995", "14.070", "14.440"],
  ["Trang sức KM 999", "14.130", "14.480"],
  ["Trang sức KM 9999 (24K)", "14.150", "14.500"],
  ["Vàng 9999 Tự Do (Tham Khảo)", "14.100", "14.600"],
];

let snapshotPromise: Promise<Snapshot | null> | null = null;

/** Loads the build-time snapshot (gold-data.json), cached for the session. */
function loadSnapshot(): Promise<Snapshot | null> {
  if (!snapshotPromise) {
    const url = `${import.meta.env.BASE_URL}gold-data.json`;
    snapshotPromise = fetch(url, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => (data && Array.isArray(data.table) ? (data as Snapshot) : null))
      .catch(() => null);
  }
  return snapshotPromise;
}

function isValidTable(table: unknown): table is string[][] {
  return Array.isArray(table) && table.length > 0 && Array.isArray(table[0]) && table[0].length >= 3;
}

/**
 * Scrapes the Kim Môn price table from giavangmaothiet.com via a CORS proxy.
 * Falls back to the build-time snapshot (real prices), then a static table.
 */
export async function fetchGoldTable(): Promise<GoldTableResult> {
  // 1. Live, real-time fetch through a public CORS proxy.
  try {
    const targetUrl = "https://giavangmaothiet.com/gia-vang-kim-mon-hom-nay/";
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
    if (response.ok) {
      const json = await response.json();
      const html: string = json?.contents;
      if (html && typeof html === "string") {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const table = doc.querySelector("table");
        if (table) {
          const tableData: string[][] = [];
          table.querySelectorAll("tr").forEach((row) => {
            const rowData: string[] = [];
            row.querySelectorAll("td, th").forEach((cell) => {
              rowData.push((cell.textContent || "").trim().replace(/\s+/g, " "));
            });
            if (rowData.length > 0) tableData.push(rowData);
          });
          if (isValidTable(tableData)) {
            return { table: tableData, isFallback: false };
          }
        }
      }
    }
  } catch (error) {
    console.warn("Live proxy fetch failed, falling back to build snapshot:", error);
  }

  // 2. Build-time snapshot (scraped server-side, matches the source at deploy).
  const snap = await loadSnapshot();
  if (snap && isValidTable(snap.table)) {
    return { table: snap.table, isFallback: !!snap.isFallback };
  }

  // 3. Last-resort static reference.
  return { table: HARD_FALLBACK_TABLE, isFallback: true };
}

/**
 * Fetches the world gold spot price and USD/VND rate (browser side), falling
 * back to the build-time snapshot, then to static defaults.
 */
export async function fetchWorldGold(): Promise<WorldGold> {
  let worldGoldUsd: number | null = null;
  let usdVnd: number | null = null;

  try {
    const goldRes = await fetch("https://api.gold-api.com/price/XAU", {
      signal: AbortSignal.timeout(8000),
    });
    if (goldRes.ok) {
      const goldJson = await goldRes.json();
      if (goldJson?.price && !isNaN(goldJson.price)) worldGoldUsd = parseFloat(goldJson.price);
    }
  } catch (e) {
    console.warn("Failed to fetch world gold price", e);
  }

  try {
    const exRes = await fetch("https://api.exchangerate-api.com/v4/latest/USD", {
      signal: AbortSignal.timeout(8000),
    });
    if (exRes.ok) {
      const exJson = await exRes.json();
      if (exJson?.rates?.VND && !isNaN(exJson.rates.VND)) usdVnd = parseFloat(exJson.rates.VND);
    }
  } catch (e) {
    console.warn("Failed to fetch USD/VND rate", e);
  }

  // Fill any gaps from the build-time snapshot before using static defaults.
  if (worldGoldUsd === null || usdVnd === null) {
    const snap = await loadSnapshot();
    if (snap?.world) {
      if (worldGoldUsd === null) worldGoldUsd = snap.world.worldGoldUsd;
      if (usdVnd === null) usdVnd = snap.world.usdVnd;
    }
  }

  worldGoldUsd = worldGoldUsd ?? 2342.5;
  usdVnd = usdVnd ?? 25432;
  const worldGoldVndLuong = (worldGoldUsd * usdVnd / 0.83) / 1000000;

  return { worldGoldUsd, usdVnd, worldGoldVndLuong };
}

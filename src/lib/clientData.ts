// Client-side data fetching so the app works as a fully static site
// (e.g. on GitHub Pages) without the Express backend.
//
// In development / when running the Express server, the same logic lives in
// server.ts behind /api/gold and /api/world-gold. This module replicates it
// using a public CORS proxy so the bundled SPA can fetch the data directly
// from the browser.

export interface WorldGold {
  worldGoldUsd: number;
  usdVnd: number;
  worldGoldVndLuong: number;
}

export interface GoldTableResult {
  table: string[][];
  isFallback: boolean;
}

const FALLBACK_TABLE: string[][] = [
  ["Cơ Cấu Loại Vàng", "Mua Vào", "Bán Ra"],
  ["Nhẫn Tròn Kim Môn 9999 (24K)", "14.200", "14.500"],
  ["Nhẫn Tròn Kim Môn BMT 999", "14.180", "14.480"],
  ["Trang sức KM 995", "14.070", "14.440"],
  ["Trang sức KM 999", "14.130", "14.480"],
  ["Trang sức KM 9999 (24K)", "14.150", "14.500"],
  ["Vàng 9999 Tự Do (Tham Khảo)", "14.100", "14.600"],
];

/**
 * Scrapes the Kim Môn gold price table from giavangmaothiet.com via a CORS
 * proxy and parses the first HTML <table>. Falls back to a static reference
 * table on any error.
 */
export async function fetchGoldTable(): Promise<GoldTableResult> {
  try {
    const targetUrl = "https://giavangmaothiet.com/gia-vang-kim-mon-hom-nay/";
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error("CORS proxy failed");

    const json = await response.json();
    const html: string = json?.contents;
    if (!html || typeof html !== "string") throw new Error("Invalid proxy response");

    const doc = new DOMParser().parseFromString(html, "text/html");
    const table = doc.querySelector("table");
    if (!table) return { table: FALLBACK_TABLE, isFallback: true };

    const tableData: string[][] = [];
    table.querySelectorAll("tr").forEach((row) => {
      const rowData: string[] = [];
      row.querySelectorAll("td, th").forEach((cell) => {
        rowData.push((cell.textContent || "").trim().replace(/\s+/g, " "));
      });
      if (rowData.length > 0) tableData.push(rowData);
    });

    if (tableData.length === 0 || tableData[0].length < 3) {
      return { table: FALLBACK_TABLE, isFallback: true };
    }

    return { table: tableData, isFallback: false };
  } catch (error) {
    console.warn("Unable to scrape live Kim Môn table, using fallback:", error);
    return { table: FALLBACK_TABLE, isFallback: true };
  }
}

/**
 * Fetches the world gold spot price (USD/oz) and the USD/VND exchange rate,
 * then derives the world gold price in million VND per lượng.
 */
export async function fetchWorldGold(): Promise<WorldGold> {
  let worldGoldUsd = 2342.5;
  let usdVnd = 25432;

  try {
    const goldRes = await fetch("https://api.gold-api.com/price/XAU");
    if (goldRes.ok) {
      const goldJson = await goldRes.json();
      if (goldJson?.price && !isNaN(goldJson.price)) {
        worldGoldUsd = parseFloat(goldJson.price);
      }
    }
  } catch (e) {
    console.warn("Failed to fetch world gold price", e);
  }

  try {
    const exRes = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
    if (exRes.ok) {
      const exJson = await exRes.json();
      if (exJson?.rates?.VND && !isNaN(exJson.rates.VND)) {
        usdVnd = parseFloat(exJson.rates.VND);
      }
    }
  } catch (e) {
    console.warn("Failed to fetch USD/VND rate", e);
  }

  const worldGoldVndLuong = (worldGoldUsd * usdVnd / 0.83) / 1000000;

  return { worldGoldUsd, usdVnd, worldGoldVndLuong };
}

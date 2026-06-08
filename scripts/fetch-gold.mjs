// Build-time gold price scraper.
//
// Runs in Node (in CI / locally) where there is NO CORS restriction and we can
// send a real browser User-Agent, exactly like the Express dev server does. The
// result is written to public/gold-data.json so the static site (GitHub Pages)
// ships with real prices that match the source — instead of falling back to
// hard-coded numbers when a browser-side CORS proxy is blocked.

import { load } from "cheerio";
import { mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";

const SOURCE_URL = "https://giavangmaothiet.com/gia-vang-kim-mon-hom-nay/";
const OUT_FILE = "public/gold-data.json";

const FALLBACK_TABLE = [
  ["Cơ Cấu Loại Vàng", "Mua Vào", "Bán Ra"],
  ["Nhẫn Tròn Kim Môn 9999 (24K)", "14.200", "14.500"],
  ["Nhẫn Tròn Kim Môn BMT 999", "14.180", "14.480"],
  ["Trang sức KM 995", "14.070", "14.440"],
  ["Trang sức KM 999", "14.130", "14.480"],
  ["Trang sức KM 9999 (24K)", "14.150", "14.500"],
  ["Vàng 9999 Tự Do (Tham Khảo)", "14.100", "14.600"],
];

async function scrapeTable() {
  try {
    console.log(`Fetching live gold prices from ${SOURCE_URL} ...`);
    const response = await fetch(SOURCE_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    const $ = load(html);
    const tables = $("table");
    if (tables.length === 0) throw new Error("No <table> found in page");

    const tableData = [];
    $(tables.get(0))
      .find("tr")
      .each((_, row) => {
        const rowData = [];
        $(row)
          .find("td, th")
          .each((__, cell) => {
            rowData.push($(cell).text().trim().replace(/\s+/g, " "));
          });
        if (rowData.length > 0) tableData.push(rowData);
      });

    if (tableData.length === 0 || tableData[0].length < 3) {
      throw new Error("Parsed table has insufficient rows/cols");
    }

    console.log(`Scraped ${tableData.length} rows from source.`);
    return { table: tableData, isFallback: false };
  } catch (error) {
    console.warn("Scrape failed, using fallback table:", error.message);
    return { table: FALLBACK_TABLE, isFallback: true };
  }
}

async function fetchWorldGold() {
  let worldGoldUsd = 2342.5;
  let usdVnd = 25432;

  try {
    const res = await fetch("https://api.gold-api.com/price/XAU", {
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.price && !isNaN(json.price)) worldGoldUsd = parseFloat(json.price);
    }
  } catch (e) {
    console.warn("World gold fetch failed:", e.message);
  }

  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD", {
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.rates?.VND && !isNaN(json.rates.VND)) usdVnd = parseFloat(json.rates.VND);
    }
  } catch (e) {
    console.warn("Exchange rate fetch failed:", e.message);
  }

  const worldGoldVndLuong = (worldGoldUsd * usdVnd / 0.83) / 1000000;
  return { worldGoldUsd, usdVnd, worldGoldVndLuong };
}

async function main() {
  const [tableResult, world] = await Promise.all([scrapeTable(), fetchWorldGold()]);
  const data = {
    ...tableResult,
    world,
    fetchedAt: new Date().toISOString(),
  };

  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(data, null, 2));
  console.log(`Wrote ${OUT_FILE} (isFallback=${data.isFallback}).`);
}

main();

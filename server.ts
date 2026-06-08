import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { load } from "cheerio";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Serve static assets and API routes
  app.get("/api/gold", async (req, res) => {
    const FALLBACK_TABLE = [
      ["Cơ Cấu Loại Vàng", "Mua Vào", "Bán Ra"],
      ["Nhẫn Tròn Kim Môn 9999 (24K)", "14.200", "14.500"],
      ["Nhẫn Tròn Kim Môn BMT 999", "14.180", "14.480"],
      ["Trang sức KM 995", "14.070", "14.440"],
      ["Trang sức KM 999", "14.130", "14.480"],
      ["Trang sức KM 9999 (24K)", "14.150", "14.500"],
      ["Vàng 9999 Tự Do (Tham Khảo)", "14.100", "14.600"]
    ];

    try {
      console.log("Fetching live gold prices from giavangmaothiet.com...");
      const response = await fetch("https://giavangmaothiet.com/gia-vang-kim-mon-hom-nay/", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8"
        },
        signal: AbortSignal.timeout(8000) // 8 second timeout to switch to fallback fast
      });
      const html = await response.text();
      const $ = load(html);
      
      const tables = $("table");
      if (tables.length === 0) {
        console.log("No table found, using fallback table data.");
        return res.json({ success: true, table: FALLBACK_TABLE, isFallback: true });
      }
      
      const tableData: any[] = [];
      const firstTable = $(tables.get(0));
      const rows = firstTable.find("tr");
      
      rows.each((i, row) => {
        const cells = $(row).find("td, th");
        const rowData: string[] = [];
        cells.each((j, cell) => {
          rowData.push($(cell).text().trim().replace(/\s+/g, ' '));
        });
        if (rowData.length > 0) {
          tableData.push(rowData);
        }
      });

      if (tableData.length === 0 || tableData[0].length < 3) {
        console.log("Table parsed with insufficient rows/cols, using fallback table data.");
        return res.json({ success: true, table: FALLBACK_TABLE, isFallback: true });
      }
      
      res.json({ success: true, table: tableData, isFallback: false });
    } catch (error: any) {
      console.error("Error scraping gold rates, using fallback standard table:", error);
      res.json({ success: true, table: FALLBACK_TABLE, isFallback: true, error: error.message });
    }
  });

  // World gold and exchangerate proxy
  app.get("/api/world-gold", async (req, res) => {
    try {
      const goldRes = await fetch('https://api.gold-api.com/price/XAU');
      const goldJson = await goldRes.json();
      const exRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const exJson = await exRes.json();
      
      const worldGoldUsd = goldJson?.price ? parseFloat(goldJson.price) : 2342.50;
      const usdVnd = exJson?.rates?.VND ? parseFloat(exJson.rates.VND) : 25432;
      const convertedVndLuong = (worldGoldUsd * usdVnd / 0.83) / 1000000;

      res.json({
        worldGoldUsd,
        usdVnd,
        worldGoldVndLuong: convertedVndLuong
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

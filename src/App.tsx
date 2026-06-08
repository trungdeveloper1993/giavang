import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Coins,
  RefreshCw,
  Clock,
  Heart,
  Globe,
  TrendingUp,
  Info
} from 'lucide-react';
import { fetchGoldTable, fetchWorldGold } from './lib/clientData';

export default function App() {
  const [goldTable, setGoldTable] = useState<string[][]>([]);
  const [worldGold, setWorldGold] = useState<{ worldGoldUsd: number; usdVnd: number; worldGoldVndLuong: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [updatedTime, setUpdatedTime] = useState<string>('');
  const [errorHeader, setErrorHeader] = useState<string>('');

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    
    try {
      // 1. Fetch scraped Kim Mon table (client-side, works on static hosting)
      const goldData = await fetchGoldTable();
      if (goldData && goldData.table) {
        setGoldTable(goldData.table);
        setIsFallback(!!goldData.isFallback);
      } else {
        throw new Error("Could not fetch gold table data");
      }

      // 2. Fetch world gold and exchange rates
      const worldData = await fetchWorldGold();
      if (worldData) {
        setWorldGold(worldData);
      }

      const now = new Date();
      setUpdatedTime(
        now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + 
        ' ' + 
        now.toLocaleDateString('vi-VN')
      );
      setErrorHeader('');
    } catch (err: any) {
      console.error(err);
      setErrorHeader('Đang sử dụng dữ liệu tham chiếu ngoại tuyến.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData(true);
    }, 60000); // refresh every minute

    return () => clearInterval(interval);
  }, []);

  // Split headers and rows
  const tableHeaders = goldTable.length > 0 ? goldTable[0] : ["LOẠI VÀNG", "MUA VÀO", "BÁN RA"];
  const tableRows = goldTable.length > 1 ? goldTable.slice(1) : [];

  // Helper to parse price string (e.g., "13.600" -> 13.6 Million VND per chỉ)
  const getPriceInMillionPerChi = (priceStr: string): number => {
    if (!priceStr) return 0;
    const cleaned = priceStr.replace(/[^0-9]/g, '');
    if (!cleaned) return 0;
    const numValue = parseInt(cleaned, 10);
    if (numValue > 100000) {
      return numValue / 1000000;
    }
    return numValue / 1000;
  };

  // Find 9999 gold reference item
  const vn9999Item = useMemo(() => {
    if (tableRows.length === 0) return null;
    const found = tableRows.find(row => row[0] && (row[0].includes('9999') || row[0].includes('24K')));
    return found || tableRows[0];
  }, [tableRows]);

  // Compute premium analysis
  const spreadAnalysis = useMemo(() => {
    if (!worldGold || !vn9999Item) return null;
    
    const vnName = vn9999Item[0];
    const vnBuyRaw = vn9999Item[1];
    const vnSellRaw = vn9999Item[2];
    
    const vnBuyChi = getPriceInMillionPerChi(vnBuyRaw);
    const vnSellChi = getPriceInMillionPerChi(vnSellRaw);
    
    // World gold per chỉ is worldGoldVndLuong / 10
    const worldChi = worldGold.worldGoldVndLuong / 10;
    
    const buyDiff = vnBuyChi - worldChi;
    const sellDiff = vnSellChi - worldChi;
    
    return {
      vnName,
      vnBuyChi,
      vnSellChi,
      worldChi,
      buyDiff,
      sellDiff
    };
  }, [worldGold, vn9999Item]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col">
      {/* Top Banner / Sync Time */}
      <div className="w-full bg-slate-900 text-slate-300 text-[11px] py-1.5 px-6 flex justify-between items-center shadow-inner flex-wrap gap-2 shrink-0 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold tracking-wide uppercase text-slate-200">
            {isFallback ? 'ĐỒNG BỘ THỜI GIAN THỰC ĐẠI LÝ' : 'ĐỒNG BỘ TRỰC TIẾP GIAVANGMAOTHIET.COM'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 opacity-90">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Cập nhật: {updatedTime || 'Đang kết nối...'}
          </span>
          {worldGold && (
            <span className="text-amber-400 font-medium hidden sm:inline">
              USD/VND: {worldGold.usdVnd.toLocaleString('vi-VN')}đ
            </span>
          )}
        </div>
      </div>

      {/* Main Header / Title Navbar */}
      <header className="h-20 flex items-center justify-between px-6 sm:px-12 bg-white border-b border-slate-200 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-md shadow-red-100 shrink-0">
            <Heart className="text-white w-6 h-6 fill-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none flex items-center gap-2">
              Tôi Yêu Vàng <span className="text-red-500">❤️</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">
              Hello, Trang web này tham khảo giá vàng miễn phí nhé {'<3'}
            </p>
          </div>
        </div>

        <button
          onClick={() => loadData()}
          disabled={isLoading || isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer disabled:opacity-50"
          title="Tải lại bảng giá"
        >
          <RefreshCw className={`w-4 h-4 ${(isLoading || isRefreshing) ? 'animate-spin text-red-500' : ''}`} />
          <span>Làm mới</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 lg:p-12 max-w-5xl mx-auto w-full flex flex-col gap-8 justify-center">

        {/* World Gold Converted Panel & Spread Analysis */}
        {worldGold && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between gap-6"
            >
              <div className="space-y-1 text-left">
                <span className="text-[10px] bg-sky-50 text-sky-600 px-2 py-0.5 rounded font-bold uppercase tracking-widest inline-flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Tham Chiếu Vàng Thế Giới
                </span>
                <h2 className="text-lg font-extrabold text-slate-800 mt-1">
                  Vàng Thế Giới Quy Đổi
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tính theo công thức: (Giá thế giới USD <strong className="text-slate-700">${worldGold.worldGoldUsd.toLocaleString('en-US')}/oz</strong> × tỷ giá <strong className="text-slate-700">{worldGold.usdVnd.toLocaleString('vi-VN')}đ</strong>) ÷ <strong className="text-sky-600 font-bold">0.83</strong>
                </p>
              </div>

              <div className="flex flex-col items-start bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Giá quy đổi (1 chỉ)</span>
                <span className="text-2xl font-black text-slate-950 tracking-tight font-mono">
                  {Math.round((worldGold.worldGoldVndLuong / 10) * 1000000).toLocaleString('vi-VN')} đ
                </span>
                <span className="text-[10px] text-sky-600 font-bold mt-1">
                  Đồng bộ với bảng giá vàng Kim Môn
                </span>
              </div>
            </motion.div>

            {spreadAnalysis && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between gap-4"
              >
                <div className="space-y-1">
                  <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold uppercase tracking-widest inline-flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-500" /> Sức Nóng Thị Trường
                  </span>
                  <h2 className="text-lg font-extrabold text-slate-800 mt-1">
                    Chênh Lệch Vàng Nội - Ngoại
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Mức cao hơn/thấp hơn của dòng vàng nguyên liệu Nhẫn 9999 ({spreadAnalysis.vnName.split(' ')[0]}) so với thế giới quy đổi.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Chiều Mua Vào</span>
                    <span className={`text-sm lg:text-base font-extrabold font-mono mt-1 ${spreadAnalysis.buyDiff >= 0 ? "text-emerald-600" : "text-amber-600"}`}>
                      {spreadAnalysis.buyDiff >= 0 ? "Cao hơn +" : "Thấp hơn "}{Math.round(Math.abs(spreadAnalysis.buyDiff) * 1000000).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  
                  <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Chiều Bán Ra</span>
                    <span className={`text-sm lg:text-base font-extrabold font-mono mt-1 ${spreadAnalysis.sellDiff >= 0 ? "text-red-500" : "text-amber-600"}`}>
                      {spreadAnalysis.sellDiff >= 0 ? "Cao hơn +" : "Thấp hơn "}{Math.round(Math.abs(spreadAnalysis.sellDiff) * 1000000).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Main Golden Price Table Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-md flex flex-col overflow-hidden"
        >
          {/* Header of Table Container */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center flex-wrap gap-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" /> Bảng Giá Vàng Kim Môn
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Nguồn trực tiếp từ đại lý vàng Kim Môn Hải Dương
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
                Đơn vị: Nghìn đồng (k)
              </span>
            </div>
          </div>

          {/* Scraped Content Visualizer */}
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />
              <p className="text-slate-400 text-xs font-semibold">Đang cập nhật trực tuyến bảng giá vàng Kim Môn...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left my-2">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-extrabold text-[11px] uppercase tracking-wider bg-slate-50/30">
                    <th className="px-6 py-4 sm:px-8 text-left">{tableHeaders[0] || "LOẠI VÀNG"}</th>
                    <th className="px-6 py-4 sm:px-8 text-right">{tableHeaders[1] || "MUA VÀO"}</th>
                    <th className="px-6 py-4 sm:px-8 text-right text-red-500 font-black">{tableHeaders[2] || "BÁN RA"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {tableRows.map((row, index) => {
                    if (row.length < 2) return null;
                    const rowBuyChi = getPriceInMillionPerChi(row[1]);
                    const rowSellChi = getPriceInMillionPerChi(row[2]);
                    
                    const buyDiff = worldGold && rowBuyChi > 0 ? (rowBuyChi - (worldGold.worldGoldVndLuong / 10)) : null;
                    const sellDiff = worldGold && rowSellChi > 0 ? (rowSellChi - (worldGold.worldGoldVndLuong / 10)) : null;

                    return (
                      <tr 
                        key={index}
                        className="hover:bg-amber-500/[0.02] transition-colors"
                      >
                        {/* Name Column */}
                        <td className="px-6 py-5 sm:px-8 font-semibold text-slate-800">
                          <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                            <span>{row[0]}</span>
                          </div>
                        </td>
                        {/* Buy Price Column */}
                        <td className="px-6 py-5 sm:px-8 text-right font-mono font-bold text-slate-700 text-base">
                          <div>{row[1] || "-"}</div>
                          {buyDiff !== null && (
                            <div className={`text-[10px] font-semibold font-sans mt-1 inline-block px-1.5 py-0.5 rounded ${buyDiff >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'}`}>
                              {buyDiff >= 0 ? '+' : ''}{Math.round(buyDiff * 1000000).toLocaleString('vi-VN')}đ/chỉ
                            </div>
                          )}
                        </td>
                        {/* Sell Price Column */}
                        <td className="px-6 py-5 sm:px-8 text-right font-mono font-black text-red-600 text-lg">
                          <div>{row[2] || "-"}</div>
                          {sellDiff !== null && (
                            <div className={`text-[10px] font-semibold font-sans mt-1 inline-block px-1.5 py-0.5 rounded ${sellDiff >= 0 ? 'text-red-700 bg-red-50' : 'text-amber-700 bg-amber-50'}`}>
                              {sellDiff >= 0 ? '+' : ''}{Math.round(sellDiff * 1000000).toLocaleString('vi-VN')}đ/chỉ
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Reference Notice Badge */}
          {errorHeader && (
            <div className="p-4 bg-red-50 border-t border-red-100 text-xs text-red-700 font-semibold flex items-center gap-2">
              <Info className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorHeader}</span>
            </div>
          )}
        </motion.div>
      </main>

      {/* Simplified, elegant, static footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-6 mt-auto text-slate-500 text-xs">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-semibold text-slate-600 flex items-center gap-1.5">
            Tôi Yêu Vàng ❤️ <span className="text-slate-400 font-normal">© 2026. Tất cả dữ liệu đồng bộ tự động.</span>
          </p>
          <p className="text-[11px] text-slate-400 text-center sm:text-right">
            Thông tin niêm yết từ nguồn giavangmaothiet.com chỉ mang tính chất tham khảo.
          </p>
        </div>
      </footer>
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RefreshCw,
  Clock,
  Heart,
  Globe,
  Plus,
  Save,
  Pencil,
  Trash2,
  Wallet,
  Scale,
  Coins,
  BookOpen,
  X,
} from 'lucide-react';
import { fetchWorldGold } from './lib/clientData';

interface JournalEntry {
  id: string;
  quantity: number; // số chỉ
  price: number; // giá mua tại thời điểm đó (VND / chỉ)
  date: string; // ngày mua hiển thị
  createdAt: number;
}

const STORAGE_KEY = 'gold-purchase-journal';

const fmtVnd = (n: number) => Math.round(n).toLocaleString('vi-VN');
const fmtQty = (n: number) =>
  n.toLocaleString('vi-VN', { maximumFractionDigits: 3 });

export default function App() {
  const [worldGold, setWorldGold] = useState<{
    worldGoldUsd: number;
    usdVnd: number;
    worldGoldVndLuong: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatedTime, setUpdatedTime] = useState<string>('');

  // Nhật ký mua vàng (lưu trên trình duyệt)
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as JournalEntry[]) : [];
    } catch {
      return [];
    }
  });

  // Form state
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const worldData = await fetchWorldGold();
      if (worldData) setWorldGold(worldData);
      const now = new Date();
      setUpdatedTime(
        now.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) +
          ' ' +
          now.toLocaleDateString('vi-VN')
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 60000);
    return () => clearInterval(interval);
  }, []);

  // Lưu nhật ký xuống localStorage mỗi khi thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      /* ignore quota errors */
    }
  }, [entries]);

  // Giá vàng thế giới quy đổi cho 1 chỉ (VND)
  const convertedChiVnd = worldGold
    ? Math.round((worldGold.worldGoldVndLuong / 10) * 1000000)
    : 0;

  const qtyNum = parseFloat(qty) || 0;
  const priceNum = parseFloat(price) || 0;
  const formAmount = qtyNum * priceNum;

  const summary = useMemo(() => {
    const totalQty = entries.reduce((s, e) => s + e.quantity, 0);
    const totalMoney = entries.reduce((s, e) => s + e.quantity * e.price, 0);
    const avgPrice = totalQty > 0 ? totalMoney / totalQty : 0;
    return { totalQty, totalMoney, avgPrice, count: entries.length };
  }, [entries]);

  const resetForm = () => {
    setQty('');
    setPrice('');
    setEditingId(null);
  };

  const handleSave = () => {
    if (qtyNum <= 0 || priceNum <= 0) return;
    if (editingId) {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === editingId ? { ...e, quantity: qtyNum, price: priceNum } : e
        )
      );
    } else {
      const now = new Date();
      const id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : String(now.getTime());
      setEntries((prev) => [
        {
          id,
          quantity: qtyNum,
          price: priceNum,
          date: now.toLocaleDateString('vi-VN'),
          createdAt: now.getTime(),
        },
        ...prev,
      ]);
    }
    resetForm();
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setQty(String(entry.quantity));
    setPrice(String(entry.price));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Xóa mục nhật ký mua vàng này?')) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (editingId === id) resetForm();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col">
      {/* Top Banner / Sync Time */}
      <div className="w-full bg-slate-900 text-slate-300 text-[11px] py-1.5 px-6 flex justify-between items-center shadow-inner flex-wrap gap-2 shrink-0 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold tracking-wide uppercase text-slate-200">
            NHẬT KÝ MUA VÀNG CÁ NHÂN
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
              Nhật ký mua vàng & theo dõi giá vốn
            </p>
          </div>
        </div>

        <button
          onClick={() => loadData()}
          disabled={isLoading || isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer disabled:opacity-50"
          title="Cập nhật giá vàng thế giới"
        >
          <RefreshCw
            className={`w-4 h-4 ${
              isLoading || isRefreshing ? 'animate-spin text-red-500' : ''
            }`}
          />
          <span>Làm mới</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 lg:p-12 max-w-3xl mx-auto w-full flex flex-col gap-8">
        {/* World Gold Converted Panel */}
        {worldGold && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5"
          >
            <div className="space-y-1 text-left">
              <span className="text-[10px] bg-sky-50 text-sky-600 px-2 py-0.5 rounded font-bold uppercase tracking-widest inline-flex items-center gap-1">
                <Globe className="w-3 h-3" /> Tham Chiếu Vàng Thế Giới
              </span>
              <h2 className="text-lg font-extrabold text-slate-800 mt-1">
                Vàng Thế Giới Quy Đổi
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                (Giá thế giới{' '}
                <strong className="text-slate-700">
                  ${worldGold.worldGoldUsd.toLocaleString('en-US')}/oz
                </strong>{' '}
                × tỷ giá{' '}
                <strong className="text-slate-700">
                  {worldGold.usdVnd.toLocaleString('vi-VN')}đ
                </strong>
                ) ÷ <strong className="text-sky-600 font-bold">0.83</strong>
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 shrink-0">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                Giá quy đổi (1 chỉ)
              </span>
              <span className="text-2xl font-black text-slate-950 tracking-tight font-mono">
                {fmtVnd(convertedChiVnd)} đ
              </span>
              <button
                onClick={() => setPrice(String(convertedChiVnd))}
                className="text-[10px] text-sky-600 font-bold mt-1 hover:underline cursor-pointer"
              >
                Dùng giá này để ghi nhật ký →
              </button>
            </div>
          </motion.div>
        )}

        {/* Form ghi nhật ký */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-500" />
              {editingId ? 'Chỉnh Sửa Lần Mua' : 'Ghi Nhật Ký Mua Vàng'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Nhập số lượng (chỉ) và giá vàng tại thời điểm mua.
            </p>
          </div>

          <div className="p-6 flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Số lượng (chỉ)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="Ví dụ: 2"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Giá vàng (đ / chỉ)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Ví dụ: 7500000"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Thành tiền tạm tính */}
            <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Thành tiền
              </span>
              <span className="text-xl font-black font-mono text-amber-700">
                {fmtVnd(formAmount)} đ
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={qtyNum <= 0 || priceNum <= 0}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-red-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Cập nhật' : 'Lưu vào nhật ký'}
              </button>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="flex items-center justify-center gap-1.5 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-bold transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" /> Hủy
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tổng kết */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-amber-500" /> Tổng số lượng
            </span>
            <span className="text-2xl font-black font-mono text-slate-900">
              {fmtQty(summary.totalQty)}{' '}
              <span className="text-sm font-bold text-slate-400">chỉ</span>
            </span>
            <span className="text-[11px] text-slate-400">
              {summary.count} lần mua
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-500" /> Giá vốn TB
            </span>
            <span className="text-2xl font-black font-mono text-slate-900">
              {fmtVnd(summary.avgPrice)}
            </span>
            <span className="text-[11px] text-slate-400">đồng / chỉ</span>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-5 shadow-md shadow-red-100 flex flex-col gap-1 text-white">
            <span className="text-[10px] uppercase font-black tracking-wider flex items-center gap-1.5 text-red-100">
              <Wallet className="w-3.5 h-3.5" /> Tổng tiền đã mua
            </span>
            <span className="text-2xl font-black font-mono">
              {fmtVnd(summary.totalMoney)}
            </span>
            <span className="text-[11px] text-red-100">đồng</span>
          </div>
        </div>

        {/* Danh sách nhật ký */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" /> Nhật Ký Đã Mua
            </h3>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
              {summary.count} mục
            </span>
          </div>

          {entries.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-center px-6">
              <BookOpen className="w-10 h-10 text-slate-200" />
              <p className="text-slate-400 text-sm font-semibold">
                Chưa có lần mua nào.
              </p>
              <p className="text-slate-300 text-xs">
                Nhập số lượng và giá ở trên rồi nhấn "Lưu vào nhật ký".
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              <AnimatePresence initial={false}>
                {entries.map((entry) => (
                  <motion.li
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`px-6 py-4 flex items-center justify-between gap-4 ${
                      editingId === entry.id ? 'bg-amber-50/60' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-black text-slate-900 text-base">
                          {fmtQty(entry.quantity)} chỉ
                        </span>
                        <span className="text-slate-300">×</span>
                        <span className="font-mono font-bold text-slate-600 text-sm">
                          {fmtVnd(entry.price)}đ
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> {entry.date}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono font-black text-amber-700 text-base whitespace-nowrap">
                        {fmtVnd(entry.quantity * entry.price)}đ
                      </span>
                      <button
                        onClick={() => handleEdit(entry)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-sky-100 text-slate-500 hover:text-sky-600 transition cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 transition cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-6 mt-auto text-slate-500 text-xs">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-semibold text-slate-600 flex items-center gap-1.5">
            Tôi Yêu Vàng ❤️{' '}
            <span className="text-slate-400 font-normal">
              © 2026. Nhật ký lưu ngay trên trình duyệt của bạn.
            </span>
          </p>
          <p className="text-[11px] text-slate-400 text-center sm:text-right">
            Giá vàng thế giới chỉ mang tính chất tham khảo.
          </p>
        </div>
      </footer>
    </div>
  );
}

# Tôi Yêu Vàng ❤️ — Nhật Ký Mua Vàng

Ứng dụng web tĩnh: ghi nhật ký mua vàng, tính giá vốn trung bình, lãi/lỗ so với
giá vàng thế giới quy đổi. Dữ liệu lưu trên trình duyệt (localStorage); có thể
sao lưu / khôi phục bằng tệp `.json`.

## Phát triển

```bash
npm install
npm run dev      # chạy dev server (kèm scrape giá thế giới)
npm run build    # build production
```

Deploy tự động lên GitHub Pages qua `.github/workflows/deploy.yml` (push lên
nhánh `main`).

## Sao lưu & Khôi phục

Nhật ký lưu trong `localStorage` của trình duyệt. Dùng nút **Sao lưu** để xuất
ra tệp `.json` (có thể lưu vào Tệp / iCloud Drive / Google Drive…) và **Khôi
phục** để nạp lại trên máy khác.

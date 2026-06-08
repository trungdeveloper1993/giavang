# Tôi Yêu Vàng ❤️ — Nhật Ký Mua Vàng

Ứng dụng web tĩnh: ghi nhật ký mua vàng, tính giá vốn trung bình, lãi/lỗ so với
giá vàng thế giới quy đổi. Dữ liệu lưu trên trình duyệt (localStorage) và có thể
đồng bộ iCloud trên thiết bị Apple.

## Phát triển

```bash
npm install
npm run dev      # chạy dev server (kèm scrape giá thế giới)
npm run build    # build production
```

Deploy tự động lên GitHub Pages qua `.github/workflows/deploy.yml` (push lên
nhánh `main`).

## Đồng bộ iCloud vĩnh viễn (CloudKit JS) — tùy chọn

Nút đồng bộ iCloud chỉ hiện trên **iPhone / iPad / Mac**. Để bật lưu vĩnh viễn &
tự đồng bộ mọi thiết bị, cần tài khoản **Apple Developer** và cấu hình CloudKit:

1. **Tạo iCloud Container**: [developer.apple.com](https://developer.apple.com)
   → *Certificates, Identifiers & Profiles* → *Identifiers* → tạo *iCloud
   Container*, ví dụ `iCloud.com.<tên-bạn>.giavang`.
2. **Tạo API Token**: [CloudKit Dashboard](https://icloud.developer.apple.com)
   → chọn container → *Tokens & Keys* → *API Token*. Token web này an toàn để
   nhúng vào code client. Thêm domain của bạn (vd
   `https://trungdeveloper1993.github.io`) vào *Sign in Callback*.
3. **Điền cấu hình** trong [`src/lib/cloudkit.ts`](src/lib/cloudkit.ts):
   ```ts
   export const CONTAINER_IDENTIFIER = 'iCloud.com.<tên-bạn>.giavang';
   export const API_TOKEN = '<API_TOKEN_CỦA_BẠN>';
   export const CLOUDKIT_ENV = 'production';
   ```
4. Sau lần lưu đầu tiên, vào CloudKit Dashboard bấm **Deploy Schema to
   Production**.

Khi chưa cấu hình, ứng dụng vẫn hoạt động bình thường và cho phép **sao lưu /
khôi phục thủ công** qua iCloud Drive (Tệp).

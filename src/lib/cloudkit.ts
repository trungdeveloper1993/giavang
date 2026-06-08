// CloudKit JS wrapper — đồng bộ Nhật Ký Mua Vàng vào iCloud riêng tư của người dùng.
//
// ───────────────────────────────────────────────────────────────────────────
// CÁCH LẤY CONTAINER ID + API TOKEN (cần tài khoản Apple Developer):
//   1. Vào https://developer.apple.com → Certificates, Identifiers & Profiles
//      → Identifiers → tạo một "iCloud Container", ví dụ:
//         iCloud.com.<tên-bạn>.giavang
//   2. Vào CloudKit Dashboard (https://icloud.developer.apple.com) → chọn
//      container vừa tạo → Tokens & Keys → tạo "API Token".
//      - Token này DÙNG CHO WEB và AN TOÀN khi nhúng vào code client.
//      - Ở phần "Sign in Callback" thêm domain của bạn
//        (vd: https://trungdeveloper1993.github.io).
//   3. Dán CONTAINER_IDENTIFIER và API_TOKEN bên dưới.
//   4. Ở môi trường production, nhớ "Deploy Schema to Production" trong
//      CloudKit Dashboard sau lần lưu đầu tiên.
// ───────────────────────────────────────────────────────────────────────────
//
// Dữ liệu lưu ở PRIVATE database nên mỗi người chỉ thấy nhật ký của chính mình.

export const CONTAINER_IDENTIFIER = 'iCloud.com.example.giavang'; // <-- THAY
export const API_TOKEN = ''; // <-- DÁN API TOKEN CLOUDKIT VÀO ĐÂY
export const CLOUDKIT_ENV: 'development' | 'production' = 'production';

export const isCloudKitConfigured = (): boolean =>
  !!API_TOKEN &&
  !!CONTAINER_IDENTIFIER &&
  !CONTAINER_IDENTIFIER.includes('example');

const RECORD_TYPE = 'GoldJournal';
const RECORD_NAME = 'mainGoldJournal';
const CK_SCRIPT_URL = 'https://cdn.apple-cloudkit.com/ck/2/cloudkit.js';

declare global {
  interface Window {
    CloudKit?: any;
  }
}

export interface CKUser {
  userRecordName: string;
}

let container: any = null;
let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (typeof window !== 'undefined' && window.CloudKit) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = CK_SCRIPT_URL;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Không tải được CloudKit JS'));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

async function getContainer(): Promise<any> {
  await loadScript();
  const CloudKit = window.CloudKit;
  if (!container) {
    CloudKit.configure({
      containers: [
        {
          containerIdentifier: CONTAINER_IDENTIFIER,
          apiTokenAuth: { apiToken: API_TOKEN, persist: true },
          environment: CLOUDKIT_ENV,
        },
      ],
    });
    container = CloudKit.getDefaultContainer();
  }
  return container;
}

/** Khởi tạo và kiểm tra trạng thái đăng nhập hiện tại. */
export async function setUpAuth(): Promise<CKUser | null> {
  const c = await getContainer();
  const userIdentity = await c.setUpAuth();
  return userIdentity ? { userRecordName: userIdentity.userRecordName } : null;
}

/** Resolve khi người dùng đăng nhập (sau khi bấm nút iCloud do CloudKit render). */
export async function whenUserSignsIn(): Promise<CKUser | null> {
  const c = await getContainer();
  const userIdentity = await c.whenUserSignsIn();
  return userIdentity ? { userRecordName: userIdentity.userRecordName } : null;
}

/** Resolve khi người dùng đăng xuất. */
export async function whenUserSignsOut(): Promise<void> {
  const c = await getContainer();
  await c.whenUserSignsOut();
}

async function fetchRecord(): Promise<any | null> {
  try {
    const c = await getContainer();
    const db = c.privateCloudDatabase;
    const resp = await db.performQuery({ recordType: RECORD_TYPE });
    if (resp.hasErrors) return null;
    const records: any[] = resp.records || [];
    return records.find((r) => r.recordName === RECORD_NAME) || records[0] || null;
  } catch {
    return null;
  }
}

/** Tải nhật ký từ iCloud. Trả về null nếu chưa có gì. */
export async function fetchJournal<T = unknown>(): Promise<T[] | null> {
  const rec = await fetchRecord();
  const payload = rec?.fields?.payload?.value;
  if (!payload) return null;
  try {
    const parsed = JSON.parse(payload);
    return Array.isArray(parsed) ? (parsed as T[]) : null;
  } catch {
    return null;
  }
}

/** Lưu (ghi đè) toàn bộ nhật ký lên iCloud. */
export async function saveJournal(entries: unknown[]): Promise<void> {
  const c = await getContainer();
  const db = c.privateCloudDatabase;
  const existing = await fetchRecord();
  const record: any = {
    recordType: RECORD_TYPE,
    recordName: RECORD_NAME,
    fields: { payload: { value: JSON.stringify(entries) } },
  };
  if (existing?.recordChangeTag) record.recordChangeTag = existing.recordChangeTag;
  const resp = await db.saveRecords([record]);
  if (resp.hasErrors && resp.errors?.length) throw resp.errors[0];
}

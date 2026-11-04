# Cấu trúc dự án & phân chia theo từng lần git

> File này mô tả **toàn bộ** cây thư mục của dự án, dù ở PHẦN 1 repo mới chỉ có
> khung sườn. Ký hiệu `[Pn]` = phần git sẽ đưa file/thư mục đó lên.
> Log chi tiết từng lần đẩy: `E:\DATN\tien_do_git\LOG_TIEN_DO.md`.

## 1. Cây thư mục

```
E:\DATN\FullStack-JS\
│
├── .gitignore                       [P1] ✅  Loại node_modules, build, .env, backup
├── README.md                        [P1] ✅  Tổng quan dự án
├── CAU_TRUC_DU_AN.md                [P1] ✅  File này
├── CONFIG_TEMPLATE.md               [P1] ✅  Biến môi trường (chỉ tên biến, không giá trị)
├── testdb.sql                       [P1] ✅  Dump MySQL 24 MB — 14 bảng
│
├── NodeJS/                                   BACKEND (Express :8086)
│   ├── package.json                 [P1] ✅  scripts: start / optimize-db / test
│   ├── package-lock.json            [P1] ✅
│   ├── .babelrc                     [P1] ✅
│   ├── .gitignore                   [P1] ✅
│   ├── .env                         🚫 KHÔNG ĐẨY (chứa App Password)
│   ├── .env.example                 🚫 KHÔNG ĐẨY (dùng CONFIG_TEMPLATE.md thay thế)
│   ├── _*.js                        [P7] ⏳  Script kiểm tra nội bộ (_check, _verify_api, ...)
│   ├── scripts/                     [P7] ⏳  createAdmin, optimizeDatabase, initHomepageCms
│   │
│   └── src/
│       ├── server.js                [P1] ✅  Khởi động Express + CORS + bodyParser
│       ├── config/
│       │   ├── connectDB.js         [P1] ✅  Kết nối MySQL
│       │   ├── viewEngine.js        [P1] ✅  Cấu hình EJS
│       │   └── config.json          [P2] ⏳  Thông tin kết nối DB (cần rà soát trước khi đẩy)
│       ├── route/
│       │   └── web.js               [P1] ✅  Bản đồ toàn bộ API (~45 endpoint)
│       ├── models/                  [P1] ✅  14 file = lược đồ bảng
│       │   ├── index.js                      (nạp model + khai báo quan hệ)
│       │   ├── user.js  booking.js  schedule.js  doctor-info.js
│       │   ├── allcode.js  markdown.js  specialty.js  clinic.js
│       │   ├── handbook.js  history.js  doctor-clinic-specialty.js
│       │   └── homepage-settings.js  service-item.js
│       ├── migrations/              [P1] ✅  15 file = lịch sử thay đổi schema
│       ├── seeders/                 [P2] ⏳  seeder-user.js
│       ├── controllers/             [P2] ⏳  8 file (user, doctor, patient, specialty, clinic, handbook, homepage, home)
│       ├── services/                [P2] ⏳  9 file (user, doctor, patient, email, specialty, clinic, handbook, homepage, CRUD)
│       ├── utils/                   [P2] ⏳  imageHelper.js, zaloHelper.js
│       ├── public/                  [P7] ⏳  tài nguyên tĩnh backend
│       └── views/                   [P7] ⏳  trang EJS demo CRUD
│
└── Frontend-React.JS/                        FRONTEND (React 17 :3000)
    ├── package.json                 [P1] ✅  CRA4, React 17, Redux, SCSS
    ├── package-lock.json            [P1] ✅
    ├── .npmrc                       [P1] ✅  legacy-peer-deps=true
    ├── .gitignore                   [P1] ✅
    ├── .env                         🚫 KHÔNG ĐẨY (REACT_APP_BACKEND_URL)
    ├── _*.js                        [P7] ⏳  _check.js, _deps.js, script sinh comment
    ├── public/
    │   ├── index.html               [P1] ✅  font, title, meta
    │   ├── manifest.json            [P1] ✅
    │   └── favicon*.ico             [P7] ⏳
    │
    └── src/
        ├── index.js                 [P1] ✅  Điểm khởi động React + Provider
        ├── axios.js                 [P1] ✅  baseURL + interceptor bóc response.data
        ├── redux.js                 [P1] ✅  Cấu hình store (redux-persist)
        ├── serviceWorker.js         [P1] ✅
        ├── utils/
        │   ├── index.js             [P1] ✅
        │   ├── constant.js          [P1] ✅  path, USER_ROLE, CRUD_ACTIONS
        │   ├── CommonUtils.js       [P4] ⏳
        │   ├── KeyCodeUtils.js      [P4] ⏳
        │   ├── ToastUtil.js         [P4] ⏳
        │   └── facebookSdk.js       [P4] ⏳
        ├── store/
        │   ├── actions/
        │   │   ├── actionTypes.js   [P1] ✅
        │   │   ├── index.js         [P3] ⏳
        │   │   ├── adminActions.js  [P3] ⏳
        │   │   ├── appActions.js    [P3] ⏳
        │   │   └── userActions.js   [P3] ⏳
        │   └── reducers/
        │       ├── rootReducer.js   [P1] ✅
        │       ├── adminReducer.js  [P3] ⏳
        │       ├── appReducer.js    [P3] ⏳
        │       └── userReducer.js   [P3] ⏳
        ├── routes/
        │   ├── Home.js              [P1] ✅  Route công khai
        │   ├── System.js            [P1] ✅  Route quản trị
        │   └── Doctor.js            [P1] ✅  Route bác sĩ
        ├── services/
        │   └── userService.js       [P3] ⏳  42 hàm gọi API
        ├── components/              [P4] ⏳  ConfirmDialog, CustomToast, CustomScrollbars, Navigator, Input/
        ├── containers/
        │   ├── App.js               [P5] ⏳
        │   ├── Auth/                [P5] ⏳  Login, Register
        │   ├── Header/              [P5] ⏳  Header, menuApp
        │   ├── HomePage/            [P5] ⏳  HomeHeader, ServiceIcons, các Section
        │   ├── Patient/             [P5] ⏳  DetailDoctor, BookingModal, VerifyEmail, ...
        │   └── System/              [P6] ⏳  Admin/ + Doctor/ (Manage*, Table*, RemedyModal)
        ├── hoc/                     [P4] ⏳
        ├── assets/                  [P7] ⏳
        └── styles/                  [P7] ⏳  _variables.scss + 44 file SCSS
```

## 2. Các thư mục bị loại khỏi git

| Đường dẫn | Lý do |
|---|---|
| `**/node_modules/` | Phụ thuộc cài bằng `npm install` |
| `**/build/`, `**/dist/` | Đầu ra biên dịch |
| `**/.env`, `**/.env.*` | Chứa Gmail App Password, cấu hình DB |
| `NodeJS/src/config/config.json` | Thông tin kết nối DB — cần rà soát trước khi đẩy |
| `_backup_src/` | Bản sao `src` trước khi refactor |
| `db/images-backup/` | Ảnh trích xuất từ DB (dữ liệu sinh ra) |
| `**/.idea/`, `**/.vscode/` | Cấu hình IDE cá nhân |
| `_*.js` ở gốc 2 thư mục | Script kiểm tra nội bộ, sẽ đưa vào ở P7 |

## 3. Ước lượng quy mô từng phần

| Phần | Số file ước tính | Dung lượng |
|---|---|---|
| P1 (đã xong) | ~50 file + `testdb.sql` | ~25 MB (chủ yếu là SQL) |
| P2 | ~25 file | ~120 KB |
| P3 | ~7 file | ~60 KB |
| P4 | ~10 file | ~40 KB |
| P5 | ~35 file | ~200 KB |
| P6 | ~25 file | ~200 KB |
| P7 | ~50 file SCSS + script | ~300 KB |

> Con số cập nhật lần cuối: 04/11/2026. Khi đẩy phần mới, cập nhật bảng trạng thái
> trong `README.md` và log `E:\DATN\tien_do_git\LOG_TIEN_DO.md`.

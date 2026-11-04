# HealthyCare — Hệ thống đặt lịch khám bệnh trực tuyến

Đồ án tốt nghiệp. Ứng dụng web cho phép bệnh nhân tìm bác sĩ, xem lịch khám,
đặt lịch và nhận xác nhận qua **Email** hoặc **Zalo**; bác sĩ quản lý lịch khám
và gửi kết quả khám kèm hoá đơn; quản trị viên quản lý người dùng, chuyên khoa,
phòng khám, cẩm nang và nội dung trang chủ.

> **Trạng thái repo hiện tại: PHẦN 1 — KHUNG SƯỜN + CƠ SỞ DỮ LIỆU.**
> Repo được đẩy lên GitHub theo từng phần nhỏ phục vụ quá trình viết báo cáo.
> Các file nghiệp vụ chi tiết sẽ được đưa vào ở những phần sau.
> Xem lịch sử và phần tiếp theo tại: `E:\DATN\tien_do_git\LOG_TIEN_DO.md`

---

## 1. Kiến trúc tổng quát

```
┌────────────────────┐      HTTP/JSON       ┌────────────────────┐
│  Frontend React 17 │ ───────────────────▶ │  Backend Node.js   │
│  CRA 4 + Redux     │ ◀─────────────────── │  Express+Sequelize │
│  :3000             │                      │  :8086             │
└────────────────────┘                      └─────────┬──────────┘
                                                      │
                          ┌───────────────────────────┼──────────────────┐
                          ▼                           ▼                  ▼
                   MySQL (XAMPP)              Gmail SMTP           Zalo link
                   testdb :3306               gửi xác nhận        zalo.me/<sđt>
```

| Thành phần | Công nghệ | Cổng | Thư mục |
|---|---|---|---|
| Cơ sở dữ liệu | MySQL / MariaDB 10.4 (XAMPP), `utf8mb4` | 3306 | `testdb.sql` |
| Backend | Node.js, Express, Sequelize ORM, nodemailer, bcrypt, babel | 8086 | `NodeJS/` |
| Frontend | React 17, Create React App 4, Redux, React Router 5, SCSS | 3000 | `Frontend-React.JS/` |

## 2. Chức năng chính

| Vai trò | Chức năng |
|---|---|
| Bệnh nhân (R3) | Trang chủ, tìm chuyên khoa, xem chi tiết bác sĩ / phòng khám / cẩm nang, đặt lịch, chọn kênh xác nhận (Email/Zalo), xác nhận lịch qua link trong email |
| Bác sĩ (R2) | Quản lý kế hoạch khám bệnh (khung giờ đã có lịch được tô nền), xem danh sách bệnh nhân, gửi kết quả khám + hoá đơn, huỷ lịch |
| Quản trị viên (R1) | Quản lý người dùng, thông tin bác sĩ, chuyên khoa, phòng khám, cẩm nang, chỉnh sửa nội dung hero & ô dịch vụ trang chủ |

**Trạng thái lịch hẹn (`bookings.statusId`):** `S1` mới đặt → `S2` khách đã xác nhận → `S3` đã khám xong / `S4` đã huỷ.

## 3. Cấu trúc thư mục

Chi tiết đầy đủ (kèm phần git tương ứng) xem [`CAU_TRUC_DU_AN.md`](./CAU_TRUC_DU_AN.md).

```
FullStack-JS/
├── .gitignore
├── README.md                      <- file này
├── CAU_TRUC_DU_AN.md              <- sơ đồ cây thư mục + lộ trình git
├── CONFIG_TEMPLATE.md             <- danh sách biến môi trường (KHÔNG chứa giá trị thật)
├── testdb.sql                     <- DUMP CSDL (đã có trong PHẦN 1)
├── NodeJS/                        <- Backend
│   ├── package.json / .babelrc
│   └── src/
│       ├── server.js              <- điểm khởi động Express
│       ├── config/                <- cấu hình DB, view engine
│       ├── route/web.js           <- khai báo toàn bộ API
│       ├── models/                <- 14 Sequelize model (= lược đồ bảng)
│       ├── migrations/            <- 15 migration (= lịch sử thay đổi schema)
│       ├── controllers/  services/  utils/   <- sẽ đưa vào phần sau
│       └── seeders/  public/  views/
└── Frontend-React.JS/             <- Frontend
    ├── package.json / .npmrc
    ├── public/index.html
    └── src/
        ├── index.js  axios.js  redux.js  serviceWorker.js
        ├── utils/  store/  routes/        <- khung điều hướng & Redux
        └── containers/  components/  services/  styles/  <- sẽ đưa vào phần sau
```

## 4. Cách chạy (khi đã có đủ mã nguồn)

```bash
# 1. Bật MySQL trong XAMPP, import testdb.sql vào database `testdb`
# 2. Tạo file .env cho 2 thư mục theo CONFIG_TEMPLATE.md
# 3. Backend
cd NodeJS && npm install && npm start                 # http://localhost:8086
# 4. Frontend
cd Frontend-React.JS && npm install && npm start      # http://localhost:3000
```

Yêu cầu: Node.js 20+ (dự án dùng `cross-env NODE_OPTIONS=--openssl-legacy-provider`
cho webpack 4 của CRA), MySQL/MariaDB của XAMPP.

## 5. Quy ước kỹ thuật đáng chú ý

- **Ảnh:** cột `image` trong DB là `LONGBLOB` chứa **bytes ảnh thật**. Backend
  đọc ra chuyển thành `data-URI`, frontend dùng trực tiếp `item.image`, không decode lại.
- **Không còn đa ngôn ngữ:** toàn bộ giao diện dùng chuỗi tiếng Việt viết thẳng trong code
  (đã bỏ `react-intl`, `translations/`, nút VN/EN).
- **Gửi mail:** dùng Gmail App Password; trên mạng có proxy quét HTTPS cần đặt
  `SMTP_VERIFY_TLS=false` (xem `CONFIG_TEMPLATE.md`).
- **Route DELETE** nhận `id` trong **body**, không phải query string.

## 6. Lộ trình đẩy lên GitHub

Repo được chia thành nhiều phần nhỏ. Mỗi lần đẩy sẽ ghi log vào
`E:\DATN\tien_do_git\LOG_TIEN_DO.md`. **Đọc file đó trước khi đẩy phần tiếp theo**
để biết phần nào đã xong, tránh commit trùng.

| Phần | Nội dung | Trạng thái |
|---|---|---|
| 1 | Khung sườn + `testdb.sql` + schema (models/migrations) | ✅ Đã đẩy |
| 2 | Backend: controllers + services + utils | ⏳ Chưa |
| 3 | Frontend: services (gọi API) + Redux actions/reducers | ⏳ Chưa |
| 4 | Frontend: components dùng chung | ⏳ Chưa |
| 5 | Frontend: containers trang khách (HomePage, Patient) | ⏳ Chưa |
| 6 | Frontend: containers khu quản trị (System: Admin + Doctor) | ⏳ Chưa |
| 7 | Styles (SCSS), assets, scripts tiện ích, tài liệu bổ sung | ⏳ Chưa |

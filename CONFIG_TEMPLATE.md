# Mẫu cấu hình môi trường (KHÔNG chứa giá trị thật)

> ⚠️ Các file `.env` thật **bị loại khỏi git** vì chứa Gmail App Password và
> thông tin kết nốiDB. Khi clone repo về máy khác, hãy **tạo mới** 2 file `.env`
> theo mẫu bên dưới rồi tự điền giá trị của mình.

---

## 1. `NodeJS/.env` (backend)

```env
# ---- Máy chủ ----
PORT=8086
NODE_ENV=development
URL_REACT=http://localhost:3000

# ---- MySQL (XAMPP) ----
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=testdb
DB_USER=root
DB_PASSWORD=

# ---- Giới hạn lịch khám ----
# Tên biến PHẢI đúng như code đọc trong src/services/doctorService.js
MAX_NUMBER_SCHEDULE=4

# ---- Gmail gửi mail xác nhận ----
EMAIL_APP=your-account@gmail.com
# App Password 16 ký tự (KHÔNG phải mật khẩu đăng nhập Gmail)
EMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
# false = bỏ qua kiểm tra chứng chỉ TLS (cần khi mạng có proxy/antivirus quét HTTPS)
SMTP_VERIFY_TLS=false

# ---- Zalo & tên hiển thị ----
# Để trống -> dùng số điện thoại khách tự nhập khi đặt lịch
WEBSITE_ZALO_PHONE=
WEBSITE_NAME=HealthyCare
```

**Cách lấy App Password:** đăng nhập Gmail → bật Xác minh 2 bước →
https://myaccount.google.com/apppasswords → tạo mật khẩu ứng dụng 16 ký tự.

**Lưu ý quan trọng:**
- `.env` chỉ được đọc **lúc khởi động backend** → sửa xong phải chạy lại `npm start`.
- Nếu log báo `unable to verify the first certificate` thì đặt `SMTP_VERIFY_TLS=false`.
- ⚠️ Đang có điểm cần kiểm tra: file `.env` trên máy phát triển hiện dùng tên biến
  `MAX_JXQKXD_FTZFUYGI` trong khi code đọc `MAX_NUMBER_SCHEDULE`. Hãy đổi lại tên
  biến cho khớp, nếu không `maxNumber` của khung giờ mới sẽ bị `undefined`.

---

## 2. `Frontend-React.JS/.env` (frontend)

```env
# Địa chỉ backend (không có dấu / ở cuối)
REACT_APP_BACKEND_URL=http://localhost:8086
```

Biến này được `src/axios.js` dùng làm `baseURL`. CRA chỉ nạp biến bắt đầu bằng
`REACT_APP_`, và cũng chỉ đọc **lúc khởi động dev server** → sửa xong phải restart
`npm start`.

---

## 3. `NodeJS/src/config/config.json` (Sequelize CLI)

File này cũng bị loại khỏi git. Cấu trúc tối thiểu:

```json
{
  "development": {
    "username": "root",
    "password": "",
    "database": "testdb",
    "host": "127.0.0.1",
    "port": 3306,
    "dialect": "mysql",
    "logging": false,
    "timezone": "+07:00"
  }
}
```

`src/config/connectDB.js` ưu tiên đọc `.env`, chỉ dùng `config.json` khi biến
môi trường không có. `src/models/index.js` thì đọc trực tiếp `config.json` theo
`NODE_ENV`.

---

## 4. Danh sách kiểm tra sau khi clone

- [ ] Import `testdb.sql` vào MySQL (tăng `max_allowed_packet` lên 256 MB trước).
- [ ] Tạo `NodeJS/.env` và `Frontend-React.JS/.env` theo mẫu trên.
- [ ] Tạo `NodeJS/src/config/config.json`.
- [ ] `cd NodeJS && npm install`
- [ ] `cd Frontend-React.JS && npm install`
- [ ] `npm start` ở 2 thư mục, kiểm tra `:8086` và `:3000`.

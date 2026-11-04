/**
 * ĐIỂM KHỞI ĐỘNG CỦA BACKEND (chạy bằng `npm start` -> nodemon + babel-node).
 *
 * Thứ tự khởi tạo:
 *   1. Tạo app Express.
 *   2. Middleware CORS: chỉ cho phép origin `URL_REACT` (mặc định
 *      http://localhost:3000) gọi API, cho phép GET/POST/PUT/PATCH/DELETE.
 *   3. bodyParser JSON + urlencoded với **limit 50mb** — cần thiết vì ảnh
 *      được gửi dưới dạng base64 trong body.
 *   4. `viewEngine(app)`  — cấu hình EJS + thư mục tĩnh (src/config/viewEngine.js).
 *   5. `initWebRoutes(app)` — đăng ký toàn bộ route (src/route/web.js).
 *   6. `connectDB()` — mở kết nối MySQL (src/config/connectDB.js).
 *   7. `app.listen(PORT)` — mặc định 8086.
 *
 * Ai gọi tới: npm script `start` trong package.json.
 */
import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRoutes from "./route/web";
import connectDB from "./config/connectDB";
import cors from "cors";
require('dotenv').config();

let app = express();

// Thêm header trước khi khai báo các route
app.use(function (req, res, next) {

    // Website mà bạn muốn cho phép kết nối
    res.setHeader('Access-Control-Allow-Origin', process.env.URL_REACT);

    // Các phương thức HTTP được phép
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Các header được phép gửi lên
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Đặt true nếu cần website gửi kèm cookie trong request
    // tới API (ví dụ khi dùng session)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Chuyển sang lớp middleware tiếp theo
    next();
});

// Cấu hình app
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

viewEngine(app);
initWebRoutes(app);

connectDB();

let port = process.env.PORT || 8086;
app.listen(port, () => {
    // hàm callback
    console.log('Backend NodeJS is running on PORT: ' + port);
})
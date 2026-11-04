import express from "express";

/**
 * Cấu hình view engine (EJS) và thư mục tài nguyên tĩnh cho Express.
 *
 * - Ai gọi: `src/server.js` khi khởi tạo app.
 * - Bảng: không truy cập DB.
 * - Trả về: không trả dữ liệu (chỉ gắn cấu hình vào `app`).
 *
 * Tác dụng cụ thể:
 *  - `express.static("./src/public")` -> phục vụ ảnh/CSS/JS tĩnh tại `/`.
 *  - `view engine = ejs`  -> cho phép `res.render('home')`.
 *  - `views = ./src/views` -> nơi chứa các file `.ejs` (các trang demo CRUD).
 */
let configViewEngine = (app) => { // hàm mũi tên (arrow function)
    app.use(express.static("./src/public"))
    app.set("view engine", "ejs") // tương tự jsp/blade
    app.set("views", "./src/views")
}

module.exports = configViewEngine;
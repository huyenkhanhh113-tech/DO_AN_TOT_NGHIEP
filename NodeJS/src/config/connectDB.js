const { Sequelize } = require('sequelize');
require('dotenv').config();

// Đọc cấu hình gốc từ config.json theo NODE_ENV (cùng nguồn với src/models/index.js),
// sau đó cho phép mọi trường kết nối bị ghi đè bởi biến môi trường.
const env = process.env.NODE_ENV || 'development';
const config = require('./config.json')[env] || {};

const sequelize = new Sequelize(
    process.env.DB_NAME || config.database,
    process.env.DB_USER || config.username,
    process.env.DB_PASSWORD || config.password,
    {
        host: process.env.DB_HOST || config.host,
        port: process.env.DB_PORT || config.port || 3306,
        dialect: config.dialect || 'mysql',
        logging: config.logging !== undefined ? config.logging : false,
        query: config.query,
        timezone: config.timezone,
    }
);

/**
 * Mở kết nối tới MySQL và xác nhận thông tin đăng nhập có đúng không.
 *
 * - Ai gọi: `src/server.js` ngay khi khởi động server.
 * - Bảng: không truy cập bảng nào (chỉ mở kết nối + `authenticate()`).
 * - Trả về: Promise không trả dữ liệu; chỉ in log
 *   "Connection has been established successfully." hoặc log lỗi.
 *
 * Lưu ý: lỗi kết nối chỉ được log ra **không throw** — server vẫn khởi động,
 * nên nếu thấy API trả lỗi DB thì kiểm tra log này trước.
 */
let connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

module.exports = connectDB;

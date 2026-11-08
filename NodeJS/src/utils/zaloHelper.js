/**
 * Tiện ích gửi xác nhận lịch khám qua Zalo.
 *
 * ── Cách hoạt động ────────────────────────────────────────────────────────
 * Gửi tin nhắn Zalo TỰ ĐỘNG cần một Zalo Official Account (OA) đã xác thực
 * doanh nghiệp và được Zalo duyệt template tin nhắn. Đồ án không đăng ký OA
 * nên dùng cách đơn giản hơn: tạo "link mở Zalo" trỏ tới SỐ ĐIỆN THOẠI ZALO
 * CỦA TRANG WEB. Khách bấm vào là mở cuộc trò chuyện với trang web, nội dung
 * xác nhận lịch khám đã được soạn sẵn.
 *
 * ── Đổi số điện thoại nhận tin xác nhận ───────────────────────────────────
 * Số này lấy từ biến môi trường WEBSITE_ZALO_PHONE trong file `NodeJS/.env`.
 *   - Nếu WEBSITE_ZALO_PHONE có giá trị  -> dùng số của trang web.
 *   - Nếu để trống                        -> dùng số khách tự nhập khi đặt lịch.
 * Chi tiết từng bước xem: E:\DATN\HUONG-DAN-THAY-SO-DIEN-THOAI-ZALO.md
 *
 * ── Nâng cấp lên OA thật ──────────────────────────────────────────────────
 * Chỉ cần thay ruột hàm `sendZaloConfirmation` bằng lời gọi API gửi tin nhắn
 * của Zalo OA; phần còn lại của hệ thống giữ nguyên.
 */
require('dotenv').config();

/** Tên hiển thị của trang web (dùng trong nội dung tin nhắn) */
const WEBSITE_NAME = process.env.WEBSITE_NAME || 'HealthyCare';

/**
 * Chuẩn hoá số điện thoại Việt Nam về dạng 84xxxxxxxxx (bỏ số 0 ở đầu).
 *
 * - Ai gọi: `buildZaloLink()` (trong cùng file).
 * - Bảng: không truy cập DB.
 * - Trả về: **chuỗi** chỉ gồm chữ số, ví dụ `"0987 654 321"` -> `"84987654321"`;
 *   trả `''` nếu đầu vào rỗng.
 */
let normalizeZaloPhone = (phone) => {
    if (!phone) return '';
    let digits = String(phone).replace(/[^0-9]/g, '');
    if (digits.startsWith('0')) {
        digits = '84' + digits.slice(1);
    }
    return digits;
};

/**
 * Soạn nội dung tin nhắn xác nhận lịch khám (tiếng Việt).
 *
 * - Ai gọi: `sendZaloConfirmation()` (trong cùng file).
 * - Bảng: không truy cập DB.
 * - Trả về: **chuỗi nhiều dòng** gồm lời chào, tên bệnh nhân, thời gian,
 *   tên bác sĩ và câu đề nghị xác nhận. Khách chỉ cần gửi lại nội dung này.
 *
 * Đầu vào: `{ patientName, time, doctorName }`.
 */
let buildZaloMessage = (dataSend) => {
    return [
        `Xin chào ${WEBSITE_NAME}!`,
        `Tôi là ${dataSend.patientName}, đã đặt lịch khám trên website.`,
        `Thời gian: ${dataSend.time}`,
        `Bác sĩ: ${dataSend.doctorName}`,
        `Vui lòng xác nhận lịch khám giúp tôi. Xin cảm ơn!`
    ].join('\n');
};

/**
 * Tạo link mở Zalo kèm số điện thoại người nhận.
 *
 * - Ai gọi: `sendZaloConfirmation()` (trong cùng file).
 * - Gọi tiếp: `normalizeZaloPhone()`.
 * - Bảng: không truy cập DB.
 * - Trả về: **chuỗi** `https://zalo.me/<số đã chuẩn hoá>`,
 *   hoặc `''` nếu không xác định được số nào.
 *
 * Thứ tự ưu tiên chọn số:
 *   1. `WEBSITE_ZALO_PHONE` trong `.env` (số Zalo chính thức của trang web) — khuyến nghị
 *   2. `contactPhone` / `phoneNumber` của khách (số khách nhập khi đặt lịch)
 */
let buildZaloLink = (dataSend) => {
    let websitePhone = normalizeZaloPhone(process.env.WEBSITE_ZALO_PHONE);
    let customerPhone = normalizeZaloPhone(dataSend.contactPhone || dataSend.phoneNumber);
    let target = websitePhone || customerPhone;

    if (!target) return '';
    return `https://zalo.me/${target}`;
};

/**
 * "Gửi" xác nhận qua Zalo — thực chất là tạo link + nội dung soạn sẵn.
 *
 * - Ai gọi: `patientService.sendConfirmation()` khi khách chọn kênh `'zalo'`
 *   (trong luồng `postBookAppointmentService`).
 * - Gọi tiếp: `buildZaloLink()`, `buildZaloMessage()`.
 * - Bảng: không truy cập DB.
 * - Trả về: `{ errCode: 0, errMessage: 'OK', zaloLink, message, status }`
 *   trong đó `status` = `'generated'` (đã tạo link) hoặc `'missing-phone'`
 *   (không xác định được số điện thoại).
 *
 * Frontend nhận `zaloLink` rồi `window.open()` để mở Zalo cho khách.
 */
let sendZaloConfirmation = async (dataSend) => {
    let zaloLink = buildZaloLink(dataSend);
    let message = buildZaloMessage(dataSend);

    return {
        errCode: 0,
        errMessage: 'OK',
        // Link mở Zalo (frontend mở tab mới ngay sau khi đặt lịch thành công)
        zaloLink: zaloLink,
        // Nội dung tin nhắn xác nhận đã soạn sẵn
        message: message,
        // Trạng thái: 'generated' = đã tạo link/nội dung; 'missing-phone' = thiếu số điện thoại
        status: zaloLink ? 'generated' : 'missing-phone'
    };
};

module.exports = {
    normalizeZaloPhone: normalizeZaloPhone,
    buildZaloMessage: buildZaloMessage,
    buildZaloLink: buildZaloLink,
    sendZaloConfirmation: sendZaloConfirmation
};

'use strict';

/**
 * Tiện ích xử lý ảnh dùng chung cho toàn bộ backend HealthyCare.
 *
 * Hợp đồng ảnh đang áp dụng:
 *   - Tầng DB    : cột `image` (LONGBLOB) lưu BYTES ảnh thật, KHÔNG lưu base64.
 *   - Tầng đọc   : mọi endpoint trả `image` dưới dạng chuỗi data-URI `data:image/...;base64,...`.
 *   - Tầng ghi   : nhận `imageBase64` (data-URI hoặc base64 thuần) -> decode -> lưu Buffer bytes.
 *   - Frontend   : dùng thẳng `item.image` trong `url(...)`, không tự decode nữa.
 */

/**
 * Đoán mime type của ảnh dựa trên magic bytes (vài byte đầu của file).
 *
 * - Ai gọi: `bufferToDataUri()` (trong cùng file).
 * - Bảng: không truy cập DB.
 * - Trả về: **chuỗi mime** — 'image/jpeg' | 'image/png' | 'image/gif' |
 *   'image/bmp' | 'image/webp'; mặc định 'image/jpeg' nếu không nhận ra.
 *
 * Thứ tự kiểm tra: JPEG -> PNG -> GIF -> BMP -> WEBP.
 */
function sniffMime(buf) {
    if (!buf || buf.length < 4) return 'image/jpeg';

    // JPEG: FF D8 FF
    if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
    // PNG: 89 50 4E 47 ("\x89PNG")
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
    // GIF: 47 49 46 ("GIF")
    if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return 'image/gif';
    // BMP: 42 4D ("BM")
    if (buf[0] === 0x42 && buf[1] === 0x4d) return 'image/bmp';
    // WEBP: 'RIFF' ở 4 byte đầu và 'WEBP' ở byte 8..11
    if (buf.length >= 12 &&
        buf.slice(0, 4).toString('latin1') === 'RIFF' &&
        buf.slice(8, 12).toString('latin1') === 'WEBP') {
        return 'image/webp';
    }

    return 'image/jpeg';
}

/**
 * Chuyển Buffer bytes ảnh -> chuỗi data-URI để trả về cho client.
 *
 * - Ai gọi: hầu hết service đọc dữ liệu có ảnh — `clinicService`,
 *   `specialtyService`, `handbookService`, `doctorService`, `userService`.
 * - Bảng: không truy cập DB (chỉ biến đổi dữ liệu đã đọc ra).
 * - Trả về: **chuỗi** `data:<mime>;base64,<...>`; trả `''` nếu buffer null/rỗng.
 *
 * Đây là một nửa của "hợp đồng ảnh": DB lưu bytes, API trả data-URI.
 */
function bufferToDataUri(buf) {
    if (!buf) return '';
    const bytes = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
    if (bytes.length === 0) return '';
    return `data:${sniffMime(bytes)};base64,${bytes.toString('base64')}`;
}

/**
 * Kiểm tra một chuỗi có phải data-URI base64 hay không.
 *
 * - Ai gọi: hiện **chưa có nơi nào gọi** (hàm tiện ích dự phòng, giữ lại để dùng sau).
 * - Bảng: không truy cập DB.
 * - Trả về: **boolean** — `true` nếu chuỗi khớp dạng `data:<mime>;base64,`.
 *
 * Ví dụ: `'data:image/png;base64,AAA...'` -> true.
 */
function isDataUri(str) {
    return typeof str === 'string' && /^data:[\w.+-]+\/[\w.+-]+;base64,/i.test(str);
}

/**
 * Chuyển ảnh client gửi lên thành Buffer bytes để lưu xuống DB.
 *
 * - Ai gọi: các service GHI dữ liệu có ảnh — `clinicService.create/update`,
 *   `specialtyService.create/update`, `handbookService.create/update`,
 *   `userService.createNewUser/updateUserData`.
 * - Bảng: không truy cập DB (chỉ chuẩn bị dữ liệu trước khi ghi).
 * - Trả về: **Buffer** bytes ảnh, hoặc `null` nếu input null/rỗng/giải mã lỗi.
 *
 * Chấp nhận 3 dạng đầu vào:
 *   - data-URI     : `'data:image/png;base64,AAA'` -> bỏ tiền tố rồi decode.
 *   - base64 thuần : `'AAA...'` -> decode trực tiếp.
 *   - Buffer       : đã là bytes thật -> trả nguyên trạng.
 * Tự loại bỏ khoảng trắng / ký tự xuống dòng lẫn trong chuỗi base64.
 */
function base64ToBuffer(input) {
    if (input == null) return null;

    // Đã là bytes thật (ví dụ Sequelize trả về) -> giữ nguyên.
    if (Buffer.isBuffer(input)) {
        return input.length ? input : null;
    }

    let str = typeof input === 'string' ? input : String(input);
    str = str.trim();
    if (!str) return null;

    // Nếu là data-URI thì cắt bỏ phần tiền tố `data:...;base64,`.
    const match = str.match(/^data:[\w.+-]+\/[\w.+-]+;base64,/i);
    if (match) str = str.slice(match[0].length);

    // Loại bỏ mọi khoảng trắng / xuống dòng còn sót lại trong phần base64.
    str = str.replace(/\s+/g, '');
    if (!str) return null;

    const buf = Buffer.from(str, 'base64');
    return buf.length ? buf : null;
}

module.exports = {
    sniffMime: sniffMime,
    bufferToDataUri: bufferToDataUri,
    base64ToBuffer: base64ToBuffer,
    isDataUri: isDataUri,
};

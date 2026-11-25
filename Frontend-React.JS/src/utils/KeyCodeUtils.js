/**
 * Tiện ích kiểm tra mã phím (keyCode) khi xử lý sự kiện bàn phím.
 *
 * Lưu ý: hiện **chưa có component nào dùng** lớp này (di sản từ khung đồ án gốc).
 * Giữ lại để dùng khi cần chặn ký tự nhập vào ô số điện thoại / ô số.
 */
class KeyCodeUtils {

    static UP = 38;

    static DOWN = 40;

    static TAB = 9;

    static ENTER = 13;

    static E = 69;

    static ESCAPE = 27; 

    /**
     * Kiểm tra phím điều hướng (mũi tên, Tab, Backspace, Delete, Enter...).
     *
     * - Ai gọi: hiện chưa có (tiện ích dự phòng).
     * - Bảng: không truy cập DB.
     * - Trả về: **boolean**.
     */
    static isNavigation(e) {
        return (e >= 33 && e <= 40) || e === 9 || e === 8 || e === 46 || e === 14 || e === 13;
    }

    /**
     * Kiểm tra phím số (hàng số phía trên hoặc numpad).
     *
     * - Ai gọi: hiện chưa có (tiện ích dự phòng).
     * - Bảng: không truy cập DB.
     * - Trả về: **boolean**.
     */
    static isNumeric(e) {
        return (e >= 48 && e <= 57) || (e >= 96 && e <= 105);
    }

    /**
     * Kiểm tra phím chữ cái A-Z.
     *
     * - Ai gọi: hiện chưa có (tiện ích dự phòng).
     * - Bảng: không truy cập DB.
     * - Trả về: **boolean**.
     */
    static isAlphabetic(e) {
        return (e >= 65 && e <= 90);
    }

    /**
     * Kiểm tra phím dấu chấm / phẩy (dùng cho ô nhập số thập phân).
     *
     * - Ai gọi: hiện chưa có (tiện ích dự phòng).
     * - Bảng: không truy cập DB.
     * - Trả về: **boolean**.
     */
    static isDecimal(e) {
        return e === 190 || e === 188 || e === 108 || e === 110;
    }

    /**
     * Kiểm tra phím dấu gạch ngang (dùng cho ô nhập số điện thoại).
     *
     * - Ai gọi: hiện chưa có (tiện ích dự phòng).
     * - Bảng: không truy cập DB.
     * - Trả về: **boolean**.
     */
    static isDash(e) {
        return e === 109 || e === 189;
    }
}

export default KeyCodeUtils;

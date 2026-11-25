import React from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

import CustomToast from "../components/CustomToast";

const TYPE_SUCCESS = 'SUCCESS';
const TYPE_INFO = 'INFO';
const TYPE_WARN = 'WARN';
const TYPE_ERROR = 'ERROR';

/**
 * ToastUtil - Bộ tiện ích hiển thị thông báo (toast) dùng chung.
 *
 * Tất cả hàm đều nhận `title` và `message` là CHUỖI TIẾNG VIỆT trực tiếp
 * (trước đây là khoá dịch + react-intl, nay đã bỏ cơ chế đa ngôn ngữ).
 *
 * Lớp này chỉ là lớp bọc quanh `react-toastify`; nội dung hiển thị do
 * component `CustomToast` render.
 */
class ToastUtil {

    /**
     * Hiện toast màu xanh (thành công).
     *
     * - Ai gọi: bất kỳ component nào cần báo thao tác thành công.
     * - Gọi tiếp: `show(TYPE_SUCCESS, ...)`.
     * - Trả về: không trả dữ liệu.
     */
    static success(title, message) {
        this.show(TYPE_SUCCESS, title, message);
    }

    /**
     * Hiện toast màu xanh dương (thông tin).
     *
     * - Ai gọi: component cần thông báo trung tính.
     * - Gọi tiếp: `show(TYPE_INFO, ...)`.
     * - Trả về: không trả dữ liệu.
     */
    static info(title, message) {
        this.show(TYPE_INFO, title, message);
    }

    /**
     * Hiện toast màu vàng (cảnh báo).
     *
     * - Ai gọi: ví dụ `BookingModal` khi đặt lịch xong nhưng **chưa gửi được mail**.
     * - Gọi tiếp: `show(TYPE_WARN, ...)`.
     * - Trả về: không trả dữ liệu.
     */
    static warn(title, message) {
        this.show(TYPE_WARN, title, message);
    }

    /**
     * Hiện toast màu đỏ (lỗi).
     *
     * - Ai gọi: component cần báo thao tác thất bại.
     * - Gọi tiếp: `show(TYPE_ERROR, ...)`.
     * - Trả về: không trả dữ liệu.
     */
    static error(title, message) {
        this.show(TYPE_ERROR, title, message);
    }

    /**
     * Hiện toast thành công với nội dung **nguyên văn** (không xử lý thêm).
     *
     * - Ai gọi: khi đã có sẵn chuỗi hiển thị hoàn chỉnh.
     * - Gọi tiếp: `show(TYPE_SUCCESS, ..., rawMessage = true)`.
     * - Trả về: không trả dữ liệu.
     */
    static successRaw(title, message) {
        this.show(TYPE_SUCCESS, title, message, true);
    }

    /**
     * Hiện toast lỗi với nội dung nguyên văn, tự đóng sau `autoCloseDelay` ms.
     *
     * - Ai gọi: khi đã có sẵn chuỗi lỗi hoàn chỉnh.
     * - Gọi tiếp: `show(TYPE_ERROR, ..., rawMessage = true)`.
     * - Trả về: không trả dữ liệu.
     */
    static errorRaw(title, message, autoCloseDelay = 3000) {
        this.show(TYPE_ERROR, title, message, true, autoCloseDelay);
    }

    /**
     * Hiển thị lỗi phát sinh từ một yêu cầu API, tự chọn câu thông báo theo mã HTTP.
     *
     * - Ai gọi: các action/component bắt lỗi khi gọi API (thường trong `catch`).
     * - Gọi tiếp: `axios.isCancel()` để bỏ qua request đã huỷ, rồi `toast.error()`
     *   với component `CustomToast`.
     * - Trả về: không trả dữ liệu.
     *
     * Quy tắc chọn thông báo:
     *   - 5xx -> "Lỗi máy chủ nội bộ."
     *   - 400 -> "Yêu cầu không hợp lệ."
     *   - 403 -> "Bạn không có quyền thực hiện thao tác này."
     *   - Khác -> ưu tiên `error.errorMessage` (lỗi nghiệp vụ backend trả về).
     */
    static errorApi(error, title = 'Không tải được dữ liệu', autoCloseDelay = 3000) {
        // Bỏ qua nếu yêu cầu đã bị huỷ (ví dụ người dùng chuyển trang giữa lúc gọi)
        if (axios.isCancel(error)) {
            return;
        }

        let message = null;
        let messageText = 'Đã xảy ra lỗi không xác định.';

        if (error.httpStatusCode >= 500) {
            messageText = 'Lỗi máy chủ nội bộ.';
        } else if (error.httpStatusCode < 500 && error.httpStatusCode >= 400) {
            if (error.httpStatusCode === 400) {
                messageText = 'Yêu cầu không hợp lệ.';
            } else if (error.httpStatusCode === 403) {
                messageText = 'Bạn không có quyền thực hiện thao tác này.';
            }
        } else {
            // Máy chủ trả về thành công nhưng nghiệp vụ báo lỗi -> dùng message gốc
            if (error.errorMessage) {
                message = error.errorMessage
            }
        }

        // Ưu tiên message nghiệp vụ; nếu không có thì dùng thông báo theo mã HTTP
        toast.error(<CustomToast title={title} message={message || messageText} time={new Date()} />, {
            position: toast.POSITION.BOTTOM_RIGHT,
            pauseOnHover: true,
            autoClose: autoCloseDelay
        });
    }

    /**
     * Hàm lõi: render `CustomToast` và gọi đúng API của react-toastify theo loại.
     *
     * - Ai gọi: `success()`, `info()`, `warn()`, `error()`, `successRaw()`,
     *   `errorRaw()` (trong cùng lớp).
     * - Bảng: không truy cập DB.
     * - Trả về: không trả dữ liệu (chỉ hiển thị toast góc dưới bên phải).
     *
     * Tham số:
     *   - `type`            : SUCCESS | INFO | WARN | ERROR
     *   - `rawMessage`      : hiện tại chưa được dùng để đổi cách render
     *   - `autoCloseDelay`  : thời gian tự đóng (ms), mặc định 3000
     */
    static show(type, title, message, rawMessage = false, autoCloseDelay = 3000) {
        const content = <CustomToast title={title} message={message} time={new Date()} />;
        const options = {
            position: toast.POSITION.BOTTOM_RIGHT,
            pauseOnHover: true,
            autoClose: autoCloseDelay
        };

        switch (type) {
            case TYPE_SUCCESS:
                toast.success(content, options);
                break;
            case TYPE_INFO:
                toast.info(content, options);
                break;
            case TYPE_WARN:
                toast.warn(content, options);
                break;
            case TYPE_ERROR:
                toast.error(content, options);
                break;
            default:
                break;
        }
    }
}

export default ToastUtil;

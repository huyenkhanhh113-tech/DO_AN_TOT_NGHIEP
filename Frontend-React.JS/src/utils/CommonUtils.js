/**
 * Tiện ích dùng chung ở frontend.
 */
class CommonUtils {
    /**
     * Đọc file người dùng chọn và chuyển thành chuỗi data-URI base64.
     *
     * - Ai gọi: các modal upload ảnh — `ManageDoctor`, `ManageSpecialty`,
     *   `ManageClinic`, `ManageHandBook`, `RemedyModal`, `TableManageUser`...
     * - Gọi tiếp: `FileReader.readAsDataURL()`.
     * - Trả về: Promise resolve **chuỗi** `data:image/png;base64,...`
     *   (đúng định dạng `imageBase64` mà backend mong đợi), hoặc reject nếu đọc lỗi.
     *
     * Đây là đầu vào của "hợp đồng ảnh": frontend gửi data-URI,
     * backend decode thành bytes và lưu vào cột LONGBLOB.
     */
    static getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
}

export default CommonUtils;
/**
 * Hằng số dùng chung của frontend.
 *
 * File này KHÔNG chứa hàm — chỉ khai báo các hằng số được import qua
 * `import { ... } from '../../utils'` (xem `utils/index.js`).
 */

/**
 * Đường dẫn route của toàn ứng dụng.
 *
 * - Ai dùng: `src/routes/Home.js`, `Doctor.js`, `System.js` (khai báo Route),
 *   và mọi component cần điều hướng (`history.push(path.XXX)`).
 * - Các route có `:id` là route động, nhận tham số từ URL.
 */
export const path = {
    HOME: '/',
    HOMEPAGE: '/home',
    LOGIN: '/login',
    LOG_OUT: '/logout',
    SYSTEM: '/system',
    DETAIL_DOCTOR: '/detail-doctor/:id',
    DETAIL_SPECIALTY: '/detail-specialty/:id',
    DETAIL_CLINIC: '/detail-clinic/:id',
    DETAIL_HANDBOOK: '/detail-handbook/:id',
    VERIFY_EMAIL_BOOKING: '/verify-booking',
    ALL_CLINIC: '/all-clinic',
    ALL_SPECIALTY: '/all-specialty',
    ALL_DOCTOR: '/all-doctor',
    ALL_HANDBOOK: '/all-handbook',
    SEARCH_SPECIALTY: '/search-specialty'
};

/**
 * Loại thao tác CRUD — dùng để phân biệt chế độ thêm mới / chỉnh sửa.
 *
 * - Ai dùng: `ManageDoctor`, `ManageSchedule`, `ManageSpecialty`... (state
 *   `action`), và backend nhận cùng giá trị trong `postInfoDoctorsService`.
 */
export const CRUD_ACTIONS = {
    CREATE: "CREATE",
    EDIT: "EDIT",
    DELETE: "DELETE",
    READ: "READ"
};

/**
 * Định dạng ngày gửi lên server.
 *
 * - Ai dùng: các trang quản lý lịch khi format ngày bằng moment.
 */
export const dateFormat = {
    SEND_TO_SERVER: 'DD/MM/YYYY'
};

/**
 * Giá trị Có / Không dùng trong các ô chọn.
 */
export const YesNoObj = {
    YES: 'Y',
    NO: 'N'
}

/**
 * Mã vai trò người dùng — khớp với cột `users.roleId` bên backend.
 *
 * - R1 = quản trị viên -> vào `/system/user-manage`
 * - R2 = bác sĩ        -> vào `/system/manage-patient`
 * - R3 = bệnh nhân     -> ở lại trang chủ
 *
 * - Ai dùng: `Header.js` (chọn menu), `Login.js` (điều hướng sau đăng nhập),
 *   `routes/System.js`, `routes/Doctor.js` (phân quyền).
 */
export const USER_ROLE = {
    ADMIN: 'R1',
    DOCTOR: 'R2',
    PATIENT: 'R3'
}

import axios from "../axios";

/**
 * Gọi API: POST /api/login
 * Mục đích: Đăng nhập bằng email + mật khẩu.
 * Ai gọi tới: Login.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const handleLoginApi = (email, password) => {
    return axios.post('/api/login', {email, password})
}

/**
 * Gọi API: GET /api/get-all-users?id=<inputId>
 * Mục đích: Lấy toàn bộ user (id = 'ALL') hoặc một user theo id.
 * Ai gọi tới: adminActions.fetchAllUsers() <- TableManageUser.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const getAllUsers = (inputId) => {
    // Chuỗi mẫu (template string)
    return axios.get(`/api/get-all-users?id=${inputId}`)
}

/**
 * Gọi API: POST /api/create-new-user
 * Mục đích: Tạo tài khoản người dùng mới.
 * Ai gọi tới: adminActions.createNewUser() <- TableManageUser.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const createNewUserService = (data) => {
    return axios.post('/api/create-new-user', data)
}

/**
 * Gọi API: DELETE /api/delete-user
 * Mục đích: Xoá người dùng (id gửi trong body).
 * Ai gọi tới: adminActions.deleteUser() / TableManageUser.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const deleteUserService = (userId) => {
    return axios.delete('/api/delete-user', {data: {id: userId}})
}

/**
 * Gọi API: PUT /api/edit-user
 * Mục đích: Cập nhật thông tin người dùng.
 * Ai gọi tới: adminActions.editUser() <- TableManageUser.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const editUserService = (inputData) => {
    return axios.put('/api/edit-user', inputData)
}

/**
 * Gọi API: GET /api/allcode?type=<inputType>
 * Mục đích: Lấy danh mục allcode theo loại (ROLE, GENDER, PRICE, ...).
 * Ai gọi tới: adminActions.fetchAllCode() và nhiều trang quản trị.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const getAllCodeService = (inputType) => {
    return axios.get(`/api/allcode?type=${inputType}`)
}

/**
 * Gọi API: GET /api/top-doctor-home?limit=<limit>
 * Mục đích: Lấy N bác sĩ mới nhất cho mục "Bác sĩ nổi bật".
 * Ai gọi tới: adminActions.fetchTopDoctor() <- OutStandingDoctor / AllDoctor.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const getTopDoctorHomeService = (limit) => {
    return axios.get(`/api/top-doctor-home?limit=${limit}`)
}

/**
 * Gọi API: GET /api/get-all-doctors
 * Mục đích: Lấy danh sách rút gọn của tất cả bác sĩ.
 * Ai gọi tới: adminActions.fetchAllDoctors() <- ManageDoctor / ManageSchedule.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const getAllDoctorsService = () => {
    return axios.get(`/api/get-all-doctors`)
}

/**
 * Gọi API: POST /api/save-info-doctors
 * Mục đích: Lưu "Thông tin bác sĩ" (mô tả, giá, thanh toán, địa chỉ).
 * Ai gọi tới: adminActions.saveDetailDoctor() <- ManageDoctor.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const saveDetailDoctorService = (data) => {
    return axios.post('/api/save-info-doctors', data)
}

/**
 * Gọi API: GET /api/get-detail-doctor-by-id?id=<inputId>
 * Mục đích: Lấy chi tiết hồ sơ bác sĩ.
 * Ai gọi tới: DetailDoctor, ManageDoctor.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const getDetailDoctorInfoService = (inputId) => {
    return axios.get(`/api/get-detail-doctor-by-id?id=${inputId}`)
}

/**
 * Gọi API: POST /api/bulk-create-schedule
 * Mục đích: Lưu lịch khám của bác sĩ trong một ngày.
 * Ai gọi tới: ManageSchedule.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const saveScheduleDoctorsService = (data) => {
    return axios.post('/api/bulk-create-schedule', data)
} 

/**
 * Gọi API: GET /api/get-schedule-doctor-by-date?doctorId=&date=
 * Mục đích: Lấy lịch khám của bác sĩ theo ngày.
 * Ai gọi tới: DoctorSchedule, BookingModal.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const getScheduleDoctorByDateService = (doctorId, date) => {
    return axios.get(`/api/get-schedule-doctor-by-date?doctorId=${doctorId}&date=${date}`)
}

// Lấy các khung giờ đã có lịch của bác sĩ trong một ngày (để tô nền xanh)
/**
 * Gọi API: GET /api/get-booked-schedule-by-doctor-date?doctorId=&date=
 * Mục đích: Lấy các khung giờ đã có lịch (để tô nền xanh).
 * Ai gọi tới: ManageSchedule.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const getBookedScheduleByDoctorDateService = (doctorId, date) => {
    return axios.get(`/api/get-booked-schedule-by-doctor-date?doctorId=${doctorId}&date=${date}`)
}

/**
 * Gọi API: GET /api/get-extra-info-doctor-by-id?doctorId=<inputId>
 * Mục đích: Lấy thông tin thêm: giá khám, thanh toán, tỉnh/thành.
 * Ai gọi tới: DoctorExtraInfo.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const getExtraInfoDoctorByIdService = (inputId) => {
    return axios.get(`/api/get-extra-info-doctor-by-id?doctorId=${inputId}`)
}

/**
 * Gọi API: GET /api/get-profile-doctor-by-id?doctorId=<doctorId>
 * Mục đích: Lấy hồ sơ rút gọn của bác sĩ.
 * Ai gọi tới: ProfileDoctor.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const getProfileDoctorByIdService = (doctorId) => {
    return axios.get(`/api/get-profile-doctor-by-id?doctorId=${doctorId}`)
}

/**
 * Gọi API: POST /api/patient-book-appointment
 * Mục đích: Đặt lịch khám cho khách hàng.
 * Ai gọi tới: BookingModal.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const postPatientBookingService = (data) => {
    // Timeout 30s: tránh treo vô hạn nếu backend/mạng không phản hồi.
    // Backend đã trả kết quả trước khi gửi mail, nên bình thường chỉ ~1s.
    return axios.post('/api/patient-book-appointment', data, { timeout: 30000 })
} 

/**
 * Gọi API: POST /api/verify-book-appointment
 * Mục đích: Xác nhận lịch khám (S1 -> S2).
 * Ai gọi tới: VerifyEmail.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const postVerifyBookingService = (data) => {
    return axios.post('/api/verify-book-appointment', data)
} 

/**
 * Gọi API: POST /api/create-new-specialty
 * Mục đích: Tạo mới chuyên khoa.
 * Ai gọi tới: ManageSpecialty.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const createNewSpecialtyService = (data) => {
    return axios.post('/api/create-new-specialty', data)
} 

/**
 * Gọi API: GET /api/get-all-specialty
 * Mục đích: Lấy danh sách tất cả chuyên khoa kèm ảnh.
 * Ai gọi tới: Specialty, AllSpecialty, ManageSpecialty, adminActions.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const getAllSpecialtyService = () => {
    return axios.get(`/api/get-all-specialty`)
}

/**
 * Gọi API: GET /api/get-detail-specialty-by-id?id=&location=
 * Mục đích: Lấy chi tiết chuyên khoa + bác sĩ theo địa điểm.
 * Ai gọi tới: DetailSpecialty.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const getDetailSpecialtyByIdService = (data) => { 
    return axios.get(`/api/get-detail-specialty-by-id?id=${data.id}&location=${data.location}`)
}

/**
 * Gọi API: POST /api/create-new-clinic
 * Mục đích: Tạo mới phòng khám.
 * Ai gọi tới: ManageClinic.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const createNewClinicService = (data) => {
    return axios.post('/api/create-new-clinic', data)
} 

/**
 * Gọi API: GET /api/get-all-clinic
 * Mục đích: Lấy danh sách tất cả phòng khám kèm ảnh.
 * Ai gọi tới: MedicalFacility, AllClinic, ManageClinic, adminActions.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const getAllClinicService = () => {
    return axios.get(`/api/get-all-clinic`)
}

/**
 * Gọi API: GET /api/get-detail-clinic-by-id?id=
 * Mục đích: Lấy chi tiết phòng khám + bác sĩ thuộc phòng khám.
 * Ai gọi tới: DetailClinic.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const getDetailClinicByIdService = (data) => { 
    return axios.get(`/api/get-detail-clinic-by-id?id=${data.id}`)
}

/**
 * Gọi API: GET /api/get-list-patient-for-doctor?doctorId=&date=&statusId=
 * Mục đích: Lấy danh sách bệnh nhân đã đặt lịch của bác sĩ.
 * Ai gọi tới: ManagePatient.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const getListPatientForDoctorService = (data) => {
    return axios.get(`/api/get-list-patient-for-doctor?doctorId=${data.doctorId}&date=${data.date}&statusId=${data.statusId}`)
}

/**
 * Gọi API: POST /api/send-remedy
 * Mục đích: Bác sĩ gửi kết quả khám + hoá đơn qua email.
 * Ai gọi tới: ManagePatient (modal RemedyModal).
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const sendRemedyService = (data) => {
    return axios.post('/api/send-remedy', data)
} 

/**
 * Gọi API: POST /api/create-new-handbook
 * Mục đích: Tạo mới bài cẩm nang.
 * Ai gọi tới: ManageHandBook.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const createNewHandBookService = (data) => {
    return axios.post('/api/create-new-handbook', data)
} 

/**
 * Gọi API: GET /api/get-all-handbook
 * Mục đích: Lấy danh sách tất cả bài cẩm nang kèm ảnh.
 * Ai gọi tới: HandBook, AllHandbook, ManageHandBook.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const getAllHandbookService = () => {
    return axios.get(`/api/get-all-handbook`)
}

/**
 * Gọi API: GET /api/get-detail-handbook-by-id?id=
 * Mục đích: Lấy chi tiết một bài cẩm nang.
 * Ai gọi tới: DetailHandBook.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const getDetailHandbookByIdService = (data) => { 
    return axios.get(`/api/get-detail-handbook-by-id?id=${data.id}`)
}

/**
 * Gọi API: GET /api/get-specialty-by-name?name=<nameInput>
 * Mục đích: Tìm chuyên khoa theo tên (gần đúng).
 * Ai gọi tới: adminActions.fetchSearchSpecialty() <- HomeHeader.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const getSpecialtyByNameService = (nameInput) => { 
    return axios.get(`/api/get-specialty-by-name?name=${nameInput}`) 
}

/**
 * Gọi API: POST /api/cancel-patient
 * Mục đích: Huỷ lịch hẹn (S1 -> S4).
 * Ai gọi tới: ManagePatient.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const cancelPatientService = (data) => {
    return axios.post('/api/cancel-patient', data)
} 

// ==================== CHUYÊN KHOA: sửa / xoá ====================
/**
 * Gọi API: PUT /api/edit-specialty
 * Mục đích: Cập nhật chuyên khoa.
 * Ai gọi tới: ManageSpecialty.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const editSpecialtyService = (data) => {
    return axios.put('/api/edit-specialty', data)
}

/**
 * Gọi API: DELETE /api/delete-specialty
 * Mục đích: Xoá chuyên khoa (id trong body).
 * Ai gọi tới: ManageSpecialty.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const deleteSpecialtyService = (id) => {
    return axios.delete('/api/delete-specialty', { data: { id: id } })
}

// ==================== PHÒNG KHÁM / CƠ SỞ Y TẾ: sửa / xoá ====================
/**
 * Gọi API: PUT /api/edit-clinic
 * Mục đích: Cập nhật phòng khám.
 * Ai gọi tới: ManageClinic.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const editClinicService = (data) => {
    return axios.put('/api/edit-clinic', data)
}

/**
 * Gọi API: DELETE /api/delete-clinic
 * Mục đích: Xoá phòng khám (id trong body).
 * Ai gọi tới: ManageClinic.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const deleteClinicService = (id) => {
    return axios.delete('/api/delete-clinic', { data: { id: id } })
}

// ==================== CẨM NANG: sửa / xoá ====================
/**
 * Gọi API: PUT /api/edit-handbook
 * Mục đích: Cập nhật bài cẩm nang.
 * Ai gọi tới: ManageHandBook.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const editHandbookService = (data) => {
    return axios.put('/api/edit-handbook', data)
}

/**
 * Gọi API: DELETE /api/delete-handbook
 * Mục đích: Xoá bài cẩm nang (id trong body).
 * Ai gọi tới: ManageHandBook.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const deleteHandbookService = (id) => {
    return axios.delete('/api/delete-handbook', { data: { id: id } })
}

// ==================== KHU VỰC HERO TRANG CHỦ (chỉnh sửa động) ====================
/**
 * Gọi API: GET /api/get-homepage-settings
 * Mục đích: Lấy cấu hình hero trang chủ.
 * Ai gọi tới: HomeHeader, ManageHomepage.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const getHomepageSettingsService = () => {
    return axios.get('/api/get-homepage-settings')
}

/**
 * Gọi API: PUT /api/update-homepage-settings
 * Mục đích: Cập nhật cấu hình hero trang chủ.
 * Ai gọi tới: ManageHomepage.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const updateHomepageSettingsService = (data) => {
    return axios.put('/api/update-homepage-settings', data)
}

// ==================== Ô DỊCH VỤ DƯỚI BANNER ====================
/**
 * Gọi API: GET /api/get-all-service-items
 * Mục đích: Lấy danh sách ô dịch vụ dưới banner.
 * Ai gọi tới: HomeHeader, ManageHomepage.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const getAllServiceItemsService = () => {
    return axios.get('/api/get-all-service-items')
}

/**
 * Gọi API: POST /api/create-service-item
 * Mục đích: Thêm mới một ô dịch vụ.
 * Ai gọi tới: ManageHomepage.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const createServiceItemService = (data) => {
    return axios.post('/api/create-service-item', data)
}

/**
 * Gọi API: PUT /api/update-service-item
 * Mục đích: Cập nhật / bật-tắt một ô dịch vụ.
 * Ai gọi tới: ManageHomepage.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const updateServiceItemService = (data) => {
    return axios.put('/api/update-service-item', data)
}

/**
 * Gọi API: DELETE /api/delete-service-item
 * Mục đích: Xoá một ô dịch vụ (id trong body).
 * Ai gọi tới: ManageHomepage.
 * Trả về: Promise — dữ liệu JSON của backend (interceptor trong `src/axios.js`
 *         đã bóc sẵn `response.data`, nên nơi gọi nhận trực tiếp object JSON).
 */
const deleteServiceItemService = (id) => {
    return axios.delete('/api/delete-service-item', { data: { id: id } })
}

export {
    handleLoginApi, createNewHandBookService, getAllHandbookService, cancelPatientService,
    getAllUsers, getDetailHandbookByIdService,
    createNewUserService, getSpecialtyByNameService,
    deleteUserService,
    editUserService,
    getAllCodeService,
    getTopDoctorHomeService,
    getAllDoctorsService,
    saveDetailDoctorService,
    getDetailDoctorInfoService,
    saveScheduleDoctorsService,
    getScheduleDoctorByDateService,
    getBookedScheduleByDoctorDateService,
    getExtraInfoDoctorByIdService,
    getProfileDoctorByIdService,
    postPatientBookingService,
    postVerifyBookingService,
    createNewSpecialtyService,
    getAllSpecialtyService,
    getDetailSpecialtyByIdService,
    createNewClinicService,
    getAllClinicService,
    getDetailClinicByIdService,
    getListPatientForDoctorService,
    sendRemedyService,
    editSpecialtyService,
    deleteSpecialtyService,
    editClinicService,
    deleteClinicService,
    editHandbookService,
    deleteHandbookService,
    getHomepageSettingsService,
    updateHomepageSettingsService,
    getAllServiceItemsService,
    createServiceItemService,
    updateServiceItemService,
    deleteServiceItemService,
}
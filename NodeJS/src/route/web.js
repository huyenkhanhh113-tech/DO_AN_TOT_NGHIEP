/**
 * Khai báo TOÀN BỘ route của backend và gắn chúng vào app Express.
 *
 * - Ai gọi: `src/server.js` (bước 5 khi khởi động).
 * - Gọi tiếp: các hàm trong `src/controllers/*` (mỗi route trỏ tới 1 hàm).
 * - Bảng: không truy cập DB trực tiếp.
 * - Trả về: `app` sau khi đã `app.use("/", router)`.
 *
 * Nhóm route:
 *   1. Trang demo EJS       : /, /about, /crud, /post-crud, /get-crud, ...
 *   2. Người dùng           : /api/login, /api/get-all-users, /api/create-new-user, ...
 *   3. Bác sĩ               : /api/top-doctor-home, /api/save-info-doctors, ...
 *   4. Đặt lịch bệnh nhân   : /api/patient-book-appointment, /api/verify-book-appointment
 *   5. Chuyên khoa          : /api/create-new-specialty, /api/get-all-specialty, ...
 *   6. Phòng khám           : /api/create-new-clinic, /api/get-all-clinic, ...
 *   7. Cẩm nang             : /api/create-new-handbook, /api/get-all-handbook, ...
 *   8. CMS trang chủ        : /api/get-homepage-settings, /api/get-all-service-items, ...
 *
 * Lưu ý: các route DELETE nhận `id` trong **body** (`req.body.id`), không phải query.
 */
import express from "express";
import homeController from "../controllers/homeController";
import userController from "../controllers/userController";
import doctorController from "../controllers/doctorController";
import patientController from "../controllers/patientController"
import specialtyController from "../controllers/specialtyController";
import clinicController from "../controllers/clinicController"
import handbookController from '../controllers/handbookController'
import homepageController from '../controllers/homepageController'

let router = express.Router()

let initWebRoutes = (app) => {
    router.get('/', homeController.getHomePage)
    router.get('/about', homeController.getAboutPage)
    router.get('/crud', homeController.getCRUD) // lấy tất cả người dùng
    
    router.post('/post-crud', homeController.postCRUD) // thêm người dùng
    router.get('/get-crud', homeController.displayGetCRUD) // xem tất cả người dùng
    router.get('/edit-crud', homeController.getEditCRUD) // lấy dữ liệu cần sửa
    router.post('/put-crud', homeController.putCRUD)
    router.get('/delete-crud', homeController.deleteCRUD)

    // REST API
    // NGƯỜI DÙNG (USER)
    router.post('/api/login', userController.handleLogin)
    router.get('/api/get-all-users', userController.handleGetAllUsers)
    router.post('/api/create-new-user', userController.handleCreateNewUser)
    router.put('/api/edit-user', userController.handleEditUser)
    router.delete('/api/delete-user', userController.handleDeleteUser)
    router.get('/api/allcode', userController.getAllCode)

    // BÁC SĨ (DOCTOR)
    router.get('/api/top-doctor-home', doctorController.getTopDoctorHome)
    router.get('/api/get-all-doctors', doctorController.getAllDoctors)
    router.post('/api/save-info-doctors', doctorController.postInfoDoctors)
    router.get('/api/get-detail-doctor-by-id', doctorController.getDetailDoctorById)
    router.post('/api/bulk-create-schedule', doctorController.postScheduleDoctors)
    router.get('/api/get-schedule-doctor-by-date', doctorController.getScheduleDoctorByDate)
    // Lấy các khung giờ đã có lịch (để tô nền xanh trên trang quản lý kế hoạch khám bệnh)
    router.get('/api/get-booked-schedule-by-doctor-date', doctorController.getBookedScheduleByDoctorDate)
    router.get('/api/get-extra-info-doctor-by-id', doctorController.getExtraInfoDoctorById)
    router.get('/api/get-profile-doctor-by-id', doctorController.getProfileDoctorById)
    router.get('/api/get-list-patient-for-doctor', doctorController.getListPatientForDoctor)
    router.post('/api/send-remedy', doctorController.sendRemedy)
    router.post('/api/cancel-patient', doctorController.cancelPatient)

    // ĐẶT LỊCH CỦA BỆNH NHÂN (PATIENT BOOKING)
    router.post('/api/patient-book-appointment', patientController.postBookAppointment)
    router.post('/api/verify-book-appointment', patientController.postVerifyBookAppointment)

    // CHUYÊN KHOA (SPECIALTY)
    router.post('/api/create-new-specialty', specialtyController.createSpecialty)
    router.get('/api/get-all-specialty', specialtyController.getAllSpecialty)
    router.get('/api/get-detail-specialty-by-id', specialtyController.getDetailSpecialtyById)
    router.get('/api/get-specialty-by-name', specialtyController.getSpecialtyByName)
    router.put('/api/edit-specialty', specialtyController.editSpecialty)
    router.delete('/api/delete-specialty', specialtyController.deleteSpecialty)

    // PHÒNG KHÁM (CLINIC)
    router.post('/api/create-new-clinic', clinicController.createClinic)
    router.get('/api/get-all-clinic', clinicController.getAllClinic)
    router.get('/api/get-detail-clinic-by-id', clinicController.getDetailClinicById)
    router.put('/api/edit-clinic', clinicController.editClinic)
    router.delete('/api/delete-clinic', clinicController.deleteClinic)

    // CẨM NANG (HANDBOOK)
    router.post('/api/create-new-handbook', handbookController.createHandbook)
    router.get('/api/get-all-handbook', handbookController.getAllHandbook)
    router.get('/api/get-detail-handbook-by-id', handbookController.getDetailHandbookById)
    router.put('/api/edit-handbook', handbookController.editHandbook)
    router.delete('/api/delete-handbook', handbookController.deleteHandbook)

    // KHU VỰC HERO TRANG CHỦ (HOMEPAGE CMS — chỉnh sửa động)
    // Cấu hình banner đầu trang (một dòng duy nhất).
    router.get('/api/get-homepage-settings', homepageController.getHomepageSettings)
    router.put('/api/update-homepage-settings', homepageController.updateHomepageSettings)
    // Các ô dịch vụ tròn bên dưới banner.
    router.get('/api/get-all-service-items', homepageController.getAllServiceItems)
    router.post('/api/create-service-item', homepageController.createServiceItem)
    router.put('/api/update-service-item', homepageController.updateServiceItem)
    router.delete('/api/delete-service-item', homepageController.deleteServiceItem)

    return app.use("/", router)
}

module.exports = initWebRoutes;
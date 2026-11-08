import doctorService from "../services/doctorService";

/**
 * API: GET /api/top-doctor-home?limit=
 * Chức năng: Lấy N bác sĩ mới nhất cho mục "Bác sĩ nổi bật" trang chủ.
 * Gọi tiếp: doctorService.getTopDoctorHomeService(req.query.limit).
 * Bảng DB: users + allcodes + doctor_info + specialties.
 * Ai gọi tới: fetchTopDoctor() <- OutStandingDoctor / AllDoctor.
 * Trả về: { errCode, data: [...] }.
 */
let getTopDoctorHome = async (req, res) => {
  let limit = req.query.limit;
  if (!limit) limit = 10;
  try {
    let result = await doctorService.getTopDoctorHomeService(+limit);
    return res.status(200).json(result);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      message: "Error from server ...",
    });
  }
};

/**
 * API: GET /api/get-all-doctors
 * Chức năng: Lấy danh sách rút gọn của tất cả bác sĩ (không kèm ảnh).
 * Gọi tiếp: doctorService.getAllDoctorsService().
 * Bảng DB: users (SELECT, bỏ password & image).
 * Ai gọi tới: fetchAllDoctors() <- ManageDoctor / ManageSchedule.
 * Trả về: { errCode, data: [...] }.
 */
let getAllDoctors = async (req, res) => {
  try {
    let doctors = await doctorService.getAllDoctorsService();
    return res.status(200).json(doctors);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      message: "Error from server ...",
    });
  }
};

/**
 * API: POST /api/save-info-doctors
 * Chức năng: Lưu "Thông tin bác sĩ": mô tả, giá khám, thanh toán, địa chỉ.
 * Gọi tiếp: doctorService.postInfoDoctorsService(req.body).
 * Bảng DB: markdowns + doctor_info (INSERT/UPDATE).
 * Ai gọi tới: postInfoDoctorsService() <- ManageDoctor.
 * Trả về: { errCode, errMessage }.
 */
let postInfoDoctors = async (req, res) => {
  try {
    let result = await doctorService.postInfoDoctorsService(req.body);
    return res.status(200).json(result);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      message: "Error from server ...",
    });
  }
};

/**
 * API: GET /api/get-detail-doctor-by-id?id=
 * Chức năng: Lấy chi tiết hồ sơ bác sĩ.
 * Gọi tiếp: doctorService.getDetailDoctorByIdService(req.query.id).
 * Bảng DB: users + markdowns + allcodes + doctor_info.
 * Ai gọi tới: getDetailDoctorByIdService() <- DetailDoctor.
 * Trả về: { errCode, data }.
 */
let getDetailDoctorById = async (req, res) => {
  try {
    let info = await doctorService.getDetailDoctorByIdService(req.query.id);
    return res.status(200).json(info);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      message: "Error from server ...",
    });
  }
};

/**
 * API: POST /api/bulk-create-schedule
 * Chức năng: Lưu lịch khám của bác sĩ trong một ngày (chỉ thêm).
 * Gọi tiếp: doctorService.postScheduleDoctorsService(req.body).
 * Bảng DB: schedules (SELECT + bulkCreate).
 * Ai gọi tới: postScheduleDoctorsService() <- ManageSchedule.
 * Trả về: { errCode, errMessage }.
 */
let postScheduleDoctors = async (req, res) => {
  try {
    let info = await doctorService.postScheduleDoctorsService(req.body);
    return res.status(200).json(info);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      message: "Error from server ...",
    });
  }
};

/**
 * API: GET /api/get-schedule-doctor-by-date?doctorId=&date=
 * Chức năng: Lấy lịch khám của bác sĩ theo ngày (kèm tên khung giờ).
 * Gọi tiếp: doctorService.getScheduleDoctorByDateService(req.query.doctorId, req.query.date).
 * Bảng DB: schedules + allcodes + users.
 * Ai gọi tới: getScheduleDoctorByDateService() <- DoctorSchedule / BookingModal.
 * Trả về: { errCode, data: [...] }.
 */
let getScheduleDoctorByDate = async (req, res) => {
  try {
    let info = await doctorService.getScheduleDoctorByDateService(
      req.query.doctorId,
      req.query.date
    );
    return res.status(200).json(info);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      message: "Error from server ...",
    });
  }
};

// Lấy danh sách khung giờ đã có lịch của bác sĩ trong một ngày
/**
 * API: GET /api/get-booked-schedule-by-doctor-date?doctorId=&date=
 * Chức năng: Lấy các khung giờ đã có lịch (để tô nền xanh).
 * Gọi tiếp: doctorService.getBookedScheduleByDoctorDateService(...).
 * Bảng DB: schedules (SELECT).
 * Ai gọi tới: getBookedScheduleByDoctorDate() <- ManageSchedule.
 * Trả về: { errCode, errMessage, data, bookedTimeTypes }.
 */
let getBookedScheduleByDoctorDate = async (req, res) => {
  try {
    let info = await doctorService.getBookedScheduleByDoctorDateService(
      req.query.doctorId,
      req.query.date
    );
    return res.status(200).json(info);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      message: "Error from server ...",
    });
  }
};

/**
 * API: GET /api/get-extra-info-doctor-by-id?id=
 * Chức năng: Lấy thông tin thêm: giá khám, thanh toán, tỉnh/thành, phòng khám.
 * Gọi tiếp: doctorService.getExtraInfoDoctorByIdService(req.query.id).
 * Bảng DB: doctor_info + allcodes.
 * Ai gọi tới: getExtraInfoDoctorByIdService() <- DoctorExtraInfo.
 * Trả về: { errCode, data }.
 */
let getExtraInfoDoctorById = async (req, res) => {
  try {
    let info = await doctorService.getExtraInfoDoctorByIdService(
      req.query.doctorId
    );
    return res.status(200).json(info);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      message: "Error from server ...",
    });
  }
};

/**
 * API: GET /api/get-profile-doctor-by-id?id=
 * Chức năng: Lấy hồ sơ rút gọn của bác sĩ (modal đặt lịch, khối giới thiệu).
 * Gọi tiếp: doctorService.getProfileDoctorByIdService(req.query.id).
 * Bảng DB: users + markdowns + allcodes + doctor_info.
 * Ai gọi tới: getProfileDoctorByIdService() <- ProfileDoctor.
 * Trả về: { errCode, data }.
 */
let getProfileDoctorById = async (req, res) => {
  try {
    let info = await doctorService.getProfileDoctorByIdService(
      req.query.doctorId
    );
    return res.status(200).json(info);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      message: "Error from server ...",
    });
  }
};

/**
 * API: GET /api/get-list-patient-for-doctor?doctorId=&date=&statusId=
 * Chức năng: Lấy danh sách bệnh nhân đã đặt lịch của bác sĩ trong ngày.
 * Gọi tiếp: doctorService.getListPatientForDoctorService(...).
 * Bảng DB: bookings + users + allcodes.
 * Ai gọi tới: getListPatientForDoctorService() <- ManagePatient.
 * Trả về: { errCode, data: [...] }.
 */
let getListPatientForDoctor = async (req, res) => {
  try {
    let info = await doctorService.getListPatientForDoctorService(
      req.query.doctorId,
      req.query.date,
      req.query.statusId
    );
    return res.status(200).json(info);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      message: "Error from server ...",
    });
  }
};

/**
 * API: POST /api/send-remedy
 * Chức năng: Bác sĩ xác nhận khám xong, gửi kết quả + hoá đơn qua email.
 * Gọi tiếp: doctorService.sendRemedyService(req.body).
 * Bảng DB: bookings (UPDATE S2->S3) + gửi mail.
 * Ai gọi tới: sendRemedyService() <- RemedyModal / ManagePatient.
 * Trả về: { errCode, errMessage }.
 */
let sendRemedy = async (req, res) => {
  try {
    let info = await doctorService.sendRemedyService(req.body);
    return res.status(200).json(info);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      message: "Error from server ...",
    });
  }
};

/**
 * API: POST /api/cancel-patient
 * Chức năng: Huỷ lịch hẹn (chuyển S1 -> S4).
 * Gọi tiếp: doctorService.cancelPatientService(req.body).
 * Bảng DB: bookings (SELECT + UPDATE).
 * Ai gọi tới: cancelPatientService() <- ManagePatient.
 * Trả về: { errCode, errMessage }.
 */
let cancelPatient = async (req, res) => {
  try {
    let info = await doctorService.cancelPatientService(req.body);
    return res.status(200).json(info);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      message: "Error from server ...",
    });
  }
};

module.exports = {
  getTopDoctorHome: getTopDoctorHome,
  cancelPatient: cancelPatient,
  getAllDoctors: getAllDoctors,
  postInfoDoctors: postInfoDoctors,
  getDetailDoctorById: getDetailDoctorById,
  postScheduleDoctors: postScheduleDoctors,
  getScheduleDoctorByDate: getScheduleDoctorByDate,
  getBookedScheduleByDoctorDate: getBookedScheduleByDoctorDate,
  getExtraInfoDoctorById: getExtraInfoDoctorById,
  getProfileDoctorById: getProfileDoctorById,
  getListPatientForDoctor: getListPatientForDoctor,
  sendRemedy: sendRemedy,
};

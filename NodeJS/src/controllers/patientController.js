import patientService from "../services/patientService";

/**
 * API: POST /api/patient-book-appointment
 * Chức năng: Đặt lịch khám cho khách hàng.
 * Gọi tiếp: patientService.postBookAppointmentService(req.body).
 * Bảng DB: schedules + bookings + users.
 * Ai gọi tới: postPatientBookingService() <- BookingModal.
 * Trả về: { errCode, errMessage, confirmChannel, zaloLink, emailSent, emailError }.
 */
let postBookAppointment = async (req, res) => {
    try {
        let info = await patientService.postBookAppointmentService(req.body)
        return res.status(200).json(info)
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server ...'
        })
    }
}

/**
 * API: POST /api/verify-book-appointment
 * Chức năng: Xác nhận lịch khám khi khách bấm link trong mail (S1 -> S2).
 * Gọi tiếp: patientService.postVerifyBookAppointmentService(req.body).
 * Bảng DB: bookings (SELECT + UPDATE).
 * Ai gọi tới: postVerifyBookAppointment() <- trang /verify-booking.
 * Trả về: { errCode, errMessage }.
 */
let postVerifyBookAppointment = async (req, res) => {
    try {
        let info = await patientService.postVerifyBookAppointmentService(req.body)
        return res.status(200).json(info)
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server ...'
        })
    }
}

module.exports = {
    postBookAppointment: postBookAppointment,
    postVerifyBookAppointment: postVerifyBookAppointment
}
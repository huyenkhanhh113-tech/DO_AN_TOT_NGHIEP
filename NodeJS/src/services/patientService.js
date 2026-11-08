import _ from "lodash";
import db from "../models/index";
import emailService from "./emailService"
import zaloHelper from "../utils/zaloHelper"
import { v4 as uuidv4 } from 'uuid';
import { Sequelize } from "sequelize";
const op = Sequelize.Op
require('dotenv').config()

/**
 * Tầng nghiệp vụ cho BỆNH NHÂN — đặt lịch và xác nhận lịch khám.
 * Được gọi từ `patientController.js`.
 *
 * Bảng truy cập: `schedules`, `bookings`, `users`.
 * Dịch vụ ngoài: `emailService` (gửi mail), `zaloHelper` (tạo link Zalo).
 */

/**
 * Đặt lịch khám bệnh cho khách hàng (API quan trọng nhất của luồng khách).
 *
 * - Ai gọi: `patientController.postBookAppointment`
 *   (POST /api/patient-book-appointment)
 *   <- `userService.postPatientBookingService()` <- `BookingModal.handleConfirmBooking()`.
 * - Gọi tiếp: `uuidv4()` (sinh token xác nhận), `buildUrlEmail()`,
 *   `sendConfirmation()` (gửi mail hoặc tạo link Zalo).
 * - Bảng:
 *     `schedules` — SELECT khung giờ, kiểm `currentNumber >= maxNumber` (hết chỗ),
 *                   sau đó UPDATE tăng `currentNumber` lên 1.
 *     `bookings`  — SELECT kiểm trùng, INSERT bản ghi lịch hẹn mới.
 *     `users`     — SELECT theo email; nếu chưa có thì INSERT tài khoản bệnh nhân
 *                   mới với `roleId = 'R3'`.
 * - Trả về: `{ errCode, errMessage, confirmChannel, zaloLink, confirmMessage,
 *             emailSent, emailError }`
 *     0 = đặt thành công; 1 = thiếu tham số; 2 = khung giờ đã đầy.
 *
 * Trạng thái sau khi đặt: `statusId = 'S1'` (chờ khách xác nhận qua link trong mail).
 * Lỗi gửi xác nhận KHÔNG làm hỏng việc đặt lịch — dữ liệu đã lưu DB trước đó.
 */
let postBookAppointmentService = (data) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!data.email || !data.doctorId || !data.timeType
                || !data.date || !data.fullName || !data.address || !data.selectedGender ) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            } else {
                let token = uuidv4()

                let scheduleBookingData = await db.Schedule.findOne({
                    where: {
                        doctorId: data.doctorId,
                        timeType: data.timeType,
                        date: data.date,
                    },
                    raw: false,
                    nest: true
                })

                

                if (scheduleBookingData && scheduleBookingData.currentNumber >= scheduleBookingData.maxNumber) {
                    resolve({
                        errCode: 2,
                        errMessage: 'Full patient booking in this time!'
                    })
                    return;
                }
                // Thêm mới hoặc cập nhật bệnh nhân
                let findBookingCheck = await db.Booking.findOne({
                    where: {
                        doctorId: data.doctorId,
                        date: data.date,
                    },
                    include: [
                        {
                            model: db.User, as: 'patientData',
                            where: {
                                email: data.email
                            },
                            
                        },
                    ],
                    raw: false,
                    nest: true
                })

                if (findBookingCheck) {
                    resolve({
                        errCode: 3,
                        errMessage: 'You can only book one appointment per day!'
                    })
                    return;
                }

                let user = await db.User.findOrCreate({
                    where: {email: data.email},
                    defaults: {
                        email: data.email,
                        roleId: 'R3',
                        address: data.address,
                        gender: data.selectedGender,
                        firstName: data.fullName
                    },
                })

                // Tạo bản ghi đặt lịch
                if (user && user[0]) {
                    // Kênh xác nhận khách hàng chọn: 'email' (mặc định) hoặc 'zalo'
                    let confirmChannel = data.confirmChannel === 'zalo' ? 'zalo' : 'email'
                    let contactPhone = data.contactPhone || data.phoneNumber || ''

                    let bookingObj = await db.Booking.findOrCreate({
                        where: { patientId: user[0].id, date: data.date, doctorId: data.doctorId },
                        defaults: {
                            statusId: 'S1',
                            doctorId : data.doctorId,
                            patientId : user[0].id,
                            date : data.date,
                            timeType: data.timeType,
                            token: token,
                            confirmChannel: confirmChannel,
                            contactPhone: contactPhone
                        }
                    })

                    scheduleBookingData.currentNumber = scheduleBookingData.currentNumber + 1

                    await scheduleBookingData.save()

                    // Chỉ gửi xác nhận cho lần đặt mới (token khớp), tránh gửi trùng.
                    if (bookingObj[0].token === token) {
                        let confirmResult = await sendConfirmation(confirmChannel, {
                            receiverEmail: data.email,
                            patientName: data.fullName,
                            time: data.timeString,
                            doctorName: data.doctorName,
                            language: data.language,
                            redirectLink: buildUrlEmail(data.doctorId, token),
                            contactPhone: contactPhone
                        })

                        resolve({
                            errCode: 0,
                            errMessage: 'Save book appointment succeed!',
                            confirmChannel: confirmChannel,
                            // Link Zalo để frontend mở ngay (chỉ có khi chọn kênh Zalo)
                            zaloLink: confirmResult && confirmResult.zaloLink ? confirmResult.zaloLink : '',
                            confirmMessage: confirmResult && confirmResult.message ? confirmResult.message : '',
                            // Trạng thái gửi mail (để UI cảnh báo nếu gửi thất bại)
                            emailSent: confirmResult && confirmResult.emailSent === true,
                            emailError: confirmResult && confirmResult.emailError ? confirmResult.emailError : ''
                        })
                        return
                    }
                }

                resolve({
                    errCode: 0,
                    errMessage: 'Save book appointment succeed!',
                    confirmChannel: data.confirmChannel === 'zalo' ? 'zalo' : 'email'
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Tạo đường link xác nhận lịch khám để chèn vào nội dung email.
 *
 * - Ai gọi: `postBookAppointmentService()` (khi chuẩn bị dữ liệu gửi mail).
 * - Bảng: không truy cập DB.
 * - Trả về: **chuỗi** dạng
 *   `${URL_REACT}/verify-booking?token=<token>&doctorId=<doctorId>`
 *   (`URL_REACT` lấy từ `.env`, mặc định `http://localhost:3000`).
 *
 * Khách bấm link này -> frontend gọi `postVerifyBookAppointmentService()` để
 * chuyển trạng thái S1 -> S2.
 */
let buildUrlEmail = (doctorId, token) => {
    let result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`
    return result
}

/**
 * Gửi xác nhận lịch khám theo KÊNH khách hàng đã chọn.
 *
 * - Ai gọi: `postBookAppointmentService()` (sau khi đã lưu booking).
 * - Gọi tiếp:
 *     kênh `'zalo'`  -> `zaloHelper.sendZaloConfirmation()` (tạo link + nội dung)
 *     kênh `'email'` -> `emailService.sendSimpleEmail()` (gửi mail thật qua SMTP)
 * - Bảng: không truy cập DB (chỉ dùng dữ liệu truyền vào).
 * - Trả về: object kết quả
 *     - Zalo : `{ errCode, zaloLink, message, status }`
 *     - Email: `{ errCode: 0, message: '', emailSent: true, emailInfo }`
 *     - Lỗi  : `{ errCode: -1, emailSent: false, emailError }`
 *
 * Lỗi gửi mail được **nuốt** tại đây (không throw) để không làm hỏng việc đặt
 * lịch, nhưng có log `>>> GUI MAIL THAT BAI` và trả `emailSent: false` để
 * frontend cảnh báo khách.
 */
let sendConfirmation = async (channel, dataSend) => {
    try {
        if (channel === 'zalo') {
            return await zaloHelper.sendZaloConfirmation(dataSend)
        }

        let info = await emailService.sendSimpleEmail({
            receiverEmail: dataSend.receiverEmail,
            patientName: dataSend.patientName,
            time: dataSend.time,
            doctorName: dataSend.doctorName,
            language: dataSend.language,
            redirectLink: dataSend.redirectLink
        })
        return { errCode: 0, message: '', emailSent: true, emailInfo: info }
    } catch (e) {
        // Ghi log rõ ràng để dễ chẩn đoán (thường gặp: lỗi TLS chứng chỉ, sai App Password)
        console.log('>>> GUI MAIL THAT BAI:', e.code || '', '-', e.message)
        return {
            errCode: -1,
            errMessage: 'Send confirmation failed!',
            emailSent: false,
            emailError: e.message
        }
    }
}

/**
 * Xác nhận lịch khám khi khách bấm link trong email (chuyển S1 -> S2).
 *
 * - Ai gọi: `patientController.postVerifyBookAppointment`
 *   (POST /api/verify-book-appointment)
 *   <- `userService.postVerifyBookAppointment()` <- trang `/verify-booking`
 *      (đọc `token` và `doctorId` từ query string của link trong mail).
 * - Bảng: `bookings` (SELECT theo doctorId + token + `statusId = 'S1'`,
 *   sau đó UPDATE `statusId` thành `'S2'`).
 * - Trả về: `{ errCode, errMessage }`
 *     0 = "Update the status appointment succeed!"
 *     1 = thiếu tham số
 *     2 = lịch không tồn tại **hoặc đã được kích hoạt trước đó**
 *         (chặn bấm link 2 lần).
 *
 * `raw: false` là bắt buộc — nếu `true` thì không gọi được `.save()`.
 */
let postVerifyBookAppointmentService = (data) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!data.token || !data.doctorId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            } else {
                let appointment = await db.Booking.findOne({
                    where: { doctorId: data.doctorId, token: data.token, statusId: 'S1' },
                    raw: false // phải để false mới cập nhật được
                })

                if (appointment) {
                    appointment.statusId = 'S2'
                    await appointment.save()

                    resolve({
                        errCode: 0,
                        errMessage: 'Update the status appointment succeed!'
                    })
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: 'Appointment has been activated or does not exist!'
                    })
                }
            }
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    postBookAppointmentService: postBookAppointmentService,
    postVerifyBookAppointmentService: postVerifyBookAppointmentService
}
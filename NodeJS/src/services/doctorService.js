import _ from "lodash";
import db from "../models/index";
require('dotenv').config()
import emailService from '../services/emailService'
import { bufferToDataUri } from "../utils/imageHelper"

/**
 * Tầng nghiệp vụ cho BÁC SĨ — file lớn nhất của backend.
 * Được gọi từ `doctorController.js` (và một phần từ `patientService.js`
 * khi cần gửi mail kết quả khám).
 *
 * Nhóm chức năng:
 *   1. Trang chủ / danh sách bác sĩ : getTopDoctorHomeService, getAllDoctorsService
 *   2. Hồ sơ bác sĩ (admin nhập)    : postInfoDoctorsService, getDetailDoctorByIdService
 *   3. Lịch khám                    : postScheduleDoctorsService,
 *                                     getScheduleDoctorByDateService,
 *                                     getBookedScheduleByDoctorDateService
 *   4. Thông tin thêm / profile     : getExtraInfoDoctorByIdService,
 *                                     getProfileDoctorByIdService
 *   5. Nghiệp vụ khám bệnh          : getListPatientForDoctorService,
 *                                     sendRemedyService, cancelPatientService
 *
 * Bảng truy cập: `users`, `doctor_info`, `markdowns`, `allcodes`,
 * `specialties`, `schedules`, `bookings`.
 */

// Số bệnh nhân tối đa cho mỗi khung giờ. Đọc từ .env.
// ⚠️ LƯU Ý: biến trong .env hiện đã bị đổi tên thành MAX_JXQKXD_FTZFUYGI
// nên giá trị này đang là `undefined` -> xem file .workbuddy (Phần 10).
const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE

/**
 * Lấy N bác sĩ mới nhất để hiển thị ở mục "Bác sĩ nổi bật" trên trang chủ.
 *
 * - Ai gọi: `doctorController.getTopDoctorsHome` (GET /api/top-doctor-home?limit=)
 *   <- frontend `userService.fetchTopDoctor()` <- `OutStandingDoctor` / `AllDoctor`.
 * - Bảng: `users` (lọc roleId='R2', sắp xếp createdAt giảm dần, loại `password`)
 *   JOIN `allcodes` (2 lần: chức danh + giới tính)
 *   JOIN `doctor_info` JOIN `specialties`.
 * - Trả về: `{ errCode: 0, data: [...] }` — mỗi phần tử là object phẳng
 *   (`raw + nest`) gồm thông tin user, `positionData`, `genderData`,
 *   `Doctor_Info` (trong đó có `Specialty.name`), và `image` đã đổi thành data-URI.
 *
 * Vì dùng `raw: true` nên `image` là Buffer thô -> phải map thủ công sang data-URI.
 */
let getTopDoctorHomeService = (limitInput) => {
    return new Promise(async(resolve, reject) => {
        try {
            let users = await db.User.findAll({
                limit: limitInput,
                where: {roleId: 'R2'},
                order: [['createdAt', 'DESC']],
                attributes: { exclude: ['password'] },
                include: [
                    { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                    { model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi'] },
                    {
                        model: db.Doctor_Info,
                        include: [
                            { model: db.Specialty, attributes: ['name'] },
                        ]
                    },
                ],
                raw: true,
                nest: true
            })

            // LƯU Ý: raw + nest trả về object PHẲNG, nên `image` là Buffer thô.
            // Phải map thủ công sang data-URI để đúng hợp đồng ảnh của API.
            if (users && users.length > 0) {
                users = users.map(item => {
                    item.image = bufferToDataUri(item.image)
                    return item
                })
            }

            resolve({
                errCode: 0,
                data: users
            })
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Lấy danh sách rút gọn của TẤT CẢ bác sĩ (chỉ id, tên, email...).
 *
 * - Ai gọi: `doctorController.getAllDoctors` (GET /api/get-all-doctors).
 * - Bảng: `users` (lọc roleId='R2', **loại trừ `password` và `image`**).
 * - Trả về: `{ errCode: 0, data: [...] }` — mảng instance Sequelize.
 *
 * Dùng cho các ô chọn bác sĩ (dropdown) nên cố tình bỏ ảnh để payload nhẹ.
 * Nếu cần ảnh thì dùng `getTopDoctorHomeService` hoặc `getDetailDoctorByIdService`.
 */
let getAllDoctorsService = () => {
    return new Promise(async(resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                where: { roleId: 'R2' },
                attributes: { exclude: ['password', 'image'] },
            })

            resolve({
                errCode: 0,
                data: doctors
            })
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Kiểm tra dữ liệu đầu vào của form "Thông tin bác sĩ" có đủ trường bắt buộc không.
 *
 * - Ai gọi: `postInfoDoctorsService()` (ngay bên dưới, trong cùng file).
 * - Bảng: KHÔNG truy cập DB (chỉ kiểm tra object đầu vào).
 * - Trả về: `{ isValid: boolean, element: string }`
 *     - `isValid = true`  -> hợp lệ.
 *     - `isValid = false` -> `element` là **tên trường đầu tiên bị thiếu**
 *       (dùng để ghép thông báo lỗi cho người dùng).
 *
 * 11 trường bắt buộc: doctorId, contentHTML, contentMarkdown, action,
 * selectedPrice, selectedPayment, selectedProvince, nameClinic,
 * addressClinic, note, specialtyId.
 */
let checkRequiredField = (inputData) => {
    let arr = ['doctorId', 'contentHTML', 'contentMarkdown', 'action', 'selectedPrice', 'selectedPayment',
        'selectedProvince', 'nameClinic', 'addressClinic', 'note', 'specialtyId'
    ]
    let isValid = true
    let element = ''

    for (let i = 0; i < arr.length; i++){
        if (!inputData[arr[i]]) {
            isValid = false
            element = arr[i]
            break
        }
    }
    return {
        isValid: isValid,
        element: element
    }
}

/**
 * Lưu "Thông tin bác sĩ" do admin nhập: mô tả + giá khám + thanh toán + địa chỉ.
 *
 * - Ai gọi: `doctorController.postInfoDoctors` (POST /api/save-info-doctors)
 *   <- trang `/system/manage-doctor` (khu vực quản trị).
 * - Gọi tiếp: `checkRequiredField()` để validate.
 * - Bảng:
 *     `markdowns`   — CREATE nếu `action = 'CREATE'`, UPDATE nếu `action = 'EDIT'`
 *                     (mỗi bác sĩ có 1 bản ghi markdown, tìm theo `doctorId`).
 *     `doctor_info` — nếu đã có thì UPDATE, chưa có thì CREATE
 *                     (giá, thanh toán, tỉnh/thành, tên & địa chỉ phòng khám,
 *                      ghi chú, chuyên khoa, phòng khám).
 * - Trả về: `{ errCode, errMessage }`
 *     0 = "Save info doctor succeed!"; 1 = thiếu tham số (kèm tên trường thiếu).
 *
 * Lưu ý: hàm này ghi vào 2 bảng trong cùng một request — không dùng transaction,
 * nên nếu bảng thứ 2 lỗi thì bảng `markdowns` đã kịp ghi.
 */
let postInfoDoctorsService = (inputData) => {
    return new Promise(async(resolve, reject) => {
        try {
            let checkObj = checkRequiredField(inputData)
            if (checkObj.isValid === false) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing required parameters: ${checkObj.element}!`
                })
            } else {
                // Cập nhật hoặc thêm mới vào bảng Markdown
                if (inputData.action === 'CREATE') {
                    await db.Markdown.create({
                        contentHTML: inputData.contentHTML,
                        contentMarkdown: inputData.contentMarkdown,
                        description: inputData.description,
                        doctorId: inputData.doctorId
                    })
                } else if (inputData.action === 'EDIT') {
                    let doctorMarkdown = await db.Markdown.findOne({
                        where: { doctorId: inputData.doctorId },
                        raw: false
                    })
                    if (doctorMarkdown) {
                        doctorMarkdown.contentHTML = inputData.contentHTML
                        doctorMarkdown.contentMarkdown = inputData.contentMarkdown
                        doctorMarkdown.description = inputData.description
                        await doctorMarkdown.save()
                    }
                }

                // Cập nhật hoặc thêm mới vào bảng Doctor-info
                let doctorInfo = await db.Doctor_Info.findOne({
                    where: { doctorId: inputData.doctorId },
                    raw: false
                })

                if (doctorInfo) {
                    // Cập nhật
                    doctorInfo.doctorId = inputData.doctorId
                    doctorInfo.priceId = inputData.selectedPrice
                    doctorInfo.paymentId = inputData.selectedPayment
                    doctorInfo.provinceId = inputData.selectedProvince
                    doctorInfo.nameClinic = inputData.nameClinic
                    doctorInfo.addressClinic = inputData.addressClinic
                    doctorInfo.note = inputData.note
                    doctorInfo.specialtyId = inputData.specialtyId
                    doctorInfo.clinicId = inputData.clinicId
                    await doctorInfo.save()
                } else {
                    // Thêm mới
                    await db.Doctor_Info.create({
                        doctorId: inputData.doctorId,
                        priceId : inputData.selectedPrice,
                        paymentId : inputData.selectedPayment,
                        provinceId : inputData.selectedProvince,
                        nameClinic : inputData.nameClinic,
                        addressClinic : inputData.addressClinic,
                        note: inputData.note,
                        specialtyId: inputData.specialtyId,
                        clinicId: inputData.clinicId
                    })
                }
                
                resolve({
                    errCode: 0,
                    errMessage: 'Save info doctor succeed!'
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Lấy CHI TIẾT hồ sơ một bác sĩ (dùng cho trang xem trước của admin
 * và trang chi tiết bác sĩ của khách).
 *
 * - Ai gọi: `doctorController.getDetailDoctorById`
 *   (GET /api/get-detail-doctor-by-id?id=) -> trang `/detail-doctor/:id`.
 * - Gọi tiếp: `bufferToDataUri()` để đổi ảnh sang data-URI.
 * - Bảng: `users` (SELECT theo id, loại `password`)
 *   JOIN `markdowns` (mô tả, nội dung HTML/Markdown)
 *   JOIN `allcodes` (chức danh)
 *   JOIN `doctor_info` JOIN `allcodes` 3 lần nữa (giá / thanh toán / tỉnh thành).
 * - Trả về: `{ errCode: 0, data }` — object lồng nhau (`nest: true`) gồm
 *   thông tin user + `Markdown` + `positionData` + `Doctor_Info`
 *   (trong đó có `priceTypeData`, `paymentTypeData`, `provinceTypeData`)
 *   và `image` đã là data-URI.
 *
 * Thiếu `inputId` -> errCode 1. Không tìm thấy -> `data = {}`.
 */
let getDetailDoctorByIdService = (inputId) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            } else {
                let data = await db.User.findOne({
                    where: { id: inputId },
                    attributes: { exclude: ['password'] },
                    include: [
                        { model: db.Markdown, attributes: ['description', 'contentHTML', 'contentMarkdown'], },
                        { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                        {
                            model: db.Doctor_Info,
                            include: [
                                { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] },
                            ]
                        },
                    ],
                    raw: false, 
                    nest: true
                })

                if (data && data.image) {
                    data.image = bufferToDataUri(data.image)
                }

                if(!data) data = {}

                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Lưu lịch khám cho một bác sĩ trong một ngày (chỉ THÊM, không xoá).
 *
 * - Ai gọi: `doctorController.postScheduleDoctors`
 *   (POST /api/bulk-create-schedule) <- trang `/system/manage-schedule`.
 * - Gọi tiếp: `_.differenceWith()` của lodash để lọc ra khung giờ CHƯA tồn tại.
 * - Bảng: `schedules` (SELECT các dòng đã có + `bulkCreate` các dòng mới).
 * - Trả về: `{ errCode, errMessage }` — 0 = OK, 1 = thiếu tham số.
 *
 * ⚠️ BẪY ĐÃ TỪNG GẶP: `date` lưu dạng chuỗi 'DD/MM/YYYY'. Code cũ so sánh
 * bằng `+a.date === +b.date` -> cả hai thành `NaN`, mà `NaN === NaN` luôn `false`
 * -> mọi khung giờ bị coi là mới -> **tạo lịch trùng**. Nay so sánh bằng
 * `String(a.date) === String(b.date)`.
 *
 * `maxNumber` của mỗi khung giờ lấy từ hằng `MAX_NUMBER_SCHEDULE`.
 */
let postScheduleDoctorsService = (data) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!data.arrSchedule || !data.doctorId || !data.formatedDate) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            } else {
                let schedule = data.arrSchedule
                if (schedule && schedule.length > 0) {
                    schedule = schedule.map(item => {
                        item.maxNumber = MAX_NUMBER_SCHEDULE
                        return item
                    })
                }
                // Lấy toàn bộ dữ liệu đã tồn tại
                let existing = await db.Schedule.findAll({
                    where: { doctorId: data.doctorId, date: data.formatedDate },
                    attributes: ['timeType', 'date', 'doctorId', 'maxNumber'],
                    raw: true
                })
                
                // So sánh để tìm phần dữ liệu khác biệt
                // LƯU Ý: date là chuỗi DD/MM/YYYY nên "+a.date" sẽ thành NaN, mà NaN === NaN luôn
                // false -> mọi phần tử bị coi là mới -> lịch bị trùng. Vì vậy so sánh dưới dạng chuỗi.
                let toCreate = _.differenceWith(schedule, existing, (a, b) => {
                    return a.timeType === b.timeType && String(a.date) === String(b.date)
                })
                // Tạo dữ liệu
                if (toCreate && toCreate.length > 0) {
                    await db.Schedule.bulkCreate(toCreate)
                }
                resolve({
                    errCode: 0,
                    errMessage: 'OK'
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Lấy lịch khám của một bác sĩ trong một ngày (kèm tên khung giờ + tên bác sĩ).
 *
 * - Ai gọi: `doctorController.getScheduleDoctorByDate`
 *   (GET /api/get-schedule-doctor-by-date?doctorId=&date=)
 *   <- frontend `userService.getScheduleDoctorByDateService()`
 *   <- `DoctorSchedule` / `BookingModal` khi khách chọn ngày & giờ khám.
 * - Bảng: `schedules` (SELECT theo doctorId + date)
 *   JOIN `allcodes` (as `timeTypeData`: tên khung giờ)
 *   JOIN `users` (as `doctorData`: firstName, lastName).
 * - Trả về: `{ errCode: 0, data: [...] }` — mỗi phần tử có `timeTypeData`
 *   (`{valueVi, valueEn}`), `doctorData`, `maxNumber`, `currentNumber`.
 *   Không có lịch -> mảng rỗng.
 */
let getScheduleDoctorByDateService = (doctorId, date) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            } else {
                let dataSchedule = await db.Schedule.findAll({
                    where: { doctorId: doctorId, date: date },
                    include: [
                        { model: db.Allcode, as: 'timeTypeData', attributes: ['valueEn', 'valueVi'] },
                        { model: db.User, as: 'doctorData', attributes: ['firstName', 'lastName'] }
                    ],
                    raw: false, 
                    nest: true
                })

                if (!dataSchedule) dataSchedule = []
                resolve({
                    errCode: 0,
                    data: dataSchedule
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Lấy danh sách khung giờ ĐÃ CÓ LỊCH của một bác sĩ trong một ngày.
 *
 * - Ai gọi: `doctorController.getBookedScheduleByDoctorDate`
 *   (GET /api/get-booked-schedule-by-doctor-date?doctorId=&date=)
 *   <- `ManageSchedule` (trang "Quản lý kế hoạch khám bệnh") để **tô nền xanh**
 *      những khung giờ đã được chọn lưu.
 * - Bảng: `schedules` (SELECT id, timeType, maxNumber, currentNumber
 *   theo doctorId + date).
 * - Trả về: `{ errCode: 0, errMessage: 'OK', data: [...], bookedTimeTypes: [...] }`
 *   trong đó `bookedTimeTypes` là mảng mã khung giờ (vd `['T1','T3']`) để
 *   frontend so sánh nhanh khi render nút.
 *
 * Vì cả tài khoản admin và bác sĩ đều đọc từ cùng bảng `schedules` nên lịch
 * **tự động đồng bộ** giữa hai bên, không cần cơ chế riêng.
 */
let getBookedScheduleByDoctorDateService = (doctorId, date) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            } else {
                let data = await db.Schedule.findAll({
                    where: { doctorId: doctorId, date: date },
                    attributes: ['id', 'timeType', 'maxNumber', 'currentNumber'],
                    raw: true
                })

                if (!data) data = []

                // Tập hợp các timeType đã có lịch để frontend tô nền xanh.
                let bookedTimeTypes = data.map(item => item.timeType)

                resolve({
                    errCode: 0,
                    errMessage: 'OK',
                    data: data,
                    bookedTimeTypes: bookedTimeTypes
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}
    
/**
 * Lấy THÔNG TIN THÊM của bác sĩ: giá khám, hình thức thanh toán, tỉnh/thành,
 * tên & địa chỉ phòng khám, ghi chú.
 *
 * - Ai gọi: `doctorController.getExtraInfoDoctorById`
 *   (GET /api/get-extra-info-doctor-by-id?id=)
 *   <- component `DoctorExtraInfo` (khối "Giá khám" ở trang chi tiết bác sĩ).
 * - Bảng: `doctor_info` (SELECT theo `doctorId`, bỏ cột id/doctorId)
 *   JOIN `allcodes` 3 lần (as `priceTypeData`, `paymentTypeData`, `provinceTypeData`).
 * - Trả về: `{ errCode: 0, data }` — object gồm `priceTypeData`,
 *   `paymentTypeData`, `provinceTypeData`, `nameClinic`, `addressClinic`, `note`.
 *   Không có dữ liệu -> `data = {}`.
 */
let getExtraInfoDoctorByIdService = (inputId) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            } else {
                let data = await db.Doctor_Info.findOne({
                    where: { doctorId: inputId },
                    attributes: { exclude: ['id', 'doctorId'] },
                    include: [
                        { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                        { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] },
                        { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] },
                    ],
                    raw: false, 
                    nest: true
                })

                if(!data) data = {}

                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Lấy hồ sơ RÚT GỌN của bác sĩ — dùng trong modal đặt lịch và khối giới thiệu.
 *
 * - Ai gọi: `doctorController.getProfileDoctorById`
 *   (GET /api/get-profile-doctor-by-id?id=)
 *   <- `userService.getProfileDoctorByIdService()` <- component `ProfileDoctor`
 *      (hiển thị ở modal đặt lịch và đầu trang chi tiết bác sĩ).
 * - Bảng: `users` (SELECT theo id, loại `password`)
 *   JOIN `markdowns`, `allcodes` (chức danh), `doctor_info` + `allcodes` ×3.
 * - Trả về: `{ errCode: 0, data }` — giống `getDetailDoctorByIdService` nhưng
 *   đây là bản dùng cho khối giới thiệu ngắn; `image` đã là data-URI.
 *
 * Khác biệt so với `getDetailDoctorByIdService`: hiện tại hai hàm có cùng cấu
 * trúc truy vấn, nhưng tách riêng để có thể tối ưu độc lập sau này.
 */
let getProfileDoctorByIdService = (inputId) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            } else {
                let data = await db.User.findOne({
                    where: { id: inputId },
                    attributes: { exclude: ['password'] },
                    include: [
                        { model: db.Markdown, attributes: ['description', 'contentHTML', 'contentMarkdown'], },
                        { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                        {
                            model: db.Doctor_Info,
                            include: [
                                { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] },
                            ]
                        },
                    ],
                    raw: false,
                    nest: true
                })

                if (data && data.image) {
                    data.image = bufferToDataUri(data.image)
                }

                if (!data) data = {}

                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Lấy danh sách BỆNH NHÂN đã đặt lịch của một bác sĩ trong một ngày.
 *
 * - Ai gọi: `doctorController.getListPatientForDoctor`
 *   (GET /api/get-list-patient-for-doctor?doctorId=&date=&statusId=)
 *   <- `userService.getListPatientForDoctorService()`
 *   <- trang `/system/manage-patient` (bác sĩ xem danh sách bệnh nhân).
 * - Bảng: `bookings` (SELECT theo doctorId + date [+ statusId])
 *   JOIN `users` (as `patientData`) + `allcodes` (as `genderData`)
 *   JOIN `allcodes` (as `timeTypeDataPatient`: khung giờ)
 *   JOIN `allcodes` (as `statusTypeDataPatient`: trạng thái).
 * - Trả về: `{ errCode: 0, data: [...] }` — mỗi phần tử là một lịch hẹn gồm
 *   `patientData` (email, firstName, address, gender + genderData),
 *   `timeTypeDataPatient`, `statusTypeDataPatient`, `statusId`, `token`...
 *
 * Tham số `statusId`:
 *   - `'ALL'` -> lấy mọi trạng thái trong ngày.
 *   - `'S1'|'S2'|'S3'|'S4'` -> chỉ lấy lịch có trạng thái đó.
 */
let getListPatientForDoctorService = (doctorId, date, statusId) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!doctorId || !date || !statusId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            } else {
                // statusId === 'ALL' -> lấy mọi lịch hẹn trong ngày; ngược lại thì lọc theo statusId
                let whereCondition = {
                    doctorId: doctorId,
                    date: date,
                }
                if (statusId !== 'ALL') {
                    whereCondition.statusId = statusId
                }

                let data = await db.Booking.findAll({
                    where: whereCondition,
                    include: [
                        {
                            model: db.User,
                            as: 'patientData',
                            attributes: ['email', 'firstName', 'address', 'gender'],
                            include: [
                                { model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi'] }
                            ]
                        },
                        { model: db.Allcode, as: 'timeTypeDataPatient', attributes: ['valueEn', 'valueVi'] },
                        { model: db.Allcode, as: 'statusTypeDataPatient', attributes: ['valueEn', 'valueVi'] }
                    ],

                    raw: false,
                    nest: true
                })

                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Bác sĩ xác nhận đã khám xong và gửi KẾT QUẢ KHÁM + HOÁ ĐƠN cho bệnh nhân.
 *
 * - Ai gọi: `doctorController.sendRemedy` (POST /api/send-remedy)
 *   <- `userService.sendRemedyService()` <- `ManagePatient.sendRemedy()`
 *   <- nút "Gửi hoá đơn" trong modal `RemedyModal`.
 * - Gọi tiếp: `emailService.sendAttachment()` để gửi mail kèm ảnh đính kèm.
 * - Bảng: `bookings` (SELECT lịch S2 rồi UPDATE `statusId` thành S3).
 * - Trả về: `{ errCode, errMessage }`
 *     0 = OK; 1 = thiếu tham số; 2 = **không gửi được email** (kèm lý do cụ thể).
 *
 * Tham số bắt buộc: email, doctorId, patientId, timeType, imageBase64
 * (`imageBase64` là ảnh hoá đơn dạng data-URI do bác sĩ upload).
 *
 * Lưu ý: trạng thái được đổi sang S3 **trước** khi gửi mail. Nếu mail lỗi thì
 * lịch vẫn ở S3 — chỉ có email là không tới. Đây là chủ ý: bác sĩ đã khám xong
 * thì nghiệp vụ phải ghi nhận, không nên phụ thuộc vào việc gửi mail thành công.
 */
let sendRemedyService = (data) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!data.email || !data.doctorId || !data.patientId || !data.timeType || !data.imageBase64) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            } else {
                // Cập nhật trạng thái bệnh nhân: S2 (đã xác nhận) -> S3 (đã khám xong)
                let appointment = await db.Booking.findOne({
                    where: {
                        doctorId: data.doctorId,
                        patientId: data.patientId,
                        timeType: data.timeType,
                        statusId: 'S2'
                    },
                    raw: false
                })
                if (appointment) {
                    appointment.statusId = 'S3'
                    await appointment.save()
                }

                // Gửi email kèm ảnh hoá đơn/kết quả khám
                try {
                    await emailService.sendAttachment(data)
                } catch (mailError) {
                    console.log('>>> GUI MAIL KET QUA KHAM THAT BAI:', mailError.code || '', '-', mailError.message)
                    return resolve({
                        errCode: 2,
                        errMessage: 'Không gửi được email kết quả khám. Chi tiết: ' + mailError.message
                    })
                }

                resolve({
                    errCode: 0,
                    errMessage: 'OK'
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Huỷ lịch hẹn của bệnh nhân (bác sĩ huỷ).
 *
 * - Ai gọi: `doctorController.cancelPatient` (POST /api/cancel-patient)
 *   <- `userService.cancelPatientService()` <- `ManagePatient.handleBtnCancel()`.
 * - Bảng: `bookings` (SELECT lịch có `statusId = 'S1'` rồi UPDATE thành `'S4'`).
 * - Trả về: `{ errCode, errMessage }` — 0 = OK, 1 = thiếu tham số.
 *
 * Chỉ huỷ được lịch đang ở S1 (mới đặt, chưa xác nhận). Lịch đã S2 (khách đã
 * xác nhận) sẽ KHÔNG bị đổi trạng thái — hàm vẫn trả errCode 0.
 */
let cancelPatientService = (data) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!data.doctorId || !data.patientId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Cancel appointment failed!'
                })
            } else {
                // Cập nhật trạng thái bệnh nhân
                let appointment = await db.Booking.findOne({
                    where: {
                        doctorId: data.doctorId,
                        patientId: data.patientId,
                        statusId: 'S1'
                    },
                    raw: false
                })
                if (appointment) {
                    appointment.statusId = 'S4'
                    await appointment.save()
                }
                resolve({
                    errCode: 0,
                    errMessage: 'OK'
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    getTopDoctorHomeService: getTopDoctorHomeService, cancelPatientService: cancelPatientService,
    getAllDoctorsService: getAllDoctorsService,
    postInfoDoctorsService: postInfoDoctorsService,
    getDetailDoctorByIdService: getDetailDoctorByIdService,
    postScheduleDoctorsService: postScheduleDoctorsService,
    getScheduleDoctorByDateService: getScheduleDoctorByDateService,
    getBookedScheduleByDoctorDateService: getBookedScheduleByDoctorDateService,
    getExtraInfoDoctorByIdService: getExtraInfoDoctorByIdService,
    getProfileDoctorByIdService: getProfileDoctorByIdService,
    getListPatientForDoctorService: getListPatientForDoctorService,
    sendRemedyService: sendRemedyService,
}
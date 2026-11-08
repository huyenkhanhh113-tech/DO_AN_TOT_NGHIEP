import _ from "lodash";
import db from "../models/index";
import { bufferToDataUri, base64ToBuffer } from "../utils/imageHelper";

/**
 * Tầng nghiệp vụ cho PHÒNG KHÁM (bảng `clinics`).
 * Được gọi từ `clinicController.js`; dữ liệu phục vụ cả trang quản trị
 * (/system/manage-clinic) và trang khách (/all-clinic, /detail-clinic/:id).
 */

/**
 * Tạo mới một phòng khám.
 *
 * - Ai gọi: `clinicController.createClinic` (POST /api/create-new-clinic).
 * - Gọi tiếp: `base64ToBuffer()` để chuyển ảnh client gửi lên thành bytes.
 * - Bảng: `clinics` (INSERT).
 * - Trả về: `{ errCode, errMessage }`
 *     errCode 0 = thành công; errCode 1 = thiếu tham số bắt buộc.
 *
 * Bắt buộc đủ 5 trường: name, imageBase64, descriptionHTML,
 * descriptionMarkdown, address (phòng khám khác specialty/handbook ở `address`).
 */
let createClinicService = (data) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!data.name || !data.imageBase64 || !data.descriptionHTML || !data.descriptionMarkdown || !data.address) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            } else {
                await db.Clinic.create({
                    name: data.name,
                    address: data.address,
                    // Ghi ảnh: decode base64/data-URI từ client thành bytes thật để lưu xuống DB.
                    image: base64ToBuffer(data.imageBase64),
                    descriptionHTML: data.descriptionHTML,
                    descriptionMarkdown: data.descriptionMarkdown
                })

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
 * Lấy danh sách TẤT CẢ phòng khám (kèm ảnh).
 *
 * - Ai gọi: `clinicController.getAllClinic` (GET /api/get-all-clinic)
 *   -> dùng ở trang khách `/all-clinic` và trang quản trị `/system/manage-clinic`.
 * - Gọi tiếp: `bufferToDataUri()` để đổi bytes ảnh trong DB thành data-URI.
 * - Bảng: `clinics` (SELECT toàn bộ).
 * - Trả về: `{ errCode: 0, errMessage: 'OK', data: [...] }`
 *   Mỗi phần tử có `image` là chuỗi `data:image/...;base64,...` để frontend
 *   dùng thẳng trong `url(...)`.
 *
 * Lưu ý: payload khá lớn (~2.6 MB) vì ảnh được nhúng thẳng dạng base64.
 */
let getAllClinicService = () => {
    return new Promise(async(resolve, reject) => {
        try {
            let data = await db.Clinic.findAll({})
            if (data && data.length > 0) {
                // Đọc ảnh: bytes trong DB -> chuỗi data-URI để trả về cho client.
                data.map(item => {
                    item.image = bufferToDataUri(item.image)
                    return item
                })
            }
            resolve({
                errCode: 0,
                errMessage: 'OK',
                data
            })
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Lấy CHI TIẾT một phòng khám theo id, kèm danh sách bác sĩ thuộc phòng khám đó.
 *
 * - Ai gọi: `clinicController.getDetailClinicById` (GET /api/get-detail-clinic-by-id?id=)
 *   -> dùng ở trang `/detail-clinic/:id`.
 * - Bảng: `clinics` (SELECT 1 dòng theo id)
 *        + `doctor_info` (SELECT doctorId, provinceId theo `clinicId`).
 * - Trả về: `{ errCode, errMessage, data }` trong đó `data` gồm
 *   `{ name, address, descriptionHTML, descriptionMarkdown, image (data-URI),
 *      doctorClinic: [{ doctorId, provinceId }, ...] }`.
 *
 * Trường hợp đặc biệt:
 *  - Thiếu `inputId`  -> errCode 1.
 *  - Không tìm thấy   -> `data = {}` (vẫn errCode 0).
 */
let getDetailClinicByIdService = (inputId) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            } else {
                let data = await db.Clinic.findOne({
                    where: { id: inputId },
                    attributes: ['descriptionHTML', 'descriptionMarkdown', 'name', 'address', 'image'],
                })

                if (data && data.image) {
                    data.image = bufferToDataUri(data.image)
                }

                if (data) {
                    let doctorClinic = []
                    doctorClinic = await db.Doctor_Info.findAll({
                        where: { clinicId: inputId },
                        attributes: ['doctorId', 'provinceId'],
                    })
                    data.doctorClinic = doctorClinic
                } else data = {}
                    
                resolve({
                    errCode: 0,
                    errMessage: 'OK',
                    data
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Cập nhật thông tin phòng khám (sửa một phần — partial update).
 *
 * - Ai gọi: `clinicController.editClinic` (PUT /api/edit-clinic)
 *   -> nút "Sửa" ở trang `/system/manage-clinic`.
 * - Gọi tiếp: `base64ToBuffer()` nếu client có gửi ảnh mới.
 * - Bảng: `clinics` (SELECT theo id -> UPDATE các cột được truyền).
 * - Trả về: `{ errCode, errMessage }`
 *     errCode 0 = OK; 1 = thiếu id; 2 = không tìm thấy phòng khám.
 *
 * Quy tắc quan trọng: chỉ ghi đè trường nào client THỰC SỰ truyền
 * (`!== undefined`). Nhờ vậy sửa mỗi tên sẽ không làm mất ảnh hay mô tả cũ.
 */
let updateClinicService = (data) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!data.id) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            }

            let clinic = await db.Clinic.findOne({
                where: { id: data.id },
                // raw: false để nhận về instance Sequelize (mới gọi được .save()).
                raw: false
            })

            if (!clinic) {
                return resolve({
                    errCode: 2,
                    errMessage: 'Clinic is not found!'
                })
            }

            // Cập nhật các trường văn bản (phòng khám có thêm `address`).
            // Chỉ ghi đè khi client có truyền để không xoá dữ liệu cũ.
            if (data.name !== undefined) clinic.name = data.name
            if (data.address !== undefined) clinic.address = data.address
            if (data.descriptionHTML !== undefined) clinic.descriptionHTML = data.descriptionHTML
            if (data.descriptionMarkdown !== undefined) clinic.descriptionMarkdown = data.descriptionMarkdown

            // Ảnh: CHỈ ghi đè khi client thực sự gửi ảnh mới.
            // Nếu không truyền `imageBase64` thì giữ nguyên ảnh cũ (không xoá).
            if (data.imageBase64) {
                clinic.image = base64ToBuffer(data.imageBase64)
            }

            await clinic.save()

            resolve({
                errCode: 0,
                errMessage: 'OK'
            })
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Xoá phòng khám theo id (có kiểm tra ràng buộc dữ liệu).
 *
 * - Ai gọi: `clinicController.deleteClinic` (DELETE /api/delete-clinic, id nằm trong BODY).
 * - Bảng: `clinics` (SELECT + DELETE) và `doctor_info` (COUNT để kiểm ràng buộc).
 * - Trả về: `{ errCode, errMessage }`
 *     errCode 0 = đã xoá; 1 = thiếu id; 2 = không tìm thấy;
 *     errCode 3 = **từ chối xoá** vì vẫn còn bác sĩ thuộc phòng khám này.
 *
 * Đây là "xoá cứng" (hard delete) — bản ghi mất hẳn khỏi DB, không thể khôi phục.
 */
let deleteClinicService = (id) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!id) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            }

            let clinic = await db.Clinic.findOne({
                where: { id: id }
            })

            if (!clinic) {
                return resolve({
                    errCode: 2,
                    errMessage: 'Clinic is not found!'
                })
            }

            // Ràng buộc dữ liệu: không cho xoá nếu vẫn còn bác sĩ thuộc phòng khám này.
            let doctorCount = await db.Doctor_Info.count({
                where: { clinicId: id }
            })

            if (doctorCount > 0) {
                return resolve({
                    errCode: 3,
                    errMessage: 'Không thể xoá: vẫn còn bác sĩ thuộc phòng khám này!'
                })
            }

            await db.Clinic.destroy({
                where: { id: id }
            })

            resolve({
                errCode: 0,
                errMessage: 'OK'
            })
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    createClinicService: createClinicService,
    getAllClinicService: getAllClinicService,
    getDetailClinicByIdService: getDetailClinicByIdService,
    updateClinicService: updateClinicService,
    deleteClinicService: deleteClinicService
}

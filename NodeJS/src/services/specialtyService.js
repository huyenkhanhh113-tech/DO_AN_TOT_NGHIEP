import _ from "lodash";
import db from "../models/index";
import sequelize from "sequelize";
import { bufferToDataUri, base64ToBuffer } from "../utils/imageHelper";

/**
 * Tầng nghiệp vụ cho CHUYÊN KHOA (bảng `specialties`).
 * Được gọi từ `specialtyController.js`; dữ liệu phục vụ trang quản trị
 * (/system/manage-specialty), trang khách (/all-specialty, /detail-specialty/:id)
 * và ô tìm kiếm chuyên khoa trên trang chủ.
 *
 * Bảng liên quan: `specialties` (chính) và `doctor_info` (để biết bác sĩ nào
 * thuộc chuyên khoa nào).
 */

/**
 * Tạo mới một chuyên khoa.
 *
 * - Ai gọi: `specialtyController.createSpecialty` (POST /api/create-new-specialty).
 * - Gọi tiếp: `base64ToBuffer()` để chuyển ảnh client gửi lên thành bytes.
 * - Bảng: `specialties` (INSERT).
 * - Trả về: `{ errCode, errMessage }` — 0 = OK, 1 = thiếu tham số.
 *
 * Bắt buộc đủ 4 trường: name, imageBase64, descriptionHTML, descriptionMarkdown.
 */
let createSpecialtyService = (data) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!data.name || !data.imageBase64 || !data.descriptionHTML || !data.descriptionMarkdown) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            } else {
                await db.Specialty.create({
                    name: data.name,
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
 * Lấy danh sách TẤT CẢ chuyên khoa (kèm ảnh).
 *
 * - Ai gọi: `specialtyController.getAllSpecialty` (GET /api/get-all-specialty)
 *   -> trang khách `/all-specialty` và trang quản trị `/system/manage-specialty`.
 * - Gọi tiếp: `bufferToDataUri()` để đổi bytes ảnh thành data-URI.
 * - Bảng: `specialties` (SELECT toàn bộ).
 * - Trả về: `{ errCode: 0, errMessage: 'OK', data: [...] }`,
 *   mỗi phần tử có `image` dạng `data:image/...;base64,...`.
 */
let getAllSpecialtyService = () => {
    return new Promise(async(resolve, reject) => {
        try {
            let data = await db.Specialty.findAll({})
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
 * Lấy CHI TIẾT một chuyên khoa theo id + lọc bác sĩ theo địa điểm.
 *
 * - Ai gọi: `specialtyController.getDetailSpecialtyById`
 *   (GET /api/get-detail-specialty-by-id?id=&location=)
 *   -> trang `/detail-specialty/:id`.
 * - Bảng: `specialties` (SELECT 1 dòng theo id)
 *        + `doctor_info` (SELECT doctorId, provinceId theo `specialtyId`).
 * - Trả về: `{ errCode, errMessage, data }` với `data` gồm
 *   `{ name, descriptionHTML, descriptionMarkdown, image (data-URI),
 *      doctorSpecialty: [{ doctorId, provinceId }, ...] }`.
 *
 * Tham số `location`:
 *  - `'ALL'`  -> lấy bác sĩ ở mọi tỉnh/thành.
 *  - mã tỉnh  -> chỉ lấy bác sĩ có `provinceId` tương ứng.
 * Thiếu `inputId` hoặc `location` -> errCode 1.
 */
let getDetailSpecialtyByIdService = (inputId, location) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!inputId || !location) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            } else {
                let data = await db.Specialty.findOne({
                    where: { id: inputId },
                    attributes: ['descriptionHTML', 'descriptionMarkdown', 'name', 'image'],
                })

                if (data && data.image) {
                    data.image = bufferToDataUri(data.image)
                }

                if (data) {
                    let doctorSpecialty = []
                    if (location === 'ALL') {
                        doctorSpecialty = await db.Doctor_Info.findAll({
                            where: { specialtyId: inputId },
                            attributes: ['doctorId', 'provinceId'],
                        })
                    } else {
                        // Tìm theo địa điểm (tỉnh/thành)
                        doctorSpecialty = await db.Doctor_Info.findAll({
                            where: { specialtyId: inputId, provinceId: location },
                            attributes: ['doctorId', 'provinceId'],
                        })
                    }
                    
                    data.doctorSpecialty = doctorSpecialty
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
 * Tìm chuyên khoa theo TÊN (tìm gần đúng — LIKE %từ khoá%).
 *
 * - Ai gọi: `specialtyController.getSpecialtyByName`
 *   (GET /api/get-specialty-by-name?name=)
 *   <- frontend `adminActions.fetchSearchSpecialty()` <- ô tìm kiếm trên trang chủ
 *   (`HomeHeader` / `SearchSpecialty`).
 * - Bảng: `specialties` (SELECT với điều kiện `name LIKE %nameInput%`).
 * - Trả về: `{ errCode: 0, errMessage: 'OK', data: [...] }` — **mảng** kết quả,
 *   mỗi phần tử có `image` đã đổi thành data-URI. Không khớp -> mảng rỗng.
 *
 * Lưu ý lịch sử: trước đây code gán `data.image` trên một MẢNG nên luôn
 * `undefined` -> ảnh không bao giờ được convert. Nay đã duyệt từng phần tử.
 */
let getSpecialtyByNameService = (nameInput) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!nameInput) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            } else {
                let data = await db.Specialty.findAll({
                    where: {
                        name: sequelize.where(sequelize.col('name'), 'LIKE', '%' + nameInput + '%')
                    },
                    attributes: ['descriptionHTML', 'descriptionMarkdown', 'name', 'image', 'id'],
                })

                // LƯU Ý: findAll() trả về MẢNG, nên data.image luôn undefined.
                // Vì vậy phải duyệt từng phần tử và chuyển image (bytes -> data-URI)
                // để thống nhất với getAllSpecialtyService. Giữ nguyên data là mảng.
                if (data && data.length > 0) {
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
            }
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Cập nhật chuyên khoa (sửa một phần — partial update).
 *
 * - Ai gọi: `specialtyController.editSpecialty` (PUT /api/edit-specialty)
 *   -> nút "Sửa" ở trang `/system/manage-specialty`.
 * - Gọi tiếp: `base64ToBuffer()` nếu client có gửi ảnh mới.
 * - Bảng: `specialties` (SELECT theo id -> UPDATE các cột được truyền).
 * - Trả về: `{ errCode, errMessage }` — 0 = OK, 1 = thiếu id, 2 = không tìm thấy.
 *
 * Chỉ ghi đè trường nào client thực sự truyền -> sửa tên không làm mất ảnh/mô tả.
 */
let updateSpecialtyService = (data) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!data.id) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            }

            let specialty = await db.Specialty.findOne({
                where: { id: data.id },
                // raw: false để nhận về instance Sequelize (mới gọi được .save()).
                raw: false
            })

            if (!specialty) {
                return resolve({
                    errCode: 2,
                    errMessage: 'Specialty is not found!'
                })
            }

            // Cập nhật các trường văn bản (chỉ ghi đè khi client có truyền).
            if (data.name !== undefined) specialty.name = data.name
            if (data.descriptionHTML !== undefined) specialty.descriptionHTML = data.descriptionHTML
            if (data.descriptionMarkdown !== undefined) specialty.descriptionMarkdown = data.descriptionMarkdown

            // Ảnh: CHỈ ghi đè khi client thực sự gửi ảnh mới.
            // Nếu không truyền `imageBase64` thì giữ nguyên ảnh cũ (không xoá).
            if (data.imageBase64) {
                specialty.image = base64ToBuffer(data.imageBase64)
            }

            await specialty.save()

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
 * Xoá chuyên khoa theo id (có kiểm tra ràng buộc dữ liệu).
 *
 * - Ai gọi: `specialtyController.deleteSpecialty`
 *   (DELETE /api/delete-specialty, id nằm trong BODY).
 * - Bảng: `specialties` (SELECT + DELETE) và `doctor_info` (COUNT để kiểm ràng buộc).
 * - Trả về: `{ errCode, errMessage }`
 *     errCode 0 = đã xoá; 1 = thiếu id; 2 = không tìm thấy;
 *     errCode 3 = **từ chối xoá** vì vẫn còn bác sĩ thuộc chuyên khoa này.
 */
let deleteSpecialtyService = (id) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!id) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            }

            let specialty = await db.Specialty.findOne({
                where: { id: id }
            })

            if (!specialty) {
                return resolve({
                    errCode: 2,
                    errMessage: 'Specialty is not found!'
                })
            }

            // Ràng buộc dữ liệu: không cho xoá nếu vẫn còn bác sĩ thuộc chuyên khoa này.
            let doctorCount = await db.Doctor_Info.count({
                where: { specialtyId: id }
            })

            if (doctorCount > 0) {
                return resolve({
                    errCode: 3,
                    errMessage: 'Không thể xoá: vẫn còn bác sĩ thuộc chuyên khoa này!'
                })
            }

            await db.Specialty.destroy({
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
    createSpecialtyService: createSpecialtyService,
    getAllSpecialtyService: getAllSpecialtyService,
    getDetailSpecialtyByIdService: getDetailSpecialtyByIdService,
    getSpecialtyByNameService: getSpecialtyByNameService,
    updateSpecialtyService: updateSpecialtyService,
    deleteSpecialtyService: deleteSpecialtyService
}

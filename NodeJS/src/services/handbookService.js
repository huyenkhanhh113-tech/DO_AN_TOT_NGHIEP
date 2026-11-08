import _ from "lodash";
import db from "../models/index";
import { bufferToDataUri, base64ToBuffer } from "../utils/imageHelper";

/**
 * Tầng nghiệp vụ cho CẨM NANG SỨC KHOẺ (bảng `handbooks`).
 * Được gọi từ `handbookController.js`; dữ liệu phục vụ trang quản trị
 * (/system/manage-handbook) và trang khách (/all-handbook, /detail-handbook/:id).
 *
 * Cấu trúc gần giống `specialtyService` nhưng KHÔNG có trường `address`
 * và KHÔNG có ràng buộc dữ liệu khi xoá.
 */

/**
 * Tạo mới một bài cẩm nang.
 *
 * - Ai gọi: `handbookController.createHandbook` (POST /api/create-new-handbook).
 * - Gọi tiếp: `base64ToBuffer()` để chuyển ảnh client gửi lên thành bytes.
 * - Bảng: `handbooks` (INSERT).
 * - Trả về: `{ errCode, errMessage }` — 0 = OK, 1 = thiếu tham số.
 *
 * Bắt buộc đủ 4 trường: name, imageBase64, descriptionHTML, descriptionMarkdown.
 */
let createHandbookService = (data) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!data.name || !data.imageBase64 || !data.descriptionHTML || !data.descriptionMarkdown) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            } else {
                await db.HandBook.create({
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
 * Lấy danh sách TẤT CẢ bài cẩm nang (kèm ảnh).
 *
 * - Ai gọi: `handbookController.getAllHandbook` (GET /api/get-all-handbook)
 *   -> trang khách `/all-handbook` và trang quản trị `/system/manage-handbook`.
 * - Gọi tiếp: `bufferToDataUri()` để đổi bytes ảnh thành data-URI.
 * - Bảng: `handbooks` (SELECT toàn bộ).
 * - Trả về: `{ errCode: 0, errMessage: 'OK', data: [...] }`,
 *   mỗi phần tử có `image` dạng `data:image/...;base64,...`.
 */
let getAllHandbookService = () => {
    return new Promise(async(resolve, reject) => {
        try {
            let data = await db.HandBook.findAll({})
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
 * Lấy CHI TIẾT một bài cẩm nang theo id.
 *
 * - Ai gọi: `handbookController.getDetailHandbookById`
 *   (GET /api/get-detail-handbook-by-id?id=) -> trang `/detail-handbook/:id`.
 * - Bảng: `handbooks` (SELECT 1 dòng theo id).
 * - Trả về: `{ errCode, errMessage, data }` với `data` gồm
 *   `{ name, descriptionHTML, descriptionMarkdown, image (data-URI) }`.
 *
 * Trường hợp đặc biệt: thiếu id -> errCode 1; không tìm thấy -> `data = {}`.
 */
let getDetailHandbookByIdService = (inputId) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            } else {
                let data = await db.HandBook.findOne({
                    where: { id: inputId },
                    attributes: ['descriptionHTML', 'descriptionMarkdown', 'name', 'image'],
                })

                if (data && data.image) {
                    data.image = bufferToDataUri(data.image)
                }

                if (!data) data = {}

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
 * Cập nhật bài cẩm nang (sửa một phần — partial update).
 *
 * - Ai gọi: `handbookController.editHandbook` (PUT /api/edit-handbook)
 *   -> nút "Sửa" ở trang `/system/manage-handbook`.
 * - Gọi tiếp: `base64ToBuffer()` nếu client có gửi ảnh mới.
 * - Bảng: `handbooks` (SELECT theo id -> UPDATE các cột được truyền).
 * - Trả về: `{ errCode, errMessage }` — 0 = OK, 1 = thiếu id, 2 = không tìm thấy.
 *
 * Chỉ ghi đè trường nào client thực sự truyền -> sửa tên không làm mất ảnh/mô tả.
 */
let updateHandbookService = (data) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!data.id) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            }

            let handbook = await db.HandBook.findOne({
                where: { id: data.id },
                // raw: false để nhận về instance Sequelize (mới gọi được .save()).
                raw: false
            })

            if (!handbook) {
                return resolve({
                    errCode: 2,
                    errMessage: 'Handbook is not found!'
                })
            }

            // Cập nhật các trường văn bản (chỉ ghi đè khi client có truyền).
            if (data.name !== undefined) handbook.name = data.name
            if (data.descriptionHTML !== undefined) handbook.descriptionHTML = data.descriptionHTML
            if (data.descriptionMarkdown !== undefined) handbook.descriptionMarkdown = data.descriptionMarkdown

            // Ảnh: CHỈ ghi đè khi client thực sự gửi ảnh mới.
            // Nếu không truyền `imageBase64` thì giữ nguyên ảnh cũ (không xoá).
            if (data.imageBase64) {
                handbook.image = base64ToBuffer(data.imageBase64)
            }

            await handbook.save()

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
 * Xoá bài cẩm nang theo id.
 *
 * - Ai gọi: `handbookController.deleteHandbook`
 *   (DELETE /api/delete-handbook, id nằm trong BODY).
 * - Bảng: `handbooks` (SELECT + DELETE).
 * - Trả về: `{ errCode, errMessage }` — 0 = đã xoá, 1 = thiếu id, 2 = không tìm thấy.
 *
 * Khác với phòng khám / chuyên khoa: cẩm nang KHÔNG có ràng buộc dữ liệu
 * nên xoá thẳng, không cần kiểm tra bảng nào khác.
 */
let deleteHandbookService = (id) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!id) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            }

            let handbook = await db.HandBook.findOne({
                where: { id: id }
            })

            if (!handbook) {
                return resolve({
                    errCode: 2,
                    errMessage: 'Handbook is not found!'
                })
            }

            // Cẩm nang không có ràng buộc dữ liệu -> xoá thẳng.
            await db.HandBook.destroy({
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
    createHandbookService: createHandbookService,
    getAllHandbookService: getAllHandbookService,
    getDetailHandbookByIdService: getDetailHandbookByIdService,
    updateHandbookService: updateHandbookService,
    deleteHandbookService: deleteHandbookService,
}

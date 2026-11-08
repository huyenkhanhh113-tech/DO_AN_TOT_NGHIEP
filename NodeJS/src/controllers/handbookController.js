import handbookService from "../services/handbookService";

/**
 * API: POST /api/create-new-handbook
 * Chức năng: Tạo mới bài cẩm nang.
 * Gọi tiếp: handbookService.createHandbookService(req.body).
 * Bảng DB: handbooks (INSERT).
 * Ai gọi tới: createNewHandbookService() <- ManageHandBook.
 * Trả về: { errCode, errMessage }.
 */
let createHandbook = async (req, res) => {
    try {
        let info = await handbookService.createHandbookService(req.body)
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
 * API: GET /api/get-all-handbook
 * Chức năng: Lấy danh sách tất cả bài cẩm nang kèm ảnh.
 * Gọi tiếp: handbookService.getAllHandbookService().
 * Bảng DB: handbooks (SELECT).
 * Ai gọi tới: getAllHandbookService() <- AllHandbook / ManageHandBook.
 * Trả về: { errCode, errMessage, data: [...] }.
 */
let getAllHandbook = async (req, res) => {
    try {
        let info = await handbookService.getAllHandbookService()
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
 * API: GET /api/get-detail-handbook-by-id?id=
 * Chức năng: Lấy chi tiết một bài cẩm nang.
 * Gọi tiếp: handbookService.getDetailHandbookByIdService(req.query.id).
 * Bảng DB: handbooks (SELECT).
 * Ai gọi tới: getDetailHandbookByIdService() <- DetailHandBook.
 * Trả về: { errCode, errMessage, data }.
 */
let getDetailHandbookById = async (req, res) => {
    try {
        let info = await handbookService.getDetailHandbookByIdService(req.query.id)
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
 * API: PUT /api/edit-handbook
 * Chức năng: Cập nhật bài cẩm nang (sửa một phần).
 * Gọi tiếp: handbookService.updateHandbookService(req.body).
 * Bảng DB: handbooks (SELECT + UPDATE).
 * Ai gọi tới: editHandbookService() <- ManageHandBook.
 * Trả về: { errCode, errMessage }.
 */
let editHandbook = async (req, res) => {
    try {
        let info = await handbookService.updateHandbookService(req.body)
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
 * API: DELETE /api/delete-handbook
 * Chức năng: Xoá bài cẩm nang.
 * Gọi tiếp: handbookService.deleteHandbookService(req.body.id).
 * Bảng DB: handbooks (SELECT + DELETE).
 * Ai gọi tới: deleteHandbookService() <- ManageHandBook.
 * Trả về: { errCode, errMessage }.
 */
let deleteHandbook = async (req, res) => {
    try {
        // id được gửi trong body (giống handleDeleteUser).
        let info = await handbookService.deleteHandbookService(req.body.id)
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
    createHandbook: createHandbook,
    getAllHandbook: getAllHandbook,
    getDetailHandbookById: getDetailHandbookById,
    editHandbook: editHandbook,
    deleteHandbook: deleteHandbook
}
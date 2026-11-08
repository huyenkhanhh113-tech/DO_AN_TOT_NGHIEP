import specialtyService from "../services/specialtyService";

/**
 * API: POST /api/create-new-specialty
 * Chức năng: Tạo mới chuyên khoa.
 * Gọi tiếp: specialtyService.createSpecialtyService(req.body).
 * Bảng DB: specialties (INSERT).
 * Ai gọi tới: createNewSpecialtyService() <- ManageSpecialty.
 * Trả về: { errCode, errMessage }.
 */
let createSpecialty = async (req, res) => {
    try {
        let info = await specialtyService.createSpecialtyService(req.body)
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
 * API: GET /api/get-all-specialty
 * Chức năng: Lấy danh sách tất cả chuyên khoa kèm ảnh.
 * Gọi tiếp: specialtyService.getAllSpecialtyService().
 * Bảng DB: specialties (SELECT).
 * Ai gọi tới: getAllSpecialtyService() <- AllSpecialty / ManageSpecialty.
 * Trả về: { errCode, errMessage, data: [...] }.
 */
let getAllSpecialty = async (req, res) => {
    try {
        let info = await specialtyService.getAllSpecialtyService()
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
 * API: GET /api/get-detail-specialty-by-id?id=&location=
 * Chức năng: Lấy chi tiết chuyên khoa + bác sĩ (lọc theo địa điểm).
 * Gọi tiếp: specialtyService.getDetailSpecialtyByIdService(req.query.id, req.query.location).
 * Bảng DB: specialties + doctor_info.
 * Ai gọi tới: getDetailSpecialtyByIdService() <- DetailSpecialty.
 * Trả về: { errCode, errMessage, data }.
 */
let getDetailSpecialtyById = async (req, res) => {
    try {
        let info = await specialtyService.getDetailSpecialtyByIdService(req.query.id, req.query.location)
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
 * API: GET /api/get-specialty-by-name?name=
 * Chức năng: Tìm chuyên khoa theo tên (LIKE gần đúng).
 * Gọi tiếp: specialtyService.getSpecialtyByNameService(req.query.name).
 * Bảng DB: specialties (SELECT LIKE).
 * Ai gọi tới: fetchSearchSpecialty() <- HomeHeader / SearchSpecialty.
 * Trả về: { errCode, errMessage, data: [...] }.
 */
let getSpecialtyByName = async (req, res) => {
    try {
        let info = await specialtyService.getSpecialtyByNameService(req.query.name)
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
 * API: PUT /api/edit-specialty
 * Chức năng: Cập nhật chuyên khoa (sửa một phần).
 * Gọi tiếp: specialtyService.updateSpecialtyService(req.body).
 * Bảng DB: specialties (SELECT + UPDATE).
 * Ai gọi tới: editSpecialtyService() <- ManageSpecialty.
 * Trả về: { errCode, errMessage }.
 */
let editSpecialty = async (req, res) => {
    try {
        let info = await specialtyService.updateSpecialtyService(req.body)
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
 * API: DELETE /api/delete-specialty
 * Chức năng: Xoá chuyên khoa (chặn nếu còn bác sĩ thuộc chuyên khoa).
 * Gọi tiếp: specialtyService.deleteSpecialtyService(req.body.id).
 * Bảng DB: specialties + doctor_info.
 * Ai gọi tới: deleteSpecialtyService() <- ManageSpecialty.
 * Trả về: { errCode, errMessage }.
 */
let deleteSpecialty = async (req, res) => {
    try {
        // id được gửi trong body (giống handleDeleteUser).
        let info = await specialtyService.deleteSpecialtyService(req.body.id)
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
    createSpecialty: createSpecialty,
    getAllSpecialty: getAllSpecialty,
    getDetailSpecialtyById: getDetailSpecialtyById,
    getSpecialtyByName: getSpecialtyByName,
    editSpecialty: editSpecialty,
    deleteSpecialty: deleteSpecialty
}
import clinicService from "../services/clinicService"

/**
 * API: POST /api/create-new-clinic
 * Chức năng: Tạo mới phòng khám.
 * Gọi tiếp: clinicService.createClinicService(req.body).
 * Bảng DB: clinics (INSERT).
 * Ai gọi tới: Frontend createNewClinicService() <- ManageClinic.
 * Trả về: { errCode, errMessage }.
 */
let createClinic = async (req, res) => {
    try {
        let info = await clinicService.createClinicService(req.body)
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
 * API: GET /api/get-all-clinic
 * Chức năng: Lấy danh sách tất cả phòng khám kèm ảnh.
 * Gọi tiếp: clinicService.getAllClinicService().
 * Bảng DB: clinics (SELECT).
 * Ai gọi tới: getAllClinicService() <- AllClinic / ManageClinic.
 * Trả về: { errCode, errMessage, data: [...] }.
 */
let getAllClinic = async (req, res) => {
    try {
        let info = await clinicService.getAllClinicService()
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
 * API: GET /api/get-detail-clinic-by-id?id=
 * Chức năng: Lấy chi tiết phòng khám + danh sách bác sĩ thuộc phòng khám.
 * Gọi tiếp: clinicService.getDetailClinicByIdService(req.query.id).
 * Bảng DB: clinics + doctor_info (SELECT).
 * Ai gọi tới: getDetailClinicByIdService() <- DetailClinic.
 * Trả về: { errCode, errMessage, data }.
 */
let getDetailClinicById = async (req, res) => {
    try {
        let info = await clinicService.getDetailClinicByIdService(req.query.id)
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
 * API: PUT /api/edit-clinic
 * Chức năng: Cập nhật thông tin phòng khám (sửa một phần).
 * Gọi tiếp: clinicService.updateClinicService(req.body).
 * Bảng DB: clinics (SELECT + UPDATE).
 * Ai gọi tới: editClinicService() <- ManageClinic.
 * Trả về: { errCode, errMessage }.
 */
let editClinic = async (req, res) => {
    try {
        let info = await clinicService.updateClinicService(req.body)
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
 * API: DELETE /api/delete-clinic
 * Chức năng: Xoá phòng khám (chặn nếu còn bác sĩ thuộc phòng khám).
 * Gọi tiếp: clinicService.deleteClinicService(req.body.id).
 * Bảng DB: clinics + doctor_info.
 * Ai gọi tới: deleteClinicService() <- ManageClinic.
 * Trả về: { errCode, errMessage }.
 */
let deleteClinic = async (req, res) => {
    try {
        // id được gửi trong body (giống handleDeleteUser).
        let info = await clinicService.deleteClinicService(req.body.id)
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
    createClinic: createClinic,
    getAllClinic: getAllClinic,
    getDetailClinicById: getDetailClinicById,
    editClinic: editClinic,
    deleteClinic: deleteClinic
}
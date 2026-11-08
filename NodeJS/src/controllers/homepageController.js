import homepageService from "../services/homepageService";

/**
 * API: GET /api/get-homepage-settings
 * Chức năng: Lấy cấu hình hero trang chủ.
 * Gọi tiếp: homepageService.getHomepageSettingsService().
 * Bảng DB: homepagesettings (SELECT, tự tạo dòng mặc định).
 * Ai gọi tới: HomeHeader (trang chủ) + ManageHomepage.
 * Trả về: { errCode, errMessage, data }.
 */
let getHomepageSettings = async (req, res) => {
    try {
        let info = await homepageService.getHomepageSettingsService()
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
 * API: PUT /api/update-homepage-settings
 * Chức năng: Cập nhật cấu hình hero trang chủ.
 * Gọi tiếp: homepageService.updateHomepageSettingsService(req.body).
 * Bảng DB: homepagesettings (UPDATE).
 * Ai gọi tới: ManageHomepage.
 * Trả về: { errCode, errMessage }.
 */
let updateHomepageSettings = async (req, res) => {
    try {
        let info = await homepageService.updateHomepageSettingsService(req.body)
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
 * API: GET /api/get-all-service-items?activeOnly=
 * Chức năng: Lấy danh sách ô dịch vụ dưới banner.
 * Gọi tiếp: homepageService.getAllServiceItemsService(req.query.activeOnly).
 * Bảng DB: serviceitems (SELECT).
 * Ai gọi tới: HomeHeader + ManageHomepage.
 * Trả về: { errCode, errMessage, data: [...] }.
 */
let getAllServiceItems = async (req, res) => {
    try {
        // ?activeOnly=1 -> chỉ trả các ô đang bật.
        let info = await homepageService.getAllServiceItemsService(req.query.activeOnly)
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
 * API: POST /api/create-service-item
 * Chức năng: Thêm mới một ô dịch vụ.
 * Gọi tiếp: homepageService.createServiceItemService(req.body).
 * Bảng DB: serviceitems (INSERT).
 * Ai gọi tới: ManageHomepage.
 * Trả về: { errCode, errMessage }.
 */
let createServiceItem = async (req, res) => {
    try {
        let info = await homepageService.createServiceItemService(req.body)
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
 * API: PUT /api/update-service-item
 * Chức năng: Cập nhật / bật-tắt một ô dịch vụ.
 * Gọi tiếp: homepageService.updateServiceItemService(req.body).
 * Bảng DB: serviceitems (UPDATE).
 * Ai gọi tới: ManageHomepage.
 * Trả về: { errCode, errMessage }.
 */
let updateServiceItem = async (req, res) => {
    try {
        let info = await homepageService.updateServiceItemService(req.body)
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
 * API: DELETE /api/delete-service-item
 * Chức năng: Xoá một ô dịch vụ.
 * Gọi tiếp: homepageService.deleteServiceItemService(req.body.id).
 * Bảng DB: serviceitems (DELETE).
 * Ai gọi tới: ManageHomepage.
 * Trả về: { errCode, errMessage }.
 */
let deleteServiceItem = async (req, res) => {
    try {
        // id được gửi trong body (giống handleDeleteUser).
        let info = await homepageService.deleteServiceItemService(req.body.id)
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
    getHomepageSettings: getHomepageSettings,
    updateHomepageSettings: updateHomepageSettings,
    getAllServiceItems: getAllServiceItems,
    createServiceItem: createServiceItem,
    updateServiceItem: updateServiceItem,
    deleteServiceItem: deleteServiceItem
}

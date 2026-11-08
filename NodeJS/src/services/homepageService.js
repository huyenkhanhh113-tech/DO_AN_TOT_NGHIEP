import db from "../models/index";

/**
 * Tầng nghiệp vụ cho CMS TRANG CHỦ — phần hero và các ô dịch vụ.
 * Được gọi từ `homepageController.js`; dữ liệu phục vụ trang chủ (`HomeHeader`,
 * `ServiceIcons`) và trang quản trị `/system/manage-homepage`.
 *
 * Bảng truy cập: `homepagesettings` (luôn chỉ 1 dòng id = 1) và `serviceitems`.
 */

// Nội dung mặc định cho cấu hình hero — lấy đúng theo giao diện hiện tại.
// (Trùng với hằng số DEFAULT_SETTINGS trong scripts/initHomepageCms.js)
const DEFAULT_SETTINGS = {
    badgeVi: 'NỀN TẢNG Y TẾ',
    badgeEn: 'MEDICAL FOUNDATION',
    titleVi: 'CHĂM SÓC SỨC KHOẺ TOÀN DIỆN',
    titleEn: 'COMPREHENSIVE HEALTH CARE',
    searchPlaceholderVi: 'Tìm chuyên khoa khám bệnh',
    searchPlaceholderEn: 'Find a medical specialist',
    searchButtonVi: 'Tìm kiếm',
    searchButtonEn: 'Search',
};

/**
 * Chuẩn hoá thứ tự hiển thị (`sortOrder`) về số.
 *
 * - Ai gọi: `createServiceItemService()`, `updateServiceItemService()`.
 * - Bảng: không truy cập DB.
 * - Trả về: **số** — giá trị không hợp lệ (null, chữ, rỗng) sẽ thành `0`.
 */
let normalizeSortOrder = (value) => Number(value) || 0;

/**
 * Chuẩn hoá cờ bật/tắt (`isActive`) về 0 hoặc 1.
 *
 * - Ai gọi: `createServiceItemService()`, `updateServiceItemService()`.
 * - Bảng: không truy cập DB.
 * - Trả về: `1` (bật) hoặc `0` (tắt); trả **`undefined`** khi không truyền
 *   giá trị — nơi gọi dựa vào đó để biết "không cần đổi trạng thái".
 */
let normalizeIsActive = (value) => {
    if (value === undefined || value === null || value === '') return undefined;
    return Number(value) ? 1 : 0;
};

/**
 * Lấy cấu hình hero của trang chủ (badge, tiêu đề, placeholder ô tìm kiếm).
 *
 * - Ai gọi: `homepageController.getHomepageSettings`
 *   (GET /api/get-homepage-settings) <- `HomeHeader.componentDidMount()`.
 * - Bảng: `homepagesettings` (SELECT dòng id = 1; **tự INSERT dòng mặc định**
 *   nếu chưa có, nhờ vậy lần chạy đầu không bị lỗi).
 * - Trả về: `{ errCode: 0, errMessage: 'OK', data }` với `data` là object
 *   gồm 8 trường: badgeVi/En, titleVi/En, searchPlaceholderVi/En, searchButtonVi/En.
 */
let getHomepageSettingsService = () => {
    return new Promise(async(resolve, reject) => {
        try {
            let settings = await db.HomepageSettings.findOne({
                where: { id: 1 }
            })

            // Nếu chưa có dòng id = 1 thì tạo mới với giá trị mặc định.
            if (!settings) {
                settings = await db.HomepageSettings.create({
                    id: 1,
                    ...DEFAULT_SETTINGS
                })
            }

            resolve({
                errCode: 0,
                errMessage: 'OK',
                data: settings
            })
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Cập nhật cấu hình hero trang chủ.
 *
 * - Ai gọi: `homepageController.updateHomepageSettings`
 *   (PUT /api/update-homepage-settings) <- `ManageHomepage` (form "Cấu hình banner").
 * - Bảng: `homepagesettings` (SELECT id = 1 -> UPDATE 8 trường văn bản;
 *   tự INSERT dòng mặc định nếu chưa có).
 * - Trả về: `{ errCode: 0, errMessage: 'OK' }`.
 *
 * Chỉ ghi đè trường nào client thực sự truyền (`!== undefined`).
 */
let updateHomepageSettingsService = (data) => {
    return new Promise(async(resolve, reject) => {
        try {
            let settings = await db.HomepageSettings.findOne({
                where: { id: 1 },
                // raw: false để nhận về instance Sequelize (mới gọi được .save()).
                raw: false
            })

            // Nếu chưa có dòng cấu hình thì tạo mới rồi mới cập nhật.
            if (!settings) {
                settings = await db.HomepageSettings.create({
                    id: 1,
                    ...DEFAULT_SETTINGS
                })
            }

            // Chỉ cập nhật 8 trường văn bản; giữ nguyên giá trị cũ nếu client không truyền.
            let textFields = ['badgeVi', 'badgeEn', 'titleVi', 'titleEn',
                'searchPlaceholderVi', 'searchPlaceholderEn', 'searchButtonVi', 'searchButtonEn']
            textFields.forEach((field) => {
                if (data[field] !== undefined) {
                    settings[field] = data[field]
                }
            })

            await settings.save()

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
 * Lấy danh sách các Ô DỊCH VỤ hiển thị dưới banner trang chủ.
 *
 * - Ai gọi: `homepageController.getAllServiceItems`
 *   (GET /api/get-all-service-items?activeOnly=)
 *   <- `HomeHeader` (trang chủ) và `ManageHomepage` (trang quản trị).
 * - Bảng: `serviceitems` (SELECT, sắp xếp `sortOrder` rồi `id` tăng dần).
 * - Trả về: `{ errCode: 0, errMessage: 'OK', data: [...] }`,
 *   mỗi phần tử gồm `{ id, nameVi, nameEn, iconClass, link, sortOrder, isActive }`.
 *
 * Tham số `activeOnly`: nếu là `'1'`/`1`/`true` thì chỉ lấy ô đang bật
 * (`isActive = 1`) — dùng cho trang chủ; trang quản trị truyền rỗng để lấy tất cả.
 */
let getAllServiceItemsService = (activeOnly) => {
    return new Promise(async(resolve, reject) => {
        try {
            let where = {}
            // Chỉ lấy các ô đang bật khi client yêu cầu ?activeOnly=1.
            if (activeOnly === '1' || activeOnly === 1 || activeOnly === true) {
                where.isActive = 1
            }

            let data = await db.ServiceItem.findAll({
                where: where,
                // Sắp xếp theo sortOrder tăng dần, rồi tới id tăng dần.
                order: [['sortOrder', 'ASC'], ['id', 'ASC']]
            })

            resolve({
                errCode: 0,
                errMessage: 'OK',
                data: data
            })
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Tạo mới một ô dịch vụ.
 *
 * - Ai gọi: `homepageController.createServiceItem`
 *   (POST /api/create-service-item) <- `ManageHomepage` (nút "Thêm ô dịch vụ").
 * - Gọi tiếp: `normalizeSortOrder()`, `normalizeIsActive()`.
 * - Bảng: `serviceitems` (INSERT).
 * - Trả về: `{ errCode, errMessage }` — 0 = OK, 1 = thiếu `nameVi`.
 *
 * Trường bắt buộc duy nhất: `nameVi`. `isActive` mặc định là 1 (bật).
 */
let createServiceItemService = (data) => {
    return new Promise(async(resolve, reject) => {
        try {
            // Bắt buộc tối thiểu phải có tên tiếng Việt.
            if (!data.nameVi) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            }

            let isActive = normalizeIsActive(data.isActive)
            if (isActive === undefined) isActive = 1 // Mặc định bật.

            await db.ServiceItem.create({
                nameVi: data.nameVi,
                nameEn: data.nameEn,
                iconClass: data.iconClass,
                link: data.link,
                sortOrder: normalizeSortOrder(data.sortOrder),
                isActive: isActive
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

/**
 * Cập nhật một ô dịch vụ.
 *
 * - Ai gọi: `homepageController.updateServiceItem`
 *   (PUT /api/update-service-item) <- `ManageHomepage` (nút "Sửa" / bật-tắt).
 * - Gọi tiếp: `normalizeSortOrder()`, `normalizeIsActive()`.
 * - Bảng: `serviceitems` (SELECT theo id -> UPDATE).
 * - Trả về: `{ errCode, errMessage }` — 0 = OK, 1 = thiếu id hoặc thiếu nameVi,
 *   2 = không tìm thấy ô dịch vụ.
 *
 * `nameVi` là bắt buộc kể cả khi cập nhật. Các trường khác chỉ ghi đè khi
 * client có truyền. `isActive` chỉ đổi khi client truyền giá trị.
 */
let updateServiceItemService = (data) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!data.id) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            }

            let item = await db.ServiceItem.findOne({
                where: { id: data.id },
                // raw: false để nhận về instance Sequelize (mới gọi được .save()).
                raw: false
            })

            if (!item) {
                return resolve({
                    errCode: 2,
                    errMessage: 'Service item is not found!'
                })
            }

            // Bắt buộc tối thiểu phải có tên tiếng Việt.
            if (!data.nameVi) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            }

            item.nameVi = data.nameVi
            if (data.nameEn !== undefined) item.nameEn = data.nameEn
            if (data.iconClass !== undefined) item.iconClass = data.iconClass
            if (data.link !== undefined) item.link = data.link
            if (data.sortOrder !== undefined) item.sortOrder = normalizeSortOrder(data.sortOrder)

            // Chỉ đổi trạng thái khi client có truyền isActive.
            let isActive = normalizeIsActive(data.isActive)
            if (isActive !== undefined) {
                item.isActive = isActive
            }

            await item.save()

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
 * Xoá một ô dịch vụ.
 *
 * - Ai gọi: `homepageController.deleteServiceItem`
 *   (DELETE /api/delete-service-item, id nằm trong BODY)
 *   <- `ManageHomepage` sau khi xác nhận trên `ConfirmDialog`.
 * - Bảng: `serviceitems` (SELECT theo id -> DELETE).
 * - Trả về: `{ errCode, errMessage }` — 0 = đã xoá, 1 = thiếu id,
 *   2 = không tìm thấy.
 *
 * Xoá cứng, không có ràng buộc dữ liệu.
 */
let deleteServiceItemService = (id) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!id) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            }

            let item = await db.ServiceItem.findOne({
                where: { id: id }
            })

            if (!item) {
                return resolve({
                    errCode: 2,
                    errMessage: 'Service item is not found!'
                })
            }

            await db.ServiceItem.destroy({
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
    getHomepageSettingsService: getHomepageSettingsService,
    updateHomepageSettingsService: updateHomepageSettingsService,
    getAllServiceItemsService: getAllServiceItemsService,
    createServiceItemService: createServiceItemService,
    updateServiceItemService: updateServiceItemService,
    deleteServiceItemService: deleteServiceItemService,
}

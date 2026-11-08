import db from "../models/index";
import bcrypt from "bcryptjs";
import { bufferToDataUri, base64ToBuffer } from "../utils/imageHelper";

/**
 * Tầng nghiệp vụ cho NGƯỜI DÙNG — đăng nhập, quản lý tài khoản, danh mục allcode.
 * Được gọi từ `userController.js`.
 *
 * Bảng truy cập: `users`, `allcodes`.
 */

// Muối bcrypt dùng chung cho toàn file (salt rounds = 10), tạo một lần khi nạp module.
const salt = bcrypt.genSaltSync(10);

/**
 * Băm mật khẩu bằng bcrypt.
 *
 * - Ai gọi: `createNewUser()` (trong cùng file).
 * - Bảng: không truy cập DB.
 * - Trả về: Promise resolve chuỗi hash bcrypt (~60 ký tự).
 */
let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            var hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Xử lý ĐĂNG NHẬP.
 *
 * - Ai gọi: `userController.handleLogin` (POST /api/login)
 *   <- `userService.loginService()` (frontend) <- component `Login`.
 * - Gọi tiếp: `checkUserEmail()` để kiểm email tồn tại, rồi
 *   `bcrypt.compareSync()` để so mật khẩu, `bufferToDataUri()` cho avatar.
 * - Bảng: `users` (SELECT theo email).
 * - Trả về: `{ errCode, errMessage, user? }`
 *     0 = OK (kèm `user` đã **xoá `password` và `phonenumber`**, `image` là data-URI)
 *     1 = email không tồn tại
 *     2 = không tìm thấy user (trường hợp hiếm, email vừa kiểm đã biến mất)
 *     3 = sai mật khẩu
 *
 * Lưu ý: trả về nguyên `roleId` (R1/R2/R3) để frontend quyết định chuyển hướng
 * sang `/system/*` (admin/bác sĩ) hay trang chủ (bệnh nhân).
 */
let handleUserLogin = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userData = {}
            let isExist = await checkUserEmail(email);
            if(isExist){ // Người dùng tồn tại -> so sánh mật khẩu
                let user = await db.User.findOne({ 
                    where: {email: email},
                    raw: true
                })
                if(user){
                    let check = bcrypt.compareSync(password, user.password)
                    if(check){
                        userData.errCode = 0
                        userData.errMessage = 'OK'
                        delete user.password
                        delete user.phonenumber
                        // Đọc ảnh: bytes trong DB -> chuỗi data-URI để trả về cho client.
                        user.image = bufferToDataUri(user.image)
                        userData.user = user
                    }else{
                        userData.errCode = 3
                        userData.errMessage = 'Wrong password!'
                    }
                }else{
                    userData.errCode = 2
                    userData.errMessage = 'User is not found!'
                }
            }else{
                userData.errCode = 1;
                userData.errMessage = `Your email is not exist. Please try other email!`
            }
            resolve(userData)
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Kiểm tra một email đã tồn tại trong hệ thống chưa.
 *
 * - Ai gọi: `handleUserLogin()` (kiểm trước khi so mật khẩu) và
 *   `createNewUser()` (chặn trùng email).
 * - Bảng: `users` (SELECT 1 dòng theo email).
 * - Trả về: Promise resolve **boolean** — `true` = đã tồn tại, `false` = chưa.
 */
let checkUserEmail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: {email: userEmail}
            })
            if(user){
                resolve(true)
            }else{
                resolve(false)
            }
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Lấy danh sách người dùng — ALL hoặc MỘT người theo id.
 *
 * - Ai gọi: `userController.getAllUsers` (GET /api/get-all-users?id=)
 *   <- `adminActions.fetchAllUsers()` <- trang `/system/user-manage`.
 * - Gọi tiếp: `bufferToDataUri()` để đổi ảnh sang data-URI.
 * - Bảng: `users` (SELECT toàn bộ nếu `userId === 'ALL'`, ngược lại SELECT 1 dòng).
 * - Trả về: Promise resolve **mảng** user (khi `'ALL'`) hoặc **một object** user
 *   (khi truyền id). Luôn loại trừ `password`; `image` đã là data-URI.
 *
 * ⚠️ Payload khá lớn (~5.4 MB) vì ảnh nhúng thẳng base64 cho mọi user.
 */
let getAllUsers = (userId) => {
    return new Promise( async (resolve, reject) => {
        try {
            let users = ''
            if(userId === 'ALL'){
                users = await db.User.findAll({
                    attributes: {
                        exclude: ['password']
                    }
                })
            }
            if(userId && userId !== 'ALL'){
                users = await db.User.findOne({
                    where: {id: userId},
                    attributes: {
                        exclude: ['password']
                    }
                })
            }
            // Đọc ảnh: bytes trong DB -> chuỗi data-URI để trả về cho client.
            // userId === 'ALL' trả về mảng, ngược lại trả về một object.
            if (Array.isArray(users)) {
                users = users.map(item => {
                    item.image = bufferToDataUri(item.image)
                    return item
                })
            } else if (users && users.image !== undefined) {
                users.image = bufferToDataUri(users.image)
            }
            resolve(users)
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Tạo tài khoản người dùng mới (admin tạo, hoặc khách đăng ký).
 *
 * - Ai gọi: `userController.createNewUser` (POST /api/create-new-user)
 *   <- `TableManageUser` (nút "Thêm người dùng") và `userService.createNewUserService()`.
 * - Gọi tiếp: `checkUserEmail()` (chặn trùng), `hashUserPassword()` (băm mật khẩu),
 *   `base64ToBuffer()` (ảnh avatar).
 * - Bảng: `users` (SELECT kiểm email + INSERT).
 * - Trả về: `{ errCode, message | errMessage }`
 *     0 = "OK"; 1 = email đã được dùng.
 *
 * Trường bắt buộc trên thực tế: email, password, firstName, lastName, roleId
 * (positionId/gender/avatar có thể rỗng tuỳ vai trò).
 */
let createNewUser = (data) => {
    return new Promise( async (resolve, reject) => {
        try {
            // Kiểm tra email đã tồn tại chưa?
            let check = await checkUserEmail(data.email)
            if (check === true) {
                resolve({
                    errCode: 1,
                    errMessage: 'Your email is already used. Please try other email!',
                })
            } else {
                let hashPasswordFromBcrypt = await hashUserPassword(data.password);
                await db.User.create({
                    email: data.email,
                    password: hashPasswordFromBcrypt,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    address: data.address,
                    phonenumber: data.phonenumber,
                    gender: data.gender,
                    roleId: data.roleId,
                    positionId: data.positionId,
                    // Ghi ảnh: client gửi `avatar` (base64/data-URI) -> decode thành bytes thật.
                    image: base64ToBuffer(data.avatar)
                })

                resolve({
                    errCode: 0,
                    message: 'OK',
                })
            }         
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Xoá người dùng theo id.
 *
 * - Ai gọi: `userController.deleteUser` (DELETE /api/delete-user, id trong BODY)
 *   <- `TableManageUser` sau khi người dùng bấm "Xóa" trên `ConfirmDialog`.
 * - Bảng: `users` (SELECT theo id + DELETE).
 * - Trả về: `{ errCode, message | errMessage }` — 0 = đã xoá, 2 = không tồn tại.
 *
 * Lưu ý: xoá cứng. Các bản ghi trong `bookings`/`histories` trỏ tới user này
 * sẽ thành "mồ côi" (không còn khớp bảng `users`).
 */
let deleteUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        let user = await db.User.findOne({
            where: { id: userId }
        })
        if (!user) {
            return resolve({
                errCode: 2,
                errMessage: 'The user is not exist!'
            })
        } else {
            await db.User.destroy({
                where: {id: userId}
            })
        }
        resolve({
            errCode: 0,
            message: 'Delete the user succeed!'
        })
    })
}

/**
 * Cập nhật thông tin người dùng (sửa từ trang quản trị).
 *
 * - Ai gọi: `userController.editUser` (PUT /api/edit-user)
 *   <- `TableManageUser` (nút "Sửa") và `scripts/createAdminAvatar.js`.
 * - Gọi tiếp: `base64ToBuffer()` nếu có ảnh mới.
 * - Bảng: `users` (SELECT theo id -> UPDATE các cột).
 * - Trả về: `{ errCode, message | errMessage }`
 *     0 = "Update the user succeed!"; 1 = thiếu tham số; 2 = không tìm thấy user.
 *
 * Bắt buộc: id, roleId, positionId, gender. Các trường còn lại ghi đè trực tiếp
 * (KHÔNG dùng `!== undefined` như bên clinic/specialty) — nghĩa là nếu client
 * không gửi `address` thì địa chỉ sẽ bị ghi thành `undefined`.
 * Ảnh chỉ đổi khi có `data.avatar`.
 */
let updateUserData = (data) => {
    return new Promise( async (resolve, reject) => {
        try {
            if (!data.id || !data.roleId || !data.positionId || !data.gender) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            }
            let user = await db.User.findOne({
                where: { id: data.id },
                attributes: {
                    exclude: ['password']
                },
                raw: false
            })
            if (user) {
                user.firstName = data.firstName
                user.lastName = data.lastName
                user.address = data.address
                user.roleId = data.roleId
                user.positionId = data.positionId
                user.gender = data.gender
                user.phonenumber = data.phonenumber
                if (data.avatar) {
                    // Ghi ảnh: chỉ cập nhật khi client có gửi avatar mới.
                    user.image = base64ToBuffer(data.avatar)
                }

                await user.save()
                
                resolve({
                    errCode: 0,
                    message: 'Update the user succeed!'
                })
            }
            else{
                resolve({
                    errCode: 2,
                    errMessage: 'User is not found!'
                });
            }
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Lấy danh mục "allcode" theo loại — dùng để đổ dữ liệu vào các ô chọn.
 *
 * - Ai gọi: `userController.getAllCode` (GET /api/allcode?type=)
 *   <- `adminActions.fetchAllCode()` / `fetchGender/fetchPrice/...`
 *   <- hầu hết các trang quản trị (chọn giới tính, chức danh, giá, thanh toán,
 *      tỉnh/thành, khung giờ, trạng thái...).
 * - Bảng: `allcodes` (SELECT theo `type`).
 * - Trả về: `{ errCode: 0, data: [...] }` — mảng `{ keyMap, type, valueVi, valueEn }`.
 *   Thiếu `typeInput` -> `{ errCode: 1 }`.
 *
 * Các `type` đang dùng: ROLE, GENDER, POSITION, PRICE, PAYMENT, PROVINCE,
 * TIME, STATUS.
 */
let getAllCodeService = (typeInput) => {
    return new Promise( async (resolve, reject) => {
        try {
            if (!typeInput) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                })
            } else {
                let res = {};
                let allCode = await db.Allcode.findAll({
                    where: { type: typeInput }
                })
                res.errCode = 0;
                res.data = allCode;
                resolve(res)
            }
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    handleUserLogin: handleUserLogin,
    getAllUsers: getAllUsers,
    createNewUser: createNewUser,
    deleteUser: deleteUser,
    updateUserData: updateUserData,
    getAllCodeService: getAllCodeService
}
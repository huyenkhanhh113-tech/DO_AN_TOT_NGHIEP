import bcrypt from "bcryptjs"
import db from "../models/index";

/**
 * Tầng nghiệp vụ CRUD người dùng cơ bản (bản demo của khung đồ án).
 *
 * File này KHÔNG phải luồng chính của ứng dụng HealthyCare (luồng chính nằm ở
 * `userService.js`). Nó phục vụ các route demo trong `homeController.js`:
 *   GET  /crud            -> getAllUser
 *   GET  /crud/create     -> (form tạo user)
 *   POST /crud/create     -> createNewUser
 *   GET  /crud/update     -> getUserInfoById
 *   POST /crud/update     -> updateUserData
 *   POST /crud/delete     -> deleteUserById
 *
 * Bảng truy cập: `users`
 */

// Muối bcrypt dùng chung cho toàn file. Tạo MỘT LẦN khi module được nạp,
// nhờ vậy mọi mật khẩu đều được băm với cùng tham số (salt rounds = 10).
const salt = bcrypt.genSaltSync(10);

/**
 * Tạo một người dùng mới vào bảng `users`.
 *
 * - Ai gọi: `homeController.postCRUD` (route POST /crud/create).
 * - Gọi tiếp: `hashUserPassword()` để băm mật khẩu, rồi `db.User.create()`.
 * - Bảng: `users` (INSERT).
 * - Trả về: Promise resolve chuỗi `'Result_OK'` nếu thành công;
 *   reject kèm lỗi nếu thất bại (ví dụ trùng email do ràng buộc UNIQUE).
 *
 * Lưu ý: `gender` được chuyển từ chuỗi '1'/'0' sang boolean true/false.
 */
let createNewUser = async (data) => {
    return new Promise( async (resolve, reject) => {
        try {
            let hashPasswordFromBcrypt = await hashUserPassword(data.password);
            await db.User.create({
                email: data.email,
                password: hashPasswordFromBcrypt,
                firstName: data.firstName,
                lastName: data.lastName,
                address: data.address,
                phonenumber: data.phonenumber,
                gender: data.gender === '1' ? true : false,
                roleId: data.roleId
            })
            resolve('Result_OK')
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Băm mật khẩu người dùng bằng bcrypt.
 *
 * - Ai gọi: `createNewUser()` (trong cùng file).
 * - Bảng: không truy cập DB.
 * - Trả về: Promise resolve chuỗi hash bcrypt (độ dài ~60 ký tự).
 *
 * Dùng `salt` chung ở đầu file (salt rounds = 10) để mọi lần băm nhất quán.
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
 * Lấy TOÀN BỘ người dùng trong hệ thống.
 *
 * - Ai gọi: `homeController.getCRUD` (route GET /crud).
 * - Bảng: `users` (SELECT toàn bộ, không điều kiện).
 * - Trả về: Promise resolve **mảng** các object user dạng thuần (raw: true).
 *   Mật khẩu đã băm cũng nằm trong kết quả -> chỉ dùng cho trang demo nội bộ,
 *   KHÔNG dùng để trả ra API công khai.
 */
let getAllUser = () => {
    return new Promise(async(resolve, reject) => { //ham Promise xu ly bat dong bo
        try {
            let users = await db.User.findAll({
                raw: true
            })
            resolve(users)
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Lấy thông tin MỘT người dùng theo id.
 *
 * - Ai gọi: `homeController.getUpdateCRUD` (route GET /crud/update?id=...).
 * - Bảng: `users` (SELECT theo `id`).
 * - Trả về: Promise resolve object user (raw); nếu không tìm thấy thì resolve
 *   **object rỗng `{}`** (KHÔNG reject) để controller tự xử lý.
 */
let getUserInfoById = (userId) => {
    return new Promise(async(resolve, reject) => {
        try {
            let user  = await db.User.findOne({
                where: {id: userId},
                raw: true,
            })

            if(user){
                resolve(user)
            }
            else{
                resolve({})
            }
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Cập nhật thông tin cơ bản của người dùng (họ, tên, địa chỉ).
 *
 * - Ai gọi: `homeController.postUpdateCRUD` (route POST /crud/update).
 * - Bảng: `users` (SELECT theo id -> UPDATE các cột firstName/lastName/address,
 *   sau đó SELECT lại toàn bộ danh sách).
 * - Trả về: Promise resolve **mảng toàn bộ user** sau khi cập nhật;
 *   nếu không tìm thấy user thì resolve `undefined`.
 *
 * Lưu ý: KHÔNG cập nhật email, mật khẩu hay vai trò. Lỗi được `console.log`
 * chứ không reject -> caller không biết là đã thất bại.
 */
let updateUserData = (data) => {
    return new Promise(async(resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: {id: data.id}
            })
            if(user){
                user.firstName = data.firstName
                user.lastName = data.lastName
                user.address = data.address

                await user.save()
                let allUsers = await db.User.findAll()
                resolve(allUsers)
            }
            else{
                resolve();
            }
        } catch (e) {
            console.log(e)
        }
    })
}

/**
 * Xoá một người dùng theo id.
 *
 * - Ai gọi: `homeController.postDeleteCRUD` (route POST /crud/delete).
 * - Bảng: `users` (SELECT theo id -> DELETE bản ghi).
 * - Trả về: Promise resolve `undefined` (không trả dữ liệu) dù tìm thấy hay không.
 *
 * Lưu ý: xoá cứng (hard delete). Nếu user còn lịch hẹn trong `bookings` thì
 * các bản ghi đó sẽ trỏ tới id không còn tồn tại.
 */
let deleteUserById = (userId) => {
    return new Promise(async(resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: {id: userId}
            })
            if(user){
                await user.destroy()
            }
            resolve()
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    createNewUser: createNewUser,
    getAllUser: getAllUser,
    getUserInfoById: getUserInfoById,
    updateUserData: updateUserData,
    deleteUserById: deleteUserById
}

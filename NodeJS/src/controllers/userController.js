import userService from "../services/userService"

/**
 * API: POST /api/login
 * Chức năng: Xử lý đăng nhập, trả thông tin người dùng theo vai trò.
 * Gọi tiếp: userService.handleUserLogin(req.body.email, req.body.password).
 * Bảng DB: users (SELECT).
 * Ai gọi tới: loginService() <- Login.
 * Trả về: { errCode, errMessage, message, user }.
 */
let handleLogin = async (req, res) => {
    // Kiểm tra email đã tồn tại chưa
    // So sánh mật khẩu
    // Trả về thông tin người dùng
    // Mã truy cập (access token): JWT
    let email = req.body.email;
    let password = req.body.password;

    if(!email || !password){
        // LƯU Ý: cố ý giữ HTTP 500. Frontend (interceptor axios chỉ trả về
        // response.data khi thành công) xử lý qua nhánh catch của Login.js,
        // nơi đọc `errMessage || message`. Nếu đổi 500 -> 200 sẽ chuyển việc xử lý
        // sang nhánh `data.errCode !== 0` vốn đọc `data.message`, làm thay đổi luồng
        // của Frontend -> rủi ro cao hơn. Nên giữ nguyên status 500.
        // Chỉ thêm song song khoá chuẩn `message` (bổ sung, không phá vỡ tương thích).
        return res.status(500).json({
            errCode: 1,
            errMessage: 'Missing inputs parameters!',
            message: 'Missing inputs parameters!'
        })
    }

    let userData = await userService.handleUserLogin(email, password)

    // LƯU Ý: Frontend Login.js đọc `data.message` và `data.user`.
    // Giữ nguyên các khoá đó, đồng thời thêm song song khoá chuẩn `errMessage`.
    return res.status(200).json({
        errCode: userData.errCode,
        errMessage: userData.errMessage,
        message: userData.errMessage,
        user: userData.user ? userData.user : {}
    })
}

/**
 * API: GET /api/get-all-users?id=
 * Chức năng: Lấy toàn bộ user (id=ALL) hoặc một user theo id.
 * Gọi tiếp: userService.getAllUsers(req.query.id).
 * Bảng DB: users (SELECT).
 * Ai gọi tới: fetchAllUsers() <- TableManageUser.
 * Trả về: { errCode, errMessage, message, users }.
 */
let handleGetAllUsers = async (req, res) => {
    let id = req.query.id // ALL hoặc Id

    if(!id){
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Missing required parameters!',
            message: 'Missing required parameters!',
            users: []
        })
    }
    
    let users = await userService.getAllUsers(id) 

    // LƯU Ý: Frontend đọc `res.users` (UserManage.js / adminActions.js).
    // Giữ nguyên `users` và `message`, đồng thời thêm song song khoá chuẩn `errMessage`.
    return res.status(200).json({
        errCode: 0,
        errMessage: 'OK',
        message: 'OK',
        users: users
    })
}

/**
 * API: POST /api/create-new-user
 * Chức năng: Tạo tài khoản người dùng mới.
 * Gọi tiếp: userService.createNewUser(req.body).
 * Bảng DB: users (SELECT kiểm email + INSERT).
 * Ai gọi tới: createNewUserService() <- TableManageUser.
 * Trả về: { errCode, message | errMessage }.
 */
let handleCreateNewUser = async (req, res) => {
    let message = await userService.createNewUser(req.body)
    return res.status(200).json(message)
}

/**
 * API: PUT /api/edit-user
 * Chức năng: Cập nhật thông tin người dùng.
 * Gọi tiếp: userService.updateUserData(req.body).
 * Bảng DB: users (SELECT + UPDATE).
 * Ai gọi tới: editUserService() <- TableManageUser.
 * Trả về: { errCode, message | errMessage }.
 */
let handleEditUser = async (req, res) => {
    let data = req.body;
    let message =  await userService.updateUserData(data)
    return res.status(200).json(message)
}

/**
 * API: DELETE /api/delete-user
 * Chức năng: Xoá người dùng theo id.
 * Gọi tiếp: userService.deleteUser(req.body.id).
 * Bảng DB: users (SELECT + DELETE).
 * Ai gọi tới: deleteUserService() <- TableManageUser.
 * Trả về: { errCode, message | errMessage }.
 */
let handleDeleteUser = async (req, res) => {
    if (!req.body.id) {
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Missing required parameters!'
        })
    }
    let message = await userService.deleteUser(req.body.id)
    return res.status(200).json(message)
}

/**
 * API: GET /api/allcode?type=
 * Chức năng: Lấy danh mục allcode theo loại (ROLE, GENDER, PRICE...).
 * Gọi tiếp: userService.getAllCodeService(req.query.type).
 * Bảng DB: allcodes (SELECT).
 * Ai gọi tới: fetchAllCode() <- hầu hết trang quản trị.
 * Trả về: { errCode, data: [...] }.
 */
let getAllCode = async (req, res) => {
    try {
        let data = await userService.getAllCodeService(req.query.type)
        return res.status(200).json(data)
    } catch (e) {
        console.log('Get all code err: ', e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}

module.exports = {
    handleLogin: handleLogin,
    handleGetAllUsers: handleGetAllUsers,
    handleCreateNewUser: handleCreateNewUser,
    handleEditUser: handleEditUser,
    handleDeleteUser: handleDeleteUser,
    getAllCode: getAllCode
}
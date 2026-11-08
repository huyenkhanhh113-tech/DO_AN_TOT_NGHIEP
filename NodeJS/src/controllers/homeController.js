import db from "../models/index"
import CRUDService from "../services/CRUDService"

/**
 * API: GET /
 * Chức năng: Render trang demo "home" (EJS).
 * Gọi tiếp: không gọi service.
 * Bảng DB: không truy cập DB.
 * Ai gọi tới: trình duyệt mở trực tiếp.
 * Trả về: trang HTML (EJS).
 */
let getHomePage = async (req, res) => {
    try {
        let data = await db.User.findAll()
        return res.render('homepage.ejs', {
            data: JSON.stringify(data)
        })
    } catch (e) {
        console.log(e)
    }
}

/**
 * API: GET /about
 * Chức năng: Render trang demo "about" (EJS).
 * Gọi tiếp: không gọi service.
 * Bảng DB: không truy cập DB.
 * Ai gọi tới: trình duyệt mở trực tiếp.
 * Trả về: trang HTML (EJS).
 */
let getAboutPage = (req, res) => {
    return res.render('test/about.ejs')
}

/**
 * API: GET /crud
 * Chức năng: Render trang CRUD demo kèm danh sách user.
 * Gọi tiếp: CRUDService.getAllUser().
 * Bảng DB: users (SELECT).
 * Ai gọi tới: trình duyệt mở trực tiếp.
 * Trả về: trang HTML (EJS).
 */
let getCRUD = (req, res) => {
    return res.render('crud.ejs')
}

/**
 * API: POST /post-crud
 * Chức năng: Tạo user từ form demo.
 * Gọi tiếp: CRUDService.createNewUser(req.body).
 * Bảng DB: users (INSERT).
 * Ai gọi tới: form ở trang /crud.
 * Trả về: redirect sang /get-crud.
 */
let postCRUD = async (req, res) => {
    let message = await CRUDService.createNewUser(req.body)
    return res.send('Post CRUD')
}

/**
 * API: GET /get-crud
 * Chức năng: Render danh sách user.
 * Gọi tiếp: CRUDService.getAllUser().
 * Bảng DB: users (SELECT).
 * Ai gọi tới: trình duyệt / redirect sau khi tạo.
 * Trả về: trang HTML (EJS).
 */
let displayGetCRUD = async (req, res) => {
    let data = await CRUDService.getAllUser()
    return res.render('displayCRUD.ejs', {
        dataTable: data
    })
}

/**
 * API: GET /edit-crud?id=
 * Chức năng: Render form sửa user.
 * Gọi tiếp: CRUDService.getUserInfoById(req.query.id).
 * Bảng DB: users (SELECT).
 * Ai gọi tới: nút "Sửa" ở trang danh sách.
 * Trả về: trang HTML (EJS).
 */
let getEditCRUD = async (req, res) => {
    let userId = req.query.id
    if(userId){
        let userData = await CRUDService.getUserInfoById(userId)
        return res.render('editCRUD.ejs', {
            user: userData
        })
    }
    else{
        return res.send('User not found!!!')
    }
}

/**
 * API: POST /put-crud
 * Chức năng: Cập nhật user từ form demo.
 * Gọi tiếp: CRUDService.updateUserData(req.body).
 * Bảng DB: users (UPDATE).
 * Ai gọi tới: form ở trang /edit-crud.
 * Trả về: redirect sang /get-crud.
 */
let putCRUD = async (req, res) => {
    let data = req.body;
    let allUsers =  await CRUDService.updateUserData(data)
     return res.render('displayCRUD.ejs', {
        dataTable: allUsers
    })
}

/**
 * API: GET /delete-crud?id=
 * Chức năng: Xoá user từ trang demo.
 * Gọi tiếp: CRUDService.deleteUserById(req.query.id).
 * Bảng DB: users (DELETE).
 * Ai gọi tới: nút "Xoá" ở trang danh sách.
 * Trả về: redirect sang /get-crud.
 */
let deleteCRUD = async (req, res) => {
    let id = req.query.id
    if(id){
        await CRUDService.deleteUserById(id)
        return res.redirect('/get-crud')
    }else{
        return res.send('user not found!')
    }
}

module.exports = { // khoá - giá trị (key - value)
    getHomePage: getHomePage, 
    getAboutPage: getAboutPage,
    getCRUD: getCRUD,
    postCRUD: postCRUD,
    displayGetCRUD: displayGetCRUD,
    getEditCRUD: getEditCRUD,
    putCRUD: putCRUD,
    deleteCRUD: deleteCRUD,
}
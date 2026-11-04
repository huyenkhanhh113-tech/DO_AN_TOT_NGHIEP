'use strict';

/**
 * Model USER — ánh xạ bảng `users` (tài khoản người dùng, gồm cả 3 vai trò).
 *
 * Cột chính: email (UNIQUE), password (hash bcrypt), firstName, lastName,
 *            address, phonenumber, gender, roleId, positionId,
 *            image (LONGBLOB = bytes ảnh đại diện).
 * roleId: R1 = quản trị viên, R2 = bác sĩ, R3 = bệnh nhân.
 *
 * - Ai GHI: `userService.createNewUser()`, `updateUserData()`, `deleteUser()`;
 *           `patientService.postBookAppointmentService()` (tự tạo tài khoản R3).
 * - Ai ĐỌC: `userService.handleUserLogin()`, `getAllUsers()`;
 *           `doctorService` (danh sách bác sĩ, thông tin bệnh nhân trong lịch hẹn).
 * - Quan hệ: 1 user có thể là bác sĩ (`doctor_info`, `markdowns`, `schedules`)
 *            hoặc bệnh nhân (`bookings`).
 */
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Phương thức hỗ trợ khai báo quan hệ giữa các bảng.
     * Đây không phải là một phần của vòng đời Sequelize.
     * File `models/index` sẽ tự động gọi phương thức này.
     */
    static associate(models) {
      // Khai báo quan hệ tại đây 1-n
      User.belongsTo(models.Allcode, { foreignKey: 'positionId', targetKey: 'keyMap', as: 'positionData' }) //n-1
      User.belongsTo(models.Allcode, { foreignKey: 'gender', targetKey: 'keyMap', as: 'genderData' }) //n-1
      User.hasOne(models.Markdown, { foreignKey: 'doctorId' }) //1-1
      User.hasOne(models.Doctor_Info, { foreignKey: 'doctorId' }) //1-1
      User.hasMany(models.Schedule, { foreignKey: 'doctorId', as: 'doctorData' }) //1-n
      User.hasMany(models.Booking, { foreignKey: 'patientId', as: 'patientData' }) //1-n
    }
  };
  User.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    address: DataTypes.STRING,
    phonenumber: DataTypes.STRING,
    gender: DataTypes.STRING,
    // Ảnh lưu dưới dạng bytes thật trong cột LONGBLOB (không lưu base64).
    image: DataTypes.BLOB('long'),
    roleId: DataTypes.STRING,
    positionId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};

'use strict';

/**
 * Model BOOKING — ánh xạ bảng `bookings` (lịch hẹn khám).
 *
 * Cột chính: doctorId, patientId, date, timeType, statusId, token,
 *            confirmChannel ('email'|'zalo'), contactPhone.
 * statusId: S1 = mới đặt, S2 = khách đã xác nhận, S3 = đã khám xong, S4 = đã huỷ.
 *
 * - Ai GHI: `patientService.postBookAppointmentService()` (INSERT, S1),
 *           `patientService.postVerifyBookAppointmentService()` (S1 -> S2),
 *           `doctorService.sendRemedyService()` (S2 -> S3),
 *           `doctorService.cancelPatientService()` (S1 -> S4).
 * - Ai ĐỌC: `doctorService.getListPatientForDoctorService()`.
 * - Quan hệ: thuộc về `users` (patientData) và `allcodes` (timeType, statusId).
 */
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Phương thức hỗ trợ khai báo quan hệ giữa các bảng.
     * Đây không phải là một phần của vòng đời Sequelize.
     * File `models/index` sẽ tự động gọi phương thức này.
     */
    static associate(models) {
      // Khai báo quan hệ tại đây
      Booking.belongsTo(models.User, { foreignKey: 'patientId', targetKey: 'id', as: 'patientData' }) //n-1
      Booking.belongsTo(models.Allcode, { foreignKey: 'timeType', targetKey: 'keyMap', as: 'timeTypeDataPatient' }) //n-1
      Booking.belongsTo(models.Allcode, { foreignKey: 'statusId', targetKey: 'keyMap', as: 'statusTypeDataPatient' }) //n-1
    }
  };
  Booking.init({
    statusId: DataTypes.STRING,
    doctorId: DataTypes.INTEGER,
    patientId: DataTypes.INTEGER,
    date: DataTypes.STRING,
    timeType: DataTypes.STRING,
    token: DataTypes.STRING,
    // Kênh khách hàng chọn để nhận xác nhận lịch khám: 'email' hoặc 'zalo'
    confirmChannel: DataTypes.STRING,
    // Số điện thoại Zalo của người nhận (khi chọn kênh Zalo)
    contactPhone: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Booking',
  });
  return Booking;
};
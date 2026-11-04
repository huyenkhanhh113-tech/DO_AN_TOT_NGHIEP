'use strict';

/**
 * Model SCHEDULE — ánh xạ bảng `schedules` (lịch khám của bác sĩ).
 *
 * Cột chính: doctorId, date (epoch-millis dạng chuỗi), timeType (T1..T8),
 *            maxNumber (số bệnh nhân tối đa), currentNumber (đã đặt).
 *
 * - Ai GHI: `doctorService.postScheduleDoctorsService()` (bulkCreate),
 *           `patientService.postBookAppointmentService()`
 *           (tăng `currentNumber` lên 1 sau khi đặt thành công).
 * - Ai ĐỌC: `doctorService.getScheduleDoctorByDateService()`,
 *           `getBookedScheduleByDoctorDateService()` (tô nền xanh ở
 *           trang "Quản lý kế hoạch khám bệnh").
 * - Quan hệ: doctorId -> `users`, timeType -> `allcodes`.
 */
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Schedule extends Model {
    /**
     * Phương thức hỗ trợ khai báo quan hệ giữa các bảng.
     * Đây không phải là một phần của vòng đời Sequelize.
     * File `models/index` sẽ tự động gọi phương thức này.
     */
    static associate(models) {
      // Khai báo quan hệ tại đây
      Schedule.belongsTo(models.Allcode, { foreignKey: 'timeType', targetKey: 'keyMap', as: 'timeTypeData' }) //n-1
      Schedule.belongsTo(models.User, { foreignKey: 'doctorId', targetKey: 'id', as: 'doctorData' }) //n-1
    }
  };
  Schedule.init({
    currentNumber: DataTypes.INTEGER,
    maxNumber: DataTypes.INTEGER,
    date: DataTypes.STRING,
    timeType: DataTypes.STRING,
    doctorId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Schedule',
  });
  return Schedule;
};
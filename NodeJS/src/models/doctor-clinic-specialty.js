'use strict';

/**
 * Model DOCTOR_CLINIC_SPECIALTY — ánh xạ bảng nối `doctor_clinic_specialty`.
 *
 * Bảng trung gian nhiều-nhiều giữa bác sĩ với phòng khám / chuyên khoa
 * (giữ lại từ thiết kế gốc; luồng hiện tại chủ yếu dùng `doctor_info`).
 *
 * - Ai đọc/ghi: hiện **chưa có service nào dùng** — bảng dự phòng cho mở rộng.
 * - Quan hệ: doctorId -> `users`, clinicId -> `clinics`,
 *            specialtyId -> `specialties`.
 */
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Doctor_Clinic_Specialty extends Model {
    /**
     * Phương thức hỗ trợ khai báo quan hệ giữa các bảng.
     * Đây không phải là một phần của vòng đời Sequelize.
     * File `models/index` sẽ tự động gọi phương thức này.
     */
    static associate(models) {
      // Khai báo quan hệ tại đây
    }
  };
  Doctor_Clinic_Specialty.init({
    doctorId: DataTypes.INTEGER,
    clinicId: DataTypes.INTEGER,
    specialtyId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Doctor_Clinic_Specialty',
  });
  return Doctor_Clinic_Specialty;
};
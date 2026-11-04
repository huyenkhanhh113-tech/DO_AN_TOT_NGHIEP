'use strict';

/**
 * Model CLINIC — ánh xạ bảng `clinics` (phòng khám).
 *
 * Cột chính: name, address, image (LONGBLOB = bytes ảnh), descriptionHTML,
 *            descriptionMarkdown.
 *
 * - Ai GHI: `clinicService.createClinicService()`, `updateClinicService()`,
 *           `deleteClinicService()`.
 * - Ai ĐỌC: `clinicService.getAllClinicService()`, `getDetailClinicByIdService()`.
 * - Quan hệ: 1 phòng khám có nhiều bác sĩ (`doctor_info.clinicId`).
 */
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Clinic extends Model {
    /**
     * Phương thức hỗ trợ khai báo quan hệ giữa các bảng.
     * Đây không phải là một phần của vòng đời Sequelize.
     * File `models/index` sẽ tự động gọi phương thức này.
     */
    static associate(models) {
      // Khai báo quan hệ tại đây
    }
  };
  Clinic.init({
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    descriptionHTML: DataTypes.TEXT,
    descriptionMarkdown: DataTypes.TEXT,
    // Ảnh lưu dưới dạng bytes thật trong cột LONGBLOB (không lưu base64).
    image: DataTypes.BLOB('long'),
  }, {
    sequelize,
    modelName: 'Clinic',
  });
  return Clinic;
};

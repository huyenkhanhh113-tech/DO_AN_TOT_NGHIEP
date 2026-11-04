'use strict';

/**
 * Model SPECIALTY — ánh xạ bảng `specialties` (chuyên khoa).
 *
 * Cột chính: name, image (LONGBLOB), descriptionHTML, descriptionMarkdown.
 *
 * - Ai GHI: `specialtyService.createSpecialtyService()`, `updateSpecialtyService()`,
 *           `deleteSpecialtyService()`.
 * - Ai ĐỌC: `specialtyService.getAllSpecialtyService()`,
 *           `getDetailSpecialtyByIdService()`, `getSpecialtyByNameService()`.
 * - Quan hệ: 1 chuyên khoa có nhiều bác sĩ (`doctor_info.specialtyId`).
 */
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Specialty extends Model {
    /**
     * Phương thức hỗ trợ khai báo quan hệ giữa các bảng.
     * Đây không phải là một phần của vòng đời Sequelize.
     * File `models/index` sẽ tự động gọi phương thức này.
     */
    static associate(models) {
      // Khai báo quan hệ tại đây
      Specialty.hasOne(models.Doctor_Info, { foreignKey: 'specialtyId' }) //1-1
    }
  };
  Specialty.init({
    name: DataTypes.STRING,
    descriptionHTML: DataTypes.TEXT,
    descriptionMarkdown: DataTypes.TEXT,
    // Ảnh lưu dưới dạng bytes thật trong cột LONGBLOB (không lưu base64).
    image: DataTypes.BLOB('long')
  }, {
    sequelize,
    modelName: 'Specialty',
  });
  return Specialty;
};

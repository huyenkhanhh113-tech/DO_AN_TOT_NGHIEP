'use strict';

/**
 * Model MARKDOWN — ánh xạ bảng `markdowns` (nội dung mô tả chi tiết bác sĩ).
 *
 * Cột chính: doctorId, contentHTML, contentMarkdown, description.
 *
 * - Ai GHI: `doctorService.postInfoDoctorsService()`
 *           (CREATE nếu action = 'CREATE', UPDATE nếu action = 'EDIT').
 * - Ai ĐỌC: `doctorService.getDetailDoctorByIdService()`,
 *           `getProfileDoctorByIdService()`.
 * - Quan hệ: doctorId -> `users` (mỗi bác sĩ có tối đa 1 bản ghi markdown).
 */
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Markdown extends Model {
    /**
     * Phương thức hỗ trợ khai báo quan hệ giữa các bảng.
     * Đây không phải là một phần của vòng đời Sequelize.
     * File `models/index` sẽ tự động gọi phương thức này.
     */
    static associate(models) {
      // Khai báo quan hệ tại đây
      Markdown.belongsTo(models.User, { foreignKey: 'doctorId'}) //1-1
    }
  };
  Markdown.init({
    contentHTML: DataTypes.TEXT('long'),
    contentMarkdown: DataTypes.TEXT('long'),
    description: DataTypes.TEXT('long'),
    doctorId: DataTypes.INTEGER,
    specialtyId: DataTypes.INTEGER,
    clinicId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Markdown',
  });
  return Markdown;
};
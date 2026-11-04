'use strict';

/**
 * Model HISTORY — ánh xạ bảng `histories` (lịch sử khám bệnh).
 *
 * Bảng dự phòng cho việc lưu vết lịch sử khám của bệnh nhân.
 *
 * - Ai đọc/ghi: hiện **chưa có service nào dùng**.
 * - Quan hệ: doctorId -> `users`, patientId -> `users`.
 */
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class History extends Model {
    /**
     * Phương thức hỗ trợ khai báo quan hệ giữa các bảng.
     * Đây không phải là một phần của vòng đời Sequelize.
     * File `models/index` sẽ tự động gọi phương thức này.
     */
    static associate(models) {
      // Khai báo quan hệ tại đây
    }
  };
  History.init({
    patientId: DataTypes.INTEGER,
    doctorId: DataTypes.INTEGER,
    description: DataTypes.TEXT,
    files: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'History',
  });
  return History;
};
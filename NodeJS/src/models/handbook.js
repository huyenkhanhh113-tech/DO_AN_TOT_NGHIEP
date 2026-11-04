'use strict';

/**
 * Model HANDBOOK — ánh xạ bảng `handbooks` (bài cẩm nang sức khoẻ).
 *
 * Cột chính: name, image (LONGBLOB), descriptionHTML, descriptionMarkdown.
 *
 * - Ai GHI: `handbookService.createHandbookService()`, `updateHandbookService()`,
 *           `deleteHandbookService()`.
 * - Ai ĐỌC: `handbookService.getAllHandbookService()`,
 *           `getDetailHandbookByIdService()`.
 * - Quan hệ: độc lập, không có khoá ngoại.
 */
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HandBook extends Model {
    /**
     * Phương thức hỗ trợ khai báo quan hệ giữa các bảng.
     * Đây không phải là một phần của vòng đời Sequelize.
     * File `models/index` sẽ tự động gọi phương thức này.
     */
    static associate(models) {
      // Khai báo quan hệ tại đây

    }
  };
  HandBook.init({
    name: DataTypes.STRING,
    descriptionHTML: DataTypes.TEXT,
    descriptionMarkdown: DataTypes.TEXT,
    // Ảnh lưu dưới dạng bytes thật trong cột LONGBLOB (không lưu base64).
    image: DataTypes.BLOB('long')
  }, {
    sequelize,
    modelName: 'HandBook',
  });
  return HandBook;
};

'use strict';

/**
 * Model HOMEPAGE_SETTINGS — ánh xạ bảng `homepagesettings` (cấu hình hero trang chủ).
 *
 * Luôn chỉ có MỘT dòng với id = 1. Cột chính: badgeVi/En, titleVi/En,
 * searchPlaceholderVi/En, searchButtonVi/En.
 *
 * - Ai GHI: `homepageService.updateHomepageSettingsService()`
 *           (và tự INSERT dòng mặc định trong `getHomepageSettingsService()`).
 * - Ai ĐỌC: `homepageService.getHomepageSettingsService()` -> `HomeHeader`.
 * - Quan hệ: độc lập.
 */
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HomepageSettings extends Model {
    /**
     * Phương thức hỗ trợ khai báo quan hệ giữa các bảng.
     * Đây không phải là một phần của vòng đời Sequelize.
     * File `models/index` sẽ tự động gọi phương thức này.
     */
    static associate(models) {
      // Bảng cấu hình hero trang chủ không cần quan hệ với bảng nào.
    }
  };
  // Cấu hình khối banner (hero) đầu trang chủ — chỉ có 1 dòng duy nhất (id = 1).
  // Mỗi nội dung có 2 biến thể Việt / Anh.
  HomepageSettings.init({
    badgeVi: DataTypes.STRING,
    badgeEn: DataTypes.STRING,
    titleVi: DataTypes.STRING,
    titleEn: DataTypes.STRING,
    searchPlaceholderVi: DataTypes.STRING,
    searchPlaceholderEn: DataTypes.STRING,
    searchButtonVi: DataTypes.STRING,
    searchButtonEn: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'HomepageSettings',
    // Giữ nguyên tên bảng thật trong DB (không để Sequelize tự thêm hậu tố số nhiều).
    freezeTableName: true
  });
  return HomepageSettings;
};

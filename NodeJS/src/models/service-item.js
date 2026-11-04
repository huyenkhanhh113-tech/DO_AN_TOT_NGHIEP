'use strict';

/**
 * Model SERVICE_ITEM — ánh xạ bảng `serviceitems` (các ô dịch vụ dưới banner).
 *
 * Cột chính: nameVi, nameEn, iconClass (class FontAwesome), link,
 *            sortOrder (thứ tự hiển thị), isActive (1 = bật).
 *
 * - Ai GHI: `homepageService.createServiceItemService()`,
 *           `updateServiceItemService()`, `deleteServiceItemService()`.
 * - Ai ĐỌC: `homepageService.getAllServiceItemsService()` -> `ServiceIcons`
 *           (trang chủ) và `ManageHomepage` (trang quản trị).
 * - Quan hệ: độc lập.
 *
 * Lưu ý: model chỉ định rõ `tableName: 'ServiceItems'` + `freezeTableName`,
 * trên MySQL (Windows) sẽ khớp bảng thật `serviceitems`.
 */
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ServiceItem extends Model {
    /**
     * Phương thức hỗ trợ khai báo quan hệ giữa các bảng.
     * Đây không phải là một phần của vòng đời Sequelize.
     * File `models/index` sẽ tự động gọi phương thức này.
     */
    static associate(models) {
      // Các ô dịch vụ trang chủ không cần quan hệ với bảng nào.
    }
  };
  // Các ô dịch vụ tròn bên dưới banner trang chủ (icon + tên + liên kết),
  // sắp xếp được (sortOrder) và bật/tắt được (isActive).
  ServiceItem.init({
    nameVi: DataTypes.STRING,
    nameEn: DataTypes.STRING,
    iconClass: DataTypes.STRING,
    link: DataTypes.STRING,
    sortOrder: DataTypes.INTEGER,
    isActive: DataTypes.TINYINT,
  }, {
    sequelize,
    modelName: 'ServiceItem',
    // Tên model là 'ServiceItem' nhưng bảng thật trong DB là 'ServiceItems',
    // nên chỉ định rõ `tableName` để tránh truy vấn sai bảng.
    tableName: 'ServiceItems',
    freezeTableName: true
  });
  return ServiceItem;
};

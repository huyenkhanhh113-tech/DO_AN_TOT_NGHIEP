'use strict';

/**
 * Model ALLCODE — ánh xạ bảng `allcodes` (danh mục dùng chung).
 *
 * Cột chính: keyMap (mã), type (loại danh mục), valueVi, valueEn (nhãn hiển thị).
 * Các `type` đang dùng: ROLE, GENDER, POSITION, PRICE, PAYMENT, PROVINCE, TIME, STATUS.
 *
 * - Ai đọc: `userService.getAllCodeService()` (đổ dữ liệu vào mọi ô chọn).
 * - Ai JOIN tới: `doctorService`, `patientService` (lấy nhãn tiếng Việt cho
 *   chức danh, giới tính, giá, thanh toán, tỉnh/thành, khung giờ, trạng thái).
 * - Quan hệ: 1 allcode được tham chiếu bởi nhiều bảng qua các cột *Id/*Type.
 */
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Allcode extends Model {
    /**
     * Phương thức hỗ trợ khai báo quan hệ giữa các bảng.
     * Đây không phải là một phần của vòng đời Sequelize.
     * File `models/index` sẽ tự động gọi phương thức này.
     */
    static associate(models) {
      // Khai báo quan hệ tại đây 1-n
      Allcode.hasMany(models.User, { foreignKey: 'positionId', as: 'positionData' }) //1-n
      Allcode.hasMany(models.User, { foreignKey: 'gender', as: 'genderData' }) //1-n
      Allcode.hasMany(models.Schedule, { foreignKey: 'timeType', as: 'timeTypeData' }) //1-n
      Allcode.hasMany(models.Booking, { foreignKey: 'timeType', as: 'timeTypeDataPatient' }) //1-n
      Allcode.hasMany(models.Booking, { foreignKey: 'statusId', as: 'statusTypeDataPatient' }) //1-n
      Allcode.hasMany(models.Doctor_Info, { foreignKey: 'priceId', as: 'priceTypeData' }) //1-n
      Allcode.hasMany(models.Doctor_Info, { foreignKey: 'paymentId', as: 'paymentTypeData' }) //1-n
      Allcode.hasMany(models.Doctor_Info, { foreignKey: 'provinceId', as: 'provinceTypeData' }) //1-n
    }
  };
  Allcode.init({
    keyMap: DataTypes.STRING,
    type: DataTypes.STRING,
    valueEn: DataTypes.STRING,
    valueVi: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Allcode',
  });
  return Allcode;
};
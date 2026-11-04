'use strict';

/**
 * Model DOCTOR_INFO — ánh xạ bảng `doctor_info` (thông tin thêm của bác sĩ).
 *
 * Cột chính: doctorId (UNIQUE), priceId, paymentId, provinceId, nameClinic,
 *            addressClinic, note, specialtyId, clinicId.
 *
 * - Ai GHI: `doctorService.postInfoDoctorsService()` (INSERT hoặc UPDATE).
 * - Ai ĐỌC: `doctorService.getExtraInfoDoctorByIdService()`,
 *           `getDetailDoctorByIdService()`, `getProfileDoctorByIdService()`,
 *           `getTopDoctorHomeService()`; `clinicService`/`specialtyService`
 *           khi đếm bác sĩ thuộc phòng khám/chuyên khoa.
 * - Quan hệ: doctorId -> `users`, priceId/paymentId/provinceId -> `allcodes`,
 *            specialtyId -> `specialties`, clinicId -> `clinics`.
 */
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Doctor_Info extends Model {
    /**
     * Phương thức hỗ trợ khai báo quan hệ giữa các bảng.
     * Đây không phải là một phần của vòng đời Sequelize.
     * File `models/index` sẽ tự động gọi phương thức này.
     */
    static associate(models) {
      // Khai báo quan hệ tại đây
      Doctor_Info.belongsTo(models.User, { foreignKey: 'doctorId' }) //1-1
      Doctor_Info.belongsTo(models.Specialty, { foreignKey: 'specialtyId' }) //1-1
      Doctor_Info.belongsTo(models.Allcode, { foreignKey: 'priceId', targetKey: 'keyMap', as: 'priceTypeData' }) //n-1
      Doctor_Info.belongsTo(models.Allcode, { foreignKey: 'paymentId', targetKey: 'keyMap', as: 'paymentTypeData' }) //n-1
      Doctor_Info.belongsTo(models.Allcode, { foreignKey: 'provinceId', targetKey: 'keyMap', as: 'provinceTypeData' }) //n-1
    }
  };
  Doctor_Info.init({
    doctorId: DataTypes.INTEGER,
    specialtyId: DataTypes.INTEGER,
    clinicId: DataTypes.INTEGER,
      priceId: DataTypes.STRING,
      provinceId: DataTypes.STRING,
      paymentId: DataTypes.STRING,
      addressClinic: DataTypes.STRING,
      nameClinic: DataTypes.STRING,
      note: DataTypes.STRING,
      count: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Doctor_Info',
    freezeTableName: true
  });
  return Doctor_Info;
};
'use strict';

/**
 * Migration bổ sung 16 index tăng tốc truy vấn cho schema MySQL hiện tại.
 *
 * Danh sách này khớp với hằng số INDEXES trong `scripts/optimizeDatabase.js`
 * (script đã tạo sẵn các index này trên DB). Migration ở đây có kiểm tra tồn tại
 * trước khi tạo nên chạy lại nhiều lần vẫn an toàn (idempotent), không phá migration cũ.
 */

const INDEXES = [
  // Bảng users
  { table: 'users', name: 'ux_users_email', unique: true, fields: ['email'] },
  { table: 'users', name: 'ix_users_roleId', fields: ['roleId'] },
  // Bảng allcodes
  { table: 'allcodes', name: 'ux_allcodes_type_keyMap', unique: true, fields: ['type', 'keyMap'] },
  { table: 'allcodes', name: 'ix_allcodes_type', fields: ['type'] },
  // Bảng doctor_info
  { table: 'doctor_info', name: 'ux_doctor_info_doctorId', unique: true, fields: ['doctorId'] },
  { table: 'doctor_info', name: 'ix_doctor_info_specialtyId', fields: ['specialtyId'] },
  { table: 'doctor_info', name: 'ix_doctor_info_provinceId', fields: ['provinceId'] },
  // Bảng schedules
  { table: 'schedules', name: 'ix_schedules_doctorId_date', fields: ['doctorId', 'date'] },
  // Bảng bookings
  { table: 'bookings', name: 'ix_bookings_doctorId_date', fields: ['doctorId', 'date'] },
  { table: 'bookings', name: 'ix_bookings_token', fields: ['token'] },
  { table: 'bookings', name: 'ix_bookings_patientId', fields: ['patientId'] },
  // Bảng markdowns
  { table: 'markdowns', name: 'ix_markdowns_doctorId', fields: ['doctorId'] },
  // Bảng histories
  { table: 'histories', name: 'ix_histories_patientId', fields: ['patientId'] },
  // Bảng specialties / clinics / handbooks
  { table: 'specialties', name: 'ix_specialties_name', fields: ['name'] },
  { table: 'clinics', name: 'ix_clinics_name', fields: ['name'] },
  { table: 'handbooks', name: 'ix_handbooks_name', fields: ['name'] },
];

// Kiểm tra một index đã tồn tại trong schema hiện tại chưa.
async function indexExists(queryInterface, table, name) {
  const [rows] = await queryInterface.sequelize.query(
    'SELECT 1 FROM information_schema.statistics ' +
    'WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ? LIMIT 1',
    { replacements: [table, name] }
  );
  return rows.length > 0;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    for (const idx of INDEXES) {
      // Bỏ qua nếu index đã có sẵn (tránh lỗi khi chạy lại).
      if (await indexExists(queryInterface, idx.table, idx.name)) continue;
      await queryInterface.addIndex(idx.table, idx.fields, {
        name: idx.name,
        unique: !!idx.unique,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    for (const idx of INDEXES) {
      // Chỉ xoá những index thực sự đang tồn tại.
      if (!(await indexExists(queryInterface, idx.table, idx.name))) continue;
      await queryInterface.removeIndex(idx.table, idx.name);
    }
  }
};

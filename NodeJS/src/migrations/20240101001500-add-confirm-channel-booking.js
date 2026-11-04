'use strict';

// Thêm cột confirmChannel vào bảng bookings.
// Cột này lưu kênh mà khách hàng chọn để nhận xác nhận lịch khám:
//   'email' -> gửi xác nhận qua email
//   'zalo'  -> gửi xác nhận qua Zalo
// Có thể NULL với các bản ghi cũ (mặc định coi như 'email').
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('bookings', 'confirmChannel', {
      type: Sequelize.STRING(20),
      allowNull: true,
      defaultValue: 'email'
    });

    // Số điện thoại Zalo người nhận (chỉ dùng khi confirmChannel = 'zalo').
    await queryInterface.addColumn('bookings', 'contactPhone', {
      type: Sequelize.STRING(20),
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('bookings', 'confirmChannel');
    await queryInterface.removeColumn('bookings', 'contactPhone');
  }
};

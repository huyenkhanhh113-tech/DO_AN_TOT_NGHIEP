'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Có tính idempotent: chỉ chèn tài khoản admin khi nó chưa tồn tại.
    const existing = await queryInterface.rawSelect('Users', {
      where: { email: 'admin@gmail.com' }
    }, ['id']);

    if (existing) {
      return;
    }

    return queryInterface.bulkInsert('Users', [{
      email: 'admin@gmail.com',
      // Phải là hash bcrypt vì userService.handleUserLogin dùng bcrypt.compareSync.
      password: bcrypt.hashSync('Admin@123', 10),
      firstName: 'Quản trị',
      lastName: 'viên',
      address: 'Hà Nội',
      phonenumber: '0900000001',
      gender: 'M', // mã giới tính lấy từ allcodes (M = Nam, F = Nữ, O = Khác)
      roleId: 'R1', // vai trò quản trị viên
      positionId: 'P0', // mã chức danh lấy từ allcodes
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', { email: 'admin@gmail.com' }, {});
  }
};

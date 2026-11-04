'use strict';

/**
 * Migration chuyển cột `users.image` sang LONGBLOB.
 *
 * Hợp đồng ảnh hiện tại: cột `image` lưu BYTES ảnh thật (không lưu chuỗi base64).
 * Ba bảng specialties/clinics/handbooks đã được tạo sẵn với kiểu BLOB('long') trong
 * migration create tương ứng, nên chỉ cần đổi cột cho bảng Users tại đây.
 */
module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.changeColumn('Users', 'image', {
                type: Sequelize.BLOB('long'),
                allowNull: true,
            })
        ])
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.changeColumn('Users', 'image', {
                type: Sequelize.STRING,
                allowNull: true,
            })
        ])
    }
};

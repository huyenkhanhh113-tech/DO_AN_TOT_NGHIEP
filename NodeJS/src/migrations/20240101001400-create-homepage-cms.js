'use strict';

/**
 * Migration tạo 2 bảng phục vụ chức năng "chỉnh sửa động" khu vực hero trang chủ:
 *
 *  1. HomepageSettings — cấu hình khối banner đầu trang (một dòng duy nhất, id = 1).
 *  2. ServiceItems     — 6 ô dịch vụ tròn bên dưới banner (icon + tên + liên kết).
 *
 * Migration có kiểm tra tồn tại trước khi tạo nên chạy lại nhiều lần vẫn an toàn
 * (idempotent), không phá các bảng/dữ liệu đã có sẵn trong DB.
 */

// Kiểm tra một bảng đã tồn tại trong schema hiện tại chưa.
async function tableExists(queryInterface, table) {
  const [rows] = await queryInterface.sequelize.query(
    'SELECT 1 FROM information_schema.tables ' +
    'WHERE table_schema = DATABASE() AND table_name = ? LIMIT 1',
    { replacements: [table] }
  );
  return rows.length > 0;
}

// Kiểm tra một index đã tồn tại chưa.
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
    // ---------- Bảng HomepageSettings ----------
    if (!(await tableExists(queryInterface, 'HomepageSettings'))) {
      await queryInterface.createTable('HomepageSettings', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        badgeVi: { type: Sequelize.STRING(255) },
        badgeEn: { type: Sequelize.STRING(255) },
        titleVi: { type: Sequelize.STRING(255) },
        titleEn: { type: Sequelize.STRING(255) },
        searchPlaceholderVi: { type: Sequelize.STRING(255) },
        searchPlaceholderEn: { type: Sequelize.STRING(255) },
        searchButtonVi: { type: Sequelize.STRING(100) },
        searchButtonEn: { type: Sequelize.STRING(100) },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      }, {
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci'
      });
    }

    // ---------- Bảng ServiceItems ----------
    if (!(await tableExists(queryInterface, 'ServiceItems'))) {
      await queryInterface.createTable('ServiceItems', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        nameVi: { type: Sequelize.STRING(255) },
        nameEn: { type: Sequelize.STRING(255) },
        iconClass: { type: Sequelize.STRING(100) },
        link: { type: Sequelize.STRING(255) },
        sortOrder: {
          allowNull: false,
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        isActive: {
          allowNull: false,
          type: Sequelize.TINYINT(1),
          defaultValue: 1
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      }, {
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci'
      });
    }

    // ---------- Index tăng tốc truy vấn cho ServiceItems ----------
    if (await tableExists(queryInterface, 'ServiceItems')) {
      if (!(await indexExists(queryInterface, 'ServiceItems', 'ix_service_items_sort'))) {
        await queryInterface.addIndex('ServiceItems', ['sortOrder'], { name: 'ix_service_items_sort' });
      }
      if (!(await indexExists(queryInterface, 'ServiceItems', 'ix_service_items_isActive'))) {
        await queryInterface.addIndex('ServiceItems', ['isActive'], { name: 'ix_service_items_isActive' });
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Xoá theo thứ tự ngược lại; chỉ xoá bảng thực sự đang tồn tại.
    if (await tableExists(queryInterface, 'ServiceItems')) {
      await queryInterface.dropTable('ServiceItems');
    }
    if (await tableExists(queryInterface, 'HomepageSettings')) {
      await queryInterface.dropTable('HomepageSettings');
    }
  }
};

'use strict';

/**
 * Khởi tạo Sequelize và đăng ký toàn bộ model.
 *
 * Việc cần biết:
 *  - Đọc cấu hình DB từ `src/config/config.json` theo `NODE_ENV`.
 *  - Quét mọi file trong thư mục `models/` và nạp thành `db.<TenModel>`.
 *  - Gọi `associate(models)` của từng model để khai báo quan hệ
 *    (nhờ đó các service dùng được `include: [{ model: db.Allcode, as: '...' }]`).
 *
 * Được dùng bởi: mọi service trong `src/services/` qua `import db from "../models/index"`.
 */
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

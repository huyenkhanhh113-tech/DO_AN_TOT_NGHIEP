/**
 * Khởi tạo 2 bảng phục vụ chức năng "chỉnh sửa động" khu vực hero trang chủ:
 *
 *  1. HomepageSettings — cấu hình khối banner đầu trang (một dòng duy nhất, id = 1)
 *       badge      : dòng nhỏ phía trên   (VD: "NỀN TẢNG Y TẾ")
 *       title      : tiêu đề lớn          (VD: "CHĂM SÓC SỨC KHỎE TOÀN DIỆN")
 *       searchPlaceholder / searchButton  : ô tìm kiếm
 *     Mỗi nội dung có 2 biến thể Việt / Anh.
 *
 *  2. ServiceItems — 6 ô dịch vụ tròn bên dưới banner (icon + tên + liên kết),
 *     sắp xếp được, bật/tắt được.
 *
 * Script có tính idempotent: chạy lại nhiều lần không lỗi, không nhân bản dữ liệu.
 * Chạy: node scripts/initHomepageCms.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

const CFG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'testdb',
  charset: 'utf8mb4',
};

// Nội dung mặc định — lấy đúng theo giao diện hiện tại để không đổi giao diện khi mới cài
const DEFAULT_SETTINGS = {
  badgeVi: 'NỀN TẢNG Y TẾ',
  badgeEn: 'MEDICAL FOUNDATION',
  titleVi: 'CHĂM SÓC SỨC KHỎE TOÀN DIỆN',
  titleEn: 'COMPREHENSIVE HEALTH CARE',
  searchPlaceholderVi: 'Tìm chuyên khoa khám bệnh',
  searchPlaceholderEn: 'Find a medical specialist',
  searchButtonVi: 'Tìm kiếm',
  searchButtonEn: 'Search',
};

const DEFAULT_ITEMS = [
  { nameVi: 'Khám chuyên khoa', nameEn: 'Specialized examination', iconClass: 'fas fa-hospital', link: '/all-specialty', sortOrder: 1 },
  { nameVi: 'Khám từ xa', nameEn: 'Remote examination', iconClass: 'fas fa-mobile-alt', link: '/all-doctor', sortOrder: 2 },
  { nameVi: 'Khám tổng quát', nameEn: 'General examination', iconClass: 'fas fa-hospital-alt', link: '/all-clinic', sortOrder: 3 },
  { nameVi: 'Xét nghiệm y học', nameEn: 'Medical tests', iconClass: 'fas fa-vial', link: '/all-specialty', sortOrder: 4 },
  { nameVi: 'Sức khỏe tinh thần', nameEn: 'Mental health', iconClass: 'fas fa-universal-access', link: '/all-specialty', sortOrder: 5 },
  { nameVi: 'Khám nha khoa', nameEn: 'Dental examination', iconClass: 'fas fa-user-md', link: '/all-doctor', sortOrder: 6 },
];

(async () => {
  const conn = await mysql.createConnection(CFG);
  console.log(`Kết nối MySQL: ${CFG.user}@${CFG.host}:${CFG.port}/${CFG.database}\n`);

  // ---------- Bảng HomepageSettings ----------
  console.log('=== 1) Bảng HomepageSettings ===');
  await conn.query(`
    CREATE TABLE IF NOT EXISTS HomepageSettings (
      id                  INT           NOT NULL AUTO_INCREMENT,
      badgeVi             NVARCHAR(255) NULL,
      badgeEn             NVARCHAR(255) NULL,
      titleVi             NVARCHAR(255) NULL,
      titleEn             NVARCHAR(255) NULL,
      searchPlaceholderVi NVARCHAR(255) NULL,
      searchPlaceholderEn NVARCHAR(255) NULL,
      searchButtonVi      NVARCHAR(100) NULL,
      searchButtonEn      NVARCHAR(100) NULL,
      createdAt           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  console.log('  -> bảng đã sẵn sàng');

  const [rows] = await conn.query('SELECT id FROM HomepageSettings WHERE id = 1');
  if (rows.length === 0) {
    await conn.query(
      `INSERT INTO HomepageSettings
         (id, badgeVi, badgeEn, titleVi, titleEn, searchPlaceholderVi, searchPlaceholderEn, searchButtonVi, searchButtonEn)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [DEFAULT_SETTINGS.badgeVi, DEFAULT_SETTINGS.badgeEn, DEFAULT_SETTINGS.titleVi, DEFAULT_SETTINGS.titleEn,
       DEFAULT_SETTINGS.searchPlaceholderVi, DEFAULT_SETTINGS.searchPlaceholderEn,
       DEFAULT_SETTINGS.searchButtonVi, DEFAULT_SETTINGS.searchButtonEn]
    );
    console.log('  -> đã chèn dòng cấu hình mặc định (id = 1)');
  } else {
    console.log('  -> đã có dòng cấu hình (id = 1), giữ nguyên');
  }

  // ---------- Bảng ServiceItems ----------
  console.log('\n=== 2) Bảng ServiceItems ===');
  await conn.query(`
    CREATE TABLE IF NOT EXISTS ServiceItems (
      id         INT           NOT NULL AUTO_INCREMENT,
      nameVi     NVARCHAR(255) NULL,
      nameEn     NVARCHAR(255) NULL,
      iconClass  NVARCHAR(100) NULL,
      link       NVARCHAR(255) NULL,
      sortOrder  INT           NOT NULL DEFAULT 0,
      isActive   TINYINT(1)    NOT NULL DEFAULT 1,
      createdAt  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY ix_service_items_sort (sortOrder)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  console.log('  -> bảng đã sẵn sàng');

  const [cnt] = await conn.query('SELECT COUNT(*) AS n FROM ServiceItems');
  if (cnt[0].n === 0) {
    for (const it of DEFAULT_ITEMS) {
      await conn.query(
        'INSERT INTO ServiceItems (nameVi, nameEn, iconClass, link, sortOrder, isActive) VALUES (?, ?, ?, ?, ?, 1)',
        [it.nameVi, it.nameEn, it.iconClass, it.link, it.sortOrder]
      );
    }
    console.log(`  -> đã chèn ${DEFAULT_ITEMS.length} ô dịch vụ mặc định`);
  } else {
    console.log(`  -> đã có ${cnt[0].n} ô dịch vụ, giữ nguyên`);
  }

  // ---------- Kiểm tra ----------
  console.log('\n=== KIỂM TRA ===');
  const [s] = await conn.query('SELECT * FROM HomepageSettings WHERE id = 1');
  console.log('HomepageSettings:'); console.table(s);
  const [items] = await conn.query('SELECT id, nameVi, iconClass, link, sortOrder, isActive FROM ServiceItems ORDER BY sortOrder');
  console.log('ServiceItems:'); console.table(items);

  await conn.end();
  console.log('Hoàn tất.');
})().catch(e => { console.error('LỖI:', e); process.exit(1); });

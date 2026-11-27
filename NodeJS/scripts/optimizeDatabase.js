/**
 * Tối ưu hoá database HealthyCare (MySQL/MariaDB - XAMPP).
 *
 * Việc script này làm:
 *   1. Sao lưu ảnh gốc ra thư mục db/images-backup/ (an toàn, chạy lại được nhiều lần).
 *   2. Chuyển cột `image` từ "chuỗi data-URI base64" sang "bytes ảnh thật"
 *      => giảm ~25% dung lượng, không còn phải giải mã 2 chiều ở tầng ứng dụng.
 *   3. Thêm index + ràng buộc để tăng tốc truy vấn.
 *
 * Chạy: node scripts/optimizeDatabase.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const CFG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'testdb',
  charset: 'utf8mb4',
};

const BACKUP_DIR = path.join(__dirname, '..', '..', 'db', 'images-backup');

/** Bảng có cột ảnh */
const IMAGE_TABLES = [
  { table: 'users', dir: 'doctors' },
  { table: 'specialties', dir: 'specialties' },
  { table: 'clinics', dir: 'clinics' },
  { table: 'handbooks', dir: 'handbooks' },
];

/** Đoán đuôi file từ magic bytes */
function sniffExt(buf) {
  if (!buf || buf.length < 4) return 'bin';
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'png';
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return 'gif';
  if (buf[0] === 0x42 && buf[1] === 0x4d) return 'bmp';
  if (buf.slice(0, 4).toString('latin1') === 'RIFF') return 'webp';
  return 'bin';
}

/** Lấy bytes thật từ giá trị đang lưu (có thể là data-URI base64 hoặc bytes thật) */
function extractBytes(value) {
  if (value == null) return null;
  const asText = Buffer.isBuffer(value) ? value.toString('utf8') : String(value);
  const m = asText.match(/^data:([\w.+-]+\/[\w.+-]+);base64,/);
  if (m) return { bytes: Buffer.from(asText.slice(m[0].length), 'base64'), wasDataUri: true };
  // Đã là bytes thật rồi (chạy lại script lần 2)
  if (/^[\x00-\x08\x0e-\x1f]/.test(asText.slice(0, 1)) || !/^[\x20-\x7e\r\n]*$/.test(asText.slice(0, 200))) {
    return { bytes: Buffer.isBuffer(value) ? value : Buffer.from(value), wasDataUri: false };
  }
  return { bytes: Buffer.isBuffer(value) ? value : Buffer.from(value), wasDataUri: false };
}

const INDEXES = [
  ['users', 'ux_users_email', 'CREATE UNIQUE INDEX ux_users_email ON users (email)'],
  ['users', 'ix_users_roleId', 'CREATE INDEX ix_users_roleId ON users (roleId)'],
  ['allcodes', 'ux_allcodes_type_keyMap', 'CREATE UNIQUE INDEX ux_allcodes_type_keyMap ON allcodes (type, keyMap)'],
  ['allcodes', 'ix_allcodes_type', 'CREATE INDEX ix_allcodes_type ON allcodes (type)'],
  ['doctor_info', 'ux_doctor_info_doctorId', 'CREATE UNIQUE INDEX ux_doctor_info_doctorId ON doctor_info (doctorId)'],
  ['doctor_info', 'ix_doctor_info_specialtyId', 'CREATE INDEX ix_doctor_info_specialtyId ON doctor_info (specialtyId)'],
  ['doctor_info', 'ix_doctor_info_provinceId', 'CREATE INDEX ix_doctor_info_provinceId ON doctor_info (provinceId)'],
  ['schedules', 'ix_schedules_doctorId_date', 'CREATE INDEX ix_schedules_doctorId_date ON schedules (doctorId, date)'],
  ['bookings', 'ix_bookings_doctorId_date', 'CREATE INDEX ix_bookings_doctorId_date ON bookings (doctorId, date)'],
  ['bookings', 'ix_bookings_token', 'CREATE INDEX ix_bookings_token ON bookings (token)'],
  ['bookings', 'ix_bookings_patientId', 'CREATE INDEX ix_bookings_patientId ON bookings (patientId)'],
  ['markdowns', 'ix_markdowns_doctorId', 'CREATE INDEX ix_markdowns_doctorId ON markdowns (doctorId)'],
  ['histories', 'ix_histories_patientId', 'CREATE INDEX ix_histories_patientId ON histories (patientId)'],
  ['specialties', 'ix_specialties_name', 'CREATE INDEX ix_specialties_name ON specialties (name)'],
  ['clinics', 'ix_clinics_name', 'CREATE INDEX ix_clinics_name ON clinics (name)'],
  ['handbooks', 'ix_handbooks_name', 'CREATE INDEX ix_handbooks_name ON handbooks (name)'],
];

async function indexExists(conn, table, indexName) {
  const [rows] = await conn.query(
    'SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ? LIMIT 1',
    [table, indexName]
  );
  return rows.length > 0;
}

(async () => {
  const conn = await mysql.createConnection(CFG);
  console.log(`Kết nối MySQL: ${CFG.user}@${CFG.host}:${CFG.port}/${CFG.database}\n`);

  // ---------- BƯỚC 1 + 2: sao lưu và chuyển ảnh sang bytes thật ----------
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log('=== BƯỚC 1-2: Chuyển cột image sang bytes ảnh thật ===');
  let converted = 0, already = 0, backed = 0;
  let bytesBefore = 0, bytesAfter = 0;

  for (const { table, dir } of IMAGE_TABLES) {
    const outDir = path.join(BACKUP_DIR, dir);
    fs.mkdirSync(outDir, { recursive: true });

    const [rows] = await conn.query(`SELECT id, image FROM \`${table}\` WHERE image IS NOT NULL`);
    for (const row of rows) {
      const raw = row.image;
      bytesBefore += Buffer.isBuffer(raw) ? raw.length : Buffer.byteLength(String(raw));
      const { bytes, wasDataUri } = extractBytes(raw);
      if (!bytes) continue;
      bytesAfter += bytes.length;

      // sao lưu ảnh gốc ra file (chỉ ghi nếu chưa có)
      const ext = sniffExt(bytes);
      const file = path.join(outDir, `${row.id}.${ext}`);
      if (!fs.existsSync(file)) {
        fs.writeFileSync(file, bytes);
        backed++;
      }

      if (wasDataUri) {
        await conn.query(`UPDATE \`${table}\` SET image = ? WHERE id = ?`, [bytes, row.id]);
        converted++;
      } else {
        already++;
      }
    }
    console.log(`  ${table.padEnd(12)} ${rows.length} ảnh`);
  }
  console.log(`  -> đã chuyển: ${converted} | đã là bytes thật từ trước: ${already} | file sao lưu mới: ${backed}`);
  console.log(`  -> dung lượng ảnh: ${(bytesBefore / 1048576).toFixed(2)} MB -> ${(bytesAfter / 1048576).toFixed(2)} MB ` +
    `(giảm ${(100 * (1 - bytesAfter / bytesBefore)).toFixed(1)}%)`);
  console.log(`  -> ảnh gốc sao lưu tại: ${BACKUP_DIR}`);

  // ---------- BƯỚC 3: index ----------
  console.log('\n=== BƯỚC 3: Thêm index tăng tốc truy vấn ===');
  let created = 0, skipped = 0;
  for (const [table, name, ddl] of INDEXES) {
    if (await indexExists(conn, table, name)) { skipped++; continue; }
    try {
      await conn.query(ddl);
      console.log(`  + ${name}`);
      created++;
    } catch (e) {
      console.log(`  ! ${name} lỗi: ${e.message}`);
    }
  }
  console.log(`  -> tạo mới: ${created} | đã có sẵn: ${skipped}`);

  // ---------- KIỂM TRA ----------
  console.log('\n=== KIỂM TRA SAU KHI TỐI ƯU ===');
  const [sz] = await conn.query(`
    SELECT table_name AS bang,
           ROUND((data_length + index_length) / 1048576, 2) AS mb
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
    ORDER BY (data_length + index_length) DESC
    LIMIT 6`);
  console.table(sz);

  const [img] = await conn.query(`
    SELECT 'users' t, COUNT(*) n, ROUND(AVG(LENGTH(image))/1024,1) avg_kb, HEX(LEFT(image,4)) first_bytes
    FROM users WHERE image IS NOT NULL
    UNION ALL SELECT 'specialties', COUNT(*), ROUND(AVG(LENGTH(image))/1024,1), HEX(LEFT(image,4)) FROM specialties WHERE image IS NOT NULL
    UNION ALL SELECT 'clinics', COUNT(*), ROUND(AVG(LENGTH(image))/1024,1), HEX(LEFT(image,4)) FROM clinics WHERE image IS NOT NULL
    UNION ALL SELECT 'handbooks', COUNT(*), ROUND(AVG(LENGTH(image))/1024,1), HEX(LEFT(image,4)) FROM handbooks WHERE image IS NOT NULL`);
  console.log('Kiểm tra ảnh (first_bytes phải là magic bytes: FFD8FF=jpg, 89504E47=png):');
  console.table(img);

  await conn.end();
  console.log('\nHoàn tất tối ưu database.');
})().catch(e => { console.error('LỖI:', e); process.exit(1); });

/**
 * Sinh ảnh đại diện mặc định cho tài khoản quản trị viên (PNG 256x256)
 * rồi cập nhật vào tài khoản admin qua API PUT /api/edit-user.
 *
 * Ảnh: nền gradient xanh y khoa + biểu tượng "người dùng" màu trắng.
 * Không dùng thư viện ngoài — tự dựng PNG bằng zlib có sẵn của Node.
 */
const zlib = require('zlib');
const http = require('http');

const SIZE = 256;

// ---------- Sinh pixel ----------
function makePixels() {
  const px = Buffer.alloc(SIZE * SIZE * 3);
  const c1 = [0x0b, 0x6b, 0xcb]; // #0b6bcb
  const c2 = [0x0d, 0x8b, 0xf2]; // #0d8bf2

  // Tâm và bán kính của biểu tượng "người dùng"
  const headX = SIZE / 2, headY = SIZE * 0.38, headR = SIZE * 0.135;
  const bodyX = SIZE / 2, bodyY = SIZE * 0.80, bodyW = SIZE * 0.26, bodyH = SIZE * 0.26;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const i = (y * SIZE + x) * 3;

      // Nền: gradient chéo
      const t = (x + y) / (2 * SIZE);
      let r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
      let g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
      let b = Math.round(c1[2] + (c2[2] - c1[2]) * t);

      // Đầu: hình tròn
      const dh = Math.hypot(x - headX, y - headY);
      // Thân: nửa trên của elip (vai)
      const db = Math.hypot((x - bodyX) / bodyW, (y - bodyY) / bodyH);

      const inHead = dh <= headR;
      const inBody = db <= 1 && y >= bodyY - bodyH;

      if (inHead || inBody) { r = 255; g = 255; b = 255; }

      px[i] = r; px[i + 1] = g; px[i + 2] = b;
    }
  }
  return px;
}

// ---------- Đóng gói PNG ----------
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'latin1');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(zlib.crc32(Buffer.concat([typeBuf, data])) >>> 0, 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function makePng() {
  const px = makePixels();

  // Mỗi dòng thêm 1 byte filter = 0 ở đầu
  const raw = Buffer.alloc(SIZE * (SIZE * 3 + 1));
  for (let y = 0; y < SIZE; y++) {
    raw[y * (SIZE * 3 + 1)] = 0;
    px.copy(raw, y * (SIZE * 3 + 1) + 1, y * SIZE * 3, (y + 1) * SIZE * 3);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(SIZE, 0);   // width
  ihdr.writeUInt32BE(SIZE, 4);   // height
  ihdr[8] = 8;                   // bit depth
  ihdr[9] = 2;                   // color type: truecolor RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------- Gọi API ----------
function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? Buffer.from(JSON.stringify(body)) : null;
    const req = http.request({
      host: 'localhost', port: 8086, path: '/' + path, method, timeout: 60000,
      headers: data ? { 'Content-Type': 'application/json', 'Content-Length': data.length } : {},
    }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const txt = Buffer.concat(chunks).toString('utf8');
        let j = null; try { j = JSON.parse(txt); } catch { /* giữ null */ }
        resolve({ status: res.statusCode, json: j, text: txt });
      });
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

const ok = (c, m) => console.log(`  ${c ? 'PASS' : 'FAIL'}  ${m}`);

(async () => {
  const png = makePng();
  console.log(`=== Ảnh avatar sinh ra: ${png.length} bytes, magic=${png.slice(0, 4).toString('hex').toUpperCase()} ===`);

  // Lấy id của admin
  const users = await request('GET', 'api/get-all-users?id=ALL');
  const admin = ((users.json && users.json.users) || []).find(u => u.email === 'admin@gmail.com');
  if (!admin) { console.log('  FAIL  khong tim thay admin@gmail.com'); process.exit(1); }
  console.log(`  admin id = ${admin.id}`);

  const dataUri = 'data:image/png;base64,' + png.toString('base64');
  const edit = await request('PUT', 'api/edit-user', {
    id: admin.id,
    firstName: 'Quản trị',
    lastName: 'viên',
    address: 'Hà Nội',
    phonenumber: '0900000001',
    gender: 'M',
    roleId: 'R1',
    positionId: 'P0',
    avatar: dataUri,
  });
  console.log('  phản hồi edit:', JSON.stringify(edit.json));
  ok(edit.json && edit.json.errCode === 0, 'cập nhật avatar thành công');

  // Đọc lại để kiểm chứng
  const login = await request('POST', 'api/login', { email: 'admin@gmail.com', password: 'Admin@123' });
  const u = login.json && login.json.user;
  const img = u && u.image;
  const isUri = typeof img === 'string' && img.startsWith('data:image/png;base64,');
  ok(isUri, 'đọc lại: avatar là data-URI PNG');
  if (isUri) {
    const bytes = Buffer.from(img.slice(img.indexOf('base64,') + 7), 'base64');
    ok(bytes.equals(png), `bytes khớp ảnh gốc (${bytes.length} bytes)`);
  }
  console.log('\n  => Mở http://localhost:3000/login, đăng nhập admin@gmail.com / Admin@123');
})();

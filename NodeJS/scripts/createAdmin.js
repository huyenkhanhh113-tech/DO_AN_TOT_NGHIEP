/**
 * Tạo tài khoản quản trị viên cho HealthyCare và kiểm chứng đăng nhập.
 * Dùng đúng API của backend (POST /api/create-new-user + POST /api/login)
 * để mật khẩu được hash bằng chính code của ứng dụng.
 */
const http = require('http');

const ADMIN = {
  email: 'admin@gmail.com',
  password: 'Admin@123',
  firstName: 'Quản trị',
  lastName: 'viên',
  address: 'Nghệ An',
  phonenumber: '0900000001',
  gender: 'M',
  roleId: 'R1',
  positionId: 'P0',
};

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
  let fail = 0;

  console.log('=== 1) Tạo tài khoản admin ===');
  const created = await request('POST', 'api/create-new-user', ADMIN);
  console.log('  phản hồi:', JSON.stringify(created.json));
  if (created.json && created.json.errCode === 1 && /already used/i.test(created.json.errMessage || '')) {
    console.log('  -> tài khoản đã tồn tại từ trước, bỏ qua bước tạo.');
  } else {
    ok(created.json && created.json.errCode === 0, 'tạo tài khoản admin thành công');
    if (!created.json || created.json.errCode !== 0) fail++;
  }

  console.log('\n=== 2) Đăng nhập bằng tài khoản admin ===');
  const login = await request('POST', 'api/login', { email: ADMIN.email, password: ADMIN.password });
  ok(login.json && login.json.errCode === 0, `đăng nhập ${ADMIN.email} / ${ADMIN.password} thành công`);
  if (!login.json || login.json.errCode !== 0) { fail++; console.log('  chi tiết:', login.text.slice(0, 300)); }

  const u = login.json && login.json.user;
  if (u) {
    ok(u.roleId === 'R1', `roleId = ${u.roleId} (R1 = Quản trị viên) -> frontend sẽ chuyển tới /system/user-manage`);
    ok(u.password === undefined, 'không trả về password trong response');
    ok(!!u.image && String(u.image).startsWith('data:image/'), 'có ảnh đại diện dạng data-URI (hoặc rỗng)');
    console.log('  thông tin user:', JSON.stringify({
      id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName,
      roleId: u.roleId, positionId: u.positionId, address: u.address, gender: u.gender,
    }));
  } else fail++;

  console.log('\n=== 3) Đăng nhập sai mật khẩu (phải bị từ chối) ===');
  const bad = await request('POST', 'api/login', { email: ADMIN.email, password: 'sai-mat-khau' });
  ok(bad.json && bad.json.errCode === 3, `sai mật khẩu -> errCode=${bad.json && bad.json.errCode} (3 = Wrong password)`);
  if (!bad.json || bad.json.errCode !== 3) fail++;

  console.log(`\n================ ${fail === 0 ? 'TAT CA PASS' : fail + ' MUC FAIL'} ================`);
  console.log(`\nTHÔNG TIN ĐĂNG NHẬP:\n  Email    : ${ADMIN.email}\n  Mật khẩu : ${ADMIN.password}\n  Vai trò  : Quản trị viên (R1)`);
})();

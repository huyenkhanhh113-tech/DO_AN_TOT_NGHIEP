require("dotenv").config();
import nodemailer from "nodemailer";

/**
 * Dịch vụ gửi email: xác nhận đặt lịch + gửi kết quả khám kèm hoá đơn.
 *
 * Toàn bộ thông tin tài khoản lấy từ file `.env`:
 *   EMAIL_APP           - địa chỉ Gmail dùng để GỬI
 *   EMAIL_APP_PASSWORD  - App Password 16 ký tự của Gmail đó
 *   WEBSITE_NAME        - tên hiển thị với người nhận
 *
 * Xem hướng dẫn: E:\DATN\HUONG-DAN-THAY-TAI-KHOAN-EMAIL.md
 */

/**
 * Tuỳ chọn TLS cho kết nối SMTP.
 *
 * Mặc định BỎ QUA việc kiểm tra chứng chỉ TLS.
 * Lý do: trên nhiều mạng doanh nghiệp (có proxy hoặc phần mềm diệt virus quét
 * HTTPS), chứng chỉ của smtp.gmail.com bị thay thế bằng chứng chỉ nội bộ nên
 * Node không tin được và báo lỗi:
 *     ESOCKET - unable to verify the first certificate
 * Khi đó mail KHÔNG bao giờ được gửi đi.
 *
 * Nếu chạy trên mạng bình thường và muốn bật lại kiểm tra chứng chỉ,
 * thêm dòng sau vào `.env`:
 *     SMTP_VERIFY_TLS=true
 */
const tlsOptions = process.env.SMTP_VERIFY_TLS === 'true'
  ? undefined
  : { rejectUnauthorized: false };

/**
 * Tạo đối tượng transporter SMTP dùng chung cho MỌI loại mail.
 *
 * - Ai gọi: `sendSimpleEmail()`, `sendAttachment()` (trong cùng file).
 * - Bảng: không truy cập DB.
 * - Trả về: đối tượng transporter của nodemailer (chưa kết nối; kết nối khi gửi).
 *
 * Cấu hình: Gmail SMTP cổng 465 (SSL), tài khoản lấy từ `.env`
 * (`EMAIL_APP` / `EMAIL_APP_PASSWORD`), TLS theo `tlsOptions` ở trên,
 * timeout 20s để không treo khi mạng chặn cổng.
 *
 * Trước đây mỗi hàm tự tạo transporter riêng nên dễ quên cấu hình TLS —
 * đó chính là nguyên nhân lỗi "unable to verify the first certificate".
 */
let createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_APP,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
    tls: tlsOptions,
    // Tránh treo vô hạn nếu mạng chặn cổng 465
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000,
  });
};

/**
 * Gửi mail XÁC NHẬN ĐẶT LỊCH cho khách hàng.
 *
 * - Ai gọi: `patientService.sendConfirmation()` khi khách chọn kênh `'email'`
 *   (trong luồng `postBookAppointmentService`).
 * - Gọi tiếp: `createTransporter()` và `getBodyHTMLEmail()`.
 * - Bảng: không truy cập DB (mọi dữ liệu do `patientService` truyền vào).
 * - Trả về: Promise resolve object `info` của nodemailer
 *   (`{ messageId, accepted, rejected, response }`); **throw** nếu gửi thất bại
 *   (sai mật khẩu, lỗi TLS, mất mạng...) — nơi gọi sẽ bắt và trả `emailSent: false`.
 *
 * Tiêu đề mail: "Thông tin đặt lịch khám bệnh ✔".
 */
let sendSimpleEmail = async (dataSend) => {
  let transporter = createTransporter();

  let info = await transporter.sendMail({
    // Tên hiển thị + địa chỉ gửi đều lấy từ .env (EMAIL_APP / WEBSITE_NAME)
    from: `"${process.env.WEBSITE_NAME || 'HealthyCare'}" <${process.env.EMAIL_APP}>`,
    to: dataSend.receiverEmail, // danh sách người nhận
    subject: "Thông tin đặt lịch khám bệnh ✔",
    html: getBodyHTMLEmail(dataSend),
  });

  return info;
};

/**
 * Soạn nội dung HTML của mail xác nhận đặt lịch.
 *
 * - Ai gọi: `sendSimpleEmail()` (trong cùng file).
 * - Bảng: không truy cập DB.
 * - Trả về: **chuỗi HTML** gồm lời chào, thời gian khám, tên bác sĩ và
 *   link xác nhận (`dataSend.redirectLink`).
 *
 * Đầu vào: `{ patientName, time, doctorName, redirectLink }`.
 * Trước đây có thêm nhánh tiếng Anh theo `dataSend.language`; nay đã bỏ vì
 * giao diện chỉ dùng tiếng Việt.
 */
let getBodyHTMLEmail = (dataSend) => {
  return `
            <h3>Xin chào ${dataSend.patientName}!</h3>
            <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên website HealthyCare.</p>
            <p>Thông tin đặt lịch khám bệnh:</p>
            <div><b>Thời gian: ${dataSend.time}</b></div>
            <div><b>Bác sĩ: ${dataSend.doctorName}</b></div>
            <p>Nếu các thông tin trên là đúng sự thật, vui lòng click vào đường link bên dưới để hoàn tất thủ tục đặt lịch khám bệnh.</p>
            <div><a href=${dataSend.redirectLink} target="_blank">Click here!</a></div>
            <div>Xin chân thành cảm ơn!</div>
        `;
};

/**
 * Gửi mail KẾT QUẢ KHÁM kèm ảnh HOÁ ĐƠN đính kèm.
 *
 * - Ai gọi: `doctorService.sendRemedyService()` khi bác sĩ bấm "Gửi" trong
 *   `RemedyModal` (luồng `POST /api/send-remedy`).
 * - Gọi tiếp: `createTransporter()` và `getBodyHTMLEmailRemedy()`.
 * - Bảng: không truy cập DB.
 * - Trả về: Promise resolve object `info` của nodemailer; **reject** nếu gửi lỗi.
 *
 * Đầu vào: `{ email, patientName, patientId, imageBase64 }` — `imageBase64` là
 * ảnh hoá đơn dạng data-URI (`data:image/...;base64,...`), được cắt bỏ phần
 * tiền tố và gửi kèm dưới dạng file `.jpg`.
 * Tiêu đề mail: "Kết quả khám bệnh ✔".
 */
let sendAttachment = async (dataSend) => {
  return new Promise(async (resolve, reject) => {
    try {
      let transporter = createTransporter();

      let contentImg = `${dataSend.imageBase64}`;
      let fileName = `remedy-${dataSend.patientId}-${new Date().getTime()}`;
      let info = await transporter.sendMail({
        // Tên hiển thị + địa chỉ gửi đều lấy từ .env (EMAIL_APP / WEBSITE_NAME)
        from: `"${process.env.WEBSITE_NAME || 'HealthyCare'}" <${process.env.EMAIL_APP}>`,
        to: dataSend.email, // danh sách người nhận
        subject: "Kết quả khám bệnh ✔",
        html: getBodyHTMLEmailRemedy(dataSend),
        attachments: [
          {
            // Chuỗi đã mã hoá base64 dùng làm file đính kèm
            filename: `${fileName}.jpg`,
            content: contentImg.split("base64,")[1],
            encoding: "base64",
          },
        ],
      });
      resolve(info);
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * Soạn nội dung HTML của mail gửi kèm kết quả khám.
 *
 * - Ai gọi: `sendAttachment()` (trong cùng file).
 * - Bảng: không truy cập DB.
 * - Trả về: **chuỗi HTML** thông báo kết quả/hóa đơn nằm trong file đính kèm.
 *
 * Đầu vào: `{ patientName }`.
 */
let getBodyHTMLEmailRemedy = (dataSend) => {
  return `
            <h3>Xin chào ${dataSend.patientName}!</h3>
            <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên website Healthy Care thành công.</p>
            <p>Thông tin khám bệnh/hóa đơn được gửi trong file đính kèm.</p>
            <div>Xin chân thành cảm ơn!</div>
        `;
};

module.exports = {
  createTransporter: createTransporter,
  sendSimpleEmail: sendSimpleEmail,
  getBodyHTMLEmail: getBodyHTMLEmail,
  sendAttachment: sendAttachment,
  getBodyHTMLEmailRemedy: getBodyHTMLEmailRemedy,
};

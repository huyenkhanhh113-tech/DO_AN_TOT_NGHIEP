// Đoạn mã tuỳ chọn này dùng để đăng ký service worker.
// Hàm register() mặc định không được gọi.

// Cơ chế này giúp ứng dụng tải nhanh hơn ở những lần truy cập sau trong môi trường
// production và hỗ trợ hoạt động ngoại tuyến. Tuy nhiên, lập trình viên (và người dùng)
// chỉ thấy bản cập nhật đã triển khai ở lần truy cập kế tiếp, sau khi tất cả các tab
// đang mở của trang đã đóng, vì tài nguyên được lưu đệm trước đó sẽ cập nhật ngầm.

// Để tìm hiểu thêm về lợi ích của mô hình này và cách bật, đọc https://bit.ly/CRA-PWA

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] là địa chỉ localhost dạng IPv6.
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 được coi là localhost đối với IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // Hàm dựng URL có sẵn ở mọi trình duyệt hỗ trợ service worker.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Service worker sẽ không hoạt động nếu PUBLIC_URL nằm ở origin khác với
      // origin phục vụ trang. Điều này có thể xảy ra khi dùng CDN để phục vụ
      // tài nguyên; xem https://github.com/facebook/create-react-app/issues/2374
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // Đang chạy trên localhost. Kiểm tra xem service worker còn tồn tại hay không.
        checkValidServiceWorker(swUrl, config);

        // Thêm log cho localhost, hướng dẫn lập trình viên tới tài liệu service worker/PWA.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service ' +
              'worker. To learn more, visit https://bit.ly/CRA-PWA'
          );
        });
      } else {
        // Không phải localhost. Chỉ cần đăng ký service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // Lúc này nội dung đã lưu đệm trước đó đã được tải về,
              // nhưng service worker cũ vẫn phục vụ nội dung cũ
              // cho tới khi tất cả tab của client đóng lại.
              console.log(
                'New content is available and will be used when all ' +
                  'tabs for this page are closed. See https://bit.ly/CRA-PWA.'
              );

              // Thực thi callback
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // Lúc này mọi thứ đã được lưu đệm trước.
              // Đây là thời điểm thích hợp để hiển thị thông báo
              // "Content is cached for offline use."
              console.log('Content is cached for offline use.');

              // Thực thi callback
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch(error => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  // Kiểm tra xem có tìm thấy service worker không. Nếu không, tải lại trang.
  fetch(swUrl)
    .then(response => {
      // Đảm bảo service worker tồn tại và thực sự nhận được một tệp JS.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // Không tìm thấy service worker. Có thể là ứng dụng khác. Tải lại trang.
        navigator.serviceWorker.ready.then(registration => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Đã tìm thấy service worker. Tiếp tục như bình thường.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log(
        'No internet connection found. App is running in offline mode.'
      );
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.unregister();
    });
  }
}
